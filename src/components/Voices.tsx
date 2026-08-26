// Five quotes, and the sentence that says what they are.
//
// THE SHAPE
// 21st.dev's stagger-testimonials (@vaib215, id 2437), named by the owner on
// 26.08.2026: the grid of cards that came before it "looks far too much like
// the section above it", which it did — chapter 03, the plans and the quotes
// were three grids of the same panel. This is not a grid. It is one rail of
// clipped cards that fans out from the centre, the middle card lifted and
// filled, the rest tilted alternately and clickable to bring them in.
//
// Followed part for part: the notched clip-path, the diagonal rule off the
// top corner, the lift and the fill on the centre card, the alternating tilt,
// the drop shadow under the centre only, and the two square controls at the
// bottom. Three departures:
//
//   1. Colour. The catalogue runs on shadcn's `primary` over `muted/30`.
//      The owner asked for this section in the LIGHT colour, so the rail sits
//      on the page's cream plate and the centre card is the product's action
//      colour, which is the same contrast the plans' featured card makes.
//   2. The portrait. The catalogue puts a pravatar headshot on every card.
//      There are no people to photograph here (see below), so the slot holds
//      the role's own mark instead: a ring with the initial of the trade.
//   3. Direction. `translateX` by position is a physical axis. In a
//      right-to-left page the rail has to fan the other way, so the sign is
//      flipped once, in one place, rather than the whole component mirrored.
//
// WHAT THEY ARE
// The product has not launched and has no customers to quote. Five invented
// people with names and companies would be fabricated proof, so what this
// section carries is five ways of DESCRIBING behaviour the product actually
// has, attributed to a role and a kind of business and to nobody in
// particular. `disclosure` says exactly that, on the page, above the rail.
//
// scripts/gates/g15-placeholders.mjs fails the build if that sentence stops
// rendering while the block is still flagged `placeholder` in the content.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Reveal, SplitHeading } from '@/lib/motion'

type Voice = { q: string; who: string; of: string }

/** The catalogue's own constant: the length of the diagonal rule. */
const SQRT_5000 = Math.sqrt(5000)

function VoiceCard({
  position,
  voice,
  onMove,
  size,
  calm,
}: {
  position: number
  voice: Voice
  onMove: (steps: number) => void
  size: number
  calm: boolean
}) {
  const centre = position === 0
  return (
    <button
      type="button"
      onClick={() => onMove(position)}
      aria-current={centre ? 'true' : undefined}
      className={`voice-card ${centre ? 'voice-card--centre' : ''}`}
      style={{
        // The catalogue centres each card with `translate(-50%, -50%)` on top
        // of `left: 50%`. That is a physical pair, and on a right-to-left page
        // `inset-inline-start: 50%` anchors the card's RIGHT edge, so the same
        // translate walks it a whole half-card off the rail: measured at 380px
        // in a 1440 viewport, where the centre is 720. The centring is a
        // logical negative margin now (see .voice-card in styles.css) and the
        // transform carries only the fan, the lift and the tilt.
        ['--voice-size' as string]: `${size}px`,
        clipPath:
          'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
        transform: `translateX(${(-size / 1.5) * position}px) translateY(${
          centre ? -58 : position % 2 ? 14 : -14
        }px) rotate(${centre ? 0 : position % 2 ? 2.5 : -2.5}deg)`,
        transitionDuration: calm ? '0ms' : undefined,
      }}
    >
      <span
        className="voice-card__rule"
        aria-hidden="true"
        style={{ width: SQRT_5000, insetInlineEnd: -2, insetBlockStart: 48 }}
      />
      <span className="voice-card__mark" aria-hidden="true">
        {voice.who.trim().charAt(0)}
      </span>
      <span className="voice-card__q">{voice.q}</span>
      <span className="voice-card__by">
        <b>{voice.who}</b> {voice.of}
      </span>
    </button>
  )
}

export function Voices({
  eyebrow,
  h2,
  disclosure,
  items,
}: {
  eyebrow: string
  h2: string
  disclosure: string
  items: Voice[]
}) {
  const calm = !!useReducedMotion()
  const [size, setSize] = useState(340)
  const [order, setOrder] = useState(() => items.map((v, i) => ({ ...v, key: i })))
  // Every rotation mints a new key so React re-mounts the card at its new
  // position and the transition runs from where it was, which is the whole
  // effect.
  const [tick, setTick] = useState(0)

  const move = useCallback((steps: number) => {
    if (steps === 0) return
    setOrder((prev) => {
      const next = [...prev]
      if (steps > 0) for (let i = 0; i < steps; i++) next.push(next.shift()!)
      else for (let i = 0; i < -steps; i++) next.unshift(next.pop()!)
      return next
    })
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    const sync = () => setSize(window.matchMedia('(min-width: 640px)').matches ? 340 : 262)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  // The rail's own height: the card, plus the lift, plus the controls.
  const railHeight = useMemo(() => size + 176, [size])

  return (
    <section id="voices" data-placeholder="testimonials" className="py-[clamp(2rem,5vh,3.5rem)]">
      <div className="plate crops on-light bg-wheat-sink py-[clamp(3rem,8vh,5rem)]">
        <span className="crops__b" aria-hidden="true" />
        <div className="wrap">
          <header className="mx-auto max-w-[54rem] text-center">
            <Reveal>
              <p className="eyebrow eyebrow--on-light">{eyebrow}</p>
            </Reveal>
            <SplitHeading className="h-big mt-3 text-center" text={h2} tint={1} />
            <Reveal delay={0.08}>
              <p className="voices__note mx-auto mt-5">{disclosure}</p>
            </Reveal>
          </header>
        </div>

        <div className="voices-rail" style={{ height: railHeight }}>
          {order.map((v, i) => {
            // The catalogue's own formula is `i - (length + 1) / 2` for an odd
            // count, which for its twenty cards is a rounding it never
            // notices. For five it puts the positions at -3..1 and the lifted
            // card a card and a half off the centre of the rail. Five cards
            // want -2..2.
            const position =
              order.length % 2 ? i - (order.length - 1) / 2 : i - order.length / 2
            return (
              <VoiceCard
                key={`${v.key}-${tick}`}
                voice={v}
                position={position}
                onMove={move}
                size={size}
                calm={calm}
              />
            )
          })}
          <div className="voices-rail__controls">
            {/* Leftwards is forwards in Hebrew, so the arrows are swapped
                against the catalogue's and the labels go with them. */}
            <button type="button" onClick={() => move(1)} aria-label="הציטוט הבא">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(-1)} aria-label="הציטוט הקודם">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
