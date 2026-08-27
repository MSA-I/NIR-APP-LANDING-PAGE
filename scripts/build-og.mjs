// Build the share card at public/assets/og-cover.png.
//
// The audit of 27.08.2026 found no og:image at all, which means every share of
// this link, in WhatsApp or LinkedIn or anywhere else, renders as a bare URL.
// That is the cheapest thing on the whole list to fix and one of the most
// visible, because it is what a reader sees BEFORE deciding whether to open
// the page.
//
// The card is drawn in the browser rather than in an image editor for the same
// reason the film is built by a script: a picture that only exists as a binary
// cannot be reviewed, corrected or rebuilt when the headline changes. The
// template beside this file is the source, this is the camera.
//
// The two faces are inlined as data URIs before the picture is taken, so the
// render has no network dependency and cannot silently fall back to Arial,
// which is exactly the failure that would be invisible in a 1200x630 PNG until
// somebody shared it.
//
//   node scripts/build-og.mjs

import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'public/assets/og-cover.jpg')

// The page's own grain, lifted from .grain in src/styles.css so the card and
// the page are grained by the same noise rather than by two similar ones.
const GRAIN =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E" +
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' " +
  "numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E" +
  "%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

const dataUri = (rel) =>
  `data:font/woff2;base64,${readFileSync(path.join(ROOT, rel)).toString('base64')}`

const html = readFileSync(path.join(ROOT, 'scripts/og-template.html'), 'utf8')
  .replace('__HEEBO__', dataUri('public/assets/fonts/Heebo-hebrew.woff2'))
  .replace('__NOTO__', dataUri('public/assets/fonts/NotoSansHebrew-Hebrew.woff2'))
  .replace('__GRAIN__', GRAIN)

const browser = await chromium.launch({ channel: 'chromium' })
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
})
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)

// The faces are inlined, so a fallback here would mean the @font-face never
// applied. Better to fail the build than to ship a card set in Arial.
const set = await page.evaluate(() => {
  const h1 = getComputedStyle(document.querySelector('h1')).fontFamily
  return h1
})
if (!/Heebo/.test(set)) throw new Error(`the headline is not set in Heebo, it is set in ${set}`)

// JPEG, not PNG. The card is a smooth gradient with grain over it, which is
// the worst case for PNG's palette compression: the first cut came out at
// 373KB. At quality 90 the same picture is a fraction of that, and no chat
// client refuses a preview for being too small.
await page.screenshot({ path: OUT, type: 'jpeg', quality: 90 })
await browser.close()

const kb = statSync(OUT).size / 1024
console.log(`public/assets/og-cover.jpg  1200x630  ${kb.toFixed(0)}KB`)
if (kb > 300) {
  console.warn('over 300KB: some chat clients refuse to fetch a preview that large')
}
