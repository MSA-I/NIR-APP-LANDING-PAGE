// Build the two founder portraits: one square WebP and its AVIF twin, each.
//
// WHY NOT scripts/build-shots.mjs
// That script exists for the product screenshots, and everything it decides is
// decided for them: an 800/1440 ladder sized to a phone drawing a 2000px picture
// of an interface, and `yuv444p` because those are pictures of coloured text on
// a light ground. Neither applies here. These are drawn at 96 CSS px inside a
// paragraph and they never change size with the viewport, so there is no ladder
// to build: one file at 320px covers a ratio-3 phone with pixels to spare.
//
// The sources are 1254px square and already black and white, which is what the
// owner supplied on 28.08.2026. Nothing crops them and nothing converts them:
// a portrait that arrives square stays square, and a picture of a person is the
// last thing to re-grade automatically.
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

/** Drawn at 96 CSS px. 320 is a ratio-3 phone with room over. */
const SIZE = 320

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

// `increase` then a centre crop, so a source that is not square is filled rather
// than squashed. Both of today's are already square and the crop is a no-op.
const scale = `scale=${SIZE}:${SIZE}:force_original_aspect_ratio=increase:flags=lanczos,crop=${SIZE}:${SIZE}`

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
    `${name}  ${SIZE}x${SIZE}  ${kb(webp)}KB WebP, ${kb(avif)}KB AVIF ` +
      `(${Math.round((1 - statSync(avif).size / statSync(webp).size) * 100)}% less)`
  )
}
