// G11: the five-step chain switches the panel, and the picture opens.
//
// It used to measure a second control as well — boxes drawn over the product's
// own navigation inside each screenshot, whose fractions were measured off the
// running app. The conversion from a left-edge fraction to an inline-start one
// is a single subtraction, and getting it wrong mirrors every box while leaving
// the page looking plausible, so this gate checked pixels rather than
// arithmetic.
//
// That layer went on 31.08.2026: the application's navigation was rebuilt into
// dropdown groups and not one of the five stations is a top-level item any
// more, so there was nothing under the boxes to point at. What is left is the
// chain, which was always the accessible control, and the picture itself, which
// opens at every width now that the boxes are not covering it. Both are
// measured here, and the mirroring question moved with the layer: nothing is
// placed by a converted fraction any longer.

import { withPage, checker } from './lib.mjs'

const c = checker('G11')

await withPage(async (page) => {
  await page.evaluate(() => document.querySelector('#what').scrollIntoView())
  await page.waitForTimeout(500)

  const tabCount = await page.$$eval('[role="tab"]', (els) => els.length)
  c.ok(tabCount === 5, `the chain should have five stations, it has ${tabCount}`)

  // Clicks go through the DOM rather than through Playwright's actionability
  // wait: the panel cross-fades, so an element handle is legitimately "not
  // stable" for most of the half second after every switch, and waiting for
  // stability here would be waiting for the animation this gate exists to allow.
  const clickTab = (i) =>
    page.evaluate((n) => document.querySelectorAll('[role="tab"]')[n].click(), i)

  // Every panel is in the document since 27.08.2026, and the four that are not
  // selected carry `hidden`. Before that only one existed at a time, so this
  // gate could say `[role="tabpanel"]` and mean "the visible one"; now it has
  // to say so. That change is the point of the SELECTOR constant: if the page
  // ever goes back to destroying panels, this gate keeps working, and if it
  // ever leaves two visible at once, the wait below fails.
  const SELECTOR = '[role="tabpanel"]:not([hidden])'

  const settleOn = (i) =>
    page.waitForFunction(
      ({ n, sel }) => {
        const panels = document.querySelectorAll(sel)
        if (panels.length !== 1) return false
        return panels[0].getAttribute('aria-labelledby').endsWith('-tab-' + n)
      },
      { n: i, sel: SELECTOR },
      { timeout: 5000 }
    )

  const seenPanels = new Set()

  for (let i = 0; i < tabCount; i++) {
    await clickTab(i)
    await settleOn(i)
    await page.waitForTimeout(180)

    const state = await page.evaluate((sel) => {
      const img = document.querySelector(sel + ' img')
      const heading = document.querySelector(sel + ' h3')
      const zoom = document.querySelector(sel + ' button[data-screen-zoom]')
      const box = zoom?.getBoundingClientRect()
      const picture = img.getBoundingClientRect()
      return {
        src: img.getAttribute('src'),
        heading: heading.textContent.trim(),
        // The control is the picture. Not a corner of it, not a chip beside
        // it: if these two boxes drift apart, a reader is pressing a screen
        // and hitting the plate behind it.
        covers: Boolean(box) &&
          Math.abs(box.width - picture.width) < 2 &&
          Math.abs(box.height - picture.height) < 2,
        named: (zoom?.getAttribute('aria-label') || '').trim(),
        // Drawn, and drawn on the far corner, so it never sits over the
        // product's own navigation — the part of the screenshot the chapter
        // is pointing at.
        chip: (() => {
          const el = zoom?.querySelector('.screen-zoom__chip')
          if (!el) return null
          const r = el.getBoundingClientRect()
          return { drawn: r.width > 0 && r.height > 0, fromTop: (r.top - picture.top) / picture.height }
        })(),
      }
    }, SELECTOR)

    seenPanels.add(state.src)
    c.ok(state.covers, `station ${i + 1} (${state.heading}): the picture is not the control`)
    c.ok(state.named.length > 0, `station ${i + 1} (${state.heading}): the control has no accessible name`)
    c.ok(Boolean(state.chip?.drawn), `station ${i + 1} (${state.heading}): nothing says the picture opens`)
    c.ok(
      Boolean(state.chip) && state.chip.fromTop > 0.5,
      `station ${i + 1} (${state.heading}): the chip sits ${((state.chip?.fromTop ?? 0) * 100).toFixed(0)}% down the picture, over the product's own navigation`
    )
  }

  c.ok(
    seenPanels.size === 5,
    `the five stations should show five different screens, they showed ${seenPanels.size}`
  )
  c.note(`five stations, five screens, each one its own control`)

  // And the picture opens, which is what replaced the boxes. `showModal` puts
  // it in the top layer; a dialog that is merely `open` is not modal and the
  // page behind it stays live, which is the failure this asserts against.
  await clickTab(0)
  await settleOn(0)
  await page.waitForTimeout(180)
  const opened = await page.evaluate(async (sel) => {
    const inline = document.querySelector(sel + ' img')?.getBoundingClientRect().width || 0
    document.querySelector(sel + ' button[data-screen-zoom]')?.click()
    await new Promise((r) => setTimeout(r, 400))
    const dialog = document.querySelector('dialog.screen-dialog')
    const big = dialog?.querySelector('img')?.getBoundingClientRect().width || 0
    return { open: dialog?.open === true, modal: dialog?.matches(':modal') === true, inline, big }
  }, SELECTOR)
  c.ok(opened.open, 'pressing a product screen does not open it')
  c.ok(opened.modal, 'the opened screen is not a modal dialog')
  c.ok(
    opened.big >= opened.inline,
    `the opened screen is ${opened.big.toFixed(0)}px against ${opened.inline.toFixed(0)}px in the page`
  )
  c.note(`the picture opens at ${opened.big.toFixed(0)}px from ${opened.inline.toFixed(0)}px in the page`)
  await page.keyboard.press('Escape')
})

c.report()
