// G14: build 3's own behaviour — the tabs, the apparatus, the film, the folio,
// the keyboard path and reduced motion.
//
// The build-1 and build-2 gates for these things are kept, but they assert
// against markup this page does not have (a station rail, a worldflight map, a
// pointer-borne document). This gate is the same discipline pointed at the
// page that actually exists, and every assertion here is measured on the
// running page rather than read off the source.

import { withPage, checker, scrollTo } from './lib.mjs'

const c = checker('G14')

// ---------------------------------------------------------------- structure --
await withPage(async (page, { errors }) => {
  const shape = await page.evaluate(() => ({
    chapters: [...document.querySelectorAll('[data-folio]')].map((s) => s.getAttribute('data-folio')),
    acts: document.querySelectorAll('[data-sc-act]').length,
    scrubs: document.querySelectorAll('video[data-sc-scrub]').length,
    tabs: document.querySelectorAll('.chain__step').length,
    panels: document.querySelectorAll('.panel').length,
    shown: [...document.querySelectorAll('.panel')].filter((p) => !p.hidden).length,
    figures: [...document.querySelectorAll('.fig[data-note]')].map((f) => f.dataset.note),
    notes: [...document.querySelectorAll('.note')].map((n) => n.id.replace('note-', '')),
    h1: document.querySelectorAll('h1').length,
    faq: document.querySelectorAll('.faq__item').length,
    faqOpenNoJs: document.querySelectorAll('.faq__item[open]').length,
    footLinks: [...document.querySelectorAll('.sitefoot__col a')].map((a) => a.getAttribute('href')),
    planRows: document.querySelectorAll('.plans tbody tr').length,
    // Prices are published by owner instruction, 26.08.2026, reversing #267
    // for this page. The guard is now positive: the amounts on the page must be
    // exactly the ILS launch catalogue seeded in migration 0184. A hand-edited
    // figure fails here rather than shipping. Read from the price cells and the
    // annual-price note, not by scanning for a currency symbol: the note lists
    // three amounts behind one symbol.
    planAmounts: [
      ...[...document.querySelectorAll('.plans__price')].map((el) => el.textContent),
      document.querySelector('.plans__prices')?.textContent || '',
    ].join(' ').match(/[\d][\d,]*/g)?.map((a) => a.replace(/,/g, '')) || [],
    vhUnits: +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
  }))

  c.note(`${shape.chapters.length} chapters, ${shape.vhUnits}vh of scroll, ${shape.acts} act`)

  c.ok(shape.chapters.length === 7, `expected a title page and six chapters, found ${shape.chapters.length}`)
  c.ok(shape.h1 === 1, `expected exactly one <h1>, found ${shape.h1}`)

  // The grammar allows scrub in ONE chapter. More than one act, or a scrub
  // anywhere else, and this has drifted back into a filmic page.
  c.ok(shape.acts === 1, `chaptered editorial allows one scrub chapter; found ${shape.acts} acts`)
  c.ok(shape.scrubs === 1, `expected one scrub clip, found ${shape.scrubs}`)

  // Tabs
  c.ok(shape.tabs === 5 && shape.panels === 5, `expected 5 tabs and 5 panels, found ${shape.tabs}/${shape.panels}`)
  c.ok(shape.shown === 1, `exactly one panel may be visible at rest, found ${shape.shown}`)

  // Plans
  c.ok(shape.planRows === 5, `expected five plan rows, found ${shape.planRows}`)
  // 0184_launch_plan_and_price_catalogue.sql:234-241, catalogue `launch-il`.
  const CATALOGUE = ['69', '249', '449', '690', '2490', '4490']
  const stray = shape.planAmounts.filter((a) => !CATALOGUE.includes(a))
  const missing = CATALOGUE.filter((a) => !shape.planAmounts.includes(a))
  c.ok(stray.length === 0, `amounts on the page that are not in the launch catalogue: ${stray.join(', ')}`)
  c.ok(missing.length === 0, `catalogue amounts missing from the page: ${missing.join(', ')}`)
  c.note(`plan amounts published: ${shape.planAmounts.join(', ')}`)

  // FAQ and footer
  c.ok(shape.faq >= 5, `expected at least five FAQ entries, found ${shape.faq}`)
  c.ok(shape.faqOpenNoJs === 1, `exactly one FAQ entry should be open at rest, found ${shape.faqOpenNoJs}`)
  const badHrefs = shape.footLinks.filter((h) => !h || h === '#' || /example\.com|TODO/i.test(h))
  c.ok(badHrefs.length === 0, `footer links with no destination: ${badHrefs.join(', ')}`)
  c.note(`${shape.faq} FAQ entries, ${shape.footLinks.length} footer links`)

  // The apparatus is only honest if it is complete in both directions: every
  // figure has a source, and no source is listed that nothing on the page cites.
  const orphanFigs = shape.figures.filter((f) => !shape.notes.includes(f))
  const orphanNotes = shape.notes.filter((n) => !shape.figures.includes(n))
  c.ok(orphanFigs.length === 0, `figures with no source: ${orphanFigs.join(', ')}`)
  c.ok(orphanNotes.length === 0, `sources nothing cites: ${orphanNotes.join(', ')}`)
  c.note(`${shape.figures.length} cited figures against ${shape.notes.length} sources`)

  // ------------------------------------------------------------ tab switching
  const swap = await page.evaluate(async () => {
    const tabs = [...document.querySelectorAll('.chain__step')]
    const seen = []
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].click()
      await new Promise((r) => requestAnimationFrame(r))
      const open = [...document.querySelectorAll('.panel')].filter((p) => !p.hidden)
      seen.push({
        i,
        open: open.length,
        matches: open[0] && open[0].id === 'panel-' + i,
        src: open[0] ? open[0].querySelector('img').getAttribute('src') : null,
        selected: tabs[i].getAttribute('aria-selected'),
      })
    }
    document.querySelector('.chain__step').click()
    return seen
  })
  const badSwap = swap.filter((s) => s.open !== 1 || !s.matches || s.selected !== 'true')
  c.ok(badSwap.length === 0, `tabs that did not open their own panel: ${badSwap.map((s) => s.i).join(', ')}`)
  const srcs = new Set(swap.map((s) => s.src))
  c.ok(srcs.size === 5, `each step must show a different screen; found ${srcs.size} distinct images`)

  // ------------------------------------------------------------ the film runs
  // Not "a video element exists": the clip's currentTime has to actually move
  // with scroll, and the frames have to differ.
  await scrollTo(page, 0.14)
  await page.waitForTimeout(900)
  const t1 = await page.evaluate(() => document.querySelector('video[data-sc-scrub]').currentTime)
  await scrollTo(page, 0.36)
  await page.waitForTimeout(900)
  const t2 = await page.evaluate(() => document.querySelector('video[data-sc-scrub]').currentTime)
  c.ok(t2 - t1 > 3, `the clip advanced ${(t2 - t1).toFixed(2)}s across a fifth of the page; expected > 3s`)
  c.note(`clip scrubbed ${t1.toFixed(2)}s -> ${t2.toFixed(2)}s`)

  // ------------------------------------------------------------------ folio
  const folioAt = async (f) => {
    await scrollTo(page, f)
    await page.waitForTimeout(200)
    return page.evaluate(() => document.querySelector('[data-folio-out]').textContent)
  }
  const first = await folioAt(0)
  const last = await folioAt(1)
  c.ok(first !== last, `the folio never changed: "${first}" at the top and the bottom`)
  c.ok(/06/.test(last), `the folio should name the last chapter at the foot of the page, said "${last}"`)
  c.note(`folio: "${first}" -> "${last}"`)

  // ----------------------------------------------------------------- keyboard
  const kb = await page.evaluate(() => {
    const skip = document.querySelector('.skip')
    skip.focus()
    const focusedSkip = document.activeElement === skip
    const target = document.querySelector(skip.getAttribute('href'))
    const tabs = [...document.querySelectorAll('.chain__step')]
    const roving = tabs.filter((t) => t.tabIndex === 0).length
    return { focusedSkip, targetExists: !!target, roving, tabCount: tabs.length }
  })
  c.ok(kb.focusedSkip, 'the skip link cannot take focus')
  c.ok(kb.targetExists, 'the skip link points at nothing')
  c.ok(kb.roving === 1, `a tablist has exactly one tab stop; found ${kb.roving} of ${kb.tabCount}`)

  // Arrow keys move the selection in reading order (RTL: ArrowLeft advances).
  await page.evaluate(() => document.querySelector('.chain__step').focus())
  await page.keyboard.press('ArrowLeft')
  const afterArrow = await page.evaluate(() => document.activeElement.id)
  c.ok(afterArrow === 'tab-1', `ArrowLeft in RTL should advance to tab-1, focus went to "${afterArrow}"`)

  c.ok(errors.length === 0, `console/page errors: ${errors.slice(0, 3).join(' | ')}`)
})

// ----------------------------------------------------------- reduced motion --
await withPage(
  async (page) => {
    const rm = await page.evaluate(() => {
      const strip = document.querySelector('[data-apparatus]')
      const btn = document.querySelector('.btn')
      return {
        stripTransition: getComputedStyle(strip).transitionDuration,
        btnTransition: getComputedStyle(btn).transitionDuration,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      }
    })
    const none = (v) => /^(0s)(,\s*0s)*$/.test(v)
    c.ok(none(rm.stripTransition), `apparatus still transitions under reduced motion: ${rm.stripTransition}`)
    c.ok(none(rm.btnTransition), `buttons still transition under reduced motion: ${rm.btnTransition}`)
    c.ok(rm.scrollBehavior === 'auto', `smooth scrolling is still on under reduced motion: ${rm.scrollBehavior}`)

    // The film still has to be readable, not blank: the poster stands in for
    // the clip, so it must be present and painted.
    const poster = await page.evaluate(() => {
      const p = document.querySelector('.sc-stage__poster')
      return p ? { complete: p.complete, w: p.naturalWidth } : null
    })
    c.ok(poster && poster.complete && poster.w > 0, 'the film poster did not load; reduced-motion readers get an empty plate')
  },
  { reducedMotion: 'reduce' }
)

c.report()
