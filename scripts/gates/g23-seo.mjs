// G23: the four decisions of the audit of 28.08.2026, held in place.
//
// Every one of these was something the site got wrong quietly, and quietly is
// the operative word: none of them broke a page, none of them showed up in a
// screenshot, and all four would come back the first time somebody copied a
// <head> or added a locale.
//
//   1. x-default. The two home pages named the English edition and the sixteen
//      supporting pages named the Hebrew one. A site cannot answer the question
//      "which document serves a reader whose language matches neither" in two
//      different ways and expect a crawler to pick the answer it meant.
//
//   2. The srcset ladder. A phone laid these screenshots out at 344-356 CSS px
//      and downloaded 2000px files for them. The first attempt at a fix wrote a
//      single 1000px rung, and measurement showed it doing NOTHING on a
//      ratio-3 phone: 390 x 3 is 1,170, which is more than 1,000, so the
//      browser stepped past it to the original. Hence the assertion here is not
//      "a srcset exists" but "every width it names is a file that exists, and
//      the set covers the phones".
//
//   3. The dates. Nothing on this site carried one, in the markup or on the
//      screen, and an answer engine weighs a page it can date against one it
//      cannot.
//
//   4. llms.txt. Generated from the build, like the sitemap, because the
//      hand-written sitemap was wrong within the hour of being written.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { DIST, checker } from './lib.mjs'

const c = checker('G23')
const ORIGIN = 'https://inplace.digital'

const pages = (dir = DIST, prefix = '/') => {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name !== 'assets') out.push(...pages(path.join(dir, e.name), `${prefix}${e.name}/`))
    } else if (e.name === 'index.html') out.push({ url: prefix, file: path.join(dir, e.name) })
  }
  return out
}

const all = pages()
const urls = new Set(all.map((p) => p.url))

// ---- 1. one answer to x-default -------------------------------------------
for (const { url, file } of all) {
  const html = readFileSync(file, 'utf8')
  const at = (what) => `${url} ${what}`
  const alt = [...html.matchAll(/<link[^>]+rel="alternate"[^>]*>/g)].map((m) => ({
    lang: (m[0].match(/hreflang="([^"]+)"/) || [])[1],
    href: (m[0].match(/href="([^"]+)"/) || [])[1],
  }))
  const xd = alt.filter((a) => a.lang === 'x-default')
  if (!c.ok(xd.length === 1, at(`declares x-default ${xd.length} times, it must declare it once`))) {
    continue
  }
  const en = alt.find((a) => a.lang === 'en')
  if (!c.ok(Boolean(en), at('declares x-default but no en alternate'))) continue
  c.ok(
    xd[0].href === en.href,
    at(`points x-default at ${xd[0].href} while its English edition is ${en.href}`)
  )
  // And the address it names has to be a page that was actually built.
  const named = xd[0].href.replace(ORIGIN, '')
  c.ok(urls.has(named), at(`points x-default at ${named}, which the build did not produce`))
}

// ---- 2. the ladder, against the files that exist ---------------------------
let ladders = 0
for (const { url, file } of all) {
  const html = readFileSync(file, 'utf8')
  // React writes the attribute as `srcSet`; HTML attribute names are
  // case-insensitive, so this is the same attribute the browser reads.
  const imgs = [...html.matchAll(/<img[^>]*srcSet="([^"]*)"[^>]*>/gi)]
  for (const [tag, set] of imgs) {
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1] || '(no src)'
    const at = (what) => `${url} ${src} ${what}`
    const rungs = set
      .split(',')
      .map((s) => s.trim().split(/\s+/))
      .map(([href, w]) => ({ href, w: parseInt(w, 10) }))

    c.ok(rungs.length >= 2, at(`has a srcset with ${rungs.length} candidate, which is not a choice`))
    for (const r of rungs) {
      c.ok(
        existsSync(path.join(DIST, r.href.replace(/^\//, ''))),
        at(`names ${r.href} at ${r.w}w, which is not in the build`)
      )
      c.ok(Number.isFinite(r.w) && r.w > 0, at(`names ${r.href} with no width descriptor`))
    }
    // A phone lays these out at roughly the viewport width. At a device-pixel
    // ratio of 3 on a 390px screen it asks for about 1,170, and a browser never
    // picks a candidate narrower than it needs: without a rung at or above that
    // number the whole ladder is skipped and the original ships anyway. That is
    // the exact failure this gate was written after measuring.
    const widths = rungs.map((r) => r.w).sort((a, b) => a - b)
    const widest = widths[widths.length - 1]
    c.ok(
      widths.some((w) => w <= 800),
      at(`has no rung at or below 800w, so a ratio-2 phone gains nothing: ${widths.join(', ')}`)
    )
    c.ok(
      widths.some((w) => w >= 1170 && w < widest),
      at(
        `has no rung between 1170w and its widest, so a ratio-3 phone steps ` +
          `past the ladder: ${widths.join(', ')}`
      )
    )
    c.ok(
      /\ssizes="/.test(tag),
      at('carries a srcset with no sizes, so the browser assumes the image fills the viewport')
    )
    ladders++
  }
}
c.ok(ladders > 0, 'no image in the build carries a srcset at all')
c.note(`${ladders} image tags carry a ladder`)

// The narrow rungs are not the product's screens over again. The sitemap and
// the SoftwareApplication graph both list the full-width files, and listing a
// resize beside them would describe a product with three times as many screens.
const sitemap = readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8')
const home = readFileSync(path.join(DIST, 'index.html'), 'utf8')
const graphBlock = (home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1]
for (const [where, text] of [
  ['sitemap.xml', sitemap],
  ['the home page graph', graphBlock || ''],
]) {
  const resized = [...text.matchAll(/\/assets\/(screen-[a-z-]+-\d+\.webp)/g)].map((m) => m[1])
  c.ok(!resized.length, `${where} lists a resized cut: ${[...new Set(resized)].join(', ')}`)
}

// ---- 3. the dates ----------------------------------------------------------
const ISO = /^\d{4}-\d{2}-\d{2}$/
for (const { url, file } of all) {
  const html = readFileSync(file, 'utf8')
  const at = (what) => `${url} ${what}`
  const block = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1]
  if (!c.ok(Boolean(block), at('has no JSON-LD to read a date out of'))) continue
  const graph = JSON.parse(block)['@graph'] || []
  const node = graph.find((n) => n['@type'] === 'WebPage')
  if (!c.ok(Boolean(node), at('has no WebPage node'))) continue
  c.ok(ISO.test(node.dateModified || ''), at(`declares dateModified ${node.dateModified || 'nothing'}`))

  // The home page is the catalogue and moves with the product; the supporting
  // pages are documents, and a document says on its own face when it was last
  // revised.
  if (url === '/' || url === '/en/') continue
  c.ok(
    ISO.test(node.datePublished || ''),
    at(`declares datePublished ${node.datePublished || 'nothing'}`)
  )
  c.ok(
    node.dateModified >= node.datePublished,
    at(`was modified ${node.dateModified} and published ${node.datePublished}`)
  )
  const stamp = (html.match(/<time datetime="([^"]+)"/) || [])[1]
  if (!c.ok(Boolean(stamp), at('carries a date in its markup that a reader cannot see'))) continue
  c.ok(
    stamp === node.dateModified,
    at(`shows ${stamp} on the screen and ${node.dateModified} in its structured data`)
  )
}

// ---- 4. llms.txt, derived rather than remembered ---------------------------
const llms = path.join(DIST, 'llms.txt')
if (c.ok(existsSync(llms), 'the build produced no dist/llms.txt')) {
  const text = readFileSync(llms, 'utf8')
  c.ok(text.startsWith('# '), 'llms.txt does not begin with a level-one heading')
  const listed = new Set(
    [...text.matchAll(new RegExp(`\\(${ORIGIN}(/[^)]*)\\)`, 'g'))].map((m) => m[1])
  )
  for (const url of urls) {
    c.ok(listed.has(url), `llms.txt does not list ${url}, which the build produced`)
  }
  for (const url of listed) {
    c.ok(urls.has(url), `llms.txt lists ${url}, which the build did not produce`)
  }
  c.note(
    `llms.txt lists ${listed.size} of ${urls.size} built pages, ` +
      `${(statSync(llms).size / 1024).toFixed(1)}KB`
  )
}

c.report()
