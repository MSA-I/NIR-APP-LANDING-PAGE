// Put the page's own words into the file that ships.
//
// Runs after `vite build`, and does two things: builds src/entry-static.tsx in
// Vite's SSR environment, and drops the string it returns inside the empty
// `<div id="root">` in dist/index.html.
//
// The measurement that made this necessary, from the SEO audit of 27.08.2026:
// with JavaScript disabled the built page contained 121 characters. That is
// what GPTBot, PerplexityBot and ClaudeBot receive, because none of them
// executes JavaScript. Google does execute it and saw the whole page, which is
// why nothing here looked broken.
//
// It is deliberately not a framework. There is one page, it is a pure function
// of a dictionary, and a static string is the entire requirement.
//
//   node scripts/prerender.mjs
//
// Two documents come out of one SSR build: the Hebrew page at dist/index.html
// and the English one at dist/en/index.html. Each carries its own structured
// data, generated from its own dictionary. The six supporting pages are written
// once, beside the Hebrew document, because src/content/pages.ts is Hebrew and
// there is no English edition of them yet.

// Vite's own API rather than a shell out to `vite build --ssr`: spawning
// `npx.cmd` from Node 24 on Windows fails with EINVAL unless a shell is
// involved, and reaching for a shell to run a build that has a JavaScript
// entry point is the wrong trade.
import { build } from 'vite'
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SSR_OUT = path.join(ROOT, 'dist-ssr')

const SSR_ENTRY = 'src/entry-static.tsx'
const PAGES = [
  { locale: 'he', html: 'dist/index.html' },
  { locale: 'en', html: 'dist/en/index.html' },
]

// The container the client mounts into, empty, exactly as index.html declares
// it. Matching the empty form on purpose: running this twice on the same file
// must not nest one render inside another, and after the first pass the marker
// is gone.
const EMPTY_ROOT = '<div id="root"></div>'

rmSync(SSR_OUT, { recursive: true, force: true })

await build({
  root: ROOT,
  logLevel: 'warn',
  build: { ssr: SSR_ENTRY, outDir: 'dist-ssr', emptyOutDir: true },
})

const built = path.join(SSR_OUT, path.basename(SSR_ENTRY).replace(/\.tsx?$/, '.js'))
if (!existsSync(built)) throw new Error(`the static build produced no ${built}`)

const { render, schema, supportingPages } = await import(pathToFileURL(built).href)

for (const { locale, html } of PAGES) {
  const markup = render(locale)
  if (!markup || markup.length < 5000) {
    throw new Error(`the static render returned ${markup.length} characters, which cannot be right`)
  }

  const file = path.join(ROOT, html)
  const doc = readFileSync(file, 'utf8')
  if (!doc.includes(EMPTY_ROOT)) {
    throw new Error(`${html} has no empty ${EMPTY_ROOT} to render into`)
  }

  // The structured data rides along on the same build, because it is generated
  // from the same dictionary the markup is. `</` inside a JSON string would end
  // the script element early, so it is escaped; nothing else here can.
  //
  // Per locale: schema(locale) reads that locale's dictionary, so each document
  // declares the plan names printed in its own markup.
  const doc$ = schema(locale)
  const graph = doc$['@graph'] || []
  const json = JSON.stringify(doc$, null, 2).replace(/<\//g, '<\\/')
  const ld = `<script type="application/ld+json">\n${json}\n</script>\n  </head>`

  writeFileSync(
    file,
    doc.replace(EMPTY_ROOT, `<div id="root">${markup}</div>`).replace('</head>', ld)
  )

  const text = markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  console.log(
    `${html}  ${(markup.length / 1024).toFixed(0)}KB of markup, ` +
      `${text.length.toLocaleString('en-US')} characters of text now readable without JavaScript, ` +
      `${graph.length} structured-data nodes (${graph.map((n) => n['@type']).join(', ')})`
  )

  // ---- the supporting pages ------------------------------------------------
  // Written from the same module, in the same pass, because they need one thing
  // from this build: the hashed stylesheet, which is only knowable after Vite
  // has run and is read straight out of the page above.
  const css = (doc.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/) || [])[1]
  if (!css) throw new Error(`no stylesheet link found in ${html}`)

  for (const page of supportingPages(css, locale)) {
    const dir = path.join(ROOT, 'dist', page.slug)
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, 'index.html'), page.html)
    const words = page.html
      .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ').length
    console.log(`dist/${page.slug}/index.html  ${words} words, no JavaScript`)
  }
}

rmSync(SSR_OUT, { recursive: true, force: true })
