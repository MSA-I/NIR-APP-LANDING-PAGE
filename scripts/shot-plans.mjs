// Photograph chapter 04, at every width, view and edition it has to work in.
//
// Not a gate: a gate asserts and this only looks. It exists because a visual
// round is not finished until the frames have been compared against the
// reference, and eight frames taken by hand is eight chances to take them at
// slightly different scroll positions.
//
//   node scripts/shot-plans.mjs <out-dir>
//
// Runs against dist/, so `npx vite build` first.

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { withPage } from './gates/lib.mjs'

const out = process.argv[2] || 'shots'
await mkdir(out, { recursive: true })

const SHOTS = [
  { tag: 'desk-he-dark', path: '/', viewport: { width: 1440, height: 1000 } },
  { tag: 'desk-he-light', path: '/', viewport: { width: 1440, height: 1000 }, light: true },
  { tag: 'desk-he-yearly', path: '/', viewport: { width: 1440, height: 1000 }, yearly: true },
  { tag: 'desk-he-business', path: '/', viewport: { width: 1440, height: 1000 }, business: true },
  { tag: 'desk-en-dark', path: '/en/', viewport: { width: 1440, height: 1000 } },
  { tag: 'desk-en-light', path: '/en/', viewport: { width: 1440, height: 1000 }, light: true },
  { tag: 'desk-en-yearly', path: '/en/', viewport: { width: 1440, height: 1000 }, yearly: true },
  { tag: 'desk-en-business', path: '/en/', viewport: { width: 1440, height: 1000 }, business: true },
  { tag: 'compare-en', path: '/en/', viewport: { width: 1440, height: 1000 }, compare: true },
  { tag: 'phone-en-yearly', path: '/en/', viewport: { width: 390, height: 844 }, yearly: true },
  { tag: 'phone-en-business', path: '/en/', viewport: { width: 390, height: 844 }, business: true },
  { tag: 'phone-he', path: '/', viewport: { width: 390, height: 844 } },
  { tag: 'phone-he-yearly', path: '/', viewport: { width: 390, height: 844 }, yearly: true },
  { tag: 'phone-he-open', path: '/', viewport: { width: 390, height: 844 }, open: true },
  { tag: 'phone-en', path: '/en/', viewport: { width: 390, height: 844 } },
  { tag: 'compare-he', path: '/', viewport: { width: 1440, height: 1000 }, compare: true },
]

for (const s of SHOTS) {
  await withPage(
    async (page) => {
      if (s.light) {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
      }
      await page.evaluate(() => document.querySelector('#plans').scrollIntoView())
      if (s.business) await page.click('.plans-tabs__tab:nth-child(2)')
      if (s.yearly) await page.click('#plans [role="switch"]')
      if (s.open) await page.evaluate(() => document.querySelector('.plan-card__more').setAttribute('open', ''))
      if (s.compare) await page.evaluate(() => document.querySelector('.plans-compare').setAttribute('open', ''))
      // The count between the two catalogues is 520ms even under `reduce`'s
      // instant path, because the click that starts it is asynchronous.
      await page.waitForTimeout(900)
      const el = await page.$('#plans')
      await el.screenshot({ path: path.join(out, `${s.tag}.png`) })
      const box = await el.boundingBox()
      console.log(`${s.tag.padEnd(18)} ${Math.round(box.width)}x${Math.round(box.height)}`)
    },
    // REDUCED MOTION, AND NOT A LONGER WAIT. Every block in this chapter enters
    // on `whileInView`, so a full-element screenshot photographs whatever never
    // reached the viewport at opacity 0 — the first two runs of this script
    // produced a chapter with no comparison button and no fine print under it,
    // and nothing was wrong with either. Under `reduce` the entrance is not an
    // animation at all (see useCalm in src/lib/motion.tsx): the page renders
    // plain elements, which is also the state a reader with the OS preference
    // set actually sees. G14 reads the catalogue in the same context and for
    // the same class of reason.
    { path: s.path, viewport: s.viewport, reducedMotion: 'reduce' }
  )
}
