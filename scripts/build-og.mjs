// Build the two share cards: public/assets/og-cover-v2.jpg and og-cover-en-v2.jpg.
//
// The audit of 27.08.2026 found no og:image at all, which means every share of
// this link, in WhatsApp or LinkedIn or anywhere else, renders as a bare URL.
// That is the cheapest thing on the whole list to fix and one of the most
// visible, because it is what a reader sees BEFORE deciding whether to open
// the page.
//
// The card is drawn in the browser rather than in an image editor for the same
// reason the film is built by a script: a picture that only exists as a binary
// cannot be reviewed, corrected or rebuilt when the headline changes. The
// template beside this file is the source, this is the camera.
//
// The two faces are inlined as data URIs before the picture is taken, so the
// render has no network dependency and cannot silently fall back to Arial,
// which is exactly the failure that would be invisible in a 1200x630 PNG until
// somebody shared it.
//
// WHY TWO
// The SEO audit of 31.08.2026 found all eighteen pages pointing at one card,
// whose visible text is Hebrew. An English reader sharing /en/procurement-software/
// on LinkedIn got an English title over a Hebrew picture, and the English pages'
// own og:image:alt described that picture in English. One template, rendered
// twice, is cheaper than two templates that drift.
//
//   node scripts/build-og.mjs

import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { serve } from './gates/lib.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Per edition: where the picture goes, which way it reads, which cut of each
// face carries its glyphs, and the words themselves. The headline is split so
// the tint lands on the clause that closes it, in both languages.
const EDITIONS = [
  {
    out: 'public/assets/og-cover-v2.jpg',
    lang: 'he',
    dir: 'rtl',
    heebo: 'public/assets/fonts/Heebo-hebrew.woff2',
    noto: 'public/assets/fonts/NotoSansHebrew-Hebrew.woff2',
    head: 'כל מה שקורה בין ההזמנה לכסף,',
    tint: 'במקום אחד.',
    chain: [
      '<b>ספק</b> <i>◂</i> <b>הזמנה</b> <i>◂</i> <b>קבלה</b> <i>◂</i>',
      '<b>חשבונית</b> <i>◂</i> <b>תשלום</b>',
    ].join('\n          '),
  },
  {
    out: 'public/assets/og-cover-en-v2.jpg',
    lang: 'en',
    dir: 'ltr',
    heebo: 'public/assets/fonts/Heebo-latin.woff2',
    noto: 'public/assets/fonts/NotoSansHebrew-Latin.woff2',
    head: 'Everything between the order and the money,',
    tint: 'in one place.',
    chain: [
      '<b>Supplier</b> <i>▸</i> <b>Order</b> <i>▸</i> <b>Goods received</b> <i>▸</i>',
      '<b>Invoice</b> <i>▸</i> <b>Payment</b>',
    ].join('\n          '),
  },
]

// The page's own grain, lifted from .grain in src/styles.css so the card and
// the page are grained by the same noise rather than by two similar ones.
const GRAIN =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E" +
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' " +
  "numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E" +
  "%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

const dataUri = (rel) =>
  `data:font/woff2;base64,${readFileSync(path.join(ROOT, rel)).toString('base64')}`

const TEMPLATE = readFileSync(path.join(ROOT, 'scripts/og-template.html'), 'utf8')

// The same browser the gates use.  needs a
// Playwright-managed download that is not present on every machine that has
// this repository, and a card that cannot be rebuilt is the binary this script
// exists to avoid. CHROME_PATH overrides it where Chrome lives somewhere else.
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({
  executablePath: CHROME,
  // SwiftShader, because the ground below is a real WebGL program and there is
  // no GPU in a headless session on this machine: without these the canvas
  // composites to nothing and the card ships with a black rectangle behind its
  // headline. See the same flags in scripts/gates/lib.mjs.
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
})

/**
 * The entry screen's own ground, photographed at card size.
 *
 * The card used to carry five radial gradients mixed to look like the shader,
 * with a note in the template admitting that a share card cannot run WebGL. It
 * can: the owner asked on 01.09.2026 for the real ground, and the way to get it
 * is not to port the shader but to drive the BUILT page. The title plate is
 * pinned at exactly 1200x630, its headline and the folio are taken out of the
 * way, and that rectangle is photographed. Same component, same recipe, same
 * palette, same scrim over it — the parts a reader recognises are not
 * approximated, they are the same pixels.
 *
 * Reduced motion, and not for accessibility: `GrainGradient` is a function of
 * TIME, so a live capture makes `npm run og` produce a different 200KB binary
 * every run. `prefers-reduced-motion: reduce` takes ShaderBackground's `calm`
 * branch to speed 0 and the frame is then reproducible — two captures 1.5s
 * apart come back byte-identical.
 */
async function shaderGround() {
  const dist = path.join(ROOT, 'dist')
  if (!existsSync(path.join(dist, 'index.html'))) {
    throw new Error(
      'the card is drawn over the built title plate, and dist/index.html is not there.\n' +
        '       Run `npm run build` first, then `npm run og`.'
    )
  }

  const srv = await serve(dist)
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    reducedMotion: 'reduce',
    locale: 'he-IL',
  })
  const page = await ctx.newPage()
  try {
    await page.goto(srv.origin + '/', { waitUntil: 'networkidle' })

    // The plate out of the layout and over the whole viewport, so what is
    // photographed is a NATIVE 1200x630 render rather than a crop or a scale of
    // some other size. Logical insets are avoided here on purpose: setting
    // inset-inline-start on an RTL document pins the plate to the right edge,
    // which cost the first cut 190px of its width.
    const plate = await page.evaluate(() => {
      const el = document.querySelector('[data-theme-flip]')
      if (!el) return false
      Object.assign(el.style, {
        position: 'fixed',
        left: '0px',
        top: '0px',
        right: 'auto',
        bottom: 'auto',
        width: '1200px',
        height: '630px',
        minHeight: '0',
        margin: '0',
        border: '0',
        borderRadius: '0',
        zIndex: '9999',
      })
      // The words and the crop marks belong to the page, not to the card. The
      // marks are four pseudo-elements across two selectors, so the class goes
      // rather than the elements: `.crops__b` alone leaves the top pair drawn.
      el.classList.remove('crops')
      const hero = el.querySelector('.title-hero')
      if (hero) hero.style.display = 'none'
      const folio = document.querySelector('header')
      if (folio) folio.style.display = 'none'
      return true
    })
    if (!plate) throw new Error('the title plate is not in dist/index.html')

    // The ground is lazy-loaded and idle-scheduled: it arrives when it arrives.
    await page.waitForSelector('[data-theme-flip] canvas', { timeout: 20000 })
    await page.waitForTimeout(2500)

    const cdp = await ctx.newCDPSession(page)
    const r = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
      clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
    })

    // A black frame here means the WebGL context never painted, which is the
    // one failure that would be invisible until somebody shared the link.
    const lit = await page.evaluate(() => {
      const c = document.querySelector('[data-theme-flip] canvas')
      return c && c.width > 0 && c.height > 0
    })
    if (!lit) throw new Error('the shader canvas has no drawing buffer')

    return `data:image/png;base64,${r.data}`
  } finally {
    await ctx.close()
    await srv.close()
  }
}

const GROUND = await shaderGround()

for (const ed of EDITIONS) {
  const html = TEMPLATE.replace('__LANG__', ed.lang)
    .replace('__DIR__', ed.dir)
    .replace('__HEEBO__', dataUri(ed.heebo))
    .replace('__NOTO__', dataUri(ed.noto))
    .replace('__GRAIN__', GRAIN)
    .replace('__GROUND__', GROUND)
    .replace('__HEAD__', ed.head)
    .replace('__HEAD_TINT__', ed.tint)
    .replace('__CHAIN__', ed.chain)

  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)

  // The faces are inlined, so a fallback here would mean the @font-face never
  // applied. Better to fail the build than to ship a card set in Arial.
  const set = await page.evaluate(
    () => getComputedStyle(document.querySelector('h1')).fontFamily
  )
  if (!/Heebo/.test(set)) throw new Error(`${ed.out}: the headline is set in ${set}, not Heebo`)

  // The headline must fit the plate. A card whose words are clipped at 1200x630
  // is worse than no card, and it is invisible until somebody shares the link.
  const overflows = await page.evaluate(() => {
    const p = document.querySelector('.plate')
    return p.scrollHeight > p.clientHeight || p.scrollWidth > p.clientWidth
  })
  if (overflows) throw new Error(`${ed.out}: the headline does not fit the plate`)

  // THE WORDS AGAINST WHAT IS ACTUALLY BEHIND THEM.
  //
  // The ground stopped being five gradients this author chose and became a
  // photograph of a shader, which means the colour under the headline is no
  // longer a number anybody wrote down: it is whatever GrainGradient painted at
  // t=0 at this size, and it changes if the recipe, the palette or the plate's
  // proportions ever change. G7 holds the page's type to 4.5:1 and nothing held
  // the card's, so this does — by rasterising the card as it stands and reading
  // the real pixels under each block of type, darkest and lightest, rather than
  // by trusting the veil above to be enough.
  const contrast = await page.evaluate(async () => {
    const lum = (r, g, b) => {
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    const parse = (css) => css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)

    // The ground and the veil, composited the way the browser composites them,
    // read back off a canvas. The grain is `mix-blend-mode: overlay` at 0.16
    // and moves a channel by a few units either way; it is left out because
    // sampling it needs the same blend done by hand, and a few units on a
    // ratio this far from the line does not change the answer.
    const ground = getComputedStyle(document.querySelector('.ground')).backgroundImage
    const src = ground.slice(ground.indexOf('"') + 1, ground.lastIndexOf('"'))
    const img = new Image()
    img.src = src
    await img.decode()

    const c = document.createElement('canvas')
    c.width = 1200
    c.height = 630
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, 1200, 630)
    const veil = getComputedStyle(document.querySelector('.veil')).backgroundImage
    // The veil is a gradient in CSS; re-declare it on the canvas rather than
    // guess at it, by painting the element itself through a second element with
    // the same computed background.
    const probe = document.createElement('div')
    probe.style.cssText = `position:fixed;inset:0;background-image:${veil}`
    document.body.appendChild(probe)

    // Each block against the bar its own size earns. The headline is 70px at
    // weight 800 — large text several times over, where WCAG asks 3:1 — and
    // holding it to 4.5 was not caution, it was 0.86 alpha of white laid over
    // the picture the card exists to show. The foot is 25-26px and is held to
    // the small-text bar anyway: it is the line a reader squints at in a chat
    // preview, and there is no cost to keeping it clear of the shader's teal.
    const out = []
    for (const [name, sel, floor] of [
      ['headline', 'h1', 3],
      ['chain', '.chain', 4.5],
      ['host', '.host', 4.5],
      ['mark', '.mark', 3],
    ]) {
      const el = document.querySelector(sel)
      const box = el.getBoundingClientRect()
      const colour = getComputedStyle(el).color
      const [tr, tg, tb] = parse(colour)
      const tl = lum(tr, tg, tb)

      let worst = Infinity
      const step = 6
      for (let y = Math.max(0, box.top); y < Math.min(630, box.bottom); y += step) {
        for (let x = Math.max(0, box.left); x < Math.min(1200, box.right); x += step) {
          const [r, g, b] = ctx.getImageData(x | 0, y | 0, 1, 1).data
          // The veil over that pixel: its alpha ramp is linear across the card,
          // so it is reproduced here from the same two stops the CSS uses.
          const t = document.documentElement.dir === 'rtl' ? 1 - x / 1200 : x / 1200
          const a = t <= 0.38 ? 0.58 - (0.14 * t) / 0.38 : Math.max(0, 0.44 * (1 - (t - 0.38) / 0.38))
          const mix = (v) => v * (1 - a) + 255 * a
          worst = Math.min(worst, ratio(tl, lum(mix(r), mix(g), mix(b))))
        }
      }
      out.push({ name, colour, floor, worst: Number(worst.toFixed(2)) })
    }
    probe.remove()
    return out
  })

  for (const c of contrast) {
    if (c.worst < c.floor) {
      throw new Error(
        `${ed.out}: the ${c.name} is ${c.worst}:1 against the ground at its worst pixel, under ${c.floor}:1`
      )
    }
  }

  // JPEG, not PNG. The card is a smooth gradient with grain over it, which is
  // the worst case for PNG's palette compression: the first cut came out at
  // 373KB. At quality 90 the same picture is a fraction of that, and no chat
  // client refuses a preview for being too small.
  const out = path.join(ROOT, ed.out)
  await page.screenshot({ path: out, type: 'jpeg', quality: 90 })
  await page.close()

  const kb = statSync(out).size / 1024
  const read = contrast.map((c) => `${c.name} ${c.worst}:1/${c.floor}`).join(', ')
  console.log(`${ed.out}  1200x630  ${kb.toFixed(0)}KB  (${ed.lang})  ${read}`)
  if (kb > 300) {
    console.warn(`${ed.out} is over 300KB: some chat clients refuse a preview that large`)
  }
}

await browser.close()
