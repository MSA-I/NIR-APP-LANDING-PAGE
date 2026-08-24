import { loadPages, fail } from './checks-lib.mjs';

const titles = new Set();
const descs = new Set();
for (const p of loadPages()) {
  const title = p.html.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc = p.html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!title || title.length < 8) fail(`${p.file}: missing title`);
  if (!desc || desc.length < 40) fail(`${p.file}: missing/short description`);
  titles.add(title);
  descs.add(desc);
  if (!p.html.includes(`<link rel="canonical" href="https://inplace.digital${p.path}"`)) fail(`${p.file}: canonical`);
  for (const l of ['he', 'en', 'fr', 'x-default']) {
    if (!p.html.includes(`hreflang="${l}"`)) fail(`${p.file}: missing hreflang ${l}`);
  }
  if (!p.html.includes('property="og:title"')) fail(`${p.file}: og:title`);
  if (!p.html.includes('"@type":"SoftwareApplication"')) fail(`${p.file}: SoftwareApplication JSON-LD`);
  if (!p.html.includes('"@type":"FAQPage"')) fail(`${p.file}: FAQPage JSON-LD`);
}
if (titles.size !== 3) fail('titles not unique per locale');
if (descs.size !== 3) fail('descriptions not unique per locale');
console.log('SEO_OK');
