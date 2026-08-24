import { loadPages, fail } from './checks-lib.mjs';

const [he, en, fr] = loadPages();

// Hebrew: ILS monthly + yearly (10x), before-VAT note
for (const v of ['69 ₪', '249 ₪', '449 ₪', '690 ₪', '2,490 ₪', '4,490 ₪']) {
  if (!he.html.includes(v)) fail(`he pricing missing ${v}`);
}
if (!he.html.includes('לפני מע״מ')) fail('he missing before-VAT note');

// en+fr: USD
for (const page of [en, fr]) {
  for (const v of ['$20', '$79', '$149', '$200', '$790']) {
    if (!page.html.includes(v)) fail(`${page.file} pricing missing ${v}`);
  }
  if (page.html.includes('449 ₪')) fail(`${page.file} leaks ILS plan pricing`);
}
// $1,490 with locale separators (en: 1,490 / fr: 1 490)
if (!en.html.includes('$1,490')) fail('en missing $1,490');
if (!/\$1[\s  ]490/.test(fr.html)) fail('fr missing $1 490');

// exactly 4 public plan cards, Business never shown
for (const p of [he, en, fr]) {
  const cards = p.html.match(/class="plan card/g) || [];
  if (cards.length !== 4) fail(`${p.file}: expected 4 plan cards, got ${cards.length}`);
  const sec = p.html.match(/id="pricing"[\s\S]*?<\/section>/)?.[0] || '';
  const planNames = [...sec.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
  if (planNames.length !== 4) fail(`${p.file}: expected 4 plan h3s, got ${planNames.length}`);
  if (planNames.some((n) => /business|ביזנס/i.test(n))) fail(`${p.file}: Business plan card leaked: ${planNames.join(',')}`);
}
// Document quotas + assistant quotas. Page quotas are deliberately absent: the page ceiling is
// still enforced in the product (migration 0170, 10x the document quota) but it is an abuse
// guard, not a second thing to buy, and publishing it made one decision read as two.
for (const q of ['20', '40', '150', '375', '100', '250']) {
  if (!he.html.includes(q)) fail(`he pricing missing quota ${q}`);
}
if (/עמודי סריקה|scanned pages|pages numéris/i.test(he.html + en.html + fr.html)) {
  fail('a page quota reappeared on the pricing page -- one usage metric only');
}
console.log('PRICING_OK');
