// G14: the published figures are exactly the launch catalogue, and the legal
// links point at the pages that actually serve them.
//
// The prices are on this page by the owner's instruction of 26.08.2026, which
// reverses decision #267 for this surface only. Every amount is a launch
// catalogue in NIR-APP's 0184 migration, and there are TWO of them: Israel is
// billed in shekels (monthly 0/69/249/449, yearly 690/2,490/4,490) and
// everywhere else in dollars (monthly 0/20/79/149, yearly 200/790/1,490). They
// are separate published catalogues, not one converted at a rate, and the
// dollar figures are not what the shekel ones come to on any day's exchange.
// Documents are 20/40/150/375 in both, and Business carries no figure in
// either.
//
// A hand-edited price is the failure this gate exists for, so it asserts the
// exact SET of amounts on each page rather than looking each one up: an extra
// number fails just as loudly as a wrong one. Until 27.08.2026 it read the
// Hebrew page only, and the English one published its prices unguarded.
//
// Terms and privacy are pages on this site since 27.08.2026, carrying the same
// text as the routes inside the product and the version the product stamps on
// consent. Build 3 shipped them pointing at the wrong host once; the assertion
// below is what noticed.

import { withPage, checker } from './lib.mjs'

const c = checker('G14')

const WANT_DOCS = ['20', '40', '150', '375']

const EDITIONS = [
  {
    name: 'he',
    path: '/',
    monthly: ['69 ₪', '249 ₪', '449 ₪'],
    yearly: ['690', '2,490', '4,490'],
    free: 'ללא עלות',
    business: 'ביזנס',
    // Quoted off the captures, then the catalogue.
    // 30,225 replaced 17,825 on 31.08.2026, when the control centre was
    // captured again: the stat under it is a reading of the picture, so it
    // moves when the picture does. See `boardStats` in src/content/extra.ts.
    known: ['2,884.50', '4,720.00', '2,832.00', '30,225', '69', '249', '449', '690', '2,490', '4,490'],
  },
  {
    name: 'en',
    path: '/en/',
    monthly: ['$20', '$79', '$149'],
    yearly: ['200', '790', '1,490'],
    free: 'No charge',
    business: 'Business',
    // THIS CHANGED ON 31.08.2026. The story's amounts used to stay in shekels
    // in both editions, because they were read off Hebrew screens the English
    // page showed unchanged. The English page now shows its own screens, of an
    // English business in dollars, so the captions moved with them. A caption
    // that disagrees with the picture beside it is the thing this list exists
    // to prevent.
    //
    // The two amounts in chapter 01 were held back that morning, on the reading
    // that "chapter 01 captions the FILM and the film is still the Hebrew
    // render". The film was NOT still the Hebrew render — it was meant to be the
    // English one, and it came out Hebrew by accident (see
    // g18-film-language.mjs). With the hall re-rendered that evening the film
    // says "Butcher & Son Meats 2,884.50$", so the caption beside it says the
    // same. Nothing was held back any more.
    known: ['2,884.50', '4,720.00', '2,832.00', '30,225', '20', '79', '149', '200', '790', '1,490'],
  },
]

// Every amount on the page, whichever side its symbol sits on.
const AMOUNTS = (text) => [
  ...new Set([
    ...[...text.matchAll(/([\d][\d,]*\.?\d*)\s*₪/g)].map((m) => m[1]),
    ...[...text.matchAll(/\$\s*([\d][\d,]*\.?\d*)/g)].map((m) => m[1]),
  ]),
]

for (const ed of EDITIONS) {
  await withPage(
    async (page) => {
      // Chapter 04 is a card grid as of 26.08.2026, not a table. The cards carry
      // data-plan-* attributes precisely so this gate reads a contract rather
      // than a layout: the markup can change again without the figures going
      // unchecked.
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

      c.ok(plans.length === 5, `${ed.name}: there should be five plans, there are ${plans.length}`)
      for (const p of plans) c.note(`${ed.name}  ${p.name.padEnd(8)} ${p.docs.padStart(5)} docs   ${p.price}`)

      const docs = plans.map((p) => p.docs).filter((d) => /^\d+$/.test(d))
      c.ok(
        JSON.stringify(docs) === JSON.stringify(WANT_DOCS),
        `${ed.name}: document quotas drifted: wanted ${WANT_DOCS.join('/')}, found ${docs.join('/')}`
      )

      const priced = plans.map((p) => p.price).filter((p) => /\d/.test(p))
      c.ok(
        JSON.stringify(priced) === JSON.stringify(ed.monthly),
        `${ed.name}: monthly prices drifted: wanted ${ed.monthly.join(', ')}, found ${priced.join(', ')}`
      )

      // Business carries no figure, by decision #201.
      const business = plans.find((p) => p.name === ed.business)
      c.ok(
        business && !/\d/.test(business.price),
        `${ed.name}: the Business plan should carry no figure, it says "${business?.price}"`
      )

      // The yearly catalogue. It used to be a sentence under the tray, which
      // repeated what the cards said and was the duplication the owner asked
      // about on 26.08.2026. It is the switch's job now, so the gate presses the
      // switch and reads the cards, which is what a reader does.
      await page.click('#plans [role="switch"]')
      // The amounts COUNT between the two catalogues rather than swapping, so a
      // card does not carry its new figure for the length of the count. Waited
      // FOR rather than waited OUT: a fixed timeout passed on its own and failed
      // in a full ledger run, because how long the count takes depends on what
      // else the page is decoding at the time.
      await page
        .waitForFunction(
          (want) =>
            want.every((y) =>
              [...document.querySelectorAll('#plans [data-plan-name]')].some((el) =>
                el.textContent.includes(y)
              )
            ),
          ed.yearly,
          { timeout: 15000 }
        )
        .catch(() => {})
      const checked = await page.$eval('#plans [role="switch"]', (el) => el.getAttribute('aria-checked'))
      c.ok(checked === 'true', `${ed.name}: the billing switch did not flip; aria-checked is "${checked}"`)

      const yearly = await page.$$eval('#plans [data-plan-name]', (els) =>
        els.map((el) => el.textContent.replace(/\s+/g, ' ').trim())
      )
      for (const y of ed.yearly) {
        c.ok(
          yearly.some((v) => v.includes(y)),
          `${ed.name}: the yearly figure ${y} is not on a card once the switch is thrown: ${yearly.join(', ')}`
        )
      }

      // `data-plan-price` is the contract and it does NOT follow the switch: the
      // gate asserts the published catalogue, not the state of a toggle.
      const stillMonthly = await page.$$eval('#plans [data-plan-name]', (els) =>
        els.map((el) => el.getAttribute('data-plan-price')).filter((p) => /\d/.test(p))
      )
      c.ok(
        JSON.stringify(stillMonthly) === JSON.stringify(ed.monthly),
        `${ed.name}: data-plan-price moved with the switch; it must stay the monthly catalogue: ${stillMonthly.join(', ')}`
      )

      // A plan that carries no figure has no self-serve path, and must not offer
      // one. Until 27.08.2026 every card took the page's primary call, so the
      // ביזנס card said "פתיחת חשבון חינם" over a price of "בשיחה" and pointed
      // at /signup. That is a promise the card itself contradicts one line above.
      //
      // The assertion is written against the PRICE rather than the plan's name,
      // so renaming a plan cannot slip past it, and a future plan added without
      // a figure inherits the rule instead of the bug.
      const asks = await page.$$eval('#plans .plan-card', (cards) =>
        cards.map((card) => ({
          name: card.querySelector('[data-plan-name]')?.getAttribute('data-plan-name') || '?',
          price: card.querySelector('[data-plan-name]')?.getAttribute('data-plan-price') || '',
          href: card.querySelector('.plan-card__action a')?.getAttribute('href') || '',
          label: (card.querySelector('.plan-card__action a')?.textContent || '').trim(),
        }))
      )
      c.ok(asks.length === 5, `${ed.name}: there should be five plan cards with an ask, there are ${asks.length}`)
      for (const a of asks) {
        if (/\d/.test(a.price) || a.price === ed.free) {
          c.ok(
            /signup/.test(a.href),
            `${ed.name}: the "${a.name}" plan is self-serve at "${a.price}" but its ask goes to ${a.href}`
          )
        } else {
          c.ok(
            !/signup/.test(a.href),
            `${ed.name}: the "${a.name}" plan is priced "${a.price}" and cannot be opened from a form, yet its ask goes to ${a.href}`
          )
          c.ok(
            a.href.startsWith('#') || /^(mailto:|https?:|tel:)/.test(a.href),
            `${ed.name}: the "${a.name}" plan's ask points nowhere: "${a.href}"`
          )
        }
      }

      // Legal links. They are pages on this site now, and they must resolve on
      // it: a colophon link to a document nobody serves is the same failure as
      // one pointing at the wrong host, and harder to see.
      const legal = await page.$$eval('footer a', (els) =>
        els.map((e) => e.getAttribute('href')).filter((h) => /terms|privacy/.test(h || ''))
      )
      c.ok(legal.length === 2, `${ed.name}: the colophon should link terms and privacy, it links ${legal.length}`)
      const prefix = ed.name === 'he' ? '/' : '/en/'
      for (const href of legal) {
        c.ok(
          href === `${prefix}terms/` || href === `${prefix}privacy/`,
          `${ed.name}: ${href} is not this edition's legal page`
        )
        const status = await page.evaluate(
          (h) => fetch(h, { method: 'GET' }).then((r) => r.status, () => 0),
          href
        )
        c.ok(status === 200, `${ed.name}: ${href} answers ${status}`)
      }
      c.note(`${ed.name}: legal ${legal.join(', ')}`)
    },
    { path: ed.path }
  )

  // The prices COUNT to the yearly figure over 520ms rather than cutting to it,
  // so for half a second after the click the page shows amounts that are in no
  // catalogue. A fixed wait races that animation: this gate failed about one run
  // in three, with a different set of amounts every time ("275, 993, 1,790",
  // then "502, 1,814, 3,270"), each of them the same fraction of the three
  // yearly prices. That reads like a pricing bug and is a stopwatch bug.
  //
  // `Amount` in PlansChapter already has an exact answer for this: under
  // `prefers-reduced-motion` it sets the figure outright instead of counting. So
  // the catalogue is read in a second context with reduced motion on, where
  // there is no animation to race. Nothing about the published figures depends
  // on how they arrive.
  const amounts = await withPage(
    async (calm) => {
      await calm.evaluate(() => document.querySelector('#plans').scrollIntoView())
      await calm.click('#plans [role="switch"]')
      await calm.waitForTimeout(300)
      return calm.evaluate(() => document.body.innerText)
    },
    { path: ed.path, reducedMotion: 'reduce' }
  ).then(AMOUNTS)

  // No other amount anywhere on the page. Everything with a currency mark is
  // either a plan price, the yearly note, or one of the product figures the copy
  // quotes off a real screen.
  // THE TWO DERIVED FIGURES, ROUND 20. Each card prints a struck monthly total
  // and a saving in the yearly term, and both are arithmetic the component does
  // over the two catalogues rather than copy anyone typed. They are DERIVED HERE
  // TOO, from this gate's own `monthly` and `yearly` lists, and not appended to
  // `known` as literals: a list of literals would have to be edited by hand
  // whenever a price moves, which is the class of mistake this whole gate is
  // here to catch. If the page ever prints a struck figure that is not twelve
  // monthly charges, or a saving that is not the difference, it lands in
  // `strays` and this fails.
  const derived = ed.monthly.flatMap((m, i) => {
    const n = Number(String(m).replace(/[^\d]/g, ''))
    const y = Number(String(ed.yearly[i]).replace(/[^\d]/g, ''))
    return [(n * 12).toLocaleString('en-US'), (n * 12 - y).toLocaleString('en-US')]
  })
  const known = new Set([...ed.known, ...derived])
  const strays = amounts.filter((a) => !known.has(a))
  c.ok(strays.length === 0, `${ed.name}: unrecognised amount(s) on the page: ${strays.join(', ')}`)
  c.note(`${ed.name}: ${amounts.length} distinct amounts, all accounted for`)
}

c.report()
