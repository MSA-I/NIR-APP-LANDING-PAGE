// G19: the selected families are licensed, loadable and used in their roles.

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, DIST, checker, withPage } from './lib.mjs'

const c = checker('G19')
const fontDir = path.join(ROOT, 'public', 'assets', 'fonts')
const distFontDir = path.join(DIST, 'assets', 'fonts')
const files = [
  'Heebo-hebrew.woff2',
  'Heebo-latin.woff2',
  'HasubiMono-Variable.woff2',
]

const controlMissing = await stat(path.join(fontDir, 'not-a-real-font.woff2')).then(() => false, () => true)
c.ok(controlMissing, 'negative control unexpectedly found a nonexistent font')

const css = await readFile(path.join(ROOT, 'src', 'styles.css'), 'utf8')
for (const file of files) {
  const sourceInfo = await stat(path.join(fontDir, file))
  const distInfo = await stat(path.join(distFontDir, file))
  c.ok(sourceInfo.size > 10_000, `${file} is unexpectedly small at ${sourceInfo.size} bytes`)
  c.ok(sourceInfo.size === distInfo.size, `${file} differs between public and dist`)
  c.ok(css.includes(`/assets/fonts/${file}`), `${file} is not declared in the stylesheet`)
}

const license = await readFile(path.join(fontDir, 'FONT-LICENSES.txt'), 'utf8')
c.ok(license.includes('The Heebo Project Authors'), 'the Heebo copyright is missing from the license file')
c.ok(license.includes('Hasubi-Mono Project Authors'), 'Hasubi Mono copyright is missing from the license file')
c.ok(license.includes('SIL OPEN FONT LICENSE Version 1.1'), 'SIL OFL 1.1 text is missing')

for (const [name, pathname, sample] of [
  ['Hebrew', '/', 'הזמנה חשבונית תשלום'],
  ['English', '/en/', 'Procurement invoices payment'],
]) {
  await withPage(
    async (page) => {
      const measured = await page.evaluate((word) => {
        const ctx = document.createElement('canvas').getContext('2d')
        const width = (family, weight = 800) => {
          ctx.font = `${weight} 42px ${family}`
          return ctx.measureText(word).width
        }
        const family = (selector) => {
          const element = document.querySelector(selector)
          return element ? getComputedStyle(element).fontFamily : ''
        }
        return {
          displayLoaded: document.fonts.check(`800 42px "Heebo"`, word),
          monoLoaded: document.fonts.check('600 18px "Hasubi Mono"', word),
          displayWidth: width('"Heebo"'),
          missingWidth: width('"No Such InPlace Face"'),
          h1: family('h1'),
          eyebrow: family('.eyebrow'),
          figure: family('.ip-num'),
          body: getComputedStyle(document.body).fontFamily,
        }
      }, sample)
      c.ok(measured.displayLoaded, `${name}: Heebo did not load`)
      c.ok(measured.monoLoaded, `${name}: Hasubi Mono did not load`)
      c.ok(Math.abs(measured.displayWidth - measured.missingWidth) > 1, `${name}: Heebo measures like fallback`)
      c.ok(/Heebo/.test(measured.h1), `${name}: h1 uses ${measured.h1}`)
      c.ok(/Hasubi Mono/.test(measured.eyebrow), `${name}: eyebrow uses ${measured.eyebrow}`)
      c.ok(/Hasubi Mono/.test(measured.figure), `${name}: figures use ${measured.figure}`)
      c.ok(/Noto Sans Hebrew/.test(measured.body), `${name}: body uses ${measured.body}`)
      c.note(`${name}: Heebo ${measured.displayWidth.toFixed(1)}px vs fallback ${measured.missingWidth.toFixed(1)}px`)
    },
    { path: pathname },
  )
}

c.note(`${files.length} font files copied to dist with OFL attribution`)
c.report()
