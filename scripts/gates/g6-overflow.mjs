// G6: no horizontal overflow at 390, 768, 1024 and 1440 CSS pixels.
//
// Checked at several scroll positions, not just at the top: the peak scatters
// cards sideways and a pinned stage only exists part way down the page, so a
// top-of-page measurement would miss the one act that can actually cause this.

import { withPage, checker } from './lib.mjs'

const c = checker('G6')
const WIDTHS = [390, 768, 1024, 1440]
const STOPS = [0, 0.18, 0.34, 0.5, 0.62, 0.74, 0.88, 1]

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

c.report()
