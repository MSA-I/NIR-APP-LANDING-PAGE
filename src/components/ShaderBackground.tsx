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
// below for what this one is and why it is not the purple it was for a day.
// scripts/gates/g3-palette.mjs holds every colour here to being either a
// product token or a dated, named entry on its allowlist.
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

// The product's own hue, opened up at both ends.
//
// The purple this ground carried for a day is gone. The owner, 27.08.2026: "I
// cannot think of colours that make it stand out without ruining the overall
// design." That is the right instinct and it has a cause: a second brand
// colour cannot make a page stand out, it can only make it two pages. Every
// other surface here is teal — the accent, the buttons, the ticket cards, the
// film's own bars — so a purple ground was one thing arguing with all of them.
//
// So the ground stands out by LIGHT rather than by hue. It is the application's
// own teal with the ramp opened at both ends: the black goes deeper than the
// page's onyx and the light goes brighter than the product's topbar, which is
// what gives a gradient presence. Three of the five are not product tokens for
// that reason, and each is on G3's allowlist by name.
//
//   #04080b  deeper than the page's onyx, so the dark end reads as depth
//   #003f47  color-action, the product's primary action
//   #0d6470  color-action-solid, opened up
//   #5d9096  color-action-line, the line that action draws
//   #cfe3e6  a softer white than color-topbar, so the light end is not a glare
export const SHADER_PALETTE = ['#04080b', '#003f47', '#0d6470', '#5d9096', '#cfe3e6']

// The catalogue component's numbers, kept: softness 0.76, intensity 0.45,
// noise 0, shape "corners", speed 1. Two departures, both measured against the
// title page rather than guessed:
//   - the lightest colour is weighted down to a quarter of the ramp, because
//     #e8eef1 at an equal share is a white field behind a display headline;
//   - `noise` stays at the catalogue's 0. The page paints its own grain over
//     everything (.grain in styles.css), and two grains at different scales
//     read as a compression artefact rather than as film.
const RECIPE = {
  colorBack: SHADER_PALETTE[0],
  colors: [SHADER_PALETTE[1], SHADER_PALETTE[3], SHADER_PALETTE[2], SHADER_PALETTE[4]],
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

export function ShaderBackground({ className }: { className?: string }) {
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
            {...RECIPE}
            speed={calm ? 0 : RECIPE.speed}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
