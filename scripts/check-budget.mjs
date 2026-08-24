/* Perf budget: initial JS on the landing route <= 170KB gzip.
   Counts all dist JS assets referenced by index.html (islands hydrate lazily but
   count them all: worst-case honest budget). */
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { loadPages, fail } from './checks-lib.mjs';

const [he] = loadPages();
const scripts = [...he.html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]);
const inline = [...he.html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
let total = 0;
const rows = [];
for (const s of new Set(scripts)) {
  const buf = readFileSync('dist' + s);
  const gz = gzipSync(buf).length;
  total += gz;
  rows.push(`${s}: ${(gz / 1024).toFixed(1)}KB gz`);
}
for (const code of inline) total += gzipSync(Buffer.from(code)).length;
// dynamic imports referenced from module graph (astro island loaders load more): add all dist/_astro js not referenced? Too strict.
// We add hydration payloads discovered via astro-island component-url attributes:
const islandUrls = [...he.html.matchAll(/(?:component-url|renderer-url)="([^"]+)"/g)].map((m) => m[1]);
for (const u of new Set(islandUrls)) {
  const path = 'dist' + u;
  try {
    statSync(path);
    const gz = gzipSync(readFileSync(path)).length;
    total += gz;
    rows.push(`${u}: ${(gz / 1024).toFixed(1)}KB gz (island)`);
  } catch {}
}
console.log(rows.join('\n'));
console.log(`total: ${(total / 1024).toFixed(1)}KB gzip`);
if (total > 170 * 1024) fail(`JS budget exceeded: ${(total / 1024).toFixed(1)}KB > 170KB`);
// LCP element must be static DOM: hero h1 present in HTML (not canvas/video).
// Tags stripped: the accent word is wrapped in <em class="accent-word">.
if (!he.html.replace(/<[^>]+>/g, '').includes('רואים לפני שמשלמים')) fail('hero headline not in static HTML');
console.log('BUDGET_OK');
