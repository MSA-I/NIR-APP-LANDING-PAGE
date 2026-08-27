// The ground under the title page and the close.
//
// 21st.dev's paper-design-shader-background (@moazamtrade, id 6546), named by
// the owner on 26.08.2026 to replace the hand-written fluted-glass ground that
// came before it. That component is four lines: Paper Shaders' `GrainGradient`
// on `shape: "corners"`, a black back, three colours, and a headline over it.
// This is the same component with the headline dropped (the title page has its
// own) and the recipe re-coloured.
//
// WHY THIS IS THE PACKAGE AND NOT A PORT
// The build before this one carried 460 lines of hand-written WebGL — a vertex
// shader, a fragment shader, a uniform packer, a resize observer, an
// intersection observer, a visibility handler and a context-loss dance. All of
// that existed to render ONE shader. `@paper-design/shaders-react` is 1.7MB on
// disk and a few kilobytes in the bundle, it is the library the catalogue
// component names, and it is maintained by the people whose shader this is.
// Reimplementing it by hand to avoid a dependency was the wrong trade and it
// is not repeated here: "exactly as it looks there" is not a thing a port can
// promise.
//
// THE COLOURS
// The catalogue recipe is orange, yellow and pink on black, which is the
// reference's palette and not this product's. See the note on SHADER_PALETTE
// below for what this one is. scripts/gates/g3-palette.mjs holds every colour
// here to being either a product token or a dated, named entry on its
// allowlist.
//
// The first entry is the ground the gradient sits on; the rest are what moves
// across it, darkest to lightest.
//
// THE POINTER
// `GrainGradient` has no pointer input at all: it is a function of time and
// its own parameters. The owner asked for a ground that does not answer the
// mouse, and this one cannot. G3 also greps this file for the four names the
// old catalogue component's cursor branch used, so a future re-pull that
// brings one back fails rather than shipping.

import { Suspense, lazy, useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'

// Loaded on its own, after the page has painted.
//
// `@paper-design/shaders-react` compiles a WebGL program on mount, and the SEO
// audit of 27.08.2026 measured 834ms of blocked main thread on arrival with it
// in the entry bundle. The ground is decorative and `aria-hidden`: there is no
// reason for it to be in the way of the first thing a reader sees, and every
// reason for the headline above it to arrive first.
const GrainGradient = lazy(() =>
  import('@paper-design/shaders-react').then((m) => ({ default: m.GrainGradient }))
)

// The two colours of the page, and the three mixes between them.
//
// Until 27.08.2026 this ground was the application's teal with the ramp opened
// at both ends. The owner then supplied a reference card with exactly two
// colours on it, Onyx #020202 and Candy Blue #b2d5e5, and asked for the page to
// be in those two. A five-colour teal ramp is not two colours, so the ramp is
// now the straight sRGB line between them and nothing else is on it.
//
// The ground still stands out by LIGHT rather than by hue, which was the whole
// point of the note it answered: the dark end is the page's own ground and the
// light end is the page's own ink, so the gradient is the page's contrast
// range, moving.
//
//   #020202  the page's ground
//   #22282b  18% Candy Blue
//   #5e7078  52% Candy Blue
//   #819aa5  72% Candy Blue
//   #b2d5e5  the page's ink
//
// Darkest to lightest, and the light theme reads the same five in reverse: see
// `recipeFor` below.
export const SHADER_PALETTE = ['#020202', '#22282b', '#5e7078', '#819aa5', '#b2d5e5']

// The catalogue component's numbers, kept: softness 0.76, intensity 0.45,
// noise 0, shape "corners", speed 1. Two departures, both measured against the
// title page rather than guessed:
//   - the lightest colour is weighted down to a quarter of the ramp, because
//     a full share of it is a white field behind a display headline;
//   - `noise` stays at the catalogue's 0. The page paints its own grain over
//     everything (.grain in styles.css), and two grains at different scales
//     read as a compression artefact rather than as film.
//
// The recipe is a function of the theme because these colours are PROPS, not
// CSS: the token swap in src/styles.css cannot reach inside a WebGL program.
// The light theme reads the same five colours from the other end, so the
// ground stays light under a light page instead of becoming a black hole in
// the middle of it.
const RECIPE = {
  softness: 0.76,
  intensity: 0.45,
  noise: 0,
  shape: 'corners' as const,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  speed: 1,
}

function recipeFor(theme: 'dark' | 'light') {
  const ramp = theme === 'light' ? [...SHADER_PALETTE].reverse() : SHADER_PALETTE
  return {
    ...RECIPE,
    colorBack: ramp[0],
    colors: [ramp[1], ramp[3], ramp[2], ramp[4]],
  }
}

export function ShaderBackground({ className }: { className?: string }) {
  const [theme] = useTheme()

  // `prefers-reduced-motion: reduce` freezes the field rather than removing
  // it: the ground becomes a still pane, which is what the reduced-motion
  // gate asserts and what the hand-written ground did before it.
  const [calm, setCalm] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setCalm(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // The ground arrives when the browser has nothing more urgent to do. Until
  // then the pane is the page's own onyx, which is the colour the ground
  // settles to anyway, so the wait reads as depth rather than as a gap.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const idle =
      window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const handle = idle(() => setReady(true), { timeout: 2000 })
    return () => cancel(handle as number)
  }, [])

  // On the server there is no GL context and nothing to paint into, so the
  // static pass (src/entry-static.tsx) emits the empty pane and the client
  // fills it on mount. The ground is decorative and `aria-hidden` either way,
  // so nothing a crawler reads depends on this branch.
  if (typeof window === 'undefined') {
    return (
      <div
        className={className}
        aria-hidden="true"
        style={{ inlineSize: '100%', blockSize: '100%' }}
      />
    )
  }

  return (
    <div className={className} aria-hidden="true" style={{ inlineSize: '100%', blockSize: '100%' }}>
      {ready ? (
        <Suspense fallback={null}>
          <GrainGradient
            {...recipeFor(theme)}
            speed={calm ? 0 : RECIPE.speed}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
