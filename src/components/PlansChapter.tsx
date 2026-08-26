// Chapter 04. The plans, as 21st.dev's pricing-module.
//
// @ruixen.ui/pricing-module (id 9189), named by the owner on 26.08.2026 to
// replace the tray of five cards this build shipped first. Its anatomy is
// followed part for part: a centred title and subtitle, a switch that flips
// every card between the monthly and the yearly catalogue, then one card per
// plan carrying an icon, the plan's name, its description, the amount, the
// period under it, the action, and beneath a hairline two labelled lists,
// "Overview" and "Highlights", the second ticked item by item.
//
// What is adapted, and why:
//
//   - Colour. The catalogue component is shadcn's light `bg-background` with a
//     `primary` ring on the recommended card. Here the tray is the onyx ground
//     and the recommended card is the cream plate, which is the same contrast
//     inverted, and every token is the product's own.
//   - Dependencies. The catalogue pulls shadcn's Card, Button and a
//     react-aria Switch. This project has none of those and the component is
//     three boxes and a toggle, so it is written against the page's own
//     button, its own card and a plain `role="switch"`.
//   - The checklist is the same in every card ON PURPOSE. The chapter's lede
//     says the plans differ only in how many documents the system takes in a
//     month, so a per-plan feature list that differed would contradict the
//     sentence above it. What the ticks carry is what is open everywhere.
//
// The `data-plan-*` attributes are the contract scripts/gates/g14-figures.mjs
// reads. `data-plan-price` is ALWAYS the monthly amount whatever the switch is
// showing: the gate asserts the published catalogue, not the current state of
// a toggle.

import { useId, useState } from 'react'
import { Building, Building2, Check, Landmark, Sprout, Store } from 'lucide-react'
import { Cta } from './Cta'
import { Html, Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Row = { name: string; who: string; docs: string; price: string }

type Billing = {
  monthlyLabel: string
  yearlyLabel: string
  switchLabel: string
  perMonth: string
  perYear: string
  save: string
  docsLabel: string
  yearly: string[]
}

/** The plan the vendor points at. Third of five, the fullest workflow. */
const RECOMMENDED = 2

const ICONS = [Sprout, Store, Building2, Building, Landmark]

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
  billing,
  recommendedLabel,
  everywhereLabel,
  everywhere,
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
  billing: Billing
  recommendedLabel: string
  everywhereLabel: string
  everywhere: string[]
}) {
  const [yearly, setYearly] = useState(false)
  const switchId = useId()

  return (
    <section id="plans" data-folio={folio} className="py-[clamp(4rem,10vh,7rem)]">
      <div className="wrap">
        {/* The catalogue component centres its head. So does this one. */}
        <header className="mx-auto max-w-[46rem] text-center">
          <SplitHeading className="h-big text-center" text={h2} />
          <Reveal delay={0.08}>
            <p className="lede mx-auto mt-4">{lede}</p>
          </Reveal>
        </header>

        {/* The switch. */}
        <Reveal delay={0.12}>
          <div className="plans-switch">
            <span
              className={`plans-switch__side ${yearly ? '' : 'is-on'}`}
              aria-hidden="true"
            >
              {billing.monthlyLabel}
            </span>
            <button
              type="button"
              id={switchId}
              role="switch"
              aria-checked={yearly}
              aria-label={billing.switchLabel}
              className="plans-switch__track"
              onClick={() => setYearly((v) => !v)}
            >
              <span className="plans-switch__thumb" aria-hidden="true" />
            </button>
            <span
              className={`plans-switch__side ${yearly ? 'is-on' : ''}`}
              aria-hidden="true"
            >
              {billing.yearlyLabel}
            </span>
            <span className="plans-switch__save">{billing.save}</span>
          </div>
        </Reveal>

        <RevealGroup
          className="plans-tray mt-[clamp(2rem,5vh,3rem)] grid items-stretch gap-3 rounded-[18px] p-3 sm:grid-cols-2 xl:grid-cols-5"
          each={0.06}
          aria-label={tableLabel}
        >
          {rows.map((r, i) => {
            const Icon = ICONS[i] ?? Sprout
            const featured = i === RECOMMENDED
            const shown = yearly ? (billing.yearly[i] ?? r.price) : r.price
            const hasAmount = /\d/.test(shown)
            return (
              <RevealItem
                key={r.name}
                className={[
                  'plan-card flex flex-col rounded-[14px] p-6 text-center',
                  featured ? 'plan-card--featured on-light' : '',
                ].join(' ')}
              >
                {featured && <span className="plan-card__badge">{recommendedLabel}</span>}

                <span className="plan-card__icon" aria-hidden="true">
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>

                <h3
                  className={[
                    'mt-4 font-display text-[1.4rem] leading-tight font-bold tracking-[-0.02em]',
                    featured ? 'text-ink-on-light' : 'text-ink',
                  ].join(' ')}
                >
                  {r.name}
                </h3>
                <p
                  className={[
                    'mt-1.5 min-h-[3.2em] text-[0.86rem] leading-[1.5]',
                    featured ? 'text-ink-on-light-soft' : 'text-ink-dim',
                  ].join(' ')}
                >
                  {r.who}
                </p>

                <p
                  data-plan-name={r.name}
                  data-plan-price={r.price}
                  className={[
                    'mt-5 font-display leading-none font-extrabold tracking-[-0.03em]',
                    featured ? 'text-ink-on-light' : 'text-ink',
                    hasAmount
                      ? 'ip-fig text-[clamp(1.9rem,3vw,2.5rem)]'
                      : 'text-[clamp(1.2rem,1.9vw,1.55rem)]',
                  ].join(' ')}
                >
                  {shown}
                </p>
                <p
                  className={[
                    'mt-1.5 text-[0.74rem] tracking-[0.1em]',
                    featured ? 'text-oceanic-deep' : 'text-ink-dim',
                  ].join(' ')}
                >
                  {hasAmount ? (yearly ? billing.perYear : billing.perMonth) : headers.price}
                </p>

                <div className="mt-5">
                  <Cta href={ctaHref} variant={featured ? 'primary' : 'ghost'} size="sm" block>
                    {ctaLabel}
                  </Cta>
                </div>

                <div
                  className={[
                    'mt-6 flex-1 border-t pt-5 text-start',
                    featured ? 'border-wheat-line' : 'border-onyx-line',
                  ].join(' ')}
                >
                  <p
                    className={[
                      'mb-2.5 text-[0.78rem] font-semibold',
                      featured ? 'text-ink-on-light' : 'text-ink-soft',
                    ].join(' ')}
                  >
                    {billing.docsLabel}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <span className="plan-card__tick grid size-6 shrink-0 place-content-center rounded-full">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span
                      data-plan-docs={r.docs}
                      className={[
                        'ip-fig font-display text-[1.1rem] font-bold',
                        featured ? 'text-ink-on-light' : 'text-ink',
                      ].join(' ')}
                    >
                      {r.docs}
                    </span>
                  </p>

                  <p
                    className={[
                      'mt-5 mb-2.5 text-[0.78rem] font-semibold',
                      featured ? 'text-ink-on-light' : 'text-ink-soft',
                    ].join(' ')}
                  >
                    {everywhereLabel}
                  </p>
                  <ul className="m-0 grid list-none gap-2 p-0">
                    {everywhere.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className="plan-card__tick mt-0.5 grid size-5 shrink-0 place-content-center rounded-full">
                          <Check className="size-3" strokeWidth={2.5} />
                        </span>
                        <span
                          className={[
                            'text-[0.85rem] leading-[1.5]',
                            featured ? 'text-ink-on-light-soft' : 'text-ink-dim',
                          ].join(' ')}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>

        <Reveal delay={0.06} className="plans__notes mt-5">
          <Html html={priceNote} className="plans__prices cap" />
          <p className="cap">{note}</p>
        </Reveal>
      </div>
    </section>
  )
}
