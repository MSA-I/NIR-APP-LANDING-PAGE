// Run the whole ledger and print the measured met/unmet counts.
//
// Sequential by default: several gates drive a browser and screenshot it, and a
// parallel run would fight over the same ports and the same CPU while claiming
// to measure timing-sensitive things.

import { spawnSync } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const files = (await readdir(HERE))
  .filter((f) => /^g\d+-.*\.mjs$/.test(f))
  .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const run = only.length ? files.filter((f) => only.some((o) => f.startsWith(o.toLowerCase()))) : files

const results = []
for (const f of run) {
  const id = f.match(/^g\d+/)[0].toUpperCase()
  process.stdout.write(`${id.padEnd(4)} ${f.replace(/^g\d+-|\.mjs$/g, '')} ... `)
  const t = Date.now()
  const r = spawnSync(process.execPath, [path.join(HERE, f)], { encoding: 'utf8' })
  const out = (r.stdout || '') + (r.stderr || '')
  const passed = r.status === 0 && new RegExp(`${id} PASS`).test(out)
  results.push({ id, file: f, passed, out, ms: Date.now() - t })
  console.log(passed ? `PASS  (${((Date.now() - t) / 1000).toFixed(1)}s)` : 'FAIL')
  if (!passed) {
    for (const line of out.split('\n').filter((l) => /FAIL|Error|error:/.test(l))) {
      console.log('       ' + line.trim())
    }
  }
}

const met = results.filter((r) => r.passed).length
const unmet = results.length - met
console.log(`\n${met} met, ${unmet} unmet, of ${results.length} runnable gates`)
process.exitCode = unmet ? 1 : 0
