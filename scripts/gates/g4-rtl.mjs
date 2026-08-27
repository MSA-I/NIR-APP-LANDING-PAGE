// G4: direction is carried by logical properties only.
//
// Build 3 only had to police one hand-written stylesheet. Build 4 writes most
// of its layout as Tailwind class names, so the scanner has two halves: the
// authored CSS, and the class names and inline styles in the components. A
// gate that only read the CSS would pass a page whose every margin was `ml-4`.
//
// Both halves are negative assertions, so both run against a control first and
// fail if the control comes back clean.

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { ROOT, checker, withPage } from './lib.mjs'

const c = checker('G4')

// ---------------------------------------------------------------- CSS half --
// Physical properties that have a logical equivalent. Block-axis properties
// (`top`, `bottom`, `height`) are NOT banned: they mean the same thing in both
// directions, and build 3 banned them only because its engine never needed one.
const BANNED_CSS = [
  'margin-left', 'margin-right',
  'padding-left', 'padding-right',
  'border-left', 'border-right',
  'border-left-width', 'border-right-width',
  'border-left-color', 'border-right-color',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'left', 'right',
  'text-align: left', 'text-align: right',
  'float: left', 'float: right',
]

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

function scanCss(css) {
  const body = stripComments(css)
  const hits = []
  for (const prop of BANNED_CSS) {
    const needle = prop.includes(':') ? prop : prop + '\\s*:'
    const re = new RegExp('(^|[{;\\s])' + needle, 'gm')
    let m
    while ((m = re.exec(body))) {
      hits.push({ what: prop, line: body.slice(0, m.index).split('\n').length })
    }
  }
  // A three- or four-value `border-width` / `margin` / `padding` shorthand is
  // written top/right/bottom/left, so it is physical even though its property
  // name is not. Two values are block/inline and are fine.
  const re = /(^|[{;\s])(border-width|margin|padding)\s*:\s*([^;}]+)/gm
  let m
  while ((m = re.exec(body))) {
    const parts = m[3].trim().split(/\s+/).filter((p) => !p.startsWith('var('))
    if (parts.length >= 3) {
      hits.push({
        what: `${m[2]} shorthand with ${parts.length} values`,
        line: body.slice(0, m.index).split('\n').length,
      })
    }
  }
  return hits
}

// ------------------------------------------------------------ Tailwind half --
// Class names that pin a side. The logical forms (ms-, me-, ps-, pe-, start-,
// end-, border-s, border-e, text-start, text-end) are the ones to use.
const BANNED_CLASS = [
  ['margin', /(^|[\s:"'`])-?m[lr]-/],
  ['padding', /(^|[\s:"'`])p[lr]-/],
  ['inset', /(^|[\s:"'`])-?(left|right)-/],
  ['text-align', /(^|[\s:"'`])text-(left|right)(\s|$|["'`])/],
  ['float', /(^|[\s:"'`])float-(left|right)(\s|$|["'`])/],
  ['border side', /(^|[\s:"'`])border-[lr](-|\s|$|["'`])/],
  ['rounded corner', /(^|[\s:"'`])rounded-(tl|tr|bl|br|l|r)(-|\s|$|["'`])/],
]

// Inline style objects in JSX use camelCase, which the CSS scanner cannot see.
const BANNED_STYLE = [
  ['marginLeft', /\bmarginLeft\s*:/],
  ['marginRight', /\bmarginRight\s*:/],
  ['paddingLeft', /\bpaddingLeft\s*:/],
  ['paddingRight', /\bpaddingRight\s*:/],
  ['borderLeft', /\bborderLeft[A-Za-z]*\s*:/],
  ['borderRight', /\bborderRight[A-Za-z]*\s*:/],
  ['left', /(^|[{,\s])left\s*:/],
  ['right', /(^|[{,\s])right\s*:/],
  ['textAlign left/right', /\btextAlign\s*:\s*['"](left|right)['"]/],
]

function scanSource(src) {
  const body = src.replace(/^\s*\/\/.*$/gm, '')
  const hits = []
  for (const [what, re] of [...BANNED_CLASS, ...BANNED_STYLE]) {
    const g = new RegExp(re.source, 'gm')
    let m
    while ((m = g.exec(body))) {
      hits.push({ what, line: body.slice(0, m.index).split('\n').length })
    }
  }
  return hits
}

async function walk(dir, ext, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(p, ext, out)
    else if (ext.some((e) => entry.name.endsWith(e))) out.push(p)
  }
  return out
}

// ---- the controls: prove both scanners fire -------------------------------
const controlCss = await readFile(
  path.join(ROOT, 'scripts', 'gates', 'fixtures', 'physical-properties.css'),
  'utf8'
)
const cssControlHits = scanCss(controlCss)
c.ok(
  cssControlHits.length >= 10,
  `the CSS control should trip the scanner on every banned property, it tripped ${cssControlHits.length}`
)
c.note(`control: ${cssControlHits.length} physical CSS properties detected in the fixture`)

const controlSource = `
  const bad = <div className="ml-4 md:pr-2 text-left border-l rounded-tl-lg left-0"
                   style={{ marginRight: 4, left: 0, textAlign: 'right' }} />
`
const sourceControlHits = scanSource(controlSource)
c.ok(
  sourceControlHits.length >= 8,
  `the component control should trip the scanner on every banned form, it tripped ${sourceControlHits.length}`
)
c.note(`control: ${sourceControlHits.length} physical class/style forms detected in the fixture`)

// ---- the real files -------------------------------------------------------
const cssFiles = await walk(path.join(ROOT, 'src'), ['.css'])
for (const file of cssFiles) {
  const hits = scanCss(await readFile(file, 'utf8'))
  c.ok(
    hits.length === 0,
    `${path.relative(ROOT, file)}: ${hits.map((h) => `${h.what} (line ${h.line})`).join(', ')}`
  )
}
c.note(`${cssFiles.length} stylesheet(s) scanned`)

const sourceFiles = await walk(path.join(ROOT, 'src'), ['.tsx', '.ts'])
for (const file of sourceFiles) {
  const hits = scanSource(await readFile(file, 'utf8'))
  c.ok(
    hits.length === 0,
    `${path.relative(ROOT, file)}: ${hits.map((h) => `${h.what} (line ${h.line})`).join(', ')}`
  )
}
c.note(`${sourceFiles.length} component file(s) scanned`)

// -------------------------------------------------------------- rendered --
// Both halves above read text, and text is not where this one hid.
//
// The quotes carousel centred its two controls with `inset-inline-start: 50%`
// and `translate: -50% 0`. Every token in that pair is spelled logically and
// the scanner had nothing to say about it, but a PERCENTAGE TRANSLATE is a
// physical axis wearing a logical property's clothes: `inset-inline-start`
// resolved to `right: 50%` here, so the cluster's right edge sat on the centre
// line and the translate pushed it further left instead of pulling it back.
// It shipped a full cluster-width off centre, and the owner found it by eye.
//
// So this half MEASURES instead of reading, and it asserts the two things a
// stylesheet cannot promise.
await withPage(async (page) => {
  const rail = await page.$('.voices-rail')
  if (!rail) {
    c.ok(false, 'the quotes rail is not on the page')
    return
  }
  await page.$eval('.voices-rail', (el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)

  const seen = await page.evaluate(() => {
    const railBox = document.querySelector('.voices-rail').getBoundingClientRect()
    const cluster = document.querySelector('.voices-rail__controls').getBoundingClientRect()
    const buttons = [...document.querySelectorAll('.voices-rail__controls button')]
      .map((b) => ({
        x: b.getBoundingClientRect().left,
        icon: b.querySelector('svg')?.getAttribute('class') || '',
        label: b.getAttribute('aria-label') || '',
      }))
      .sort((a, b) => a.x - b.x)
    return {
      off: cluster.left + cluster.width / 2 - (railBox.left + railBox.width / 2),
      buttons,
    }
  })

  // Centred, measured rather than declared. A sign error in either direction
  // moves this by the cluster's own width and cannot round to nothing.
  c.ok(
    Math.abs(seen.off) <= 2,
    `the carousel controls sit ${Math.round(seen.off)}px off the centre of their rail`
  )

  // The arrows point outward. This is the one statement about them that is true
  // in BOTH directions: in Hebrew the left chevron is "next" and in English it
  // is "previous", but either way the control on the left points left and the
  // control on the right points right. Two arrows aimed at each other is the
  // shape the bug had, and it is what this refuses.
  c.ok(seen.buttons.length === 2, `the carousel should have two controls, it has ${seen.buttons.length}`)
  if (seen.buttons.length === 2) {
    const [start, end] = seen.buttons
    c.ok(
      /chevron-left/.test(start.icon),
      `the control on the left points the wrong way: ${start.icon} ("${start.label}")`
    )
    c.ok(
      /chevron-right/.test(end.icon),
      `the control on the right points the wrong way: ${end.icon} ("${end.label}")`
    )
  }
  c.note(
    `controls centred within ${Math.abs(Math.round(seen.off))}px; ` +
      seen.buttons.map((b) => `${b.icon.replace(/lucide\s*/g, '')} "${b.label}"`).join(' | ')
  )
})

c.report()
