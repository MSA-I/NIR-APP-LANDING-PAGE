// The title page. The reference's hero is one bounded plate with a live
// gradient inside it and the headline sitting on top; the plate's edge, not
// the viewport's, is what the eye reads as the frame.
//
// The scrim over the shader is vertical, never horizontal: a horizontal scrim
// has a leading edge, and a leading edge is a direction, and this page is read
// from the other one.
//
// Order inside the plate follows the reference: label, headline, the two
// actions directly under it, and the standing copy along the bottom. The
// second action is not a new ask, it is the page's own first section link, so
// a reader who is not ready to open an account still has somewhere to go.

import { motion, useReducedMotion } from 'motion/react'
import { ShaderBackground } from './ShaderBackground'
import { Cta } from './Cta'
import { Html, Reveal, RevealGroup, RevealItem, Say, SplitHeading } from '@/lib/motion'

type Index = { n: string; t: string; d: string }

export function TitlePage({
  folio,
  eyebrow,
  h1,
  lede,
  indexLabel,
  index,
  ctaLabel,
  ctaHref,
  secondLabel,
  fineprint,
  dir,
}: {
  folio: string
  eyebrow: string
  h1: string
  lede: string[]
  indexLabel: string
  index: Index[]
  ctaLabel: string
  ctaHref: string
  secondLabel: string
  fineprint: string
  dir: 'rtl' | 'ltr'
}) {
  const calm = useReducedMotion()

  return (
    <section
      id="top"
      data-folio={folio}
      // The folio measures itself and publishes --folio-h; see the note in
      // Folio.tsx for what the constant that used to be here cost.
      style={{ paddingBlockStart: 'calc(var(--folio-h, 58px) + 0.5rem)' }}
    >
      <div className="plate crops border border-onyx-line/70 text-ink">
        <div className="absolute inset-0 -z-10">
          <ShaderBackground className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in srgb, #0a171d 68%, transparent) 0%,' +
              ' color-mix(in srgb, #0a171d 16%, transparent) 48%,' +
              ' color-mix(in srgb, #0a171d 84%, transparent) 100%)',
          }}
        />
        <span className="crops__b" aria-hidden="true" />

        <div className="wrap flex min-h-[min(82vh,760px)] flex-col justify-between gap-12 py-[clamp(3.5rem,10vh,6.5rem)]">
          <div>
            <Reveal>
              <p className="eyebrow mb-6">{eyebrow}</p>
            </Reveal>
            <SplitHeading
              as="h1"
              className="h-hero max-w-[22ch]"
              text={h1}
              tint={2}
            />
            <Reveal delay={0.14}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Cta href={ctaHref}>{ctaLabel}</Cta>
                <Cta href="#what" variant="ghost">
                  {secondLabel}
                </Cta>
              </div>
              <p className="fineprint mt-4">{fineprint}</p>
            </Reveal>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            {lede.map((p, i) => (
              <Reveal key={i} delay={0.06 * i}>
                <Html
                  html={p}
                  className="lede max-w-[46ch] text-[color:color-mix(in_srgb,var(--color-ink)_82%,transparent)]"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* The index. A printed feature tells you what is in it before you read
          it, and the reference does the same with its own contents strip. */}
      <nav
        aria-label={indexLabel}
        className="wrap pt-[clamp(3rem,7vh,5rem)] pb-[clamp(1rem,3vh,2rem)]"
      >
        <p className="eyebrow mb-5">{indexLabel}</p>
        <RevealGroup as="ul" className="m-0 list-none border-t border-onyx-line p-0" each={0.05}>
          {index.map((c) => (
            <RevealItem as="li" key={c.n} className="border-b border-onyx-line">
              <motion.div
                className="grid grid-cols-[2.6rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-4 sm:grid-cols-[3.2rem_minmax(0,14rem)_minmax(0,1fr)]"
                whileHover={calm ? undefined : { x: dir === 'rtl' ? -8 : 8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="ip-num text-[0.82rem] font-semibold tracking-[0.08em] text-oceanic">
                  {c.n}
                </span>
                <span className="font-display text-[1.06rem] font-medium tracking-[-0.02em] text-ink">
                  {c.t}
                </span>
                <span className="col-span-2 text-[0.92rem] text-ink-dim sm:col-span-1">
                  <Say text={c.d} />
                </span>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </nav>
    </section>
  )
}
