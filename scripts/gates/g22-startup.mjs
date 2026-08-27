// G22: how much JavaScript stands between the reader and a working page.
//
// This gate started life measuring total blocking time, and the story of why
// it does not any more is worth more than the number it was reporting.
//
// The SEO audit of 27.08.2026 recorded 1,545ms of blocking time on desktop
// against a 200ms threshold, and named it one of the page's real problems. It
// is not. Measured again on a quiet CPU, the same build blocks for 9ms. Both
// the 1,545ms and the 834ms that replaced it were single samples taken while
// this machine was compiling something else in another window.
//
// The attempts to make the timing assertion stable are the argument for giving
// it up: one sample failed at random; the median of three failed at random
// (identical builds gave 40, 47, 56, 273, 392, 508, 640, 722ms); the quietest
// of five held for a while and then a phone reading swung from 830ms to
// 1,872ms between two invocations of the same build. On a shared developer
// machine, blocking time measures the machine.
//
// So the assertions here are the CAUSE, which is deterministic: how many bytes
// of JavaScript the browser must fetch and parse before it can do anything, and
// whether the decorative WebGL ground is inside that or outside it. Both are
// facts about the build. The timing is still measured and printed, because a
// regression large enough to matter would move it too, but it is a note.
//
// The change these budgets protect is real where it costs a reader something:
// under a 4x CPU throttle, blocking time went from about 1,874ms with one
// bundle and an eager shader to about 890ms with the bundle split and the
// shader deferred.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { CHROME, DIST, serve, checker } from './lib.mjs'

const c = checker('G22')

// The entry chunk plus everything Vite modulepreloads beside it. Dynamic
// imports do not get a modulepreload, which is exactly the distinction this
// gate cares about.
const STARTUP_BUDGET_KB = 420

const html = readFileSync(path.join(DIST, 'index.html'), 'utf8')

const entry = (html.match(/<script[^>]+type="module"[^>]+src="(\/assets\/[^"]+\.js)"/) || [])[1]
c.ok(Boolean(entry), 'dist/index.html has no module entry script')

const preloaded = [...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="(\/assets\/[^"]+\.js)"/g)].map(
  (m) => m[1]
)

const startup = [entry, ...preloaded].filter(Boolean)
const bytes = startup.reduce((n, rel) => n + statSync(path.join(DIST, rel.slice(1))).size, 0)
const kb = bytes / 1024

c.ok(
  kb <= STARTUP_BUDGET_KB,
  `startup JavaScript is ${kb.toFixed(0)}KB across ${startup.length} files, over the ` +
    `${STARTUP_BUDGET_KB}KB budget: ${startup.map((s) => path.basename(s)).join(', ')}`
)

// The ground is decorative and aria-hidden. It compiles a WebGL program on
// mount, and it has no business doing that before the headline above it exists.
// `lazy(() => import(...))` puts it on its own chunk; a static import would put
// it back in the entry graph, and this is what says so.
//
// The test looks for the SHADER SOURCE, not for the component's name. The first
// cut grepped the startup files for "GrainGradient" and failed on a correct
// build, because the entry legitimately names the export it is lazily
// importing. Compiled GLSL only exists where the implementation is.
const IS_WEBGL = /gl_FragColor|out vec4|precision highp float|createShader/

const chunks = readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => ({
    file: f,
    startup: startup.some((s) => path.basename(s) === f),
    webgl: IS_WEBGL.test(readFileSync(path.join(DIST, 'assets', f), 'utf8')),
  }))

const shader = chunks.filter((ch) => ch.webgl)
// If the ground vanished from the build entirely, the assertion after this one
// would pass for the wrong reason.
c.ok(shader.length > 0, 'no chunk in the build contains a WebGL program; where did the ground go?')
for (const ch of shader) {
  c.ok(
    !ch.startup,
    `${ch.file} carries a WebGL program and is loaded at startup; the ground must be a dynamic import`
  )
}

c.note(
  `startup JavaScript ${kb.toFixed(0)}KB of ${STARTUP_BUDGET_KB}KB: ` +
    startup.map((s) => `${path.basename(s)} ${(statSync(path.join(DIST, s.slice(1))).size / 1024).toFixed(0)}KB`).join(', ')
)

// ---- the timing, reported ---------------------------------------------------
const srv = await serve()
// `channel: 'chromium'` asks for Playwright's OWN download, which this machine
// does not have: `playwright-core` is the dependency here precisely because the
// browser is not vendored. Every other gate launches the installed Chrome
// through lib.mjs's CHROME, and this one now does too, so the suite has one
// answer to "which browser" instead of two.
const browser = await chromium.launch({ executablePath: CHROME })
try {
  const measure = async (viewport, cpu) => {
    const ctx = await browser.newContext({ viewport, locale: 'he-IL' })
    const page = await ctx.newPage()
    const cdp = await ctx.newCDPSession(page)
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })
    await page.addInitScript(() => {
      window.__tbt = { total: 0, tasks: 0 }
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          window.__tbt.total += Math.max(0, e.duration - 50)
          window.__tbt.tasks++
        }
      }).observe({ type: 'longtask', buffered: true })
    })
    await page.goto(srv.origin + '/', { waitUntil: 'load' })
    await page.waitForTimeout(5000)
    const v = await page.evaluate(() => window.__tbt)
    await ctx.close()
    return Math.round(v.total)
  }

  const runs = []
  for (let i = 0; i < 3; i++) runs.push(await measure({ width: 390, height: 844 }, 4))
  runs.sort((a, b) => a - b)
  c.note(
    `phone at 4x slower CPU: TBT ${runs[0]}ms on the quietest of three ` +
      `[${runs.join(', ')}]. Reported, not enforced: this machine is shared, and the ` +
      `spread between runs of one build is wider than any regression worth catching.`
  )
} finally {
  await browser.close()
  await srv.close()
}

c.report()
