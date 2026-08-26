// Chapter 04. The plans, as tickets.
//
// The owner supplied a reference image on 26.08.2026 and asked for the cards to
// look like it. Read off that image, part by part, because the whole point of a
// reference is that it is more specific than a description:
//
//   THE SHAPE   a ticket. Scalloped top and bottom edges, a notch cut into both
//               sides at the height of the action, a small corner radius. The
//               scallop and the notches are one mask, not a border.
//   THE HEAD    a plan code on the reading side (PRO-2026), an icon in a
//               rounded-square chip on the other. Nothing centred.
//   THE BODY    plan name, then two lines of description, both centred.
//   THE RULES   dotted, not solid, and there are three: under the description,
//               under the action, and above the barcode.
//   THE PRICE   a small label, the amount large under it, the term under that.
//               Three lines, centred, in that order.
//   THE ACTION  a pill, the full width of the card's inner column.
//   THE COUNT   the document quota with a ticked circle beside it.
//   THE LIST    three ticked lines, ragged to the reading edge.
//   THE FOOT    a barcode.
//
// FOUR FACES, also from the image: the recommended plan is cream paper with a
// badge riding its top edge, one card is deep purple, one is a glossy
// near-black with a light sweeping across it, and the rest are the page's own
// onyx. The owner asked for the sweep on ביזנס, which is the top plan, so the
// glossy card is the top plan and the purple one sits beside it.
//
// The billing switch is unchanged — @ruixen.ui/pricing-module's — and
// `data-plan-price` is still ALWAYS the monthly amount whatever the switch is
// showing, because scripts/gates/g14-figures.mjs asserts the published
// catalogue and not the state of a toggle.

import { useEffect, useId, useRef, useState } from 'react'
import { Building, Building2, Check, Landmark, Sprout, Store } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Cta } from './Cta'
import { Html, Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Row = { name: string; who: string; docs: string; price: string }

type Billing = {
  monthlyLabel: string
  yearlyLabel: string
  switchLabel: string
  perMonth: string
  perYear: string
  docsLabel: string
  yearly: string[]
}

/**
 * The amount on a card, counting between the two catalogues.
 *
 * The owner's note of 26.08.2026: pressing the yearly switch should animate
 * the numbers. It counts rather than crossfades because these two figures are
 * the SAME price at two terms, and a number that travels says that while a
 * number that dissolves into another one does not.
 *
 * Only the digits move. "ללא עלות" and "בשיחה" carry no figure, so they swap
 * outright, and the thousands separators are re-rendered from the target's own
 * shape at every step so the width does not jitter.
 */
function Amount({ value }: { value: string }) {
  const calm = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const parse = (v: string) => {
      const m = /^([\d,]+)(.*)$/.exec(v.trim())
      if (!m) return null
      const n = Number(m[1].replace(/,/g, ''))
      return Number.isFinite(n) ? { n, tail: m[2] } : null
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
      setShown(at.toLocaleString('en-US') + b.tail)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setShown(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [calm, value])

  return <>{shown}</>
}

/**
 * The barcode along the bottom edge.
 *
 * Drawn, not fetched: a barcode is a run of bars at three widths, and the
 * widths come from the plan's own name, so the same plan draws the same code
 * every render and no two cards carry the same one. An <img> would be a
 * network request per card for a texture nobody scans.
 */
function Barcode({ seed }: { seed: string }) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const bars: number[] = []
  for (let i = 0; i < 46; i++) {
    h = (h * 1664525 + 1013904223) >>> 0
    bars.push(1 + ((h >>> 16) % 3))
  }
  return (
    <span className="plan-card__barcode" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} style={{ inlineSize: `${w}px`, opacity: i % 2 ? 0.16 : 1 }} />
      ))}
    </span>
  )
}

/** The plan the vendor points at. Third of five, the fullest workflow. */
const RECOMMENDED = 2

const ICONS = [Sprout, Store, Building2, Building, Landmark]

/** The plan codes, off the reference image: three letters and the year. */
const CODES = ['FRE', 'BSC', 'PRO', 'PRN', 'BZN']

/** Which face each card wears. Index 4 is ביזנס, which carries the sweep. */
const FACE = ['', '', 'plan-card--paper', 'plan-card--violet', 'plan-card--gloss']

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
        <header className="mx-auto max-w-[46rem] text-center">
          <SplitHeading className="h-big text-center" text={h2} />
          <Reveal delay={0.08}>
            <p className="lede mx-auto mt-4">{lede}</p>
          </Reveal>
        </header>

        <Reveal delay={0.12}>
          <div className="plans-switch">
            <span className={`plans-switch__side ${yearly ? '' : 'is-on'}`} aria-hidden="true">
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
            <span className={`plans-switch__side ${yearly ? 'is-on' : ''}`} aria-hidden="true">
              {billing.yearlyLabel}
            </span>
          </div>
        </Reveal>

        <RevealGroup
          className="plans-tray mt-[clamp(2rem,5vh,3rem)] grid items-stretch gap-4 rounded-[18px] p-4 sm:grid-cols-2 xl:grid-cols-5"
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
                className={['plan-card', FACE[i], featured ? 'on-light' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* The sweep. One element, so a card that does not carry it
                    costs nothing, and it sits behind everything the card says. */}
                {FACE[i] === 'plan-card--gloss' && (
                  <span className="plan-card__sweep" aria-hidden="true" />
                )}

                {featured && <span className="plan-card__badge">{recommendedLabel}</span>}

                <span className="plan-card__head">
                  <span className="plan-card__code">{CODES[i]}-2026</span>
                  <span className="plan-card__icon" aria-hidden="true">
                    <Icon className="size-[1.15rem]" strokeWidth={1.7} />
                  </span>
                </span>

                <h3 className="plan-card__name">{r.name}</h3>
                <p className="plan-card__who">{r.who}</p>

                <span className="plan-card__perf" aria-hidden="true" />

                <p className="plan-card__label">{headers.price}</p>
                <p
                  data-plan-name={r.name}
                  data-plan-price={r.price}
                  className={`plan-card__price ${hasAmount ? 'ip-fig' : 'plan-card__price--words'}`}
                >
                  <Amount value={shown} />
                </p>
                <p className="plan-card__term">
                  {hasAmount ? (yearly ? billing.perYear : billing.perMonth) : ' '}
                </p>

                <div className="plan-card__action">
                  <Cta href={ctaHref} variant={featured ? 'primary' : 'ghost'} size="sm" block>
                    {ctaLabel}
                  </Cta>
                </div>

                <span className="plan-card__perf" aria-hidden="true" />

                <p className="plan-card__label">{billing.docsLabel}</p>
                <p className="plan-card__quota">
                  <span className="plan-card__tick">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span data-plan-docs={r.docs} className="ip-fig">
                    {r.docs}
                  </span>
                </p>

                <p className="plan-card__label plan-card__label--gap">{everywhereLabel}</p>
                <ul className="plan-card__list">
                  {everywhere.map((f) => (
                    <li key={f}>
                      <span className="plan-card__tick plan-card__tick--sm">
                        <Check className="size-3" strokeWidth={2.5} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <span className="plan-card__perf plan-card__perf--last" aria-hidden="true" />
                <Barcode seed={r.name} />
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
