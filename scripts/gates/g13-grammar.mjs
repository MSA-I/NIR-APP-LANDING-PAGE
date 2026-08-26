// G13: none of the chrome the live-surface grammar forbids, and none of the
// taste floor's refuse-list tells.
//
// A negative assertion, so it runs against a fixture that contains every tell
// before it is trusted on the real page.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, DIST, checker, withPage } from './lib.mjs'

const c = checker('G13')

// Each rule takes the page's text and HTML and returns a reason, or null.
const RULES = [
  {
    id: 'em-dash',
    why: 'em dash in visible copy',
    // The no-data dash is a product law (a metric with no data renders an em
    // dash, never a zero), so a dash standing alone as a value is exempt. A
    // dash used as punctuation inside a sentence is not.
    test: ({ text }) => {
      const bad = [...text.matchAll(/\S[  ]?—[  ]?\S/g)].map((m) => m[0])
      return bad.length ? bad.slice(0, 4).join(' / ') : null
    },
  },
  {
    id: 'scroll-cue',
    why: 'a scroll cue',
    test: ({ text }) =>
      /\b(scroll to explore|scroll down|défilez pour|גללו כדי)\b/i.test(text) ? 'found' : null,
  },
  {
    id: 'section-counter',
    why: 'section counters',
    test: ({ text }) => (/\b0\d\s*\/\s*0?\d\b/.test(text) ? 'found' : null),
  },
  {
    id: 'filler-verbs',
    why: 'filler marketing verbs',
    test: ({ text }) => {
      const hits = ['elevate', 'seamless', 'unleash', 'next-gen', 'revolutionize', 'supercharge']
        .filter((w) => new RegExp('\\b' + w, 'i').test(text))
      return hits.length ? hits.join(', ') : null
    },
  },
  {
    id: 'gradient-text',
    why: 'gradient text',
    test: ({ css }) => (/-webkit-background-clip:\s*text|background-clip:\s*text/.test(css) ? 'found' : null),
  },
  {
    id: 'glow',
    why: 'a zero-offset coloured halo shadow',
    test: ({ css }) => {
      // A glow is offset 0, offset 0, and a real blur. `0 0 0 2px` is a RING:
      // the blur is zero and the fourth length is spread, which is how a focus
      // ring or a status outline is drawn without a border that would change
      // the box. Regexing for "0 0 <digit>" cannot tell them apart, because it
      // happily starts matching at the second zero. Parse the value instead.
      const bad = []
      for (const decl of css.matchAll(/box-shadow:\s*([^;}]+)/g)) {
        for (const shadow of decl[1].split(/,(?![^(]*\))/)) {
          const lens = [...shadow.matchAll(/(-?\d*\.?\d+)(?:px|rem|em)?(?![\w(.])/g)].map((m) =>
            parseFloat(m[1])
          )
          if (lens.length < 3) continue
          const [ox, oy, blur] = lens
          if (ox === 0 && oy === 0 && blur > 0) bad.push(shadow.trim().slice(0, 40))
        }
      }
      return bad.length ? bad.slice(0, 2).join(' / ') : null
    },
  },
  {
    id: 'transition-all',
    why: '`transition: all`',
    test: ({ css }) => (/transition:\s*all\b/.test(css) ? 'found' : null),
  },
  {
    id: 'animating-layout',
    why: 'a transition on a layout property',
    test: ({ css }) => {
      const m = css.match(/transition[^;:]*:\s*[^;]*\b(width|height|top|left|right|bottom|margin|padding)\b[^;]*;/g)
      return m ? m.slice(0, 2).join(' / ') : null
    },
  },
  {
    id: 'pure-black',
    why: 'pure black',
    test: ({ css }) => (/#000\b|#000000\b|\brgb\(0,\s*0,\s*0\)/.test(css) ? 'found' : null),
  },
  {
    id: 'ai-purple',
    why: 'a violet-to-blue AI gradient',
    test: ({ css }) => (/linear-gradient\([^)]*(#8b5cf6|#6366f1|#a855f7|violet|indigo)/i.test(css) ? 'found' : null),
  },
  {
    id: 'emoji-icons',
    why: 'emoji standing in for icons',
    test: ({ text }) => {
      const m = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)
      return m ? m.slice(0, 5).join('') : null
    },
  },
  {
    id: 'marketing-bar',
    why: 'a marketing nav bar, which the live-surface grammar forbids',
    test: ({ html }) => (/<header[^>]*class="[^"]*(site-bar|navbar|nav-bar)/.test(html) ? 'found' : null),
  },
  {
    id: 'invented-stat',
    why: 'an invented statistic',
    test: ({ text }) => {
      // A multiplier or a percentage that is not one of the figures the
      // fixtures actually support.
      const allowed = new Set(['19', '19 ', '100'])
      const hits = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s?%/g)]
        .map((m) => m[1])
        .filter((v) => !allowed.has(v))
      const mult = [...text.matchAll(/\b\d+(?:[.,]\d+)?\s?[x×]\b/gi)].map((m) => m[0])
      const bad = [...hits, ...mult]
      return bad.length ? bad.slice(0, 4).join(', ') : null
    },
  },
]

function run(subject) {
  return RULES.map((r) => ({ id: r.id, why: r.why, hit: r.test(subject) })).filter((r) => r.hit)
}

// ---- the control -----------------------------------------------------------
const fixture = await readFile(
  path.join(ROOT, 'scripts', 'gates', 'fixtures', 'refuse-list.html'),
  'utf8'
)
const fixtureCss = await readFile(
  path.join(ROOT, 'scripts', 'gates', 'fixtures', 'refuse-list.css'),
  'utf8'
)
const controlHits = run({
  html: fixture,
  css: fixtureCss,
  text: fixture.replace(/<[^>]+>/g, ' '),
})
const controlIds = controlHits.map((h) => h.id)
const missed = RULES.map((r) => r.id).filter((id) => !controlIds.includes(id))
c.ok(
  missed.length === 0,
  `these rules did not fire on the control fixture, so their silence on the real page proves nothing: ${missed.join(', ')}`
)
c.note(`control: ${controlHits.length}/${RULES.length} rules fired on the fixture`)

// ---- the real pages --------------------------------------------------------
const css = await readFile(path.join(DIST, 'site.css'), 'utf8')
for (const locale of ['', 'en', 'fr']) {
  const file = locale ? path.join(DIST, locale, 'index.html') : path.join(DIST, 'index.html')
  const html = await readFile(file, 'utf8')
  // The inline config script carries the no-data dash as a JSON string. Script
  // content is not visible copy, so it is stripped before the prose rules run,
  // exactly as <style> already is.
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
  const hits = run({ html, css, text })
  for (const h of hits) c.ok(false, `${locale || 'he'}: ${h.why} (${h.hit})`)
  if (!hits.length) c.note(`${locale || 'he'}: clean against all ${RULES.length} rules`)
}

// ---- and the grammar's own structural bans, measured in the DOM ------------
await withPage(async (page) => {
  const dom = await page.evaluate(() => ({
    scrubs: document.querySelectorAll('[data-sc-scrub]').length,
    kinetic: document.querySelectorAll('[data-sc-kinetic]').length,
    spotlight: document.querySelectorAll('[data-sc-spotlight]').length,
    magnet: document.querySelectorAll('[data-sc-magnet]').length,
    // The close must be a real input, not a button island.
    closeHasInput: !!document.querySelector('#close input'),
    // One label per intent.
    ctaLabels: [...document.querySelectorAll('a.btn, button.btn')].map((b) => b.textContent.trim()),
    // The chrome must be app chrome.
    hasRail: !!document.querySelector('nav.rail'),
    hasStatusbar: !!document.querySelector('.statusbar'),
    // Display type: the grammar breaks the moment a 6rem heading appears.
    biggestHeading: Math.max(
      ...[...document.querySelectorAll('h1, h2, h3')].map((h) => parseFloat(getComputedStyle(h).fontSize))
    ),
  }))

  c.ok(dom.scrubs === 0, `${dom.scrubs} scrub clip(s); the grammar bans them`)
  c.ok(dom.kinetic === 0, `${dom.kinetic} kinetic headline(s); the grammar bans them`)
  c.ok(dom.spotlight === 0, `${dom.spotlight} spotlight(s); the grammar bans them`)
  c.ok(dom.magnet === 0, `${dom.magnet} magnetic element(s); the close is an input, not a magnet`)
  c.ok(dom.closeHasInput, 'the closing act has no real input')
  c.ok(dom.hasRail && dom.hasStatusbar, 'the app chrome (rail plus status bar) is not present')
  c.ok(
    dom.biggestHeading <= 64,
    `the largest heading renders at ${dom.biggestHeading}px; display type breaks this grammar`
  )
  const labels = new Set(dom.ctaLabels)
  c.ok(labels.size === 1, `${labels.size} different CTA labels on one page: ${[...labels].join(' / ')}`)
  c.note(`largest heading ${dom.biggestHeading}px, one CTA label ("${[...labels][0]}"), app chrome present`)
})

c.report()
