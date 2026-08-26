// G5: the act score obeys the plan and the live-surface grammar.
//
// Measured from the rendered page, not from the score table in a comment. The
// comment is the intention; the DOM is what shipped.

import { withPage, checker } from './lib.mjs'

const c = checker('G5')

// The family an act belongs to is its dominant device, which is what the
// variety law counts. A pinned stage that also holds a counter is still a pin.
function familyOf(act) {
  if (act.device === 'scrub') return 'scrub'
  if (act.device === 'pin') return 'pin'
  if (act.device === 'pan') return 'pan'
  if (act.hasCount) return 'count'
  if (act.hasReveal) return 'reveal'
  if (act.hasPointer) return 'pointer'
  return 'flow'
}

await withPage(async (page) => {
  const data = await page.evaluate(() => {
    const acts = [...document.querySelectorAll('[data-sc-act]')].map((el) => ({
      device: el.getAttribute('data-sc-act'),
      span: parseFloat(el.getAttribute('data-sc-span')) || 0,
      id: el.id || null,
      station: el.getAttribute('data-station') || null,
      ground: el.getAttribute('data-ground') || 'canvas',
      height: el.getBoundingClientRect().height,
      hasCount: !!el.querySelector('[data-sc-count]'),
      hasReveal: !!el.querySelector('[data-sc-reveal]'),
      hasPointer: !!el.querySelector('[data-sc-tilt],[data-sc-magnet],[data-sc-spotlight]'),
      hasDrift: el.hasAttribute('data-sc-drift'),
    }))
    return {
      acts,
      docHeight: document.documentElement.scrollHeight,
      vh: innerHeight,
    }
  })

  const families = data.acts.map(familyOf)
  const vhTotal = data.docHeight / data.vh

  c.note(`acts: ${data.acts.map((a, i) => `${families[i]}${a.span ? '@' + a.span : ''}`).join(' ')}`)
  c.note(`total length: ${vhTotal.toFixed(2)} viewport-heights`)

  // ---- the grammar's own bans ---------------------------------------------
  c.ok(!families.includes('scrub'), 'the live-surface grammar bans scrub; the page has a scrub act')
  c.ok(!families.includes('pan'), 'the page has a pan act, which is not in the planned score')
  c.ok(
    !data.acts.some((a) => a.hasDrift),
    'an act carries data-sc-drift; this page paints hard grounds per scene instead'
  )
  // ---- the variety law -----------------------------------------------------
  const distinct = new Set(families)
  c.ok(distinct.size >= 4, `only ${distinct.size} device families (${[...distinct]}), four is the floor`)

  const repeats = []
  for (let i = 1; i < families.length; i++) {
    if (families[i] === families[i - 1]) repeats.push(`${i - 1}->${i} both ${families[i]}`)
  }
  c.ok(repeats.length === 0, `same device family twice in a row: ${repeats.join(', ')}`)

  // ---- length --------------------------------------------------------------
  c.ok(vhTotal >= 8 && vhTotal <= 14, `page is ${vhTotal.toFixed(2)}vh, the budget is 8 to 14`)
  c.ok(
    !(vhTotal >= 13.6 && vhTotal <= 13.8),
    `page length ${vhTotal.toFixed(2)}vh lands in the 13.6-13.8 fingerprint band every prior build hit`
  )

  // ---- the peak ------------------------------------------------------------
  const pinned = data.acts.filter((a) => a.span > 0)
  const peak = pinned.reduce((a, b) => (b.span > a.span ? b : a), pinned[0])
  const runnerUp = pinned
    .filter((a) => a !== peak)
    .reduce((a, b) => (b.span > a.span ? b : a), { span: 0 })
  c.ok(peak && peak.id === 'decision', `the longest act is "${peak?.id}", expected the peak "decision"`)
  c.ok(
    peak && peak.span >= runnerUp.span * 1.6,
    `the peak is ${peak?.span}vh against a runner-up of ${runnerUp.span}vh, which is not a visible margin`
  )
  c.note(`peak "${peak?.id}" at ${peak?.span}vh against ${runnerUp.span}vh`)

  // ---- scenes, not one place ----------------------------------------------
  const grounds = new Set(data.acts.map((a) => a.ground))
  c.ok(grounds.size >= 3, `only ${grounds.size} distinct grounds; the interview asked for distinct scenes`)
  c.note(`grounds in play: ${[...grounds].join(', ')}`)

  // ---- every station has an anchor ----------------------------------------
  const stationIds = await page.evaluate(() =>
    [...document.querySelectorAll('[data-stop]')].map((el) => el.getAttribute('data-stop'))
  )
  const anchored = new Set(data.acts.map((a) => a.station).filter(Boolean))
  const orphans = stationIds.filter((id) => !anchored.has(id))
  c.ok(orphans.length === 0, `stations on the rail with no act to anchor them: ${orphans.join(', ')}`)
  c.note(`${stationIds.length} stations, all anchored to an act`)
})

c.report()
