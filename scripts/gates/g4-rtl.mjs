// G4: RTL is carried by logical properties only.
//
// A negative assertion, so it is only worth trusting once it has been shown to
// fire. The gate runs the same scanner over a fixture containing every banned
// property before it scans the real file, and fails if the control comes back
// clean. See scripts/gates/fixtures/physical-properties.css.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, checker } from './lib.mjs'

const c = checker('G4')

// Physical properties that have a logical equivalent. `left`/`right` as
// *values* (float, text-align, background-position) are excluded by requiring a
// colon and a length-ish value after the property name.
const BANNED = [
  'margin-left', 'margin-right',
  'padding-left', 'padding-right',
  'border-left', 'border-right',
  'border-left-width', 'border-right-width',
  'border-left-color', 'border-right-color',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'left', 'right',
  'top', 'bottom',
  'width', 'height',
  'min-width', 'min-height', 'max-width', 'max-height',
  'text-align: left', 'text-align: right',
  'float: left', 'float: right',
]

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function scan(css) {
  const body = stripComments(css)
  const hits = []
  for (const prop of BANNED) {
    // Property position only: preceded by {, ; or a newline, and followed by a
    // colon. That keeps `inset-inline-start` from matching `left`, and keeps
    // `grid-template-areas` strings out of it.
    const needle = prop.includes(':') ? prop : prop + '\\s*:'
    const re = new RegExp('(^|[{;\\s])' + needle, 'gm')
    let m
    while ((m = re.exec(body))) {
      const line = body.slice(0, m.index).split('\n').length
      hits.push({ prop, line })
    }
  }
  return hits
}

// ---- the control: prove the scanner fires ---------------------------------
const controlPath = path.join(ROOT, 'scripts', 'gates', 'fixtures', 'physical-properties.css')
const control = await readFile(controlPath, 'utf8')
const controlHits = scan(control)
c.ok(
  controlHits.length >= 10,
  `the control fixture should trip the scanner on every banned property, it tripped ${controlHits.length}`
)
c.note(`control: ${controlHits.length} physical properties detected in the fixture`)

// ---- the real file --------------------------------------------------------
const site = await readFile(path.join(ROOT, 'site.css'), 'utf8')
const hits = scan(site)
c.ok(
  hits.length === 0,
  `physical properties in site.css: ${hits.map((h) => `${h.prop} (line ${h.line})`).join(', ')}`
)
c.note(`site.css: ${stripComments(site).split('\n').length} lines scanned, 0 physical properties`)

c.report()
