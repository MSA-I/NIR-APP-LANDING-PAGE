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

      const trigger = page.locator('[data-language-trigger]')
      await trigger.focus()
      await page.keyboard.press('ArrowDown')
      const menu = page.locator('[data-language-menu]')
      c.ok(await menu.isVisible(), `${test.name}: ArrowDown did not open the language menu`)

      const alternate = await menu.locator(`a[href^="${test.alternate}"]`).first().getAttribute('href')
      c.ok(alternate?.startsWith(test.alternate), `${test.name}: alternate locale link is ${alternate}`)

      await page.keyboard.press('Escape')
      c.ok(!(await menu.isVisible()), `${test.name}: Escape did not close the language menu`)
      c.ok(await trigger.evaluate((element) => element === document.activeElement), `${test.name}: focus did not return to the language trigger`)

      const firstTab = page.locator('[role="tab"]').first()
      await firstTab.focus()
      const before = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id')
      await page.keyboard.press(test.forward)
      await page.waitForTimeout(80)
      const after = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id')
      c.ok(after !== before, `${test.name}: ${test.forward} did not move the product chain`)

      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        triggerHeight: document.querySelector('[data-language-trigger]')?.getBoundingClientRect().height || 0,
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
