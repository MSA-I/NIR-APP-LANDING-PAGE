// Re-capture the six screens the page shows: the five stations of chapter 02,
// and the control centre chapter 03 prints in full.
//
// The control centre is captured fullPage, so the trends row at the bottom of
// it is in the frame; a viewport-only capture cut the charts off halfway.
//
// IT NO LONGER MEASURES THE NAVIGATION. Until 31.08.2026 it recorded the
// bounding box of every top-nav item as a fraction of the image, and the page
// drew a clickable box over each one so a reader could work the product's own
// navigation inside the screenshot. The application's navigation was rebuilt
// into dropdown groups — measured against `main` that day, the top row holds
// Control room, New order, and four triggers, and not one of the five stations
// — so the boxes had nothing left to sit on. The owner's decision was to take
// the layer off rather than to point it at menus, and the measurement went with
// it. See the note at the top of src/components/WhatChapter.tsx.
//
// Credentials are read at runtime from NIR-APP-DOCS and never printed.
//
// Usage: node scripts/capture-demo.mjs [--base http://localhost:5200]

import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
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

    await page.screenshot({ path: path.join(OUT, shot.name + '.png'), fullPage: !!shot.full })
    console.log(`  ok   ${shot.name}`)
  }
  await ctx.close()
}

await browser.close()
console.log(`\n${SHOTS.length} captures in ${path.relative(process.cwd(), OUT)}`)
