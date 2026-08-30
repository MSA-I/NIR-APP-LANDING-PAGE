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

import { useEffect, useState } from 'react'
import { ArrowUp, ChevronDown } from 'lucide-react'
import { Mark } from './Folio'
import { Cta, Magnetic } from './Cta'

type Col = { h: string; links: { t: string; href: string }[] }

export function SiteFooter({
  brand,
  tagline,
  rights,
  cols,
  more,
  marquee,
  topLabel,
}: {
  brand: string
  tagline: string
  rights: string
  cols: Col[]
  /**
   * The supporting pages.
   *
   * Passed in rather than read from he.ts, which g2 freezes at build 3's
   * wording. They live here because this is the only place on the home page
   * that can link them: without a link from the page that has the authority,
   * six documents in the sitemap are six documents nobody arrives at.
   */
  more?: Col
  /** Short phrases for the diagonal strip. The chapter titles, so it says what the page said. */
  marquee: string[]
  /** Accessible name for the return-to-top control: the title page's own folio. */
  topLabel: string
}) {
  const strip = [...marquee, ...marquee]

  // The colophon's four groups, on a phone, were thirteen pills over six rows
  // — the owner's note of 30.08.2026 that the footer is carrying too much
  // there. Two things answer it together: the product column and the
  // supporting pages are in the drawer now, which is where somebody looks for
  // them mid-page, and down here the groups fold.
  //
  // THEY FOLD, THEY ARE NOT REMOVED. This is the only place on the home page
  // that links the six supporting pages, and a page nothing links to is a page
  // nobody arrives at, whatever the sitemap says. Every link stays in the
  // markup at every width; on a phone the reader opens the one they want.
  //
  // `open` by default, and closed by a `key` remount once a phone says so:
  // the static render in Node has no viewport to ask, so what it writes is the
  // whole colophon, open, which is also what a crawler should read. The first
  // group — the two ways in — stays open at every width, because it is the
  // one somebody who scrolled this far is looking for.
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const read = () => setPhone(mq.matches)
    read()
    mq.addEventListener('change', read)
    return () => mq.removeEventListener('change', read)
  }, [])

  return (
    <div className="footer-reveal">
      <footer className="footer-panel">
        <span className="footer-aurora" aria-hidden="true" />
        <span className="footer-grid" aria-hidden="true" />

        {/* The name of the application, at the size of the screen.
            It used to be scrubbed in on the reveal's own scroll progress, and
            at the one position that matters — the page scrolled all the way
            down, the colophon fully out — Motion reported that progress as 0
            and the wordmark was not drawn at all. Measured: 0.395 at 95% of
            the page, 0.967 at 98%, and 0 at 100%. The curtain IS the reveal;
            a second reveal inside it bought nothing and cost the one frame
            the reader actually stops on. */}
        <span className="footer-wordmark" aria-hidden="true" data-decorative="">
          {brand}
        </span>

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
            {[...cols, ...(more ? [more] : [])].map((c, i) => (
              <details
                key={`${c.h}${phone ? '-phone' : ''}`}
                className="footer-nav__group"
                open={!phone || i === 0}
              >
                {/* Off the tab path where it cannot do anything: above 640 the
                    group is open and cannot be closed, and a stop that answers
                    nothing is a stop a keyboard reader pays for twice. */}
                <summary className="footer-nav__label" tabIndex={phone ? undefined : -1}>
                  <span>{c.h}</span>
                  <ChevronDown className="footer-nav__chevron size-4" aria-hidden="true" />
                </summary>
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
              </details>
            ))}
          </nav>
        </div>

        {/* Three columns. The line sits on the page's centre; the control and
            the empty span on either side are the same width, so it stays
            there whatever is beside it. */}
        <div className="footer-bar wrap">
          <div className="footer-bar__side">
            <Magnetic pull={0.2}>
              <a className="footer-top" href="#top" aria-label={topLabel}>
                <ArrowUp className="size-4" aria-hidden="true" />
              </a>
            </Magnetic>
          </div>
          <p dir="ltr" className="footer-rights">
            {rights}
          </p>
          <div className="footer-bar__side footer-bar__side--end" aria-hidden="true" />
        </div>
      </footer>
    </div>
  )
}
