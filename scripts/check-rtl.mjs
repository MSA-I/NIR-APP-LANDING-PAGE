/* RTL discipline: no physical left/right CSS in src (logical properties only). */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fail } from './checks-lib.mjs';

const BANNED = [
  /margin-(left|right)\s*:/,
  /padding-(left|right)\s*:/,
  /\btext-align\s*:\s*(left|right)/,
  /\b(?<!inset-)(left|right)\s*:\s*[^;]+;/,
  /border-(left|right)\s*:/,
];
const offenders = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|css|tsx)$/.test(name)) {
      const src = readFileSync(p, 'utf8');
      // scan style blocks and css only; skip JS logic lines using physical rect math
      const styleish = name.endsWith('.css') ? src : (src.match(/<style>[\s\S]*?<\/style>/g) || []).join('\n');
      for (const re of BANNED) {
        const m = styleish.match(re);
        if (m) offenders.push(`${p}: ${m[0].trim()}`);
      }
    }
  }
}
walk('src');
if (offenders.length) fail(`physical CSS properties found:\n${offenders.join('\n')}`);
console.log('RTL_OK');
