// Screenshot the built page at given track fractions. Cheap look while the
// full harness is not yet runnable.
import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
const args = process.argv.slice(2)
const arg = (k, d) => { const i = args.indexOf('--' + k); return i === -1 ? d : args[i + 1] }
const URL = arg('url', 'http://localhost:4500')
const W = +arg('w', 1600), H = +arg('h', 900)
const OUT = path.resolve(arg('out', 'lab/peek'))
const FR = arg('at', '0,0.05,0.15,0.3').split(',').map(Number)
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
await mkdir(OUT, { recursive: true })
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForSelector('html.sc-ready', { timeout: 20000 })
await p.waitForTimeout(600)
for (const f of FR) {
  const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  await p.evaluate((y) => scrollTo(0, y), Math.round(max * f))
  await p.waitForTimeout(900)
  const n = 'p' + String(Math.round(f * 1000)).padStart(4, '0') + '.png'
  // CDP capture: Playwright's own screenshot path drops composited layers on
  // this machine whenever a <video> is on screen.
  if (!globalThis.__cdp) globalThis.__cdp = await p.context().newCDPSession(p)
  const r = await globalThis.__cdp.send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: false, fromSurface: true })
  await writeFile(path.join(OUT, n), Buffer.from(r.data, 'base64'))
  console.log('  ' + n)
}
await b.close()
