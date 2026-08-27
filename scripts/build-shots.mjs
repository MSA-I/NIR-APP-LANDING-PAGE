// Build the narrow cut of every product screenshot.
//
// WHY
// The six screen-*.webp files are 2000px and 1800px wide, and that is the right
// width: measured on 27.08.2026, the widest of them is drawn at 990 CSS px on a
// 1512px desktop, which is 1980 device pixels on the retina screens this
// audience uses. Nothing to trim there.
//
// A phone is the other half of the same measurement, and it is not close. The
// same images are drawn at 344-356 CSS px on a 390px viewport. Even at a
// device-pixel ratio of 3 that is about 1,070 pixels of demand against 2,000
// pixels of supply, so a phone downloads roughly four times the pixels it can
// show. This pass writes the second rung of the ladder, and the <img> tags in
// WhatChapter and BoardChapter carry a `srcset` so the browser picks.
//
// TWO rungs, and the widths are not a guess. A phone lays these out at about
// 390 CSS px, so it asks for 780 device pixels at a ratio of 2 and 1,170 at a
// ratio of 3, and a browser will not pick a candidate narrower than it needs.
// A single 1000px rung was measured on 28.08.2026 doing nothing at all on a
// ratio-3 phone: 1,170 is more than 1,000, so it stepped straight past it to
// the 2,000px file. 800 covers the ratio-2 phone and 1400 covers the ratio-3
// one, and a tablet at 768 CSS px and ratio 2 still wants the original.
//
// It is a committed artefact rather than a build step, exactly like the film and
// the logo wall, because it needs ffmpeg and the deploy does not have it.
//
//   node scripts/build-shots.mjs

import { readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'public', 'assets')
export const RUNGS = [800, 1400]

const sources = readdirSync(DIR)
  .filter((f) => /^screen-.*\.webp$/.test(f) && !/-\d+\.webp$/.test(f))
  .sort()

if (!sources.length) throw new Error(`no screen-*.webp in ${DIR}`)

for (const file of sources) {
  const from = path.join(DIR, file)
  for (const rung of RUNGS) {
    const to = path.join(DIR, file.replace(/\.webp$/, `-${rung}.webp`))
    const run = spawnSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-i', from,
       '-vf', `scale=${rung}:-2:flags=lanczos`,
       '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', to],
      { encoding: 'utf8' }
    )
    if (run.status !== 0) {
      throw new Error(`ffmpeg failed on ${file} at ${rung}px: ${run.stderr || run.error?.message}`)
    }
    const was = statSync(from).size
    const now = statSync(to).size
    console.log(
      `${path.basename(to)}  ${(now / 1024).toFixed(0)}KB ` +
        `from ${(was / 1024).toFixed(0)}KB (${Math.round((1 - now / was) * 100)}% less)`
    )
  }
}
