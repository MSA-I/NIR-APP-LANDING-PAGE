// Install a capture set as the page's own screenshots.
//
// scripts/capture-demo.mjs writes PNGs off a running application at whatever
// size the browser was told to use — 2880x1920 at device-pixel-ratio 2. This is
// the step between that and `public/assets`: one scale, one encode, one name.
//
// THE WIDTHS ARE NOT ARBITRARY. The five stations ship at 2000px because
// WhatChapter declares `width={2000} height={1334}` and a browser reserves the
// box from those two numbers before the file arrives; the control centre ships
// at 1800 because BoardChapter says so. A file that disagrees with its own
// element is a layout shift on every cold load, so the numbers are read from
// here and the components are the only other place they appear.
//
// The encode matches scripts/build-shots.mjs exactly — libwebp, quality 82,
// compression level 6, lanczos — because the rungs that script writes are
// generated FROM this file, and a base encoded to a different standard makes
// its own ladder inconsistent.
//
//   node scripts/install-shots.mjs --from lab/app-he-final
//   node scripts/install-shots.mjs --from lab/app-en-final --suffix -en
//
// `--suffix` is what makes a second edition possible: the English page points
// at `screen-office-orders-en.webp` and the Hebrew one at the unsuffixed name.
// Run scripts/build-shots.mjs afterwards to write the rungs and the AVIFs.

import { existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}

const FROM = path.resolve(arg('from', 'lab/app-he-final'))
const SUFFIX = arg('suffix', '')
const OUT = path.resolve('public/assets')

/** capture name → shipped name, and the width the page declares for it. */
const SHOTS = [
  // The six the home page walks.
  ['office-orders', 'screen-office-orders', 2000],
  ['office-receiving', 'screen-office-receiving', 2000],
  ['office-invoices', 'screen-office-invoices', 2000],
  ['owner-exceptions', 'screen-owner-exceptions', 2000],
  ['owner-payment-requests', 'screen-owner-payment-requests', 2000],
  ['owner-dashboard-full', 'screen-owner-dashboard', 1800],
  // And the six the supporting documents print. Their width is the one
  // src/lib/page-html.ts declares for them, which is the same 2000.
  ['office-suppliers', 'screen-office-suppliers', 2000],
  ['office-credits', 'screen-office-credits', 2000],
  ['office-prices', 'screen-office-prices', 2000],
  ['owner-alerts', 'screen-owner-alerts', 2000],
  ['owner-analytics', 'screen-owner-analytics', 2000],
  ['accountant-bank', 'screen-accountant-bank', 2000],
]

const kb = (f) => (statSync(f).size / 1024).toFixed(0)

const ff = (a, what) => {
  const run = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { encoding: 'utf8' })
  if (run.status !== 0) throw new Error(`ffmpeg failed on ${what}: ${run.stderr || run.error?.message}`)
}

const probe = (file) => {
  const run = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file],
    { encoding: 'utf8' },
  )
  const [w, h] = (run.stdout || '').trim().split(',').map(Number)
  return { w, h }
}

let written = 0
for (const [name, target, width] of SHOTS) {
  const from = path.join(FROM, name + '.png')
  if (!existsSync(from)) {
    console.log(`  miss ${name}.png — not in ${path.relative(process.cwd(), FROM)}`)
    continue
  }
  const to = path.join(OUT, `${target}${SUFFIX}.webp`)
  ff(
    ['-i', from, '-vf', `scale=${width}:-2:flags=lanczos`,
     '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', to],
    `${name} at ${width}px`,
  )
  const before = probe(from)
  const after = probe(to)
  console.log(
    `  ok   ${path.basename(to)}  ${after.w}x${after.h}  ${kb(to)}KB ` +
      `(from ${before.w}x${before.h})`,
  )
  written += 1
}

console.log(
  `\n${written} of ${SHOTS.length} installed into public/assets` +
    (SUFFIX ? ` under "${SUFFIX}"` : '') +
    `.\nRun scripts/build-shots.mjs to write the rungs and the AVIFs.`,
)
if (written !== SHOTS.length) process.exitCode = 1
