// Build every cut of every product screenshot: two narrower widths, and AVIF
// beside WebP at all three.
//
// WHY THE WIDTHS
// The six screen-*.webp files are 2000px and 1800px wide, and that is the right
// width for a desktop: measured on 27.08.2026, the widest of them is drawn at
// 990 CSS px on a 1512px screen, which is 1,980 device pixels on the retina
// displays this audience uses. Nothing to trim there.
//
// A phone is the other half of the same measurement, and it is not close. The
// same images are drawn at 344-356 CSS px on a 390px viewport.
//
// TWO rungs, and the numbers are not a guess. A phone asks for 780 device
// pixels at a ratio of 2 and about 1,170 at a ratio of 3, and a browser will
// not pick a candidate narrower than it needs. A single 1000px rung was
// measured on 28.08.2026 doing nothing at all on a ratio-3 phone: 1,170 is more
// than 1,000, so it stepped straight past it to the 2,000px file. 800 covers
// the ratio-2 phone and 1440 covers the ratio-3 one, and a tablet at 768 CSS px
// and ratio 2 still wants the original.
//
// 1440 rather than a round 1400, and the 40 pixels are the whole point. The
// supporting pages draw these inside a 702px reading column, which is 1,404
// device pixels on a ratio-2 desktop — four pixels over a 1400 rung, so the
// browser skipped it and fetched the 2000px file for a 702px slot. Measured on
// 28.08.2026: 66KB where 20KB would do, for four pixels.
//
// WHY AVIF, AND WHY ONLY AFTER MEASURING
// The owner's condition of 28.08.2026 was that AVIF ships only if it actually
// pays on THIS material, which is interface screenshots: large flat fields and
// small text, exactly the case WebP already handles well. So it was measured
// before it was built, on the largest of the six:
//
//   | encoding                  | bytes   | SSIM against the WebP |
//   |---------------------------|---------|-----------------------|
//   | WebP q82 (what ships)     | 111,932 | reference             |
//   | AVIF crf 24               |  76,827 | 0.9980                |
//   | AVIF crf 28               |  64,871 | 0.9974                |
//   | AVIF crf 30               |  61,130 | 0.9972                |
//   | AVIF crf 34               |  52,746 | 0.9964                |
//
// CRF 30 is 45% smaller at a structural similarity of 0.997, which is over the
// 20% floor the owner set by a wide margin. Hence AVIF ships.
//
// `yuv444p` rather than the usual `yuv420p`, and this is the one setting worth
// arguing about: 420 subsamples colour to a quarter resolution, and these are
// pictures of coloured text on a light ground. 420 was 4KB smaller and smeared
// the teal figures.
//
// It is a committed artefact rather than a build step, exactly like the film and
// the logo wall, because it needs ffmpeg and the deploy machine does not have
// it.
//
//   node scripts/build-shots.mjs

import { readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'public', 'assets')

/** The narrower widths. The full-width original is the third rung and already exists. */
export const RUNGS = [800, 1440]

/** See the table above. */
const AVIF_CRF = 30

const sources = readdirSync(DIR)
  .filter((f) => /^screen-.*\.webp$/.test(f) && !/-\d+\.webp$/.test(f))
  .sort()

if (!sources.length) throw new Error(`no screen-*.webp in ${DIR}`)

const ff = (args, what) => {
  const run = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' })
  if (run.status !== 0) throw new Error(`ffmpeg failed on ${what}: ${run.stderr || run.error?.message}`)
}

const kb = (f) => (statSync(f).size / 1024).toFixed(0)

let webpBytes = 0
let avifBytes = 0

for (const file of sources) {
  const from = path.join(DIR, file)
  const base = file.replace(/\.webp$/, '')

  // The narrow WebP cuts.
  for (const rung of RUNGS) {
    const to = path.join(DIR, `${base}-${rung}.webp`)
    ff(
      ['-i', from, '-vf', `scale=${rung}:-2:flags=lanczos`,
       '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', to],
      `${file} at ${rung}px`
    )
    console.log(`${base}-${rung}.webp  ${kb(to)}KB from ${kb(from)}KB`)
  }

  // AVIF at every width, the original included. `-still-picture` writes a single
  // frame rather than a one-frame video, which is what an <img> can decode.
  for (const rung of [...RUNGS, null]) {
    const to = path.join(DIR, rung ? `${base}-${rung}.avif` : `${base}.avif`)
    const scale = rung ? ['-vf', `scale=${rung}:-2:flags=lanczos`] : []
    ff(
      ['-i', from, ...scale,
       '-c:v', 'libaom-av1', '-crf', String(AVIF_CRF), '-cpu-used', '5',
       '-still-picture', '1', '-pix_fmt', 'yuv444p', to],
      `${file} as AVIF${rung ? ` at ${rung}px` : ''}`
    )
    const twin = path.join(DIR, rung ? `${base}-${rung}.webp` : file)
    webpBytes += statSync(twin).size
    avifBytes += statSync(to).size
    console.log(
      `${path.basename(to)}  ${kb(to)}KB against ${kb(twin)}KB of WebP ` +
        `(${Math.round((1 - statSync(to).size / statSync(twin).size) * 100)}% less)`
    )
  }
}

console.log(
  `\n${sources.length} screenshots, ${sources.length * 3} widths. ` +
    `AVIF is ${Math.round((1 - avifBytes / webpBytes) * 100)}% smaller than WebP across all of them ` +
    `(${(avifBytes / 1024).toFixed(0)}KB against ${(webpBytes / 1024).toFixed(0)}KB).`
)
