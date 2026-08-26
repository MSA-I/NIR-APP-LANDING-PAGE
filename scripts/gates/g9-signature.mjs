// G9: the signature move works.
//
// "השקל בתנועה" is the one thing on this page that exists nowhere else, so it
// is the one thing most worth proving rather than asserting. Three claims:
//
//   1. the tracked amount MUTATES across the eight stations, and lands on the
//      figures the fixtures say it should
//   2. the ledger accumulates exactly one line per station passed
//   3. scrolling faster than the controls stamps a skip, and coming back
//      through slowly clears it

import { withPage, checker, scrollTo } from './lib.mjs'

const c = checker('G9')

const he = (await import('../../i18n/he.js')).default
const STATIONS = he.stations

await withPage(async (page) => {
  // ---- 1. the amount mutates ----------------------------------------------
  const seen = []
  for (let i = 0; i <= 60; i++) {
    await scrollTo(page, i / 60)
    const s = await page.evaluate(() => ({
      amount: document.querySelector('[data-status-amount]').textContent.trim(),
      token: document.querySelector('[data-token-amount]').textContent.trim(),
      ledger: document.querySelector('[data-ledger-count]').textContent.trim(),
      current: document.querySelector('.rail__stop[aria-current="true"]')?.dataset.stop || null,
      passed: [...document.querySelectorAll('.rail__stop[data-passed="1"]')].length,
    }))
    if (!seen.length || seen[seen.length - 1].amount !== s.amount) seen.push(s)
  }

  const amounts = seen.map((s) => s.amount)
  c.note(`amount sequence: ${amounts.join('  ->  ')}`)

  c.ok(amounts[0] === '—', `the tracked amount starts at "${amounts[0]}", expected the no-data dash`)
  c.ok(amounts.length >= 4, `the amount only took ${amounts.length} distinct values; it is a progress bar, not a biography`)

  // It must reach the order total, rise to the billed total, and come back.
  const nums = amounts.map((a) => Number(a.replace(/[^\d]/g, '')) || null)
  const order = 6384
  const billed = 7624
  c.ok(nums.includes(order), `the amount never reads ${order}`)
  c.ok(nums.includes(billed), `the amount never reads ${billed}; the invoice's ask is not shown on the rail`)
  const iBilled = nums.indexOf(billed)
  c.ok(
    iBilled > 0 && nums.slice(iBilled + 1).includes(order),
    'the amount rises to the invoice figure but never returns to the approved one'
  )
  c.ok(nums[nums.length - 1] === order, `the journey ends on ${nums[nums.length - 1]}, expected ${order}`)

  // ---- 2. the ledger accumulates ------------------------------------------
  await scrollTo(page, 1)
  const end = await page.evaluate(() => ({
    count: Number(document.querySelector('[data-ledger-count]').textContent.trim()),
    lines: [...document.querySelectorAll('[data-ledger-list] li')].map((li) => li.textContent.trim()),
    recap: [...document.querySelectorAll('[data-recap] li')].map((li) => li.textContent.trim()),
    passed: [...document.querySelectorAll('.rail__stop[data-passed="1"]')].length,
  }))
  c.ok(end.count === STATIONS.length, `ledger holds ${end.count} lines at the end, expected ${STATIONS.length}`)
  c.ok(end.passed === STATIONS.length, `${end.passed} stations marked passed at the end, expected ${STATIONS.length}`)
  c.ok(end.lines.length === end.count, 'the ledger badge and the ledger list disagree')
  c.ok(
    end.recap.length === end.count,
    `the closing recap shows ${end.recap.length} lines against a ledger of ${end.count}`
  )
  c.note(`ledger and closing recap both hold ${end.count} lines at the foot of the page`)

  // ---- 3. velocity stamps a skip, and it recovers -------------------------
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(120)

  // A single jump to the end is exactly the "money moving faster than the
  // controls" case the move exists to show.
  const flung = await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - innerHeight
    scrollTo(0, max)
    // Give the rAF loop enough frames to see the velocity and stamp.
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    }
    return {
      skipped: [...document.querySelectorAll('.rail__stop[data-skipped="1"]')].map((e) => e.dataset.stop),
      velocity: document.querySelector('[data-status-velocity]').textContent.trim(),
      skipLines: [...document.querySelectorAll('[data-ledger-list] li[data-kind="skip"]')].length,
    }
  })
  c.ok(flung.skipped.length > 0, 'flinging the page to the end stamped no skip; the velocity rule never fires')
  c.ok(flung.skipLines > 0, 'skips are marked on the rail but do not reach the ledger')
  c.note(`fling: ${flung.skipped.length} station(s) stamped skipped, ${flung.skipLines} skip line(s) in the ledger`)

  // Now come back through them under control. They must clear.
  //
  // "Under control" has to be simulated honestly: jumping in fortieths of the
  // page is forty more flings, and the first version of this check did exactly
  // that and then blamed the page. A reading pace is well under the threshold
  // the move uses, so step in small increments, one frame apart.
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(200)
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - innerHeight
    for (let y = 0; y <= max; y += 40) {
      scrollTo(0, y)
      await new Promise((r) => requestAnimationFrame(r))
    }
    scrollTo(0, max)
    for (let i = 0; i < 6; i++) await new Promise((r) => requestAnimationFrame(r))
  })
  const recovered = await page.evaluate(() => ({
    skipped: [...document.querySelectorAll('.rail__stop[data-skipped="1"]')].length,
    velocity: document.querySelector('[data-status-velocity]').textContent.trim(),
  }))
  c.ok(
    recovered.skipped === 0,
    `${recovered.skipped} station(s) still marked skipped after a controlled second pass; the move promises recovery`
  )
  c.note('a controlled second pass clears every skip, as the brief promises')
})

c.report()
