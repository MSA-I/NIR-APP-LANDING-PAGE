// Render the continuous world into worldflight legs.
//
// The camera is one continuous function of t, and a leg is just a range of t,
// so the last frame of leg N and the first frame of leg N+1 are the same
// camera. The seam law in the skill's worldflight.md is satisfied by
// construction rather than by chaining generated stills.
//
// Pace is held constant across legs: seconds = weight / RATE, so weight
// divided by clip length is identical everywhere and the world never surges.
//
// Usage:
//   node scripts/render-world.mjs                 desktop, 1920x1080
//   node scripts/render-world.mjs --mobile        portrait, 810x1440
//   node scripts/render-world.mjs --fast          quarter-rate check render

import { chromium } from 'playwright-core'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const has = (k) => args.includes('--' + k)
const arg = (k, d) => { const i = args.indexOf('--' + k); return i === -1 ? d : args[i + 1] }

const MOBILE = has('mobile')
const FAST = has('fast')
const W = +arg('w', MOBILE ? 810 : 1920)
const H = +arg('h', MOBILE ? 1440 : 1080)
const FPS = +arg('fps', FAST ? 8 : 24)
const RATE = +arg('rate', 0.215)          // viewport-heights of scroll per second of film
const SUFFIX = MOBILE ? '-m' : ''
const OUT = path.resolve(arg('out', 'public/assets'))
const TMP = path.resolve('lab/world/frames' + SUFFIX)
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const WORLD = pathToFileURL(path.resolve('world/world.html')).href

// leg id, label, and the weight in viewport-heights it owns on the scroll track
const LEGS = [
  ['01', 'הערימה',            1.5],
  ['02', 'המספרים',           1.5],
  ['03', 'האור בקצה',         1.4],
  ['04', 'מרכז הבקרה',        1.8],
  ['05', 'המסע',              1.8],
  ['06', 'הנייר הופך לשורות', 2.6],
  ['07', 'החריגה',            1.4],
  ['08', 'הכסף עובר',         1.4],
  ['09', 'הכול במקום',        1.6],
]
const TOTAL = LEGS.reduce((s, l) => s + l[2], 0)

// t boundaries: cumulative weight over the total. Identical to the ranges the
// page will hand each leg, which is what makes the seams exact.
let acc = 0
const BOUNDS = LEGS.map((l) => { const a = acc / TOTAL; acc += l[2]; return [a, acc / TOTAL] })

if (!args.includes('--only')) await rm(TMP, { recursive: true, force: true }).catch(() => {})
await mkdir(TMP, { recursive: true })
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })

// Every request the scene makes has to arrive. On 26.08.2026 this render ran
// to completion with nine 404s in it: the page had been restructured, the
// scene's relative paths still pointed at the old directories, and 692 frames
// came out with a blank white rectangle where the control centre should be and
// the documents set in a system fallback face. Nothing failed, nothing warned,
// and the clip looked plausible enough to ship. A render that cannot load its
// own materials is not a render.
const missing = []
page.on('requestfailed', (r) => missing.push(r.url()))
page.on('response', (r) => { if (r.status() >= 400) missing.push(`${r.status()} ${r.url()}`) })

await page.goto(`${WORLD}?w=${W}&h=${H}`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 })

const facesFailed = await page.evaluate(async () => {
  await document.fonts.ready
  return [...document.fonts].filter((x) => x.status !== 'loaded').map((x) => x.family)
})
if (missing.length || facesFailed.length) {
  console.error('the scene could not load its own materials:')
  for (const m of missing) console.error('  missing  ' + m)
  for (const x of facesFailed) console.error('  font     ' + x)
  await browser.close()
  process.exit(1)
}


// Capture through CDP, not page.screenshot(). On this machine Playwright's
// screenshot path intermittently returns frames with composited layers missing
// — measured: the same page comes back correct through
// Page.captureScreenshot with fromSurface:true, captureBeyondViewport:false.
// Chasing those artifacts as if they were rendering bugs wastes whole rounds.
let __cdp = null
async function capture(page, file) {
  if (!__cdp) __cdp = await page.context().newCDPSession(page)
  const r = await __cdp.send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: false, fromSurface: true,
  })
  await writeFile(file, Buffer.from(r.data, 'base64'))
}

// ---------------------------------------------------------------------------
// Frame validation.
//
// Chrome intermittently returns a capture with whole layers unrastered. Those
// frames go straight into the mp4 and read as a flicker, and no per-position
// screenshot check can see them because the DOM is correct at that position.
// So every leg is checked after capture: each frame is reduced to a 4x3
// signature, and a frame that differs sharply from BOTH of its neighbours is a
// dropped frame, not a scene change, because the camera moves continuously.
// Those frames are recaptured until they agree with their neighbours.
// ---------------------------------------------------------------------------
function signatures(dir, n) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-start_number', '0',
    '-i', path.join(dir, '%04d.png'), '-vf', 'scale=4:3',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 })
  const per = 4 * 3 * 3, out = []
  for (let i = 0; i + per <= r.stdout.length; i += per) out.push(r.stdout.subarray(i, i + per))
  return out
}
const dist = (a, b) => {
  let s = 0
  for (let k = 0; k < a.length; k++) s += Math.abs(a[k] - b[k])
  return s / a.length
}
function outliers(sig, thresh) {
  const bad = []
  for (let i = 1; i < sig.length - 1; i++) {
    const dPrev = dist(sig[i], sig[i - 1])
    const dNext = dist(sig[i], sig[i + 1])
    const dSpan = dist(sig[i - 1], sig[i + 1])
    // sharply unlike both neighbours while the neighbours resemble each other
    if (dPrev > thresh && dNext > thresh && dSpan < Math.min(dPrev, dNext) * 0.6) bad.push(i)
  }
  return bad
}

const started = Date.now()
const manifest = []
let repaired = 0

const ONLY = arg('only', null)   // e.g. --only 08,09 to re-render two legs
for (let i = 0; i < LEGS.length; i++) {
  const [id, label, weight] = LEGS[i]
  if (ONLY && !ONLY.split(',').includes(id)) continue
  const [t0, t1] = BOUNDS[i]
  const seconds = weight / RATE
  const frames = Math.max(2, Math.round(seconds * FPS))
  const dir = path.join(TMP, id)
  await mkdir(dir, { recursive: true })

  const tAt = (f) => t0 + (t1 - t0) * (f / (frames - 1))
  const shoot = async (f) => {
    // inclusive of both ends, so leg N's last frame is leg N+1's first
    await page.evaluate((v) => window.__setT(v), tAt(f))
    await capture(page, path.join(dir, String(f).padStart(4, '0') + '.png'))
  }
  for (let f = 0; f < frames; f++) await shoot(f)

  for (let round = 0; round < 4; round++) {
    const bad = outliers(signatures(dir, frames), 22)
    if (!bad.length) break
    if (round === 3) {
      console.error(`  ${id}: ${bad.length} frame(s) still bad after 4 rounds: ${bad.join(',')}`)
      process.exit(1)
    }
    repaired += bad.length
    for (const f of bad) { await page.waitForTimeout(120); await shoot(f) }
  }

  const mp4 = path.join(OUT, id + SUFFIX + '.mp4')
  const gop = MOBILE ? 4 : 8
  const enc = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(FPS),
    '-i', path.join(dir, '%04d.png'),
    '-an',                                   // scrub clips never carry audio
    // 26/28, not 21/23. The photographic desk and paper the film gained on
    // 26.08.2026 are high-frequency, and x264 spends bits on grain the eye
    // never sees in motion: at 21 the same four legs came out 3.3x heavier
    // than the flat-textured ones they replaced. Measured on leg 01 at 1920x1080,
    // slow preset: crf 21 = 8.05MB, 24 = 4.89MB, 26 = 3.47MB, 28 = 2.47MB, and
    // the three are indistinguishable at a 760x420 crop of the closest paper.
    '-c:v', 'libx264', '-preset', 'slow', '-crf', MOBILE ? '28' : '26',
    '-pix_fmt', 'yuv420p',
    '-g', String(gop), '-keyint_min', String(gop), '-sc_threshold', '0',
    '-movflags', '+faststart',
    mp4,
  ], { encoding: 'utf8' })
  if (enc.status !== 0) { console.error(enc.stderr); process.exit(1) }

  // poster: the leg's own first frame, taken from the ENCODED mp4 so it matches
  // the frame the browser will actually decode
  const poster = path.join(OUT, id + SUFFIX + '.webp')
  const pos = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', '-q:v', '82', poster,
  ], { encoding: 'utf8' })
  if (pos.status !== 0) { console.error(pos.stderr); process.exit(1) }

  manifest.push({ id, label, weight, t0, t1, seconds: +seconds.toFixed(2), frames, fps: FPS })
  console.log(`  ${id} ${label.padEnd(18)} w=${weight}  ${seconds.toFixed(1)}s  ${frames}f  rate=${(weight / seconds).toFixed(4)}`)
}

await browser.close()

if (!MOBILE) {
  // MERGE, do not replace. A `--only 04` run knows about one leg, and writing
  // its manifest whole threw the other three away: the file came back with a
  // single entry, and nothing downstream noticed because nothing downstream
  // reads it at build time. Found by `git diff` rather than by a gate.
  const file = path.resolve('data/world-legs.json')
  let prior = []
  try {
    prior = JSON.parse(await readFile(file, 'utf8')).legs || []
  } catch { /* first run */ }
  const merged = [...prior]
  for (const leg of manifest) {
    const at = merged.findIndex((l) => l.id === leg.id)
    if (at === -1) merged.push(leg)
    else merged[at] = leg
  }
  merged.sort((a, b) => a.id.localeCompare(b.id))
  await writeFile(file, JSON.stringify({ total: TOTAL, rate: RATE, legs: merged }, null, 2), 'utf8')
}

const rates = manifest.map((m) => m.weight / m.seconds)
const spread = (Math.max(...rates) / Math.min(...rates) - 1) * 100
console.log(`\n${LEGS.length} legs, ${TOTAL}vh, pace spread ${spread.toFixed(2)}% (must stay within a few percent)`)
console.log(`dropped frames recaptured: ${repaired}`)
console.log(`${((Date.now() - started) / 1000).toFixed(0)}s`)
