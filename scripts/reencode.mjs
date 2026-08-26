// Re-encode the rendered legs from their PNG frames.
//
// The render pass writes at a conservative CRF so the frames are the record;
// this pass decides what actually ships. On this material CRF 27 is
// indistinguishable from 21 at 1:1 and roughly half the bytes, which matters:
// a worldflight mounts every leg, and even loading only what is within reach
// the page should not be tens of megabytes.
//
// GOP stays at 8 (4 on mobile). Scrubbing is random access; a long GOP means
// every seek decodes a run of frames and the playhead lags the hand.
//
// Usage: node scripts/reencode.mjs [--crf 27] [--mobile]

import { readdir, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const args = process.argv.slice(2)
const has = (k) => args.includes('--' + k)
const arg = (k, d) => { const i = args.indexOf('--' + k); return i === -1 ? d : args[i + 1] }

const MOBILE = has('mobile')
const CRF = arg('crf', MOBILE ? '29' : '27')
const SUFFIX = MOBILE ? '-m' : ''
const FRAMES = path.resolve('lab/world/frames' + SUFFIX)
const OUT = path.resolve('assets')
const GOP = MOBILE ? 4 : 8

const legs = (await readdir(FRAMES, { withFileTypes: true }))
  .filter((d) => d.isDirectory()).map((d) => d.name).sort()

let total = 0
for (const id of legs) {
  const mp4 = path.join(OUT, id + SUFFIX + '.mp4')
  const enc = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', '24',
    '-i', path.join(FRAMES, id, '%04d.png'),
    '-an',
    '-c:v', 'libx264', '-preset', 'slower', '-crf', CRF,
    '-pix_fmt', 'yuv420p',
    '-g', String(GOP), '-keyint_min', String(GOP), '-sc_threshold', '0',
    '-movflags', '+faststart',
    mp4,
  ], { encoding: 'utf8' })
  if (enc.status !== 0) { console.error(enc.stderr); process.exit(1) }

  // the poster is re-cut from the encoded file, so it matches the frame the
  // browser will actually decode rather than the pre-encode master
  const poster = path.join(OUT, id + SUFFIX + '.webp')
  const pos = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', '-q:v', '80', poster,
  ], { encoding: 'utf8' })
  if (pos.status !== 0) { console.error(pos.stderr); process.exit(1) }

  const kb = (await stat(mp4)).size / 1024
  total += kb
  console.log(`  ${id}${SUFFIX}  ${(kb / 1024).toFixed(2)} MB`)
}
console.log(`\n${legs.length} legs at crf ${CRF}: ${(total / 1024).toFixed(1)} MB`)
