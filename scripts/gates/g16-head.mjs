// G16: the document says who it is, once.
//
// The SEO audit of 27.08.2026 found the head missing everything a crawler or a
// chat client reads before it decides anything: no canonical, no og:url, no
// og:image, no twitter card. A share of this link rendered as a bare URL.
//
// The gate then earned its second half within the hour. Two sessions edited
// index.html at the same time and the file came out with `canonical` declared
// twice, `og:url` twice and `og:locale` twice. Identical values, so nothing
// broke, but the same thing with different values is a page arguing with
// itself, and nothing in the build would have said so. Hence: not "the tag is
// present" but "the tag is present exactly once".
//
// Everything here is read off dist/, not off index.html, because index.html is
// the source and dist/ is what ships. And it runs over EVERY index.html in the
// build, so a second locale is covered the day it appears rather than the day
// somebody remembers to add it here.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { DIST, checker } from './lib.mjs'

const c = checker('G16')
const ORIGIN = 'https://inplace.digital'

const pages = (dir = DIST, prefix = '/') => {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name !== 'assets') out.push(...pages(path.join(dir, e.name), `${prefix}${e.name}/`))
    } else if (e.name === 'index.html') {
      out.push({ url: prefix, file: path.join(dir, e.name) })
    }
  }
  return out
}

/** Every value of a given tag, so duplicates are visible rather than shadowed. */
const metas = (html, attr, key) => {
  const re = new RegExp(`<meta[^>]*\\b${attr}=["']${key}["'][^>]*>`, 'gi')
  return (html.match(re) || []).map((tag) => (tag.match(/content=["']([^"']*)["']/i) || [])[1] ?? '')
}
const links = (html, rel) => {
  const re = new RegExp(`<link[^>]*\\brel=["']${rel}["'][^>]*>`, 'gi')
  return (html.match(re) || []).map((tag) => (tag.match(/href=["']([^"']*)["']/i) || [])[1] ?? '')
}

/**
 * The real pixel size of a JPEG, from its own SOF marker.
 *
 * og:image:width and og:image:height are a promise to the chat client about a
 * file it has not fetched yet. Asserting that the promise matches the numbers
 * in the same file would assert nothing; this opens the picture.
 */
function jpegSize(file) {
  const b = readFileSync(file)
  if (b.readUInt16BE(0) !== 0xffd8) return null
  let i = 2
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i++; continue }
    const marker = b[i + 1]
    // SOF0..SOF15, minus the four markers in that range that are not frames.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }
    }
    i += 2 + b.readUInt16BE(i + 2)
  }
  return null
}

const found = pages()
c.ok(found.length > 0, 'dist/ has no index.html. Run `npm run build` first.')

for (const { url, file } of found) {
  const html = readFileSync(file, 'utf8')
  const at = (what) => `${url} ${what}`

  // ---- canonical -----------------------------------------------------------
  const canon = links(html, 'canonical')
  c.ok(canon.length === 1, at(`declares canonical ${canon.length} times, it must declare it once`))
  if (canon.length) {
    c.ok(canon[0] === `${ORIGIN}${url}`, at(`canonical is ${canon[0]}, expected ${ORIGIN}${url}`))
  }

  // ---- robots --------------------------------------------------------------
  const robots = metas(html, 'name', 'robots')
  c.ok(robots.length === 1, at(`declares meta robots ${robots.length} times`))
  if (robots.length) {
    c.ok(!/noindex/i.test(robots[0]), at(`meta robots says noindex: "${robots[0]}"`))
    c.ok(
      /max-image-preview:large/i.test(robots[0]),
      at('meta robots does not ask for a large image preview')
    )
  }

  // ---- title and description ----------------------------------------------
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || ''
  c.ok(title.length >= 15 && title.length <= 70, at(`title is ${title.length} chars, want 15-70`))

  const desc = metas(html, 'name', 'description')
  c.ok(desc.length === 1, at(`declares meta description ${desc.length} times`))
  if (desc.length) {
    c.ok(
      desc[0].length >= 70 && desc[0].length <= 165,
      at(`description is ${desc[0].length} chars, want 70-165`)
    )
  }

  // ---- Open Graph and Twitter ---------------------------------------------
  const once = {
    'og:title': metas(html, 'property', 'og:title'),
    'og:description': metas(html, 'property', 'og:description'),
    'og:type': metas(html, 'property', 'og:type'),
    'og:url': metas(html, 'property', 'og:url'),
    'og:site_name': metas(html, 'property', 'og:site_name'),
    'og:locale': metas(html, 'property', 'og:locale'),
    'og:image': metas(html, 'property', 'og:image'),
    'og:image:width': metas(html, 'property', 'og:image:width'),
    'og:image:height': metas(html, 'property', 'og:image:height'),
    'og:image:alt': metas(html, 'property', 'og:image:alt'),
    'twitter:card': metas(html, 'name', 'twitter:card'),
    'twitter:image': metas(html, 'name', 'twitter:image'),
  }
  for (const [key, values] of Object.entries(once)) {
    c.ok(values.length === 1, at(`declares ${key} ${values.length} times, it must declare it once`))
  }

  const ogUrl = once['og:url'][0]
  if (ogUrl) c.ok(ogUrl === `${ORIGIN}${url}`, at(`og:url is ${ogUrl}, expected ${ORIGIN}${url}`))

  const card = once['twitter:card'][0]
  if (card) {
    c.ok(card === 'summary_large_image', at(`twitter:card is "${card}", want summary_large_image`))
  }

  // ---- the share picture, opened ------------------------------------------
  const ogImage = once['og:image'][0]
  if (ogImage) {
    c.ok(ogImage.startsWith('https://'), at(`og:image is not absolute: ${ogImage}`))
    const rel = ogImage.replace(ORIGIN, '')
    const onDisk = path.join(DIST, rel)
    if (c.ok(existsSync(onDisk), at(`og:image is not in the build: ${rel}`))) {
      const size = jpegSize(onDisk)
      const kb = statSync(onDisk).size / 1024
      c.ok(size !== null, at(`og:image is not a readable JPEG: ${rel}`))
      if (size) {
        c.ok(
          size.w === Number(once['og:image:width'][0]) &&
            size.h === Number(once['og:image:height'][0]),
          at(
            `og:image is ${size.w}x${size.h} but the page promises ` +
              `${once['og:image:width'][0]}x${once['og:image:height'][0]}`
          )
        )
        c.ok(size.w >= 1200 && size.h >= 630, at(`og:image is ${size.w}x${size.h}, want 1200x630`))
      }
      c.ok(kb <= 300, at(`og:image is ${kb.toFixed(0)}KB; some chat clients skip previews over 300KB`))
      c.note(`${url} share card ${rel} ${size ? `${size.w}x${size.h}` : '?'} ${kb.toFixed(0)}KB`)
    }
    c.ok(
      (once['og:image:alt'][0] || '').length >= 10,
      at('og:image:alt is missing or too short to describe the card')
    )
  }

  // ---- the icon the browser asks for whether it is declared or not ---------
  c.ok(existsSync(path.join(DIST, 'favicon.ico')), 'dist/favicon.ico is missing')

  c.note(`${url} canonical ${canon[0] || 'none'}, title ${title.length} chars, description ${(desc[0] || '').length}`)
}

c.report()
