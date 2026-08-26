// Chapter 06. The one ask, on the same live ground the page opened on, so the
// reader ends where they started and the shader reads as the page's own
// weather rather than a hero trick.

import { ShaderBackground } from './ShaderBackground'
import { Cta } from './Cta'
import { Reveal, SplitHeading } from '@/lib/motion'

export function CloseChapter({
  folio,
  h2,
  sub,
  p,
  ctaLabel,
  ctaHref,
  fineprint,
}: {
  folio: string
  h2: string
  sub: string
  p: string
  ctaLabel: string
  ctaHref: string
  fineprint: string
}) {
  return (
    <section data-folio={folio} className="pb-[clamp(2rem,5vh,3.5rem)]">
      <div className="plate crops border border-onyx-line/70">
        <div className="absolute inset-0 -z-10">
          <ShaderBackground className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in srgb, #0a171d 86%, transparent) 0%,' +
              ' color-mix(in srgb, #0a171d 52%, transparent) 55%,' +
              ' color-mix(in srgb, #0a171d 90%, transparent) 100%)',
          }}
        />
        <span className="crops__b" aria-hidden="true" />

        <div className="wrap flex min-h-[min(66vh,620px)] flex-col justify-center py-[clamp(3.5rem,9vh,6rem)]">
          {/* The measure goes on the headings themselves. A ch box on the
              wrapper is measured in the wrapper's 17px body font, which is a
              third of the display size inside it, and the line then breaks
              after every word. */}
          <div>
            <SplitHeading as="h2" className="h-hero max-w-[13ch]" text={h2} />
            <SplitHeading
              as="h3"
              className="h-hero mt-1 max-w-[15ch] text-oceanic"
              text={sub}
              delay={0.12}
            />
          </div>
          <Reveal delay={0.1}>
            <p className="lede mt-8 max-w-[48ch]">{p}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-9 flex flex-col items-start gap-3">
              <Cta href={ctaHref}>{ctaLabel}</Cta>
              <p className="fineprint">{fineprint}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
