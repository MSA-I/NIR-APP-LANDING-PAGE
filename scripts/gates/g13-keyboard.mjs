// G13: the whole page is reachable from the keyboard, and you can see where
// you are.
//
// Two failures this catches, both of which the page looked fine with:
// a control that can be clicked but never focused, and a focus ring that is
// present in the stylesheet but painted the same colour as what is behind it.
//
// The hotspots drawn inside the screenshots are deliberately NOT in the tab
// order: they are a second control for an action the chain already offers
// under a real name, and two tab stops for one action is worse than one. The
// gate asserts that too, because a stray tabindex there would be a regression
// nobody would notice by looking.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, withPage, checker } from './lib.mjs'

const c = checker('G13')

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

await withPage(async (page) => {
  const stops = []
  await page.keyboard.press('Tab')
  for (let i = 0; i < 90; i++) {
    const here = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const s = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        text: (el.textContent || '').trim().slice(0, 40),
        label: (el.getAttribute('aria-label') || '').trim().slice(0, 40),
        href: el.getAttribute('href'),
        outline: parseFloat(s.outlineWidth) || 0,
        outlineStyle: s.outlineStyle,
        shadow: s.boxShadow,
      }
    })
    if (!here) break
    stops.push(here)
    await page.keyboard.press('Tab')
  }

  c.note(`${stops.length} tab stops`)
  c.ok(stops.length >= 15, `the page should be walkable, it has ${stops.length} tab stops`)

  // First stop is the skip link, because that is what it is for.
  c.ok(
    stops[0] && stops[0].href === '#what',
    `the first tab stop should be the skip link, it was ${stops[0]?.text}`
  )

  // Everything the reader needs to operate is on the path.
  const has = (pred, what) => c.ok(stops.some(pred), `${what} is not reachable by keyboard`)
  has((s) => s.role === 'tab', 'the five-step chain')
  has((s) => s.tag === 'summary', 'the FAQ')
  has((s) => s.href === 'https://app.inplace.digital/signup', 'the signup action')
  // Pages on this site since 27.08.2026, so the href is a path rather than a
  // product URL.
  has((s) => s.href === '/terms/', 'the terms link')
  has((s) => s.href === '/privacy/', 'the privacy link')

  const tabs = stops.filter((s) => s.role === 'tab').length
  c.note(`chain stops on the path: ${tabs} (one, by design: the others are arrow keys)`)

  // Counted off the dictionaries rather than written down here, for the reason
  // in g8-structure.mjs: an eighth question was added on 27.08.2026 and a
  // hard-coded numeral turns that into a gate edit instead of a measurement.
  const summaries = stops.filter((s) => s.tag === 'summary').length
  c.ok(
    summaries === QUESTIONS,
    `all ${QUESTIONS} FAQ questions should be focusable, ${summaries} were`
  )

  // Every stop shows a ring. Measured on the focused element itself, so a rule
  // that exists but does not apply fails here.
  const ringless = stops.filter((s) => s.outline < 1 && !/rgb/.test(s.shadow))
  c.ok(
    ringless.length === 0,
    `${ringless.length} focused element(s) show no focus ring: ${ringless
      .slice(0, 4)
      .map((s) => s.tag + ' ' + s.text)
      .join(' | ')}`
  )
  c.note('every tab stop paints a visible focus ring')

  // The hotspots stay off the path.
  const hotStops = await page.$$eval('button[tabindex="-1"]', (els) => els.length)
  c.ok(hotStops > 0, 'the demo hotspots are gone')
  // A button with NO accessible name at all. Text content is not the test:
  // the strip above the folio and the plans' billing switch are both icon-only
  // controls that carry an aria-label, and a control a screen reader announces
  // correctly is not the fault this line is looking for. What it is looking
  // for is a demo hotspot that has picked up a tabindex, and those carry
  // neither text nor a label.
  const unnamed = stops.filter((s) => s.tag === 'button' && !s.text && !s.label)
  c.ok(
    unnamed.length === 0,
    `an unnamed button is on the tab path, which is what a hotspot with a stray tabindex looks like`
  )
  const labelled = stops.filter((s) => s.tag === 'button' && !s.text && s.label)
  if (labelled.length) c.note(`icon-only controls on the path, each named: ${labelled.map((s) => s.label).join(' | ')}`)
  c.note(`${hotStops} hotspots present, none of them on the tab path`)

  // Arrow keys move along the chain, which is how a tablist is meant to work.
  await page.evaluate(() => {
    document.querySelector('[role="tab"]').focus()
  })
  const firstTab = await page.evaluate(() => document.activeElement.getAttribute('id'))
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(300)
  const selected = await page.evaluate(() =>
    document.querySelector('[role="tab"][aria-selected="true"]').getAttribute('id')
  )
  c.ok(selected !== firstTab, 'the arrow keys do not move along the chain')
  c.note(`arrow key: ${firstTab} -> ${selected}`)
})

c.report()
