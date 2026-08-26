// Build the chapter 01 clip.
//
// Legs 01-03 of the world, leg 04 up to the frame where the control centre
// reads largest, and then act two: the reconciliation and the mark.
//
// WHAT CHANGED ON 26.08.2026, AND WHY
// The clip used to end by dissolving that frame into a full-frame screenshot
// of the dashboard. The owner's note: "instead of the dashboard, have the
// pages fly inward and the logo appear, because right now it is not clear what
// is happening; the dashboard page does not show it well", and then, thinking
// it through further: "maybe the pages come in and are reflected in an invoice
// calculation, and it marks the difference in colour, whether it is missing or
// whether it earns me money."
//
// That is what act two is, and it is rendered by scripts/render-recon.mjs from
// the same lab/world/world.html the legs come from. The still-to-still
// dissolve is gone with it; what remains is a one-second bridge from the last
// frame of the hall into the dark ground act two opens on, because the two
// have no camera in common and a hard cut between them reads as a fault.
//
// Legs are stream-copied; only the bridge is encoded. Re-encoding the whole
// clip was tried and came out at 18.6MB for worse pixels, because a dense-GOP
// pass over already-compressed video pays twice.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const A = (f) => path.join(ROOT, 'public', 'assets', f)
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })

// Leg 04 runs 8.375s. At 5.5s the control centre is at its largest and most
// legible; after that the camera drifts past it.
const LEG4_CUT = 5.5

const X264 = (crf, gop) => [
  '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
  '-crf', String(crf), '-g', String(gop), '-keyint_min', String(gop),
  '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
]

// The two cuts are NOT the same shape and the size is passed in rather than
// derived. The phone cut is a PORTRAIT render, 810x1440. The previous build
// computed the bridge's size as 16:9 of its height for both, which produced a
// 1280x720 tail and concatenated it, with `-c copy`, onto a stream of 810x1440
// frames. The concat demuxer does not resample: the container kept the first
// segment's dimensions and the tail decoded as garbage. That is the second
// half of the phone fault the owner reported on 26.08.2026, and no screenshot
// of the page could have shown it, because the frames it ruins are the last
// second of a clip the phone layout had already cropped away.
function build({ suffix, w, h, crf, gop }) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'film-'))
  const t = (f) => path.join(tmp, f)

  ff('-i', A(`04${suffix}.mp4`), '-t', String(LEG4_CUT), '-c', 'copy', t('04h.mp4'))
  ff('-sseof', '-0.12', '-i', t('04h.mp4'), '-frames:v', '1', t('last.png'))
  // Act two's own opening frame, taken from the ENCODED clip so the bridge
  // lands on exactly the pixels the browser will decode next.
  ff('-i', A(`R${suffix}.mp4`), '-frames:v', '1', t('first.png'))

  // The bridge. 0.4s of the hall, then a 0.6s dissolve into the dark act two
  // opens on. Both stills are already at the clip's own size, so the scale
  // here is a no-op guard rather than a resample.
  ff(
    '-loop', '1', '-t', '0.6', '-i', t('last.png'),
    '-loop', '1', '-t', '0.8', '-i', t('first.png'),
    '-filter_complex',
    `[0:v]scale=${w}:${h},setsar=1,fps=24[a];` +
    `[1:v]scale=${w}:${h},setsar=1,fps=24[b];` +
    `[a][b]xfade=transition=fade:duration=0.5:offset=0.15[o]`,
    '-map', '[o]', ...X264(crf, gop), t('bridge.mp4')
  )

  const list = ['01', '02', '03'].map((n) => `file '${A(`${n}${suffix}.mp4`).replace(/\\/g, '/')}'`)
  list.push(
    `file '${t('04h.mp4').replace(/\\/g, '/')}'`,
    `file '${t('bridge.mp4').replace(/\\/g, '/')}'`,
    `file '${A(`R${suffix}.mp4`).replace(/\\/g, '/')}'`
  )
  writeFileSync(t('list.txt'), list.join('\n'), 'utf8')

  ff('-f', 'concat', '-safe', '0', '-i', t('list.txt'), '-c', 'copy', A(`film${suffix}.mp4`))
  rmSync(tmp, { recursive: true, force: true })

  // The poster is the clip's own first frame, out of the encoded file.
  ff('-i', A(`film${suffix}.mp4`), '-frames:v', '1', '-q:v', '82', A(`film${suffix}.webp`))

  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-show_entries', 'format=duration',
    '-of', 'csv=p=0', A(`film${suffix}.mp4`),
  ], { encoding: 'utf8' }).trim().split('\n')
  console.log(`film${suffix}.mp4  ${probe[0]} frames  ${(+probe[1]).toFixed(2)}s`)
}

build({ suffix: '', w: 1920, h: 1080, crf: 20, gop: 8 })
build({ suffix: '-m', w: 810, h: 1440, crf: 24, gop: 4 })
