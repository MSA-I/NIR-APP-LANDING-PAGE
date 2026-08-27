// G18: the film is downloaded once.
//
// This is the gate that would have caught the worst finding in the audit of
// 27.08.2026, and the reason it did not exist is instructive: every other gate
// here measures what the page LOOKS like or what it SAYS. None of them
// measured what it COSTS. The film scrubbed correctly, the poster was right,
// g10 confirmed the playhead followed the scroll, and all the while every
// visitor was pulling 28.07MB for a 14.5MB file:
//
//   bytes=0-          -> 14.54MB   the whole file
//   bytes=14516224-   ->  0.03MB   the tail, hunting for the index
//   bytes=1048576-    -> 13.50MB   the whole file again
//
// The index (`moov`) was at the end of the container, so the browser had to
// read everything before it could address anything, then start over. On the
// phone cut it was 12.44MB for a 5.79MB file, out of somebody's data plan.
//
// Two assertions, because either alone can pass while the problem is present:
// the layout can be right while some other cause doubles the traffic, and the
// traffic can look fine on a warm cache while the layout is still wrong.

import { statSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { DIST, CHROME, serve, checker } from './lib.mjs'
import { atomOrder, isFaststart } from '../faststart.mjs'

const c = checker('G18')

// Desktop gets film.mp4, phones get film-m.mp4. FilmChapter reads the media
// query once and assigns src, so each viewport is measured against its own cut.
const CUTS = [
  { name: 'film.mp4', viewport: { width: 1440, height: 900 } },
  { name: 'film-m.mp4', viewport: { width: 390, height: 844 } },
]

// ---- the layout of the shipped containers ---------------------------------
for (const { name } of CUTS) {
  const file = path.join(DIST, 'assets', name)
  const order = atomOrder(file).map((b) => b.type)
  c.ok(
    isFaststart(file),
    `${name} is laid out ${order.join(' ')}: the index is behind the media, so the ` +
      `browser must read the whole file before it can seek. Run \`npm run faststart\`.`
  )
  c.note(`${name} ${order.join(' ')} ${(statSync(file).size / 1e6).toFixed(2)}MB`)
}

// ---- what the browser actually pulls --------------------------------------
const srv = await serve()
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})

try {
  for (const { name, viewport } of CUTS) {
    const onDisk = statSync(path.join(DIST, 'assets', name)).size
    const ctx = await browser.newContext({ viewport, locale: 'he-IL' })
    const page = await ctx.newPage()

    // What crossed the wire, counted as it crosses.
    //
    // Two earlier cuts of this measurement were wrong, both in ways that
    // flattered the page. Summing content-length read 1.93x on a file that was
    // fine, because an open-ended `bytes=0-` makes the server declare the whole
    // remainder and Chrome is free to hang up early. Waiting for
    // `requestfinished` read 0.00x on everything, because a media stream does
    // not finish while it is still streaming, so the gate measured nothing and
    // passed. Chrome's own `Network.dataReceived` counts each chunk as it
    // arrives and needs neither the request to end nor the server to be honest.
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Network.enable')
    let pulled = 0
    const ours = new Set()
    const ranges = new Map()
    cdp.on('Network.requestWillBeSent', (e) => {
      if (!e.request.url.endsWith(name)) return
      ours.add(e.requestId)
      ranges.set(e.requestId, e.request.headers.Range || e.request.headers.range || 'no range')
    })
    cdp.on('Network.dataReceived', (e) => {
      if (ours.has(e.requestId)) pulled += e.encodedDataLength || e.dataLength || 0
    })

    await page.goto(srv.origin + '/', { waitUntil: 'load' })
    // The clip opens on its own after the page loads; nothing here scrolls,
    // because the number under test is what a reader pays for ARRIVING, before
    // they have asked for a single frame.
    await page.waitForTimeout(7000)
    await ctx.close()

    const asked = [...ranges.values()]
    // A measurement of nothing is not a measurement. If the clip never opened,
    // the ratio below would be a perfect 0.00 and the gate would wave through
    // the very fault it exists to catch.
    c.ok(asked.length > 0, `${name} was never requested at ${viewport.width}px, so nothing was measured`)

    const ratio = pulled / onDisk
    c.ok(
      ratio <= 1.15,
      `${name}: the browser pulled ${(pulled / 1e6).toFixed(2)}MB for a ` +
        `${(onDisk / 1e6).toFixed(2)}MB file (${ratio.toFixed(2)}x) over ` +
        `${asked.length} request(s): ${asked.join(' | ')}`
    )
    c.note(
      `${name} at ${viewport.width}px: ${(pulled / 1e6).toFixed(2)}MB pulled of ` +
        `${(onDisk / 1e6).toFixed(2)}MB on disk (${ratio.toFixed(2)}x), ${asked.length} request(s)`
    )
  }
} finally {
  await browser.close()
  await srv.close()
}

c.report()
