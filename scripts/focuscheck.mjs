import { chromium } from 'playwright-core'
import { writeFile } from 'node:fs/promises'
const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const b = await chromium.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage({ viewport: { width: 1400, height: 820 } })
await p.goto('http://localhost:4500', { waitUntil: 'networkidle' })
await p.waitForSelector('html.sc-ready'); await p.waitForTimeout(700)
// mid-page: chrome should be gone from the tab order entirely
await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.45))
await p.waitForTimeout(900)
const mid = []
for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); mid.push(await p.evaluate(() => document.activeElement?.className || document.activeElement?.tagName)) }
console.log('mid-page tab order:', mid.join(' | '))
// focus ring, captured
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600)
for (let i = 0; i < 6; i++) await p.keyboard.press('Tab')
const cdp = await p.context().newCDPSession(p)
const r = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true })
await writeFile('lab/peek/focus.png', Buffer.from(r.data, 'base64'))
console.log('focused:', await p.evaluate(() => document.activeElement?.textContent?.trim()))
await b.close()
