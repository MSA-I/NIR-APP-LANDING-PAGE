// Compares the figures this page publishes with what the product actually
// charges, on the live database.
//
// WHY THIS IS NOT A GATE
// A gate has to run on a machine with no network and no credentials, and this
// needs both. It is the check to run before a deploy, and the one that answers
// DEBT item 1: the page published 20/40/150/375 while the seeded catalogue said
// 25/50/200/500, and nothing in this repository could tell the difference,
// because every gate here compares the page with the dictionary beside it.
//
// It reads two functions that exist for exactly this purpose — 0186's
// `get_public_plan_catalogue` and `get_public_plan_quotas`, both granted to
// `anon`, both taking no customer, both excluding Business server-side. Nothing
// here writes. The publishable key is read from the product's own .env and is
// never printed.
//
//   node scripts/check-live-catalogue.mjs
//   node scripts/check-live-catalogue.mjs --env ../NIR-APP/.env
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const envPath = path.resolve(
  ROOT,
  arg('env', '../../../../NIR-APP/.env')
)

let env
try {
  env = readFileSync(envPath, 'utf8')
} catch {
  console.error(`cannot read ${envPath}\npass the product's env file with --env <path>`)
  process.exit(2)
}
const field = (name) => new RegExp(`^${name}\\s*=\\s*"?([^"\\r\\n]+)"?`, 'm').exec(env)?.[1]?.trim()
const url = field('VITE_SUPABASE_URL') || field('SUPABASE_URL')
const key = field('VITE_SUPABASE_ANON_KEY') || field('SUPABASE_ANON_KEY')
if (!url || !key) {
  console.error(`no Supabase url/key in ${envPath}`)
  process.exit(2)
}

const rpc = async (fn) => {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!res.ok) throw new Error(`${fn} answered ${res.status}`)
  return res.json()
}

// What the built pages publish. Read off `data-plan-*`, which is the contract
// g14 also reads, so this script and that gate cannot disagree about what the
// page says.
const published = (file) => {
  const html = readFileSync(path.join(ROOT, 'dist', file), 'utf8')
  const cards = [...html.matchAll(/data-plan-name="([^"]*)"[^>]*data-plan-price="([^"]*)"/g)].map(
    (m) => ({ name: m[1], price: m[2] })
  )
  const docs = [...html.matchAll(/data-plan-docs="(\d+)"/g)].map((m) => Number(m[1]))
  const amount = (s) => {
    const digits = s.replace(/,/g, '').match(/\d+(\.\d+)?/)
    return digits ? Number(digits[0]) : null
  }
  return { monthly: cards.map((c) => amount(c.price)), docs, names: cards.map((c) => c.name) }
}

const [catalogue, quotas] = await Promise.all([
  rpc('get_public_plan_catalogue'),
  rpc('get_public_plan_quotas'),
])

const live = (currency) =>
  catalogue
    .filter((r) => r.currency === currency)
    .sort((a, b) => a.tier_order - b.tier_order)
    .map((r) => Number(r.monthly_amount))

const liveDocs = quotas
  .filter((r) => r.entitlement_key === 'documents.monthly' && r.measured)
  .map((r) => ({ plan: r.plan_key, n: Number(r.numeric_limit) }))
const ORDER = ['free', 'basic', 'pro', 'premium']
const liveDocsOrdered = ORDER.map((p) => liveDocs.find((r) => r.plan === p)?.n)

const failures = []
const compare = (what, want, got) => {
  const ok = JSON.stringify(want) === JSON.stringify(got)
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${what}\n        live: ${want.join(' / ')}\n        page: ${got.join(' / ')}`)
  if (!ok) failures.push(what)
}

const he = published('index.html')
const en = published(path.join('en', 'index.html'))

console.log(`checked against ${new URL(url).host}\n`)
// The free plan prints words rather than a figure, so the page's monthly list
// is the three priced plans; the live list is compared without its free rung.
compare('documents a month, Hebrew page', liveDocsOrdered, he.docs)
compare('documents a month, English page', liveDocsOrdered, en.docs)
compare('monthly price, Hebrew page (ILS)', live('ILS').slice(1), he.monthly.filter((n) => n !== null))
compare('monthly price, English page (USD)', live('USD').slice(1), en.monthly.filter((n) => n !== null))

if (failures.length) {
  console.error(`\n${failures.length} mismatch(es). The page publishes figures the product does not charge.`)
  process.exit(1)
}
console.log('\nthe page publishes what the product charges.')
