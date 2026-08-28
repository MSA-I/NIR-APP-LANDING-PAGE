// Capture the product's screens with the page's wall clock set to a date the
// demo business was actually trading on.
//
// WHY THIS EXISTS
// The owner's note of 26.08.2026: the control centre on this page "should show
// all the graphs and the markers, right now it is terribly empty". It was, and
// the reason is not a fault in the product. Six of that screen's cards are
// scoped to the CURRENT month:
//
//   נרכש החודש · שולם לספקים החודש · אספקות היום ומחר ·
//   תמהיל הרכש החודש · רכש מול תשלומים · התייקרויות אחרונות
//
// and the local demo tenant's last activity is 20.07.2026. Captured on
// 26.08.2026 every one of them correctly reported that nothing had happened
// this month. That is the product being honest, and chapter 03 of this page
// says so in as many words: "a metric with no data shows a line, not a zero".
// It is also a picture of an empty product.
//
// The fix is NOT to invent data. Nothing here writes to the database. What
// this does is take the same screenshots, of the same rows, on the day the
// demo business was last trading: the page's Date is shifted by a constant so
// the application computes "this month" against 17.07.2026. Timers still run
// at real speed, so nothing in the app stalls or races.
//
// The figures this page quotes off these captures were re-read after the shift
// and none of them moved: 13 open tasks, 17,825 ILS outstanding, 6 needing
// attention today, 8 open exceptions of which 2 high, 9 open invoices, 17
// orders of which 7 open, 14 invoices, invoice 7702 at 4,720.00. They are
// status counts and balances, not month windows, which is why. No gate runs
// this file: it needs the product, its database and a demo tenant, none of
// which the page's own gates may depend on.
//
// ONLY the two dashboard captures are shipped from this run. The other screens
// are re-captured here for consistency, but the local tenant has picked up
// four new draft orders since the shipped set was taken, and those push the
// orders table below the fold of its own screenshot.
//
//   node scripts/capture-app-dated.mjs --base http://localhost:5199

import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}

const BASE = arg('base', 'http://localhost:5199')
const ONLY_ROLE = arg('role', null)
const OUT = path.resolve(arg('out', 'lab/app-reference'))
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

// 17.07.2026, 09:40 local. Chosen, not picked at random:
//   - it is inside the demo tenant's trading month, so the month cards fill;
//   - two orders are expected on it and the day after (23 sent for the 17th,
//     24 confirmed for the 18th), so אספקות היום ומחר has both of its days;
//   - three price rises fall inside the preceding thirty days;
//   - it is morning, so the screen greets the reader with בוקר טוב rather
//     than with whatever hour the render happened to run at.
const AS_OF = new Date('2026-07-17T09:40:00+03:00')

// The manifest is a sibling of the repository, and this file also runs from a
// git worktree four directories deeper, so the sibling is looked for rather
// than assumed. Nothing in it is ever printed.
const findCreds = () => {
  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    const hit = path.join(dir, '..', 'NIR-APP-DOCS', 'DEMO-USERS.local.json')
    if (existsSync(hit)) return hit
    const up = path.dirname(dir)
    if (up === dir) break
    dir = up
  }
  throw new Error('DEMO-USERS.local.json not found beside any ancestor of ' + process.cwd())
}
const CREDS = arg('creds', null) || findCreds()

const ROUTES = {
  owner: [
    ['/', 'owner-dashboard', { full: false }],
    ['/', 'owner-dashboard-full', { full: true }],
    ['/alerts', 'owner-alerts'],
    ['/analytics', 'owner-analytics'],
    ['/payment-requests', 'owner-payment-requests'],
    ['/exceptions', 'owner-exceptions'],
  ],
  office: [
    ['/suppliers', 'office-suppliers'],
  // `/price-lists` stood here until 28.08.2026 and had been wrong for some time:
  // NIR-APP's own route table (src/lib/routePolicy.ts) calls it `/prices`. The
  // app's router has no such path, so the guard bounced it to the role's home
  // and this file wrote a SECOND copy of the dashboard under the name
  // `office-price-lists`. It captured, it reported ok, and the picture was of
  // another screen entirely. A capture script cannot tell a redirect from an
  // arrival unless it looks, so this one now does.
    ['/prices', 'office-prices'],
    ['/products', 'office-products'],
    ['/inventory', 'office-inventory'],
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

const accounts = JSON.parse(readFileSync(CREDS, 'utf8')).accounts
const credentialFor = (role) => {
  const hit = accounts.find((a) => a.email.startsWith(role + '@'))
  if (!hit) throw new Error(`no demo account for role "${role}"`)
  return hit
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const captured = []
const offset = AS_OF.getTime() - Date.now()

for (const [role, routes] of Object.entries(ROUTES)) {
  if (ONLY_ROLE && role !== ONLY_ROLE) continue

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
  })

  // The wall clock only. setTimeout, setInterval and requestAnimationFrame are
  // untouched, so nothing in the application waits longer than it would have.
  // Playwright's own clock API replaces the timers too, which stalls the
  // Supabase client's own retry and refresh timers and leaves half the screen
  // never resolving.
  await ctx.addInitScript((ms) => {
    const Real = Date
    const Shifted = function (...a) {
      if (!(this instanceof Shifted)) return new Real(Real.now() + ms).toString()
      return a.length === 0 ? new Real(Real.now() + ms) : new Real(...a)
    }
    Shifted.prototype = Real.prototype
    Shifted.now = () => Real.now() + ms
    Shifted.parse = Real.parse
    Shifted.UTC = Real.UTC
    // eslint-disable-next-line no-global-assign
    window.Date = Shifted
  }, offset)

  const page = await ctx.newPage()
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })

  const { email, password } = credentialFor(role)
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')

  try {
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25000 })
  } catch {
    console.log(`  login failed for ${role}`)
    await ctx.close()
    continue
  }

  for (const [route, name, opts = {}] of routes) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(1200)
      // Walk the page to the bottom and back before capturing. Several of the
      // product's charts size themselves from a ResizeObserver on a container
      // that is off screen at load; captured without this the eight-week
      // comparison comes back as an empty white card, which is what the first
      // cut of this page shipped.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.8)
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 140))
        }
        window.scrollTo(0, 0)
        await new Promise((r) => setTimeout(r, 260))
      })
      await page.waitForTimeout(900)
      const file = path.join(OUT, name + '.png')
      await page.screenshot({ path: file, fullPage: !!opts.full })
      captured.push(name)
      console.log(`  ok   ${name}${opts.full ? '  (full page)' : ''}`)
    } catch (err) {
      console.log(`  miss ${name} (${route}) — ${err.message.split('\n')[0]}`)
    }
  }

  await ctx.close()
}

await browser.close()
console.log(`\n${captured.length} captures in ${OUT}, as of ${AS_OF.toISOString()}`)
