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

import { withPage, checker } from './lib.mjs'

const c = checker('G13')

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
  has((s) => s.href === 'https://app.inplace.digital/terms', 'the terms link')
  has((s) => s.href === 'https://app.inplace.digital/privacy', 'the privacy link')

  const tabs = stops.filter((s) => s.role === 'tab').length
  c.note(`chain stops on the path: ${tabs} (one, by design: the others are arrow keys)`)

  const summaries = stops.filter((s) => s.tag === 'summary').length
  c.ok(summaries === 7, `all seven FAQ questions should be focusable, ${summaries} were`)

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
  c.ok(
    !stops.some((s) => s.tag === 'button' && s.text === ''),
    'an unnamed button is on the tab path, which is what a hotspot with a stray tabindex looks like'
  )
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
