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

import { useEffect, useRef, type CSSProperties } from 'react'
import { useInView, useScroll } from 'motion/react'
import { Html, SplitHeading, useCalm } from '@/lib/motion'

type Block = { h: string; p: string }

/**
 * The four files, written out in full ON PURPOSE.
 *
 * They were `/assets/film${film}.mp4` for about an hour, which reads better and
 * cost the build its own safety net: G19 checks that every media file shipped in
 * dist is REFERENCED somewhere in the built HTML, CSS or JS, by looking for its
 * filename. A name assembled at runtime is not a name it can find, so all four
 * films and both posters were reported as dead weight — 19.8MB of it — and the
 * gate was right to. Literals here, and the check keeps working.
 */
const FILMS: Record<string, { wide: string; phone: string; widePoster: string; phonePoster: string }> = {
  '': {
    wide: '/assets/film.mp4',
    phone: '/assets/film-m.mp4',
    widePoster: '/assets/film.webp',
    phonePoster: '/assets/film-m.webp',
  },
  '-en': {
    wide: '/assets/film-en.mp4',
    phone: '/assets/film-m-en.mp4',
    widePoster: '/assets/film-en.webp',
    phonePoster: '/assets/film-m-en.webp',
  },
}

export function FilmChapter({
  folio,
  caption,
  blocks,
  film = '',
}: {
  folio: string
  caption: string
  blocks: Block[]
  /**
   * Which render to play, as a filename suffix: '' for the Hebrew film and
   * '-en' for the English one.
   *
   * The film is not a recording of the interface — the three-way panel in act
   * two is a screen the product does not have — but everything printed in it
   * IS read off real screens, and since 31.08.2026 those exist in English too.
   * So there are two renders of the same geometry, and the page plays the one
   * its reader is reading. See world/world.html for the string table and
   * scripts/render-world.mjs for how a language becomes a file.
   */
  film?: string
}) {
  const calm = useCalm()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // WHICH CUT, AND WHEN IT IS DECIDED.
    //
    // The film has two renders: film.mp4 is 1920x1080 and film-m.mp4 is
    // 810x1440, a portrait render made for phones. The stylesheet gives the
    // element a 16/10 box above 768px and a 9/16 box below it, and the element
    // is `object-fit: cover`, so the two have to agree: the wrong cut in the
    // right box is not letterboxed, it is cropped to a band out of the middle.
    //
    // This used to be read once, on the grounds that swapping the source
    // mid-scroll would reset the playhead the scroll drives. It does not: the
    // scroll subscription below re-applies the wanted position on every
    // change, and `loadedmetadata` replays it for exactly the case where the
    // clip was still opening. What reading it once actually did was strand the
    // wrong cut in the box whenever the query changed after mount — a rotation,
    // a resized window, or the "desktop site" switch a phone browser offers.
    // Measured on 28.08.2026, loading at 1440 and switching to 390:
    // film.mp4 in a 218x388 box, with 68.4% of every frame thrown away. The
    // other direction is 64.8%. It is the fault round eight fixed for a fresh
    // load, arriving through the door round eight did not close.
    const mq = window.matchMedia('(max-width: 767px)')
    let cut: 'phone' | 'wide' | null = null

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

    // The poster is set whatever the motion preference: under
    // `prefers-reduced-motion` the chapter is a still frame, and a still frame
    // with no picture is a black rectangle. It is set here rather than in the
    // markup because only this line knows which cut applies, and a poster in
    // the markup was downloaded and then replaced, costing a phone both images.
    //
    // Guarded on the cut it last applied, so the query firing for a width that
    // did not cross 768px costs nothing, and so a rotation never re-downloads
    // the clip it is already playing.
    const applyCut = () => {
      const next = mq.matches ? 'phone' : 'wide'
      if (next === cut) return
      cut = next
      // `cut` is already the phone/wide state in this effect, so the file set
      // is named for what it is.
      const files = FILMS[film] ?? FILMS['']
      video.poster = next === 'phone' ? files.phonePoster : files.widePoster
      if (calm) return
      video.src = next === 'phone' ? files.phone : files.wide
      video.load()
      // `load()` drops the playhead to zero and `duration` to NaN. This puts
      // the scroll's own position back the moment the new metadata lands,
      // through the same handler that covers a clip still opening on arrival.
      schedule()
    }

    applyCut()
    mq.addEventListener('change', applyCut)

    if (calm) return () => mq.removeEventListener('change', applyCut)

    const unsubscribe = scrollYProgress.on('change', (v) => {
      want = v
      schedule()
    })
    video.addEventListener('loadedmetadata', schedule)
    video.addEventListener('canplay', schedule)
    schedule()
    return () => {
      mq.removeEventListener('change', applyCut)
      unsubscribe()
      video.removeEventListener('loadedmetadata', schedule)
      video.removeEventListener('canplay', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [calm, scrollYProgress])

  return (
    <section ref={sectionRef} data-folio={folio} data-film className="py-[clamp(3rem,8vh,6rem)]">
      {/* The film comes FIRST in the document now, and the desktop grid puts
          it back on the far side with `order`. Below lg the container is not a
          grid at all but ordinary block flow, which is the only arrangement in
          which the film can stay put while the copy travels: a sticky element
          inside a grid item sticks within its own row, and its own row is
          exactly as tall as it is. */}
      <div
        className={`film-lay wrap gap-10 lg:grid lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16 ${
          calm ? 'film-lay--calm' : ''
        }`}
      >
        {/* Film column: the only thing the scroll drives. */}
        <figure className={calm ? 'film-fig m-0 lg:order-2' : 'film-fig film-fig--stick m-0 lg:order-2'}>
          <div className="plate crops mx-0 border border-onyx-line bg-onyx-lift">
            <span className="crops__b" aria-hidden="true" />
            {/* The ratio is in styles.css, not here: the desktop cut is
                1920x1080 and the phone cut is 810x1440, and a single
                `aspect-[16/10]` for both is what cropped two thirds of the
                phone film away. */}
            {/* No `poster` here, and no `src`.
                Both are set in the effect below, which is the only place that
                knows whether this is the desktop cut or the phone cut. A poster
                declared in the markup was fetched immediately and then replaced
                by the effect, so a phone downloaded BOTH posters: 110KB of the
                16:9 image it was never going to show, at the one moment it can
                least afford it. The element renders nothing until the effect
                runs either way, because the src arrives there too. */}
            <video
              ref={videoRef}
              className="film-video"
              playsInline
              muted
              preload="metadata"
              aria-label={caption}
            />
          </div>
          <figcaption className="cap pt-3">{caption}</figcaption>
        </figure>

        {/* Copy column: ordinary flow, one screen per block. */}
        <div className="film-copy lg:order-1">
          {blocks.map((b, i) => (
            <FilmBlock key={i} block={b} index={i} count={blocks.length} calm={!!calm} />
          ))}
        </div>
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
          : 'film-block flex flex-col justify-center transition-opacity duration-700'
      }
      /* The dim is published as a custom property rather than as `opacity`
         itself, so the phone can decline it in the stylesheet. An inline
         `opacity` cannot be overridden by a media query without `!important`,
         and on a phone the rule has to go: the film is pinned ACROSS the
         copy there, so the block the reader can actually see is the one below
         the film, while the one this observer lights is the one hidden BEHIND
         it. Measured at 375x812, scrollY 2650: block 02 sat at 216–492 with
         the film covering 70–505 — lit, and invisible. */
      style={calm ? undefined : ({ '--film-block-dim': active ? 1 : 0.26 } as CSSProperties)}
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
