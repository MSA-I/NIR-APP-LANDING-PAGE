export type Locale = 'he' | 'en' | 'fr';

export const LOCALES: Locale[] = ['he', 'en', 'fr'];

export const LOCALE_META: Record<Locale, { label: string; dir: 'rtl' | 'ltr'; lang: string; path: string }> = {
  he: { label: 'עברית', dir: 'rtl', lang: 'he', path: '/' },
  en: { label: 'English', dir: 'ltr', lang: 'en', path: '/en/' },
  fr: { label: 'Français', dir: 'ltr', lang: 'fr', path: '/fr/' },
};

export const APP_URL = 'https://app.inplace.digital';
export const CONTACT_EMAIL = 'hello@inplace.digital';
export const WHATSAPP: { name: Record<Locale, string>; intl: string }[] = [
  { name: { he: 'משה', en: 'Moshe', fr: 'Moshe' }, intl: '972524167881' },
  { name: { he: 'ניר', en: 'Nir', fr: 'Nir' }, intl: '972542547074' },
];

/* Pricing — owner decisions #194/#195/#197/#198 (21.08.2026).
   Landing page shows the first four plans only; Business is never shown here.
   ILS on Hebrew pages (before VAT), USD on en/fr. Annual = 10 monthly payments. */
export const PRICING = {
  plans: [
    { id: 'free', ils: 0, usd: 0, ilsYear: 0, usdYear: 0, docs: 25, pages: 250, assistant: 20 },
    { id: 'basic', ils: 69, usd: 20, ilsYear: 690, usdYear: 200, docs: 50, pages: 500, assistant: 40 },
    { id: 'pro', ils: 249, usd: 79, ilsYear: 2490, usdYear: 790, docs: 200, pages: 2000, assistant: 100 },
    { id: 'premium', ils: 449, usd: 149, ilsYear: 4490, usdYear: 1490, docs: 500, pages: 5000, assistant: 250 },
  ],
  introAssistantRuns: 50,
  introDays: 30,
} as const;

/* Evidence freshness is the product's core claim, so the demo's as_of stamp
   cannot ship frozen: a hardcoded date is visibly stale within weeks on the one
   number that must not be. Generated at build time, per locale. */
export function buildAsOf(locale: Locale): string {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  if (locale === 'he') {
    const d = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);
    return `נכון ל-${d}, ${time}`;
  }
  if (locale === 'fr') {
    const d = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);
    return `Au ${d}, ${time}`;
  }
  const d = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(now);
  return `As of ${d}, ${time}`;
}
