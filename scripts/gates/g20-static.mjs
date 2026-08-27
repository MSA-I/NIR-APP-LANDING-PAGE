// G20: the page can be read without running it.
//
// The SEO audit of 27.08.2026 disabled JavaScript and counted what was left:
// 121 characters, against 5,474 in a real browser. Google executes JavaScript
// and saw the whole page, which is exactly why nothing looked wrong. GPTBot,
// PerplexityBot and ClaudeBot do not execute it, and for them the entire
// argument of this page was one <noscript> paragraph.
//
// scripts/prerender.mjs now writes the rendered document into dist/index.html.
// This gate reads the FILE, never a browser, because the whole question is what
// arrives before anything runs.
//
// It checks for real sentences from the copy rather than a character count
// alone: a count can be satisfied by markup, class names and inline styles,
// and none of those are what a crawler quotes.

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { DIST, checker } from './lib.mjs'

const c = checker('G20')

const pages = (dir = DIST, prefix = '/') => {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name !== 'assets') out.push(...pages(path.join(dir, e.name), `${prefix}${e.name}/`))
    } else if (e.name === 'index.html') out.push({ url: prefix, file: path.join(dir, e.name) })
  }
  return out
}

const readable = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

// Floors, not targets, and there are two kinds of page here.
//
// The home page is the React application rendered to a string; it carries about
// 8,800 characters. The supporting pages are documents with no JavaScript at
// all, about 2,300 characters each. A single floor would either wave the home
// page through when the static render broke, or call every supporting page thin.
const FLOOR_HOME = 5000
const FLOOR_PAGE = 1800

for (const { url, file } of pages()) {
  const html = readFileSync(file, 'utf8')
  const text = readable(html)
  const at = (what) => `${url} ${what}`
  const home = url === '/'
  const floor = home ? FLOOR_HOME : FLOOR_PAGE

  c.ok(
    text.length >= floor,
    at(`carries ${text.length} readable characters without JavaScript, under the ${floor} floor. ` +
      (home ? 'Did scripts/prerender.mjs run?' : 'Thin pages do not earn a search result.'))
  )

  // A supporting page is a document: one h1, several h2s, and links to the rest
  // of the cluster so a reader (and a crawler) can move between them.
  if (!home) {
    const h1s = (html.match(/<h1[\s>]/g) || []).length
    const h2s = (html.match(/<h2[\s>]/g) || []).length
    c.ok(h1s === 1, at(`has ${h1s} h1 elements, it should have exactly one`))
    c.ok(h2s >= 4, at(`has ${h2s} sections, expected at least 4`))

    const internal = new Set(
      [...html.matchAll(/href="\/([a-z-]+)\/"/g)].map((m) => m[1])
    )
    c.ok(internal.size >= 2, at(`links to ${internal.size} other pages, expected at least 2`))
    c.ok(/href="\/"/.test(html), at('does not link back to the home page'))

    // No bundle on a page that has nothing to run.
    c.ok(
      !/<script[^>]+type="module"/.test(html),
      at('loads a JavaScript module; these pages are documents and should carry none')
    )

    c.note(`${url} ${text.length} characters, ${h2s} sections, ${internal.size} sibling links, no JavaScript`)
    continue
  }

  // The mount point must not be empty in the shipped file. This is the exact
  // state the audit found, and it is invisible in a browser.
  c.ok(
    !/<div id="root"><\/div>/.test(html),
    at('ships with an empty <div id="root">, so nothing is readable before the bundle runs')
  )

  // The headline and one line from every chapter, in the raw file.
  const MUST_READ = [
    'כשההזמנה והחשבונית לא מסכימות, זה נעצר כאן.',
    'מה InPlace עושה בפועל',
    'למה לא גיליון, ולמה לא ERP',
    'מסלולים',
    'שאלות שנשאלות לפני שמתחילים',
  ]
  for (const line of MUST_READ) {
    c.ok(text.includes(line), at(`does not contain "${line}" before JavaScript runs`))
  }

  // The five product screenshots, with their alt text, in the file. Before the
  // panels were all rendered these were one <img> whose src was swapped, so
  // four of the five existed only after a click.
  const alts = [...html.matchAll(/<img[^>]*alt="([^"]*)"[^>]*>/g)].map((m) => m[1])
  const screens = [...html.matchAll(/src="\/assets\/(screen-[^"]+)"/g)].map((m) => m[1])
  c.ok(
    new Set(screens).size >= 6,
    at(`has ${new Set(screens).size} product screenshots in the static markup, expected 6`)
  )
  c.ok(
    alts.filter((a) => a.includes('InPlace')).length >= 6,
    at(`has ${alts.filter((a) => a.includes('InPlace')).length} described screenshots, expected 6`)
  )

  // The <noscript> paragraph promises the reader can read the page without
  // JavaScript. Now that it is true, it has to STAY true, and this is the
  // assertion that keeps the sentence honest.
  const noscript = (html.match(/<noscript>([\s\S]*?)<\/noscript>/) || [])[1] || ''
  if (/אפשר לקרוא/.test(noscript)) {
    c.ok(
      text.length >= floor,
      at('promises in <noscript> that the page can be read without JavaScript, and it cannot')
    )
  }

  c.note(
    `${url} ${text.length.toLocaleString('en-US')} readable characters, ` +
      `${new Set(screens).size} product screenshots, no empty root`
  )
}

c.report()
