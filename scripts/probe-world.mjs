// Screenshot the world at a handful of t values so the composition can be
// judged before committing to a full render.
//
// Usage: node scripts/probe-world.mjs [--w 1920] [--h 1080] [--out lab/world/probe]

import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const arg = (k, d) => { const i = args.indexOf('--' + k); return i === -1 ? d : args[i + 1] }

const W = +arg('w', 1920)
const H = +arg('h', 1080)
const OUT = path.resolve(arg('out', 'lab/world/probe'))
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const WORLD = pathToFileURL(path.resolve('lab/world/world.html')).href


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

const TS = arg('ts', '0,0.05,0.10,0.16,0.22,0.30,0.41,0.48,0.53,0.60,0.66,0.71,0.80,0.89,0.94,1.0')
  .split(',').map(Number)

// keep the directory: removing it races with anything holding it open on Windows
await mkdir(OUT, { recursive: true })

// Software rasterisation is slower and deterministic. GPU rasterisation of this
// many large transformed layers comes back with whole panels unrastered, and
// which frames it drops changes between runs.
const GPUARGS = args.includes('--swrast')
  ? ['--disable-gpu', '--disable-gpu-compositing', '--disable-features=CanvasOopRasterization']
  : []
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: GPUARGS })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await page.goto(`${WORLD}?w=${W}&h=${H}`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 })

for (const t of TS) {
  await page.evaluate((v) => window.__setT(v), t)
  await page.waitForTimeout(+arg('settle', 60))
  const name = 't' + String(Math.round(t * 1000)).padStart(4, '0') + '.png'
  await capture(page, path.join(OUT, name))
  console.log('  ' + name)
}

await browser.close()
console.log(`\n${TS.length} probe frames in ${path.relative(process.cwd(), OUT)}`)
