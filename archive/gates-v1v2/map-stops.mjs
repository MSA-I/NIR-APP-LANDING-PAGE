// G4: clicking a station on the map has to land inside that station's own leg.
// The map is this page's navigation; a map you cannot move around in is a video,
// and a map that lands you in the wrong place is worse than none.
import { chromium } from 'playwright-core'

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }
const URL = arg('url', 'http://localhost:4500')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 860 } })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForSelector('html.sc-ready', { timeout: 20000 })
await p.waitForTimeout(1200)

const geom = await p.evaluate(() => {
  const root = document.querySelector('[data-sc-mode="worldflight"]')
  const w = [...root.querySelectorAll('[data-sc-segment]')]
    .map((s) => parseFloat(s.getAttribute('data-sc-w')))
  const c0 = []; let run = 0
  w.forEach((x, i) => { c0[i] = run; run += x })
  return { w, c0, total: run, top: root.offsetTop, vh: innerHeight }
})

const stops = await p.$$('.ip-map__stop')
const fails = []
for (let i = 0; i < stops.length; i++) {
  await p.evaluate(() => scrollTo(0, 0))
  await p.waitForTimeout(400)
  await stops[i].click()
  await p.waitForTimeout(1600)   // smooth scroll has to arrive
  const t = await p.evaluate(({ top, vh }) => (scrollY - top) / vh, geom)
  const lo = geom.c0[i], hi = geom.c0[i] + geom.w[i]
  const ok = t >= lo - 0.06 && t <= hi + 0.06
  const label = await stops[i].innerText()
  console.log(`  ${String(i).padStart(2)} ${label.trim().padEnd(12)} landed t=${t.toFixed(3)}vh  leg [${lo.toFixed(2)}, ${hi.toFixed(2)}]  ${ok ? 'ok' : 'MISS'}`)
  if (!ok) fails.push(i)

  // and the map has to agree with where we actually are
  const cur = await p.evaluate(() => [...document.querySelectorAll('.ip-map__stop')]
    .findIndex((el) => el.getAttribute('aria-current') === 'true'))
  if (cur !== i) { console.log(`     aria-current is ${cur}, expected ${i}`); fails.push(i) }
}
await b.close()

if (fails.length) { console.log('MAP-STOPS-BAD'); process.exit(1) }
console.log('MAP-STOPS-OK')
