// G15: nothing on this page pretends to be proof it is not.
//
// Two sections shipped on 26.08.2026 carry content that stands in for content
// that does not exist yet: five marks where the first customers' logos will go,
// and five quotes written in-house as examples of what the product does. The
// owner asked for both, and asked for placeholders in the first case in as
// many words.
//
// The risk is not that they are placeholders. The risk is that the sentence
// SAYING they are placeholders gets tidied away in a later design pass, and
// five invented quotes attributed to five roles at five kinds of business
// silently become testimonials. This gate is what stops that being a quiet
// change: every block flagged `placeholder: true` in src/content/extra.ts must
// render a section on the page carrying its disclosure, in the visible text,
// at a contrast the reader can actually read it at.
//
// It also asserts the quotes carry no personal name and no company name, which
// is the line between "here is the kind of thing the product does" and
// "somebody said this".

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, withPage, checker } from './lib.mjs'

const c = checker('G15')

const src = await readFile(path.join(ROOT, 'src', 'content', 'extra.ts'), 'utf8')
const extra = (
  await import(
    'data:text/javascript;base64,' +
      Buffer.from(src.replace(/^export default/m, 'export default'), 'utf8').toString('base64')
  )
).default

const flagged = Object.entries(extra).filter(([, v]) => v && v.placeholder === true)
c.ok(flagged.length >= 2, `expected the logo wall and the quotes to be flagged, found ${flagged.length}`)
for (const [name] of flagged) c.note(`flagged as placeholder: ${name}`)

for (const [name, block] of flagged) {
  c.ok(
    typeof block.disclosure === 'string' && block.disclosure.length > 20,
    `"${name}" is flagged placeholder but carries no disclosure sentence`
  )
}

await withPage(async (page) => {
  const marked = await page.$$eval('[data-placeholder]', (els) =>
    els.map((el) => ({
      key: el.getAttribute('data-placeholder'),
      text: el.innerText.replace(/\s+/g, ' ').trim(),
    }))
  )
  c.ok(
    marked.length === flagged.length,
    `${flagged.length} block(s) flagged in the content, ${marked.length} marked on the page`
  )

  for (const [name, block] of flagged) {
    const hit = marked.find((m) => m.key === name)
    c.ok(hit, `no section on the page carries data-placeholder="${name}"`)
    if (!hit) continue
    // The disclosure is compared as words, not as a string: the copy contains
    // a non-breaking space or two and innerText normalises them.
    const want = block.disclosure.replace(/\s+/g, ' ').trim()
    c.ok(
      hit.text.includes(want),
      `the "${name}" section does not show its disclosure on the page`
    )
    c.note(`${name}: disclosure rendered, ${hit.text.length} chars of visible text`)
  }

  // A quote attributed to nobody in particular is an example. A quote
  // attributed to a person or a company is a testimonial, and this product has
  // none to show.
  const attributions = await page.$$eval('#voices .voice__by', (els) =>
    els.map((e) => e.innerText.replace(/\s+/g, ' ').trim())
  )
  c.ok(attributions.length === 5, `expected five quotes, found ${attributions.length}`)
  // Anything that reads as a proper name: a quoted company, a Ltd, or two
  // capitalised Latin words. The attributions are all role + kind of business.
  const named = attributions.filter((a) => /בע"מ|בע״מ|"[^"]+"|[A-Z][a-z]+\s+[A-Z]/.test(a))
  c.ok(
    named.length === 0,
    `a quote is attributed to a named party, which this page cannot support: ${named.join(' | ')}`
  )
  c.note(`five quotes, attributed by role and trade only: ${attributions.join(' | ')}`)

  // And the disclosure has to be readable, not a 3% grey under the fold.
  const readable = await page.$eval('#voices .voices__note', (el) => {
    const cs = getComputedStyle(el)
    return { color: cs.color, size: parseFloat(cs.fontSize), display: cs.display }
  })
  c.ok(readable.size >= 13, `the quotes' disclosure is set at ${readable.size}px, too small to count`)
  c.ok(readable.display !== 'none', 'the quotes’ disclosure is not displayed')
  c.note(`disclosure: ${readable.size}px, ${readable.color}`)
})

c.report()
