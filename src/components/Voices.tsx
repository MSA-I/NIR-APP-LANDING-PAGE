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
//      There are no photographs of these people (see below), so the slot holds
//      a mark instead: the first letter of the attribution.
//   3. Direction. `translateX` by position is a physical axis. In a
//      right-to-left page the rail has to fan the other way, so the sign is
//      flipped once, in one place, rather than the whole component mirrored.
//
// WHAT THEY ARE
// Five responses from people using the system, supplied by the owner on
// 30.08.2026 and quoted as he gave them. Until that day there were none, and
// this section carried five sentences written in-house as examples, attributed
// to a role and a kind of business and to nobody in particular; the section was
// flagged `placeholder` in the content and said so above the rail.
//
// That is over, and three things moved with it: the flag is gone from
// src/content/extra.ts, `data-placeholder` is gone from the section below, and
// `disclosure` now says what the reader is looking at rather than disclaiming
// it. scripts/gates/g15-placeholders.mjs still holds the general rule, that
// anything flagged in the content renders its disclosure on the page, so the
// next stand-in cannot arrive without one.
//
// The portrait slot still shows a letter rather than a face: the mark is the
// first letter of `who`, which used to be the trade and is now the name. There
// are no photographs of these people and inventing one would give back exactly
// the problem the names just solved.

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Reveal, SplitHeading, useCalm } from '@/lib/motion'

type Voice = { q: string; who: string; of: string }

/** The card's width and height, which stopped being one number on 30.08.2026.
 *
 *  THE WIDTH IS CHOSEN AND THE HEIGHT IS MEASURED, and that asymmetry is the
 *  point. The width is a composition: it sets the fan's step (w/1.5) and how
 *  much of the outer pair the rail still shows. The height is not a
 *  composition, it is a consequence, and it is the one number a written
 *  constant kept getting wrong.
 *
 *  A constant tall enough for the longest ENGLISH quote leaves 110px of empty
 *  card under every Hebrew one, because the translations run longer than the
 *  sentences they translate. A constant tall enough for the Hebrew clips the
 *  English, under a clip-path, with no mark on the page to say it happened.
 *  There is no third number, so the component reads the height off the text it
 *  was actually given: it lays the cards out unconstrained once, takes the
 *  tallest, and holds every card to that.
 *
 *  scripts/gates/g6-overflow.mjs checks the result at four widths in both
 *  locales, so a quote that stops fitting fails the build rather than losing
 *  its last two lines quietly. */
type Box = { w: number; h: number }

/** 360 wide leaves the fan where the squares had it and still clears a 1440
 *  viewport. FLOOR is what the card cannot be shorter than however short the
 *  quotes get: below it the notched clip-path starts eating the corners of a
 *  card that has nothing in it to protect. */
const DESK_W = 360
const FLOOR_H = 340

/** On the phone only the centre card is legible (styles.css takes its
 *  neighbours to opacity 0), so the card can be as wide as the screen allows
 *  and there is nothing to leave room for but its own margins. */
const PHONE_GUTTER = 24

/** The catalogue's own constant: the length of the diagonal rule. */
const SQRT_5000 = Math.sqrt(5000)

function VoiceCard({
  position,
  voice,
  onMove,
  box,
  calm,
  dir,
}: {
  position: number
  voice: Voice
  onMove: (steps: number) => void
  box: Box
  calm: boolean
  dir: 'rtl' | 'ltr'
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
        // The fan is a function of the WIDTH, not of the card. When these were
        // squares the two were the same number and nothing said which one the
        // step meant; the card is taller than it is wide now, and a step of
        // h/1.5 would fan them a card and a half apart.
        ['--voice-w' as string]: `${box.w}px`,
        ['--voice-h' as string]: `${box.h}px`,
        clipPath:
          'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
        transform: `translateX(${(dir === 'rtl' ? -1 : 1) * (box.w / 1.5) * position}px) translateY(${
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
  dir,
  nextLabel,
  previousLabel,
}: {
  eyebrow: string
  h2: string
  disclosure: string
  items: Voice[]
  dir: 'rtl' | 'ltr'
  nextLabel: string
  previousLabel: string
}) {
  const calm = useCalm()
  const railRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<Box>({ w: DESK_W, h: FLOOR_H })
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

  // The two-pass measure. The cards are absolutely positioned, so letting them
  // stand at their natural height for the length of one layout costs nothing
  // and moves nothing else on the page.
  //
  // Three things have to be true while the tape is out, and each of them cost a
  // wrong reading first:
  //   - `transition: all` on the card means a width written this frame is still
  //     animating next frame, and every height read off it is a height the card
  //     is on its way out of. Transitions are off for the duration.
  //   - The width has to be the width being measured FOR, not the one the card
  //     is wearing, so it is written before the height is read.
  //   - `offsetHeight`, not `getBoundingClientRect()`: the cards are rotated
  //     2.5deg and the rect returns the box around the rotation, which is about
  //     2% too tall. Layout height ignores transforms.
  useLayoutEffect(() => {
    const measure = () => {
      const wide = window.matchMedia('(min-width: 640px)').matches
      const w = wide ? DESK_W : Math.min(window.innerWidth - PHONE_GUTTER, DESK_W)
      const cards = Array.from(
        railRef.current?.querySelectorAll<HTMLElement>('.voice-card') ?? []
      )
      if (!cards.length) return setBox({ w, h: FLOOR_H })
      const saved = cards.map((c) => [c.style.transition, c.style.blockSize] as const)
      for (const c of cards) {
        c.style.transition = 'none'
        c.style.setProperty('--voice-w', `${w}px`)
        c.style.blockSize = 'auto'
      }
      const tallest = Math.max(FLOOR_H, ...cards.map((c) => c.offsetHeight))
      cards.forEach((c, i) => {
        c.style.transition = saved[i][0]
        c.style.blockSize = saved[i][1]
      })
      setBox({ w, h: Math.ceil(tallest) })
    }
    measure()
    // The display face lands after first paint and sets wider than the
    // fallback, so a height measured before it arrives is a height two lines
    // short of the one the reader gets.
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items])

  // The rail's own height: the card, plus the lift, plus the controls.
  const railHeight = useMemo(() => box.h + 176, [box.h])

  return (
    <section id="voices" className="py-[clamp(2rem,5vh,3.5rem)]">
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

        <div className="voices-rail" ref={railRef} style={{ height: railHeight }}>
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
                box={box}
                calm={calm}
                dir={dir}
              />
            )
          })}
          {/* PREVIOUS IS WRITTEN FIRST, and that is the whole fix.

              This is a flex row, so the first child lands on the RIGHT in
              Hebrew and on the LEFT in English. Written the other way round it
              put a left chevron on the right and a right chevron on the left,
              and the two arrows pointed at each other.

              With previous first, the invariant holds in both locales: the
              control on the left shows a left chevron and the control on the
              right shows a right chevron. Which of them means "next" flips with
              the language, which is why the glyph and the step are both chosen
              from `dir` rather than written down. G4 measures both halves. */}
          <div className="voices-rail__controls">
            <button
              type="button"
              onClick={() => move(dir === 'rtl' ? -1 : 1)}
              aria-label={previousLabel}
            >
              {dir === 'rtl' ? (
                <ChevronRight aria-hidden="true" />
              ) : (
                <ChevronLeft aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => move(dir === 'rtl' ? 1 : -1)}
              aria-label={nextLabel}
            >
              {dir === 'rtl' ? (
                <ChevronLeft aria-hidden="true" />
              ) : (
                <ChevronRight aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
