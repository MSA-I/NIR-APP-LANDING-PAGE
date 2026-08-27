// G12: `prefers-reduced-motion: reduce` is honoured, and honoured properly.
//
// Build 4 put motion on every chapter, a live WebGL ground on two of them and
// a scroll-driven film on a third. Under the preference all three have to stop
// — and stopping is not the same as going faster. The gate measures three
// separate things:
//
//   1. the shader stops advancing (two frames, taken a second apart, match)
//   2. the film does not scrub
//   3. nothing on the page still carries a long transition or animation
//
// The control is the same page WITHOUT the preference: if the shader frames
// match there too, the comparison is measuring a still image, not a stopped
// animation.

import { withPage, checker, scrollTo } from './lib.mjs'

const c = checker('G12')

/**
 * Two photographs of the hero canvas, a second apart.
 *
 * Not `canvas.toDataURL`: this context is created without
 * `preserveDrawingBuffer`, so the drawing buffer is already cleared by the time
 * a script can read it and every sample comes back the same blank image. That
 * reads as "the shader is not moving", which is exactly the answer this gate is
 * asking for, and it would be wrong every time. The compositor's own output is
 * the only honest source, so the frames come off CDP.
 */
async function shaderFrames(page) {
  const box = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null
    const r = canvas.getBoundingClientRect()
    return { x: Math.max(r.x, 0), y: Math.max(r.y, 0), width: Math.min(r.width, 900), height: Math.min(r.height, 500), scale: 1 }
  })
  if (!box) return [null, null]
  const cdp = await page.context().newCDPSession(page)
  const grab = async () => {
    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      clip: box,
      fromSurface: true,
      captureBeyondViewport: false,
    })
    return shot.data
  }
  const a = await grab()
  await page.waitForTimeout(1200)
  const b = await grab()
  return [a, b]
}

// ---- the control: motion is real when the preference is off ---------------
await withPage(
  async (page) => {
    await waitForGround(page)
    const [a, b] = await shaderFrames(page)
    c.ok(Boolean(a), 'no shader canvas on the title page')
    c.ok(a !== b, 'control: the shader does not move even with motion allowed, so this gate is blind')
    c.note('control: with motion allowed, the shader ground advances between frames')
  },
  { reducedMotion: 'no-preference' }
)

/**
 * Wait for the ground to arrive.
 *
 * Since 27.08.2026 the WebGL ground is a dynamic import that mounts on
 * `requestIdleCallback`, so that a decorative, aria-hidden background does not
 * compile a shader program while the headline above it is still arriving. A
 * fixed 600ms wait was enough when it was in the entry bundle and is not now,
 * especially here: these gates run Chrome on SwiftShader, where idle takes
 * longer to come than it ever would on a real machine.
 */
async function waitForGround(page) {
  await page
    .waitForSelector('canvas', { timeout: 8000 })
    .catch(() => {})
  await page.waitForTimeout(400)
}

// ---- the real measurement -------------------------------------------------
await withPage(
  async (page) => {
    await waitForGround(page)

    const [a, b] = await shaderFrames(page)
    c.ok(a === b, 'the shader ground is still advancing under prefers-reduced-motion')
    c.note('shader: two frames a second apart are identical')

    // The film: scroll right through chapter 01 and the playhead must not move.
    const span = await page.evaluate(() => {
      const el = document.querySelector('[data-film]')
      const max = document.documentElement.scrollHeight - innerHeight
      const box = el.getBoundingClientRect()
      const top = box.top + scrollY
      return { from: top / max, to: (top + box.height - innerHeight) / max }
    })
    for (const f of [0.3, 0.6, 0.9]) await scrollTo(page, span.from + (span.to - span.from) * f)
    await page.waitForTimeout(600)
    const playhead = await page.evaluate(
      () => document.querySelector('[data-film] video')?.currentTime ?? -1
    )
    c.ok(playhead === 0, `the film scrubbed to ${playhead}s under prefers-reduced-motion`)
    c.note('film: playhead stays on frame zero')

    // And nothing anywhere is still running a long transition or animation.
    const moving = await page.evaluate(() => {
      const long = []
      for (const el of document.querySelectorAll('body *')) {
        const s = getComputedStyle(el)
        const secs = (v) =>
          v
            .split(',')
            .map((t) => (t.trim().endsWith('ms') ? parseFloat(t) / 1000 : parseFloat(t)))
            .filter((n) => Number.isFinite(n))
        const worst = Math.max(0, ...secs(s.transitionDuration), ...secs(s.animationDuration))
        if (worst > 0.05) {
          long.push(
            el.tagName.toLowerCase() +
              (typeof el.className === 'string' && el.className
                ? '.' + el.className.trim().split(/\s+/)[0]
                : '') +
              ` ${worst}s`
          )
        }
      }
      return long
    })
    c.ok(
      moving.length === 0,
      `${moving.length} element(s) still carry a long transition or animation: ${moving.slice(0, 5).join(', ')}`
    )
    c.note('no element carries a transition or animation longer than 50ms')

    // The copy is all still there. A reduced-motion page that hides the text it
    // was going to animate in is worse than one that animates.
    const visible = await page.evaluate(() => {
      const hidden = []
      for (const el of document.querySelectorAll('h1, h2, h3, p, li')) {
        const s = getComputedStyle(el)
        if (el.textContent.trim() && (s.opacity === '0' || s.visibility === 'hidden')) {
          hidden.push(el.textContent.trim().slice(0, 30))
        }
      }
      return hidden
    })
    c.ok(
      visible.length === 0,
      `${visible.length} text element(s) are invisible under reduced motion: ${visible.slice(0, 3).join(' | ')}`
    )
    c.note('every heading, paragraph and list item is visible')
  },
  { reducedMotion: 'reduce' }
)

c.report()
