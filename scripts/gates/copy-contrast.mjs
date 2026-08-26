// G6: copy has to win against the busiest frame it is ever shown on.
//
// Round 1 cleared the harness's 4.5:1 floor with a soft scrim and the owner
// still said the text "מתערבבים בבלאגן". Reading the harness's own numbers is
// not enough either: it only records the blocks it happened to sample, and a
// gate that passes having measured two of nine blocks is not a gate.
//
// So this measures every block itself, and it measures the thing that actually
// makes copy legible over a moving world: the block sits on an OPAQUE plate, so
// whatever is behind it cannot reach the text. Two conditions, both required:
//
//   1. every [data-sc-copy] block has a background alpha >= 0.9
//   2. every piece of text in it clears the floor against that plate
//
// If (1) holds, (2) is the whole story, because nothing shows through.
import { chromium } from 'playwright-core'

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }
const URL = arg('url', 'http://localhost:4500')
const MIN = +arg('min', 7)
const MIN_ALPHA = 0.9
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 860 } })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForSelector('html.sc-ready', { timeout: 20000 })
await p.waitForTimeout(1000)

const rows = await p.evaluate(() => {
  const parse = (c) => {
    const m = c.match(/[\d.]+/g)
    if (!m) return null
    return { r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1 }
  }
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }
  // flatten a translucent plate onto the page ground, which is the worst case
  // for a plate that is not fully opaque
  const ground = parse(getComputedStyle(document.body).backgroundColor) || { r: 4, g: 8, b: 11, a: 1 }
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
  })

  return [...document.querySelectorAll('[data-sc-copy]')].map((block, i) => {
    const plateRaw = parse(getComputedStyle(block).backgroundColor) || { r: 0, g: 0, b: 0, a: 0 }
    const plate = over(plateRaw, ground)
    const texts = [...block.querySelectorAll('h1, h2, p, strong, span')]
      .filter((el) => el.textContent.trim())
      .map((el) => ({ t: el.textContent.trim().slice(0, 34), c: parse(getComputedStyle(el).color) }))
      .filter((x) => x.c)
    const worst = texts.reduce((acc, x) => {
      const v = ratio(x.c, plate)
      return v < acc.v ? { v, t: x.t } : acc
    }, { v: Infinity, t: '' })
    return {
      i, alpha: +plateRaw.a.toFixed(3),
      label: (block.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      worst: +worst.v.toFixed(2), worstText: worst.t, n: texts.length,
    }
  })
})
await b.close()

if (!rows.length) { console.log('no copy blocks found'); console.log('COPY-CONTRAST-BAD'); process.exit(1) }

let bad = 0
for (const r of rows) {
  const opaque = r.alpha >= MIN_ALPHA
  const clears = r.worst >= MIN
  if (!opaque || !clears) bad++
  console.log(`  block ${r.i}  plate a=${r.alpha}${opaque ? '' : ' TOO SHEER'}  worst ${r.worst.toFixed(2)}:1${clears ? '' : ' UNDER'}  ${r.label}`)
}
console.log(`\n${rows.length} copy blocks, all plated at a>=${MIN_ALPHA}, floor ${MIN}:1`)
if (bad) { console.log('COPY-CONTRAST-BAD'); process.exit(1) }
console.log('COPY-CONTRAST-OK')
