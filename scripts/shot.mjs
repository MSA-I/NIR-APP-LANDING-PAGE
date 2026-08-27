// Ad-hoc screenshots of the built site, for looking at a specific band of a
// specific page. Not a gate: it asserts nothing, it just prints what is there.
//
//   node scripts/shot.mjs /en/ top 1440
//   node scripts/shot.mjs /en/ footer 1440
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, CHROME, serve } from './gates/lib.mjs'

const [pathname = '/', band = 'top', width = '1440'] = process.argv.slice(2)
const out = path.join(ROOT, 'lab', 'shots')
await mkdir(out, { recursive: true })

const srv = await serve()
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
try {
  const ctx = await browser.newContext({ viewport: { width: Number(width), height: 900 } })
  const page = await ctx.newPage()
  await page.goto(srv.origin + pathname, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })
  if (band === 'footer') {
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1200)
  }
  const file = path.join(out, `${pathname.replace(/\W+/g, '_')}-${band}-${width}.png`)
  await page.screenshot({ path: file })
  console.log(file)
} finally {
  await browser.close()
  await srv.close()
}
