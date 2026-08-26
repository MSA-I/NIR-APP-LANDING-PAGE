// Read the product's computed design tokens out of the running app.
//
// The landing page must sit on the product's real palette, not on hexes
// transcribed from a doc. This resolves every token the surface needs to a
// concrete rendered value and writes data/product-tokens.json.
//
// Usage: node scripts/extract-tokens.mjs [--base http://localhost:5200]

import { chromium } from 'playwright-core'
import { writeFile, mkdir } from 'node:fs/promises'

const args = process.argv.slice(2)
const arg = (k, d) => {
  const i = args.indexOf('--' + k)
  return i === -1 ? d : args[i + 1]
}
const BASE = arg('base', 'http://localhost:5200')
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'

const WANTED = [
  'color-canvas', 'color-surface', 'color-surface-sunken', 'color-surface-hover',
  'color-surface-selected', 'color-line', 'color-line-soft', 'color-line-strong',
  'color-ink', 'color-ink-body', 'color-ink-mid', 'color-ink-soft',
  'color-ink-muted', 'color-ink-faint', 'color-ink-ghost',
  'color-action', 'color-action-hover', 'color-action-solid', 'color-action-soft',
  'color-action-on-soft', 'color-action-wash', 'color-action-line', 'color-focus',
  'color-on-solid', 'color-topbar',
  'color-shell', 'color-shell-ink', 'color-shell-ink-soft', 'color-shell-ink-dim',
  'font-sans',
  'shadow-card', 'shadow-card-hover', 'shadow-dialog',
]
for (const s of ['done', 'await', 'alert', 'info', 'idle']) {
  for (const v of ['wash', 'line', 'soft', 'on-soft', 'fg', 'solid']) {
    WANTED.push(`color-${s}-${v}`)
  }
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
await page.goto(BASE + '/login', { waitUntil: 'networkidle' })

const result = await page.evaluate((names) => {
  const cs = getComputedStyle(document.documentElement)
  const probe = document.createElement('div')
  document.body.appendChild(probe)

  const out = {}
  for (const n of names) {
    const raw = cs.getPropertyValue('--' + n).trim()
    if (!raw) continue
    // Resolve var() chains and colour spaces by letting the engine paint it.
    let resolved = raw
    if (n.startsWith('color-')) {
      probe.style.color = ''
      probe.style.color = `var(--${n})`
      const painted = getComputedStyle(probe).color
      if (painted && painted !== 'rgb(0, 0, 0)') resolved = painted
    }
    out[n] = { raw, resolved }
  }

  // The card is the shape the whole page borrows. Measure it, do not assume it.
  const card = document.createElement('div')
  card.className = 'card'
  document.body.appendChild(card)
  const ccs = getComputedStyle(card)
  out['_card'] = {
    borderRadius: ccs.borderRadius,
    boxShadow: ccs.boxShadow,
    background: ccs.backgroundColor,
  }
  card.remove()

  const bodyCs = getComputedStyle(document.body)
  out['_body'] = {
    fontFamily: bodyCs.fontFamily,
    fontSize: bodyCs.fontSize,
    direction: bodyCs.direction,
    background: bodyCs.backgroundColor,
    color: bodyCs.color,
  }

  const faces = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style}`)
  out['_fonts'] = [...new Set(faces)]

  probe.remove()
  return out
}, WANTED)

await browser.close()
await mkdir('data', { recursive: true })
await writeFile('data/product-tokens.json', JSON.stringify(result, null, 2), 'utf8')

console.log(`${Object.keys(result).length} tokens → data/product-tokens.json`)
console.log('card:', JSON.stringify(result._card))
console.log('body:', JSON.stringify(result._body))
console.log('fonts:', JSON.stringify(result._fonts))
