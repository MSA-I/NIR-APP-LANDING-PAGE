import { loadPages, fail } from './checks-lib.mjs';

/**
 * The pricing section publishes VOLUME, never an amount.
 *
 * Owner ruling, 25.08.2026: no price reaches a public surface before launch. Until then this file
 * enforced the opposite — it asserted that every #195 figure was present — so inverting it is the
 * whole point of the change, not a side effect of it.
 *
 * The amounts are still decided and still seeded in the product's own catalogue. A customer is
 * given their figure inside their account at the moment of upgrade, in the currency of the billing
 * address VERIFIED with the payment provider. A visitor here has no verified billing address, so
 * the site cannot even say which of the two catalogues would apply to them.
 */
const [he, en, fr] = loadPages();
const pages = [he, en, fr];

/**
 * The ILS catalogue of #195, in the exact rendered form it would take if it came back, checked
 * across the WHOLE page rather than one section — this is also the old leak check, which caught an
 * ILS figure surfacing on an en/fr page.
 *
 * Attaching the currency is what makes it collision-proof. The demo fixtures are full of shekel
 * amounts (`39.90 ₪`, `6,384 ₪`, `12,412 ₪`) and the quota ladder is full of bare numbers
 * (20, 40, 150, 375, 100, 250), so a bare `249` would be ambiguous and a bare `20` would be a
 * false positive against the free plan's document quota. None of the demo amounts equals a plan
 * price, so these six forms mean one thing only.
 *
 * The USD catalogue gets no equivalent list, deliberately: the ROI calculator renders the
 * VISITOR'S OWN assumptions in dollars and its default output already includes `$200`. Listing
 * `$20`/`$200` here failed on that, which is a false positive — the figure is the reader's, not
 * ours. USD prices are caught instead by the section scan below, which allows no currency symbol
 * inside `#pricing` at all and therefore needs no list of amounts to look for.
 */
const ILS_PRICE_FORMS = ['69 ₪', '249 ₪', '449 ₪', '690 ₪', '2,490 ₪', '4,490 ₪'];

for (const page of pages) {
  for (const form of ILS_PRICE_FORMS) {
    if (page.html.includes(form)) fail(`${page.file}: publishes a plan price (${form})`);
  }
}

/**
 * The section itself, checked as a whole rather than figure by figure: no currency symbol of any
 * kind may appear between `id="pricing"` and its closing tag. A price we never anticipated is
 * still a price, and this is the check that catches one.
 */
for (const page of pages) {
  const section = page.html.match(/id="pricing"[\s\S]*?<\/section>/)?.[0];
  if (!section) fail(`${page.file}: no #pricing section found`);
  const symbols = section.match(/[₪$€£]/g) || [];
  if (symbols.length) {
    fail(`${page.file}: currency symbol inside the pricing section (${[...new Set(symbols)].join('')})`);
  }
  // The monthly/yearly control existed only to switch which figure was shown.
  if (/data-pricing-toggle|data-period-btn|class="period-toggle"/.test(section)) {
    fail(`${page.file}: a billing-interval toggle is back, with no price for it to toggle`);
  }
}

/**
 * Structured data is a published price too, and the one a search engine reads aloud. A page that
 * shows no price while its JSON-LD carries `offers` would put a figure in a search result that the
 * page itself does not stand behind.
 */
for (const page of pages) {
  if (/"@type"\s*:\s*"Offer"|"priceCurrency"|"price"\s*:/.test(page.html)) {
    fail(`${page.file}: JSON-LD still carries a priced offer`);
  }
}

// exactly 4 public plan cards, Business never shown
for (const p of pages) {
  const cards = p.html.match(/class="plan card/g) || [];
  if (cards.length !== 4) fail(`${p.file}: expected 4 plan cards, got ${cards.length}`);
  const sec = p.html.match(/id="pricing"[\s\S]*?<\/section>/)?.[0] || '';
  const planNames = [...sec.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
  if (planNames.length !== 4) fail(`${p.file}: expected 4 plan h3s, got ${planNames.length}`);
  if (planNames.some((n) => /business|ביזנס/i.test(n))) fail(`${p.file}: Business plan card leaked: ${planNames.join(',')}`);
}

// Document quotas + assistant quotas. These are what the section publishes now, so their presence
// is the check that the cards did not go blank along with the prices.
// Page quotas stay deliberately absent: the page ceiling is still enforced in the product
// (migration 0170, 10x the document quota) but it is an abuse guard, not a second thing to buy,
// and publishing it made one decision read as two.
for (const q of ['20', '40', '150', '375', '100', '250']) {
  if (!he.html.includes(q)) fail(`he pricing missing quota ${q}`);
}
if (/עמודי סריקה|scanned pages|pages numéris/i.test(he.html + en.html + fr.html)) {
  fail('a page quota reappeared on the pricing page -- one usage metric only');
}

// The reader is told where the price does come from, so the absence reads as a policy rather than
// as something the page forgot.
if (!he.html.includes('אינו מפורסם באתר')) fail('he: no note saying where the price is given');
if (!en.html.includes('not published on this site')) fail('en: no note saying where the price is given');
if (!fr.html.includes('pas publié sur ce site')) fail('fr: no note saying where the price is given');

console.log('PRICING_OK');
