// Chapter 02. The wheat plate: five stations of one chain, five real screens.
//
// Two controls, one action. The chain above is the accessible control with a
// real name; the boxes drawn over the product's own navigation inside the
// screenshot are the same action for a reader who is already looking at the
// screen. The second set is aria-hidden and not focusable, because two tab
// stops for one action is worse than one.
//
// The hotspot boxes are measured, not guessed: scripts/capture-demo.mjs reads
// them off the running app. They arrive as a distance from the LEFT edge and
// the page places them from the inline start, which in Hebrew is the right,
// so they are converted: 100 - (x + w). Copied straight across, every hotspot
// lands mirrored, which is what the first cut of build 3 did.

import { useId, useState } from 'react'
import { motion } from 'motion/react'
import NAV from '@/data/demo-nav.json'
import { Html, Reveal, SplitHeading, useCalm } from '@/lib/motion'

type Step = { k: string; t: string; p: string; img: string; cap: string }
type Hot = { label: string; x: number; y: number; w: number; h: number }

const NAV_STEP: Record<string, number> = {
  הזמנות: 0,
  קבלה: 1,
  חשבוניות: 2,
  בקרה: 3,
  ניהול: 4,
}

const navKey = (img: string) => img.replace(/^assets\/screen-/, '').replace(/\.webp$/, '')

export function WhatChapter({
  folio,
  eyebrow,
  h2,
  lede,
  stepsLabel,
  demoHint,
  steps,
}: {
  folio: string
  eyebrow: string
  h2: string
  lede: string
  stepsLabel: string
  demoHint: string
  steps: Step[]
}) {
  const [at, setAt] = useState(0)
  const calm = useCalm()
  const uid = useId()

  return (
    <section id="what" data-folio={folio} className="pt-[clamp(2rem,6vh,4rem)]">
      <div className="plate crops on-light bg-wheat py-[clamp(3.5rem,9vh,6.5rem)]">
        <span className="crops__b" aria-hidden="true" />
        <div className="wrap">
          <header className="max-w-[46rem]">
            <Reveal>
              <p className="eyebrow eyebrow--on-light mb-5">{eyebrow}</p>
            </Reveal>
            <SplitHeading className="h-big mb-6" text={h2} tint={1} />
            <Reveal delay={0.08}>
              <p className="lede">{lede}</p>
            </Reveal>
          </header>

          {/* The chain. All five stations readable at once, because "one chain
              from the supplier to the bank" IS the product's claim, and a tab
              strip that shows one keyword at a time hides exactly that. */}
          <Reveal delay={0.1}>
            <div
              className="mt-[clamp(2.5rem,5vh,3.5rem)] flex flex-wrap gap-2"
              role="tablist"
              aria-label={stepsLabel}
            >
              {steps.map((s, i) => {
                const on = i === at
                return (
                  <button
                    key={s.k}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${i}`}
                    aria-selected={on}
                    aria-controls={`${uid}-panel-${i}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setAt(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') setAt((i + 1) % steps.length)
                      if (e.key === 'ArrowRight') setAt((i - 1 + steps.length) % steps.length)
                    }}
                    className={[
                      'group relative flex items-center gap-2 rounded-[8px] border px-3.5 py-2.5',
                      'text-[0.9rem] font-semibold transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      on
                        ? 'border-transparent bg-onyx text-ink shadow-[0_10px_28px_-16px_rgba(10,23,29,0.8)]'
                        : 'border-wheat-line bg-transparent text-ink-on-light hover:-translate-y-0.5 hover:border-oceanic-deep',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'ip-num text-[0.72rem] font-bold tracking-[0.06em]',
                        on ? 'text-oceanic' : 'text-oceanic-deep',
                      ].join(' ')}
                    >
                      0{i + 1}
                    </span>
                    <span>{s.k}</span>
                  </button>
                )
              })}
            </div>
          </Reveal>
          <p className="cap mt-3">{demoHint}</p>

          {/* All five panels are in the document; the four that are not
              selected carry `hidden`.

              Until 27.08.2026 this was an AnimatePresence keyed on the active
              index, so exactly ONE panel existed at a time and the others were
              a src swap on a single <img>. The SEO audit measured the result:
              clicking through every station never raised the image count on the
              page above two. Five real screenshots of the product, with five
              written alt texts, existed for nobody, and for a crawler that does
              not execute JavaScript the chapter had one picture in it.

              Rendering all five costs nothing to load: `hidden` is display:none,
              and a lazy image inside display:none is never fetched. It also
              happens to be the correct tabs pattern, where the panels exist and
              the inactive ones are hidden rather than destroyed. */}
          <div className="mt-[clamp(2rem,4vh,3rem)]">
            {steps.map((s, i) => {
              const on = i === at
              const panelHots = ((NAV as Record<string, Hot[]>)[navKey(s.img)] || []).filter(
                (n) => n.label in NAV_STEP,
              )
              const title = s.t.replace(/&nbsp;/g, ' ')
              return (
                <motion.div
                  key={s.k}
                  id={`${uid}-panel-${i}`}
                  role="tabpanel"
                  aria-labelledby={`${uid}-tab-${i}`}
                  hidden={!on}
                  initial={false}
                  animate={calm ? false : on ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12"
                >
                  <div className="self-center">
                    <h3 className="h-step mb-3">{title}</h3>
                    <Html html={s.p} className="body max-w-[46ch]" />
                  </div>

                  <figure className="m-0">
                    <div className="relative overflow-clip rounded-[10px] border border-wheat-line bg-white shadow-[0_30px_70px_-40px_rgba(10,23,29,0.55)]">
                      <img
                        src={`/${s.img}`}
                        alt={`${title}. מסך מתוך InPlace`}
                        width={2000}
                        height={1334}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full"
                      />
                      <div aria-hidden="true">
                        {panelHots.map((n) => (
                          <button
                            key={n.label}
                            type="button"
                            tabIndex={-1}
                            title={n.label}
                            onClick={() => setAt(NAV_STEP[n.label])}
                            className="absolute rounded-[4px] border border-transparent transition-[background-color,border-color] duration-300 hover:border-oceanic-deep hover:bg-[color-mix(in_srgb,var(--color-oceanic)_22%,transparent)]"
                            style={{
                              insetInlineStart: `${(100 - (n.x + n.w) * 100).toFixed(3)}%`,
                              insetBlockStart: `${(n.y * 100).toFixed(3)}%`,
                              inlineSize: `${(n.w * 100).toFixed(3)}%`,
                              blockSize: `${(n.h * 100).toFixed(3)}%`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <Html html={s.cap} className="cap pt-3" />
                  </figure>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
