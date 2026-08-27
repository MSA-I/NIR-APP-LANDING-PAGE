// The light/dark switch.
//
// 21st.dev's theme-toggle (@ayushmxxn, catalogue id 1216), named by the owner
// on 27.08.2026. Its geometry is carried over exactly: a 64x32 pill with 4px of
// padding, two 24px circles inside it held apart by `space-between`, and a 300ms
// slide that carries each circle 32px so the pair swap places. The moon and the
// sun are lucide-react's, at strokeWidth 1.5, which is what the catalogue file
// draws.
//
// THREE DEPARTURES FROM THE CATALOGUE FILE, each because this page is not the
// catalogue's demo page:
//
//   1. It is a <button>, not a <div role="button" tabIndex={0}>. The published
//      component binds `onClick` and nothing else, so Enter and Space do not
//      work it; scripts/gates/g13-keyboard.mjs exists to catch exactly that.
//   2. The slide is logical. `translate-x-8` is a physical direction and a
//      transform is not mirrored by `dir`, so on the Hebrew page the knob would
//      travel out of the pill. `--knob` is +1 in LTR and -1 in RTL, declared in
//      src/styles.css beside the rest of the control's CSS.
//   3. No `cn()`. This repo has no `@/lib/utils` and no `clsx`, and the state
//      the catalogue expresses in ternaries over class strings is one
//      `data-theme-state` attribute here, which the stylesheet reads.
//
// It is stateless. `useTheme` reads the attribute the head script already set,
// so this control never disagrees with the page it is sitting on.

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function ThemeToggle({ toLight, toDark }: { toLight: string; toDark: string }) {
  const [theme, toggle] = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      data-theme-state={theme}
      aria-pressed={!dark}
      aria-label={dark ? toLight : toDark}
      onClick={toggle}
    >
      <span className="theme-toggle__track">
        {/* The filled circle. It always carries the icon of the theme you are
            in, which is why the two icons swap when it travels. */}
        <span className="theme-toggle__knob">
          {dark ? (
            <Moon className="size-4" aria-hidden="true" strokeWidth={1.5} />
          ) : (
            <Sun className="size-4" aria-hidden="true" strokeWidth={1.5} />
          )}
        </span>
        <span className="theme-toggle__ghost">
          {dark ? (
            <Sun className="size-4" aria-hidden="true" strokeWidth={1.5} />
          ) : (
            <Moon className="size-4" aria-hidden="true" strokeWidth={1.5} />
          )}
        </span>
      </span>
    </button>
  )
}
