// Self-hosts the display face. The page ships one origin and no third-party
// font request; build 3 self-hosted Noto Sans Hebrew and build 4 keeps that rule.
//
// Google writes the subset name in a comment BEFORE each @font-face, so the
// pairs are read together. Splitting on '@font-face' alone attaches every
// comment to the wrong block, which is how the first cut of this shipped a
// latin-ext file labelled "latin".
import { writeFileSync, mkdirSync } from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const url = 'https://fonts.googleapis.com/css2?family=Heebo:wght@400..900&display=swap'
const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text()

// Hebrew and latin. Latin was dropped once, when the display face was only ever
// asked for Hebrew; since 27.08.2026 Heebo sets the headlines on /en/ as well,
// so the latin subset has a reader again. Nothing else is fetched.
const WANT = new Set(['hebrew', 'latin'])
const pairs = [...css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
mkdirSync('public/assets/fonts', { recursive: true })
const out = []
for (const [, name, block] of pairs) {
  if (!WANT.has(name)) continue
  const src = /url\((https:[^)]+\.woff2)\)/.exec(block)?.[1]
  const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1]
  if (!src) continue
  const file = `Heebo-${name}.woff2`
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer())
  writeFileSync(`public/assets/fonts/${file}`, buf)
  out.push({ file, range, bytes: buf.length })
}
if (out.length !== WANT.size) {
  console.error('subsets found:', pairs.map((p) => p[1]).join(', '))
  process.exit(1)
}
console.log(JSON.stringify(out, null, 2))
