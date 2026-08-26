// G3: the page sits on the product's real design tokens.
//
// Measured against data/product-tokens.json, which was read out of the running
// app, not out of a document. The comparison is done on painted pixels: the
// product authors in oklch and the page ships sRGB, so comparing the strings
// would compare two spellings of the same colour and prove nothing.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, withPage, checker } from './lib.mjs'

const c = checker('G3')

const product = JSON.parse(
  await readFile(path.join(ROOT, 'data', 'product-tokens.json'), 'utf8')
)

// page token -> product token
const PAIRS = [
  ['--canvas', 'color-canvas'],
  ['--surface', 'color-surface'],
  ['--surface-sunken', 'color-surface-sunken'],
  ['--line', 'color-line'],
  ['--line-soft', 'color-line-soft'],
  ['--ink', 'color-ink'],
  ['--ink-body', 'color-ink-body'],
  ['--ink-mid', 'color-ink-mid'],
  ['--ink-muted', 'color-ink-muted'],
  ['--ink-faint', 'color-ink-faint'],
  ['--action', 'color-action'],
  ['--action-soft', 'color-action-soft'],
  ['--action-wash', 'color-action-wash'],
  ['--focus', 'color-focus'],
  ['--shell', 'color-shell'],
  ['--shell-ink', 'color-shell-ink'],
  ['--shell-ink-soft', 'color-shell-ink-soft'],
  ['--shell-ink-dim', 'color-shell-ink-dim'],
  ['--done-fg', 'color-done-fg'],
  ['--done-soft', 'color-done-soft'],
  ['--done-on-soft', 'color-done-on-soft'],
  ['--await-fg', 'color-await-fg'],
  ['--await-soft', 'color-await-soft'],
  ['--await-on-soft', 'color-await-on-soft'],
  ['--alert-fg', 'color-alert-fg'],
  ['--alert-soft', 'color-alert-soft'],
  ['--alert-on-soft', 'color-alert-on-soft'],
  ['--idle-fg', 'color-idle-fg'],
  ['--idle-soft', 'color-idle-soft'],
  ['--idle-on-soft', 'color-idle-on-soft'],
]

await withPage(async (page) => {
  const result = await page.evaluate(
    ({ pairs, productValues }) => {
      const cv = document.createElement('canvas')
      cv.width = cv.height = 1
      const g = cv.getContext('2d', { willReadFrequently: true })
      const paint = (color) => {
        g.clearRect(0, 0, 1, 1)
        g.fillStyle = '#ff00ff'
        g.fillStyle = color
        g.fillRect(0, 0, 1, 1)
        const d = g.getImageData(0, 0, 1, 1).data
        return [d[0], d[1], d[2]]
      }
      const cs = getComputedStyle(document.documentElement)
      const out = []
      for (const [pageVar, prodKey] of pairs) {
        const mine = cs.getPropertyValue(pageVar).trim()
        const theirs = productValues[prodKey]
        out.push({
          pageVar,
          prodKey,
          mineRaw: mine,
          mine: mine ? paint(mine) : null,
          theirs: theirs ? paint(theirs) : null,
        })
      }

      const card = document.querySelector('.card')
      const cardCs = card ? getComputedStyle(card) : null
      const body = getComputedStyle(document.body)
      return {
        out,
        cardRadius: cardCs ? cardCs.borderTopLeftRadius : null,
        cardHasBorder: cardCs ? cardCs.borderTopWidth : null,
        fontFamily: body.fontFamily,
        dir: body.direction,
      }
    },
    { pairs: PAIRS, productValues: Object.fromEntries(PAIRS.map(([, k]) => [k, product[k]?.resolved])) }
  )

  let matched = 0
  for (const r of result.out) {
    if (!c.ok(r.mine, `page token ${r.pageVar} is not defined`)) continue
    if (!c.ok(r.theirs, `product token --${r.prodKey} was not captured`)) continue
    const same = r.mine.every((v, i) => Math.abs(v - r.theirs[i]) <= 1)
    if (c.ok(same, `${r.pageVar} paints rgb(${r.mine}) but the product paints rgb(${r.theirs})`)) matched++
  }
  c.note(`${matched}/${PAIRS.length} colour tokens match the running product exactly`)

  // The shape the interview asked for by name: the product's rounded cards.
  c.ok(
    result.cardRadius === product._card.borderRadius,
    `card radius is ${result.cardRadius}, the product's is ${product._card.borderRadius}`
  )
  c.note(`card radius ${result.cardRadius}, matching the product`)
  c.ok(
    parseFloat(result.cardHasBorder) === 0,
    "cards carry a border; the product's cards carry a shadow and no border"
  )
  c.ok(
    /Noto Sans Hebrew/.test(result.fontFamily),
    `body font is ${result.fontFamily}, expected the product's Noto Sans Hebrew`
  )
  c.ok(result.dir === 'rtl', `document direction is ${result.dir}`)
})

c.report()
