// G1: nothing that forces layout may be driven from a per-frame write.
// Animating width/height/top/left/inset costs a layout pass on every frame,
// and the map's run bar did exactly that in the first cut.
import { readFile } from 'node:fs/promises'

// overridable so the gate can be exercised against a known-bad control
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }

const css = await readFile(arg('css', 'site.css'), 'utf8')
const js = await readFile(arg('js', 'surface.js'), 'utf8')

const LAYOUT = ['width', 'height', 'top', 'left', 'right', 'bottom', 'inset', 'margin']
const bad = []

// a layout property whose value comes from a custom property the page writes
for (const prop of LAYOUT) {
  // not anchored to line start: a single-line rule would slip past that
  const re = new RegExp(String.raw`(?:^|[{;])\s*${prop}\s*:[^;}]*var\(--ip-[^;}]*`, 'gm')
  for (const m of css.match(re) || []) bad.push('css: ' + m.trim())
}

// direct per-frame writes to a layout property from inside the rAF loop
const from = js.indexOf('function frame()')
const loop = from === -1 ? '' : js.slice(from, js.indexOf('requestAnimationFrame(frame)', from))
for (const prop of LAYOUT) {
  if (new RegExp(String.raw`style\.${prop}\s*=`).test(loop)) {
    bad.push('js: style.' + prop + ' written in the rAF loop')
  }
}

if (bad.length) {
  for (const b of bad) console.log('  ' + b)
  console.log('LAYOUT-ANIM-BAD')
  process.exit(1)
}
console.log('LAYOUT-ANIM-CLEAN')
