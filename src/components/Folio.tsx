// The folio: the running head of a printed feature, and the page's only fixed
// element. It carries the way in and the one ask; the chapter indicator it
// also carried was removed on 27.08.2026 at the owner's request.
//
// The reference boxes every nav item in its own hairline rectangle rather than
// running them as plain links; that is what makes its header read as a control
// strip instead of a menu. Build 4's second cut goes further on the owner's
// instruction of 26.08.2026: every control up here is the same flow button the
// page's calls to action use, so the header answers a pointer the same way the
// rest of the page does rather than in a dialect of its own.

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, Menu } from 'lucide-react'
import { Cta } from './Cta'
import { Drawer } from './Drawer'

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
  links,
  menuGroups = [],
  ctaLabel,
  ctaHref,
  loginLabel,
  loginHref,
  languageControl,
  themeControl,
  menuLabels,
}: {
  /** The strip above the running head. Rendered inside this fixed box so the
      page never has to know how tall two fixed elements are together. */
  announcement?: ReactNode
  brand: string
  links: NavLink[]
  /**
   * What the phone drawer carries beside the chapters: the product column and
   * the supporting pages, which is the half of the colophon the owner asked to
   * take off the phone footer on 30.08.2026.
   */
  menuGroups?: { h: string; links: NavLink[] }[]
  ctaLabel: string
  ctaHref: string
  /** The way in for somebody who already has an account. */
  loginLabel: string
  loginHref: string
  /** Compact browser-style language control, shared by desktop and phone. */
  languageControl: ReactNode
  /** The light/dark switch, beside the language control for the same reason:
      both change how the page is read rather than where it goes. */
  themeControl: ReactNode
  /** The phone menu's three names: the trigger's two states, and the panel's
      own. Below 1024px the chapter list is not in the row. */
  menuLabels: { open: string; close: string; label: string }
}) {
  const [lifted, setLifted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const boxRef = useRef<HTMLElement>(null)
  const menuId = useId()

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

  // Escape, the press outside, and the focus trap belong to the <dialog> the
  // drawer is built on now, and none of the three is re-implemented here. What
  // is left is the one case a dialog knows nothing about: the window growing
  // past the width where the chapter list is in the row anyway. It matters on
  // a tablet turned sideways, where the panel would otherwise stay open over a
  // header already showing the same links.
  useEffect(() => {
    if (!menuOpen) return
    const wide = window.matchMedia('(min-width: 1024px)')
    const onWide = () => wide.matches && setMenuOpen(false)
    wide.addEventListener('change', onWide)
    return () => wide.removeEventListener('change', onWide)
  }, [menuOpen])

  // The press that opened it gets the focus back when it closes, which the
  // browser only does for a dialog it closed itself.
  const closeMenu = () => {
    setMenuOpen(false)
    boxRef.current?.querySelector<HTMLButtonElement>('[data-folio-menu-trigger]')?.focus()
  }

  const groups = menuGroups.length ? menuGroups : [{ h: menuLabels.label, links }]

  return (
    <>
      <header
        ref={boxRef}
        data-lifted={lifted ? 'true' : 'false'}
        className="fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-500"
        style={{
          backgroundColor: lifted
            ? 'color-mix(in srgb, var(--color-onyx) 82%, transparent)'
            : 'transparent',
          backdropFilter: lifted ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: lifted ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${lifted ? 'var(--color-onyx-line)' : 'transparent'}`,
        }}
      >
        {announcement}

        <div className="folio__row wrap flex items-center gap-2 py-3">
          {/* The chapter menu, at the reading start of the row and outside the
            actions group: the owner's placement of 28.08.2026, which is where
            a phone's menu is looked for. Below 1024px the brand beside it is
            taken out of flow and centred, so the row reads menu, mark, actions
            rather than mark, gap, four controls. */}
          <button
            type="button"
            data-folio-menu-trigger=""
            className="folio__icon lg:hidden"
            aria-label={menuOpen ? menuLabels.close : menuLabels.open}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {/* One glyph now, where it used to swap to a cross when the panel
              was open. The drawer carries its own close, and the trigger is
              behind the scrim while it is open, so a cross up here was a
              second close nobody could reach. */}
            <Menu className="size-[1.15rem]" aria-hidden="true" strokeWidth={2} />
          </button>

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

          {/* The gap the chapter indicator used to fill. The indicator went on
            27.08.2026 and the row closed up behind it, which put the page's
            navigation and its actions in one undivided run of pills. The space
            was doing work, so it stays without the text. */}
          <span className="me-auto" aria-hidden="true" />

          <div className="folio__actions ms-auto flex items-center gap-2 lg:ms-0">
            {/* THE WAY BACK IN IS NOT IN THIS ROW ON A PHONE, since 30.08.2026.
              It was an icon circle here from 28.08.2026, beside the action's
              icon circle, and the owner's reading of the result was the
              question the pair could not answer: two round wordless controls
              of the same size, next to each other, and nothing on the screen
              saying why there were two. The row keeps the ONE the page is
              asking for; the way back in is the first item in the drawer,
              where it has its word. The labelled pill from 640px up is
              unchanged. */}

            {/* The switch is the widest control in the row for the least it says,
              and below 768 the row has four other things to hold. It moves
              into the panel there, where it has a label beside it. */}
            <span className="folio__wide-only">{themeControl}</span>
            {languageControl}
            <span className="hidden sm:inline-flex">
              <Cta href={loginHref} variant="ghost" size="sm">
                {loginLabel}
              </Cta>
            </span>
            <Cta href={ctaHref} size="sm" label={ctaLabel}>
              {ctaLabel}
            </Cta>
          </div>
        </div>
      </header>

      {/* Outside the header, and not only for tidiness: the header carries a
        `backdrop-filter` when it is lifted, and a filtered ancestor is a
        containing block for everything under it. The panel is a top-layer
        dialog and has to be measured against the viewport. */}
      <Drawer
        open={menuOpen}
        onClose={closeMenu}
        label={menuLabels.label}
        closeLabel={menuLabels.close}
        panelId={menuId}
        head={
          <a className="drawer__brand" href="#top" onClick={closeMenu}>
            <Mark className="size-5" />
            <span>{brand}</span>
          </a>
        }
        tools={
          <>
            <span className="drawer__langs">{languageControl}</span>
            <span className="drawer__theme">{themeControl}</span>
          </>
        }
      >
        {/* The two asks, first, and both with their word. This is where the
          login icon went on 30.08.2026. */}
        <div className="drawer__asks">
          <Cta href={loginHref} variant="ghost" size="sm" block attrs={{ 'data-folio-login': '' }}>
            {loginLabel}
          </Cta>
          <Cta href={ctaHref} size="sm" block>
            {ctaLabel}
          </Cta>
        </div>

        {groups.map((group) => (
          <section key={group.h} className="drawer__group">
            <p className="drawer__label">{group.h}</p>
            <nav aria-label={group.h}>
              <ul className="drawer__list">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <a
                      data-folio-menu-item=""
                      className="drawer__item"
                      href={l.href}
                      onClick={closeMenu}
                    >
                      <span>{l.t}</span>
                      <ChevronRight className="drawer__chevron size-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        ))}
      </Drawer>
    </>
  )
}
