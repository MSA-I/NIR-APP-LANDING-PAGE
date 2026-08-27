// G17: the three files a crawler asks for before it asks for the page.
//
// Before this gate, all three were missing, and the way they were missing is
// the part worth remembering. `/robots.txt` did not 404 — the dev server's SPA
// fallback answered 200 with the HTML of the homepage. A crawler asking how it
// may crawl received a marketing page and a success code. That is worse than a
// 404, because a 404 is an answer.
//
// So the gate does not ask "does the file exist". It asks the server for the
// file and checks what comes back: the status, the content type, and the first
// line. A fallback that serves index.html for everything fails all three.
//
// What it cannot check is the real host. Cloudflare Pages serves 404.html with
// a 404 status for unmatched paths, and this gate's server is not Cloudflare.
// So the 404 assertions here are about the DOCUMENT being present and correct,
// and the status itself stays on the post-deploy list in GATES.md.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { DIST, serve, checker } from './lib.mjs'

const c = checker('G17')
const ORIGIN = 'https://inplace.digital'

const srv = await serve()
const get = async (p) => {
  const res = await fetch(srv.origin + p)
  return { status: res.status, type: res.headers.get('content-type') || '', body: await res.text() }
}

try {
  // ---- robots.txt ----------------------------------------------------------
  const robots = await get('/robots.txt')
  c.ok(robots.status === 200, `/robots.txt returned ${robots.status}`)
  c.ok(
    robots.type.startsWith('text/plain'),
    `/robots.txt is served as ${robots.type || 'nothing'}, not text/plain`
  )
  c.ok(
    !/<html|<!doctype/i.test(robots.body),
    '/robots.txt is HTML. The SPA fallback is answering instead of the file.'
  )
  c.ok(/^\s*(#|User-agent:)/im.test(robots.body), '/robots.txt does not begin like a robots file')

  // The owner's decision of 27.08.2026: the AI crawlers are not blocked, so
  // that this page can be quoted. A Disallow arriving later, from a
  // copy-pasted robots.txt or a well-meant edit, is exactly what would undo it
  // silently.
  const disallows = robots.body
    .split(/\r?\n/)
    .filter((l) => /^\s*Disallow:\s*\S/i.test(l))
  c.ok(
    disallows.length === 0,
    `/robots.txt disallows something, which was a decision nobody recorded: ${disallows.join(' | ')}`
  )

  const sitemapLine = (robots.body.match(/^\s*Sitemap:\s*(\S+)/im) || [])[1]
  c.ok(sitemapLine === `${ORIGIN}/sitemap.xml`, `/robots.txt points at ${sitemapLine || 'no sitemap'}`)

  // ---- sitemap.xml ---------------------------------------------------------
  const sitemap = await get('/sitemap.xml')
  c.ok(sitemap.status === 200, `/sitemap.xml returned ${sitemap.status}`)
  c.ok(/xml/.test(sitemap.type), `/sitemap.xml is served as ${sitemap.type || 'nothing'}`)
  c.ok(sitemap.body.startsWith('<?xml'), '/sitemap.xml does not start with an XML declaration')

  const opens = (sitemap.body.match(/<url>/g) || []).length
  const closes = (sitemap.body.match(/<\/url>/g) || []).length
  c.ok(opens === closes && opens > 0, `/sitemap.xml has ${opens} <url> and ${closes} </url>`)

  // Every page in the build must be listed, and everything listed must be in
  // the build. A sitemap is a claim about what exists; both directions of that
  // claim are checkable here.
  const built = []
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name !== 'assets') walk(path.join(dir, e.name), `${prefix}${e.name}/`)
      } else if (e.name === 'index.html') built.push(prefix)
    }
  }
  walk(DIST, '/')

  const listed = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => !/\/assets\//.test(u))
    .map((u) => u.replace(ORIGIN, ''))

  for (const page of built) {
    c.ok(listed.includes(page), `${page} is in the build but not in the sitemap`)
  }
  for (const page of listed) {
    c.ok(built.includes(page), `the sitemap lists ${page}, which is not in the build`)
  }

  for (const img of [...sitemap.body.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1])) {
    const rel = img.replace(ORIGIN, '')
    c.ok(existsSync(path.join(DIST, rel)), `the sitemap lists an image that is not in the build: ${rel}`)
  }

  // ---- hreflang, if a second locale exists --------------------------------
  // Nothing here declares hreflang today. The day one does, every target it
  // names has to be a page that was actually built: pointing x-default at a
  // locale that does not exist yet is the standard way to break this.
  for (const page of built) {
    const html = readFileSync(path.join(DIST, page.slice(1), 'index.html'), 'utf8')
    const alts = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)]
      .map((m) => m[0])
      .filter((tag) => /hreflang=/i.test(tag))
    for (const tag of alts) {
      const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1] || ''
      const lang = (tag.match(/hreflang=["']([^"']+)["']/i) || [])[1] || '?'
      const target = href.replace(ORIGIN, '')
      c.ok(
        built.includes(target),
        `${page} declares hreflang="${lang}" pointing at ${target}, which is not in the build`
      )
    }
    if (alts.length) c.note(`${page} declares ${alts.length} hreflang alternates, all resolvable`)
  }

  // ---- the 404 document ----------------------------------------------------
  const notFound = path.join(DIST, '404.html')
  if (c.ok(existsSync(notFound), 'dist/404.html is missing; every wrong URL would answer 200')) {
    const body = readFileSync(notFound, 'utf8')
    c.ok(/noindex/i.test(body), 'dist/404.html does not carry meta robots noindex')
    c.ok(
      !/id=["']root["']/.test(body),
      'dist/404.html is the app shell, so it will render the homepage under a 404'
    )
    c.ok(/<title>/i.test(body), 'dist/404.html has no title')
  }

  // A catch-all rewrite would put the 200-on-everything problem straight back.
  const redirects = path.join(DIST, '_redirects')
  if (existsSync(redirects)) {
    const rules = readFileSync(redirects, 'utf8')
    c.ok(
      !/^\s*\/\*\s+\S+\s+200\s*$/m.test(rules),
      '_redirects contains a catch-all 200 rewrite, which makes every wrong URL look like a real page'
    )
  }

  // ---- the headers file ----------------------------------------------------
  const headers = path.join(DIST, '_headers')
  if (c.ok(existsSync(headers), 'dist/_headers is missing')) {
    const h = readFileSync(headers, 'utf8')
    for (const key of ['X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security']) {
      c.ok(new RegExp(key, 'i').test(h), `_headers does not set ${key}`)
    }
    c.ok(/\/assets\/\*/.test(h), '_headers does not set a cache policy for the hashed assets')
  }

  c.note(`${built.length} page(s) built, ${listed.length} listed, robots and sitemap served as files`)
} finally {
  await srv.close()
}

c.report()
