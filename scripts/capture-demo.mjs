// Re-capture the screens chapter 02 uses, and MEASURE where their top nav sits.
//
// Two things this does that scripts/capture-app.mjs does not:
//
//   1. The control centre is captured fullPage, so the trends row at the bottom
//      of it is in the frame. The old capture was viewport-only and cut the
//      charts off halfway.
//
//   2. For every screen it records the bounding box of each top-nav item as a
//      FRACTION of the image. Those fractions become the clickable hotspots on
//      the page, so a visitor can click the product's own navigation inside the
//      screenshot and the panel switches under them.
//
// Measuring beats eyeballing here: the nav shifts between roles (the owner has
// items the buyer does not) and the active pill changes width, so hotspots
// placed by hand would drift on three of the five screens.
//
// Credentials are read at runtime from NIR-APP-DOCS and never printed.
//
// Usage: node scripts/capture-demo.mjs [--base http://localhost:5200]

import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => { const i = args.indexOf('--' + k); return i === -1 ? d : args[i + 1] }

const BASE = arg('base', 'http://localhost:5200')
const OUT = path.resolve('lab/app-reference')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const CREDS = path.resolve('../NIR-APP-DOCS/DEMO-USERS.local.json')

// The five screens chapter 02 walks, plus the control centre, which is the one
// the film already ends on and the board section shows in full.
const SHOTS = [
  { role: 'office', route: '/orders',          name: 'office-orders' },
  { role: 'office', route: '/receiving',       name: 'office-receiving' },
  { role: 'office', route: '/invoices',        name: 'office-invoices' },
  { role: 'owner',  route: '/exceptions',      name: 'owner-exceptions' },
  { role: 'owner',  route: '/payment-requests', name: 'owner-payment-requests' },
  { role: 'owner',  route: '/',                name: 'owner-dashboard-full', full: true },
]

const accounts = JSON.parse(readFileSync(CREDS, 'utf8')).accounts
const credentialFor = (role) => {
  const hit = accounts.find((a) => a.email.startsWith(role + '@'))
  if (!hit) throw new Error(`no demo account for role "${role}"`)
  return hit
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const nav = {}

for (const role of ['office', 'owner']) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
    locale: 'he-IL',
  })
  const page = await ctx.newPage()
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  const { email, password } = credentialFor(role)
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 })

  for (const shot of SHOTS.filter((s) => s.role === role)) {
    await page.goto(BASE + shot.route, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(1400)

    // Measure before the screenshot, and against the full document height when
    // the shot is fullPage, so the fractions match the image that is written.
    const box = await page.evaluate((full) => {
      const h = full
        ? Math.max(document.documentElement.scrollHeight, innerHeight)
        : innerHeight
      const items = [...document.querySelectorAll('header a, header button, nav a, nav button')]
        .map((el) => ({ el, t: (el.textContent || '').replace(/\s+/g, ' ').trim() }))
        .filter((x) => x.t && x.t.length < 24)
      const seen = new Set()
      const out = []
      for (const { el, t } of items) {
        const r = el.getBoundingClientRect()
        // The top nav only: one row, near the top of the viewport.
        if (r.top > 120 || r.width < 24 || r.height < 16) continue
        if (seen.has(t)) continue
        seen.add(t)
        out.push({
          label: t,
          x: +(r.left / innerWidth).toFixed(5),
          y: +((r.top + scrollY) / h).toFixed(5),
          w: +(r.width / innerWidth).toFixed(5),
          h: +(r.height / h).toFixed(5),
        })
      }
      return out
    }, !!shot.full)

    nav[shot.name] = box
    await page.screenshot({ path: path.join(OUT, shot.name + '.png'), fullPage: !!shot.full })
    console.log(`  ok   ${shot.name}  (${box.length} nav items measured)`)
  }
  await ctx.close()
}

await browser.close()
await writeFile(path.resolve('data/demo-nav.json'), JSON.stringify(nav, null, 2) + '\n', 'utf8')
console.log('\ndata/demo-nav.json written')
