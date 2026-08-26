// Chapter 03. Two columns: what InPlace does, and what it refuses to be.
//
// It was a hairline list, then panels, and the owner's note of 26.08.2026 was
// that the panels still read flat. Flat was the right word: two identical
// stacks of five and four boxes, on one unbroken ground, with nothing behind
// them and nothing moving on them. Round eight gives the chapter depth rather
// than decoration, in four moves, each of which the page already makes
// somewhere else:
//
//   1. A GROUND. One soft oceanic pool behind the affirmative column, and a
//      column rule down the gutter. The chapter now has a near and a far.
//   2. A POINTER. The same glow that follows the cursor across the questions
//      in chapter 05, so a card here answers a hand the way a card there does.
//   3. AN INDEX. Each row is numbered. Five things and four things read as
//      two lists rather than as one grey field the moment they are counted.
//   4. AN OFFSET. The refusals start lower than the affirmatives on wide
//      screens, and their marker is a dash rather than a plus. Two matching
//      grids is the shape of an argument with itself; this is a main column
//      and a margin note.
//
// Every line is still the brand's own, lifted from positioning.md. The right
// column is a list of refusals about this product, never a claim about
// somebody else's.

import { Minus, Plus } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import type { MouseEvent } from 'react'
import { Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Row = { t: string; p: string }

function Column({
  label,
  rows,
  tone,
  onMove,
  onLeave,
}: {
  label: string
  rows: Row[]
  tone: 'yes' | 'no'
  onMove: (e: MouseEvent<HTMLDivElement>) => void
  onLeave: (e: MouseEvent<HTMLDivElement>) => void
}) {
  const Icon = tone === 'yes' ? Plus : Minus
  return (
    <div className={tone === 'no' ? 'lg:mt-14' : ''}>
      <p className={`eyebrow mb-5 ${tone === 'no' ? 'text-ink-dim' : ''}`}>{label}</p>
      <RevealGroup as="ul" className="m-0 grid list-none gap-3 p-0">
        {rows.map((r, i) => (
          <RevealItem
            as="li"
            key={r.t}
            className={`why-card why-card--${tone} rounded-[14px] p-5`}
          >
            {/* The pointer glow and the index both live on the card, so the
                card is the thing that has to know where the cursor is. */}
            <div className="why-card__inner" onMouseMove={onMove} onMouseLeave={onLeave}>
              <span className="why-card__glow" aria-hidden="true" />
              <span className="why-card__n ip-fig" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
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
  const calm = useReducedMotion()

  const trackGlow = (event: MouseEvent<HTMLElement>) => {
    if (calm) return
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--why-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--why-y', `${event.clientY - rect.top}px`)
  }
  const clearGlow = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.removeProperty('--why-x')
    event.currentTarget.style.removeProperty('--why-y')
  }

  return (
    <section id="why" data-folio={folio} className="why py-[clamp(4rem,10vh,7rem)]">
      {/* The ground. One pool, off to the affirmative side, so the two
          columns sit at different depths rather than on the same sheet. */}
      <span className="why__pool" aria-hidden="true" />

      <div className="wrap relative">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
          <SplitHeading className="h-big" text={h2} tint={1} />
          <Reveal delay={0.08}>
            <p className="lede">{lede}</p>
          </Reveal>
        </header>

        <div className="why__cols mt-[clamp(2.5rem,6vh,4rem)] grid gap-8 lg:grid-cols-2 lg:gap-10">
          <Column label={yesLabel} rows={yes} tone="yes" onMove={trackGlow} onLeave={clearGlow} />
          <Column label={noLabel} rows={no} tone="no" onMove={trackGlow} onLeave={clearGlow} />
        </div>
      </div>
    </section>
  )
}
