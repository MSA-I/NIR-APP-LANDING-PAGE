// The folio: the running head of a printed feature, and the page's only fixed
// element. It carries where you are, the way in, and the one ask.
//
// The reference boxes every nav item in its own hairline rectangle rather than
// running them as plain links; that is what makes its header read as a control
// strip instead of a menu. Build 4's second cut goes further on the owner's
// instruction of 26.08.2026: every control up here is the same flow button the
// page's calls to action use, so the header answers a pointer the same way the
// rest of the page does rather than in a dialect of its own.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Cta } from './Cta'

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="1659.81 677.84 156.29 156.29"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M 1669.44 755.823 L 1710.28 755.879 C 1708.61 767.232 1707.38 778.645 1706.59 790.092 L 1736.02 790.07 C 1736.92 781.041 1737.62 771.993 1738.13 762.934 L 1760.32 763.051 C 1759.51 774.972 1758.47 786.875 1757.2 798.755 L 1754.87 825.177 L 1663.53 825.087 L 1669.44 755.823 z" />
      <path d="M 1720.4 686.812 L 1812.38 686.801 C 1811.2 709.917 1808.06 732.974 1806.67 756.062 L 1771.75 756.048 C 1770.71 756.05 1767.89 756.114 1767.79 755.436 C 1766.97 749.628 1769.92 723.931 1770.27 718.871 L 1740.77 718.879 C 1739.68 728.796 1739.03 738.754 1737.95 748.673 C 1729.48 748.622 1723.1 748.384 1714.61 749.043 C 1716.84 728.328 1718.77 707.582 1720.4 686.812 z" />
    </svg>
  )
}

type NavLink = { t: string; href: string }

export function Folio({
  announcement,
  brand,
  first,
  links,
  ctaLabel,
  ctaHref,
  loginLabel,
  loginHref,
  languageControl,
}: {
  /** The strip above the running head. Rendered inside this fixed box so the
      page never has to know how tall two fixed elements are together. */
  announcement?: ReactNode
  brand: string
  first: string
  links: NavLink[]
  ctaLabel: string
  ctaHref: string
  /** The way in for somebody who already has an account. */
  loginLabel: string
  loginHref: string
  /** Compact browser-style language control, shared by desktop and phone. */
  languageControl: ReactNode
}) {
  const [where, setWhere] = useState(first)
  const [lifted, setLifted] = useState(false)
  const boxRef = useRef<HTMLElement>(null)

  // The folio publishes its own height.
  //
  // The title page used to reserve 58px for it, hard-coded, which was its
  // height on the day it was written. The announcement strip made the folio
  // 102px tall and nothing told the hero, so the nav row sat 44px INSIDE the
  // shader plate and cut its top edge and its crop marks: the fault the owner
  // circled on 26.08.2026. It also has to survive the strip being dismissed,
  // which changes the height back again at runtime, so a second constant would
  // have been wrong half the time too.
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const publish = () =>
      document.documentElement.style.setProperty('--folio-h', `${Math.round(box.offsetHeight)}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Which chapter is under the running head. The topmost section whose box
  // still covers the head wins, so the label changes exactly when the chapter
  // does rather than when its middle happens to cross the centre line.
  useEffect(() => {
    const marks = () => Array.from(document.querySelectorAll<HTMLElement>('[data-folio]'))
    const pick = () => {
      let current = first
      for (const el of marks()) {
        if (el.getBoundingClientRect().top <= 96) current = el.dataset.folio || current
      }
      setWhere(current)
    }
    pick()
    window.addEventListener('scroll', pick, { passive: true })
    window.addEventListener('resize', pick)
    return () => {
      window.removeEventListener('scroll', pick)
      window.removeEventListener('resize', pick)
    }
  }, [first])

  return (
    <header
      ref={boxRef}
      data-lifted={lifted ? 'true' : 'false'}
      className="fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-500"
      style={{
        backgroundColor: lifted ? 'color-mix(in srgb, #0a171d 82%, transparent)' : 'transparent',
        backdropFilter: lifted ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: lifted ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${lifted ? 'var(--color-onyx-line)' : 'transparent'}`,
      }}
    >
      {announcement}

      <div className="folio__row wrap flex items-center gap-2 py-3">
        {/* The same chip as every other control up here, minus the arrows a
            wordmark does not take. It used to be a hand-rolled anchor with a
            thinner border, a different radius and a hover of its own, sitting
            first in the row: the fault the owner circled on 26.08.2026. */}
        <a className="brandchip" href="#top" aria-label={brand}>
          <span className="brandchip__fill" aria-hidden="true" />
          <Mark className="size-4" />
          <span>{brand}</span>
        </a>

        <nav aria-label={brand} className="hidden items-center gap-1.5 lg:flex">
          {links.map((l) => (
            <Cta key={l.href} href={l.href} variant="ghost" size="sm">
              {l.t}
            </Cta>
          ))}
        </nav>

        <p
          className="me-auto ms-2 hidden truncate text-[0.78rem] tracking-[0.14em] text-ink-dim xl:block"
          aria-live="polite"
        >
          {where}
        </p>

        <div className="folio__actions ms-auto flex items-center gap-2 lg:ms-0">
          {languageControl}
          <span className="hidden sm:inline-flex">
            <Cta href={loginHref} variant="ghost" size="sm">
              {loginLabel}
            </Cta>
          </span>
          <Cta href={ctaHref} size="sm">
            {ctaLabel}
          </Cta>
        </div>
      </div>
    </header>
  )
}
