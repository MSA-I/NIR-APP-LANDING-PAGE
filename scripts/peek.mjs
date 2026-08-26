// Screenshot the built page at given scroll fractions.
//
// Two things this has to get right on this machine:
//   - WebGL. Headless Chrome has no GPU here, so the shader ground renders
//     black unless SwiftShader is allowed explicitly. A capture without these
//     flags is a picture of a bug that does not exist.
//   - Capture path. Playwright's own screenshot drops composited layers here
//     whenever a <video> is on screen, so frames come off CDP instead.
import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}
const URL = arg('url', 'http://localhost:4500')
const W = +arg('w', 1600)
const H = +arg('h', 900)
const OUT = path.resolve(arg('out', 'lab/peek'))
const FR = arg('at', '0,0.12,0.3,0.5,0.7,0.88,1').split(',').map(Number)

export const GL_FLAGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
]

const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: GL_FLAGS,
})
const page = await browser.newPage({ viewport: { width: W, height: H }, locale: 'he-IL' })
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('main', { timeout: 20000 })
await page.waitForTimeout(1200)

const cdp = await page.context().newCDPSession(page)
for (const f of FR) {
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  await page.evaluate((y) => scrollTo(0, y), Math.round(max * f))
  await page.waitForTimeout(1100)
  const name = 'p' + String(Math.round(f * 1000)).padStart(4, '0') + '.png'
  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    fromSurface: true,
  })
  await writeFile(path.join(OUT, name), Buffer.from(shot.data, 'base64'))
  console.log('  ' + name)
}
await browser.close()
