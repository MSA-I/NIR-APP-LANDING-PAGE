/* Content-claims guard (docs/BRIEF.md §11): forbidden claim patterns must not
   appear in any built page; the placeholder story must stay marked. */
import { loadPages, fail } from './checks-lib.mjs';

const FORBIDDEN = [
  { re: /חיסכון של \d|savings of \d|économies de \d/i, why: 'savings percentage claim' },
  { re: /\buptime\b|99\.9|\bSLA\b/, why: 'availability claim (#205 forbids)' },
  { re: /(\d+\s*(משתמשים|users|utilisateurs))[^.]{0,40}(מסלול|plan|forfait)/i, why: 'user quota published (#199 forbids)' },
  { re: /(GB|ג'יגה|Go)\s/, why: 'storage quota published (#200 forbids)' },
  { re: /מאות לקוחות|thousands of customers|des centaines de clients/i, why: 'invented customer volume' },
  /* Standalone >—< is the product's canonical "no data" marker (kept);
     em/en dash inside prose is banned. */
  { re: /[^>]—[^<]|^—|—$/m, why: 'em-dash in prose copy' },
  { re: /–/, why: 'en-dash in visible copy' },
];

for (const p of loadPages()) {
  // strip script/style/JSON-LD; scan visible html only
  const visible = p.html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  for (const f of FORBIDDEN) {
    const m = visible.match(f.re);
    if (m) fail(`${p.file}: ${f.why} ("${m[0].slice(0, 60)}")`);
  }
  // placeholder story must carry its visible disclosure note
  if (!p.html.match(/פיילוט|pilot|pilote/i)) fail(`${p.file}: story placeholder disclosure missing`);
}
console.log('CLAIMS_OK');
