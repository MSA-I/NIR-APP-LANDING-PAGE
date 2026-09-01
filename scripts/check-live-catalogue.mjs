// Compares EVERYTHING this page publishes about the plans with what the product
// actually sells, on the live database, and with what a reader actually sees.
//
// WHY THIS IS NOT A GATE
// A gate has to run on a machine with no network and no credentials, and this
// needs both. It is the check to run before a deploy, and the one that answers
// DEBT item 1: the page published 20/40/150/375 while the seeded catalogue said
// 25/50/200/500, and nothing in this repository could tell the difference,
// because every gate here compares the page with the dictionary beside it.
//
// WHAT IT COVERED UNTIL 31.08.2026, AND WHY THAT WAS NOT ENOUGH
// Two figures: the monthly price and the document quota. The pricing chapter
// publishes eight kinds of figure, so six went unchecked -- the yearly
// catalogue, the discount badge, active users, locations, the fifteen-row
// capability ladder, and the whole Business column. It also read `dist/` with a
// regular expression, which silently DROPS whatever is not a digit: the page
// grew a fifth card and the comparison went on lining a five-card page up
// against a four-plan catalogue by luck, because "בשיחה" and "חוזי" fell out of
// the arrays before anything was compared. Nothing was wrong with the two
// answers it gave. The trouble was the questions it did not ask.
//
// WHAT IT DOES NOW
// It reads the live catalogue, the live quotas and the live capability ladder,
// then opens the built page in a real browser -- both editions, desktop and
// phone -- and holds every published figure to the product. Three separate
// verdicts, because they call for three different actions:
//
//   MISMATCH      the page states a figure and the product states another. The
//                 page is lying to a reader. Fix the page or the catalogue.
//   UNVERIFIABLE  the page states a figure the live product does not publish at
//                 all. Nothing is provably wrong, and nothing is provably right
//                 either: the claim has no source. Usually a migration that has
//                 not been deployed.
//   SILENT        the product publishes a figure the page never shows. Not a
//                 fault by itself -- DEBT 31 records three of these as owner
//                 decisions -- so it is reported and does not fail the run.
//
// It joins the page to the database on `data-plan-key`, never on a plan's name,
// because the name is the thing that differs between the two editions.
//
// AND IT CHECKS THE PIXELS, NOT ONLY THE ATTRIBUTES. A data attribute is a
// promise the markup makes about itself; the number the reader is charged by is
// the one drawn on the screen. Every figure is therefore read twice -- once as
// an attribute, once as rendered text -- and a disagreement between the two is
// its own failure. That is the fault a contract-only check cannot see.
//
//   node scripts/check-live-catalogue.mjs
//   node scripts/check-live-catalogue.mjs --env ../NIR-APP/.env
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { withPage, distExists, ROOT } from './gates/lib.mjs'

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

// Resolved against ROOT -- the repository root -- and NOT against this file, which
// is what the old four-level default was counting from. From the repo root the
// product sits one directory up, beside this one; four levels ran off the top of
// the tree and pinned the drive root, so the script died on "cannot read
// <drive>/NIR-APP/.env" before it could import a single figure.
const envPath = path.resolve(ROOT, arg('env', '../NIR-APP/.env'))

if (!(await distExists())) {
  console.error('dist/ has no index.html. Run `npm run build` first: this reads the built page.')
  process.exit(2)
}

let env
try {
  env = readFileSync(envPath, 'utf8')
} catch {
  console.error(`cannot read ${envPath}\npass the product's env file with --env <path>`)
  process.exit(2)
}
const field = (name) => new RegExp(`^${name}\\s*=\\s*"?([^"\\r\\n]+)"?`, 'm').exec(env)?.[1]?.trim()
const url = field('VITE_SUPABASE_URL') || field('SUPABASE_URL')
const key = field('VITE_SUPABASE_ANON_KEY') || field('SUPABASE_ANON_KEY')
if (!url || !key) {
  console.error(`no Supabase url/key in ${envPath}`)
  process.exit(2)
}

// ---------------------------------------------------------------- the product

// `missing` rather than a throw, because a read model that does not exist yet is
// the single most likely reason this script has something to say, and it must be
// reported as its own state instead of killing the run. PostgREST answers 404
// for a function it cannot find, which is not the same as a network failure.
const rpc = async (fn) => {
  let res
  try {
    res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
  } catch (e) {
    return { error: `could not reach ${new URL(url).host}: ${e.message}` }
  }
  if (res.status === 404) return { missing: true }
  if (!res.ok) return { error: `${fn} answered ${res.status}` }
  return { rows: await res.json() }
}

const [catalogue, quotas, features] = await Promise.all([
  rpc('get_public_plan_catalogue'),
  rpc('get_public_plan_quotas'),
  rpc('get_public_plan_features'),
])

for (const [name, r] of [
  ['get_public_plan_catalogue', catalogue],
  ['get_public_plan_quotas', quotas],
]) {
  if (r.error) {
    console.error(r.error)
    process.exit(2)
  }
  if (r.missing) {
    console.error(
      `${name} does not exist on ${new URL(url).host}. This is the read model the page is built on; nothing can be compared without it.`
    )
    process.exit(2)
  }
}
if (features.error) {
  console.error(features.error)
  process.exit(2)
}

// price[currency][plan] = { monthly, yearly, order }
const price = {}
for (const r of catalogue.rows) {
  ;(price[r.currency] ??= {})[r.plan_key] = {
    monthly: Number(r.monthly_amount),
    yearly: Number(r.yearly_amount),
    order: r.tier_order,
  }
}
// quota[entitlement_key][plan] = { measured, unlimited, limit }
const quota = {}
for (const r of quotas.rows) {
  ;(quota[r.entitlement_key] ??= {})[r.plan_key] = {
    measured: r.measured,
    unlimited: r.unlimited,
    limit: r.numeric_limit === null ? null : Number(r.numeric_limit),
  }
}
// feature[entitlement_key][plan] = { included, intro }. `null` when 0246 has not
// been deployed, which is a different thing from "the ladder says no".
const feature = features.missing ? null : {}
if (feature) {
  for (const r of features.rows) {
    ;(feature[r.entitlement_key] ??= {})[r.plan_key] = {
      included: r.included,
      intro: r.intro_included,
    }
  }
}

// ------------------------------------------------------------- the two worlds

// The page's ladder key on the left, the product's entitlement key on the right.
// Taken from NIR-APP migration 0246 -- `private.entitlement_definitions` and
// `private.plan_feature_presentation` -- and not from the labels, which are
// language and cannot join anything.
//
// `product-fact` means the row is not an entitlement at all. `chain` and `roles`
// are what the product IS: every plan has them and no migration can turn them
// off, so there is nothing in the database to hold them to. Saying so here is
// better than a mapping that quietly resolves to undefined and reports nothing.
const LADDER = {
  documents: { db: 'documents.monthly', kind: 'numeric' },
  users: { db: 'users.max', kind: 'numeric' },
  branches: { db: 'branches.max', kind: 'numeric' },
  chain: { db: null, kind: 'product-fact' },
  roles: { db: null, kind: 'product-fact' },
  automation: { db: 'documents.automation', kind: 'boolean' },
  history: { db: 'history.full', kind: 'boolean' },
  export: { db: 'exports.custom', kind: 'boolean' },
  reports: { db: 'reports.advanced', kind: 'boolean' },
  mail: { db: 'notifications.email', kind: 'boolean' },
  bank: { db: 'bank.reconciliation', kind: 'boolean' },
  payments: { db: 'payments.accountant_queue', kind: 'boolean' },
  invoices: { db: 'invoices.consolidated', kind: 'boolean' },
  api: { db: 'integrations.api', kind: 'boolean' },
  support: { db: 'support.premium', kind: 'boolean' },
}

// Business is excluded from every public read model server-side, by design: it
// is sold in a conversation and has no published figure. So the database cannot
// confirm or deny anything in that column, and the page must therefore print no
// figure in it -- which IS checkable, and is checked.
const PRICED = ['free', 'basic', 'pro', 'premium']

const EDITIONS = [
  { name: 'he', path: '/', currency: 'ILS' },
  { name: 'en', path: '/en/', currency: 'USD' },
]

// ------------------------------------------------------------------ the ledger

const mismatch = []
const unverifiable = []
const silent = []
const notes = []

// An unverifiable claim is recorded STRUCTURED rather than as a sentence,
// because the cause is almost never per-cell. When 0246 is not deployed, one
// missing read model turns into ninety-six identical complaints -- four plans
// times twelve rows times two editions -- and a report that says the same thing
// ninety-six times has buried its own finding. Cause and key are what the reader
// acts on; the plans and their values are the detail under it.
const unable = (ed, cause, dbKey, plan, value) => unverifiable.push({ ed, cause, dbKey, plan, value })

const at = (ed, what) => `${ed}: ${what}`
const num = (v) => (v === null || v === undefined ? '—' : String(v))

/** A figure the page states and the product also states. */
const hold = (where, label, pageValue, liveValue) => {
  if (String(pageValue) === String(liveValue)) return true
  mismatch.push(`${where} — ${label}: page says ${num(pageValue)}, product says ${num(liveValue)}`)
  return false
}

/** The digits in a printed amount: "2,490 ₪" -> 2490, "$1,490" -> 1490. */
const amount = (s) => {
  const m = String(s).replace(/,/g, '').match(/\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

// ------------------------------------------------------------- read the page

// Everything the pricing chapter publishes, as attributes AND as the text a
// reader sees. Runs inside the page so the two are read off the same DOM in the
// same instant; reading them in two passes would let a re-render sit between
// them and turn a real drift into a flake.
const readChapter = () =>
  document.querySelector('#plans')
    ? {
        cards: [...document.querySelectorAll('#plans .plan-card')].map((card) => {
          const p = card.querySelector('[data-plan-key]')
          const priceBox = card.querySelector('.plan-card__price')
          const docsLi = card.querySelector('[data-plan-docs]')
          const action = card.querySelector('.plan-card__action a')
          return {
            key: p?.getAttribute('data-plan-key') ?? '',
            name: p?.getAttribute('data-plan-name') ?? '',
            priceAttr: p?.getAttribute('data-plan-price') ?? '',
            yearlyAttr: p?.getAttribute('data-plan-yearly') ?? '',
            // What is actually drawn, whitespace collapsed.
            priceText: (priceBox?.textContent ?? '').replace(/\s+/g, ' ').trim(),
            docsAttr: docsLi?.getAttribute('data-plan-docs') ?? '',
            href: action?.getAttribute('href') ?? '',
            // Clipping: a figure wider than the box it sits in is a figure the
            // reader is shown a piece of.
            clipped: priceBox ? priceBox.scrollWidth > priceBox.clientWidth + 1 : false,
          }
        }),
        // The desktop comparison table.
        table: [...document.querySelectorAll('.plans-compare__table td[data-ladder-key]')].map((td) => ({
          plan: td.getAttribute('data-ladder-plan'),
          row: td.getAttribute('data-ladder-key'),
          value: td.getAttribute('data-ladder-value'),
          // What the cell DRAWS, independent of the attribute.
          drawn: td.querySelector('.plans-compare__yes')
            ? 'yes'
            : td.querySelector('.plans-compare__no')
              ? 'no'
              : (td.querySelector('.plans-compare__num')?.textContent ?? '').trim(),
        })),
        // The phone shape: the same ladder inside each card, behind a press.
        cardLadder: [...document.querySelectorAll('.plan-card__ladder li[data-ladder-key]')].map((li) => ({
          plan: li.getAttribute('data-ladder-plan'),
          row: li.getAttribute('data-ladder-key'),
          value: li.getAttribute('data-ladder-value'),
          drawn: li.querySelector('.plan-card__ladder-yes')
            ? 'yes'
            : li.querySelector('.plan-card__ladder-no')
              ? 'no'
              : (li.querySelector('.plan-card__ladder-num')?.textContent ?? '').trim(),
        })),
        save: document.querySelector('[data-plan-save]')?.getAttribute('data-plan-save') ?? null,
        saveText: (document.querySelector('[data-plan-save]')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        switchChecked: document.querySelector('#plans [role="switch"]')?.getAttribute('aria-checked'),
        tableVisible: !!document.querySelector('.plans-compare__table')?.getClientRects().length,
        detailsCount: document.querySelectorAll('.plan-card__more').length,
        // Sideways scroll on the page itself, as opposed to inside the table's
        // own box, which is where it belongs.
        pageOverflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }
    : null

console.log(`checked against ${new URL(url).host}`)
console.log(`ladder read model: ${feature ? 'present' : 'ABSENT — get_public_plan_features() is not on this database'}\n`)

for (const ed of EDITIONS) {
  const live = price[ed.currency]
  if (!live) {
    unverifiable.push({ ed: ed.name, cause: 'other', text: `the product publishes no ${ed.currency} catalogue at all` })
    continue
  }
  const seen = new Set()

  await withPage(
    async (page) => {
      const before = await page.evaluate(readChapter)
      if (!before) {
        mismatch.push(at(ed.name, 'the page has no #plans chapter'))
        return
      }

      // ---- 1. There is one card per plan the product sells, plus Business.
      const pageKeys = before.cards.map((c) => c.key)
      const liveKeys = Object.keys(live).sort((a, b) => live[a].order - live[b].order)
      const expected = [...liveKeys, 'business']
      if (JSON.stringify(pageKeys) !== JSON.stringify(expected)) {
        mismatch.push(
          at(
            ed.name,
            `the cards are [${pageKeys.join(', ')}], the product sells [${expected.join(', ')}] (Business is excluded from the read model by design)`
          )
        )
      }

      // ---- 2. Monthly price: the attribute against the product, the pixels
      //         against the attribute.
      for (const c of before.cards) {
        if (c.key === 'business') {
          if (/\d/.test(c.priceAttr)) {
            mismatch.push(
              at(ed.name, `the Business card prints a figure ("${c.priceAttr}") and the product publishes none for it`)
            )
          }
          continue
        }
        const l = live[c.key]
        if (!l) {
          unverifiable.push({ ed: ed.name, cause: 'other', text: `the card "${c.key}" has no counterpart in the ${ed.currency} catalogue` })
          continue
        }
        const printed = amount(c.priceAttr)
        if (l.monthly === 0) {
          if (printed !== null) {
            mismatch.push(at(ed.name, `${c.key} is free in the catalogue and the card prints "${c.priceAttr}"`))
          }
        } else {
          hold(at(ed.name, c.key), 'monthly price', printed, l.monthly)
        }
        if (printed !== null && amount(c.priceText) !== printed) {
          mismatch.push(
            at(
              ed.name,
              `${c.key}: the card DRAWS "${c.priceText}" while its published price attribute says "${c.priceAttr}" — the attribute and the pixels disagree`
            )
          )
        }
        if (c.clipped) {
          mismatch.push(at(ed.name, `${c.key}: the monthly price is clipped by its own box — the reader sees part of the figure`))
        }
      }

      // ---- 3. The document quota printed on the cards.
      for (const c of before.cards) {
        if (!/^\d+$/.test(c.docsAttr)) continue
        const q = quota['documents.monthly']?.[c.key]
        if (!q) {
          unable(ed.name, 'no-key', 'documents.monthly', c.key, c.docsAttr)
        } else if (!q.measured) {
          unable(ed.name, 'no-number', 'documents.monthly', c.key, c.docsAttr)
        } else {
          hold(at(ed.name, c.key), 'documents a month', Number(c.docsAttr), q.limit)
        }
      }

      // ---- 4. THE LADDER. Fifteen rows across five plans.
      for (const cell of before.table) {
        const map = LADDER[cell.row]
        if (!map) {
          unverifiable.push({ ed: ed.name, cause: 'other', text: `the table has a row "${cell.row}" that maps to no entitlement — the check cannot judge it` })
          continue
        }
        if (map.db) seen.add(map.db)

        // 4a. The value against the product.
        if (cell.plan !== 'business' && map.kind !== 'product-fact') {
          if (map.kind === 'numeric') {
            const printed = amount(cell.value)
            const q = quota[map.db]?.[cell.plan]
            if (printed !== null) {
              if (!q) {
                unable(ed.name, 'no-key', map.db, cell.plan, cell.value)
              } else if (!q.measured) {
                unable(ed.name, 'no-number', map.db, cell.plan, cell.value)
              } else {
                hold(at(ed.name, cell.plan), map.db, printed, q.limit)
              }
            }
          } else if (!feature) {
            unable(ed.name, 'no-ladder', map.db, cell.plan, cell.value)
          } else {
            const f = feature[map.db]?.[cell.plan]
            if (!f) {
              unable(ed.name, 'no-row', map.db, cell.plan, cell.value)
            } else {
              // The page draws three states and the product publishes two
              // fields; 'intro' is `included:false, intro_included:true`, which
              // is the thirty-day window 0246 lends a new Free organisation.
              const liveState = f.included ? 'true' : f.intro ? 'intro' : 'false'
              if (cell.value !== liveState) {
                mismatch.push(`${at(ed.name, cell.plan)} — ${map.db}: page says ${cell.value}, product says ${liveState}`)
              }
            }
          }
        }

        // 4b. The pixels: the cell's drawn state against its own value.
        const wantDrawn =
          cell.value === 'true' ? 'yes' : cell.value === 'false' || cell.value === 'intro' ? 'no' : cell.value
        if (cell.drawn !== wantDrawn) {
          mismatch.push(
            at(
              ed.name,
              `${cell.plan}/${cell.row}: the cell says "${cell.value}" and DRAWS "${cell.drawn}" — the attribute and the pixels disagree`
            )
          )
        }
      }

      // ---- 5. The two shapes must be the same catalogue. A reader on a phone
      //         never sees the table; a reader on a laptop never opens the
      //         details. If they disagree the page tells two stories.
      const tableByCell = new Map(before.table.map((c) => [`${c.plan}/${c.row}`, c.value]))
      for (const li of before.cardLadder) {
        const id = `${li.plan}/${li.row}`
        if (!tableByCell.has(id)) {
          mismatch.push(at(ed.name, `the phone ladder has ${id} and the desktop table has no such cell`))
        } else if (tableByCell.get(id) !== li.value) {
          mismatch.push(
            at(ed.name, `${id}: the phone ladder says "${li.value}" and the desktop table says "${tableByCell.get(id)}"`)
          )
        }
      }

      // ---- 6. What the product publishes and the page never says.
      for (const [dbKey, plans] of Object.entries(quota)) {
        if (seen.has(dbKey)) continue
        const measured = PRICED.filter((p) => plans[p]?.measured)
        if (measured.length === PRICED.length) {
          silent.push(`the product publishes ${dbKey} (${measured.map((p) => plans[p].limit).join(' / ')}) and the page never shows it`)
        }
      }
      if (feature) {
        for (const dbKey of Object.keys(feature)) {
          if (!seen.has(dbKey)) silent.push(`the ladder publishes ${dbKey} and the page has no row for it`)
        }
      }

      // ---- 7. THE DISCOUNT BADGE. A percentage is arithmetic over the two
      //         catalogues, so it is computed rather than believed.
      const claimed = before.save ? amount(before.save.match(/(\d+(?:\.\d+)?)\s*%/)?.[1] ?? '') : null
      if (claimed === null) {
        notes.push(at(ed.name, 'the billing control states no percentage; nothing to check'))
      } else {
        const real = PRICED.filter((p) => live[p]?.monthly > 0).map(
          (p) => Math.round((1 - live[p].yearly / (live[p].monthly * 12)) * 1000) / 10
        )
        if (!real.length) {
          unverifiable.push({ ed: ed.name, cause: 'other', text: `the badge claims ${claimed}% and the catalogue has no priced plan to compute it from` })
        } else if (!real.every((r) => Math.abs(r - real[0]) < 0.05)) {
          mismatch.push(
            at(ed.name, `the badge claims one discount (${claimed}%) and the catalogue gives a different one per plan (${real.join('%, ')}%)`)
          )
        } else if (Math.abs(real[0] - claimed) > 0.5) {
          // Worked in the cheapest priced plan, whichever that is, rather than
          // in `basic` by name: a catalogue that drops or renames a tier must
          // still produce a sentence, not a crash inside the error message.
          const cheapest = PRICED.filter((p) => live[p]?.monthly > 0).sort(
            (a, b) => live[a].monthly - live[b].monthly
          )[0]
          mismatch.push(
            at(
              ed.name,
              `the billing control claims "${before.saveText}" and the live catalogue gives ${real[0]}% — twelve months of ${cheapest} at ${live[cheapest].monthly} is ${live[cheapest].monthly * 12}, the yearly amount is ${live[cheapest].yearly}`
            )
          )
        }
      }

      // ---- 8. THE YEARLY CATALOGUE, which nothing checked until today. Read
      //         off the attribute first, then off the pixels after the switch:
      //         a figure behind a control that does not move is a figure nobody
      //         sees.
      for (const c of before.cards) {
        if (c.key === 'business') continue
        const l = live[c.key]
        const printed = amount(c.yearlyAttr)
        if (!l || printed === null) continue
        hold(at(ed.name, c.key), 'yearly price', printed, l.yearly)
      }

      await page.click('#plans [role="switch"]')
      await page
        .waitForFunction(
          () =>
            [...document.querySelectorAll('#plans .plan-card')].every((card) => {
              const y = card.querySelector('[data-plan-yearly]')?.getAttribute('data-plan-yearly') ?? ''
              const digits = y.replace(/[^\d,.]/g, '').trim()
              if (!digits) return true
              return (card.querySelector('.plan-card__price')?.textContent ?? '').includes(digits)
            }),
          null,
          { timeout: 15000 }
        )
        .catch(() => {})

      const after = await page.evaluate(readChapter)
      if (after.switchChecked !== 'true') {
        mismatch.push(at(ed.name, `the billing switch did not flip; aria-checked is "${after.switchChecked}"`))
      }
      for (const c of after.cards) {
        if (c.key === 'business') continue
        const l = live[c.key]
        if (!l || l.yearly === 0) continue
        if (amount(c.priceText) !== l.yearly) {
          mismatch.push(
            at(ed.name, `${c.key}: with the switch on yearly the card DRAWS "${c.priceText}" and the live yearly amount is ${l.yearly}`)
          )
        }
        if (c.clipped) mismatch.push(at(ed.name, `${c.key}: the yearly figure is clipped by its own box`))
      }
      // The published contract must not follow a toggle.
      if (JSON.stringify(before.cards.map((c) => c.priceAttr)) !== JSON.stringify(after.cards.map((c) => c.priceAttr))) {
        mismatch.push(at(ed.name, 'data-plan-price moved with the switch; it must stay the monthly catalogue'))
      }
      if (after.pageOverflows) {
        mismatch.push(at(ed.name, 'the pricing chapter scrolls the page sideways at 1440px'))
      }

      notes.push(
        at(
          ed.name,
          `${before.cards.length} cards, ${before.table.length} table cells, ${before.cardLadder.length} phone-ladder cells, badge "${before.saveText}"`
        )
      )
    },
    { path: ed.path }
  )

  // ---- 9. THE PHONE. Below 640px the table is not drawn and the per-card
  //         ladder is, and that is where most readers meet these figures. The
  //         values were held to the product above; what is checked here is that
  //         a phone reader can actually reach them.
  await withPage(
    async (page) => {
      const m = await page.evaluate(readChapter)
      if (!m) return
      if (m.tableVisible) notes.push(at(ed.name, 'phone: the comparison table is still drawn at 390px'))
      if (m.detailsCount !== m.cards.length) {
        mismatch.push(
          at(ed.name, `phone: ${m.cards.length} cards but ${m.detailsCount} carry the ladder — a plan is unreadable on a phone`)
        )
      }
      if (m.pageOverflows) mismatch.push(at(ed.name, 'phone: the pricing chapter scrolls the page sideways at 390px'))

      // Open every ladder and confirm the figures are really drawn, not merely
      // present in the markup: a `details` that opens onto nothing is a
      // catalogue nobody reads.
      const opened = await page.evaluate(() => {
        const list = [...document.querySelectorAll('.plan-card__more')]
        list.forEach((d) => d.setAttribute('open', ''))
        return list.filter((d) => d.querySelectorAll('li[data-ladder-key]').length > 0).length
      })
      if (opened !== m.detailsCount) {
        mismatch.push(at(ed.name, `phone: ${m.detailsCount} ladders, only ${opened} hold any rows when opened`))
      }

      // ONE TAB AT A TIME, SINCE ROUND 20. The catalogue is behind two tabs
      // now and the closed one is `hidden`, so its rows have no boxes — asked
      // of the whole page at once this reported fifteen blank rows for a plan
      // that draws perfectly the moment its tab is pressed. Every plan is
      // still checked; it is checked in the tab it lives in.
      const tabs = await page.$$('.plans-tabs__tab')
      let blank = 0
      for (const tab of tabs.length ? tabs : [null]) {
        if (tab) {
          await tab.click()
          await page.waitForTimeout(300)
          await page.evaluate(() =>
            document.querySelectorAll('.plan-card__more').forEach((d) => d.setAttribute('open', ''))
          )
        }
        blank += await page.evaluate(() =>
          [...document.querySelectorAll('.plan-card__ladder li[data-ladder-key]')].filter(
            // A row in the tab that is NOT open has no box by design, and
            // `closest('body')` would match every row on the page, which is a
            // filter that filters nothing. The question is only about rows in
            // the live tab.
            (li) => li.getClientRects().length === 0 && !li.closest('[role="tabpanel"][hidden]')
          ).length
        )
      }
      if (blank > 0) mismatch.push(at(ed.name, `phone: ${blank} ladder rows are open and draw nothing`))
    },
    { path: ed.path, viewport: { width: 390, height: 844 } }
  )
}

// ------------------------------------------------------------------- verdict

const uniq = (a) => [...new Set(a)]
const section = (title, items) => {
  if (!items.length) return
  console.log(`\n${title}`)
  for (const i of uniq(items)) console.log(`  ${i}`)
}

// One finding per CAUSE, not per cell. Every unverifiable claim is grouped by
// what is missing and where, and the plans it affects are listed under it; when
// a group is identical in both editions it is stated once and marked so. The
// count that decides the exit code is the number of causes, because that is the
// number of things somebody has to fix.
const WHY = {
  'no-ladder': (k) => `the product publishes no capability ladder at all, so ${k} cannot be confirmed`,
  'no-key': (k) => `the product has no ${k} at all`,
  'no-number': (k) => `the product carries ${k} but publishes no number for it`,
  'no-row': (k) => `the ladder is published but has no ${k} row`,
}
const groups = new Map()
for (const u of unverifiable) {
  const id = u.cause === 'other' ? `other|${u.text}` : `${u.cause}|${u.dbKey}`
  if (!groups.has(id)) groups.set(id, { ...u, plans: new Map(), eds: new Set() })
  const g = groups.get(id)
  g.eds.add(u.ed)
  if (u.plan) g.plans.set(u.plan, u.value)
}

if (groups.size) {
  console.log('\nUNVERIFIABLE — the page states figures the live product does not publish')
  for (const g of groups.values()) {
    const where = g.eds.size === EDITIONS.length ? 'both editions' : [...g.eds].join(', ')
    if (g.cause === 'other') {
      console.log(`  ${g.text} (${where})`)
      continue
    }
    const detail = [...g.plans].map(([p, v]) => `${p}=${v}`).join('  ')
    console.log(`  ${WHY[g.cause](g.dbKey)}`)
    console.log(`      the page states: ${detail}   (${where})`)
  }
}

section('what the page shows', notes)
section('MISMATCH — the page and the product disagree', mismatch)
section('SILENT — the product publishes figures the page never shows', silent)

const bad = uniq(mismatch).length + groups.size
console.log('')
if (bad) {
  console.error(
    `${uniq(mismatch).length} mismatch(es), ${groups.size} unverifiable claim(s) over ${unverifiable.length} cells, ${uniq(silent).length} silent figure(s).`
  )
  console.error('The page publishes figures the product does not back.')
  process.exit(1)
}
console.log(
  `the page publishes what the product sells. ${uniq(silent).length} figure(s) the product publishes are deliberately not shown.`
)
