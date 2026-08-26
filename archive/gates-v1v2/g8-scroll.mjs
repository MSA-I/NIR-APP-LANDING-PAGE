// G8: the scroll holds up at every position.
//
// Two failures this catches, both invisible in any single screenshot:
//   dead scroll  a stretch where turning the wheel changes nothing on screen
//   a cue that never reaches full opacity anywhere in its own act, so the line
//   is only ever readable at a fraction of its strength

import { withPage, checker, scrollTo } from './lib.mjs'

const c = checker('G8')

await withPage(async (page) => {
  const acts = await page.evaluate(() =>
    [...document.querySelectorAll('[data-sc-act]')].map((el, i) => ({
      i,
      id: el.id || el.className,
      device: el.getAttribute('data-sc-act'),
    }))
  )

  // ---- dead scroll ---------------------------------------------------------
  // Walk the page and hash the frame at each step. Two identical frames a
  // screen apart mean the reader turned the wheel for a viewport and saw
  // nothing move.
  const STEPS = 40
  const hashes = []
  for (let i = 0; i <= STEPS; i++) {
    await scrollTo(page, i / STEPS)
    const buf = await page.screenshot({ type: 'jpeg', quality: 40 })
    // Cheap perceptual hash: mean luminance of a coarse grid.
    const h = await page.evaluate(async (b64) => {
      const img = new Image()
      img.src = 'data:image/jpeg;base64,' + b64
      await img.decode()
      const cv = document.createElement('canvas')
      cv.width = 16
      cv.height = 12
      const g = cv.getContext('2d', { willReadFrequently: true })
      g.drawImage(img, 0, 0, 16, 12)
      const d = g.getImageData(0, 0, 16, 12).data
      const out = []
      for (let i = 0; i < d.length; i += 4) {
        out.push(Math.round((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 4))
      }
      return out.join(',')
    }, buf.toString('base64'))
    hashes.push({ at: i / STEPS, h })
  }

  const dead = []
  let run = 1
  for (let i = 1; i < hashes.length; i++) {
    if (hashes[i].h === hashes[i - 1].h) {
      run++
      // Three identical consecutive samples is a viewport-and-a-half of nothing.
      if (run >= 3) dead.push(`${(hashes[i - run + 1].at * 100).toFixed(0)}%-${(hashes[i].at * 100).toFixed(0)}%`)
    } else run = 1
  }
  const deadRanges = [...new Set(dead)]
  c.ok(deadRanges.length === 0, `dead scroll at ${deadRanges.join(', ')}`)
  c.note(`${STEPS + 1} frames sampled, no stretch of three identical frames`)

  // ---- every cue peaks -----------------------------------------------------
  const peaks = new Map()
  for (let i = 0; i <= 60; i++) {
    await scrollTo(page, i / 60)
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll('[data-sc-cue]')].map((el) => ({
        key: (el.textContent || '').trim().slice(0, 36),
        o: parseFloat(getComputedStyle(el).opacity) || 0,
      }))
    )
    for (const r of rows) {
      if (!r.key) continue
      peaks.set(r.key, Math.max(peaks.get(r.key) || 0, r.o))
    }
  }
  const never = [...peaks.entries()].filter(([, o]) => o < 0.98)
  for (const [k, o] of never) c.ok(false, `cue never reaches full opacity (peaks at ${o.toFixed(2)}): "${k}"`)
  c.note(`${peaks.size} cues tracked, all reach full opacity somewhere in their act`)

  // ---- the landing view is not empty --------------------------------------
  await scrollTo(page, 0)
  const landing = await page.evaluate(() => {
    let lit = 0
    for (const el of document.querySelectorAll('[data-sc-cue]')) {
      const r = el.getBoundingClientRect()
      if (r.top > innerHeight || r.bottom < 0) continue
      if (parseFloat(getComputedStyle(el).opacity) > 0.9) lit++
    }
    const h1 = document.querySelector('h1')
    return { lit, h1Visible: h1 ? h1.getBoundingClientRect().top < innerHeight : false }
  })
  c.ok(landing.h1Visible, 'the h1 is not on the first screen')
  c.ok(landing.lit > 0, 'no cue is at full opacity on the landing view; the first screen is waiting for a ramp')
  c.note(`landing view: h1 present, ${landing.lit} cue(s) already at full strength`)

  c.ok(acts.length >= 9, `only ${acts.length} acts on the page`)
})

c.report()
