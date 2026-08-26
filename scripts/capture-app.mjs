// Capture reference screenshots of the real InPlace product.
//
// These are GROUND TRUTH for rebuilding the surface in this page, not shipped
// decoration. The live-surface grammar requires the page's panels to be real
// markup computing real state; these captures are what that markup is checked
// against.
//
// Credentials are read at runtime from NIR-APP-DOCS/DEMO-USERS.local.json and
// are never printed.
//
// Usage: node scripts/capture-app.mjs [--base http://localhost:5200] [--role office]

import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}

const BASE = arg('base', 'http://localhost:5200')
const ONLY_ROLE = arg('role', null)
const OUT = path.resolve('lab/app-reference')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

// Two credential sources, both outside the repo, both read at runtime only and
// never printed (NIR-APP/docs/LOCAL-CREDENTIALS-PATH.md):
//   --target local  the local demo manifest, for a dev server on loopback
//   --target live   the live-site demo accounts (owner ruling 13.08.2026)
const CREDS = {
  local: path.resolve('../NIR-APP-DOCS/DEMO-USERS.local.json'),
  live: path.resolve('../NIR-APP-DOCS/פרטי כניסה דמו.txt'),
}

// route → file name. Kept to the seven stations the page is built around.
const ROUTES = {
  owner: [
    ['/', 'owner-dashboard'],
    ['/alerts', 'owner-alerts'],
    ['/payment-requests', 'owner-payment-requests'],
    ['/exceptions', 'owner-exceptions'],
  ],
  office: [
    ['/suppliers', 'office-suppliers'],
    ['/price-lists', 'office-price-lists'],
    ['/orders', 'office-orders'],
    ['/receiving', 'office-receiving'],
    ['/invoices', 'office-invoices'],
    ['/documents', 'office-documents-inbox'],
    ['/credits', 'office-credits'],
  ],
  accountant: [
    ['/pay', 'accountant-pay'],
    ['/bank', 'accountant-bank'],
    ['/reports', 'accountant-reports'],
  ],
}

// Matches DEMO_ROLES in NIR-APP/src/pages/Login.tsx
const DEMO_LABEL = {
  owner: 'מנהל/בעלים',
  office: 'מנהל רכש',
  accountant: 'רואה חשבון',
}

const TARGET = arg('target', 'local')
const readAccounts = () => {
  const raw = readFileSync(CREDS[TARGET], 'utf8')
  if (TARGET === 'local') return JSON.parse(raw).accounts
  // live: `email : password` lines, comments start with #.
  return raw
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf(':')
      return { email: l.slice(0, i).trim(), password: l.slice(i + 1).trim() }
    })
    .filter((a) => a.email.includes('@'))
}
const accounts = readAccounts()

const credentialFor = (role) => {
  const hit = accounts.find((a) => a.email.startsWith(role + '@'))
  if (!hit) throw new Error(`no demo account for role "${role}"`)
  return hit
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const captured = []

for (const [role, routes] of Object.entries(ROUTES)) {
  if (ONLY_ROLE && role !== ONLY_ROLE) continue

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
    locale: 'he-IL',
  })
  const page = await ctx.newPage()

  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })

  // The app ships its own dev-only demo login, seeded from
  // VITE_DEMO_PASSWORD_SEED. Prefer it: it is the credential the running
  // Supabase project actually has. Fall back to the manifest file.
  const { email, password } = credentialFor(role)
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')

  try {
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 })
  } catch {
    const shot = path.join(OUT, `LOGIN-FAILED-${role}.png`)
    await page.screenshot({ path: shot })
    console.log(`  login failed for ${role} — see ${path.basename(shot)}`)
    await ctx.close()
    continue
  }

  for (const [route, name] of routes) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 25000 })
      await page.waitForTimeout(1200)
      const file = path.join(OUT, name + '.png')
      await page.screenshot({ path: file, fullPage: false })
      captured.push(name)
      console.log(`  ok   ${name}`)
    } catch (err) {
      console.log(`  miss ${name} (${route}) — ${err.message.split('\n')[0]}`)
    }
  }

  await ctx.close()
}

await browser.close()
console.log(`\n${captured.length} captures in lab/app-reference`)
