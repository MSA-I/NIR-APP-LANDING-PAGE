// G1: the Hebrew page is a real HTML document with real headings and reading
// order, not a JS-rendered shell.
//
// The check that matters is the one with JS OFF: a live-surface page is still
// a document, and if the argument only exists once a script has run then it
// does not exist for a crawler, a reader mode, or a reader whose script failed.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { ROOT, DIST, CHROME, checker, serve, distExists } from './lib.mjs'

const c = checker('G1')

if (!c.ok(await distExists(), 'dist/index.html is missing. Run `node scripts/build.mjs` first.')) {
  c.report()
  process.exit(1)
}

const html = await readFile(path.join(DIST, 'index.html'), 'utf8')

c.ok(/<html lang="he" dir="rtl">/.test(html), 'root element is not <html lang="he" dir="rtl">')
c.ok(/<h1[ >]/.test(html), 'no <h1> in the document')
c.ok((html.match(/<h2[ >]/g) || []).length >= 6, 'fewer than six <h2> section headings in the source')
c.ok(/<title>[^<]{10,}<\/title>/.test(html), 'no usable <title>')
c.ok(/<meta name="description" content="[^"]{40,}"/.test(html), 'no usable meta description')

// Every act's prose must be IN the document, not assembled at runtime.
const he = (await import('../../i18n/he.js')).default
const mustAppear = [
  he.open.screenTitle,
  he.pricelist.title,
  he.order.title,
  he.receiving.title,
  he.invoice.title,
  he.sort.title,
  he.roles.title,
  he.settle.title,
  he.close.title,
  he.cta,
]
for (const s of mustAppear) {
  c.ok(html.includes(s.replace(/&/g, '&amp;')), `copy missing from the static HTML: "${s.slice(0, 32)}"`)
}

// And it must still be there with scripting disabled.
const srv = await serve()
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(srv.origin + '/', { waitUntil: 'domcontentloaded' })

const noJs = await page.evaluate(() => {
  const heads = [...document.querySelectorAll('h1, h2')].map((h) => h.textContent.trim())
  return {
    heads,
    text: (document.body.innerText || '').length,
    cta: !!document.querySelector('a[href*="signup"]'),
  }
})
await browser.close()
await srv.close()

c.ok(noJs.heads.length >= 7, `only ${noJs.heads.length} headings render without JS`)
c.ok(noJs.text > 1200, `only ${noJs.text} characters of text render without JS`)
c.ok(noJs.cta, 'the CTA link is not present without JS')
c.note(`${noJs.heads.length} headings and ${noJs.text} characters render with scripting disabled`)

c.report()
