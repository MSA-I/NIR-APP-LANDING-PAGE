// G11: the full keyboard path works.
//
// The page's audience includes people who never touch a pointer, and the CTA is
// a real form, so this is not a formality. Tab from the top and check that the
// skip link, every station, the ledger toggle, the trial field and the CTA are
// all reachable, in reading order, each with a focus ring that is actually
// visible against the ground it sits on.

import { withPage, checker, contrast } from './lib.mjs'

const c = checker('G11')

await withPage(async (page) => {
  const seen = []
  await page.evaluate(() => document.body.focus())

  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab')
    const step = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()

      // Resolve any colour string through a painted pixel.
      const cv = document.createElement('canvas')
      cv.width = cv.height = 1
      const g = cv.getContext('2d', { willReadFrequently: true })
      const paint = (s) => {
        g.clearRect(0, 0, 1, 1)
        g.fillStyle = s
        g.fillRect(0, 0, 1, 1)
        const d = g.getImageData(0, 0, 1, 1).data
        return [d[0], d[1], d[2], d[3] / 255]
      }
      // The ground the ring sits ON. With a positive outline-offset the ring is
      // drawn outside the element's own box, so the element's own fill is not
      // what it has to beat: start the walk at the parent. Measuring against
      // the fill is how an invisible ring around a solid button reports as
      // passing.
      const offset = parseFloat(cs.outlineOffset) || 0
      let ground = [255, 255, 255]
      for (let n = offset > 0 ? el.parentElement : el; n; n = n.parentElement) {
        const p = paint(getComputedStyle(n).backgroundColor)
        if (p[3] >= 0.999) {
          ground = p.slice(0, 3)
          break
        }
      }
      return {
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '',
        label: (el.getAttribute('aria-label') || el.textContent || el.placeholder || '').trim().slice(0, 30),
        href: el.getAttribute('href'),
        outlineWidth: parseFloat(cs.outlineWidth) || 0,
        outlineStyle: cs.outlineStyle,
        ring: paint(cs.outlineColor).slice(0, 3),
        ground,
        onScreen: r.width > 0 && r.height > 0,
        hitH: Math.round(r.height),
      }
    })
    if (!step) break
    seen.push(step)
    if (seen.length > 2 && step.cls === seen[0].cls && step.label === seen[0].label) break
  }

  c.note(`${seen.length} elements in the tab order`)

  // ---- the skip link is first ----------------------------------------------
  c.ok(seen[0] && seen[0].cls === 'skip', `the first tab stop is "${seen[0]?.cls}", expected the skip link`)

  // ---- everything essential is reachable -----------------------------------
  const has = (pred, what) => c.ok(seen.some(pred), `not reachable by keyboard: ${what}`)
  has((s) => s.cls === 'rail__mark', 'the brand mark')
  has((s) => s.cls === 'rail__stop', 'the station rail')
  has((s) => s.cls === 'ledger-toggle', 'the ledger toggle')
  has((s) => s.tag === 'input', 'the trial email field')
  has((s) => s.cls === 'btn' && s.tag === 'button', 'the trial submit button')
  has((s) => s.cls === 'btn' && s.tag === 'a', 'the CTA link in the cold open')

  const stops = seen.filter((s) => s.cls === 'rail__stop').length
  c.ok(stops === 8, `${stops} station links in the tab order, expected 8`)

  // ---- every stop shows a ring, and the ring is visible on its ground ------
  const noRing = seen.filter((s) => s.outlineWidth < 1 || s.outlineStyle === 'none')
  for (const s of noRing) c.ok(false, `no focus ring on ${s.tag}.${s.cls} "${s.label}"`)

  let worstRing = { ratio: Infinity }
  for (const s of seen) {
    if (s.outlineWidth < 1) continue
    const ratio = contrast(s.ring, s.ground)
    if (ratio < worstRing.ratio) worstRing = { ...s, ratio }
    c.ok(
      ratio >= 3,
      `focus ring on ${s.tag}.${s.cls} measures ${ratio.toFixed(2)}:1 against its ground, needs 3:1`
    )
  }
  c.note(`worst focus ring: ${worstRing.ratio.toFixed(2)}:1 on ${worstRing.tag}.${worstRing.cls}`)

  // ---- tap targets ---------------------------------------------------------
  const small = seen.filter((s) => s.onScreen && s.hitH > 0 && s.hitH < 24)
  for (const s of small) c.ok(false, `tap target only ${s.hitH}px tall: ${s.tag}.${s.cls} "${s.label}"`)

  // ---- the ledger opens and closes from the keyboard -----------------------
  const toggle = await page.evaluate(async () => {
    const btn = document.querySelector('[data-ledger-toggle]')
    btn.focus()
    btn.click()
    const open = { hidden: document.querySelector('[data-ledger]').hidden, expanded: btn.getAttribute('aria-expanded') }
    // Escape must close it and return focus.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await new Promise((r) => setTimeout(r, 20))
    return {
      open,
      closed: document.querySelector('[data-ledger]').hidden,
      expandedAfter: btn.getAttribute('aria-expanded'),
      focusReturned: document.activeElement === btn,
    }
  })
  c.ok(toggle.open.hidden === false, 'the ledger did not open on click')
  c.ok(toggle.open.expanded === 'true', 'aria-expanded did not become true when the ledger opened')
  c.ok(toggle.closed === true, 'Escape did not close the ledger')
  c.ok(toggle.expandedAfter === 'false', 'aria-expanded did not return to false')
  c.ok(toggle.focusReturned, 'focus was not returned to the toggle after Escape')
  c.note('the ledger opens, reports its state, closes on Escape and returns focus')
})

c.report()
