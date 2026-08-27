// The page's whole motion vocabulary, in one file, so it stays a vocabulary
// and not a pile of one-off transitions.
//
// Three moves only:
//   Reveal / RevealGroup / RevealItem  a block rises and clears as it enters
//   SplitHeading                       a display headline arrives word by word
//   Html                               copy authored with <b> goes in as written
//
// Everything obeys `prefers-reduced-motion`: with it on, each move degrades to
// "already there", not to a faster version of itself.

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * "Is this a place where nothing should move?"
 *
 * Two cases, and they want the same branch. The reader who asked their system
 * for less motion is the obvious one. The other is the static render in
 * scripts/prerender.mjs, which runs in Node: there is no window to ask, no
 * frame to animate in, and the output is a file.
 *
 * That second case matters more than it sounds. `useReducedMotion()` alone
 * resolves to false on the server, so the first cut of the static build shipped
 * every headline as words at `opacity: 0` carrying `aria-hidden="true"` —
 * markup written for an animation that was never going to run, in a file whose
 * whole purpose is to be read by something that does not animate.
 */
export function useCalm() {
  const preference = useReducedMotion()
  return typeof window === 'undefined' || !!preference
}

/**
 * The application's name, wherever it appears in running copy.
 *
 * The owner's note of 26.08.2026: "everywhere the company name is written in
 * the text it should stand out". It appears eleven times across the page, and
 * in nine of them it is one Latin word inside a Hebrew sentence, which is the
 * one place a reader's eye already slows down and the one place the page was
 * doing nothing with it.
 *
 * Done here rather than by hand in eleven places, so a line of copy written
 * next month gets it without anybody having to remember.
 */
export const BRAND = 'InPlace'
const BRAND_RE = /InPlace/g

/** For copy that goes in as markup. Skips anything already inside a tag. */
export const emphasiseBrand = (html: string) =>
  html
    .split(/(<[^>]*>)/g)
    .map((part) =>
      part.startsWith('<') ? part : part.replace(BRAND_RE, `<b class="brand">${BRAND}</b>`)
    )
    .join('')

/** For copy that goes in as text. Returns the line with the name marked. */
export function Say({ text, className }: { text: string; className?: string }) {
  if (!text.includes(BRAND)) return <span className={className}>{text}</span>
  const parts = text.split(BRAND_RE)
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <b className="brand">{BRAND}</b> : null}
        </span>
      ))}
    </span>
  )
}

export const riseIn: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: EASE },
  },
}

export const stagger = (each = 0.06, delay = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: each, delayChildren: delay } },
})

const IN_VIEW = { once: true, amount: 0.15 } as const

/** A block that rises into place the first time it is scrolled to. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const calm = useCalm()
  if (calm) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={IN_VIEW}
      variants={{
        hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
        shown: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.72, ease: EASE, delay },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/** Children rise one after another. Each child should be a <RevealItem>. */
export function RevealGroup({
  children,
  className,
  each = 0.07,
  delay = 0,
  as = 'div',
  ...rest
}: {
  children: ReactNode
  className?: string
  each?: number
  delay?: number
  as?: 'div' | 'ul' | 'tbody'
  'aria-label'?: string
}) {
  const calm = useCalm()
  const props = {
    className,
    initial: 'hidden' as const,
    whileInView: 'shown' as const,
    viewport: IN_VIEW,
    variants: stagger(each, delay),
    ...rest,
  }
  if (calm) {
    if (as === 'ul') return <ul className={className} {...rest}>{children}</ul>
    if (as === 'tbody') return <tbody className={className}>{children}</tbody>
    return <div className={className} {...rest}>{children}</div>
  }
  if (as === 'ul') return <motion.ul {...props}>{children}</motion.ul>
  if (as === 'tbody') return <motion.tbody {...props}>{children}</motion.tbody>
  return <motion.div {...props}>{children}</motion.div>
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'tr'
}) {
  const calm = useCalm()
  if (calm) {
    if (as === 'li') return <li className={className}>{children}</li>
    if (as === 'tr') return <tr className={className}>{children}</tr>
    return <div className={className}>{children}</div>
  }
  if (as === 'li')
    return (
      <motion.li className={className} variants={riseIn}>
        {children}
      </motion.li>
    )
  if (as === 'tr')
    return (
      <motion.tr className={className} variants={riseIn}>
        {children}
      </motion.tr>
    )
  return (
    <motion.div className={className} variants={riseIn}>
      {children}
    </motion.div>
  )
}

// Copy in this repo is authored with <b> and &nbsp;, exactly as build 3 wrote
// it. None of it is user input, so it goes in as markup rather than being
// escaped and losing its emphasis.
export function Html({
  html,
  className,
  as = 'p',
}: {
  html: string
  className?: string
  as?: 'p' | 'span' | 'div'
}) {
  const inner = { __html: emphasiseBrand(html) }
  if (as === 'span') return <span className={className} dangerouslySetInnerHTML={inner} />
  if (as === 'div') return <div className={className} dangerouslySetInnerHTML={inner} />
  return <p className={className} dangerouslySetInnerHTML={inner} />
}

const decode = (s: string) => s.replace(/&nbsp;/g, ' ')

/**
 * A display headline that arrives word by word. Words joined by a non-breaking
 * space in the copy stay one unit, which is the whole reason the copy has them.
 *
 * `tint` sets the last N words in the accent colour: the reference splits its
 * hero headline across two colours, and that split is what stops a very large
 * line from reading as a wall.
 */
export function SplitHeading({
  text,
  className,
  as = 'h2',
  delay = 0,
  tint = 0,
}: {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3'
  delay?: number
  tint?: number
}) {
  const calm = useCalm()
  const plain = decode(text)
  const words = plain.split(' ').filter(Boolean)
  const tintFrom = tint > 0 ? words.length - tint : Infinity

  const inner = words.map((w, i) => (
    <span
      key={i}
      aria-hidden={calm ? undefined : 'true'}
      style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
    >
      {calm ? (
        <span
          className={[i >= tintFrom ? 'text-tint' : '', w === BRAND ? 'brand' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {w}
        </span>
      ) : (
        <motion.span
          style={{ display: 'inline-block' }}
          className={[i >= tintFrom ? 'text-tint' : '', w === BRAND ? 'brand' : '']
            .filter(Boolean)
            .join(' ')}
          variants={{
            hidden: { y: '110%', opacity: 0 },
            shown: { y: '0%', opacity: 1, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          {w}
        </motion.span>
      )}
      {i < words.length - 1 ? ' ' : ''}
    </span>
  ))

  if (calm) {
    if (as === 'h1') return <h1 className={className}>{inner}</h1>
    if (as === 'h3') return <h3 className={className}>{inner}</h3>
    return <h2 className={className}>{inner}</h2>
  }

  const props = {
    className,
    initial: 'hidden' as const,
    whileInView: 'shown' as const,
    viewport: { once: true, amount: 0.35 },
    variants: stagger(0.055, delay),
    'aria-label': plain,
  }
  if (as === 'h1') return <motion.h1 {...props}>{inner}</motion.h1>
  if (as === 'h3') return <motion.h3 {...props}>{inner}</motion.h3>
  return <motion.h2 {...props}>{inner}</motion.h2>
}
