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
// Legs are stream-copied; only the bridge is encoded. Re-encoding EACH LEG at a
// denser GOP was tried and came out at 18.6MB for worse pixels, because a
// dense-GOP pass over already-compressed video pays twice.
//
// WHAT CHANGED ON 28.08.2026
// That note was right about the legs and wrong about the finished clip, and the
// difference is worth keeping straight. Re-encoding the ASSEMBLED film once, at
// the same GOP it already has, is not the same operation: there is one pass, not
// six, and the bitrate ceiling applies to the whole thing rather than to each
// leg in isolation. Measured against the file it replaces:
//
//   | cut     | was     | CRF | now     | saved | SSIM against the original |
//   |---------|---------|-----|---------|-------|---------------------------|
//   | desktop | 14.5 MB | 28  | 10.0 MB |  31%  | 0.979                     |
//   | desktop | 14.5 MB | 30  |  7.5 MB |  48%  | 0.973                     |
//   | phone   |  5.8 MB | 28  |  5.2 MB |  10%  | 0.989                     |
//   | phone   |  5.8 MB | 30  |  4.2 MB |  28%  | 0.987                     |
//
// The two cuts take DIFFERENT numbers on purpose, because they are different
// pictures: 1920x1080 of a 3D render, and 810x1440 of the same render at under
// a third of the area. The phone cut is already smoother before anything is
// asked of it, so CRF 30 costs it less than CRF 28 costs the desktop.
//
// The owner reviewed the desktop CRF 28 and CRF 30 side by side on 28.08.2026,
// at 1:1 on the reconciliation card and with the shadows of the dark ground
// lifted 3.4x. At 1:1 the three were indistinguishable. Under the lift, CRF 30
// showed faint blocking on the gradient wall and CRF 28 did not — which is why
// the desktop cut takes the more careful of the two numbers and the phone cut,
// measuring cleaner at 30 than the desktop did at 28, takes the other.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/**
 * Where the rendered legs live, and where the finished clip goes.
 *
 * These were one directory until 27.08.2026, when `chore(film): preserve
 * rendered source assets` moved the legs out of `public/` so that 60MB of
 * source material stopped being deployed alongside the 14MB the page actually
 * loads. That commit did not update this file, and this script has therefore
 * been unrunnable ever since — it asked for `public/assets/04.mp4` and got
 * "No such file or directory". Nothing noticed, because the finished film was
 * already committed and no gate rebuilds it.
 */
const LEG = (f) => path.join(ROOT, 'world', 'renders', f)
const A = (f) => path.join(ROOT, 'public', 'assets', f)
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })

// Leg 04 runs 8.375s. It used to be cut at 5.5s, which was where the control
// centre read largest — and the control centre is not in it any more (see the
// note on the `dash` panel in world/world.html). What leg 04 carries now is
// the paper in drift formation on a dark hall, and three and a half seconds of
// that is a beat; five and a half is a wait.
//
// The `DASH` constant that stood here is gone with the tail it fed. It pointed
// at world/screens/owner-dashboard-full.png, which is still the capture the
// board section on the page shows; it is simply not in the film any more.
const LEG4_CUT = 3.4

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
function build({ suffix, w, h, crf, gop, finalCrf }) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'film-'))
  const t = (f) => path.join(tmp, f)

  ff('-i', LEG(`04${suffix}.mp4`), '-t', String(LEG4_CUT), '-c', 'copy', t('04h.mp4'))
  ff('-sseof', '-0.12', '-i', t('04h.mp4'), '-frames:v', '1', t('last.png'))
  // Act two's own opening frame, taken from the ENCODED clip so the bridge
  // lands on exactly the pixels the browser will decode next.
  ff('-i', LEG(`R${suffix}.mp4`), '-frames:v', '1', t('first.png'))

  // The bridge. The owner's note of 26.08.2026: the fade into the next scene
  // "is a touch too fast, because the text does not come up with it". The copy
  // beside the film is driven by the reader's own scroll and cannot be sped up
  // to meet a cut, so the cut slows down to meet the copy: 2.0 seconds
  // end to end instead of 1.1, of which 1.2 is the dissolve itself.
  // Both stills are already at the clip's own size, so the scale here is a
  // no-op guard rather than a resample.
  ff(
    '-loop', '1', '-t', '1.0', '-i', t('last.png'),
    '-loop', '1', '-t', '1.4', '-i', t('first.png'),
    '-filter_complex',
    `[0:v]scale=${w}:${h},setsar=1,fps=24[a];` +
    `[1:v]scale=${w}:${h},setsar=1,fps=24[b];` +
    `[a][b]xfade=transition=fade:duration=1.2:offset=0.3[o]`,
    '-map', '[o]', ...X264(crf, gop), t('bridge.mp4')
  )

  const list = ['01', '02', '03'].map((n) => `file '${LEG(`${n}${suffix}.mp4`).replace(/\\/g, '/')}'`)
  list.push(
    `file '${t('04h.mp4').replace(/\\/g, '/')}'`,
    `file '${t('bridge.mp4').replace(/\\/g, '/')}'`,
    `file '${LEG(`R${suffix}.mp4`).replace(/\\/g, '/')}'`
  )
  writeFileSync(t('list.txt'), list.join('\n'), 'utf8')

  ff('-f', 'concat', '-safe', '0', '-i', t('list.txt'), '-c', 'copy', t('joined.mp4'))

  // The one pass over the finished clip. See the table at the top of this file
  // for what it costs and what it saves.
  //
  // The GOP is UNCHANGED, and that is not an oversight to tidy up later: this
  // film is scrubbed by the reader's own scroll, every seek is random access,
  // and a longer GOP means each seek decodes a run of frames before it can show
  // one. Widening it is the obvious way to make the file smaller and the exact
  // way to make the chapter feel broken. G10 and G18 measure the scrub.
  ff('-i', t('joined.mp4'), ...X264(finalCrf, gop), A(`film${suffix}.mp4`))
  rmSync(tmp, { recursive: true, force: true })

  // The poster is the clip's own first frame, out of the file that ships.
  ff('-i', A(`film${suffix}.mp4`), '-frames:v', '1', '-q:v', '82', A(`film${suffix}.webp`))

  const probe = execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=nb_frames', '-show_entries', 'format=duration',
    '-of', 'csv=p=0', A(`film${suffix}.mp4`),
  ], { encoding: 'utf8' }).trim().split('\n')
  const mb = (statSync(A(`film${suffix}.mp4`)).size / 1024 / 1024).toFixed(1)
  console.log(`film${suffix}.mp4  ${probe[0]} frames  ${(+probe[1]).toFixed(2)}s  ${mb}MB at CRF ${finalCrf}`)
}

// `crf` is the bridge, which is two seconds of dissolve between two stills and
// wants to be clean going into the final pass. `finalCrf` is the pass over the
// whole assembled clip, and it is the number the table at the top explains.
build({ suffix: '', w: 1920, h: 1080, crf: 20, gop: 8, finalCrf: 28 })
build({ suffix: '-m', w: 810, h: 1440, crf: 24, gop: 4, finalCrf: 30 })
