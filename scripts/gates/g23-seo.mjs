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
//      browser stepped past it to the original. The same thing then happened a
//      second time at 1400, on the supporting pages, whose 702px reading column
//      asks for 1,404 on a ratio-2 desktop. Hence the assertion here is not "a
//      srcset exists" but "every width it names is a file that exists, and the
//      set covers the widths this site actually asks for".
//
//   3. The dates. Nothing on this site carried one, in the markup or on the
//      screen, and an answer engine weighs a page it can date against one it
//      cannot.
//
//   4. llms.txt. Generated from the build, like the sitemap, because the
//      hand-written sitemap was wrong within the hour of being written.
//
// AND THREE THE OWNER DECIDED ON 28.08.2026, WHICH ARE HELD HERE TOO
//
//   5. Every supporting page carries a picture, and NOT one of the home page's
//      six. The first cut reused them; the objection is that a reader arriving
//      from the home page meets the same picture twice and image search is
//      offered one file claiming to be two subjects.
//   6. The film is declared as a VideoObject.
//   7. IndexNow. The key is a file at the site root whose NAME is the key, so
//      a rename or a second key file silently breaks the proof of control.

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

// ---- 2b. the <picture> wrappers -------------------------------------------
// AVIF is 40% smaller than the WebP on this material and the browser takes the
// FIRST type it understands, so the order of the sources is the whole feature:
// a WebP source written above an AVIF one means no browser ever reaches the
// AVIF. Nothing about the page would look wrong.
let pictures = 0
for (const { url, file } of all) {
  const html = readFileSync(file, 'utf8')
  for (const [block] of html.matchAll(/<picture>[\s\S]*?<\/picture>/gi)) {
    const at = (what) => `${url} a <picture> ${what}`
    const types = [...block.matchAll(/<source[^>]*type="([^"]+)"/gi)].map((m) => m[1])
    c.ok(types[0] === 'image/avif', at(`leads with ${types[0] || 'no source'}, not image/avif`))
    c.ok(types.includes('image/webp'), at('offers no WebP source for a browser without AVIF'))
    // The <img> inside is what a crawler reads and what a browser without
    // either source falls back to. It is never allowed to be missing.
    c.ok(/<img[^>]*\ssrc="/.test(block), at('has no <img> fallback inside it'))

    for (const [, set] of block.matchAll(/<source[^>]*srcSet="([^"]*)"/gi)) {
      for (const cand of set.split(',')) {
        const [href, w] = cand.trim().split(/\s+/)
        c.ok(
          existsSync(path.join(DIST, href.replace(/^\//, ''))),
          at(`names ${href}, which is not in the build`)
        )
        c.ok(/^\d+w$/.test(w || ''), at(`names ${href} with a descriptor of ${w || 'nothing'}`))
      }
    }
    pictures++
  }
}
c.ok(pictures >= ladders, `${ladders} ladders but only ${pictures} <picture> wrappers`)
c.note(`${pictures} <picture> wrappers, AVIF first in each`)

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
  const resized = [...text.matchAll(/\/assets\/(screen-[a-z-]+-\d+\.(?:webp|avif))/g)].map((m) => m[1])
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

// ---- 5. a picture on every supporting page, and never a repeat -------------
// The six on the home page and the six on the supporting pages are twelve
// different screens of one product. If any file appears on both sides, the
// instruction of 28.08.2026 has been undone — most likely by somebody reusing
// an `alt` that already existed rather than writing one.
//
// Only what the page DRAWS. The home page's SoftwareApplication node lists all
// twelve screens, because all twelve are screens of the product; reading the
// graph as well would make every page look like a repeat of every other. The
// JSON-LD comes out first, and what is left is the markup a reader sees.
const shotsOn = (file) => {
  const html = readFileSync(file, 'utf8').replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    ''
  )
  return new Set(
    [...html.matchAll(/\/assets\/(screen-[a-z-]+)(?:-\d+)?\.(?:webp|avif)/g)].map((m) => m[1])
  )
}
const homeShots = shotsOn(path.join(DIST, 'index.html'))
c.ok(homeShots.size >= 6, `the home page shows ${homeShots.size} product screens`)

const legal = new Set(['/terms/', '/privacy/', '/en/terms/', '/en/privacy/'])
let docShots = 0
for (const { url, file } of all) {
  if (url === '/' || url === '/en/') continue
  const shots = shotsOn(file)
  const at = (what) => `${url} ${what}`
  if (legal.has(url)) {
    // A legal document illustrated with a screenshot of the product is
    // decoration on the one page a reader is reading in order to decide
    // something. Deliberately none, and asserted so it stays deliberate.
    c.ok(shots.size === 0, at(`carries ${[...shots].join(', ')}, and it is a legal document`))
    continue
  }
  if (!c.ok(shots.size > 0, at('carries no picture of the product at all'))) continue
  for (const shot of shots) {
    c.ok(!homeShots.has(shot), at(`shows ${shot}, which the home page already shows`))
  }
  docShots++
}
c.note(`${homeShots.size} screens on the home page, ${docShots} supporting pages with a screen of their own`)

// ---- 6. the film, declared -------------------------------------------------
for (const home of ['/', '/en/']) {
  const file = path.join(DIST, home === '/' ? 'index.html' : 'en/index.html')
  const html = readFileSync(file, 'utf8')
  const at = (what) => `${home} ${what}`
  const block = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1]
  const video = (JSON.parse(block)['@graph'] || []).find((n) => n['@type'] === 'VideoObject')
  if (!c.ok(Boolean(video), at('declares no VideoObject for the film it plays'))) continue
  // Google's required four. A VideoObject missing any of them is not eligible
  // for anything and is only noise in the graph.
  for (const field of ['name', 'description', 'thumbnailUrl', 'uploadDate']) {
    c.ok(Boolean(video[field]), at(`VideoObject has no ${field}`))
  }
  c.ok(/^PT(\d+M)?\d+S$/.test(video.duration || ''), at(`VideoObject duration is ${video.duration}`))
  // Both files it names have to be in the build, or the declaration points at
  // nothing and a fetch of it 404s.
  for (const field of ['thumbnailUrl', 'contentUrl']) {
    const rel = String(video[field] || '').replace(ORIGIN, '')
    c.ok(existsSync(path.join(DIST, rel.replace(/^\//, ''))), at(`VideoObject ${field} is ${rel}, which is not in the build`))
  }
  // The page calls it a visualisation, in its own caption, in both editions.
  // The declaration is that same sentence and not a second description written
  // for search: a video result promising something the page does not is the
  // exact risk the owner accepted this node under, and this is the line that
  // keeps the promise the page makes.
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '')
  const caption = video.description.replace(/&nbsp;/g, ' ')
  c.ok(
    body.includes(caption),
    at(`VideoObject describes the film as "${caption}", which the page does not say anywhere`)
  )
  c.ok(
    /^(הדמיה|Visualisation)/.test(caption),
    at(`VideoObject description opens with "${caption.slice(0, 24)}" rather than naming it a visualisation`)
  )
}

// ---- 7. IndexNow ------------------------------------------------------------
// The protocol proves control of the host by serving a file whose NAME is the
// key and whose CONTENT is the same key. Two key files, or a name and a content
// that disagree, and every submission is rejected — silently, from here.
const keys = readdirSync(DIST).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (c.ok(keys.length === 1, `the build carries ${keys.length} IndexNow key files, it must carry one`)) {
  const name = keys[0].replace(/\.txt$/, '')
  const body = readFileSync(path.join(DIST, keys[0]), 'utf8').trim()
  c.ok(body === name, `the IndexNow key file is named ${name} and contains something else`)
  c.note(`IndexNow key served at /${keys[0]}`)
}

c.report()
