import { readdirSync, statSync } from 'node:fs';
import { fail } from './checks-lib.mjs';

const expected = ['he-desktop-full.png', 'he-mobile-full.png', 'en-desktop-full.png', 'fr-desktop-full.png'];
let files = [];
try {
  files = readdirSync('artifacts/screenshots');
} catch {
  fail('artifacts/screenshots missing (run node tests/e2e.mjs screenshots)');
}
for (const f of expected) {
  if (!files.includes(f)) fail(`missing screenshot ${f}`);
  if (statSync(`artifacts/screenshots/${f}`).size < 30000) fail(`screenshot ${f} suspiciously small`);
}
console.log('EVIDENCE_OK');
