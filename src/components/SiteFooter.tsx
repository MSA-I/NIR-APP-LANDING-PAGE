// The colophon, as a curtain.
//
// The shape is 21st.dev's motion-footer (@easemize, id 11714), picked by the
// owner: the page slides away and the footer is already there underneath —
// an aurora breathing behind a grid, the wordmark at the size of the screen,
// a diagonal marquee, and the links as glass pills that pull toward the
// cursor.
//
// Rebuilt on Motion rather than GSAP. The catalogue component registers
// ScrollTrigger and runs two scrubbed timelines; the same two moves are a
// scroll progress and two transforms here, and the project already ships
// Motion. A second animation library for a parallax and a fade would be 60KB
// for something already in the bundle.
//
// Below md the curtain is dropped and the colophon returns to ordinary flow:
// a fixed panel one viewport tall cannot hold this much on a phone without
// clipping the copyright off the bottom, and a colophon you cannot read is
// worse than one that does not slide.
//
// Terms and privacy point at app.inplace.digital: they are routes inside the
// product, and scripts/gates/g14-figures.mjs fails the build if either moves.

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { Mark } from './Folio'
import { Cta, Magnetic } from './Cta'

type Col = { h: string; links: { t: string; href: string }[] }

export function SiteFooter({
  brand,
  tagline,
  rights,
  cols,
  marquee,
  topLabel,
}: {
  brand: string
  tagline: string
  rights: string
  cols: Col[]
  /** Short phrases for the diagonal strip. The chapter titles, so it says what the page said. */
  marquee: string[]
  /** Accessible name for the return-to-top control: the title page's own folio. */
  topLabel: string
}) {
  const calm = useReducedMotion()
  const revealRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ['start end', 'end end'],
  })
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ['12vh', '0vh'])
  const wordmarkOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 1])

  const strip = [...marquee, ...marquee]

  return (
    <div ref={revealRef} className="footer-reveal">
      <footer className="footer-panel">
        <span className="footer-aurora" aria-hidden="true" />
        <span className="footer-grid" aria-hidden="true" />

        {calm ? (
          <span className="footer-wordmark" aria-hidden="true">
            {brand}
          </span>
        ) : (
          <motion.span
            className="footer-wordmark"
            aria-hidden="true"
            style={{ y: wordmarkY, opacity: wordmarkOpacity }}
          >
            {brand}
          </motion.span>
        )}

        {/* The diagonal strip. The six chapter titles, so the colophon
            repeats what the page just said rather than inventing a slogan. */}
        <div className="footer-strip" aria-hidden="true">
          <div className="footer-strip__run">
            {strip.map((word, i) => (
              <span key={i} className="footer-strip__item">
                {word}
                <span className="footer-strip__dot">✦</span>
              </span>
            ))}
          </div>
        </div>

        <div className="footer-body wrap">
          <a className="footer-brand" href="#top">
            <Mark className="size-5" />
            <span>{brand}</span>
          </a>

          <p className="footer-tagline">{tagline}</p>

          <nav aria-label={cols[0].h} className="footer-nav">
            {cols.map((c) => (
              <div key={c.h} className="footer-nav__group">
                <p className="footer-nav__label">{c.h}</p>
                <ul className="footer-pills">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      {/* The same flow button the rest of the page uses. The
                          catalogue's glass pill had a hover of its own, and a
                          colophon that answers a pointer differently from the
                          page above it reads as a different site. */}
                      <Cta href={l.href} variant="ghost" size="sm">
                        {l.t}
                      </Cta>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-bar wrap">
          <p dir="ltr" className="footer-rights">
            {rights}
          </p>
          <Magnetic pull={0.2}>
            <a className="footer-top" href="#top" aria-label={topLabel}>
              <ArrowUp className="size-4" aria-hidden="true" />
            </a>
          </Magnetic>
        </div>
      </footer>
    </div>
  )
}
