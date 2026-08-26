// Tab order and focus visibility. The harness cannot see this.
import { chromium } from 'playwright-core'
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1400, height: 820 } })
await p.goto('http://localhost:4500', { waitUntil: 'networkidle' })
await p.waitForSelector('html.sc-ready'); await p.waitForTimeout(800)
const seen = []
for (let i = 0; i < 18; i++) {
  await p.keyboard.press('Tab')
  seen.push(await p.evaluate(() => {
    const a = document.activeElement
    if (!a || a === document.body) return '(body)'
    const cs = getComputedStyle(a)
    const r = a.getBoundingClientRect()
    return (a.className || a.tagName) + ' "' + (a.textContent || '').trim().slice(0, 22) + '"' +
      (r.width ? '' : ' [ZERO-SIZE]') +
      (cs.visibility === 'hidden' || cs.display === 'none' ? ' [HIDDEN]' : '')
  }))
}
console.log(seen.join('\n'))
// focus ring present?
console.log('\nfocus ring on a map stop:', await p.evaluate(() => {
  const el = document.querySelector('.ip-map__stop'); el.focus()
  return getComputedStyle(el, ':focus-visible').outlineWidth || 'n/a'
}))
await b.close()
