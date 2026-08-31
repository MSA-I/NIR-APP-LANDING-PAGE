// G18: the English film is in English, and it is laid for the frame it is shot in.
//
// WHY THIS GATE EXISTS
// Round twenty-three shipped `film-en.mp4` with its first twenty-five seconds
// in HEBREW — the Hebrew product screens on the panels, shekels on the paper —
// and the phone cut of it laid for a 1920-wide frame inside an 810-wide
// viewport, with the stack of documents pushed off the left edge. The cause was
// one character: `render-world.mjs` appended `?lang=en` to the scene URL and
// then appended `?w=…&h=…` to that, so the scene was asked for
// `world.html?lang=en?w=1920&h=1080`. `URLSearchParams` reads the first
// parameter of that as `lang = "en?w=1920"`, which is not `"en"`, and `w` as
// nothing at all — so the scene fell back to Hebrew and to its default width,
// silently, and the render ran to completion and looked plausible.
//
// Nothing measured it. The round verified act two at t=33s, which is rendered
// by `render-recon.mjs` — a different script, which builds the same query
// correctly — so the one frame anybody looked at was English and the twenty-five
// seconds before it were not.
//
// WHAT THIS PROVES AND WHAT IT DOES NOT
// It proves the scene ITSELF answers in English when asked in English, at the
// width it was asked for, with the English captures on its panels; and it proves
// the English legs on disk are not the Hebrew ones under another name. It does
// not read the shipped pixels — nothing here does OCR — so a film rebuilt from a
// scene that has since changed is still the responsibility of whoever rebuilds
// it. What it closes is the door this fault came through.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { ROOT, CHROME, checker } from './lib.mjs'

const c = checker('G18')

const HEBREW = /[\u0590-\u05FF]/
const SCENE = pathToFileURL(path.join(ROOT, 'world', 'world.html')).href

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

/** Open the scene exactly the way the renderer does, and report what it says. */
async function ask(lang, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  // The URL is assembled here the way `render-world.mjs` assembles it, on
  // purpose: if that line grows a second `?` again, this gate is reading a
  // different URL from the one the renderer uses and would pass through it.
  await page.goto(`${SCENE}?w=${w}&h=${h}&lang=${lang}`, { waitUntil: 'load' })
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 })
  const said = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    text: document.body.innerText,
    frame: getComputedStyle(document.getElementById('frame')).width,
    panels: [...document.querySelectorAll('.panel img')].map((i) => i.getAttribute('src')),
  }))
  await page.close()
  return said
}

// The English scene, at the two sizes the two cuts are shot at.
for (const [w, h] of [[1920, 1080], [810, 1440]]) {
  const en = await ask('en', w, h)
  c.ok(en.lang === 'en', `English scene at ${w}x${h} declares lang="${en.lang}"`)
  c.ok(en.dir === 'ltr', `English scene at ${w}x${h} declares dir="${en.dir}"`)
  c.ok(!HEBREW.test(en.text), `English scene at ${w}x${h} still prints Hebrew on its paper`)
  c.ok(!en.text.includes('₪'), `English scene at ${w}x${h} still prints shekels`)
  c.ok(en.panels.length > 0, `English scene at ${w}x${h} hung no panels at all`)
  c.ok(
    en.panels.every((s) => s.startsWith('screens/en/')),
    `English scene at ${w}x${h} composites Hebrew screens: ` +
      en.panels.filter((s) => !s.startsWith('screens/en/')).join(', ')
  )
  // The second half of the same fault: `w` was dropped with `lang`, so the
  // phone render laid a 1920-wide frame inside an 810-wide viewport.
  c.ok(
    en.frame === `${w}px`,
    `scene asked for w=${w} laid its frame at ${en.frame} — the width did not arrive`
  )
}

// The control. A check that cannot fail is not a check: the Hebrew scene has to
// still be Hebrew, or the assertions above are passing on an empty page.
const he = await ask('he', 1920, 1080)
c.ok(HEBREW.test(he.text), 'the Hebrew scene prints no Hebrew — the reading above measures nothing')
c.ok(
  he.panels.every((s) => !s.startsWith('screens/en/')),
  'the Hebrew scene composites the English screens'
)

await browser.close()

// ---------------------------------------------------------------------------
// The legs on disk. When the language did not arrive, the English render
// produced the Hebrew film frame for frame: `03-en.mp4` and `04-en.mp4` came
// out BYTE-IDENTICAL to `03.mp4` and `04.mp4`. Two renders of two different
// languages cannot agree to the byte, so identity here is proof of a fallback.
// ---------------------------------------------------------------------------
const digest = async (f) => {
  try {
    return createHash('sha1').update(await readFile(path.join(ROOT, 'world', 'renders', f))).digest('hex')
  } catch {
    return null
  }
}

for (const suffix of ['', '-m']) {
  for (const leg of ['01', '02', '03', '04', 'R']) {
    const a = await digest(`${leg}${suffix}.mp4`)
    const b = await digest(`${leg}${suffix}-en.mp4`)
    c.ok(a !== null, `world/renders/${leg}${suffix}.mp4 is missing`)
    c.ok(b !== null, `world/renders/${leg}${suffix}-en.mp4 is missing`)
    if (a && b) c.ok(a !== b, `${leg}${suffix}-en.mp4 is byte-identical to ${leg}${suffix}.mp4 — the English render fell back to Hebrew`)
  }
}

// ---------------------------------------------------------------------------
// And the SHIPPED film was assembled from those legs and not from the others.
//
// This is a RELATIVE reading, on purpose. The obvious check — "the English film
// does not look like the Hebrew one" — cannot be made to work: the two are the
// same geometry, the same camera and the same paper, and only the words printed
// on that paper differ. Measured across the whole clip, that is between 0.08%
// and 2.8% of the pixels in the hall, and the closing mark carries no language
// at all, so any absolute threshold either passes a fallback or fails the logo.
//
// Asking which of the two legs the shipped frame came FROM has no such problem.
// A frame of `film-en.mp4` is a re-encode of the corresponding frame of
// `01-en.mp4`, so it sits close to it and further from `01.mp4`, and the two
// distances swap the moment the wrong legs are concatenated. Measured on
// 31.08.2026: nearest-leg 0.31-0.64, other-language leg 0.60-3.95, the closest
// call being 1.7x. The factor below is under that and well over 1.
// ---------------------------------------------------------------------------
function frame(file, at, w, h) {
  const r = spawnSync('ffmpeg', [
    '-v', 'error', '-ss', String(at), '-i', file,
    '-frames:v', '1', '-vf', `scale=${w}:${h}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-',
  ], { maxBuffer: 1 << 26 })
  return r.status === 0 && r.stdout.length === w * h ? r.stdout : null
}
const meanDiff = (a, b) => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i])
  return s / a.length
}

// Leg 01 opens the film, so film time is leg time inside it; leg 02 follows it
// and is offset by its length. Both are read inside the hall, where the paper
// is the subject and the language is on it.
const LEG01 = 6.958333
const READINGS = [[3, '01', 3], [5, '01', 5], [11, '02', 11 - LEG01], [13, '02', 13 - LEG01]]
const MARGIN = 1.25

for (const [suffix, w, h] of [['', 480, 270], ['-m', 270, 480]]) {
  for (const [filmAt, leg, legAt] of READINGS) {
    const film = path.join(ROOT, 'public', 'assets', `film${suffix}-en.mp4`)
    const shipped = frame(film, filmAt, w, h)
    const fromEn = frame(path.join(ROOT, 'world', 'renders', `${leg}${suffix}-en.mp4`), legAt, w, h)
    const fromHe = frame(path.join(ROOT, 'world', 'renders', `${leg}${suffix}.mp4`), legAt, w, h)
    if (!c.ok(shipped && fromEn && fromHe, `could not read film${suffix}-en.mp4 or leg ${leg}${suffix} at t=${filmAt}s`)) continue
    const dEn = meanDiff(shipped, fromEn)
    const dHe = meanDiff(shipped, fromHe)
    c.ok(
      dEn * MARGIN < dHe,
      `film${suffix}-en.mp4 at t=${filmAt}s is not the English leg ${leg}${suffix}-en ` +
        `(distance ${dEn.toFixed(3)}) but the Hebrew ${leg}${suffix} (${dHe.toFixed(3)}) — ` +
        'the shipped film was assembled from the wrong legs'
    )
  }
}

c.report()
