// Chapter 04. The plans, as the reference's cards.
//
// 21st.dev's pricing-section-3 (@uilayout.contact, id 6259), followed properly
// this time: a tray, one card per plan, the amount set large above the plan's
// name, a description, a hairline, a checklist behind it, and an action on
// every card. The owner's note on the first attempt was that it did not look
// like the component at all, and it did not — it was a row of panels with the
// anatomy sanded off.
//
// Two deliberate departures, both about what the copy is allowed to claim:
//
//   - The elevated card carries NO badge. The catalogue's says "Popular";
//     nothing in this product's copy says which plan is popular, and a label
//     that says it anyway is a claim the page has not earned. The card is
//     lifted and inverted, which gives the design its focal point without
//     putting words in the owner's mouth.
//   - Every card's action is the same one the rest of the page makes. Five
//     buttons, one destination: this page asks for exactly one thing.
//
// On the onyx ground the highlight runs the other way from the catalogue: its
// tray is light and its featured card dark, so here the tray is dark and the
// featured card is the cream plate. Same contrast, inverted ground.
//
// The `data-plan-*` attributes are the contract scripts/gates/g14-figures.mjs
// reads, so a hand-edited price fails the build rather than shipping.

import { Check } from 'lucide-react'
import { Cta } from './Cta'
import { Html, Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Row = { name: string; who: string; docs: string; price: string }

/** The middle plan of five carries the design's focal point. */
const FEATURED = 2

export function PlansChapter({
  folio,
  h2,
  lede,
  tableLabel,
  headers,
  rows,
  priceNote,
  note,
  ctaLabel,
  ctaHref,
}: {
  folio: string
  h2: string
  lede: string
  tableLabel: string
  headers: { plan: string; who: string; docs: string; price: string }
  rows: Row[]
  priceNote: string
  note: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <section id="plans" data-folio={folio} className="py-[clamp(4rem,10vh,7rem)]">
      <div className="wrap">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <SplitHeading className="h-big" text={h2} />
          <Reveal delay={0.08}>
            <p className="lede">{lede}</p>
          </Reveal>
        </header>

        <RevealGroup
          className="plans-tray mt-[clamp(3rem,7vh,4.5rem)] grid items-stretch gap-3 rounded-[18px] p-3 sm:grid-cols-2 xl:grid-cols-5"
          each={0.06}
          aria-label={tableLabel}
        >
          {rows.map((r, i) => {
            const hasAmount = /\d/.test(r.price)
            const featured = i === FEATURED
            return (
              <RevealItem
                key={r.name}
                className={[
                  'plan-card flex flex-col rounded-[14px] p-6',
                  featured ? 'plan-card--featured on-light' : '',
                ].join(' ')}
              >
                <p
                  data-plan-name={r.name}
                  data-plan-price={r.price}
                  className={[
                    'font-display leading-none font-extrabold tracking-[-0.03em]',
                    featured ? 'text-ink-on-light' : 'text-ink',
                    hasAmount
                      ? 'ip-fig text-[clamp(2.1rem,3.2vw,2.7rem)]'
                      : 'text-[clamp(1.3rem,2vw,1.7rem)]',
                  ].join(' ')}
                >
                  {r.price}
                </p>
                <p
                  className={[
                    'mt-1.5 text-[0.76rem] tracking-[0.14em]',
                    featured ? 'text-oceanic-deep' : 'text-ink-dim',
                  ].join(' ')}
                >
                  {headers.price}
                </p>

                <h3
                  className={[
                    'mt-6 font-display text-[1.55rem] leading-tight font-bold tracking-[-0.02em]',
                    featured ? 'text-ink-on-light' : 'text-ink',
                  ].join(' ')}
                >
                  {r.name}
                </h3>
                <p
                  className={[
                    'mt-2 text-[0.9rem] leading-[1.55]',
                    featured ? 'text-ink-on-light-soft' : 'text-ink-dim',
                  ].join(' ')}
                >
                  {r.who}
                </p>

                <div
                  className={[
                    'mt-6 flex-1 border-t pt-5',
                    featured ? 'border-wheat-line' : 'border-onyx-line',
                  ].join(' ')}
                >
                  <p
                    className={[
                      'mb-3.5 text-[0.8rem] font-semibold',
                      featured ? 'text-ink-on-light' : 'text-ink-soft',
                    ].join(' ')}
                  >
                    {headers.docs}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <span className="plan-card__tick grid size-6 shrink-0 place-content-center rounded-full">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span
                      data-plan-docs={r.docs}
                      className={[
                        'ip-fig font-display text-[1.15rem] font-bold',
                        featured ? 'text-ink-on-light' : 'text-ink',
                      ].join(' ')}
                    >
                      {r.docs}
                    </span>
                  </p>
                </div>

                <div className="mt-6">
                  <Cta href={ctaHref} variant={featured ? 'primary' : 'ghost'} size="sm" block>
                    {ctaLabel}
                  </Cta>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>

        <Reveal delay={0.06}>
          <Html html={priceNote} className="plans__prices cap mt-5 max-w-[60ch]" />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="cap mt-2 max-w-[60ch]">{note}</p>
        </Reveal>
      </div>
    </section>
  )
}
