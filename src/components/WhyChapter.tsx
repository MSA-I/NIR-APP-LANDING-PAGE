// Chapter 03. Two columns: what InPlace does, and what it refuses to be.
//
// It was a hairline list, and the owner's note on 26.08.2026 was that it read
// flat. It is panels now, the same card the plans and the questions use, so
// the three chapters that carry a list all carry it the same way. What the
// panels do NOT do is equalise the two columns: the refusals sit on a quieter
// card with a dimmer marker, because a page that presents "what we are" and
// "what we are not" as two matching grids is arguing with itself.
//
// Every line is the brand's own, lifted from positioning.md. The right column
// is a list of refusals about this product, never a claim about somebody
// else's.

import { Minus, Plus } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Row = { t: string; p: string }

function Column({
  label,
  rows,
  tone,
}: {
  label: string
  rows: Row[]
  tone: 'yes' | 'no'
}) {
  const Icon = tone === 'yes' ? Plus : Minus
  return (
    <div>
      <p className={`eyebrow mb-5 ${tone === 'no' ? 'text-ink-dim' : ''}`}>{label}</p>
      <RevealGroup as="ul" className="m-0 grid list-none gap-3 p-0">
        {rows.map((r) => (
          <RevealItem
            as="li"
            key={r.t}
            className={`why-card why-card--${tone} rounded-[14px] p-5`}
          >
            <div className="flex items-start gap-3.5">
              <span className="why-card__ring grid size-8 shrink-0 place-content-center rounded-full">
                <Icon className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div>
                <b
                  className={`block font-display text-[1.08rem] leading-[1.3] font-bold tracking-[-0.02em] ${
                    tone === 'yes' ? 'text-ink' : 'text-ink-soft'
                  }`}
                >
                  {r.t}
                </b>
                <span className="mt-1.5 block text-[0.94rem] leading-[1.6] text-ink-dim">
                  {r.p}
                </span>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  )
}

export function WhyChapter({
  folio,
  h2,
  lede,
  yesLabel,
  yes,
  noLabel,
  no,
}: {
  folio: string
  h2: string
  lede: string
  yesLabel: string
  yes: Row[]
  noLabel: string
  no: Row[]
}) {
  return (
    <section id="why" data-folio={folio} className="py-[clamp(4rem,10vh,7rem)]">
      <div className="wrap">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
          <SplitHeading className="h-big" text={h2} tint={1} />
          <Reveal delay={0.08}>
            <p className="lede">{lede}</p>
          </Reveal>
        </header>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-8 lg:grid-cols-2 lg:gap-10">
          <Column label={yesLabel} rows={yes} tone="yes" />
          <Column label={noLabel} rows={no} tone="no" />
        </div>
      </div>
    </section>
  )
}
