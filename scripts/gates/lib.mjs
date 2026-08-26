// Shared plumbing for the gate checks.
//
// One rule throughout: a gate prints its PASS token only after every assertion
// in it has passed, and it exits non-zero the moment one does not. A check that
// can only ever print PASS is not a check.

import { chromium } from 'playwright-core'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
)
export const DIST = path.join(ROOT, 'dist')
export const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
}

/** Serve dist/ on an ephemeral port. Returns { origin, close }. */
export async function serve(root = DIST) {
  const server = http.createServer(async (req, res) => {
    try {
      let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      if (rel.endsWith('/')) rel += 'index.html'
      const file = path.join(root, rel)
      if (!file.startsWith(root)) throw new Error('escape')
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const { port } = server.address()
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => server.close(r)),
  }
}

export async function withPage(fn, opts = {}) {
  const srv = await serve()
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1440, height: 900 },
    reducedMotion: opts.reducedMotion,
    locale: 'he-IL',
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  try {
    await page.goto(srv.origin + (opts.path || '/'), { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    // The engine sets scroll-behavior: smooth, so a programmatic scrollTo is
    // still animating when the next screenshot is taken. Every measurement
    // after that compares a photograph from one scroll position with element
    // rects from another, which is how a gate reports light-on-light for text
    // that is nowhere near the pixels it sampled.
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })
    return await fn(page, { errors, origin: srv.origin })
  } finally {
    await browser.close()
    await srv.close()
  }
}

/** Collects failures; report() prints them and exits with the right code. */
export function checker(id) {
  const fails = []
  const notes = []
  return {
    ok(cond, message) {
      if (!cond) fails.push(message)
      return cond
    },
    note(message) {
      notes.push(message)
    },
    report() {
      for (const n of notes) console.log('  ' + n)
      if (fails.length) {
        console.log('')
        for (const f of fails) console.log(`  FAIL  ${f}`)
        console.log(`\n${id} FAILED (${fails.length} assertion(s))`)
        process.exitCode = 1
        return false
      }
      console.log(`\n${id} PASS`)
      return true
    },
  }
}

/** Scroll to a fraction of the page and wait until the position has settled. */
export async function scrollTo(page, frac) {
  await page.evaluate(async (f) => {
    const max = document.documentElement.scrollHeight - innerHeight
    const target = Math.round(max * f)
    scrollTo(0, target)
    let last = -1
    for (let i = 0; i < 40 && last !== scrollY; i++) {
      last = scrollY
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    }
  }, frac)
}

export async function distExists() {
  try {
    await stat(path.join(DIST, 'index.html'))
    return true
  } catch {
    return false
  }
}

/** WCAG relative luminance from an sRGB triple. */
export function luminance([r, g, b]) {
  const f = (v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function rgb(str) {
  const n = (String(str).match(/[\d.]+/g) || []).map(Number)
  return n.length >= 3 ? n.slice(0, 3) : null
}
