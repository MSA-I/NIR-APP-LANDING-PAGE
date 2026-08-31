// The seven things that can only be measured on a host, not on a build.
//
// `npm run gates` measures the page. It cannot measure the SERVER: whether a
// wrong address really answers 404 rather than 200 with the home page, whether
// Cloudflare actually read `public/_headers`, whether `robots.txt` arrives as
// text rather than as a document, and whether `www` redirects. Those are
// properties of the host, and until 31.08.2026 there was no host to ask.
//
// This is the ledger for them. It takes a host and asks it, and it prints what
// it measured rather than what it expected:
//
//   node scripts/verify-live.mjs                      against inplace.digital
//   node scripts/verify-live.mjs inplace-landing.pages.dev
//   node scripts/verify-live.mjs --no-www             skip L5, for a *.pages.dev
//
// L5 (`www`) is skipped automatically for a `pages.dev` host: that hostname has
// no `www` and never will, and a check that cannot pass is not a check.

const args = process.argv.slice(2)
const HOST = args.find((a) => !a.startsWith('--')) || 'inplace.digital'
const SKIP_WWW = args.includes('--no-www') || HOST.endsWith('pages.dev')
const ORIGIN = `https://${HOST}`

// The eighteen pages the build produces, in sitemap order. Kept here rather
// than read from dist/ on purpose: this file asks a LIVE host what it serves,
// and reading the local build would let it pass against a host that is serving
// something else entirely.
const PAGES = [
  '/',
  '/about/',
  '/terms/',
  '/privacy/',
  '/procurement-software/',
  '/supplier-invoices/',
  '/invoice-matching/',
  '/vs-spreadsheet/',
  '/vs-erp/',
  '/en/',
  '/en/about/',
  '/en/terms/',
  '/en/privacy/',
  '/en/procurement-software/',
  '/en/supplier-invoices/',
  '/en/invoice-matching/',
  '/en/vs-spreadsheet/',
  '/en/vs-erp/',
]

// From public/_headers. Every one of these is declared there, so every one of
// them must come back; a missing header means Cloudflare never read the file.
const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'permissions-policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
  'x-frame-options': 'SAMEORIGIN',
}

const results = []
const record = (id, what, passed, measured) => {
  results.push({ id, what, passed, measured })
  console.log(`${id.padEnd(3)} ${passed ? 'PASS' : 'FAIL'}  ${what}`)
  if (!passed) console.log(`       measured: ${measured}`)
}

const get = async (url, redirect = 'follow') => {
  try {
    return await fetch(url, { redirect, headers: { 'user-agent': 'inplace-verify-live' } })
  } catch (e) {
    return { ok: false, status: 0, headers: new Headers(), error: e.message }
  }
}

console.log(`\nverify-live against ${ORIGIN}\n`)

// L1 — every page the build claims to publish actually answers.
{
  const codes = []
  for (const p of PAGES) {
    const r = await get(ORIGIN + p)
    codes.push(`${p} ${r.status}`)
  }
  const bad = codes.filter((c) => !c.endsWith(' 200'))
  record('L1', `all ${PAGES.length} pages answer 200`, bad.length === 0, bad.join(', ') || 'all 200')
}

// L2 — the one that cannot be measured anywhere else, and the one that matters
// most: a wrong address must be a wrong address. A `/* /index.html 200` rule in
// _redirects would turn every one of them into a valid page in Google's eyes.
{
  const r = await get(`${ORIGIN}/this-page-does-not-exist-e7f3a1/`)
  const body = r.status ? await r.text().catch(() => '') : ''
  const isNoindex = /<meta[^>]+noindex/i.test(body)
  record('L2', 'a wrong address answers 404', r.status === 404, `status ${r.status}${r.error ? ' — ' + r.error : ''}`)
  record('L2b', 'the 404 page carries noindex', isNoindex, isNoindex ? 'present' : 'absent')
}

// L3 — Cloudflare read public/_headers.
{
  const r = await get(ORIGIN + '/')
  const missing = []
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    const got = r.headers?.get(k)
    if (!got) missing.push(`${k}: absent`)
    else if (got.toLowerCase() !== v.toLowerCase()) missing.push(`${k}: "${got}"`)
  }
  record('L3', 'all five security headers come back', missing.length === 0, missing.join(' | ') || 'all five present')
}

// L4 — robots.txt is a text file, not a document. Before the fix of 27.08.2026
// a crawler asking for it got the SPA fallback: HTTP 200, text/html.
{
  const r = await get(ORIGIN + '/robots.txt')
  const ct = r.headers?.get('content-type') || ''
  const body = r.status === 200 ? await r.text().catch(() => '') : ''
  const ok = r.status === 200 && ct.includes('text/plain') && body.includes('Sitemap:')
  record('L4', 'robots.txt is served as text/plain', ok, `status ${r.status}, content-type "${ct}"`)
}

// L5 — www and the apex must not be two competing sites.
if (!SKIP_WWW) {
  const r = await get(`https://www.${HOST}/`, 'manual')
  const loc = r.headers?.get('location') || ''
  const ok = (r.status === 301 || r.status === 308) && loc.replace(/\/$/, '') === ORIGIN
  record('L5', 'www redirects to the apex with 301', ok, `status ${r.status}, location "${loc}"`)
} else {
  console.log('L5  SKIP  www redirect — not applicable to this host')
}

// L6 — plain HTTP must not stay plain HTTP.
{
  const r = await get(`http://${HOST}/`, 'manual')
  const loc = r.headers?.get('location') || ''
  const ok = (r.status === 301 || r.status === 308) && loc.startsWith('https://')
  record('L6', 'http redirects to https', ok, `status ${r.status}, location "${loc}"`)
}

// L7 — the sitemap the engines will be pointed at is the one this host serves,
// and it must name this host. A sitemap that lists a different origin is a
// sitemap every engine will ignore.
{
  const r = await get(ORIGIN + '/sitemap.xml')
  const body = r.status === 200 ? await r.text().catch(() => '') : ''
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const foreign = locs.filter((l) => !l.startsWith('https://inplace.digital'))
  const ok = r.status === 200 && locs.length === PAGES.length && foreign.length === 0
  record(
    'L7',
    `sitemap.xml lists ${PAGES.length} pages, all on inplace.digital`,
    ok,
    `status ${r.status}, ${locs.length} urls, ${foreign.length} foreign`
  )
}

const met = results.filter((r) => r.passed).length
const unmet = results.length - met
console.log(`\n${met} met, ${unmet} unmet, of ${results.length} checks against ${HOST}\n`)
process.exitCode = unmet ? 1 : 0
