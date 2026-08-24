/* Tokens single-source: raw hex allowed only in tokens.css; components use var(). */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fail } from './checks-lib.mjs';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
for (const t of ['--onyx: #0a171d', '--oceanic: #003f47', '--wheat: #fff6e9', '--canvas: #f4f5f3']) {
  if (!tokens.includes(t)) fail(`tokens.css missing ${t}`);
}

const offenders = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|tsx|ts|css)$/.test(name) && !p.endsWith('tokens.css')) {
      const src = readFileSync(p, 'utf8');
      // scan only style contexts: whole .css files, <style> blocks, style="" attrs
      let styleish;
      if (name.endsWith('.css')) styleish = src;
      else
        styleish = [...(src.match(/<style>[\s\S]*?<\/style>/g) || []), ...(src.match(/style=["{][^"}]*["}]/g) || [])].join('\n');
      styleish = styleish.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const h of styleish.match(/#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{8}\b/g) || []) {
        offenders.push(`${p}: ${h}`);
      }
    }
  }
}
walk('src');
const real = offenders.filter((o) => !/#(demo|roi|faq|top)\b/.test(o));
if (real.length) fail(`raw hex outside tokens.css:\n${real.join('\n')}`);
console.log('TOKENS_OK');
