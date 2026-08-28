// Build the two founder portraits: one square WebP and its AVIF twin, each.
//
// WHY NOT scripts/build-shots.mjs
// That script exists for the product screenshots, and everything it decides is
// decided for them: an 800/1440 ladder sized to a phone drawing a 2000px picture
// of an interface, and `yuv444p` because those are pictures of coloured text on
// a light ground. Neither applies here. These are drawn in a frame of a fixed
// size that does not change with the viewport, so there is no ladder to build:
// one file at twice the frame covers a retina screen with pixels to spare.
//
// WHY 360x500, WHICH IS NOT THE SHAPE THEY ARRIVED IN
// The owner chose 21st.dev's team-member-card on 28.08.2026, and that frame is
// 360 by 500. The sources are 1254px square, so filling it means losing the
// sides: the crop takes the middle 903 columns of the square and the full
// height. The subject of each of these two happens to sit in that middle, and
// that is worth stating rather than assuming, because a centre crop is a guess
// about where a person is standing and it is only correct by luck.
//
// The sources are already black and white, which is how the owner supplied them.
// Nothing re-grades them: a picture of a person is the last thing to adjust
// automatically.
//
// A committed artefact rather than a build step, exactly like the screenshots
// and the film, because it needs ffmpeg and the deploy machine does not have it.
//
//   node scripts/build-portraits.mjs <nir-source> <moshe-source>

import { statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'public', 'assets')

/** The frame, in CSS pixels: 21st.dev's `w-90 h-125`. */
const FRAME = { w: 360, h: 500 }

/** Twice the frame, which is a retina screen and then some. */
const W = FRAME.w * 2
const H = FRAME.h * 2

/** The same constant scripts/build-shots.mjs measured its way to. */
const AVIF_CRF = 30

const [nir, moshe] = process.argv.slice(2)
if (!nir || !moshe) {
  console.error('usage: node scripts/build-portraits.mjs <nir-source> <moshe-source>')
  process.exit(1)
}

const ff = (args, what) => {
  const run = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' })
  if (run.status !== 0) throw new Error(`ffmpeg failed on ${what}: ${run.stderr || run.error?.message}`)
}

const kb = (f) => (statSync(f).size / 1024).toFixed(0)

// `increase` fills the frame on the short edge and overflows the long one; the
// crop then takes the middle. Nothing is squashed, and what is lost is the
// sides.
const scale = `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}`

for (const [name, from] of [
  ['portrait-nir', nir],
  ['portrait-moshe', moshe],
]) {
  const webp = path.join(DIR, `${name}.webp`)
  ff(['-i', from, '-vf', scale, '-c:v', 'libwebp', '-quality', '86', '-compression_level', '6', webp], name)

  const avif = path.join(DIR, `${name}.avif`)
  ff(
    ['-i', from, '-vf', scale, '-c:v', 'libaom-av1', '-crf', String(AVIF_CRF),
     '-cpu-used', '5', '-still-picture', '1', '-pix_fmt', 'yuv444p', avif],
    `${name} as AVIF`
  )

  console.log(
    `${name}  ${W}x${H}  ${kb(webp)}KB WebP, ${kb(avif)}KB AVIF ` +
      `(${Math.round((1 - statSync(avif).size / statSync(webp).size) * 100)}% less)`
  )
}
