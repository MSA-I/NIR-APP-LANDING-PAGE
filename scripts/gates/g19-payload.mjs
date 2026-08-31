// G19: nothing ships that nothing asks for.
//
// The audit of 27.08.2026 found 37MB of video in the build that no line of
// code referenced: the numbered world renders 01-09 and R, plus their phone
// cuts, sitting in public/assets because that is where the render scripts
// wrote them. public/ is copied verbatim into dist/, so every one of them was
// published. dist/ was 57MB; the page needs about 21MB of it.
//
// Nothing caught it because nothing was counting. A build that silently grows
// by whatever lands in one directory has no budget, and a budget nobody
// measures is a wish.
//
// The reference check is deliberately crude: every media file in dist/assets
// must have its filename appear somewhere in the built HTML, CSS or JS. It can
// be fooled by a filename assembled at runtime from pieces, which is why the
// allowlist below exists and is short and dated. It cannot be fooled by the
// thing that actually happened, which is a file nobody mentioned anywhere.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { DIST, checker } from './lib.mjs'

const c = checker('G19')

// Room for the film, its phone cut, both posters, the product screens, the
// share card, two faces in two subsets each, and the shell.
//
// IT WAS 26MB, AND THE HEADROOM SAID "for a second locale, not for another
// film". On 31.08.2026 it became another film: the English edition plays its
// own render, because the one thing the reader is being shown is a business
// working in their language and the film is where that starts. The owner's
// instruction was that it is encoded exactly as the Hebrew one, so it costs
// what the Hebrew one costs — about 13.5MB for the pair of cuts.
//
// 42 is that, plus the twelve product screens per edition at three widths in
// two formats, plus the same headroom the old number carried. The point of a
// budget is not the number, it is that the number is stated and measured; this
// one moved because what the page ships changed, and it says so.
const BUDGET_MB = 42

const walk = (dir) => {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const files = walk(DIST)
const totalMb = files.reduce((n, f) => n + statSync(f).size, 0) / 1e6
c.ok(
  totalMb <= BUDGET_MB,
  `dist/ is ${totalMb.toFixed(1)}MB, over the ${BUDGET_MB}MB budget. ` +
    `Largest: ${files
      .map((f) => ({ f, n: statSync(f).size }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5)
      .map((x) => `${path.basename(x.f)} ${(x.n / 1e6).toFixed(1)}MB`)
      .join(', ')}`
)

// Everything the build produced that could name an asset.
const haystack = files
  .filter((f) => /\.(html|css|js|xml|txt|json)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

// Addressed by convention rather than by reference, so a search would not find
// them. Each is here because a client asks for it by a fixed name.
const BY_CONVENTION = new Set([
  'favicon.ico', // browsers request /favicon.ico whether it is declared or not
  'apple-touch-icon.png',
])

const MEDIA = /\.(mp4|webm|webp|png|jpe?g|svg|ico|woff2?|avif|gif)$/i

const orphans = []
for (const file of files) {
  if (!MEDIA.test(file)) continue
  const name = path.basename(file)
  if (BY_CONVENTION.has(name)) continue
  if (!haystack.includes(name)) orphans.push({ name, mb: statSync(file).size / 1e6 })
}

c.ok(
  orphans.length === 0,
  `${orphans.length} file(s) ship without anything referencing them, ` +
    `${orphans.reduce((n, o) => n + o.mb, 0).toFixed(1)}MB in total: ` +
    orphans
      .sort((a, b) => b.mb - a.mb)
      .slice(0, 10)
      .map((o) => `${o.name} ${o.mb.toFixed(1)}MB`)
      .join(', ')
)

const media = files.filter((f) => MEDIA.test(f))
c.note(
  `dist/ ${totalMb.toFixed(1)}MB of ${BUDGET_MB}MB, ` +
    `${media.length} media files, ${orphans.length} unreferenced`
)

c.report()
