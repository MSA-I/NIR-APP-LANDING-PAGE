// G3: the shader ground is painted in the application's own colours.
//
// The owner's note on 26.08.2026: "הצבעים צריכים להיות בצבעי האפליקציה כרגע זה
// לא המצב". The build before this one used a turquoise the product does not
// contain, so "in the palette family" is no longer a strong enough test. This
// gate now asserts something exact: every colour in the shader is a token the
// running application actually defines, matched against the OKLCH values
// captured in data/product-tokens.json and converted here.
//
// Two controls, because two things could make it vacuous: aui.io's own colours
// must NOT resolve to product tokens, and the token table must be non-empty.

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
  c.ok(Boolean(token), `${hex} is not a colour the application defines`)
  if (token) c.note(`${hex}  ${token}`)
}

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
