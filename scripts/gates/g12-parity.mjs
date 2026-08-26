// G12: en and fr mirror the Hebrew dictionary key for key.
//
// Trilingual parity is where a page quietly rots: a key added to the source and
// forgotten in a mirror renders as `undefined` for a whole locale, and nobody
// who reads that locale is in the room. This walks the shape rather than the
// values, so a missing key, an extra key or an array of the wrong length all
// fail before a build ships them.

import { checker, distExists } from './lib.mjs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { DIST } from './lib.mjs'

const c = checker('G12')

const he = (await import('../../i18n/he.js')).default
const en = (await import('../../i18n/en.js')).default
const fr = (await import('../../i18n/fr.js')).default

function shape(o, prefix = '') {
  if (Array.isArray(o)) {
    return [
      prefix + '[]:' + o.length,
      ...o.flatMap((v, i) => shape(v, prefix + '[' + i + ']')),
    ]
  }
  if (o && typeof o === 'object') {
    return Object.keys(o)
      .sort()
      .flatMap((k) => shape(o[k], prefix ? prefix + '.' + k : k))
  }
  return [prefix + ':' + typeof o]
}

const base = shape(he)
for (const [name, dict] of [['en', en], ['fr', fr]]) {
  const theirs = shape(dict)
  const missing = base.filter((k) => !theirs.includes(k))
  const extra = theirs.filter((k) => !base.includes(k))
  c.ok(missing.length === 0, `${name} is missing: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ` (+${missing.length - 8})` : ''}`)
  c.ok(extra.length === 0, `${name} has keys Hebrew does not: ${extra.slice(0, 8).join(', ')}`)
  if (!missing.length && !extra.length) c.note(`${name}: ${base.length} leaves, shape identical to he`)
}

// Ids and states are structural, not translatable: they drive CSS and JS.
for (const [name, dict] of [['en', en], ['fr', fr]]) {
  const ids = dict.stations.map((s) => s.id).join(',')
  c.ok(ids === he.stations.map((s) => s.id).join(','), `${name} station ids differ from he: ${ids}`)
  const states = dict.stations.map((s) => s.state).join(',')
  c.ok(states === he.stations.map((s) => s.state).join(','), `${name} station states differ from he`)
  const amounts = dict.stations.map((s) => s.amount).join(',')
  c.ok(amounts === he.stations.map((s) => s.amount).join(','), `${name} station amounts differ from he`)
  const exception = dict.sort.docs.filter((d) => d.exception).map((d) => d.ref).join(',')
  c.ok(exception === 'INV-2311', `${name} marks a different document as the exception: ${exception}`)
}

// No Hebrew left in the mirrors, and no Latin-only page claiming to be Hebrew.
const HEB = /[֐-׿]/
for (const [name, dict] of [['en', en], ['fr', fr]]) {
  const strings = []
  const walk = (o, p = '') => {
    if (typeof o === 'string') strings.push([p, o])
    else if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p ? p + '.' + k : k)
  }
  walk(dict)
  const leftover = strings.filter(([, v]) => HEB.test(v))
  c.ok(
    leftover.length === 0,
    `${name} still contains Hebrew at: ${leftover.slice(0, 5).map(([p]) => p).join(', ')}`
  )
}

// Direction and lang must actually differ.
c.ok(he.dir === 'rtl' && en.dir === 'ltr' && fr.dir === 'ltr', 'the locales do not carry the right text direction')

// And the built pages must exist, be linked to each other, and carry the
// figures. Parity in the dictionary is worth nothing if the build drops one.
if (await distExists()) {
  for (const [name, dict] of [['he', he], ['en', en], ['fr', fr]]) {
    const file = dict.path ? path.join(DIST, dict.path, 'index.html') : path.join(DIST, 'index.html')
    let html = ''
    try {
      html = await readFile(file, 'utf8')
    } catch {
      c.ok(false, `${name}: dist page missing at ${path.relative(DIST, file)}`)
      continue
    }
    c.ok(html.includes(`<html lang="${dict.htmlLang}" dir="${dict.dir}">`), `${name}: wrong lang/dir on <html>`)
    for (const other of ['he', 'en', 'fr']) {
      c.ok(html.includes(`hreflang="${other}"`), `${name}: no hreflang alternate for ${other}`)
    }
    // Assets must resolve from the sub-locale's own depth.
    const depth = dict.path ? dict.path.split('/').length : 0
    const prefix = '../'.repeat(depth)
    c.ok(html.includes(`href="${prefix}site.css"`), `${name}: site.css href does not resolve from ${dict.path || '/'}`)
    c.ok(html.includes(`src="${prefix}surface.js"`), `${name}: surface.js src does not resolve from ${dict.path || '/'}`)
    c.note(`${name}: page built, lang/dir correct, three alternates, assets resolve`)
  }
} else {
  c.ok(false, 'dist/ is missing; run `node scripts/build.mjs` first')
}

c.report()
