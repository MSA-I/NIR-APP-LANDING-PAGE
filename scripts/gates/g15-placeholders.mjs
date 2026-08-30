// G15: nothing on this page pretends to be proof it is not.
//
// TWO SECTIONS HAVE BEEN THROUGH THIS GATE AND BOTH HAVE LEFT IT.
// The logo wall was flagged `placeholder: true` for a few hours on 26.08.2026,
// until the owner supplied six real marks. The quotes were flagged from then
// until 30.08.2026, when he supplied five real responses with names, in
// NIR-APP-DOCS/תגובות אמיתיות.txt. Nothing in src/content/extra.ts is flagged
// today, and this gate is written so that is a legal state rather than a
// failure.
//
// WHAT IT STILL DOES, and why it was not deleted with the flag:
//
//   1. The machinery. Every block flagged `placeholder: true` must carry a
//      disclosure of its own and must render it, in visible text, at a size a
//      reader can actually read. That rule never depended on which block was
//      flagged, and it is the reason the next stand-in for content the product
//      does not have yet cannot reach the page in silence.
//   2. The count. The number of `[data-placeholder]` sections on the page must
//      equal the number of flagged blocks in the dictionary. When nothing is
//      flagged that is zero, which is how a flag dropped in the content
//      WITHOUT its marker being dropped in the component gets caught, and the
//      other way round.
//   3. The quotes are still counted and still read. Every one of them must
//      carry an attribution with a name and a trade in it, which is the
//      opposite of what this gate asserted for four days and the same idea:
//      the page has to be honest about what these are. Anonymous examples had
//      to say so; named responses have to be named.
//   4. The note above the rail is still measured for size and display. It is
//      no longer a disclaimer, but it is still the sentence that tells the
//      reader whose words those are, and a 3% grey under the fold would be no
//      better here than it was there.

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
c.note(
  flagged.length
    ? `flagged as placeholder: ${flagged.map(([n]) => n).join(', ')}`
    : 'nothing in the dictionary is flagged as a placeholder'
)

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

  // The quotes. The count is read off the dictionary, not written down here:
  // five became three and went back to five on 27.08.2026, and it is the
  // rendering that is being checked, not the number.
  const attributions = await page.$$eval('#voices .voice-card__by', (els) =>
    els.map((e) => ({
      name: (e.querySelector('b')?.innerText || '').replace(/\s+/g, ' ').trim(),
      full: e.innerText.replace(/\s+/g, ' ').trim(),
    }))
  )
  const expected = extra.testimonials.items.length
  c.ok(
    attributions.length === expected,
    `expected ${expected} quotes, found ${attributions.length}`
  )
  // A response with nobody's name on it and no trade beside it is back to
  // being an anonymous example, and an anonymous example needs the disclosure
  // this section no longer carries. Either both halves are there or the flag
  // belongs back in the dictionary.
  const bare = attributions.filter((a) => !a.name || a.full.length <= a.name.length + 1)
  c.ok(
    bare.length === 0,
    `a quote is attributed to a name with no trade, or to nobody: ${
      bare.map((a) => a.full || '(empty)').join(' | ') || '(empty)'
    }`
  )
  c.note(`${attributions.length} quotes, attributed: ${attributions.map((a) => a.full).join(' | ')}`)

  // And the note has to be readable, not a 3% grey under the fold.
  const readable = await page.$eval('#voices .voices__note', (el) => {
    const cs = getComputedStyle(el)
    return { color: cs.color, size: parseFloat(cs.fontSize), display: cs.display }
  })
  c.ok(readable.size >= 13, `the quotes' note is set at ${readable.size}px, too small to count`)
  c.ok(readable.display !== 'none', 'the quotes’ note is not displayed')
  c.note(`note: ${readable.size}px, ${readable.color}`)
})

c.report()
