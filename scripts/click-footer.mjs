// Clicks every internal link in the colophon and reports where it landed.
//
// A link can fail in three different ways and only one of them is visible in
// the markup: the href can be wrong, the page it names can be missing, or
// something can be sitting on top of the pill and eating the click. This
// presses them the way a reader does.
//
//   node scripts/click-footer.mjs        (the Hebrew page)
//   node scripts/click-footer.mjs /en/
import { chromium } from 'playwright-core'
import { CHROME, serve } from './gates/lib.mjs'

const start = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : '/'
const srv = await serve()
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(srv.origin + start, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)

  const links = await page.$$eval('footer a[href^="/"]', (els) =>
    els.map((e) => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim() }))
  )
  console.log(`${links.length} internal links in the colophon of ${start}\n`)

  for (const { href, text } of links) {
    const target = page.locator(`footer a[href="${href}"]`).first()
    // What the reader's pointer would actually hit at the middle of the pill.
    const hit = await target.evaluate((el) => {
      const b = el.getBoundingClientRect()
      const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
      return {
        visible: b.width > 0 && b.height > 0,
        onTop: top ? (el.contains(top) || top.contains(el)) : false,
        blockedBy: top && !(el.contains(top) || top.contains(el))
          ? `${top.tagName.toLowerCase()}.${(top.className || '').toString().split(' ')[0]}`
          : '',
      }
    })

    let landed = 'not clicked'
    try {
      await target.click({ timeout: 4000 })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(300)
      const url = new URL(page.url())
      const h1 = await page.$eval('h1', (el) => el.textContent.trim().slice(0, 40)).catch(() => '(no h1)')
      landed = `${url.pathname}  h1="${h1}"`
      await page.goBack({ waitUntil: 'domcontentloaded' })
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(900)
    } catch (error) {
      landed = `CLICK FAILED: ${String(error).split('\n')[0].slice(0, 90)}`
    }

    const flag = landed.startsWith(href) ? 'OK  ' : 'FAIL'
    console.log(`${flag} ${href.padEnd(26)} ${text.padEnd(22)} ${hit.onTop ? '' : `covered by ${hit.blockedBy} `}-> ${landed}`)
  }
} finally {
  await browser.close()
  await srv.close()
}
