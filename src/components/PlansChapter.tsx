// Chapter 04. The plans.
//
// SECOND REFERENCE, 28.08.2026. The owner supplied a pricing page and asked for
// its UI and its UX in place of the ticket cards this chapter shipped with.
// Read off that image, part by part:
//
//   THE SWITCH  a segmented pill with two terms in it and a sliding ground
//               behind the live one, with a saving badge riding its top edge.
//   THE CARD    a rounded rectangle with a gradient ground. An icon in a
//               rounded-square chip, the plan name under it, then the amount
//               with the term beside it and the billing line under that, a
//               hairline rule, a list of ticked lines, and the action last.
//   THE FACES   the plans climb: two plain, one ringed and lit, then blue into
//               violet, then violet. The ringed one is the plan pointed at.
//   THE TABLE   under the cards, a comparison: one row per capability, one
//               column per plan, a figure or a tick or a cross in each cell.
//
// The ticket silhouette, the perforations, the barcode and the plan codes are
// gone with it. They were the first reference's anatomy and nothing else on the
// page depended on them.
//
// WHAT THE TABLE SAYS IS NOT A DESIGN DECISION. Until this round the page said
// the plans differ only in the document count and that everything else is open
// everywhere, which is what the catalogue was when NIR-APP's 0184 migration
// shipped it. 0213 reversed that (OPEN-DECISIONS #274): the boolean
// entitlements are a ladder now, and #276 lends a new Free organisation the
// Basic set for thirty days. Every row, every label and every cell below comes
// from that migration's two public read models; see the `ladder` block in
// src/content/extra.ts for what those publish and what they deliberately do not.
//
// `data-plan-price` is still ALWAYS the monthly amount whatever the switch is
// showing, and the switch is still one `role="switch"` control, because
// scripts/gates/g14-figures.mjs asserts the published catalogue and reads it
// through those two contracts rather than through the layout.

import { useEffect, useId, useRef, useState } from 'react'
import {
  Banknote,
  BarChart3,
  Building,
  Building2,
  Check,
  FileText,
  Files,
  Landmark,
  LifeBuoy,
  Mail,
  Minus,
  Plug,
  ScanText,
  ShieldCheck,
  Sprout,
  Store,
  Users,
  Wallet,
  Workflow,
  History,
  Sheet,
} from 'lucide-react'

import { Cta } from './Cta'
import { PlanShader } from './PlanShader'
import { Html, Reveal, RevealGroup, RevealItem, SplitHeading, useCalm } from '@/lib/motion'

type Row = { name: string; who: string; docs: string; price: string }

type Billing = {
  monthlyLabel: string
  yearlyLabel: string
  switchLabel: string
  perMonth: string
  perYear: string
  docsLabel: string
  yearly: string[]
  saveLabel: string
  billedMonthly: string
  billedYearly: string
}

type Cell = string | boolean

type Ladder = {
  compareLabel: string
  featuresHeader: string
  included: string
  absent: string
  contract: string
  unlimited: string
  intro: string
  introNote: string
  rows: { icon: string; label: string; cells: Cell[] }[]
}

/**
 * The amount on a card, counting between the two catalogues.
 *
 * Unchanged from the ticket build, and for the same reason: pressing the yearly
 * switch shows the SAME price at another term, and a number that travels says
 * that while a number that dissolves into another one does not.
 *
 * Only the digits move. "ללא עלות" and "בשיחה" carry no figure, so they swap
 * outright, and the thousands separators are re-rendered from the target's own
 * shape at every step so the width does not jitter.
 */
function Amount({ value }: { value: string }) {
  const calm = useCalm()
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    // The head is whatever sits before the first digit, which in the English
    // catalogue is the dollar sign. Without it '$20' parsed as no figure at
    // all: the card printed the price as a word, dropped "per month" under it,
    // and the count between the two terms never ran.
    const parse = (v: string) => {
      const m = /^(\D*)([\d,]+)(.*)$/.exec(v.trim())
      if (!m) return null
      const n = Number(m[2].replace(/,/g, ''))
      return Number.isFinite(n) ? { head: m[1], n, tail: m[3] } : null
    }
    const a = parse(from.current)
    const b = parse(value)
    from.current = value

    if (calm || !a || !b || a.n === b.n) {
      setShown(value)
      return
    }

    const start = performance.now()
    const span = 520
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / span, 1)
      // The same ease the figures in chapter 02 count on.
      const eased = 1 - Math.pow(1 - t, 3)
      const at = Math.round(a.n + (b.n - a.n) * eased)
      setShown(b.head + at.toLocaleString('en-US') + b.tail)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setShown(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [calm, value])

  return <>{shown}</>
}

/** The plan the vendor points at. Third of five, and the ringed face. */
const RECOMMENDED = 2

const ICONS = [Sprout, Store, Building2, Building, Landmark]

/**
 * Which face each card wears, climbing with the ladder.
 *
 * Owner, 28.08.2026, all five named separately:
 *   PLAIN    the free plan is the page's own ground, so the card is the colour
 *            of the thing beside it and only its edge says it is a card.
 *   LIFT     the basic plan is "a little more colour" than that, and no more.
 *   POINTED  the ring alone. It carried an outer glow and the glow went: what
 *            marks this plan is the border.
 *   VIOLET   a gloss, which is a highlight travelling across the card.
 *   DEEP     a shader of its own; see PlanShader.tsx.
 */
const FACE = [
  'plan-card--plain',
  'plan-card--lift',
  'plan-card--pointed',
  'plan-card--violet',
  'plan-card--deep',
]

/**
 * The table's row glyphs, keyed by the `icon` in the content.
 *
 * A map rather than a component per row: the rows are data now, and a row added
 * to the catalogue should reach the page by adding a line to extra.ts, not by
 * editing this file as well.
 */
const ROW_ICONS: Record<string, typeof Check> = {
  documents: Files,
  users: Users,
  branches: Building2,
  chain: Workflow,
  roles: ShieldCheck,
  automation: ScanText,
  history: History,
  export: Sheet,
  reports: BarChart3,
  mail: Mail,
  bank: Banknote,
  payments: Wallet,
  invoices: FileText,
  api: Plug,
  support: LifeBuoy,
}

export function PlansChapter({
  folio,
  h2,
  lede,
  tableLabel,
  rows,
  priceNote,
  note,
  ctaHref,
  plansCta,
  billing,
  recommendedLabel,
  ladder,
}: {
  folio: string
  h2: string
  lede: string
  tableLabel: string
  rows: Row[]
  priceNote: string
  note: string
  ctaHref: string
  plansCta: { free: string; paid: string; contact: string; contactHref: string }
  billing: Billing
  recommendedLabel: string
  ladder: Ladder
}) {
  const [yearly, setYearly] = useState(false)
  const switchId = useId()

  return (
    <section id="plans" data-folio={folio} className="py-[clamp(4rem,10vh,7rem)]">
      <div className="wrap">
        <header className="mx-auto max-w-[46rem] text-center">
          <SplitHeading className="h-big text-center" text={h2} />
          <Reveal delay={0.08}>
            <p className="lede mx-auto mt-4">{lede}</p>
          </Reveal>
        </header>

        {/* The segmented control. ONE button, not two: it has two states and a
            switch is what a two-state control is. The two words inside it are
            labels on the states rather than controls of their own, so they are
            hidden from the accessibility tree and the button carries the name.
            The ground behind the live word travels on a margin, not on a
            translate, so it moves toward the inline end in either direction. */}
        <Reveal delay={0.12}>
          <div className="plans-switch">
            <span className="plans-switch__save">{billing.saveLabel}</span>
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
              <span className={`plans-switch__side ${yearly ? 'is-on' : ''}`} aria-hidden="true">
                {billing.yearlyLabel}
              </span>
              <span className={`plans-switch__side ${yearly ? '' : 'is-on'}`} aria-hidden="true">
                {billing.monthlyLabel}
              </span>
            </button>
          </div>
        </Reveal>

        <RevealGroup
          className="plans-tray mt-[clamp(2rem,5vh,3rem)] grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5"
          each={0.06}
          aria-label={tableLabel}
        >
          {rows.map((r, i) => {
            const Icon = ICONS[i] ?? Sprout
            const featured = i === RECOMMENDED
            const shown = yearly ? (billing.yearly[i] ?? r.price) : r.price
            const hasAmount = /\d/.test(shown)
            // The card's ask comes from its own PRICE, not from its position.
            // `r.price` and not `shown`, so flipping the billing switch cannot
            // change what a card asks for. A plan with no self-serve path must
            // never end up offering the signup button again.
            // The discriminator is the DOCUMENT COUNT, not the price text.
            //
            // This was `r.price !== 'ללא עלות'` until 27.08.2026, which is a
            // Hebrew string literal inside a component that now renders two
            // languages: on /en/ the free plan reads "No charge", failed the
            // comparison, and offered "Talk to us" over a plan anybody can open
            // themselves. G14 never saw it because G14 only ever loaded the
            // Hebrew page.
            //
            // Every self-serve plan carries a NUMBER of documents (20, 40, 150,
            // 375) and the one that does not is the one sold in a conversation
            // ("חוזי" / "Custom"). That holds in any locale, because it is a
            // fact about the catalogue rather than about the wording.
            const contactOnly = !/\d/.test(r.price) && !/\d/.test(r.docs)
            const ask = hasAmount
              ? { label: plansCta.paid, href: ctaHref }
              : contactOnly
                ? { label: plansCta.contact, href: plansCta.contactHref }
                : { label: plansCta.free, href: ctaHref }
            return (
              <RevealItem key={r.name} className={['plan-card', FACE[i]].filter(Boolean).join(' ')}>
                {/* The gloss: one element, so a card that does not carry it
                    costs nothing, and it sits behind everything the card says. */}
                {FACE[i] === 'plan-card--violet' && (
                  <span className="plan-card__gloss" aria-hidden="true" />
                )}
                {FACE[i] === 'plan-card--deep' && <PlanShader className="plan-card__field" />}

                <span className="plan-card__head">
                  <span className="plan-card__icon" aria-hidden="true">
                    <Icon className="size-[1.15rem]" strokeWidth={1.7} />
                  </span>
                  {featured && <span className="plan-card__badge">{recommendedLabel}</span>}
                </span>

                <h3 className="plan-card__name">{r.name}</h3>

                <p className="plan-card__pricing">
                  <span
                    data-plan-name={r.name}
                    data-plan-price={r.price}
                    className={`plan-card__price ${hasAmount ? 'ip-fig' : 'plan-card__price--words'}`}
                  >
                    <Amount value={shown} />
                  </span>
                  {/* No slash before the term. The reference reads "$29 / month",
                      and this catalogue's terms are already prepositional
                      ("לחודש", "per month"), so a slash on top of one of them
                      would read "/ per month". */}
                  {hasAmount && (
                    <span className="plan-card__per">
                      {yearly ? billing.perYear : billing.perMonth}
                    </span>
                  )}
                </p>
                <p className="plan-card__billed">
                  {hasAmount ? (yearly ? billing.billedYearly : billing.billedMonthly) : ' '}
                </p>

                <span className="plan-card__rule" aria-hidden="true" />

                {/* Every card prints every row, in one order, so five cards can
                    be read against each other by running an eye down them. A
                    plan that does not carry a row gets a rule through the
                    label rather than losing the line, which is the owner's
                    instruction of 28.08.2026 and the only way an absence is
                    visible at all.

                    The five rows the free plan holds only for its first thirty
                    days are drawn as absent HERE and as the introduction pill
                    in the table: a card says what a plan is, and "thirty days
                    of something else" is not what it is. The note under the
                    table is where that fact belongs, and it is there. */}
                <ul className="plan-card__list">
                  {ladder.rows.map((row, n) => {
                    const cell = row.cells[i]
                    const has = cell !== false && cell !== 'intro'
                    return (
                      // NO QUANTITY ON A CARD (owner, 28.08.2026): the row says
                      // which capability, and the table under the cards says how
                      // many. `data-plan-docs` rides the document row all the
                      // same, because G14 reads the published quota off the card
                      // as an attribute and never as text.
                      <li
                        key={row.label}
                        className={has ? '' : 'is-absent'}
                        {...(n === 0 ? { 'data-plan-docs': r.docs } : {})}
                      >
                        <span className="plan-card__tick" aria-hidden="true">
                          {has ? (
                            <Check className="size-3" strokeWidth={2.5} />
                          ) : (
                            <Minus className="size-3" strokeWidth={2.5} />
                          )}
                        </span>
                        <span className="plan-card__row">{row.label}</span>
                        <span className="sr-only">{has ? ladder.included : ladder.absent}</span>
                      </li>
                    )
                  })}
                </ul>

                <div className="plan-card__action">
                  <Cta href={ask.href} variant={featured ? 'primary' : 'ghost'} size="sm" block>
                    {ask.label}
                  </Cta>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>

        {/* The comparison. A real <table>, because it is one: a reader on a
            screen reader gets the row and the column read back with the cell,
            which a grid of <div>s cannot give them. It scrolls inside its own
            box on a narrow screen rather than widening the page. */}
        <Reveal delay={0.1}>
          <div className="plans-compare">
            <div className="plans-compare__scroll">
              <table className="plans-compare__table">
                <caption className="sr-only">{ladder.compareLabel}</caption>
                <thead>
                  <tr>
                    <th scope="col">{ladder.featuresHeader}</th>
                    {/* The owner, 28.08.2026: the plan's name in the table
                        should carry the plan's own effect, not only its colour.
                        So each name sits in a chip cut from the card's face, and
                        the two cards that move take their movement with them:
                        the gloss travels across the violet chip, and the deep
                        chip carries a slow field. The chip is what is coloured
                        and the type on it is not, so the ink stays a solid,
                        measurable colour on a ground that keeps still. */}
                    {rows.map((r, i) => (
                      <th key={r.name} scope="col" className={`is-${FACE[i].slice(11)}`}>
                        <span className="plans-compare__chip">
                          <span className="plans-compare__chip-name">{r.name}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ladder.rows.map((row) => {
                    const RowIcon = ROW_ICONS[row.icon] ?? Check
                    return (
                      <tr key={row.label}>
                        <th scope="row">
                          <span className="plans-compare__row">
                            <span className="plans-compare__glyph" aria-hidden="true">
                              <RowIcon className="size-[1.05rem]" strokeWidth={1.7} />
                            </span>
                            <span>{row.label}</span>
                          </span>
                        </th>
                        {row.cells.map((cell, i) => (
                          <td key={rows[i]?.name ?? i} className={`is-${FACE[i].slice(11)}`}>
                            {cell === true ? (
                              <>
                                <span className="plans-compare__yes">
                                  <Check className="size-3.5" strokeWidth={2.5} />
                                </span>
                                <span className="sr-only">{ladder.included}</span>
                              </>
                            ) : cell === false ? (
                              <>
                                <span className="plans-compare__no" aria-hidden="true">
                                  <Minus className="size-3.5" strokeWidth={2.5} />
                                </span>
                                <span className="sr-only">{ladder.absent}</span>
                              </>
                            ) : cell === 'intro' ? (
                              <span className="plans-compare__intro">{ladder.intro}</span>
                            ) : (
                              <span className="plans-compare__num">{cell}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="plans__notes mt-5">
          <p className="cap">{ladder.introNote}</p>
          <Html html={priceNote} className="plans__prices cap" />
          <p className="cap">{note}</p>
        </Reveal>
      </div>
    </section>
  )
}
