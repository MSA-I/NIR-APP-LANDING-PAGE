// G10: chapter 01's film still moves with the scroll.
//
// This is the one act on the page the scroll drives, and it is the piece that
// changed the most in the rebuild: build 3 ran it through the scrollcraft
// engine, build 4 runs it off a scroll progress. The behaviour has to be the
// same, so it is measured the same way: the playhead is read at a series of
// scroll positions and must climb.
//
// The control is the top of the page. If the playhead reads as moving there,
// where the film is nowhere near the viewport, the measurement is not
// measuring the scroll.

import { withPage, checker, scrollTo } from './lib.mjs'

const c = checker('G10')

const read = (page) =>
  page.evaluate(() => {
    const v = document.querySelector('[data-film] video')
    return v ? { t: v.currentTime, d: v.duration, src: v.currentSrc } : null
  })

await withPage(async (page) => {
  // The film section's own extent, as a fraction of the page.
  const span = await page.evaluate(() => {
    const el = document.querySelector('[data-film]')
    if (!el) return null
    const max = document.documentElement.scrollHeight - innerHeight
    const box = el.getBoundingClientRect()
    const top = box.top + scrollY
    return { from: top / max, to: (top + box.height - innerHeight) / max }
  })
  c.ok(Boolean(span), 'chapter 01 is not on the page')
  if (!span) return

  await page.waitForFunction(
    () => {
      const v = document.querySelector('[data-film] video')
      return v && Number.isFinite(v.duration) && v.duration > 0
    },
    { timeout: 30000 }
  )

  const first = await read(page)
  c.note(`clip: ${first.d.toFixed(2)}s, ${first.src.split('/').pop()}`)
  c.ok(first.d > 20, `the clip should be the full 27.6s cut, it is ${first.d.toFixed(2)}s`)

  const readings = []
  for (const f of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    await scrollTo(page, span.from + (span.to - span.from) * f)
    // A seek is asynchronous; wait for it to land rather than sampling mid-seek.
    await page
      .waitForFunction(
        () => {
          const v = document.querySelector('[data-film] video')
          return v && !v.seeking
        },
        { timeout: 5000 }
      )
      .catch(() => {})
    readings.push((await read(page)).t)
  }
  c.note('playhead: ' + readings.map((t) => t.toFixed(2) + 's').join(' -> '))

  let climbs = 0
  for (let i = 1; i < readings.length; i++) if (readings[i] > readings[i - 1] + 0.2) climbs++
  c.ok(
    climbs >= readings.length - 2,
    `the playhead should climb at every step, it climbed at ${climbs} of ${readings.length - 1}`
  )
  c.ok(
    readings.at(-1) > first.d * 0.85,
    `the act should end on the last frames, it ended at ${readings.at(-1).toFixed(2)}s of ${first.d.toFixed(2)}s`
  )

  // ---- the control: the top of the page is not the film --------------------
  await scrollTo(page, 0)
  await page.waitForTimeout(400)
  const atTop = (await read(page)).t
  c.ok(
    atTop < 0.5,
    `the playhead reads ${atTop.toFixed(2)}s at the top of the page, so it is not following the act`
  )
  c.note(`control: playhead is ${atTop.toFixed(2)}s at the top of the page`)
})

c.report()
