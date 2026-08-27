// The logo wall.
//
// 21st.dev's logo-cloud-3 (@sshahaider, id 9320), picked by the owner: a
// heading, a hairline that fades at both ends, an endless strip of marks that
// slows when the pointer is on it, and a second hairline under it. The
// anatomy is followed exactly; one thing is not carried over.
//
// The catalogue's InfiniteSlider is framer-motion plus react-use-measure
// driving a motion value. The same loop is a duplicated run and one CSS
// animation, which is what the colophon's strip in this project already does.
// Two packages for a translateX is not a trade this page makes.
//
// The marks themselves are the owner's own brand assets, keyed off their
// cards and tinted to one ink by scripts/build-logos.py. See the note at the
// top of that file for why they are one colour rather than six.

import { Reveal, SplitHeading } from '@/lib/motion'

type Item = { src: string; name: string; w: number; h: number }

// The gap between marks, and the divisor the marks are displayed at. Both are
// duplicated from .logos__run in styles.css and from the inline block-size
// below, because the count of copies is worked out here, in numbers, and a
// number cannot be read out of a stylesheet without measuring the page.
const GAP = 42
const DISPLAY_DIVISOR = 1.55
// The widest `.wrap` this section is ever laid out in. styles.css caps it, and
// a strip built for that width is right at every width under it.
const WRAP_MAX = 1280
// Pixels a mark travels per second. 27.08.2026's speed, kept exactly: the old
// strip moved 840px in 42s.
const SPEED = 20

export function LogoCloud({
  eyebrow,
  h2,
  items,
}: {
  eyebrow: string
  h2: string
  items: Item[]
}) {
  // How many times through, and how long one pass takes.
  //
  // The strip is translated by HALF its own width, so the half that is on
  // screen has to be at least as wide as the viewport it sits in. It was not.
  // Two copies of the marks came to 1,680px, of which the moving half was
  // 840px, against a `.wrap` of 1,265px at a 1440 window: from 1024 up, the
  // wall showed bare ground once every cycle, and at 1440 the gap was 425px.
  // The owner saw it as arriving at the section and finding only the start of
  // the logos.
  //
  // The widths are in the data, so the count is arithmetic and not a
  // measurement: no ResizeObserver, nothing that re-seats the run when a mark
  // decodes. An EVEN count, always, because translating by 50% only lands the
  // strip back on itself when the two halves are identical.
  //
  // The duration is derived from the same numbers rather than written in the
  // stylesheet, so adding a mark makes the strip longer without making it
  // faster.
  const copyWidth = items.reduce((sum, it) => sum + it.w / DISPLAY_DIVISOR + GAP, 0)
  const copies = Math.max(2, 2 * Math.ceil(WRAP_MAX / copyWidth))
  const run = Array.from({ length: copies }, () => items).flat()
  const seconds = ((copies / 2) * copyWidth) / SPEED

  return (
    <section className="logos py-[clamp(3rem,7vh,4.5rem)]" aria-label={eyebrow}>
      <div className="wrap">
        <Reveal>
          <p className="eyebrow text-center">{eyebrow}</p>
        </Reveal>
        <SplitHeading
          text={h2}
          delay={0.06}
          className="logos__h mx-auto mt-3 max-w-[26ch] text-center font-display text-[clamp(1.15rem,2.4vw,1.75rem)] leading-[1.25] font-bold tracking-[-0.02em] text-ink-soft"
        />

        <div className="logos__rule mx-auto mt-8 max-w-sm" aria-hidden="true" />

        <div className="logos__viewport mt-7">
          <ul className="logos__run" style={{ animationDuration: `${seconds.toFixed(1)}s` }}>
            {run.map((it, i) => {
              const echo = i >= items.length
              return (
                <li key={i} className="logos__item" aria-hidden={echo ? 'true' : undefined}>
                  <img
                    className="logos__mark"
                    src={`/${it.src}`}
                    alt={echo ? '' : it.name}
                    width={it.w}
                    height={it.h}
                    // EAGER, and deliberately.
                    //
                    // Lazy images inside a marquee are the second half of the
                    // fault the owner reported on 26.08.2026: the strip is
                    // `width: max-content` and the animation translates it by
                    // -50% of ITS OWN width, so every mark that decodes late
                    // changes that width and the whole run visibly re-seats.
                    // Scrolling to the section looked like the animation
                    // restarting because, measured against its own geometry,
                    // it did. Six marks come to 34KB.
                    loading="eager"
                    decoding="sync"
                    // The marks are keyed at 2x of their display height and
                    // each one carries its own optical scale, so the height
                    // comes off the file rather than off one class.
                    style={{ blockSize: `${it.h / 1.55}px`, inlineSize: 'auto' }}
                  />
                </li>
              )
            })}
          </ul>
        </div>

        <div className="logos__rule mx-auto mt-7 max-w-sm" aria-hidden="true" />
      </div>
    </section>
  )
}
