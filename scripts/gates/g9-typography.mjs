// G9: the display face is loaded, and the headlines are actually set in it.
//
// The owner asked for a separate display typeface, which is half of what the
// reference's headlines do. A @font-face that 404s degrades silently to the
// body font and the page looks almost right, so both halves are measured: the
// font is loaded, AND a headline resolves to it rather than to the fallback.

import { withPage, checker } from './lib.mjs'

const c = checker('G9')

await withPage(async (page) => {
  await page.evaluate(() => document.fonts.ready)

  // `document.fonts.check` is not evidence on its own: it answers "can this be
  // rendered", and an undeclared family answers yes because the system fallback
  // can render it. So the face is measured instead. The same Hebrew string is
  // typeset at the same size in three families, and a face that is really
  // loaded produces a width that the fallback does not.
  const loaded = await page.evaluate(() => {
    const ctx = document.createElement('canvas').getContext('2d')
    const word = 'ההזמנה לכסף במקום אחד'
    const widthIn = (family) => {
      ctx.font = `800 40px ${family}`
      return ctx.measureText(word).width
    }
    return {
      display: document.fonts.check('800 3rem Heebo'),
      body: document.fonts.check('400 1rem "Noto Sans Hebrew"'),
      wDisplay: widthIn('Heebo'),
      wBody: widthIn('"Noto Sans Hebrew"'),
      wMissing: widthIn('"Not A Real Face 9x"'),
      families: [...document.fonts].map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i),
    }
  })

  c.ok(
    Math.abs(loaded.wDisplay - loaded.wMissing) > 1,
    `the display face typesets identically to an undeclared family (${loaded.wDisplay.toFixed(1)}px vs ${loaded.wMissing.toFixed(1)}px), so it is not loaded`
  )
  c.ok(
    Math.abs(loaded.wDisplay - loaded.wBody) > 1,
    `the display face and the body face typeset identically (${loaded.wDisplay.toFixed(1)}px), so they are the same face`
  )
  c.note(
    `measured at 40px: Heebo ${loaded.wDisplay.toFixed(1)}px, Noto ${loaded.wBody.toFixed(1)}px, fallback ${loaded.wMissing.toFixed(1)}px`
  )
  c.ok(loaded.display, 'the display face (Heebo) did not load')
  c.ok(loaded.body, 'the body face (Noto Sans Hebrew) did not load')
  c.note(`faces registered: ${loaded.families.join(', ')}`)

  const used = await page.evaluate(() => {
    const of = (sel) => {
      const el = document.querySelector(sel)
      return el ? getComputedStyle(el).fontFamily : null
    }
    return {
      h1: of('h1'),
      h2: of('h2'),
      lede: of('.lede'),
      body: getComputedStyle(document.body).fontFamily,
    }
  })

  c.ok(/Heebo/.test(used.h1 || ''), `h1 is not set in the display face: ${used.h1}`)
  c.ok(/Heebo/.test(used.h2 || ''), `h2 is not set in the display face: ${used.h2}`)
  c.ok(
    /Noto Sans Hebrew/.test(used.body) && !/^Heebo/.test(used.body),
    `body copy should stay in the reading face, it is ${used.body}`
  )
  c.ok(
    /Noto Sans Hebrew/.test(used.lede || ''),
    `the lede should stay in the reading face, it is ${used.lede}`
  )
  c.note(`h1 -> ${used.h1}`)
  c.note(`body -> ${used.body}`)

  // The two faces have to be different, or the whole exercise was decorative.
  c.ok(used.h1 !== used.body, 'the display face and the body face resolve to the same stack')

  // And the display size has to be a display size.
  const size = await page.$eval('h1', (el) => parseFloat(getComputedStyle(el).fontSize))
  c.ok(size >= 40, `the title-page headline measures ${size}px, which is not a display size`)
  c.note(`h1 renders at ${size}px`)
})

c.report()
