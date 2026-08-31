// Write the Content-Security-Policy into dist/_headers, one rule per page.
//
// WHY THIS IS GENERATED AND NOT WRITTEN BY HAND
// `public/_headers` has said since the first round that CSP was deferred on
// purpose: motion writes an inline `style` attribute on every animated element
// -- 102 of them on the home page, 122 on the English one -- so a strict
// `style-src` stops the page animating without stopping it loading, which is
// the worst kind of failure to notice.
//
// Scripts have the same shape of problem and a better answer. This build makes
// TWENTY-TWO distinct inline scripts: four that execute (the theme-flash guard
// that reads localStorage before first paint, and the supporting pages' own),
// and eighteen `application/ld+json` blocks, one per page, all different. A
// single policy covering all of them needs twenty-two hashes in one header --
// about 1,900 of the 2,000 characters Cloudflare allows on one -- and would
// break the day a nineteenth page is added.
//
// So the policy is emitted PER PAGE, carrying only that page's own hashes, and
// it is emitted from the built HTML rather than from a list somebody maintains.
// A hash written by hand is a hash that goes stale the first time the script it
// covers is edited, silently, in a header nobody reads.
//
// REPORT-ONLY FIRST, AND THAT IS THE POINT
// It ships as `Content-Security-Policy-Report-Only`, which browsers evaluate
// and report on but never enforce. Nothing on the page can break. `--enforce`
// switches the header name once the violations are known to be empty; that is
// the owner's call, not this script's default.
//
//   node scripts/build-csp.mjs              report-only (the default)
//   node scripts/build-csp.mjs --enforce    the real header
//
// WHAT IS DELIBERATELY ALLOWED, AND WHY
//   'unsafe-inline' in style-src   the 102 attributes above. There is no hash
//                                  for a style ATTRIBUTE, only for a <style>
//                                  block, and this build emits zero of those.
//   static.cloudflareinsights.com  the analytics beacon, injected by Pages at
//                                  serve time. It is not in this build, so it
//                                  can never be hashed from it -- see DEBT §9.
//   data: in img-src               inlined SVG in the stylesheet.
//   mailto: in form-action         the contact form posts to a mail client.
//
// Everything else is `'self'`. There is not one external script, stylesheet,
// font or image in this build -- measured, not assumed: `url(` in the CSS
// resolves to five local woff2 files and nothing else.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const HEADERS = path.join(DIST, '_headers')
const ENFORCE = process.argv.includes('--enforce')
const HEADER = ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'

// Cloudflare's own limit, and the reason this is per page rather than global.
const MAX_HEADER_CHARS = 2000
const MAX_RULES = 100

const BEACON = 'https://static.cloudflareinsights.com'

// The directives that do not depend on which page is being served.
const base = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  // The beacon posts back to /cdn-cgi/rum on this origin; the second entry is
  // there because report-only is where you find out you were wrong about that.
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'self'",
  // The page is not meant to be framed. `X-Frame-Options: SAMEORIGIN` in
  // public/_headers says the same thing to browsers that predate this.
  "frame-ancestors 'self'",
  // The one form on the site posts to a mail client.
  "form-action 'self' mailto:",
  'upgrade-insecure-requests',
]

const htmlFiles = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry)
    if (statSync(p).isDirectory()) walk(p)
    else if (p.endsWith('.html')) htmlFiles.push(p)
  }
}
walk(DIST)
htmlFiles.sort()

// The paths a request can arrive on. Cloudflare serves `about/index.html` for
// `/about/`, and a rule keyed to the file alone would never match a real
// visitor; a rule keyed to the directory alone would miss anyone who typed the
// filename. Both are emitted.
const requestPaths = (file) => {
  const rel = path.relative(DIST, file).split(path.sep).join('/')
  if (rel === 'index.html') return ['/', '/index.html']
  if (rel.endsWith('/index.html')) {
    const dir = '/' + rel.slice(0, -'index.html'.length)
    return [dir, dir + 'index.html']
  }
  return ['/' + rel]
}

const hashesFor = (html) => {
  const found = new Set()
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g
  let m
  while ((m = re.exec(html))) {
    if (/\ssrc=/.test(m[1])) continue // an origin, not a hash
    found.add("'sha256-" + createHash('sha256').update(m[2], 'utf8').digest('base64') + "'")
  }
  return [...found]
}

const rules = []
let widest = 0
let hashCount = 0

for (const file of htmlFiles) {
  const hashes = hashesFor(readFileSync(file, 'utf8'))
  hashCount += hashes.length
  const scriptSrc = ["script-src 'self'", ...hashes, BEACON].join(' ')
  const value = [base[0], scriptSrc, ...base.slice(1)].join('; ')
  const line = `  ${HEADER}: ${value}`
  widest = Math.max(widest, line.length)
  if (line.length > MAX_HEADER_CHARS) {
    console.error(
      `${path.relative(DIST, file)} needs a ${line.length}-character header, over Cloudflare's ${MAX_HEADER_CHARS}. ` +
        `It carries ${hashes.length} inline scripts.`
    )
    process.exit(1)
  }
  for (const p of requestPaths(file)) rules.push(`${p}\n${line}`)
}

if (rules.length > MAX_RULES) {
  console.error(`${rules.length} rules, over Cloudflare's ${MAX_RULES}.`)
  process.exit(1)
}

// Run twice and the block must not appear twice. `_headers` is copied from
// public/ on every build, so in the pipeline this is always a fresh file -- but
// the script is also run by hand, and a second run that doubled every rule
// would give Cloudflare two CSP headers per page and no obvious sign of it.
const MARKER = '# --- generated by scripts/build-csp.mjs, do not edit below ---'
const existing = readFileSync(HEADERS, 'utf8').split(MARKER)[0].replace(/\n+$/, '')
const block = [
  '',
  '',
  MARKER,
  '# Every hash below is of an inline script in this exact build. Editing one by',
  '# hand makes a policy that reports on a page which no longer exists, in a',
  '# header nobody reads.',
  `# ${ENFORCE ? 'ENFORCING: a violation here breaks the page.' : 'Report-only: browsers report, nothing is blocked.'}`,
  '',
  rules.join('\n\n'),
  '',
].join('\n')

writeFileSync(HEADERS, existing + block, 'utf8')

console.log(
  `dist/_headers  ${HEADER} on ${rules.length} paths (${htmlFiles.length} pages, ` +
    `${hashCount} inline-script hashes), widest header ${widest} of ${MAX_HEADER_CHARS} chars`
)
