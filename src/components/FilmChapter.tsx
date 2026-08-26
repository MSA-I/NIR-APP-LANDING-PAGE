// Chapter 01. The one place on the page where the scroll drives something.
//
// Build 3 ran this through the scrollcraft engine (56KB of vanilla scroll
// machinery mounted on document.body). Under React the same behaviour is one
// scroll progress and one assignment to `currentTime`, so the engine is not
// carried over; it is parked in archive/build3/engine.
//
// The shape is the plain one: the film column is sticky and stays, the copy
// column is ordinary flow and travels. No pinning maths, no transform on a
// scroll container, and it degrades to a two-column article the moment the
// sticky is dropped.
//
// The clip is 663 frames at 24fps, built by scripts/build-film.mjs. Its last
// frame and the first product screen in chapter 02 are deliberately the same
// screen, so the film does not cut at the end, it hands over.

import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion, useScroll } from 'motion/react'
import { Html, SplitHeading } from '@/lib/motion'

type Block = { h: string; p: string }

export function FilmChapter({
  folio,
  caption,
  blocks,
}: {
  folio: string
  caption: string
  blocks: Block[]
}) {
  const calm = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    if (calm) return
    const video = videoRef.current
    if (!video) return

    // Phones get the smaller cut. Read once: swapping src mid-scroll would
    // reset the playhead the scroll is driving.
    const small = window.matchMedia('(max-width: 767px)').matches
    video.src = small ? '/assets/film-m.mp4' : '/assets/film.mp4'
    video.load()

    let raf = 0
    let want = scrollYProgress.get()
    const step = () => {
      raf = 0
      const duration = video.duration
      // Metadata may not have arrived yet. Dropping the frame here is right,
      // but dropping it silently is what broke the first cut: the reader can
      // scroll past a chapter while a 10MB clip is still opening, and if the
      // only thing that ever applies the playhead is a scroll event, the film
      // stays on frame zero for the rest of the visit. `loadedmetadata` below
      // replays the last wanted position for exactly that case.
      if (!Number.isFinite(duration) || duration <= 0) return
      // fastSeek where it exists (Firefox): an exact seek per frame is what
      // makes a scrubbed clip stutter, and this clip is dense enough that the
      // approximate seek lands on the right picture.
      const at = Math.min(Math.max(want, 0), 1) * duration
      if (typeof video.fastSeek === 'function') video.fastSeek(at)
      else video.currentTime = at
    }
    const schedule = () => {
      if (raf === 0) raf = requestAnimationFrame(step)
    }
    const unsubscribe = scrollYProgress.on('change', (v) => {
      want = v
      schedule()
    })
    video.addEventListener('loadedmetadata', schedule)
    video.addEventListener('canplay', schedule)
    schedule()
    return () => {
      unsubscribe()
      video.removeEventListener('loadedmetadata', schedule)
      video.removeEventListener('canplay', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [calm, scrollYProgress])

  return (
    <section ref={sectionRef} data-folio={folio} data-film className="py-[clamp(3rem,8vh,6rem)]">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16">
        {/* Copy column: ordinary flow, one screen per block. */}
        <div className="order-2 lg:order-1">
          {blocks.map((b, i) => (
            <FilmBlock key={i} block={b} index={i} count={blocks.length} calm={!!calm} />
          ))}
        </div>

        {/* Film column: sticky, and the only thing the scroll drives. */}
        <figure
          className={
            calm
              ? 'order-1 m-0 lg:order-2'
              : 'order-1 m-0 self-start lg:sticky lg:top-[calc(50vh-27vh)] lg:order-2'
          }
        >
          <div className="plate crops mx-0 border border-onyx-line bg-onyx-lift">
            <span className="crops__b" aria-hidden="true" />
            <video
              ref={videoRef}
              className="aspect-[16/10] w-full object-cover"
              poster="/assets/film.webp"
              playsInline
              muted
              preload="metadata"
              aria-label={caption}
            />
          </div>
          <figcaption className="cap pt-3">{caption}</figcaption>
        </figure>
      </div>
    </section>
  )
}

function FilmBlock({
  block,
  index,
  count,
  calm,
}: {
  block: Block
  index: number
  count: number
  calm: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const active = useInView(ref, { amount: 0.6, margin: '-20% 0px -20% 0px' })

  return (
    <div
      ref={ref}
      className={
        calm
          ? 'mb-14'
          : 'flex min-h-[78vh] flex-col justify-center transition-opacity duration-700 lg:min-h-screen'
      }
      style={calm ? undefined : { opacity: active ? 1 : 0.26 }}
    >
      <p className="eyebrow mb-4">
        <span className="ip-num">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
      </p>
      <SplitHeading className="h-mid mb-4" text={block.h} />
      <Html html={block.p} className="body max-w-[46ch]" />
    </div>
  )
}
