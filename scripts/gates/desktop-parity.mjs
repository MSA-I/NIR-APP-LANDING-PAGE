// G17: preserve the desktop page while refining phone-only composition.
// The reduced-motion render is deterministic: shader and film are frozen, so
// exact compositor screenshots can be compared instead of judged by memory.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { checker, ROOT, scrollTo, withPage } from './lib.mjs'

const c = checker('G17')
const RECORD = process.argv.includes('--record')
const EVIDENCE = path.join(ROOT, '.unlazy', 'mobile', 'evidence')
const BASELINE = path.join(EVIDENCE, 'desktop-baseline.json')
const STOPS = [0, 0.25, 0.5, 0.75, 1]

await mkdir(EVIDENCE, { recursive: true })

const digest = (value) => createHash('sha256').update(value).digest('hex')
const current = []

await withPage(
  async (page, { errors }) => {
    await page.waitForTimeout(900)
    const cdp = await page.context().newCDPSession(page)

    for (let i = 0; i < STOPS.length; i++) {
      await scrollTo(page, STOPS[i])
      await page.waitForTimeout(180)
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      })
      const buffer = Buffer.from(shot.data, 'base64')
      const file = path.join(EVIDENCE, `desktop-${RECORD ? 'baseline' : 'current'}-${i}.png`)
      await writeFile(file, buffer)
      current.push({ stop: STOPS[i], sha256: digest(buffer), bytes: buffer.length })
    }

    c.ok(errors.length === 0, `desktop browser errors: ${errors.slice(0, 3).join(' | ')}`)
  },
  { viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' }
)

if (RECORD) {
  await writeFile(BASELINE, JSON.stringify({ viewport: [1440, 960], frames: current }, null, 2))
  c.note(`recorded ${current.length} deterministic desktop baseline frames`)
} else {
  let baseline = null
  try {
    baseline = JSON.parse(await readFile(BASELINE, 'utf8'))
  } catch {
    c.ok(false, `desktop baseline is missing; run node scripts/gates/g17-desktop-parity.mjs --record before edits`)
  }

  if (baseline) {
    let changed = 0
    c.ok(
      JSON.stringify(baseline.viewport) === JSON.stringify([1440, 960]),
      `desktop baseline viewport changed: ${JSON.stringify(baseline.viewport)}`
    )
    c.ok(
      baseline.frames.length === current.length,
      `desktop frame count changed: ${baseline.frames.length} -> ${current.length}`
    )
    for (let i = 0; i < Math.min(baseline.frames.length, current.length); i++) {
      const same = baseline.frames[i].sha256 === current[i].sha256
      if (!same) changed++
      c.ok(
        same,
        `desktop frame ${i} at ${STOPS[i] * 100}% changed (${baseline.frames[i].bytes} -> ${current[i].bytes} bytes)`
      )
    }
    if (changed === 0) c.note(`${current.length} desktop frames match the pre-edit baseline byte for byte`)
  }
}

c.report()
