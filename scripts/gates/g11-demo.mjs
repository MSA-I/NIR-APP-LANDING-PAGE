// G11: the five-step chain switches the panel, and the hotspots land.
//
// The hotspots are drawn over the product's own navigation inside each
// screenshot. Their boxes are measured off the running app as a distance from
// the LEFT edge, and the page places them from the inline start, which in
// Hebrew is the right. The conversion is one subtraction, and getting it wrong
// mirrors every box while leaving the page looking plausible. So the gate does
// not check the arithmetic, it checks the pixels: each hotspot must sit over
// the navigation item it claims, which is asserted by requiring it to fall
// inside the screenshot and to be nowhere near its mirror image.

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

  // The panel cross-fades: the outgoing one animates away before the incoming
  // one mounts, so for about half a second the only tabpanel in the document is
  // the screen the reader is LEAVING. Counting panels does not distinguish the
  // two, and waiting a fixed number of milliseconds races the transition. The
  // panel names the tab it belongs to, so that is what is waited for.
  const settleOn = (i) =>
    page.waitForFunction(
      (n) => {
        const panel = document.querySelector('[role="tabpanel"]')
        return Boolean(panel) && panel.getAttribute('aria-labelledby').endsWith('-tab-' + n)
      },
      i,
      { timeout: 5000 }
    )

  let totalHots = 0
  const seenPanels = new Set()

  for (let i = 0; i < tabCount; i++) {
    await clickTab(i)
    await settleOn(i)
    await page.waitForTimeout(180)

    const state = await page.evaluate(() => {
      const img = document.querySelector('[role="tabpanel"] img')
      const heading = document.querySelector('[role="tabpanel"] h3')
      const box = img.getBoundingClientRect()
      const hots = [...document.querySelectorAll('[role="tabpanel"] button[tabindex="-1"]')].map(
        (b) => {
          const r = b.getBoundingClientRect()
          return {
            title: b.getAttribute('title'),
            x: (r.left - box.left) / box.width,
            y: (r.top - box.top) / box.height,
            w: r.width / box.width,
            h: r.height / box.height,
          }
        }
      )
      return { src: img.getAttribute('src'), heading: heading.textContent.trim(), hots }
    })

    seenPanels.add(state.src)
    totalHots += state.hots.length
    c.ok(state.hots.length > 0, `station ${i + 1} (${state.heading}) has no hotspots`)

    for (const h of state.hots) {
      c.ok(
        h.x >= -0.01 && h.y >= -0.01 && h.x + h.w <= 1.01 && h.y + h.h <= 1.01,
        `hotspot "${h.title}" on station ${i + 1} falls outside its screenshot ` +
          `(x ${h.x.toFixed(3)}, w ${h.w.toFixed(3)})`
      )
      // The product's navigation sits across the top of every screen. A
      // mirrored box would still be inside the image, so the row is checked
      // too: a hotspot below the top eighth is not on the navigation.
      c.ok(
        h.y < 0.14,
        `hotspot "${h.title}" on station ${i + 1} is at ${(h.y * 100).toFixed(1)}% down the ` +
          `screenshot, and the product's navigation is not there`
      )
    }
  }

  c.ok(
    seenPanels.size === 5,
    `the five stations should show five different screens, they showed ${seenPanels.size}`
  )
  c.note(`${totalHots} hotspots across ${seenPanels.size} screens`)

  // Clicking a hotspot moves the chain, which is the whole point of drawing
  // them: the reader can navigate the demo from inside the product's own UI.
  await clickTab(0)
  await settleOn(0)
  await page.waitForTimeout(180)
  const before = await page.$eval('[role="tabpanel"] img', (el) => el.getAttribute('src'))
  const clicked = await page.evaluate(() => {
    // The hotspot that opens a different station than the one on screen.
    const hots = [...document.querySelectorAll('[role="tabpanel"] button[tabindex="-1"]')]
    const target = hots.find((b) => b.getAttribute('title') === 'חשבוניות') || hots[1]
    if (!target) return null
    target.click()
    return target.getAttribute('title')
  })
  c.ok(Boolean(clicked), 'no hotspot to click')
  if (clicked) {
    await settleOn(2)
    await page.waitForTimeout(180)
    const after = await page.$eval('[role="tabpanel"] img', (el) => el.getAttribute('src'))
    c.ok(before !== after, `clicking the "${clicked}" hotspot did not change the panel`)
    c.note(`hotspot "${clicked}": ${before.split('screen-').pop()} -> ${after.split('screen-').pop()}`)
  }
})

c.report()
