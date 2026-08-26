// Build the chapter 01 clip.
//
// Legs 01-03 of build 2's world, plus leg 04 up to the frame where the control
// centre reads largest, plus a tail that dissolves that frame into the real
// dashboard filling the whole frame.
//
// The tail exists because the footage never gets there on its own: the camera
// is still travelling at the end of leg 04, so the screen is angled, partly
// behind falling paper, and shrinking. The owner asked for the film to END on
// the dashboard full-frame, and that is the one place on the page where the
// product is handed over from the film to the screenshots.
//
// Legs are stream-copied; only the 1.6s tail is encoded. Re-encoding the whole
// clip was tried and came out at 18.6MB for worse pixels, because a dense-GOP
// pass over already-compressed video pays twice.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const A = (f) => path.join(ROOT, 'assets', f)
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })

// Leg 04 runs 8.375s. At 5.5s the control centre is at its largest and most
// legible; after that the camera drifts past it.
const LEG4_CUT = 5.5
const DASH = path.join(ROOT, 'lab', 'app-reference', 'owner-dashboard.png')

const X264 = (crf, gop) => [
  '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
  '-crf', String(crf), '-g', String(gop), '-keyint_min', String(gop),
  '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
]

function build({ suffix, h, crf, gop }) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'film-'))
  const t = (f) => path.join(tmp, f)
  const w = Math.round((h * 16) / 9)

  ff('-i', A(`04${suffix}.mp4`), '-t', String(LEG4_CUT), '-c', 'copy', t('04h.mp4'))
  ff('-sseof', '-0.12', '-i', t('04h.mp4'), '-frames:v', '1', t('last.png'))

  // The dashboard is 3:2. Fit its width and take the top of it: the header, the
  // money row and the three decision panels. The trends row below the fold is
  // what gets cropped, and it is the least load-bearing part of that screen.
  ff(
    '-loop', '1', '-t', '0.9', '-i', t('last.png'),
    '-loop', '1', '-t', '1.3', '-i', DASH,
    '-filter_complex',
    `[0:v]scale=${w}:${h},setsar=1,fps=24[a];` +
    `[1:v]scale=${w}:-2,crop=${w}:${h}:0:0,setsar=1,fps=24[b];` +
    `[a][b]xfade=transition=fade:duration=0.6:offset=0.3[o]`,
    '-map', '[o]', ...X264(crf, gop), t('tail.mp4')
  )

  const list = ['01', '02', '03'].map((n) => `file '${A(`${n}${suffix}.mp4`).replace(/\\/g, '/')}'`)
  list.push(`file '${t('04h.mp4').replace(/\\/g, '/')}'`, `file '${t('tail.mp4').replace(/\\/g, '/')}'`)
  writeFileSync(t('list.txt'), list.join('\n'), 'utf8')

  ff('-f', 'concat', '-safe', '0', '-i', t('list.txt'), '-c', 'copy', A(`film${suffix}.mp4`))
  rmSync(tmp, { recursive: true, force: true })

  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-show_entries', 'format=duration',
    '-of', 'csv=p=0', A(`film${suffix}.mp4`),
  ], { encoding: 'utf8' }).trim().split('\n')
  console.log(`film${suffix}.mp4  ${probe[0]} frames  ${(+probe[1]).toFixed(2)}s`)
}

build({ suffix: '', h: 1080, crf: 20, gop: 8 })
build({ suffix: '-m', h: 720, crf: 24, gop: 4 })
