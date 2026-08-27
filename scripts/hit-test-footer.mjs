// What a pointer actually hits when it aims at a colophon pill.
//
// `elementFromPoint` at the middle of every link, before any click, so a pill
// that is covered says so by name instead of failing as a timeout somewhere
// else. Reports the covering element, its z-index and whether it takes pointer
// events at all.
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
  await page.waitForTimeout(1800)

  const report = await page.evaluate(() => {
    const name = (el) =>
      el
        ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${
            typeof el.className === 'string' && el.className
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
              : ''
          }`
        : 'nothing'
    return [...document.querySelectorAll('footer a')].map((a) => {
      const b = a.getBoundingClientRect()
      const x = b.x + b.width / 2
      const y = b.y + b.height / 2
      const top = document.elementFromPoint(x, y)
      const covered = top && !a.contains(top) && top !== a
      let chain = ''
      if (covered) {
        const s = getComputedStyle(top)
        chain = `${name(top)} [z=${s.zIndex} pointer-events=${s.pointerEvents} position=${s.position}]`
      }
      return {
        href: a.getAttribute('href'),
        text: (a.textContent || '').trim().slice(0, 20),
        inView: b.y >= 0 && b.y + b.height <= innerHeight,
        rect: `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`,
        covered: covered ? chain : '',
      }
    })
  })

  for (const r of report) {
    console.log(
      `${r.covered ? 'COVERED' : 'clear  '} ${String(r.href).padEnd(30)} ${r.text.padEnd(20)} ${
        r.inView ? 'in view ' : 'OFFSCREEN'
      } ${r.rect.padEnd(20)} ${r.covered}`
    )
  }
} finally {
  await browser.close()
  await srv.close()
}
