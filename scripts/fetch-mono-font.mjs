// Self-hosts the annotation face, the same way scripts/fetch-display-font.mjs
// self-hosts the display one. One origin, no third-party font request.
//
// WHY ROBOTO MONO, 30.08.2026. The owner's note was that the English edition
// carries a font that does not belong to the page's system, and the measurement
// agreed in a way that explains why only the English edition showed it: the
// mono is declared on the eyebrows, the figures and the colophon's rights line
// in BOTH editions, but its `unicode-range` is latin-only — deliberately, since
// its Hebrew glyphs are empty — so on the Hebrew page every eyebrow silently
// falls back to the reading face and NOBODY EVER SEES THE MONO. On /en/ it is
// painted, on 26 elements. The page was being set in two typographic systems,
// one per language, and only one of them had been looked at.
//
// So the face had to be one that sits with Heebo rather than against it, and
// there is an exact answer rather than a taste: Heebo IS Roboto below the
// Hebrew — "Latin based on Roboto by Christian Robertson", in this repo's own
// licence file — and Roboto Mono is that same skeleton on a fixed advance.
// Rendered side by side against IBM Plex Mono and JetBrains Mono on the page's
// real strings before the choice was made.
//
// LATIN ONLY, and that is not an oversight: it is what Hasubi's range did too,
// and it is what keeps Hebrew on the reading face, which is what a Hebrew
// reader has been seeing all along and what G9 measures the ink of.
import { writeFileSync, mkdirSync } from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const url = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400..700&display=swap'
const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text()

const pairs = [...css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
const hit = pairs.find(([, name]) => name === 'latin')
if (!hit) {
  console.error('subsets found:', pairs.map((p) => p[1]).join(', '))
  process.exit(1)
}

const src = /url\((https:[^)]+\.woff2)\)/.exec(hit[2])?.[1]
const range = /unicode-range:\s*([^;]+);/.exec(hit[2])?.[1]
if (!src) {
  console.error('no woff2 in the latin block')
  process.exit(1)
}

mkdirSync('public/assets/fonts', { recursive: true })
const buf = Buffer.from(await (await fetch(src)).arrayBuffer())
writeFileSync('public/assets/fonts/RobotoMono-latin.woff2', buf)
console.log(JSON.stringify({ file: 'RobotoMono-latin.woff2', bytes: buf.length, range }, null, 2))
