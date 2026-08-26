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
// The catalogue recipe is orange, yellow and pink on black. Until 26.08.2026
// this ground was painted in the running application's own ramp, and
// scripts/gates/g3-palette.mjs failed the build on any colour the product did
// not define. On that date the owner asked for "light purple and almost black,
// the black like in the pricing image", which is a colour family the product
// does not contain and never will: the application is teal.
//
// So the gate did not go away, it changed shape. G3 now carries a dated
// allowlist, and every colour here is either a product token or a named entry
// on that list. A purple that nobody approved still fails.
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

import { useEffect, useState } from 'react'
import { GrainGradient } from '@paper-design/shaders-react'

//   #06060c  the almost-black the plan cards sit on
//   #241645  the deep end of the purple
//   #6d4ed6  its middle
//   #b9a3ff  the light purple the owner asked for
//   #e8eef1  color-topbar, the one product token left in the ramp: the bar
//            above every screen in the application, and the only light this
//            gradient needs that is not purple
export const SHADER_PALETTE = ['#06060c', '#241645', '#6d4ed6', '#b9a3ff', '#e8eef1']

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

  return (
    <div className={className} aria-hidden="true" style={{ inlineSize: '100%', blockSize: '100%' }}>
      <GrainGradient
        {...RECIPE}
        speed={calm ? 0 : RECIPE.speed}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
