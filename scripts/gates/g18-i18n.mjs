// G18: the English page is a complete edition, not a translated fragment.

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, DIST, checker, withPage } from './lib.mjs'

const c = checker('G18')

const source = await readFile(path.join(ROOT, 'src', 'content', 'en.ts'), 'utf8')
const locales = await readFile(path.join(ROOT, 'src', 'content', 'locales.ts'), 'utf8')
const rootHtml = await readFile(path.join(DIST, 'index.html'), 'utf8')
const enHtml = await readFile(path.join(DIST, 'en', 'index.html'), 'utf8')

c.ok(/satisfies typeof he/.test(source), 'English content is not compile-time checked against Hebrew')
c.ok(/contentByLocale\s*=\s*\{\s*he,\s*en\s*\}/.test(locales), 'locale registry does not expose Hebrew and English')

for (const [name, html, canonical] of [
  ['Hebrew', rootHtml, 'https://inplace.digital/'],
  ['English', enHtml, 'https://inplace.digital/en/'],
]) {
  c.ok(html.includes(`rel="canonical" href="${canonical}"`), `${name} canonical is not ${canonical}`)
  c.ok(html.includes('hreflang="he"'), `${name} page is missing Hebrew hreflang`)
  c.ok(html.includes('hreflang="en"'), `${name} page is missing English hreflang`)
  c.ok(html.includes('hreflang="x-default"'), `${name} page is missing x-default hreflang`)
}

await stat(path.join(DIST, 'en', 'index.html'))
c.note('dist contains root Hebrew and /en/ English entry documents')

async function readEdition(pathname) {
  return withPage(
    async (page, { errors }) => {
      const edition = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        h1: (
          document.querySelector('h1')?.getAttribute('aria-label') ||
          document.querySelector('h1')?.textContent ||
          ''
        ).replace(/\s+/g, ' ').trim(),
        folios: document.querySelectorAll('[data-folio]').length,
        indexItems: document.querySelectorAll('#top nav li').length,
        plans: document.querySelectorAll('.plan-card').length,
        faqs: document.querySelectorAll('.faq-card').length,
      }))
      edition.errors = errors
      return edition
    },
    { path: pathname },
  )
}

const he = await readEdition('/')
const en = await readEdition('/en/')

function matchesEdition(value, expected) {
  return value.lang === expected.lang && value.dir === expected.dir && value.h1?.includes(expected.h1)
}

const controlCaught = !matchesEdition(en, { lang: 'he', dir: 'rtl', h1: 'ההזמנה' })
c.ok(controlCaught, 'negative control accepted the English page as the Hebrew edition')

c.ok(matchesEdition(he, { lang: 'he', dir: 'rtl', h1: 'ההזמנה' }), 'root page is not the Hebrew RTL edition')
c.ok(matchesEdition(en, { lang: 'en', dir: 'ltr', h1: 'order and the money' }), '/en/ is not the English LTR edition')
c.ok(en.title === 'InPlace: procurement, invoices and payments in one place', `unexpected English title: ${en.title}`)
c.ok(en.description?.includes('procurement-to-payment'), 'English description is missing the product category')

for (const [name, edition] of [['Hebrew', he], ['English', en]]) {
  c.ok(edition.folios === he.folios, `${name} has ${edition.folios} folio sections, Hebrew has ${he.folios}`)
  c.ok(edition.indexItems === 6, `${name} title index has ${edition.indexItems} items`)
  c.ok(edition.plans === 5, `${name} page has ${edition.plans} plans`)
  c.ok(edition.faqs === 7, `${name} page has ${edition.faqs} FAQ items`)
  c.ok(edition.errors.length === 0, `${name} page emitted browser errors: ${edition.errors.join(' | ')}`)
}

c.note(`same structure: ${he.folios} folios, 6 index items, 5 plans, 7 FAQs`)
c.report()
