// G10: under prefers-reduced-motion the page is complete and static.
//
// Reduced motion means fewer and gentler, not zero: every act's content stays
// readable, the peak's sort lands settled instead of animating, and nothing is
// left stranded at zero opacity waiting for a scroll that will never move it.

import { withPage, checker, scrollTo } from './lib.mjs'

const c = checker('G10')

await withPage(
  async (page) => {
    // ---- nothing is stranded invisible --------------------------------------
    const invisible = await page.evaluate(() => {
      const out = []
      for (const el of document.querySelectorAll('[data-sc-cue], [data-sc-in], [data-sc-reveal]')) {
        const cs = getComputedStyle(el)
        const txt = (el.textContent || '').trim()
        if (!txt) continue
        if (parseFloat(cs.opacity) < 0.9) out.push({ t: txt.slice(0, 30), o: cs.opacity })
      }
      return out
    })
    for (const i of invisible) c.ok(false, `stranded at opacity ${i.o} under reduced motion: "${i.t}"`)
    c.note(`every cued element is at full opacity with reduced motion on`)

    // ---- the peak lands settled ---------------------------------------------
    const peak = await page.evaluate(() => {
      const docs = [...document.querySelectorAll('.doc')]
      const cs = docs.map((d) => getComputedStyle(d))
      return {
        n: docs.length,
        rotated: cs.filter((s) => s.rotate && s.rotate !== 'none' && s.rotate !== '0deg').length,
        translated: cs.filter((s) => s.translate && s.translate !== 'none' && !/^0px 0px/.test(s.translate)).length,
        matchesHidden: [...document.querySelectorAll('.doc__match')].filter(
          (m) => parseFloat(getComputedStyle(m).opacity) < 0.9
        ).length,
        overlapping: (() => {
          // A static grid must not stack cards on top of each other.
          const rects = docs.map((d) => d.getBoundingClientRect())
          let n = 0
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i]
              const b = rects[j]
              if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) n++
            }
          }
          return n
        })(),
      }
    })
    c.ok(peak.n >= 8, `the peak renders ${peak.n} documents, expected 8`)
    c.ok(peak.rotated === 0, `${peak.rotated} document(s) still rotated under reduced motion`)
    c.ok(peak.translated === 0, `${peak.translated} document(s) still translated under reduced motion`)
    c.ok(peak.matchesHidden === 0, `${peak.matchesHidden} match line(s) invisible under reduced motion`)
    c.ok(peak.overlapping === 0, `${peak.overlapping} pair(s) of documents overlap in the static layout`)
    c.note(`the peak renders as a static grid of ${peak.n} documents, none rotated, none overlapping`)

    // ---- the page is still navigable, and still tells the whole story ------
    const story = await page.evaluate(() => ({
      text: document.body.innerText.length,
      headings: document.querySelectorAll('h1, h2').length,
      rail: document.querySelectorAll('.rail__stop').length,
      trailFilled: getComputedStyle(document.querySelector('.rail__line'), '::after').height,
      tokenShown: getComputedStyle(document.querySelector('.token')).display,
    }))
    c.ok(story.text > 2500, `only ${story.text} characters of text with reduced motion on`)
    c.ok(story.headings >= 7, `only ${story.headings} headings render`)
    c.ok(story.rail === 8, `the rail lists ${story.rail} stations`)
    c.ok(story.tokenShown === 'none', 'the moving token is still shown under reduced motion')
    c.note(`${story.text} characters, ${story.headings} headings, ${story.rail} stations, token withdrawn`)

    // ---- and the ledger still fills as the reader travels -------------------
    await scrollTo(page, 1)
    const ledger = await page.evaluate(() =>
      Number(document.querySelector('[data-ledger-count]').textContent.trim())
    )
    c.ok(ledger === 8, `the ledger holds ${ledger} lines at the foot of the page under reduced motion`)
    c.note('the ledger still records the journey with motion off')
  },
  { reducedMotion: 'reduce' }
)

c.report()
