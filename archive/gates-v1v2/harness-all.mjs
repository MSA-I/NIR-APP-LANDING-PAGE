// G8: the scroll harness has to pass on all three profiles, not just desktop.
// Runs shoot.mjs for desktop, 390px and reduced motion, and requires each
// profile's own success lines. A profile that silently prints nothing fails.
import { spawnSync } from 'node:child_process'

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i === -1 ? d : process.argv[i + 1] }
const URL = arg('url', 'http://localhost:4500')

const PROFILES = [
  { name: 'desktop', args: ['--out', 'lab/shots', '--per-act', '8'],
    want: [/no dead scroll detected/, /all 9 legs reach full opacity and paint a real frame/, /contrast over media: all cues clear/] },
  { name: '390px', args: ['--out', 'lab/mobile', '--width', '390', '--height', '844', '--per-act', '6'],
    want: [/no dead scroll detected/, /all 9 legs reach full opacity and paint a real frame/, /contrast over media: all cues clear/] },
  { name: 'reduced', args: ['--out', 'lab/reduced', '--reduced-motion', '--per-act', '5'],
    want: [/all 9 legs reach full opacity \(posters only/] },
]

let bad = 0
for (const p of PROFILES) {
  const r = spawnSync(process.execPath, ['scripts/shoot.mjs', '--url', URL, ...p.args],
    { encoding: 'utf8', maxBuffer: 1 << 26 })
  const out = (r.stdout || '') + (r.stderr || '')
  const missing = p.want.filter((re) => !re.test(out))
  // an explicit failure line anywhere is fatal regardless of the wants
  const failed = /CONTRAST FAIL|stuck on its poster|never reach full opacity/.test(out)
  if (missing.length || failed || r.status !== 0) {
    bad++
    console.log(`  ${p.name}: FAIL`)
    for (const m of missing) console.log(`     missing: ${m}`)
    if (failed) console.log('     an explicit failure line was printed')
    if (r.status !== 0) console.log(`     exit ${r.status}`)
  } else {
    console.log(`  ${p.name}: ok`)
  }
}

if (bad) { console.log('HARNESS-ALL-BAD'); process.exit(1) }
console.log('HARNESS-ALL-OK')
