// The page's buttons.
//
// The flow button, from 21st.dev (@xubohuah/flow-button), picked by the owner
// on 26.08.2026 to replace the sweep this build shipped first. Three moves in
// one press: the ground opens out of the button's own centre, the label slides
// forward, and an arrow crosses from the far edge to the leading one.
//
// Two changes from the catalogue component:
//
//   1. Direction. The catalogue version hard-codes `left`, `right` and
//      `translate-x`, which in Hebrew sends the arrow backwards and the label
//      the wrong way. The moves live in styles.css on logical properties
//      instead, so they mirror with the page, and the arrow is a LEFT arrow
//      because leftwards is forwards here.
//   2. Colour. The catalogue's #111111 is the product's own action colour.
//
// The magnet is still exported, but no longer wraps the page's calls to
// action: it is used by the colophon's pills, where a small pull is the whole
// interaction rather than a second one competing with the flow.

import { ArrowLeft } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const SPRING = { damping: 26, stiffness: 340, mass: 0.6 }

export function Magnetic({
  children,
  pull = 0.25,
  className,
}: {
  children: ReactNode
  pull?: number
  className?: string
}) {
  const calm = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, SPRING)
  const springY = useSpring(y, SPRING)

  useEffect(() => {
    if (calm) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (!armed) {
        x.set(0)
        y.set(0)
        return
      }
      const rect = el.getBoundingClientRect()
      x.set((e.clientX - (rect.left + rect.width / 2)) * pull)
      y.set((e.clientY - (rect.top + rect.height / 2)) * pull)
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [armed, calm, pull, x, y])

  if (calm) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={() => setArmed(true)}
      onMouseLeave={() => setArmed(false)}
      style={{ x: springX, y: springY, display: 'inline-block' }}
    >
      {children}
    </motion.div>
  )
}

export function Cta({
  href,
  children,
  variant = 'primary',
  size,
  block = false,
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  size?: 'sm'
  /** Fill the width of its container, the way a card's action does. */
  block?: boolean
}) {
  const cls = [
    'flow',
    variant === 'primary' ? 'flow--primary' : 'flow--ghost',
    size === 'sm' ? 'flow--sm' : '',
    block ? 'flow--block' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <a className={cls} href={href}>
      <span className="flow__fill" aria-hidden="true" />
      <ArrowLeft className="flow__arrow flow__arrow--lead" aria-hidden="true" strokeWidth={2} />
      <span className="flow__label">{children}</span>
      <ArrowLeft className="flow__arrow flow__arrow--trail" aria-hidden="true" strokeWidth={2} />
    </a>
  )
}
