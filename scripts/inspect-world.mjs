// Report where every object actually lands on screen at a given t. Transform
// maths in a perspective container is easy to get wrong by reasoning and cheap
// to get right by measuring, so measure.
import { chromium } from 'playwright-core'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const arg = (k, d) => { const i = args.indexOf('--' + k); return i === -1 ? d : args[i + 1] }
const W = +arg('w', 1920), H = +arg('h', 1080)
const TS = arg('ts', '0,0.1,0.22,0.3,0.41,0.53,0.66,0.71,0.8,0.89,1').split(',').map(Number)
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const WORLD = pathToFileURL(path.resolve('lab/world/world.html')).href

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: W, height: H } })
await page.goto(`${WORLD}?w=${W}&h=${H}`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 })

for (const t of TS) {
  const rows = await page.evaluate((v) => {
    window.__setT(v)
    const out = []
    const seen = (el, tag) => {
      const r = el.getBoundingClientRect()
      const op = +getComputedStyle(el).opacity
      if (op < 0.02) return
      out.push([tag, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), op.toFixed(2)])
    }
    document.querySelectorAll('.panel').forEach((el, i) => seen(el, 'panel' + i))
    document.querySelectorAll('.doc').forEach((el, i) => seen(el, 'doc' + i))
    return out
  }, t)
  console.log('\nt=' + t)
  for (const r of rows) console.log('  ' + r[0].padEnd(8) + ' x' + String(r[1]).padStart(6) + ' y' + String(r[2]).padStart(6) + '  ' + String(r[3]).padStart(5) + 'x' + String(r[4]).padStart(5) + '  a=' + r[5])
  if (!rows.length) console.log('  (nothing visible)')
}
await browser.close()
