// Build the two share cards: public/assets/og-cover.jpg and og-cover-en.jpg.
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
// WHY TWO
// The SEO audit of 31.08.2026 found all eighteen pages pointing at one card,
// whose visible text is Hebrew. An English reader sharing /en/procurement-software/
// on LinkedIn got an English title over a Hebrew picture, and the English pages'
// own og:image:alt described that picture in English. One template, rendered
// twice, is cheaper than two templates that drift.
//
//   node scripts/build-og.mjs

import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Per edition: where the picture goes, which way it reads, which cut of each
// face carries its glyphs, and the words themselves. The headline is split so
// the tint lands on the clause that closes it, in both languages.
const EDITIONS = [
  {
    out: 'public/assets/og-cover.jpg',
    lang: 'he',
    dir: 'rtl',
    heebo: 'public/assets/fonts/Heebo-hebrew.woff2',
    noto: 'public/assets/fonts/NotoSansHebrew-Hebrew.woff2',
    head: 'כל מה שקורה בין ההזמנה לכסף,',
    tint: 'במקום אחד.',
    chain: [
      '<b>ספק</b> <i>◂</i> <b>הזמנה</b> <i>◂</i> <b>קבלה</b> <i>◂</i>',
      '<b>חשבונית</b> <i>◂</i> <b>תשלום</b>',
    ].join('\n          '),
  },
  {
    out: 'public/assets/og-cover-en.jpg',
    lang: 'en',
    dir: 'ltr',
    heebo: 'public/assets/fonts/Heebo-latin.woff2',
    noto: 'public/assets/fonts/NotoSansHebrew-Latin.woff2',
    head: 'Everything between the order and the money,',
    tint: 'in one place.',
    chain: [
      '<b>Supplier</b> <i>▸</i> <b>Order</b> <i>▸</i> <b>Goods received</b> <i>▸</i>',
      '<b>Invoice</b> <i>▸</i> <b>Payment</b>',
    ].join('\n          '),
  },
]

// The page's own grain, lifted from .grain in src/styles.css so the card and
// the page are grained by the same noise rather than by two similar ones.
const GRAIN =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E" +
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' " +
  "numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E" +
  "%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

const dataUri = (rel) =>
  `data:font/woff2;base64,${readFileSync(path.join(ROOT, rel)).toString('base64')}`

const TEMPLATE = readFileSync(path.join(ROOT, 'scripts/og-template.html'), 'utf8')

// The same browser the gates use.  needs a
// Playwright-managed download that is not present on every machine that has
// this repository, and a card that cannot be rebuilt is the binary this script
// exists to avoid. CHROME_PATH overrides it where Chrome lives somewhere else.
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: CHROME })

for (const ed of EDITIONS) {
  const html = TEMPLATE.replace('__LANG__', ed.lang)
    .replace('__DIR__', ed.dir)
    .replace('__HEEBO__', dataUri(ed.heebo))
    .replace('__NOTO__', dataUri(ed.noto))
    .replace('__GRAIN__', GRAIN)
    .replace('__HEAD__', ed.head)
    .replace('__HEAD_TINT__', ed.tint)
    .replace('__CHAIN__', ed.chain)

  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)

  // The faces are inlined, so a fallback here would mean the @font-face never
  // applied. Better to fail the build than to ship a card set in Arial.
  const set = await page.evaluate(
    () => getComputedStyle(document.querySelector('h1')).fontFamily
  )
  if (!/Heebo/.test(set)) throw new Error(`${ed.out}: the headline is set in ${set}, not Heebo`)

  // The headline must fit the plate. A card whose words are clipped at 1200x630
  // is worse than no card, and it is invisible until somebody shares the link.
  const overflows = await page.evaluate(() => {
    const p = document.querySelector('.plate')
    return p.scrollHeight > p.clientHeight || p.scrollWidth > p.clientWidth
  })
  if (overflows) throw new Error(`${ed.out}: the headline does not fit the plate`)

  // JPEG, not PNG. The card is a smooth gradient with grain over it, which is
  // the worst case for PNG's palette compression: the first cut came out at
  // 373KB. At quality 90 the same picture is a fraction of that, and no chat
  // client refuses a preview for being too small.
  const out = path.join(ROOT, ed.out)
  await page.screenshot({ path: out, type: 'jpeg', quality: 90 })
  await page.close()

  const kb = statSync(out).size / 1024
  console.log(`${ed.out}  1200x630  ${kb.toFixed(0)}KB  (${ed.lang})`)
  if (kb > 300) {
    console.warn(`${ed.out} is over 300KB: some chat clients refuse a preview that large`)
  }
}

await browser.close()
