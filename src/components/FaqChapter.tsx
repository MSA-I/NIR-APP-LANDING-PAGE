// Chapter 05. The look is 21st.dev's faq-monocrhome (@larsen66, id 8323),
// picked by the owner: separated cards rather than a hairline list, a circular
// ring holding a plus that turns into a cross, a lift on hover, and a soft
// glow that follows the pointer across the card.
//
// One thing is NOT taken from it. The catalogue component is a scripted
// accordion: a <button>, a piece of state, and a max-height transition. This
// keeps build 3's native <details>, because that opens without JavaScript, is
// keyboard-operable and screen-reader-announced by the browser, and needs no
// state at all. Everything the owner asked for here is paint, and paint does
// not need the component underneath it to change.

import { useReducedMotion } from 'motion/react'
import type { MouseEvent } from 'react'
import { Html, Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Item = { q: string; a: string }

export function FaqChapter({
  folio,
  h2,
  lede,
  items,
}: {
  folio: string
  h2: string
  lede: string
  items: Item[]
}) {
  const calm = useReducedMotion()

  const trackGlow = (event: MouseEvent<HTMLDivElement>) => {
    if (calm) return
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--faq-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--faq-y', `${event.clientY - rect.top}px`)
  }
  const clearGlow = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.removeProperty('--faq-x')
    event.currentTarget.style.removeProperty('--faq-y')
  }

  return (
    <section id="faq" data-folio={folio} className="py-[clamp(2rem,5vh,3.5rem)]">
      <div className="plate crops on-light bg-wheat-sink py-[clamp(3.5rem,9vh,6.5rem)]">
        <span className="crops__b" aria-hidden="true" />
        <div className="wrap">
          <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
            <SplitHeading className="h-big" text={h2} tint={1} />
            <Reveal delay={0.08}>
              <p className="lede">{lede}</p>
            </Reveal>
          </header>

          <RevealGroup
            as="div"
            className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-3"
            each={0.05}
          >
            {items.map((f, i) => (
              <RevealItem key={f.q}>
                <div className="faq-card" onMouseMove={trackGlow} onMouseLeave={clearGlow}>
                  <span className="faq-card__glow" aria-hidden="true" />
                  {/* `name` makes these an exclusive accordion in the browser itself:
                      opening one closes the others, with no state and no
                      script, which is what the owner asked for and what the
                      catalogue component spends a useState on. */}
                  <details className="faq" name="faq" open={i === 0}>
                    <summary className="faq-card__q">
                      <span className="faq-card__ring" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" className="faq-card__plus">
                          <path
                            d="M12 5v14"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5 12h14"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span className="faq-card__text">{f.q}</span>
                    </summary>
                    <div className="faq__a faq-card__a">
                      <Html html={f.a} className="body max-w-[68ch] text-[0.98rem]" />
                    </div>
                  </details>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
