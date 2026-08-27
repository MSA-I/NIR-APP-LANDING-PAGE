// G3: every colour in the shader ground is either the application's own or one
// the owner asked for by name.
//
// The owner's note on 26.08.2026, in the morning: "הצבעים צריכים להיות בצבעי
// האפליקציה כרגע זה לא המצב". The gate that answered it asserted something
// exact: every colour in the shader is a token the running application
// defines, matched against the OKLCH values in data/product-tokens.json.
//
// The owner's note on 26.08.2026, in the evening: the ground should be light
// purple and almost black. The application is teal and contains no purple, so
// the first rule and the second instruction cannot both hold, and the gate had
// a choice between being deleted and being made honest.
//
// It carries an ALLOWLIST now, the same shape G2 grew for the copy: a dated
// entry per approved colour, with what it is and why it is there. A colour in
// the shader that is neither a product token nor an entry on this list still
// fails, which is the failure this gate was written for.
//
// Three controls, because three things could make it vacuous: aui.io's own
// colours must NOT resolve to product tokens, the token table must be
// non-empty, and every allowlist entry must actually be in use.

// THE PALETTE IS NO LONGER THE PRODUCT'S, AND SAYING SO IS THE POINT.
//
// The purple approved on 26.08.2026 lasted a day, and the product's own teal
// that replaced it lasted until the evening of 27.08.2026, when the owner
// supplied a reference card carrying exactly two colours and asked for the page
// to be in those two:
//
//   Onyx        #020202   CMYK 0, 0, 0, 99    RGB 2, 2, 2
//   Candy Blue  #b2d5e5   CMYK 22, 7, 0, 10   RGB 178, 213, 229
//
// That instruction and this gate's original rule — every shader colour is a
// colour the running application defines — cannot both hold, because the
// application contains neither of them. The allowlist is where that is written
// down rather than hidden, so the whole ramp lives on it now, every entry dated
// and each one stating the mix it is.
//
// The gate has NOT become vacuous. It still fails on a sixth colour, on a
// colour that is neither a token nor listed here, on a listed colour nobody
// uses, and on the reference's own palette creeping back in.
const APPROVED = {
  '#020202': "Onyx, the owner's reference card, the page's own ground (27.08.2026)",
  '#22282b': '18% Candy Blue mixed into Onyx, the dark quarter of the ramp (27.08.2026)',
  '#5e7078': '52% Candy Blue mixed into Onyx, the middle of the ramp (27.08.2026)',
  '#819aa5': '72% Candy Blue mixed into Onyx, the light quarter of the ramp (27.08.2026)',
  '#b2d5e5': "Candy Blue, the owner's reference card, the page's own ink (27.08.2026)",
}

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, checker } from './lib.mjs'

const c = checker('G3')

// aui.io's own colours, plus the recipe the catalogue component arrived with.
const FOREIGN = ['#ff4800', '#f1f0e0', '#121212', '#67e8f9', '#155e75', '#071a24', '#f0fdfa']

const srgb = (x) => {
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
}

/** OKLCH -> sRGB hex, the same transform the product's own build uses. */
function oklchToHex(L, C, H) {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return '#' + [srgb(r), srgb(g), srgb(bb)].map((v) => v.toString(16).padStart(2, '0')).join('')
}

// ---- the product's token table --------------------------------------------
const tokens = JSON.parse(
  await readFile(path.join(ROOT, 'data', 'product-tokens.json'), 'utf8')
)
const appColours = new Map()
for (const [name, value] of Object.entries(tokens)) {
  const resolved = value && typeof value === 'object' ? value.resolved : null
  if (typeof resolved !== 'string') continue
  const m = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/.exec(resolved)
  const hex = m ? oklchToHex(+m[1], +m[2], +m[3]) : /^#[0-9a-f]{6}$/i.test(resolved) ? resolved : null
  if (!hex) continue
  if (!appColours.has(hex.toLowerCase())) appColours.set(hex.toLowerCase(), name)
}

c.ok(appColours.size >= 20, `the product token table looks empty: ${appColours.size} colours`)
c.note(`${appColours.size} distinct colours defined by the running application`)

// ---- the control: the reference is not the product ------------------------
const impostors = FOREIGN.filter((hex) => appColours.has(hex))
c.ok(
  impostors.length === 0,
  `the token table claims to contain the reference's own colours: ${impostors.join(', ')}`
)
c.note(`control: none of the ${FOREIGN.length} foreign colours is a product token`)

// ---- the shader -----------------------------------------------------------
const src = await readFile(path.join(ROOT, 'src', 'components', 'ShaderBackground.tsx'), 'utf8')
const match = /export const SHADER_PALETTE = \[([^\]]+)\]/.exec(src)
c.ok(Boolean(match), 'SHADER_PALETTE is not declared in ShaderBackground.tsx')
if (!match) {
  c.report()
  process.exit()
}
const palette = [...match[1].matchAll(/'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1].toLowerCase())
c.ok(palette.length >= 4, `the shader needs at least four colours, it has ${palette.length}`)

for (const hex of palette) {
  const token = appColours.get(hex)
  const approved = APPROVED[hex]
  c.ok(
    Boolean(token) || Boolean(approved),
    `${hex} is neither a colour the application defines nor an approved one`
  )
  if (token) c.note(`${hex}  ${token}`)
  else if (approved) c.note(`${hex}  approved: ${approved}`)
}

// An allowlist entry that nothing uses is an entry nobody is reading.
for (const [hex, why] of Object.entries(APPROVED)) {
  c.ok(palette.includes(hex), `${hex} is allowlisted (${why}) but is not in the shader; drop it`)
}

// The control that keeps the allowlist from swallowing the gate: the four
// approved colours must NOT be product tokens. If one ever became one, the
// entry is stale and the note above would be claiming an approval the palette
// no longer needs.
const nowNative = Object.keys(APPROVED).filter((hex) => appColours.has(hex))
c.ok(
  nowNative.length === 0,
  `the allowlist claims to approve colours the application already defines: ${nowNative.join(', ')}`
)
c.note(`control: none of the ${Object.keys(APPROVED).length} approved colours is a product token`)

// ---- and the pointer is really gone ---------------------------------------
// The owner asked for a ground that does not answer the mouse. The catalogue
// component ships a cursor branch and four window listeners; this asserts they
// were removed rather than switched off, because a flag can be flipped back by
// a re-pull and nobody would see it in a screenshot.
for (const trace of ['u_cursor', 'pointermove', 'cursorEnabled', 'u_mouse']) {
  c.ok(!src.includes(trace), `the shader still carries pointer code: ${trace}`)
}
c.note('no pointer uniform, no pointer listener, no cursor branch')

c.report()
