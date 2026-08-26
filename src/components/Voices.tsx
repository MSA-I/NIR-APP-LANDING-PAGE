// Five quotes, and the sentence that says what they are.
//
// The product has not launched and has no customers to quote. Five invented
// people with names and companies would be fabricated proof, so what this
// section carries instead is five ways of DESCRIBING behaviour the product
// actually has, attributed to a role and a kind of business and to nobody in
// particular. The `disclosure` line says exactly that, on the page, above the
// quotes rather than in a footnote under them.
//
// scripts/gates/g15-placeholders.mjs fails the build if the disclosure stops
// rendering while the block is still flagged `placeholder` in the content, so
// the quotes cannot quietly become testimonials.
//
// The shape is the page's own card, the one chapters 03, 04 and 05 use: a
// mark, a line of type, a rule, an attribution. The first card spans two
// columns because a five-item grid with an orphan reads as a mistake.

import { Quote } from 'lucide-react'
import { Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Voice = { q: string; who: string; of: string }

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
  return (
    <section
      id="voices"
      data-placeholder="testimonials"
      className="py-[clamp(4rem,10vh,7rem)]"
    >
      <div className="wrap">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow mb-4">{eyebrow}</p>
            </Reveal>
            <SplitHeading className="h-big" text={h2} tint={1} />
          </div>
          <Reveal delay={0.08}>
            <p className="voices__note">{disclosure}</p>
          </Reveal>
        </header>

        <RevealGroup
          as="ul"
          each={0.06}
          className="voices mt-[clamp(2.5rem,6vh,4rem)] grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3"
        >
          {items.map((v, i) => (
            <RevealItem
              as="li"
              key={v.q}
              className={`voice rounded-[14px] p-6 ${i === 0 ? 'voice--lead xl:col-span-2' : ''}`}
            >
              <Quote className="voice__mark size-5" aria-hidden="true" strokeWidth={2} />
              <blockquote className="voice__q">{v.q}</blockquote>
              <div className="voice__by">
                <span className="voice__who">{v.who}</span>
                <span className="voice__of">{v.of}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
