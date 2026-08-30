// G20: language selection, reading direction and responsive layout work.

import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, CHROME, checker, serve } from './lib.mjs'

const c = checker('G20')
const shots = path.join(ROOT, 'lab', 'i18n-en')
await mkdir(shots, { recursive: true })

const fits = ({ scroll, client }) => scroll <= client + 1
c.ok(!fits({ scroll: 401, client: 390 }), 'negative control accepted a horizontally overflowing page')

const cases = [
  { name: 'he-desktop', path: '/', lang: 'he', dir: 'rtl', width: 1440, height: 900, forward: 'ArrowLeft', alternate: '/en/' },
  { name: 'en-desktop', path: '/en/', lang: 'en', dir: 'ltr', width: 1440, height: 900, forward: 'ArrowRight', alternate: '/' },
  { name: 'he-phone', path: '/', lang: 'he', dir: 'rtl', width: 390, height: 844, forward: 'ArrowLeft', alternate: '/en/' },
  { name: 'en-phone', path: '/en/', lang: 'en', dir: 'ltr', width: 390, height: 844, forward: 'ArrowRight', alternate: '/' },
]

const srv = await serve()
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
})

try {
  for (const test of cases) {
    console.log(`  checking ${test.name}`)
    const context = await browser.newContext({
      viewport: { width: test.width, height: test.height },
      locale: test.lang === 'he' ? 'he-IL' : 'en-GB',
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))

    try {
      await page.goto(srv.origin + test.path, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })

      /* THE LANGUAGE CONTROL MOVED, 28.08.2026.
         Below 480px the row carries the menu, the mark, the way in and the
         action, and there is no room for a fifth control once the mark is
         centred rather than packed against the start. The language control
         went into the panel the menu opens, beside the light/dark switch, on
         the same argument: both change how the page is read rather than where
         it goes. Two instances exist in the markup and exactly one of them is
         ever drawn, which is why every locator here is `:visible`.

         So on a phone this gate now opens the panel first, because that is
         what a reader does. The keyboard walk below is unchanged and still
         proves the same four things about the control itself. */
      const onPhone = test.width < 480
      if (onPhone) {
        await page.locator('[data-folio-menu-trigger]').click()
        await page.waitForTimeout(300)
        c.ok(
          await page.locator('[data-folio-menu]').isVisible(),
          `${test.name}: the folio panel did not open`
        )
      }

      const trigger = page.locator('[data-language-trigger]:visible')
      c.ok(
        (await trigger.count()) === 1,
        `${test.name}: ${await trigger.count()} language triggers are drawn, not 1`
      )
      await trigger.focus()
      await page.keyboard.press('ArrowDown')
      const menu = page.locator('[data-language-menu]:visible')
      c.ok(await menu.isVisible(), `${test.name}: ArrowDown did not open the language menu`)

      const alternate = await menu.locator(`a[href^="${test.alternate}"]`).first().getAttribute('href')
      c.ok(alternate?.startsWith(test.alternate), `${test.name}: alternate locale link is ${alternate}`)

      await page.keyboard.press('Escape')
      c.ok(!(await menu.isVisible()), `${test.name}: Escape did not close the language menu`)
      c.ok(await trigger.evaluate((element) => element === document.activeElement), `${test.name}: focus did not return to the language trigger`)

      /* THE PANEL IS MODAL SINCE 30.08.2026, so it has to be closed before the
         chain below can be reached at all: the drawer is a top-layer <dialog>
         and everything behind it is inert, which is the point of it. Escape
         closes it — the press above went to the language menu inside it, by
         the innermost-first rule in Drawer.tsx — and this is the second one. */
      if (onPhone) {
        await page.keyboard.press('Escape')
        // WAITED FOR, not slept past. The panel is removed when its exit
        // finishes, and how long that takes depends on what else is asking for
        // frames — this page runs a WebGL ground. A fixed sleep here was a
        // coin toss that came down differently in the two editions and
        // between runs; three seconds is a ceiling, not a duration.
        const closed = await page
          .waitForFunction(() => !document.querySelector('[data-folio-menu]'), { timeout: 3000 })
          .then(() => true)
          .catch(() => false)
        c.ok(closed, `${test.name}: the drawer did not close on Escape`)
      }

      const firstTab = page.locator('[role="tab"]').first()
      await firstTab.focus()
      const before = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id')
      await page.keyboard.press(test.forward)
      await page.waitForTimeout(80)
      const after = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id')
      c.ok(after !== before, `${test.name}: ${test.forward} did not move the product chain`)

      /* And open again for the two things below that measure the control
         itself: how tall the target is, and the photograph. On a phone the
         language control is only drawn inside the drawer, so with the drawer
         shut there is nothing to measure — the gate would be photographing its
         own absence. */
      if (onPhone) {
        await page.locator('[data-folio-menu-trigger]').click()
        await page.waitForTimeout(400)
      }

      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        triggerHeight: (() => {
          const drawn = [...document.querySelectorAll('[data-language-trigger]')].find((el) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
          })
          return drawn ? drawn.getBoundingClientRect().height : 0
        })(),
      }))
      c.ok(state.lang === test.lang, `${test.name}: html lang is ${state.lang}`)
      c.ok(state.dir === test.dir, `${test.name}: html dir is ${state.dir}`)
      c.ok(fits(state), `${test.name}: ${state.scroll}px content in ${state.client}px viewport`)
      c.ok(state.triggerHeight >= 36, `${test.name}: language target is ${state.triggerHeight}px high`)
      c.ok(errors.length === 0, `${test.name}: browser errors: ${errors.join(' | ')}`)

      await page.evaluate(() => scrollTo(0, 0))
      await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
      await page.waitForTimeout(300)
      await trigger.click()
      await page.screenshot({ path: path.join(shots, `${test.name}-menu.png`) })
      await page.keyboard.press('Escape')
      c.note(`${test.name}: ${state.scroll}/${state.client}px, trigger ${state.triggerHeight.toFixed(0)}px`)
      console.log(`  checked ${test.name}`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
  await srv.close()
}

c.note(`four language-menu proofs written to ${path.relative(ROOT, shots)}`)
c.report()
