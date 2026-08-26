// G3: scrolling the whole track must be continuous.
//
// Walks the track in small real steps and compares every frame with the one
// before it. Two different faults are separated, because they need different
// tests and only one of them is what the owner called flicker:
//
//   POP    a frame unlike BOTH of its neighbours while the neighbours resemble
//          each other. Something appeared or vanished for one frame. This is
//          the defect: a dropped raster tile, a light snapping off, a seam
//          between two clips that do not line up. Any pop fails.
//
//   CLIFF  a single adjacent step larger than the cliff threshold. The page
//          contains deliberate dissolves — a lit screen handing over to the
//          next station — and those legitimately change the frame quickly over
//          several consecutive steps. A dissolve that completes inside one step
//          is not a dissolve, it is a cut, and that fails too.
//
// Measured on this page: before the fixes, 17 flagged steps with a worst of
// 126 (a genuinely broken seam and a full-frame white-out). After, the worst
// step is a designed dissolve.
//
// --dir re-analyses an existing capture directory, which is how the gate is
// exercised against a known-bad control instead of being trusted blind.
import { chromium } from 'playwright-core'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }
const URL = arg('url', 'http://localhost:4500')
const N = +arg('n', 170)
const W = +arg('w', 1280), H = +arg('h', 760)
const CLIFF = +arg('cliff', 70)
const POP = +arg('pop', 20)
const DIR = arg('dir', null)
const TMP = path.resolve(DIR || 'lab/smooth')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

if (!DIR) {
  await rm(TMP, { recursive: true, force: true }).catch(() => {})
  await mkdir(TMP, { recursive: true })

  const b = await chromium.launch({ executablePath: CHROME, headless: true })
  const p = await b.newPage({ viewport: { width: W, height: H } })
  await p.goto(URL, { waitUntil: 'networkidle' })
  await p.waitForSelector('html.sc-ready', { timeout: 20000 })
  await p.waitForTimeout(1500)
  const cdp = await p.context().newCDPSession(p)
  const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  for (let i = 0; i < N; i++) {
    await p.evaluate((v) => scrollTo(0, v), Math.round((max * i) / (N - 1)))
    await p.waitForTimeout(150)   // the lerped playhead and the crossfade settle
    // no `clip`: CDP clips in DOCUMENT coordinates, so a clipped capture
    // ignores the scroll position and every frame comes back identical
    const r = await cdp.send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: false, fromSurface: true })
    await writeFile(path.join(TMP, String(i).padStart(4, '0') + '.png'), Buffer.from(r.data, 'base64'))
  }
  await b.close()
}

const raw = spawnSync('ffmpeg', ['-v', 'error', '-start_number', '0',
  '-i', path.join(TMP, '%04d.png'), '-vf', 'scale=4:3', '-f', 'rawvideo',
  '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 }).stdout
const per = 4 * 3 * 3
const f = []
for (let i = 0; i + per <= raw.length; i += per) f.push(raw.subarray(i, i + per))

const dist = (a, b) => {
  let s = 0
  for (let k = 0; k < per; k++) s += Math.abs(a[k] - b[k])
  return s / per
}

let worst = 0, worstAt = -1
const cliffs = [], pops = []
for (let i = 1; i < f.length; i++) {
  const d = dist(f[i], f[i - 1])
  if (d > worst) { worst = d; worstAt = i }
  if (d > CLIFF) cliffs.push({ i, d })
}
for (let i = 1; i < f.length - 1; i++) {
  const dp = dist(f[i], f[i - 1]), dn = dist(f[i], f[i + 1]), ds = dist(f[i - 1], f[i + 1])
  if (dp > POP && dn > POP && ds < Math.min(dp, dn) * 0.6) pops.push({ i, dp, dn, ds })
}

const at = (i) => (i / (f.length - 1)).toFixed(3)
console.log(`${f.length} frames, pop>${POP} isolated, cliff>${CLIFF} in one step`)
console.log(`worst adjacent step ${worst.toFixed(1)} at frame ${worstAt} (t=${at(worstAt)})`)
for (const c of cliffs) console.log(`  CLIFF frame ${c.i} t=${at(c.i)} step=${c.d.toFixed(1)}`)
for (const p of pops) console.log(`  POP   frame ${p.i} t=${at(p.i)} prev=${p.dp.toFixed(1)} next=${p.dn.toFixed(1)} span=${p.ds.toFixed(1)}`)

if (cliffs.length || pops.length) { console.log('SCROLL-SMOOTH-BAD'); process.exit(1) }
console.log('SCROLL-SMOOTH-OK')
