// G7: text contrast clears WCAG AA on every act, at both grounds, in both views.
//
// Measured on the composited render: the element is hidden, the frame beneath
// it is photographed, and the darkest and brightest patches under the line are
// sampled. Declared colours are not evidence; a light heading over a light card
// on a dark section fails while every declaration in the chain looks correct.

import { withPage, checker, contrast, rgb, scrollTo } from './lib.mjs'

const c = checker('G7')

// Every text-bearing tag on the page. Build 3 kept a list of its own component
// selectors here; build 4 writes its layout in utility classes, so such a list
// would go stale without anything failing, which is the worst way for a gate to
// break. The threshold is AA: 3:1 only for text that is genuinely large
// (>=24px, or >=18.66px bold), 4.5:1 for everything else.
const TARGETS = [
  'h1', 'h2', 'h3', 'h4', 'p', 'li', 'td', 'th', 'caption', 'summary',
  'figcaption', 'a', 'button', 'span', 'b', 'em', 'strong',
]

let cdp = null

await withPage(async (page) => {
  // Walk the page so pinned acts are actually on screen when sampled.
  const stops = [0, 0.12, 0.24, 0.36, 0.46, 0.56, 0.66, 0.78, 0.9, 1]
  // TWO VIEWS, TWO WALKS.
  // The owner's switch of 27.08.2026 gives the page a light view as well as a
  // dark one, and it is the same page with its two grounds traded. A clean
  // sweep on one is therefore no evidence at all about the other: every pair
  // that reads on onyx has a mirror on wheat, and a mirror can be wrong on its
  // own.
  //
  // The attribute is set the way the page sets it, event and all, so the shader
  // ground — whose colours are props and not CSS — actually turns over with it
  // rather than being photographed in the view it is not in.
  for (const theme of ['dark', 'light']) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t
      window.dispatchEvent(new CustomEvent('inplace:theme', { detail: t }))
    }, theme)

    const worst = new Map()

    for (const s of stops) {
      await scrollTo(page, s)

      // Photograph the frame with the text hidden, then sample beneath each line.
      await page.addStyleTag({
        content: '[data-sc-shot]{visibility:hidden!important}',
      })
      await page.evaluate((sels) => {
        document.querySelectorAll(sels.join(',')).forEach((el) => el.setAttribute('data-sc-shot', ''))
      }, TARGETS)

      // CDP, not page.screenshot(). Playwright's own capture path on this machine
      // drops composited layers, and this page has two of them the sampler walks
      // over: a scrub <video> and the folio bar's backdrop-filter. Sampling a
      // dropped layer reported a 7.48:1 button as 4.43:1, which is a measurement
      // defect reported as a design defect.
      if (!cdp) cdp = await page.context().newCDPSession(page)
      const shot = (await cdp.send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: false, fromSurface: true,
      })).data

      const rows = await page.evaluate(
        async ({ b64, sels }) => {
          const img = new Image()
          img.src = 'data:image/png;base64,' + b64
          await img.decode()
          const cv = document.createElement('canvas')
          cv.width = img.width
          cv.height = img.height
          const g = cv.getContext('2d', { willReadFrequently: true })
          g.drawImage(img, 0, 0)
          const dpr = img.width / innerWidth

          // Resolve ANY colour string to sRGB bytes plus alpha by painting it.
          // getComputedStyle hands back oklch(), oklab() and color() verbatim, and
          // parsing those with an rgb()-shaped regex reads 0.96 as 0.96/255. That
          // one assumption is what made this gate report near-black for every
          // colour on the page, twice, at two different levels.
          const probe = document.createElement('canvas')
          probe.width = probe.height = 1
          const pg = probe.getContext('2d', { willReadFrequently: true })
          const toRGBA = (str) => {
            if (!str || str === 'transparent') return null
            pg.clearRect(0, 0, 1, 1)
            pg.fillStyle = '#000'
            const before = pg.fillStyle
            pg.fillStyle = str
            if (pg.fillStyle === before && !/^(#000000|black|rgb\(0, ?0, ?0\))$/i.test(str.trim())) {
              return null
            }
            pg.fillRect(0, 0, 1, 1)
            const d = pg.getImageData(0, 0, 1, 1).data
            return [d[0], d[1], d[2], d[3] / 255]
          }
          const over = (fg, bg) =>
            fg[3] >= 0.999
              ? [fg[0], fg[1], fg[2]]
              : [0, 1, 2].map((i) => Math.round(fg[i] * fg[3] + bg[i] * (1 - fg[3])))

          const out = []
          for (const el of document.querySelectorAll(sels.join(','))) {
            const cs = getComputedStyle(el)
            if (parseFloat(cs.opacity) < 0.85) continue
            const txt = (el.textContent || '').trim()
            if (!txt) continue
            // Decoration made of letterforms. The colophon sets the application's
            // name at a quarter of the screen behind everything else, which is
            // the catalogue component's move and the reason the panel does not
            // read as an empty box. It is not text: it is out of the
            // accessibility tree, it says nothing the same panel does not also
            // say twice in readable type, and grading it as copy would force it
            // to 3:1, which is a slab of type arguing with the colophon in front
            // of it. It is not skipped either. It is graded the OTHER way below:
            // a run marked decorative that measures high enough to read is
            // readable type wearing a costume, and fails.
            const decorative = el.hasAttribute('data-decorative')
            // Leaves only. A <p> that wraps a <b> covers two grounds as far as
            // its bounding box is concerned, and the darkest patch inside it may
            // belong to neither run of text.
            if ([...el.children].some((ch) => (ch.textContent || '').trim())) continue
            const r = el.getBoundingClientRect()
            if (r.width < 8 || r.height < 8) continue
            if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue

            // Inset by a pixel and clamp to the viewport. A rect's own edge picks
            // up the neighbouring row separator, and one antialiased pixel from a
            // hairline is not the background a reader sees behind the text.
            const inset = Math.max(1, Math.round(dpr))
            const vx = Math.max(0, r.left) + inset
            const vy = Math.max(0, r.top) + inset
            const vr = Math.min(innerWidth, r.right) - inset
            const vb = Math.min(innerHeight, r.bottom) - inset
            if (vr - vx < 3 || vb - vy < 3) continue

            const x = Math.round(vx * dpr)
            const y = Math.round(vy * dpr)
            const w = Math.min(cv.width - x, Math.round((vr - vx) * dpr))
            const h = Math.min(cv.height - y, Math.round((vb - vy) * dpr))
            if (w < 2 || h < 2) continue

            const d = g.getImageData(x, y, w, h).data
            const lum = (rr, gg, bb) => 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
            // Percentiles, not extremes. A single stray pixel must not decide the
            // verdict, but a genuine dark or light band still does.
            const px = []
            for (let i = 0; i < d.length; i += 4) {
              px.push([d[i], d[i + 1], d[i + 2], lum(d[i], d[i + 1], d[i + 2])])
            }
            px.sort((a, b) => a[3] - b[3])
            const at = (frac) => px[Math.min(px.length - 1, Math.floor(px.length * frac))]
            const dk = at(0.06)
            const lt = at(0.94)
            const darkest = [dk[0], dk[1], dk[2]]
            const lightest = [lt[0], lt[1], lt[2]]

            const size = parseFloat(cs.fontSize)
            const weight = parseInt(cs.fontWeight, 10) || 400
            const large = size >= 24 || (size >= 18.66 && weight >= 700)

            // The ground behind a line of text is the nearest ancestor that
            // paints an opaque fill. Grade against that.
            //
            // Sampling the photograph is only right when the ground is media or a
            // gradient, and it is actively wrong in two cases this page has: an
            // element that paints its own fill (an Onyx table head) disappears
            // along with its background when it is hidden, and a ROTATED card's
            // axis-aligned bounding box is mostly the section behind it, so the
            // percentile lands on Onyx while the glyphs sit on paper. Both
            // reported light-on-light for text that is perfectly legible.
            //
            // This still catches the failure that matters: light text on a light
            // card inside a dark section grades against the card, and fails.
            const layers = []
            for (let n = el; n; n = n.parentElement) {
              const col = toRGBA(getComputedStyle(n).backgroundColor)
              if (!col || col[3] === 0) continue
              layers.push(col)
              if (col[3] >= 0.999) break
            }
            let ownBg = null
            if (layers.length) {
              // Composite from the bottom up. A translucent fixed panel sits over
              // whatever is scrolling beneath it, so its ground is the blend, not
              // its own declared colour.
              let ground
              if (layers[layers.length - 1][3] >= 0.999) {
                ground = layers.pop().slice(0, 3)
              } else {
                ground = darkest
              }
              for (let i = layers.length - 1; i >= 0; i--) ground = over(layers[i], ground)
              ownBg = ground
            }

            out.push({
              ownBg,
              sel: el.className && typeof el.className === 'string'
                ? '.' + el.className.trim().split(/\s+/)[0]
                : el.tagName.toLowerCase(),
              text: txt.slice(0, 34),
              color: cs.color,
              fgRgba: toRGBA(cs.color) || [0, 0, 0, 1],
              lightest,
              darkest,
              large,
              decorative,
            })
          }
          return out
        },
        { b64: shot, sels: TARGETS }
      )

      await page.evaluate(() => {
        document.querySelectorAll('[data-sc-shot]').forEach((el) => el.removeAttribute('data-sc-shot'))
      })

      for (const r of rows) {
        const fgc = r.fgRgba || [...(rgb(r.color) || []), 1]
        if (fgc.length < 4) continue
        const fgLum = 0.2126 * fgc[0] + 0.7152 * fgc[1] + 0.0722 * fgc[2]
        // Light type fails on the brightest patch, dark type on the darkest one,
        // unless the element carries its own opaque fill.
        const bg = r.ownBg || (fgLum > 128 ? r.lightest : r.darkest)
        // An ink that is fully transparent paints nothing, and grading it as the
        // BLACK that `rgba(0, 0, 0, 0)` parses to is a measurement defect, not a
        // reading of the page. `.footer-wordmark` declares `color: transparent`
        // and paints through `background-clip: text`; read as opaque black it
        // graded 1.01:1 on the dark ground by luck and 13.54:1 on the light one,
        // which failed a ghost for being readable. Graded as its ground it is
        // 1.00:1 either way, and the named check below catches the case the ratio
        // now cannot: ordinary copy that declares no ink at all.
        const fg = fgc[3] < 0.02 ? bg : fgc.slice(0, 3)
        const ratio = contrast(fg, bg)
        const need = r.large ? 3 : 4.5
        const key = r.sel + '|' + r.text
        const prev = worst.get(key)
        if (!prev || ratio < prev.ratio) worst.set(key, { ...r, ratio, need })
      }
    }

    const runs = [...worst.values()]
    const copy = runs.filter((r) => !r.decorative)
    const decor = runs.filter((r) => r.decorative)

    // `.footer-wordmark` is allowed to paint no ink of its own, because it is
    // marked decorative and is held to the ceiling below instead. Ordinary copy
    // that paints nothing is a bug no ratio can report.
    for (const r of copy.filter((r) => (r.fgRgba || [0, 0, 0, 1])[3] < 0.02)) {
      c.ok(false, `${theme}: ${r.sel} "${r.text}" declares no ink of its own`)
    }

    const fails = copy.filter((r) => r.ratio < r.need)
    for (const f of fails) {
      c.ok(false, `${theme}: ${f.ratio.toFixed(2)}:1 (needs ${f.need}) ${f.sel} "${f.text}"`)
    }

    // The other direction. A run marked decorative is exempt from the floor and
    // held to a CEILING instead: it has to stay clearly under the AA threshold
    // for large text, because anything at or above it is readable type that has
    // been marked decorative to get past this gate.
    for (const d of decor) {
      c.ok(
        d.ratio < 2.5,
        `${theme}: ${d.sel} "${d.text}" is marked decorative but measures ${d.ratio.toFixed(2)}:1, ` +
          `which is readable type exempting itself from the floor`
      )
      c.note(`${theme}: decorative, graded as ground: ${d.sel} "${d.text}" at ${d.ratio.toFixed(2)}:1`)
    }

    const min = copy.reduce(
      (a, r) => (r.ratio < a.ratio ? r : a),
      { ratio: Infinity, sel: '', text: '' }
    )
    c.note(`${theme}: ${copy.length} text runs sampled across ${stops.length} scroll positions, ${decor.length} decorative`)
    c.note(`${theme}: worst measured: ${min.ratio.toFixed(2)}:1 on ${min.sel} "${min.text}"`)
  }

  // Back to the page's home view before the control below, which is written
  // against the dark view's cream plate.
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark'
    window.dispatchEvent(new CustomEvent('inplace:theme', { detail: 'dark' }))
  })

  // ---- positive control ---------------------------------------------------
  // A clean sweep is only meaningful if the sweep can fail. Plant a line that
  // is genuinely unreadable and confirm the same measurement path catches it.
  await scrollTo(page, 0.72)   // the cream plate has to be on screen to be the ground
  const control = await page.evaluate(() => {
    // The cream plate in chapter 02 is the light ground on this page, so a
    // near-white line planted there is genuinely unreadable. It has to be that
    // plate specifically: the first plate in the document is the shader hero,
    // and its own background is transparent, so a control planted there would
    // grade near-white against black and pass.
    const host = document.querySelector('.plate.on-light')
    const bad = document.createElement('p')
    bad.className = 'lede'
    bad.style.color = 'oklch(0.97 0.01 80)' // near-white, on the wheat plate
    bad.textContent = 'control'
    host.appendChild(bad)

    const probe = document.createElement('canvas')
    probe.width = probe.height = 1
    const pg = probe.getContext('2d', { willReadFrequently: true })
    const toRGBA = (str) => {
      pg.clearRect(0, 0, 1, 1)
      pg.fillStyle = str
      pg.fillRect(0, 0, 1, 1)
      const d = pg.getImageData(0, 0, 1, 1).data
      return [d[0], d[1], d[2]]
    }
    const fg = toRGBA(getComputedStyle(bad).color)
    const bg = toRGBA(getComputedStyle(host).backgroundColor)
    bad.remove()
    const lum = (p) => {
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2])
    }
    const a = lum(fg)
    const b = lum(bg)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
  c.ok(
    control < 4.5,
    `the control pairing measured ${control.toFixed(2)}:1, so this gate cannot detect a failure`
  )
  c.note(`control: a near-white line on the card measures ${control.toFixed(2)}:1, correctly below AA`)
})

c.report()
