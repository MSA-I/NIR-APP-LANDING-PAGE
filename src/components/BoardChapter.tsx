// Chapter 02's closing spread, and the ask that follows it.
//
// The three figures are a hairline row, not three identical cards: they are
// three readings off one screen, not three features, and a card grid would
// claim otherwise. They count up when they arrive, which is the one place on
// the page where a number is allowed to move, because these three are the
// first thing the owner sees in the product itself.

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { Cta } from './Cta'
import { Reveal, RevealGroup, RevealItem, SplitHeading, useCalm } from '@/lib/motion'

type Stat = { v: string; l: string }

/** Counts the leading integer of a figure up, and leaves the rest alone. */
function Figure({ value }: { value: string }) {
  const calm = useCalm()
  const ref = useRef<HTMLParagraphElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.6 })
  const [shown, setShown] = useState(calm ? value : null)

  useEffect(() => {
    if (calm || !seen) return
    const match = /^([\d,]+)(.*)$/.exec(value)
    if (!match) {
      setShown(value)
      return
    }
    const target = Number(match[1].replace(/,/g, ''))
    const tail = match[2]
    if (!Number.isFinite(target)) {
      setShown(value)
      return
    }
    const start = performance.now()
    const span = 900
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / span, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(target * eased).toLocaleString('en-US') + tail)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [calm, seen, value])

  return (
    <p
      ref={ref}
      className="ip-fig font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none font-extrabold tracking-[-0.03em] text-ink"
    >
      {shown ?? ' '}
    </p>
  )
}

export function BoardChapter({
  h2,
  p,
  stats,
  img,
  cap,
  midLine,
  ctaLabel,
  ctaHref,
  fineprint,
  imageAlt,
}: {
  h2: string
  p: string
  stats: Stat[]
  img: string
  cap: string
  midLine: string
  ctaLabel: string
  ctaHref: string
  fineprint: string
  imageAlt: string
}) {
  // The control centre is 1800 wide, not the 2000 the five panels in
  // WhatChapter are, so its widest descriptor says so. A descriptor that lies
  // about a file's real width is worse than no srcset at all: the browser sizes
  // its choice off the number, not off the file.
  const ladder = (ext: 'avif' | 'webp') => {
    const base = img.replace(/\.webp$/, '')
    return `/${base}-800.${ext} 800w, /${base}-1440.${ext} 1440w, /${base}.${ext} 1800w`
  }
  const SIZES = '(min-width: 1024px) 62rem, 100vw'

  return (
    <div className="board py-[clamp(4rem,10vh,7rem)]">
      <div className="wrap">
        <header className="board__head grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <SplitHeading className="h-big" text={h2} tint={1} />
          <Reveal delay={0.08}>
            <p className="lede">{p}</p>
          </Reveal>
        </header>

        <RevealGroup className="board__stats mt-[clamp(2.5rem,6vh,4rem)] grid border-t border-onyx-line sm:grid-cols-3">
          {stats.map((s) => (
            <RevealItem
              key={s.l}
              className="board__stat border-b border-onyx-line px-0 py-6 sm:border-b-0 sm:border-s sm:border-s-onyx-line sm:ps-6 sm:first:border-s-0 sm:first:ps-0"
            >
              <Figure value={s.v} />
              <p className="mt-2 max-w-[24ch] text-[0.93rem] text-ink-dim">{s.l}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div className="wrap">
        <Reveal>
          <figure className="board__figure crops relative mx-auto mt-[clamp(2.5rem,6vh,4rem)] mb-0 max-w-[62rem] overflow-clip rounded-[12px] border border-onyx-line bg-onyx-lift">
            <span className="crops__b" aria-hidden="true" />
            {/* Two formats, three widths. This one is drawn at 990 CSS px on
                a 1512px desktop and at 356 on a 390px phone, and unlike the
                five panels in WhatChapter it is 1800 wide rather than 2000, so
                its widest descriptor says 1800. scripts/build-shots.mjs writes
                every cut and carries both measurements. */}
            <picture>
              <source type="image/avif" srcSet={ladder('avif')} sizes={SIZES} />
              <source type="image/webp" srcSet={ladder('webp')} sizes={SIZES} />
              <img
                src={`/${img}`}
                srcSet={ladder('webp')}
                sizes={SIZES}
                alt={imageAlt}
                width={1800}
                height={1788}
                loading="lazy"
                decoding="async"
                className="w-full"
              />
            </picture>
          </figure>
        </Reveal>
        <p className="cap mx-auto max-w-[62rem] pt-3">{cap}</p>
      </div>

      <Reveal>
        <div className="board__ask wrap mt-[clamp(3rem,8vh,5rem)] flex flex-col items-start gap-5 border-t border-onyx-line pt-[clamp(2rem,5vh,3rem)] md:flex-row md:items-center md:justify-between">
          <p className="max-w-[40ch] font-display text-[clamp(1.15rem,2.2vw,1.6rem)] leading-[1.2] font-bold tracking-[-0.02em] text-ink">
            {midLine}
          </p>
          <div className="board__action flex flex-col items-start gap-2">
            <Cta href={ctaHref}>{ctaLabel}</Cta>
            <p className="fineprint">{fineprint}</p>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
