// Resolve every oklch() in site.css to its exact sRGB hex, by asking Chrome.
//
// Why: the values came from the product, which authors in oklch, and they are
// all inside the sRGB gamut, so the conversion is lossless on screen. What it
// buys is measurability. Chrome returns oklch() verbatim from
// getComputedStyle().color, and every contrast tool in the chain — including
// scrollcraft's own shoot.mjs — parses colour with an rgb()-shaped regex, so an
// oklch page reports near-black text on every line and its real contrast can
// never be graded. A page that cannot be measured cannot be verified.
//
// The original oklch is kept in a trailing comment so provenance survives.
//
// Usage: node scripts/oklch-to-hex.mjs [--check]

import { chromium } from 'playwright-core'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSS = path.join(ROOT, 'site.css')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const CHECK = process.argv.includes('--check')

const css = await readFile(CSS, 'utf8')
const found = [...new Set(css.match(/oklch\([^)]*\)/g) || [])]

if (!found.length) {
  console.log('no oklch() left in site.css')
  process.exit(0)
}
if (CHECK) {
  console.log(`${found.length} oklch() value(s) still in site.css`)
  process.exit(1)
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
await page.setContent('<div id="p"></div>')

const map = await page.evaluate((colors) => {
  // Read the PIXEL, not the computed string. Chrome preserves oklch() verbatim
  // in getComputedStyle, so parsing that string is the very bug this script
  // exists to remove. Painting one pixel and reading it back is the only
  // conversion that cannot lie.
  const c = document.createElement('canvas')
  c.width = c.height = 1
  const g = c.getContext('2d', { willReadFrequently: true })
  const out = {}
  for (const col of colors) {
    g.clearRect(0, 0, 1, 1)
    g.fillStyle = '#000'
    g.fillStyle = col
    if (g.fillStyle === '#000' && !/^(#000|black|rgb\(0, 0, 0\))/.test(col)) continue
    g.fillRect(0, 0, 1, 1)
    const [r, gr, b, a] = g.getImageData(0, 0, 1, 1).data
    if (a < 255) {
      out[col] = `rgba(${r}, ${gr}, ${b}, ${(a / 255).toFixed(3)})`
    } else {
      out[col] =
        '#' + [r, gr, b].map((v) => v.toString(16).padStart(2, '0')).join('')
    }
  }
  return out
}, found)

await browser.close()

let next = css
let n = 0
for (const [oklch, hex] of Object.entries(map)) {
  if (!hex) continue
  next = next.split(oklch).join(hex)
  n++
}

// Re-annotate the token block so the provenance is not lost.
next = next.replace(
  '/* ---- the product\'s palette, resolved from the running app ---- */',
  "/* ---- the product's palette, resolved from the running app ----\n     Authored in oklch by the product; written here as the exact sRGB Chrome\n     paints for those values, so the page is measurable by tools that only\n     parse rgb(). scripts/oklch-to-hex.mjs did the conversion. ---- */"
)

await writeFile(CSS, next, 'utf8')
console.log(`converted ${n} oklch() value(s) to sRGB hex`)
for (const [k, v] of Object.entries(map)) console.log(`  ${k}  ->  ${v}`)
