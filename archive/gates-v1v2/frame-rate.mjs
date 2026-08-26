// Measure real rAF frame times while the page is being scrolled.
// A still screenshot cannot show a long frame; this is what "flicker" is.
import { chromium } from 'playwright-core'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }
const URL = arg('url', 'http://localhost:4500')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 860 } })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForSelector('html.sc-ready', { timeout: 20000 })
await p.waitForTimeout(1500)

const res = await p.evaluate(() => new Promise((done) => {
  const max = document.documentElement.scrollHeight - innerHeight
  const dt = [], recalcs = []
  let last = performance.now(), y = 0
  const step = max / 420
  function f(now) {
    dt.push(now - last); last = now
    y += step
    scrollTo(0, y)
    if (y < max) requestAnimationFrame(f)
    else done({ dt, samples: dt.length })
  }
  requestAnimationFrame((n) => { last = n; requestAnimationFrame(f) })
}))

const dt = res.dt.slice(3)
const sorted = [...dt].sort((a, b) => a - b)
const pct = (q) => sorted[Math.floor(sorted.length * q)]
const long = dt.filter((d) => d > 33).length          // dropped a 30fps frame
const veryLong = dt.filter((d) => d > 60).length
const mean = dt.reduce((a, b) => a + b, 0) / dt.length

console.log(`frames=${dt.length}  mean=${mean.toFixed(1)}ms  p50=${pct(0.5).toFixed(1)}  p95=${pct(0.95).toFixed(1)}  p99=${pct(0.99).toFixed(1)}  max=${sorted[sorted.length-1].toFixed(1)}`)
console.log(`over 33ms: ${long} (${(long / dt.length * 100).toFixed(1)}%)   over 60ms: ${veryLong}`)
await b.close()
if (pct(0.95) <= 26 && veryLong === 0) console.log('FRAME-RATE-OK')
else console.log('FRAME-RATE-BAD')
