// Prove the ground moves, and prove it does not answer the pointer.
//
// The owner's note of 26.08.2026 was "the shader looks great, but it has to be
// alive and not react to the mouse". Both halves are measurable, and both are
// measured here rather than looked at.
//
//   alive    two captures three seconds apart must differ a great deal.
//   deaf     with the clock stopped, dragging the pointer right across the
//            pane must change nothing at all. Stopping the clock is what makes
//            this decisive: while the field is sliding, every pair of frames
//            differs whatever the mouse does, so a moving ground can hide a
//            pointer branch from any comparison taken in motion.
//
// scripts/gates/g3-palette.mjs already asserts the SOURCE carries no pointer
// uniform and no pointer listener. This asserts the same thing about the
// pixels, which is the part a future edit could break without touching a name
// that gate greps for.
//
// Run with a server up:  node scripts/shader-motion.mjs --url http://localhost:5211

import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}
const URL = arg('url', 'http://localhost:4500')
const OUT = path.resolve(arg('out', 'lab/shader'))
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

// Headless Chrome has no GPU on this machine; without these the canvas comes
// back black and the run measures a bug that does not exist.
const GL_FLAGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: GL_FLAGS })

async function open(reducedMotion) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    locale: 'he-IL',
    reducedMotion,
  })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('canvas', { timeout: 20000 })
  await page.waitForTimeout(1600)
  const cdp = await page.context().newCDPSession(page)
  const box = await page.$eval('canvas', (el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })
  // Compare decoded pixels, not PNG bytes: two identical frames can encode to
  // different files and two different frames to similar ones.
  const grab = async (name) => {
    const r = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
      clip: { ...box, scale: 0.25 },
    })
    const buf = Buffer.from(r.data, 'base64')
    await writeFile(path.join(OUT, name + '.png'), buf)
    return page.evaluate(
      (data) =>
        new Promise((res) => {
          const im = new Image()
          im.onload = () => {
            const c = document.createElement('canvas')
            c.width = im.width
            c.height = im.height
            const g = c.getContext('2d')
            g.drawImage(im, 0, 0)
            res([...g.getImageData(0, 0, c.width, c.height).data])
          }
          im.src = 'data:image/png;base64,' + data
        }),
      buf.toString('base64')
    )
  }
  return { page, grab }
}

const mad = (a, b) => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i])
  return s / a.length
}

// ---- alive ----------------------------------------------------------------
const live = await open('no-preference')
const a0 = await live.grab('alive-t0')
await live.page.waitForTimeout(3000)
const a3 = await live.grab('alive-t3')
const moved = mad(a0, a3)
await live.page.close()

// ---- deaf -----------------------------------------------------------------
// prefers-reduced-motion freezes the field at t=0, so anything that changes
// after this point changed because of the pointer.
const calm = await open('reduce')
const p0 = await calm.grab('calm-before')
for (let i = 0; i <= 24; i++) {
  await calm.page.mouse.move(30 + i * 52, 90 + i * 26)
  await calm.page.waitForTimeout(16)
}
await calm.page.mouse.move(640, 400)
await calm.page.waitForTimeout(400)
const p1 = await calm.grab('calm-after')
const pointer = mad(p0, p1)
await calm.page.close()

await browser.close()

console.log(`alive   3s apart, clock running : mean abs delta ${moved.toFixed(3)}`)
console.log(`deaf    pointer dragged, clock stopped : mean abs delta ${pointer.toFixed(3)}`)

const ok = moved > 2.0 && pointer < 0.05
console.log(ok ? 'SHADER PASS' : 'SHADER FAIL')
process.exitCode = ok ? 0 : 1
