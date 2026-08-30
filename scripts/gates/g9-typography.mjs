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
      display: document.fonts.check('800 3rem "Heebo"', word),
      mono: document.fonts.check('600 1rem "Roboto Mono"'),
      body: document.fonts.check('400 1rem "Noto Sans Hebrew"'),
      wDisplay: widthIn('"Heebo"'),
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
  c.ok(loaded.mono, 'the annotation face (Roboto Mono) did not load')
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


  // ---- the ink ---------------------------------------------------------------
  // A face can load, resolve, measure and lay out, and still paint nothing.
  // The mono this page shipped until 30.08.2026, Hasubi Mono, mapped the Hebrew
  // block with advance widths and EMPTY glyphs, so every `.eyebrow` on the
  // Hebrew page — the title page's kicker included — was invisible while every
  // check here passed: `document.fonts.check` said yes, `getComputedStyle` said
  // the mono, the contrast gate measured a colour nobody could see, and the text
  // sat in the accessibility tree the whole time. Roboto Mono has no Hebrew to
  // claim, so the trap is gone; the count stays, because the next face might.
  //
  // So the last question is the reader's: does anything appear. Each string is
  // drawn with the element's OWN computed font stack and the opaque pixels are
  // counted.
  const ink = await page.evaluate(() => {
    const paint = (font, text) => {
      const c = document.createElement('canvas')
      c.width = 900
      c.height = 90
      const x = c.getContext('2d')
      x.fillStyle = '#fff'
      x.font = font
      x.textBaseline = 'middle'
      x.fillText(text, 10, 45)
      const d = x.getImageData(0, 0, c.width, c.height).data
      let n = 0
      for (let i = 3; i < d.length; i += 4) if (d[i] > 24) n++
      return n
    }
    const of = (selector) => {
      const el = document.querySelector(selector)
      if (!el) return null
      const s = getComputedStyle(el)
      const text = (el.textContent || '').trim().slice(0, 30)
      return {
        text,
        stack: s.fontFamily,
        pixels: paint(`${s.fontWeight} 48px ${s.fontFamily}`, text),
      }
    }
    return {
      eyebrow: of('.eyebrow'),
      h1: of('h1'),
      lede: of('.lede'),
      figure: of('.ip-fig'),
      control: paint('600 48px "No Such Face 9x", "Not This One Either"', 'אבגדהו'),
    }
  })

  for (const [role, seen] of Object.entries(ink)) {
    // An element with no text paints nothing and should: the first `.ip-fig` on
    // the page is a wrapper whose figure lives in a child.
    if (role === 'control' || !seen || !seen.text) continue
    c.ok(
      seen.pixels > 0,
      `${role} is laid out but paints nothing: "${seen.text}" in ${seen.stack}`
    )
    c.note(`${role.padEnd(8)} ${String(seen.pixels).padStart(5)} ink px   ${seen.text}`)
  }
  c.ok(ink.control > 0, 'negative control: the fallback face painted nothing either, so this check proves nothing')

  // And the display size has to be a display size.
  const size = await page.$eval('h1', (el) => parseFloat(getComputedStyle(el).fontSize))
  c.ok(size >= 40, `the title-page headline measures ${size}px, which is not a display size`)
  c.note(`h1 renders at ${size}px`)
})

c.report()
