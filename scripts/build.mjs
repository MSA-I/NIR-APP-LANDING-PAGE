// Render one static HTML file per locale into dist/.
//
// Three languages, one template. The alternative was three hand-maintained
// copies of a nine-act page, which is three chances to let a figure drift.

import { render } from '../src/page.mjs'
import { mkdir, writeFile, cp, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

// fileURLToPath, not a hand-rolled URL trim: this project lives under a Hebrew
// path with a space in it, and every percent-encoded character comes back wrong
// if the URL is sliced by hand.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')

const LOCALES = ['he', 'en', 'fr']
const SITE = 'https://inplace.digital'

const dicts = {}
for (const code of LOCALES) {
  const file = path.join(ROOT, 'i18n', `${code}.js`)
  if (!existsSync(file)) continue
  dicts[code] = (await import(pathToFileURL(file).href)).default
}

const available = Object.keys(dicts)
const alternates = available.map((code) => ({
  code,
  href: SITE + (dicts[code].path ? `/${dicts[code].path}` : '') + '/',
}))

await rm(DIST, { recursive: true, force: true })
await mkdir(DIST, { recursive: true })

for (const [code, t] of Object.entries(dicts)) {
  const dir = t.path ? path.join(DIST, t.path) : DIST
  await mkdir(dir, { recursive: true })

  // Sub-locales sit one level down, so their asset hrefs need a hop up.
  const depth = t.path ? t.path.split('/').length : 0
  const prefix = '../'.repeat(depth)

  let html = render({ ...t, alternates })
  if (prefix) {
    html = html
      .replace(/(href|src)="(engine\/|site\.css|surface\.js|assets\/)/g, `$1="${prefix}$2`)
  }

  await writeFile(path.join(dir, 'index.html'), html, 'utf8')
  console.log(`  ${code.padEnd(3)} ${path.relative(ROOT, path.join(dir, 'index.html'))}  ${(html.length / 1024).toFixed(1)} KB`)
}

for (const asset of ['engine', 'assets', 'site.css', 'surface.js']) {
  const from = path.join(ROOT, asset)
  if (existsSync(from)) await cp(from, path.join(DIST, asset), { recursive: true })
}

const files = await readdir(DIST)
console.log(`\ndist/: ${files.join(', ')}`)
