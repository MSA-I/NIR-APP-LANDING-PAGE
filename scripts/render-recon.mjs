// Render act two of the world: the reconciliation and the mark.
//
// Act one is a camera flying through a hall, sliced into legs by t. Act two is
// a card held up to the lens, driven by u, and it does not share the camera at
// all, so it does not share render-world.mjs's leg arithmetic either. What it
// does share is three things that machine learned the hard way: capture
// through CDP rather than Playwright's screenshot path, check every leg for
// frames that came back with layers unrastered, and refuse to start when the
// scene cannot load its own materials.
//
//   node scripts/render-recon.mjs                desktop, 1920x1080
//   node scripts/render-recon.mjs --mobile       portrait, 810x1440
//   node scripts/render-recon.mjs --peek 0.42    one frame, to look at
//
// Output: public/assets/R.mp4 and R-m.mp4, at the same fps and encoder
// settings as the legs, so build-film.mjs can stream-copy it in.

import { chromium } from 'playwright-core'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const has = (k) => args.includes('--' + k)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}

const MOBILE = has('mobile')
const PEEK = arg('peek', null)
const W = +arg('w', MOBILE ? 810 : 1920)
const H = +arg('h', MOBILE ? 1440 : 1080)
const FPS = +arg('fps', 24)
// The act runs 9.2 seconds. Act one is paced at 0.215 viewport-heights of
// scroll per second and this is not on that track at all, so its length is
// chosen for the shot: three lines that each need a beat to be read, and then
// a mark that needs to be looked at rather than glimpsed.
const SECONDS = +arg('seconds', 9.2)
const SUFFIX = MOBILE ? '-m' : ''
const OUT = path.resolve(arg('out', 'public/assets'))
const TMP = path.resolve('lab/world/recon' + SUFFIX)
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const WORLD = pathToFileURL(path.resolve('world/world.html')).href

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
// Every request the scene makes has to arrive. Act two draws its own type and
// nothing else, so a 404 here costs less than it does in act one — but it
// costs the same NOTHING at render time, which is exactly how nine of them
// shipped on 26.08.2026. See the note in scripts/render-world.mjs.
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

let cdp = null
async function capture(file) {
  if (!cdp) cdp = await page.context().newCDPSession(page)
  const r = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  })
  await writeFile(file, Buffer.from(r.data, 'base64'))
}

if (PEEK !== null) {
  await mkdir(TMP, { recursive: true })
  for (const u of String(PEEK).split(',').map(Number)) {
    await page.evaluate((v) => window.__setR(v), u)
    await page.waitForTimeout(90)
    const f = path.join(TMP, 'peek-' + String(Math.round(u * 100)).padStart(3, '0') + '.png')
    await capture(f)
    console.log('  ' + f)
  }
  await browser.close()
  process.exit(0)
}

await rm(TMP, { recursive: true, force: true }).catch(() => {})
await mkdir(TMP, { recursive: true })
await mkdir(OUT, { recursive: true })

const frames = Math.round(SECONDS * FPS)
const shoot = async (f) => {
  await page.evaluate((v) => window.__setR(v), f / (frames - 1))
  await capture(path.join(TMP, String(f).padStart(4, '0') + '.png'))
}
for (let f = 0; f < frames; f++) await shoot(f)

// Same dropped-frame check act one runs: a frame sharply unlike BOTH its
// neighbours, while the neighbours resemble each other, is a capture Chrome
// returned with layers missing, not a cut.
function signatures(dir) {
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
let repaired = 0
for (let round = 0; round < 4; round++) {
  const sig = signatures(TMP)
  const bad = []
  for (let i = 1; i < sig.length - 1; i++) {
    const dPrev = dist(sig[i], sig[i - 1])
    const dNext = dist(sig[i], sig[i + 1])
    const dSpan = dist(sig[i - 1], sig[i + 1])
    if (dPrev > 22 && dNext > 22 && dSpan < Math.min(dPrev, dNext) * 0.6) bad.push(i)
  }
  if (!bad.length) break
  if (round === 3) {
    console.error(`  R: ${bad.length} frame(s) still bad after 4 rounds: ${bad.join(',')}`)
    process.exit(1)
  }
  repaired += bad.length
  for (const f of bad) {
    await page.waitForTimeout(120)
    await shoot(f)
  }
}

await browser.close()

const mp4 = path.join(OUT, 'R' + SUFFIX + '.mp4')
const gop = MOBILE ? 4 : 8
const enc = spawnSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-framerate', String(FPS),
  '-i', path.join(TMP, '%04d.png'),
  '-an',
  // This act is flat colour and type, not the photographic desk act one shoots
  // on, so it costs a fraction of what a leg costs at the same crf.
  '-c:v', 'libx264', '-preset', 'slow', '-crf', MOBILE ? '26' : '23',
  '-pix_fmt', 'yuv420p',
  '-g', String(gop), '-keyint_min', String(gop), '-sc_threshold', '0',
  '-movflags', '+faststart',
  mp4,
], { encoding: 'utf8' })
if (enc.status !== 0) {
  console.error(enc.stderr)
  process.exit(1)
}
console.log(`  R${SUFFIX}  ${frames}f  ${SECONDS}s  recaptured ${repaired}`)
