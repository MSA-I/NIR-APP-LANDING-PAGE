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
import { ROOT, checker } from './lib.mjs'

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

c.report()
