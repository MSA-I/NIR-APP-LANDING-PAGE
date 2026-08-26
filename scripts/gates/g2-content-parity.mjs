// G2: build 4 says exactly what build 3 said.
//
// The one thing this rebuild was not allowed to change is the copy. Both
// dictionaries are plain ES modules with no imports, so both are imported for
// real and compared value by value; a text diff would pass on a file that had
// been reordered and fail on a comment, and neither is the question.
//
// The control runs the same comparison against a deliberately altered copy of
// the dictionary and fails if that comes back equal.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, checker } from './lib.mjs'

const c = checker('G2')

const OLD = path.join(ROOT, 'archive', 'build3', 'i18n', 'he.js')
const NEW = path.join(ROOT, 'src', 'content', 'he.ts')

const load = async (src) =>
  (await import('data:text/javascript;base64,' + Buffer.from(src, 'utf8').toString('base64')))
    .default

/** Every leaf, as `path = value`, so a difference names itself. */
function flatten(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out)
  } else {
    out.set(prefix, value)
  }
  return out
}

function diff(a, b) {
  const fa = flatten(a)
  const fb = flatten(b)
  const problems = []
  for (const [k, v] of fa) {
    if (!fb.has(k)) problems.push(`missing in build 4: ${k}`)
    else if (fb.get(k) !== v) problems.push(`changed: ${k}`)
  }
  for (const k of fb.keys()) if (!fa.has(k)) problems.push(`added in build 4: ${k}`)
  return problems
}

const oldSrc = await readFile(OLD, 'utf8')
const newSrc = await readFile(NEW, 'utf8')

const before = await load(oldSrc)
const after = await load(newSrc)

// ---- the control: prove the comparison can fail ---------------------------
const tampered = await load(oldSrc.replace("brand: 'InPlace'", "brand: 'InPlace '"))
const controlProblems = diff(before, tampered)
c.ok(
  controlProblems.length > 0,
  'the control (a dictionary with one altered string) should differ, and it did not'
)
c.note(`control: ${controlProblems.length} difference(s) detected in the tampered copy`)

// ---- the real comparison --------------------------------------------------
const problems = diff(before, after)
c.ok(problems.length === 0, `copy drifted from build 3: ${problems.slice(0, 8).join('; ')}`)
c.note(`${flatten(after).size} leaf values compared, ${problems.length} differences`)

c.report()
