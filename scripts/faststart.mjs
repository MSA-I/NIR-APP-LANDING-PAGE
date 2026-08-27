// Move the MP4 index to the front of the file, and prove nothing else moved.
//
// WHY THIS EXISTS
// The SEO audit of 27.08.2026 traced what the browser actually asks for when
// it opens the film, and the answer was the whole file, twice:
//
//   bytes=0-          -> 14.54MB   the whole file
//   bytes=14516224-   ->  0.03MB   the tail, hunting for the index
//   bytes=1048576-    -> 13.50MB   the whole file again
//   -------------------------------------------------------------
//   28.07MB transferred for a 14.5MB file. On the phone cut, 12.44MB for 5.79.
//
// The cause is in the container, not in the page: an MP4 keeps its index (the
// `moov` atom) either before the media or after it, and both films were built
// with `ftyp free mdat moov`. A browser that wants to seek must have the index,
// so it downloads everything, finds the index at the end, and then starts over
// from the beginning to get the frames it can now address. `+faststart` is one
// remux that puts `moov` first. No pixel is re-encoded: `-c copy`.
//
// WHAT IT REFUSES TO DO
// The film is 836 frames at 24fps (34.833s, measured) and the scroll drives it
// by assigning `currentTime`, so a change in duration or frame rate would break
// g10-film while every frame still looked right. This script therefore
// measures the remux before it replaces anything, and leaves the original in
// place if any of the three checks disagree. A media change without a
// measurement is exactly the thing the house rule forbids.

import { execFileSync } from 'node:child_process'
import { readFileSync, openSync, readSync, closeSync, statSync, renameSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FILMS = ['public/assets/film.mp4', 'public/assets/film-m.mp4']

/**
 * The order of the top-level boxes in an MP4, read straight off the file.
 *
 * This is the same walk the audit used, and it is deliberately not `ffprobe`:
 * ffprobe reports what the file MEANS, and the whole question here is how the
 * file is LAID OUT. A 64-bit size is signalled by a 32-bit size of 1 followed
 * by an 8-byte size, which the big captures do use.
 */
export function atomOrder(file) {
  const fd = openSync(file, 'r')
  const size = statSync(file).size
  const boxes = []
  try {
    let off = 0
    while (off < size && boxes.length < 32) {
      const head = Buffer.alloc(16)
      if (readSync(fd, head, 0, 16, off) < 8) break
      let boxSize = head.readUInt32BE(0)
      const type = head.toString('ascii', 4, 8)
      if (boxSize === 1) boxSize = Number(head.readBigUInt64BE(8))
      if (boxSize === 0) boxSize = size - off
      if (boxSize < 8) break
      boxes.push({ type, at: off, size: boxSize })
      off += boxSize
    }
  } finally {
    closeSync(fd)
  }
  return boxes
}

/** True when the index is in front of the media, which is the whole point. */
export const isFaststart = (file) => {
  const order = atomOrder(file).map((b) => b.type)
  const moov = order.indexOf('moov')
  const mdat = order.indexOf('mdat')
  return moov !== -1 && mdat !== -1 && moov < mdat
}

const probe = (file) => {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0',
     '-show_entries', 'stream=nb_frames,r_frame_rate,width,height,codec_name',
     '-show_entries', 'format=duration',
     '-of', 'json', file],
    { encoding: 'utf8' }
  )
  const j = JSON.parse(out)
  const s = j.streams[0]
  return {
    frames: Number(s.nb_frames),
    fps: s.r_frame_rate,
    w: s.width,
    h: s.height,
    codec: s.codec_name,
    duration: Number(j.format.duration),
  }
}

const same = (a, b) =>
  a.frames === b.frames &&
  a.fps === b.fps &&
  a.w === b.w &&
  a.h === b.h &&
  a.codec === b.codec &&
  Math.abs(a.duration - b.duration) < 0.01

function main() {
let changed = 0
let failed = 0

for (const rel of FILMS) {
  const file = path.join(ROOT, rel)
  const before = probe(file)
  const sizeBefore = statSync(file).size

  if (isFaststart(file)) {
    console.log(`${rel}: already faststart, left alone`)
    continue
  }

  const tmp = file.replace(/\.mp4$/, '.faststart.mp4')
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-c', 'copy', '-movflags', '+faststart', tmp], {
    stdio: 'inherit',
  })

  const after = probe(tmp)
  const sizeAfter = statSync(tmp).size
  const drift = Math.abs(sizeAfter - sizeBefore) / sizeBefore

  const problems = []
  if (!isFaststart(tmp)) problems.push('moov did not move in front of mdat')
  if (!same(before, after)) {
    problems.push(`the picture changed: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`)
  }
  if (drift > 0.01) problems.push(`size moved ${(drift * 100).toFixed(2)}%, over the 1% allowance`)

  if (problems.length) {
    unlinkSync(tmp)
    console.error(`${rel}: NOT replaced`)
    for (const p of problems) console.error(`   ${p}`)
    failed++
    continue
  }

  renameSync(tmp, file)
  changed++
  console.log(
    `${rel}: ${atomOrder(file).map((b) => b.type).join(' ')}  ` +
      `${before.frames} frames @ ${before.fps}, ${before.duration.toFixed(3)}s, unchanged  ` +
      `(${(sizeBefore / 1e6).toFixed(2)}MB -> ${(sizeAfter / 1e6).toFixed(2)}MB)`
  )
}

console.log(`\n${changed} remuxed, ${failed} refused, of ${FILMS.length}`)
process.exitCode = failed ? 1 : 0
}

// Only when run as a command. scripts/gates/g18-film.mjs imports `atomOrder`
// and `isFaststart` from here to read the layout of the shipped files, and a
// gate that remuxed the thing it was measuring would be worthless.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
