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

/* Plan ladder — owner decisions #194/#197/#198, and the ruling of 25.08.2026 that NO PRICE
   reaches a public surface before launch.
   The amounts of #195 are decided and seeded in the product's own catalogue; they are given to a
   customer inside their account, at the moment of upgrade, in the currency of their VERIFIED
   billing address. A public visitor has no verified billing address, so this site cannot even
   say which of the two catalogues would apply to them. It therefore publishes volume only.
   Business is never shown here. */
export const PRICING = {
  plans: [
    { id: 'free', docs: 20, assistant: 20 },
    { id: 'basic', docs: 40, assistant: 40 },
    { id: 'pro', docs: 150, assistant: 100 },
    { id: 'premium', docs: 375, assistant: 250 },
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
