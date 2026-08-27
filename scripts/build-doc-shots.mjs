// Turn the raw app captures into the six screens the supporting pages ship.
//
// WHY THESE SIX AND NOT THE HOME PAGE'S SIX
// The owner's instruction of 28.08.2026: the supporting pages must not repeat
// the pictures the home page already shows. The first cut of those pages did
// exactly that — /invoice-matching/ was illustrated with the same exceptions
// screen the home page's fourth station uses — and the objection is right in
// two directions. A reader who arrives from the home page sees the same picture
// twice, and image search is offered one file claiming to be two subjects.
//
// So these are six DIFFERENT screens of the same product, captured from the
// running application by scripts/capture-app-dated.mjs against the local demo
// tenant, with its clock set to 17.07.2026 so the month cards are not empty.
// None of them appears anywhere else on the site:
//
//   supporting page          screen              why that screen
//   ----------------------------------------------------------------------
//   procurement-software     office-suppliers    where a purchase chain starts
//   supplier-invoices        office-credits      the page's own credits section
//   invoice-matching         owner-alerts        the duplicate-invoice catch
//   vs-spreadsheet           office-prices       exactly the spreadsheet's job
//   vs-erp                   owner-analytics     supplier performance
//   about                    accountant-bank     the third role, at work
//
// WHY TWO OF THEM ARE CROPPED
// A capture is 2880x1920 of whatever the viewport held. On `owner-alerts` the
// lower half is the demo machine's own operational notice — a red banner saying
// its document processor has stalled — which is true of that laptop and says
// nothing about the product. On `office-credits` the lower half is empty table.
// Neither crop hides a shortcoming of the product; both remove something that
// is not the subject. Everything else ships whole.
//
// The output is `screen-*.webp`, which is the name scripts/build-shots.mjs
// looks for, so the AVIF and the two narrow rungs follow from running that
// afterwards, and scripts/build-sitemap.mjs lists them without being told.
//
//   node scripts/capture-app-dated.mjs --base http://localhost:5200 --out lab/app-reference
//   node scripts/build-doc-shots.mjs
//   node scripts/build-shots.mjs

import { existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FROM = path.join(ROOT, 'lab', 'app-reference')
const TO = path.join(ROOT, 'public', 'assets')

/** The capture size every one of these comes out of. */
const CAPTURE = { w: 2880, h: 1920 }

/** What ships is 2000 across, the same width as the home page's own screens. */
const WIDTH = 2000

const SHOTS = [
  { from: 'office-suppliers', to: 'screen-office-suppliers' },
  // Three credits and then nothing. The rows end at about 1,150 of 1,920.
  { from: 'office-credits', to: 'screen-office-credits', keepHeight: 1150 },
  // The "דורש טיפול" card ends at about 1,135. Below it is a footnote and then
  // this machine's own stalled-processor notice, which is a fact about the
  // laptop. 1,180 was tried first and cut the footnote through the middle,
  // which reads as a broken screenshot rather than as a deliberate frame.
  { from: 'owner-alerts', to: 'screen-owner-alerts', keepHeight: 1135 },
  { from: 'office-prices', to: 'screen-office-prices' },
  { from: 'owner-analytics', to: 'screen-owner-analytics' },
  { from: 'accountant-bank', to: 'screen-accountant-bank' },
]

const missing = SHOTS.filter((s) => !existsSync(path.join(FROM, `${s.from}.png`)))
if (missing.length) {
  console.error('no captures for: ' + missing.map((m) => m.from).join(', '))
  console.error('run scripts/capture-app-dated.mjs first; it needs the app on loopback.')
  process.exit(1)
}

for (const shot of SHOTS) {
  const src = path.join(FROM, `${shot.from}.png`)
  const out = path.join(TO, `${shot.to}.webp`)
  const keep = shot.keepHeight || CAPTURE.h
  const height = Math.round((keep / CAPTURE.w) * WIDTH)

  const run = spawnSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-i', src,
     '-vf', `crop=${CAPTURE.w}:${keep}:0:0,scale=${WIDTH}:-2:flags=lanczos`,
     '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', out],
    { encoding: 'utf8' }
  )
  if (run.status !== 0) {
    throw new Error(`ffmpeg failed on ${shot.from}: ${run.stderr || run.error?.message}`)
  }
  console.log(
    `${shot.to}.webp  ${WIDTH}x${height}  ${(statSync(out).size / 1024).toFixed(0)}KB` +
      (shot.keepHeight ? `  (cropped from ${CAPTURE.h} to ${keep})` : '')
  )
}

console.log(`\n${SHOTS.length} screens. Run scripts/build-shots.mjs for the AVIF and the rungs.`)
