// G2: every money figure on the page is arithmetically consistent with the
// inherited fixtures, and no figure exists that is not traceable to them.
//
// The product's non-negotiable is that a number is a claim about reality. This
// gate recomputes the trail from its inputs rather than comparing the page to a
// copy of itself, and then sweeps the rendered HTML for any currency amount
// that is not on the allow-list. A new invented figure fails the gate by
// existing.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { DIST, checker } from './lib.mjs'

const c = checker('G2')

// ---- the inputs, from NIR-APP-LANDING-PAGE/src/content/fixtures.ts ---------
const UNIT_AGREED = 39.9 // price list, cherry tomatoes, per crate
const UNIT_BILLED = 47.65 // what INV-2311 asked per crate
const CRATES = 160 // order 4127

// Recomputed here, never copied from the page.
const ORDER_TOTAL = Math.round(UNIT_AGREED * CRATES * 100) / 100
const BILLED_TOTAL = Math.round(UNIT_BILLED * CRATES * 100) / 100
const GAP = Math.round((BILLED_TOTAL - ORDER_TOTAL) * 100) / 100
const GAP_PCT = Math.round((GAP / ORDER_TOTAL) * 100)

c.ok(ORDER_TOTAL === 6384, `160 x 39.90 should be 6,384, computed ${ORDER_TOTAL}`)
c.ok(BILLED_TOTAL === 7624, `160 x 47.65 should be 7,624, computed ${BILLED_TOTAL}`)
c.ok(GAP === 1240, `the gap should be 1,240, computed ${GAP}`)
c.ok(GAP_PCT === 19, `the gap should be 19%, computed ${GAP_PCT}%`)

const he = (await import('../../i18n/he.js')).default

// ---- the trail's own arithmetic -------------------------------------------
const byId = Object.fromEntries(he.stations.map((s) => [s.id, s]))
c.ok(byId.order.amount === ORDER_TOTAL, `station "order" carries ${byId.order.amount}, expected ${ORDER_TOTAL}`)
c.ok(byId.receiving.amount === ORDER_TOTAL, 'receiving changed the amount, but the delivery matched in full')
c.ok(byId.invoice.amount === BILLED_TOTAL, `station "invoice" carries ${byId.invoice.amount}, expected ${BILLED_TOTAL}`)
c.ok(byId.decision.amount === ORDER_TOTAL, 'the decision did not return the amount to the agreed total')
c.ok(byId.payment.amount === ORDER_TOTAL, 'the payment is not the approved amount')
c.ok(byId.bank.amount === ORDER_TOTAL, 'the bank line does not match the payment')
c.ok(byId.invoice.amount - byId.order.amount === GAP, 'the invoice-to-order delta is not the stated gap')

// The two alert-state stations must be exactly the ones the gap touches.
const alerts = he.stations.filter((s) => s.state === 'alert').map((s) => s.id)
c.ok(alerts.length === 1 && alerts[0] === 'invoice', `alert states are [${alerts}], expected only "invoice"`)

// ---- nothing on the page that is not traceable ----------------------------
// Every figure below is inherited. Sources, in order: order 4127 line, the
// invoice, the gap, the credit, the blocked invoice, open credits, unmatched
// bank movements, order 4131's quantity gap, the price list, the roles amount.
const ALLOWED = new Set([
  '6,384', '7,624', '1,240', '780', '3,150', '2,180', '9,640', '342',
  '39.90', '47.65', '57.00', '21.50',
])

const html = await readFile(path.join(DIST, 'index.html'), 'utf8')
const text = html.replace(/<[^>]+>/g, ' ')

// Anything shaped like money: a number adjacent to the shekel sign. Hebrew
// writes `6,384 ₪` and English writes `₪6,384`, so both forms are swept. The
// trailing form is consumed FIRST and its shekel sign removed, otherwise a
// price cell followed by a date column reads as `₪ 31.12` and the sweep
// reports the expiry date as an untraceable amount.
const found = new Set()
let rest = text.replace(/([\d][\d,.]*)\s*₪/g, (_, n) => {
  found.add(n.replace(/^\+/, ''))
  return ' '
})
for (const m of rest.matchAll(/₪\s*([\d][\d,.]*)/g)) found.add(m[1].replace(/^\+/, ''))

const untraceable = [...found].filter((f) => !ALLOWED.has(f))
c.ok(
  untraceable.length === 0,
  `figures on the page with no fixture behind them: ${untraceable.join(', ')}`
)
c.note(`${found.size} distinct money figures on the page, all traceable`)

// A metric with no data must render an em dash, never a zero. The status bar
// starts before any station has been passed, so that is where the rule bites.
c.ok(
  /data-status-amount[^>]*>—</.test(html),
  'the tracked amount starts at something other than the no-data dash'
)

c.report()
