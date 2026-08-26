// The logo wall.
//
// 21st.dev's logo-cloud-3 (@sshahaider, id 9320), picked by the owner: a
// heading, a hairline that fades at both ends, an endless strip of marks that
// slows when the pointer is on it, and a second hairline under it. The
// anatomy is followed exactly; two things are not carried over.
//
//   1. The catalogue's InfiniteSlider is framer-motion plus react-use-measure
//      driving a motion value. The same loop is a duplicated run and one CSS
//      animation, which is what the colophon's strip in this project already
//      does. Two packages for a translateX is not a trade this page makes.
//   2. `dark:brightness-0 dark:invert` on the marks. There are no marks yet.
//
// The marks ARE PLACEHOLDERS and the section says so on the page, in
// `disclosure`. See the note at the top of src/content/extra.ts.

import { Reveal, SplitHeading } from '@/lib/motion'

type Item = { mark: string; name: string }

export function LogoCloud({
  eyebrow,
  h2,
  disclosure,
  items,
}: {
  eyebrow: string
  h2: string
  disclosure: string
  items: Item[]
}) {
  // Twice through, so the strip meets itself at the halfway point of the
  // translate and the seam never arrives.
  const run = [...items, ...items]

  return (
    <section
      data-placeholder="logos"
      className="logos py-[clamp(3rem,7vh,4.5rem)]"
      aria-label={eyebrow}
    >
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
          <ul className="logos__run">
            {run.map((it, i) => (
              <li
                key={i}
                className="logos__item"
                // The second pass is the same five marks again; a screen
                // reader should hear them once.
                aria-hidden={i >= items.length ? 'true' : undefined}
              >
                <span className="logos__badge" aria-hidden="true">
                  {it.mark}
                </span>
                <span className="logos__name">{it.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="logos__rule mx-auto mt-7 max-w-sm" aria-hidden="true" />

        <p className="cap mt-4 text-center">{disclosure}</p>
      </div>
    </section>
  )
}
