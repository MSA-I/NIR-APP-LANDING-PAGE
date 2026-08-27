// G14: the published figures are exactly the launch catalogue, and the legal
// links point at the host that actually serves them.
//
// The prices are on this page by the owner's instruction of 26.08.2026, which
// reverses decision #267 for this surface only. Every amount is the ILS launch
// catalogue in NIR-APP's 0184 migration: monthly 0/69/249/449, yearly
// 690/2,490/4,490, documents 20/40/150/375, Business carrying no figure. A
// hand-edited price is the failure this gate exists for, so it asserts the
// exact SET of amounts on the page rather than looking each one up: an extra
// number fails just as loudly as a wrong one.
//
// Terms and privacy are routes inside the product, not pages on the marketing
// host. Build 3 shipped them pointing at the wrong host once already.

import { withPage, checker } from './lib.mjs'

const c = checker('G14')

const WANT_MONTHLY = ['69 ₪', '249 ₪', '449 ₪']
const WANT_DOCS = ['20', '40', '150', '375']
const WANT_YEARLY = ['690', '2,490', '4,490']
const APP_HOST = 'app.inplace.digital'

await withPage(async (page) => {
  // Chapter 04 is a card grid as of 26.08.2026, not a table. The cards carry
  // data-plan-* attributes precisely so this gate reads a contract rather than
  // a layout: the markup can change again without the figures going unchecked.
  const plans = await page.evaluate(() =>
    [...document.querySelectorAll('#plans [data-plan-name]')].map((el) => {
      const card = el.closest('.plan-card') || el.parentElement
      const docs = card ? card.querySelector('[data-plan-docs]') : null
      return {
        name: el.getAttribute('data-plan-name'),
        price: el.getAttribute('data-plan-price'),
        docs: docs ? docs.getAttribute('data-plan-docs') : '',
      }
    })
  )

  c.ok(plans.length === 5, `there should be five plans, there are ${plans.length}`)
  for (const p of plans) c.note(`${p.name.padEnd(8)} ${p.docs.padStart(5)} docs   ${p.price}`)

  const docs = plans.map((p) => p.docs).filter((d) => /^\d+$/.test(d))
  c.ok(
    JSON.stringify(docs) === JSON.stringify(WANT_DOCS),
    `document quotas drifted: wanted ${WANT_DOCS.join('/')}, found ${docs.join('/')}`
  )

  const priced = plans.map((p) => p.price).filter((p) => /\d/.test(p))
  c.ok(
    JSON.stringify(priced) === JSON.stringify(WANT_MONTHLY),
    `monthly prices drifted: wanted ${WANT_MONTHLY.join(', ')}, found ${priced.join(', ')}`
  )

  // Business carries no figure, by decision #201.
  const business = plans.find((p) => p.name === 'ביזנס')
  c.ok(business && !/\d/.test(business.price), `the Business plan should carry no figure, it says "${business?.price}"`)

  // The yearly catalogue. It used to be a sentence under the tray, which
  // repeated what the cards said and was the duplication the owner asked about
  // on 26.08.2026. It is the switch's job now, so the gate presses the switch
  // and reads the cards, which is what a reader does.
  await page.click('#plans [role="switch"]')
  // The amounts COUNT between the two catalogues rather than swapping, so a
  // card does not carry its new figure for the length of the count. Waited FOR
  // rather than waited OUT: a fixed timeout passed on its own and failed in a
  // full ledger run, because how long the count takes depends on what else the
  // page is decoding at the time.
  await page
    .waitForFunction(
      (want) =>
        want.every((y) =>
          [...document.querySelectorAll('#plans [data-plan-name]')].some((el) =>
            el.textContent.includes(y)
          )
        ),
      WANT_YEARLY,
      { timeout: 15000 }
    )
    .catch(() => {})
  const checked = await page.$eval('#plans [role="switch"]', (el) => el.getAttribute('aria-checked'))
  c.ok(checked === 'true', `the billing switch did not flip; aria-checked is "${checked}"`)

  const yearly = await page.$$eval('#plans [data-plan-name]', (els) =>
    els.map((el) => el.textContent.replace(/\s+/g, ' ').trim())
  )
  for (const y of WANT_YEARLY) {
    c.ok(
      yearly.some((v) => v.includes(y)),
      `the yearly figure ${y} is not on a card once the switch is thrown: ${yearly.join(', ')}`
    )
  }
  c.note(`yearly, off the cards: ${yearly.join('  ')}`)

  // `data-plan-price` is the contract and it does NOT follow the switch: the
  // gate asserts the published catalogue, not the state of a toggle.
  const stillMonthly = await page.$$eval('#plans [data-plan-name]', (els) =>
    els.map((el) => el.getAttribute('data-plan-price')).filter((p) => /\d/.test(p))
  )
  c.ok(
    JSON.stringify(stillMonthly) === JSON.stringify(WANT_MONTHLY),
    `data-plan-price moved with the switch; it must stay the monthly catalogue: ${stillMonthly.join(', ')}`
  )

  await page.click('#plans [role="switch"]')

  // Both branches hit this the same evening and both wrote a wait for it. The
  // other one polled until every wanted price appeared SOMEWHERE in the cards
  // and swallowed its own timeout with `.catch(() => {})`, which means a slow
  // machine falls through to the scan mid-roll and the flake comes back wearing
  // a fix. This one asserts the arrival exactly and is allowed to throw.
  //
  // The prices COUNT from one catalogue to the other, over 520ms of
  // requestAnimationFrame. A fixed 700ms wait here was a bet on how busy the
  // machine is, and during a full thirteen-gate run on 27.08.2026 it lost: the
  // scan below reported 237, 856 and 1,543 as unrecognised amounts on the page.
  // They are not amounts. They are one rolling digit photographed mid-roll, and
  // the gate was reading a frame rather than a price.
  //
  // Sampling the text twice and calling it settled when the two agree is not
  // enough either: under a starved requestAnimationFrame the digit can sit
  // still across two polls and then carry on. So wait for the ARRIVAL instead,
  // by name: every priced card reads its monthly figure and nothing else.
  await page.waitForFunction(
    (want) => {
      const shown = [...document.querySelectorAll('#plans .plan-card__price')]
        .map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((t) => /\d/.test(t))
      return JSON.stringify(shown) === JSON.stringify(want)
    },
    WANT_MONTHLY,
    { timeout: 15000 }
  )

  // No other amount anywhere on the page. Everything with a shekel sign is
  // either a plan price, the yearly note, or one of the product figures the
  // copy quotes off a real screen.
  const KNOWN = new Set([
    '2,884.50', '4,720.00', '2,832.00', '17,825', // quoted off the captures
    '69', '249', '449', '690', '2,490', '4,490', // the catalogue
  ])
  const amounts = await page.evaluate(() =>
    [...document.body.innerText.matchAll(/([\d][\d,]*\.?\d*)\s*₪/g)].map((m) => m[1])
  )
  const strays = [...new Set(amounts)].filter((a) => !KNOWN.has(a))
  c.ok(strays.length === 0, `unrecognised amount(s) on the page: ${strays.join(', ')}`)
  c.note(`${new Set(amounts).size} distinct amounts, all accounted for`)

  // A plan that carries no figure has no self-serve path, and must not offer
  // one. Until 27.08.2026 every card took the page's primary call, so the
  // ביזנס card said "פתיחת חשבון חינם" over a price of "בשיחה" and pointed at
  // /signup. That is a promise the card itself contradicts one line above.
  //
  // The assertion is written against the PRICE rather than the plan's name, so
  // renaming a plan cannot slip past it, and a future plan added without a
  // figure inherits the rule instead of the bug.
  const asks = await page.$$eval('#plans .plan-card', (cards) =>
    cards.map((card) => ({
      name: card.querySelector('[data-plan-name]')?.getAttribute('data-plan-name') || '?',
      price: card.querySelector('[data-plan-name]')?.getAttribute('data-plan-price') || '',
      href: card.querySelector('.plan-card__action a')?.getAttribute('href') || '',
      label: (card.querySelector('.plan-card__action a')?.textContent || '').trim(),
    }))
  )
  c.ok(asks.length === 5, `there should be five plan cards with an ask, there are ${asks.length}`)
  for (const a of asks) {
    if (/\d/.test(a.price) || a.price === 'ללא עלות') {
      c.ok(
        /signup/.test(a.href),
        `the "${a.name}" plan is self-serve at "${a.price}" but its ask goes to ${a.href}`
      )
    } else {
      c.ok(
        !/signup/.test(a.href),
        `the "${a.name}" plan is priced "${a.price}" and cannot be opened from a form, yet its ask goes to ${a.href}`
      )
      c.ok(
        a.href.startsWith('#') || /^(mailto:|https?:|tel:)/.test(a.href),
        `the "${a.name}" plan's ask points nowhere: "${a.href}"`
      )
    }
  }
  c.note(asks.map((a) => `${a.name}: ${a.label} -> ${a.href}`).join(' | '))

  // Legal links live on the app host.
  const legal = await page.$$eval('footer a', (els) =>
    els
      .map((e) => e.getAttribute('href'))
      .filter((h) => /terms|privacy/.test(h || ''))
  )
  c.ok(legal.length === 2, `the colophon should link terms and privacy, it links ${legal.length}`)
  for (const href of legal) {
    c.ok(
      new URL(href).host === APP_HOST,
      `${href} is not on ${APP_HOST}; the legal pages are routes inside the product`
    )
  }
  c.note(`legal: ${legal.join(', ')}`)
})

c.report()
