// Which of the two colours is the ground.
//
// The page has always had two grounds: the onyx it sits on, and the wheat plate
// that rides on it. A theme is nothing more than which of the two is underneath.
// All of the switching happens in CSS: `:root[data-theme="light"]` redeclares
// the same token names with the two grounds' jobs swapped, and Tailwind compiles
// every utility to `var(--color-…)`, so one attribute on <html> moves the
// authored stylesheet and the utility classes together.
//
// This file therefore does three small things and no more: read the stored
// choice, write the attribute, and let the two components that need to KNOW the
// theme (the toggle, and the shader ground whose colours are props rather than
// CSS) hear about a change.
//
// The first write does NOT happen here. It happens in the inline script in the
// <head> of index.html and of src/lib/page-html.ts, before the first paint,
// because a React effect runs after it and the reader would see a black flash
// on the way to a light page.

import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

/** Same shape as the locale key the language switcher writes. */
export const THEME_KEY = 'inplace.theme'

/** The design's home state. A reader who has never chosen gets the dark page. */
export const DEFAULT_THEME: Theme = 'dark'

/** The two grounds, for the browser chrome that sits above the page.
    `--color-onyx` as each theme resolves it; see the tokens block in
    src/styles.css. Written out because a <meta> tag cannot read a variable. */
const BROWSER_CHROME: Record<Theme, string> = { dark: '#0a171d', light: '#fffcf8' }

const EVENT = 'inplace:theme'

/** What <html> currently says, which the head script has already decided. */
export function readTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME
  return document.documentElement.dataset.theme === 'light' ? 'light' : DEFAULT_THEME
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement

  // A theme swap is not an animation, and for a moment it was being played as
  // one. Nearly every control up in the folio transitions its own `color` and
  // `border-color` (see `.flow` in src/styles.css), and the bar behind them
  // does not transition its ground, so for the length of that transition the
  // page had already turned and the labels had not: cream type on the cream
  // bar, unreadable, for a third of a second on every press of the switch.
  //
  // The flag below suppresses every transition on the page while the attribute
  // changes, and comes off two frames later — long enough for the new colours
  // to be painted, short enough that no hover or focus a reader starts in that
  // window loses its own motion. `delete` rather than `= ''`, because an empty
  // data attribute is still present and would leave the page permanently
  // still.
  root.dataset.themeSwap = ''
  root.dataset.theme = theme
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', BROWSER_CHROME[theme])
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // The choice still holds for this page; only the memory of it is lost.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }))
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete root.dataset.themeSwap
    })
  })
}

/**
 * `[theme, toggle]`, kept in step with <html> rather than owning the truth.
 *
 * More than one component calls this — the toggle in the folio and the shader
 * ground — and they must not disagree, so each subscribes to the same event and
 * the attribute stays the single source.
 */
export function useTheme(): [Theme, () => void] {
  // The static render (src/entry-static.tsx) runs in Node, where there is no
  // document, so the first value is the default in both places and the browser
  // corrects it on mount. Reading storage here instead would make the server's
  // markup and the client's first render disagree.
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    setTheme(readTheme())
    const sync = () => setTheme(readTheme())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  return [theme, () => applyTheme(readTheme() === 'dark' ? 'light' : 'dark')]
}
