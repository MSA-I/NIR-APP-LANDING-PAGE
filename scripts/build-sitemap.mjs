// Write dist/sitemap.xml from the pages that were actually built.
//
// The first cut of this was a hand-written public/sitemap.xml with one URL in
// it, and it was wrong within the hour: a second locale appeared at /en/ and
// the file did not know. A sitemap that has to be remembered is a sitemap that
// goes stale, and a stale sitemap is worse than none, because it tells a
// crawler that the pages it lists are the pages that exist.
//
// So the list is derived, not declared. Every index.html under dist/ is a page,
// every screen-*.webp under dist/assets is a product screenshot, and both of
// those are facts about the build rather than notes about it.
//
// It also refuses to write a sitemap it does not believe: if a page carries a
// canonical that points somewhere other than the page's own address, the two
// are in conflict and the sitemap would be advertising an address the page
// itself disowns. That is the exact failure a second locale invites, because
// the usual way to add one is to copy the first locale's <head>.
//
//   node scripts/build-sitemap.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const ORIGIN = 'https://inplace.digital'

/** Every index.html in the build, as a site-absolute path with a trailing slash. */
function pages(dir = DIST, prefix = '/') {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue
      found.push(...pages(path.join(dir, entry.name), `${prefix}${entry.name}/`))
    } else if (entry.name === 'index.html') {
      found.push({ url: prefix, file: path.join(dir, entry.name) })
    }
  }
  return found
}

const canonicalOf = (html) => {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)
  return m ? (m[0].match(/href=["']([^"']+)["']/i) || [])[1] || null : null
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** The authored revision date from the page's WebPage structured-data node. */
const modifiedOf = (html) => {
  for (const [, source] of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const data = JSON.parse(source)
    const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data]
    const page = graph.find((node) => node?.['@type'] === 'WebPage')
    if (ISO_DATE.test(page?.dateModified || '')) return page.dateModified
  }
  return null
}

const found = pages().sort((a, b) => a.url.length - b.url.length || a.url.localeCompare(b.url))
if (!found.length) {
  console.error('no pages in dist/. Run `vite build` first.')
  process.exit(1)
}

// The screenshots are the one thing on this site worth surfacing in image
// search: they are the product, photographed. They hang off the root page
// because an image belongs to one page, and the root is the Hebrew original.
// The full-width cut only. scripts/build-shots.mjs writes a `-1000` sibling of
// every one of these for the phones to pick out of the srcset, and listing both
// would offer image search the same picture twice at two resolutions.
const shots = readdirSync(path.join(DIST, 'assets'))
  .filter((f) => /^screen-.*\.webp$/.test(f) && !/-\d+\.webp$/.test(f))
  .sort()

/**
 * The same document in the other language, as a site-absolute path.
 *
 * Every page on this site exists in both editions and the paths differ by one
 * segment, so the pairing is arithmetic rather than a table to keep. The caller
 * checks that the twin was actually built before writing it down.
 */
const twin = (url) => (url.startsWith('/en/') ? url.slice(3) : `/en${url}`)

const problems = []
const entries = found.map(({ url, file }) => {
  const html = readFileSync(file, 'utf8')
  const declared = canonicalOf(html)
  const expected = `${ORIGIN}${url}`
  if (declared && declared !== expected) {
    problems.push(`${url} declares canonical ${declared}, but it is served at ${expected}`)
  }
  if (!declared) problems.push(`${url} has no canonical`)
  const lastmod = modifiedOf(html)
  if (!lastmod) problems.push(`${url} has no valid WebPage.dateModified`)
  return { url, expected, lastmod: lastmod || '' }
})

if (problems.length) {
  console.error('sitemap NOT written:')
  for (const p of problems) console.error(`   ${p}`)
  process.exit(1)
}

const images = shots
  .map((f) => `      <image:image><image:loc>${ORIGIN}/assets/${f}</image:loc></image:image>`)
  .join('\n')

// Which pages actually exist, so an alternates block is only written when both
// halves of a pair were built. A sitemap that names a URL the build did not
// produce is the same lie as a sitemap that omits one it did.
const built = new Set(entries.map((e) => e.url))

/**
 * The hreflang block for one URL.
 *
 * The pages carry these in their own <head> already, and this is the second
 * statement of the same fact, which is what Google asks for once a site has
 * more than one language: the pairing survives for a page a crawler reaches
 * before it has fetched the twin. x-default names the English edition, the same
 * answer index.html and src/lib/page-html.ts give, because a Hebrew reader is
 * served by hreflang="he" and the fallback is only ever read by somebody who is
 * neither.
 */
const alternates = (url) => {
  const other = twin(url)
  if (!built.has(other)) return ''
  const he = url.startsWith('/en/') ? other : url
  const en = url.startsWith('/en/') ? url : other
  return (
    `    <xhtml:link rel="alternate" hreflang="he" href="${ORIGIN}${he}"/>\n` +
    `    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}${en}"/>\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${en}"/>\n`
  )
}

const body = entries
  .map(
    ({ url, expected, lastmod }) =>
      `  <url>\n` +
      `    <loc>${expected}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>${url === '/' ? '1.0' : '0.8'}</priority>\n` +
      alternates(url) +
      (url === '/' && images ? `${images}\n` : '') +
      `  </url>`
  )
  .join('\n')

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!-- Generated by scripts/build-sitemap.mjs. Do not edit by hand. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  `${body}\n` +
  `</urlset>\n`

writeFileSync(path.join(DIST, 'sitemap.xml'), xml)
console.log(
  `dist/sitemap.xml  ${entries.length} page${entries.length === 1 ? '' : 's'} ` +
    `(${entries.map((e) => e.url).join(', ')}), ${shots.length} images, ` +
    `${entries.filter((e) => built.has(twin(e.url))).length} with hreflang alternates`
)
