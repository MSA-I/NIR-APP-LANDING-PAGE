// Chapter 02. The wheat plate: five stations of one chain, five real screens.
//
// ONE CONTROL, AND IT IS THE CHAIN. Until 31.08.2026 the screenshots also
// carried a second, silent one: boxes drawn over the product's own navigation
// inside the picture, measured off the running app, so a reader already looking
// at the screen could press what they saw. That layer is gone, and the reason
// is in the product rather than in the page.
//
// The application's navigation was rebuilt into dropdown groups. Measured on
// 31.08.2026 against `main`, the top row is Control room, New order, and four
// triggers — Purchasing, Documents, Finance, Control and reports — none of
// which is a station. The three screens this chapter walks live INSIDE those
// menus now. A box could still be drawn over "Purchasing", but pressing it
// would jump to one of the three stations it covers while the real control
// opens a menu, which is the one thing a picture of a product must not do.
//
// The owner's decision, same day: take the layer off. The chain above the
// picture does the same work, it is the accessible control, it is the only one
// a phone ever performed, and it says five things at once rather than hiding
// four of them behind a menu.

import { useEffect, useId, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { motion } from 'motion/react'
import { Html, Reveal, SplitHeading, useCalm } from '@/lib/motion'

type Step = { k: string; t: string; p: string; img: string; cap: string }

/**
 * The srcset for one shot in one format.
 *
 * Three widths, written by scripts/build-shots.mjs, which also carries the
 * measurement behind the two narrow numbers. These five panels are all
 * 2000x1334, so the widest descriptor is a constant here; the control centre in
 * BoardChapter is 1800 wide and says so itself.
 */
const ladder = (img: string, ext: 'avif' | 'webp') => {
  const base = img.replace(/\.webp$/, '')
  return `/${base}-800.${ext} 800w, /${base}-1440.${ext} 1440w, /${base}.${ext} 2000w`
}

const SIZES = '(min-width: 1024px) 55rem, 100vw'

export function WhatChapter({
  folio,
  eyebrow,
  h2,
  lede,
  stepsLabel,
  demoHint,
  steps,
  dir,
  screenAltSuffix,
  zoomLabel,
  closeZoomLabel,
}: {
  folio: string
  eyebrow: string
  h2: string
  lede: string
  stepsLabel: string
  /** From extra.ts, not from the chapter's frozen copy; see the note below. */
  demoHint: string
  steps: Step[]
  dir: 'rtl' | 'ltr'
  screenAltSuffix: string
  zoomLabel: string
  closeZoomLabel: string
}) {
  const [at, setAt] = useState(0)
  const [zoom, setZoom] = useState<number | null>(null)
  const calm = useCalm()
  const uid = useId()
  const zoomRef = useRef<HTMLDialogElement>(null)

  // The screens are 2000px wide and a phone draws them at 344, which puts the
  // product's own type under 3px: the chapter's five pieces of real evidence
  // were, on a phone, five grey smears. The owner's decision of 28.08.2026 is
  // that a press opens the real one.
  //
  // `showModal` rather than an `open` attribute, because only the modal call
  // puts the dialog in the top layer, makes the rest of the page inert, and
  // hands Escape and the backdrop over to the browser. None of those three is
  // worth re-implementing.
  useEffect(() => {
    const el = zoomRef.current
    if (!el) return
    if (zoom == null) {
      if (el.open) el.close()
      return
    }
    if (!el.open) el.showModal()
  }, [zoom])

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
                      const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
                      const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
                      if (e.key === forward) setAt((i + 1) % steps.length)
                      if (e.key === backward) setAt((i - 1 + steps.length) % steps.length)
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
          {/* ONE SENTENCE, and it comes from extra.ts rather than from the
              chapter's own copy. `what.demoHint` in he.ts says the reader can
              press the navigation inside the screenshot; that was true while
              the boxes existed and it is not true now, and he.ts is build 3's
              copy, which G2 freezes leaf by leaf. So the key stays where it is,
              unread, and the sentence that IS true is written beside it. */}
          <p className="cap demo-hint">{demoHint}</p>

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
                      {/* Two formats and three widths, and the browser picks
                          both. The panel is drawn at about 863 CSS px on a
                          1512px desktop and at 344 on a 390px phone, so the
                          2000px file is right for one of them and four times
                          too many pixels for the other; 800 serves a phone at
                          device-pixel-ratio 2 and 1440 serves one at 3.

                          AVIF first because the browser takes the first type it
                          understands, and it is 40% smaller than the WebP on
                          this material. Both numbers were measured before any
                          of this was built; the tables are in
                          scripts/build-shots.mjs. The <img> keeps the WebP
                          ladder, so a browser without AVIF and every crawler
                          still read a complete picture. */}
                      <picture>
                        <source type="image/avif" srcSet={ladder(s.img, 'avif')} sizes={SIZES} />
                        <source type="image/webp" srcSet={ladder(s.img, 'webp')} sizes={SIZES} />
                        <img
                          src={`/${s.img}`}
                          srcSet={ladder(s.img, 'webp')}
                          sizes={SIZES}
                          alt={`${title}. ${screenAltSuffix}`}
                          width={2000}
                          height={1334}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full"
                        />
                      </picture>
                      {/* The whole picture, as one control, AT EVERY WIDTH
                          since 31.08.2026. It was a phone-only affordance,
                          because a phone draws these 2000px screens at 344 and
                          the product's own type lands under 3px there. On a
                          desktop the boxes over the navigation were the way in,
                          and those are gone — so without this a reader with a
                          pointer had nothing to press at all. One behaviour
                          everywhere, and one sentence under the chain to say
                          so. */}
                      <button
                        type="button"
                        data-screen-zoom=""
                        className="screen-zoom"
                        aria-label={`${title}. ${zoomLabel}`}
                        onClick={() => setZoom(i)}
                      >
                        {/* The control was transparent and edge to edge, which
                            on a phone is a picture that gives no sign it can be
                            opened. The chip says so once, quietly, in the
                            corner; it is inside the button, so it is not a
                            second target. */}
                        <span className="screen-zoom__chip" aria-hidden="true">
                          <Maximize2 className="size-3.5" strokeWidth={2} />
                          {zoomLabel}
                        </span>
                      </button>
                    </div>
                    <Html html={s.cap} className="cap pt-3" />
                  </figure>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* One dialog for five screens: only ever one is open, and five copies of
          a 2000px image in the document would cost a phone five downloads it
          did not ask for. The picture inside is at its own width in a scroller,
          so the reader pans and pinches the real screen rather than a version
          of it fitted to a box. */}
      <dialog
        ref={zoomRef}
        className="screen-dialog"
        aria-label={zoom == null ? closeZoomLabel : steps[zoom].t.replace(/&nbsp;/g, ' ')}
        onClose={() => setZoom(null)}
        onClick={(event) => {
          // The backdrop is the dialog's own box outside its content, so a
          // press that lands on the element itself is a press outside.
          if (event.target === zoomRef.current) setZoom(null)
        }}
      >
        {zoom != null && (
          <>
            <button
              type="button"
              className="screen-dialog__close"
              aria-label={closeZoomLabel}
              onClick={() => setZoom(null)}
            >
              <X className="size-5" aria-hidden="true" strokeWidth={2} />
            </button>
            <div className="screen-dialog__scroll">
              <img
                src={`/${steps[zoom].img}`}
                alt={`${steps[zoom].t.replace(/&nbsp;/g, ' ')}. ${screenAltSuffix}`}
                width={2000}
                height={1334}
                decoding="async"
                className="screen-dialog__img"
              />
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}
