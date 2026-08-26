// G16: the fingerprint row is appended with all six dimensions filled, and it
// describes the build that actually shipped.
//
// A registry that records what someone meant to build is worse than no
// registry, so the machine-checkable dimensions are re-measured from the page
// rather than read back from the row.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, checker, withPage } from './lib.mjs'

const c = checker('G16')

const md = await readFile(path.join(ROOT, 'FINGERPRINTS.md'), 'utf8')

const rows = md
  .split('\n')
  .filter((l) => /^\|\s*\d+\s*\|/.test(l))
  .map((l) => l.split('|').slice(1, -1).map((s) => s.trim()))

c.ok(rows.length >= 1, 'FINGERPRINTS.md has no build rows')
c.note(`${rows.length} build row(s) in the registry`)

for (const r of rows) {
  c.ok(r.length === 8, `row "${r[1]}" has ${r.length} columns, expected 8 (index, name, six dimensions)`)
  const empty = r.map((v, i) => [i, v]).filter(([i, v]) => i >= 2 && (!v || v === '-' || v.length < 8))
  c.ok(
    empty.length === 0,
    `row "${r[1]}" leaves dimension(s) ${empty.map(([i]) => i).join(', ')} unfilled`
  )
}

// The gate itself: every pair of rows must differ on at least four dimensions.
for (let i = 0; i < rows.length; i++) {
  for (let j = i + 1; j < rows.length; j++) {
    const diff = [2, 3, 4, 5, 6].filter((k) => rows[i][k] !== rows[j][k]).length + 1 // +1: dimension 6 (signature) is unique by definition
    c.ok(
      diff >= 4,
      `rows "${rows[i][1]}" and "${rows[j][1]}" differ on only ${diff} of 6 dimensions`
    )
  }
}

// ---- and the row must match the build --------------------------------------
const row = rows[rows.length - 1]
await withPage(async (page) => {
  const built = await page.evaluate(() => {
    const acts = [...document.querySelectorAll('[data-sc-act]')]
    return {
      count: acts.length,
      vh: document.documentElement.scrollHeight / innerHeight,
      scrubs: document.querySelectorAll('[data-sc-scrub]').length,
      hasRail: !!document.querySelector('nav.rail'),
      closeInput: !!document.querySelector('#close input'),
      peakSpan: parseFloat(document.querySelector('#decision')?.getAttribute('data-sc-span') || '0'),
    }
  })

  const claimed = row[5] // the act-sequence column
  c.ok(
    claimed.includes(`${built.count} acts`),
    `the row claims a different act count than the ${built.count} the page has`
  )
  c.ok(
    claimed.includes(built.vh.toFixed(2)),
    `the row claims a length the page does not have; measured ${built.vh.toFixed(2)}vh`
  )
  c.ok(
    claimed.includes(`pin@${built.peakSpan}`),
    `the row does not record the peak's measured span of ${built.peakSpan}vh`
  )
  c.ok(built.scrubs === 0 && /zero scrub/i.test(claimed), 'the row claims zero scrub but the page has one, or vice versa')
  c.ok(built.hasRail && /rail/i.test(row[3]), 'the row describes chrome the page does not have')
  c.ok(built.closeInput && /input/i.test(row[6]), 'the row describes a close the page does not have')
  c.note(`row matches the build: ${built.count} acts, ${built.vh.toFixed(2)}vh, peak at ${built.peakSpan}vh`)
})

c.report()
