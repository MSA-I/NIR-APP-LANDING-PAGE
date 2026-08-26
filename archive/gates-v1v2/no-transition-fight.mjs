// G2: an element whose opacity or transform is rewritten every frame must not
// also carry a CSS transition on that property. Every write restarts the
// transition, so it never settles, and the element pulses. This is invisible in
// a screenshot and obvious while scrolling.
import { readFile } from 'node:fs/promises'

// overridable so the gate can be exercised against a known-bad control
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }

const css = await readFile(arg('css', 'site.css'), 'utf8')
const js = await readFile(arg('js', 'surface.js'), 'utf8')

// which custom properties does the rAF loop write on every frame?
const from = js.indexOf('function frame()')
const loop = from === -1 ? '' : js.slice(from, js.indexOf('requestAnimationFrame(frame)', from))
const written = new Set()
for (const m of loop.matchAll(/setProperty\(\s*'(--[\w-]+)'/g)) written.add(m[1])
// custom properties written on the root every frame count too
for (const m of loop.matchAll(/style\.setProperty\('(--[\w-]+)'/g)) written.add(m[1])

const bad = []
for (const m of css.matchAll(/\{([^{}]*)\}/g)) {
  const body = m[1]
  const trans = body.match(/transition\s*:[^;]*/)
  if (!trans) continue
  if (!/opacity|transform|\ball\b/.test(trans[0])) continue
  for (const v of written) {
    const re = new RegExp(String.raw`(opacity|transform)\s*:[^;]*var\(${v}\b`)
    if (re.test(body)) bad.push(`${v} is written every frame on a rule carrying "${trans[0].trim()}"`)
  }
}

if (bad.length) {
  for (const b of bad) console.log('  ' + b)
  console.log('TRANSITION-FIGHT-BAD')
  process.exit(1)
}
console.log('TRANSITION-FIGHT-CLEAN')
