// The ground inside the top plan's card.
//
// The owner, 28.08.2026: the premium plan gets a gloss and the business plan
// gets "a shader of its own". A gloss is a moving highlight and CSS can draw
// one; a shader is a field, and the honest way to put one in a card is to run
// a shader the page already has the library for.
//
// `MeshGradient` AND NOT `GrainGradient`, which is what the page's own ground
// runs. The same instruction that asked for this card asked for the film grain
// to come off every dark surface, and a shader with "grain" in its name is the
// one place that request would have walked back in through the side door. This
// one is a flow of colour spots with both of its grain dials at zero, so the
// card moves and nothing on it is speckled.
//
// No new dependency: `@paper-design/shaders-react` is already in the bundle for
// the title page's ground, so the card costs a WebGL context and nothing else.
// Three things are taken from ShaderBackground rather than reinvented, because
// they are the same three problems: the idle load, the still pane under
// `prefers-reduced-motion`, and the empty pane on the server.

import { Suspense, lazy, useEffect, useState } from 'react'

const MeshGradient = lazy(() =>
  import('@paper-design/shaders-react').then((m) => ({ default: m.MeshGradient }))
)

/** The card's own violet, opened at both ends the way the teal ramp is. */
const RAMP = ['#1e0b45', '#3b1080', '#5b21b6', '#7c3aed']

const RECIPE = {
  distortion: 0.8,
  swirl: 0.55,
  // Both grain dials at zero. See the note at the top of this file.
  grainMixer: 0,
  grainOverlay: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1.1,
  rotation: 0,
  // Slower than the page's ground, which runs at 1 behind a headline nobody is
  // reading closely. This one sits under fifteen lines of type.
  speed: 0.3,
}

export function PlanShader({ className }: { className?: string }) {
  const [calm, setCalm] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setCalm(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const [ready, setReady] = useState(false)
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const handle = idle(() => setReady(true), { timeout: 2500 })
    return () => cancel(handle as number)
  }, [])

  // The static pass runs in Node, where there is no GL context to paint into.
  // The card's own gradient is underneath either way, so the pane it emits is
  // empty rather than absent and nothing jumps when the client fills it.
  if (typeof window === 'undefined') return <span className={className} aria-hidden="true" />

  return (
    <span className={className} aria-hidden="true">
      {ready ? (
        <Suspense fallback={null}>
          <MeshGradient
            {...RECIPE}
            colors={RAMP}
            speed={calm ? 0 : RECIPE.speed}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </Suspense>
      ) : null}
    </span>
  )
}
