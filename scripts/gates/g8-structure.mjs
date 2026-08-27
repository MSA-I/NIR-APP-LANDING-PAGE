// G8: every chapter is present, in order, with its heading.
//
// The rebuild changed the whole surface. This is the gate that says the page
// is still the same document: a title page, six chapters in the printed order,
// the closing spread inside chapter 02, and a colophon.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, withPage, checker } from './lib.mjs'

const c = checker('G8')

// The question count is READ, not written down. Round twelve added an eighth
// question, and a gate whose only record of "how many" is a numeral in its own
// source has to be edited every time the page gains one, which is the moment
// somebody edits it without checking whether the page actually still renders
// them all. Both dictionaries are plain modules with no imports, so both load.
const dict = async (file) =>
  (
    await import(
      'data:text/javascript;base64,' +
        Buffer.from(await readFile(path.join(ROOT, 'src', 'content', file), 'utf8'), 'utf8').toString(
          'base64'
        )
    )
  ).default

const [he, extra] = await Promise.all([dict('he.ts'), dict('extra.ts')])
const QUESTIONS = he.faq.items.length + (extra.faqExtra?.items.length ?? 0)

const FOLIOS = [
  'שער',
  'פרק 01: מהערימה למרכז הבקרה',
  'פרק 02: מה המערכת עושה',
  'פרק 03: למה דווקא זה',
  'פרק 04: מסלולים',
  'פרק 05: שאלות',
  'פרק 06: להתחיל',
]

await withPage(async (page) => {
  const seen = await page.$$eval('[data-folio]', (els) =>
    els.map((el) => el.getAttribute('data-folio'))
  )
  c.ok(
    JSON.stringify(seen) === JSON.stringify(FOLIOS),
    `chapters out of order or missing.\n        wanted: ${FOLIOS.join(' | ')}\n        found:  ${seen.join(' | ')}`
  )
  c.note(`${seen.length} chapters, in order`)

  const h1 = await page.$$eval('h1', (els) => els.map((e) => e.textContent.trim()))
  c.ok(h1.length === 1, `a page has exactly one h1, this one has ${h1.length}`)
  c.note(`h1: ${h1[0]}`)

  // The anchors the header and the footer both link to.
  for (const id of ['top', 'what', 'why', 'plans', 'faq']) {
    c.ok(await page.$(`#${id}`), `#${id} is linked from the page but does not exist on it`)
  }

  // Chapter 02's closing spread: the control centre at full height, with its
  // three readings and its caption.
  const board = await page.$$eval('img[alt*="מרכז הבקרה"]', (els) => els.length)
  c.ok(board === 1, `the full control centre should appear exactly once, found ${board}`)

  // The questions open one at a time, and natively: the owner asked for opening
  // one to close the last, and a shared `name` on <details> does exactly that in
  // the browser, with no state and no script. It is asserted rather than
  // assumed because the whole behaviour is one attribute, and an attribute is
  // easy to drop while the section still looks correct in a screenshot.
  const named = await page.$$eval('#faq details', (els) => els.map((d) => d.getAttribute('name')))
  c.ok(
    named.length === QUESTIONS && named.every((n) => n && n === named[0]),
    `the ${QUESTIONS} questions should share one name attribute, they have: ${named.join(', ')}`
  )
  const exclusive = await page.evaluate(async () => {
    const summaries = [...document.querySelectorAll('#faq summary')]
    const openCount = () => [...document.querySelectorAll('#faq details')].filter((d) => d.open).length
    const wait = () => new Promise((r) => setTimeout(r, 120))
    summaries[3].click()
    await wait()
    const afterFourth = openCount()
    summaries[6].click()
    await wait()
    return { afterFourth, afterSeventh: openCount() }
  })
  c.ok(
    exclusive.afterFourth === 1 && exclusive.afterSeventh === 1,
    `opening a question should close the last one; ${exclusive.afterFourth} then ${exclusive.afterSeventh} stayed open`
  )
  c.note('the questions open one at a time, natively')

  const footer = await page.$$eval('footer a', (els) => els.length)
  c.ok(footer >= 8, `the colophon should carry every footer link, found ${footer}`)
  c.note(`colophon: ${footer} links`)

  // One ask, repeated: every signup link goes to the same place.
  const asks = await page.$$eval('a[href*="signup"]', (els) => [
    ...new Set(els.map((e) => e.getAttribute('href'))),
  ])
  c.ok(
    asks.length === 1 && asks[0] === 'https://app.inplace.digital/signup',
    `the page should have one signup destination, it has: ${asks.join(', ')}`
  )
})

c.report()
