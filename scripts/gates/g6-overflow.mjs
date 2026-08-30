// G6: no horizontal overflow at 390, 768, 1024 and 1440 CSS pixels.
//
// Checked at several scroll positions, not just at the top: the peak scatters
// cards sideways and a pinned stage only exists part way down the page, so a
// top-of-page measurement would miss the one act that can actually cause this.
//
// AND ONE VERTICAL CASE, added 30.08.2026 with the real quotes: text that runs
// past the bottom of a voice card. It is here because it is the same failure
// wearing a different axis, and because it is the one this page cannot show
// you: the cards carry a notched `clip-path`, so an overflowing quote is not a
// scrollbar or a ragged edge, it is two missing lines and a sentence that ends
// mid-clause looking exactly as deliberate as the rest of the design.
//
// The card's height is measured from its own contents at runtime (see
// src/components/Voices.tsx), so this asserts the measure, not a constant, and
// it asserts it in both locales: the English translations run longer than the
// Hebrew they come from, and only one of the two is ever looked at by eye.

import { withPage, checker } from './lib.mjs'

const c = checker('G6')
const WIDTHS = [390, 768, 1024, 1440]
const STOPS = [0, 0.18, 0.34, 0.5, 0.62, 0.74, 0.88, 1]
// 320 is in here and not in WIDTHS above because it is the width that breaks
// the cards: the phone card is as wide as the screen allows, so the narrowest
// screen sets the longest quote in the fewest characters per line.
const CARD_WIDTHS = [320, 390, 900, 1440]

for (const width of WIDTHS) {
  await withPage(
    async (page) => {
      const worst = await page.evaluate(async (stops) => {
        const doc = document.documentElement
        const max = doc.scrollHeight - innerHeight
        let worst = { over: 0, at: 0, culprit: null }
        for (const s of stops) {
          scrollTo(0, Math.round(max * s))
          for (let i = 0, last = -1; i < 40 && last !== scrollY; i++) {
            last = scrollY
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          }
          const over = doc.scrollWidth - doc.clientWidth
          if (over > worst.over) {
            // Name the widest offender so a failure is actionable.
            let culprit = null
            let widest = 0
            for (const el of document.querySelectorAll('body *')) {
              const r = el.getBoundingClientRect()
              const past = Math.max(r.right - doc.clientWidth, -r.left)
              if (past > widest && r.width > 4 && r.height > 4) {
                widest = past
                culprit =
                  el.tagName.toLowerCase() +
                  (el.className && typeof el.className === 'string'
                    ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
                    : '')
              }
            }
            worst = { over, at: s, culprit }
          }
        }
        scrollTo(0, 0)
        return worst
      }, STOPS)

      c.ok(
        worst.over <= 1,
        `${width}px: ${worst.over}px of horizontal overflow at ${(worst.at * 100).toFixed(0)}% scroll (${worst.culprit})`
      )
      if (worst.over <= 1) c.note(`${width}px: clean at all ${STOPS.length} scroll positions`)
    },
    { viewport: { width, height: width < 500 ? 844 : 900 } }
  )
}

for (const path of ['/', '/en/']) {
  for (const width of CARD_WIDTHS) {
    await withPage(
      async (page) => {
        // The card transitions `all`, so a height read in the frame after a
        // style change is a height it is animating away from.
        await page.addStyleTag({ content: '*{transition:none!important}' })
        await page.evaluate(() => document.querySelector('#voices')?.scrollIntoView())
        await page.waitForTimeout(250)
        const cards = await page.$$eval('.voice-card', (els) =>
          els.map((el) => {
            const had = el.style.blockSize
            el.style.blockSize = 'auto'
            // offsetHeight, not the bounding rect: the cards are rotated and
            // the rect returns the box around the rotation.
            const need = el.offsetHeight
            el.style.blockSize = had
            return {
              have: el.offsetHeight,
              need,
              by: el
                .querySelector('.voice-card__by')
                .innerText.replace(/\s+/g, ' ')
                .trim()
                .slice(0, 30),
            }
          })
        )
        const tag = `${path} at ${width}px`
        c.ok(cards.length > 0, `${tag}: no voice cards on the page at all`)
        const cut = cards.filter((v) => v.need > v.have + 1)
        c.ok(
          cut.length === 0,
          `${tag}: ${cut.length} quote(s) clipped by the card: ` +
            cut.map((v) => `${v.by} needs ${v.need}px, has ${v.have}px`).join('; ')
        )
        if (!cut.length) {
          const slack = Math.min(...cards.map((v) => v.have - v.need))
          c.note(`${tag}: ${cards.length} cards fit, tightest by ${slack}px`)
        }
      },
      { viewport: { width, height: width < 500 ? 844 : 900 }, path }
    )
  }
}

c.report()
