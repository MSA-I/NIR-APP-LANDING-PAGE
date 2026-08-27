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

export function LogoCloud({
  eyebrow,
  h2,
  items,
}: {
  eyebrow: string
  h2: string
  items: Item[]
}) {
  // Twice through, so the strip meets itself at the halfway point of the
  // translate and the seam never arrives.
  const run = [...items, ...items]

  return (
    <section className="logos py-[clamp(3rem,7vh,4.5rem)]" aria-label={eyebrow}>
      <div className="wrap">
        <Reveal>
          <p className="eyebrow text-center">{eyebrow}</p>
        </Reveal>
        <SplitHeading
          text={h2}
          delay={0.06}
          className="logos__h mx-auto mt-3 max-w-[26ch] text-center font-display text-[clamp(1.15rem,2.4vw,1.75rem)] leading-[1.25] font-medium tracking-[-0.02em] text-ink-soft"
        />

        <div className="logos__rule mx-auto mt-8 max-w-sm" aria-hidden="true" />

        <div className="logos__viewport mt-7">
          <ul className="logos__run">
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
                    // it did. Six marks come to 35KB.
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
