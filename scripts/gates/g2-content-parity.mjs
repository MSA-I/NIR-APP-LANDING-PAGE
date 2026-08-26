// G2: build 4 says what build 3 said, except where the owner has said otherwise.
//
// The rebuild was not allowed to change the copy, and for six rounds it did
// not. On 26.08.2026 the owner changed three lines, and a gate that can only
// say "nothing may change" is useless the moment something may. So it now
// carries an ALLOWLIST: a named, dated entry per approved change, with the
// exact string that was there before and the exact string that is there now.
//
// This is stricter than deleting the gate and stricter than loosening it,
// because it still fails on:
//   - any leaf that drifted and is not on the list;
//   - an allowlisted leaf whose OLD value is not what build 3 actually says
//     (the list cannot be written against a file that has already moved);
//   - an allowlisted leaf whose NEW value is not what build 4 now says
//     (a change that was approved and then quietly re-edited);
//   - an allowlist entry for a leaf that no longer differs at all, so the
//     list cannot accumulate entries that stopped meaning anything.
//
// Both dictionaries are plain ES modules with no imports, so both are imported
// for real and compared value by value; a text diff would pass on a file that
// had been reordered and fail on a comment, and neither is the question.
//
// The control runs the same comparison against a deliberately altered copy of
// the dictionary and fails if that comes back equal.

// Every approved change, in the owner's order. `why` is not decoration: it is
// the only record of what the change was for.
const APPROVED = [
  {
    at: 'film.blocks[3].h',
    why: 'the film ends on the three-way check and the mark, not on the dashboard (26.08.2026)',
    was: 'וזה המסך שמחליף&nbsp;אותה',
    now: 'וזאת הבדיקה שמחליפה&nbsp;אותה',
  },
  {
    at: 'film.blocks[3].p',
    why: 'same: the block described a screen the clip no longer shows',
    was: 'מרכז הבקרה של InPlace: מה דורש טיפול היום, כמה כסף פתוח מול ספקים, ומה נעצר בדרך. מכאן והלאה זו כבר לא הדמיה. אלה המסכים עצמם.',
    now: 'InPlace מעמידה זו מול זו את ההזמנה, את מה שהתקבל בפועל ואת החשבונית, ומסמנת את ההפרש: <b>אדום</b> למה שעולה לך כסף, <b>ירוק</b> למה שחוזר אליך. מכאן והלאה זו כבר לא הדמיה. אלה המסכים עצמם.',
  },
  {
    at: 'board.h2',
    why: 'the control centre is no longer the screen the film ends on',
    was: 'המסך שהסרט נגמר&nbsp;עליו, במלואו',
    now: 'ומרכז הבקרה שמעליה,&nbsp;במלואו',
  },
  {
    at: 'plans.priceNote',
    why: 'the billing switch shows the yearly catalogue now; the note repeated it (26.08.2026)',
    was: 'המחירים לחודש, לפני מע״מ. בתשלום שנתי: <b>690, 2,490 ו‑4,490 ₪ לשנה</b>.',
    now: 'כל המחירים לפני מע״מ.',
  },
]

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
const fa = flatten(before)
const fb = flatten(after)
const byPath = new Map(APPROVED.map((a) => [a.at, a]))

const problems = []
for (const [k, v] of fa) {
  if (!fb.has(k)) {
    problems.push(`missing in build 4: ${k}`)
    continue
  }
  if (fb.get(k) === v) continue
  const ok = byPath.get(k)
  if (!ok) {
    problems.push(`changed without approval: ${k}`)
    continue
  }
  if (ok.was !== v) problems.push(`${k}: the allowlist's "was" is not what build 3 says`)
  if (ok.now !== fb.get(k)) problems.push(`${k}: the allowlist's "now" is not what build 4 says`)
}
for (const k of fb.keys()) if (!fa.has(k)) problems.push(`added in build 4: ${k}`)

// An entry that no longer describes a difference is an entry nobody is reading.
for (const a of APPROVED) {
  if (fa.get(a.at) === fb.get(a.at)) {
    problems.push(`${a.at} is allowlisted but no longer differs; drop the entry`)
  }
}

c.ok(problems.length === 0, `copy drifted from build 3: ${problems.slice(0, 8).join('; ')}`)
c.note(`${fb.size} leaf values compared, ${APPROVED.length} approved change(s)`)
for (const a of APPROVED) c.note(`  approved  ${a.at}  ${a.why}`)

c.report()
