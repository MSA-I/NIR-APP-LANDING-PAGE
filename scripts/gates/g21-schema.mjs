// G21: the structured data says what the page says, and nothing it must not.
//
// The audit of 27.08.2026 found zero application/ld+json blocks: search engines
// were told nothing about what this product is, who runs it, or what it costs,
// while all three were written on the page in Hebrew.
//
// The block is generated in src/entry-static.tsx from the same dictionary the
// page renders, so it cannot drift by itself. What it CAN do is drift by
// somebody adding a hand-written second block, or by the generator being
// changed without the page, so this gate reads the shipped file and compares
// the two: every price in the markup must appear in the graph, and every price
// in the graph must appear in the markup.
//
// The same comparison now runs over the questions. `FAQPage` was forbidden here
// until 28.08.2026, because Google retired FAQ rich results for every site on
// 07.05.2026 and there was no SERP feature left to earn. The owner's decision of
// 28.08.2026 is that the SERP was never the reader this block is for: ChatGPT,
// Perplexity and Claude parse `FAQPage` to lift a question and its answer as a
// unit, whether or not Google draws an accordion. So the type is allowed, and it
// is held to the page the same way the prices are — every question in the graph
// is printed on the page, and every question printed on the page is in the graph.
//
// The prohibitions that remain matter as much as the assertions:
//
//   HowTo               Retired as well, and there are no steps on this page
//                       waiting to be declared. A schema type is not a reason
//                       to write copy.
//   Review              The quotes on this page are marked `placeholder: true`
//   AggregateRating     in src/content/extra.ts and the page says in its own
//                       words that they are examples written in-house. Marking
//                       them up as customer reviews turns an honest disclosure
//                       into a structured-data violation.

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { DIST, checker } from './lib.mjs'

const c = checker('G21')

const pages = (dir = DIST, prefix = '/') => {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name !== 'assets') out.push(...pages(path.join(dir, e.name), `${prefix}${e.name}/`))
    } else if (e.name === 'index.html') out.push({ url: prefix, file: path.join(dir, e.name) })
  }
  return out
}

const FORBIDDEN = ['Review', 'AggregateRating', 'HowTo']

// The dictionaries author emphasis as <b> and hold word pairs together with
// &nbsp;. src/entry-static.tsx strips both before the text reaches the graph,
// so the markup must be read the same way before the two are compared.
const plain = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

for (const { url, file } of pages()) {
  const html = readFileSync(file, 'utf8')
  const at = (what) => `${url} ${what}`

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => m[1]
  )
  if (!c.ok(blocks.length === 1, at(`has ${blocks.length} JSON-LD blocks, it should have one`))) {
    continue
  }

  let data
  try {
    data = JSON.parse(blocks[0])
  } catch (err) {
    c.ok(false, at(`has JSON-LD that does not parse: ${err.message}`))
    continue
  }

  const graph = data['@graph'] || [data]
  const types = graph.map((n) => n['@type'])
  c.ok(data['@context'] === 'https://schema.org', at('JSON-LD has no schema.org @context'))

  // Everything the site publishes says who publishes it.
  for (const wanted of ['Organization', 'WebSite']) {
    c.ok(types.includes(wanted), at(`JSON-LD has no ${wanted} node (it has ${types.join(', ')})`))
  }

  const flat = JSON.stringify(data)
  for (const banned of FORBIDDEN) {
    c.ok(!new RegExp(`"@type"\\s*:\\s*"${banned}"`).test(flat), at(`declares ${banned}, which it must not`))
  }

  // Prices are described where prices are printed, and nowhere else. The
  // supporting pages talk about the product; only the home page publishes the
  // catalogue, and an Offer on a page with no price is a claim with no source.
  const onPage = [...html.matchAll(/data-plan-name="([^"]+)"[^>]*data-plan-price="([^"]*)"/g)].map(
    (m) => ({ name: m[1], price: m[2] })
  )
  const app = graph.find((n) => n['@type'] === 'SoftwareApplication') || {}
  const offers = app.offers || []

  // ---- the questions, in both directions ----------------------------------
  // Chapter 05 prints its questions with data-faq-q; the FAQPage node declares
  // them. A question in one and not the other is the drift this gate exists for,
  // and a page with neither is a supporting page, which is allowed to have none.
  const askedOnPage = [...html.matchAll(/data-faq-q="([^"]*)"/g)].map((m) => plain(m[1]))
  const faq = graph.find((n) => n['@type'] === 'FAQPage')
  const declared = (faq?.mainEntity || []).map((q) => plain(q.name || ''))

  c.ok(
    Boolean(faq) === askedOnPage.length > 0,
    at(
      faq
        ? 'declares a FAQPage while printing no questions'
        : `prints ${askedOnPage.length} questions and declares no FAQPage`
    )
  )

  for (const question of declared) {
    c.ok(
      askedOnPage.includes(question),
      at(`declares a question the page does not print: "${question}"`)
    )
  }
  for (const question of askedOnPage) {
    c.ok(
      declared.includes(question),
      at(`prints a question no FAQPage declares: "${question}"`)
    )
  }
  // An Answer with no text is a Question the engine cannot lift.
  for (const q of faq?.mainEntity || []) {
    c.ok(
      Boolean(q.acceptedAnswer?.text?.trim()),
      at(`declares "${q.name}" with no answer text`)
    )
  }

  if (onPage.length === 0) {
    c.ok(
      offers.length === 0,
      at(`declares ${offers.length} offers but prints no prices`)
    )
    // A supporting page is a page in its own right and sits under the home page.
    for (const wanted of ['WebPage', 'BreadcrumbList']) {
      c.ok(types.includes(wanted), at(`JSON-LD has no ${wanted} node (it has ${types.join(', ')})`))
    }
    c.note(`${url} ${types.join(', ')}; no catalogue, no offers`)
    continue
  }

  c.ok(types.includes('SoftwareApplication'), at('prints a catalogue but declares no SoftwareApplication'))
  c.ok(Array.isArray(offers) && offers.length > 0, at('SoftwareApplication carries no offers'))

  const numeric = (s) => (s.match(/[\d,]+/) || [''])[0].replace(/,/g, '')

  for (const offer of offers) {
    const row = onPage.find((r) => r.name === offer.name)
    if (!c.ok(Boolean(row), at(`offers a plan "${offer.name}" that is not on the page`))) continue
    const printed = row.price.includes('ללא עלות') ? '0' : numeric(row.price)
    c.ok(
      String(offer.price) === printed,
      at(`offers ${offer.name} at ${offer.price} while the page prints ${row.price}`)
    )
    // Israel is billed in shekels and everywhere else in dollars: two published
    // catalogues in NIR-APP's 0184 migration, not one converted at a rate. The
    // currency a document declares must be the one its own dictionary prints.
    const currency = /\/en\//.test(url) ? 'USD' : 'ILS'
    c.ok(
      offer.priceCurrency === currency,
      at(`offers ${offer.name} in ${offer.priceCurrency}, not ${currency}`)
    )
  }

  // A plan with a printed figure and no offer would be a silent omission.
  for (const row of onPage) {
    const hasFigure = /\d/.test(row.price)
    if (!hasFigure && !row.price.includes('ללא עלות')) continue
    c.ok(
      offers.some((o) => o.name === row.name),
      at(`prints a price for "${row.name}" (${row.price}) that no offer declares`)
    )
  }

  c.note(
    `${url} ${types.join(', ')}; ${offers.length} offers ` +
      `(${offers.map((o) => `${o.name} ${o.price}`).join(', ')}); ` +
      `${declared.length} questions`
  )
}

c.report()
