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
  const monthlySettled = await page
    .waitForFunction(
      (want) =>
        want.every((monthly) =>
          [...document.querySelectorAll('#plans [data-plan-name]')].some((element) =>
            element.textContent.includes(monthly)
          )
        ),
      WANT_MONTHLY,
      { timeout: 15000 }
    )
    .then(() => true, () => false)
  c.ok(monthlySettled, 'monthly prices did not settle after switching back from yearly')
  const unchecked = await page.$eval('#plans [role="switch"]', (el) => el.getAttribute('aria-checked'))
  c.ok(unchecked === 'false', `billing switch did not return to monthly; aria-checked is "${unchecked}"`)

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
