/* Deterministic demo fixtures for the guided demo + role views.
   Synthetic demonstration data (labeled as such in the UI); mirrors the
   product's real three-way-match semantics. All amounts in ILS. */

import type { Locale } from '../lib/i18n';

export type ChainState = 'done' | 'alert' | 'idle' | 'await';
export type RoleId = 'owner' | 'office' | 'accountant';
export type ScenarioId = 'price' | 'receipt' | 'credit' | 'payment';

export interface ChainRow {
  label: string;
  value: string;
  state: ChainState;
}

export interface Scenario {
  id: ScenarioId;
  chain: ChainRow[];
  finding: string;
  findingFacts: { label: string; value: string }[];
  summary: string;
  /* What each role gets: 'full' view, or a named restriction message. */
  access: Record<RoleId, { kind: 'full' } | { kind: 'restricted'; note: string }>;
}

interface FixtureSet {
  approvedLabel: string;
  suppliers: { bakery: string; farm: string; packaging: string };
  scenarios: Scenario[];
}

const he: FixtureSet = {
  approvedLabel: 'מאושרת',
  suppliers: { bakery: 'מאפיית גל', farm: 'משק דגן', packaging: 'אריזות הצפון' },
  scenarios: [
    {
      id: 'price',
      chain: [
        { label: 'מחירון · עגבניות שרי', value: '‎39.90 ₪', state: 'done' },
        { label: 'הזמנה 4127 · 160 ארגזים', value: '‎6,384 ₪', state: 'done' },
        { label: 'קבלת סחורה · 160 ארגזים', value: '✓', state: 'done' },
        { label: 'חשבונית INV-2311 · מחיר ליחידה', value: '‎47.65 ₪', state: 'alert' },
      ],
      finding: 'החשבונית גבוהה ב-1,240 ₪ מהמחיר שסוכם בהזמנה.',
      findingFacts: [
        { label: 'פער', value: '‎+1,240 ₪' },
        { label: 'קוד סיבה', value: 'מחיר מעל הזמנה' },
      ],
      summary: 'עליית מחיר של 19% נתפסה לפני האישור. ההחלטה אצלכם, עם הראיות.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'רואה חשבון רואה חשבוניות מאושרות בלבד. החשבונית תופיע אצלו רק אחרי טיפול ואישור.' },
      },
    },
    {
      id: 'receipt',
      chain: [
        { label: 'הזמנה 4131 · מגשי מאפה', value: '20', state: 'done' },
        { label: 'קבלת סחורה בפועל', value: '14', state: 'alert' },
        { label: 'חשבונית · חויבו', value: '20', state: 'alert' },
        { label: 'פער כמות · 6 מגשים', value: '‎342 ₪', state: 'alert' },
      ],
      finding: 'חויבתם על 6 מגשים שלא נקלטו בקבלה.',
      findingFacts: [
        { label: 'הוזמן / התקבל / חויב', value: '20 / 14 / 20' },
        { label: 'שווי הפער', value: '‎342 ₪' },
      ],
      summary: 'החשבונית נעצרה על פער כמות. משלמים על 14, או דורשים השלמה.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'רואה חשבון רואה חשבוניות מאושרות בלבד. החשבונית תופיע אצלו רק אחרי טיפול ואישור.' },
      },
    },
    {
      id: 'credit',
      chain: [
        { label: 'החזרת סחורה · משק דגן', value: '‎780 ₪', state: 'done' },
        { label: 'זיכוי הובטח', value: '✓', state: 'done' },
        { label: 'זיכוי התקבל בפועל', value: '✗', state: 'alert' },
        { label: 'ימים פתוחים', value: '18', state: 'await' as ChainState },
      ],
      finding: 'זיכוי של 780 ₪ פתוח כבר 18 ימים ולא נסגר.',
      findingFacts: [
        { label: 'סכום פתוח', value: '‎780 ₪' },
        { label: 'ותק', value: '18 ימים' },
      ],
      summary: 'הזיכוי לא נעלם: הוא רשום, פתוח, ומחכה לסגירה מול הספק.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'restricted', note: 'רכש רואה את סטטוס הזיכוי בהקשר ההזמנה, אך אינו מבצע מעברי זיכוי.' },
        accountant: { kind: 'full' },
      },
    },
    {
      id: 'payment',
      chain: [
        { label: 'חשבונית INV-2287 · אריזות הצפון', value: '‎3,150 ₪', state: 'await' as ChainState },
        { label: 'הזמנת רכש מקושרת', value: '✗', state: 'alert' },
        { label: 'דרישת תשלום', value: 'חסומה', state: 'alert' },
        { label: 'תשלום', value: 'לא בוצע', state: 'idle' },
      ],
      finding: 'החשבונית התקדמה בלי הזמנה מאחוריה, ולכן התשלום חסום.',
      findingFacts: [
        { label: 'סיבת חסימה', value: 'אין שרשרת מלאה' },
        { label: 'סכום מוחזק', value: '‎3,150 ₪' },
      ],
      summary: 'שום שקל לא יוצא בלי שרשרת מלאה: הזמנה, קבלה, חשבונית ואישור.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'רואה חשבון מבצע רק תשלום שמאחוריו דרישה מאושרת. הדרישה הזו חסומה, ולכן אינה זמינה לביצוע.' },
      },
    },
  ],
};

const en: FixtureSet = {
  approvedLabel: 'Approved',
  suppliers: { bakery: 'Gal Bakery', farm: 'Dagan Farm', packaging: 'North Packaging' },
  scenarios: [
    {
      id: 'price',
      chain: [
        { label: 'Price list · Cherry tomatoes', value: '₪39.90', state: 'done' },
        { label: 'Order 4127 · 160 crates', value: '₪6,384', state: 'done' },
        { label: 'Goods receipt · 160 crates', value: '✓', state: 'done' },
        { label: 'Invoice INV-2311 · unit price', value: '₪47.65', state: 'alert' },
      ],
      finding: 'The invoice is ₪1,240 above the price agreed on the order.',
      findingFacts: [
        { label: 'Gap', value: '+₪1,240' },
        { label: 'Reason code', value: 'Price above order' },
      ],
      summary: 'A 19% price increase was caught before approval. The decision is yours, with the evidence.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'The accountant sees approved invoices only. This invoice reaches them only after review and approval.' },
      },
    },
    {
      id: 'receipt',
      chain: [
        { label: 'Order 4131 · pastry trays', value: '20', state: 'done' },
        { label: 'Actually received', value: '14', state: 'alert' },
        { label: 'Invoice · billed', value: '20', state: 'alert' },
        { label: 'Quantity gap · 6 trays', value: '₪342', state: 'alert' },
      ],
      finding: 'You were billed for 6 trays that never arrived.',
      findingFacts: [
        { label: 'Ordered / received / billed', value: '20 / 14 / 20' },
        { label: 'Gap value', value: '₪342' },
      ],
      summary: 'The invoice stopped on a quantity gap. Pay for 14, or request the missing goods.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'The accountant sees approved invoices only. This invoice reaches them only after review and approval.' },
      },
    },
    {
      id: 'credit',
      chain: [
        { label: 'Goods returned · Dagan Farm', value: '₪780', state: 'done' },
        { label: 'Credit promised', value: '✓', state: 'done' },
        { label: 'Credit actually received', value: '✗', state: 'alert' },
        { label: 'Days open', value: '18', state: 'await' as ChainState },
      ],
      finding: 'A ₪780 credit has been open for 18 days without closing.',
      findingFacts: [
        { label: 'Open amount', value: '₪780' },
        { label: 'Age', value: '18 days' },
      ],
      summary: 'The credit does not disappear: it is recorded, open, and tracked until closed.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'restricted', note: 'Procurement sees credit status in the order context, but does not execute credit transfers.' },
        accountant: { kind: 'full' },
      },
    },
    {
      id: 'payment',
      chain: [
        { label: 'Invoice INV-2287 · North Packaging', value: '₪3,150', state: 'await' as ChainState },
        { label: 'Linked purchase order', value: '✗', state: 'alert' },
        { label: 'Payment request', value: 'Blocked', state: 'alert' },
        { label: 'Payment', value: 'Not executed', state: 'idle' },
      ],
      finding: 'The invoice moved forward with no order behind it, so payment is blocked.',
      findingFacts: [
        { label: 'Block reason', value: 'Incomplete chain' },
        { label: 'Amount held', value: '₪3,150' },
      ],
      summary: 'Not a shekel leaves without a full chain: order, receipt, invoice, approval.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'The accountant executes only payments backed by an approved request. This request is blocked, so it is not available.' },
      },
    },
  ],
};

const fr: FixtureSet = {
  approvedLabel: 'Approuvée',
  suppliers: { bakery: 'Boulangerie Gal', farm: 'Ferme Dagan', packaging: 'Emballages du Nord' },
  scenarios: [
    {
      id: 'price',
      chain: [
        { label: 'Tarif · Tomates cerises', value: '39,90 ₪', state: 'done' },
        { label: 'Commande 4127 · 160 cageots', value: '6 384 ₪', state: 'done' },
        { label: 'Réception · 160 cageots', value: '✓', state: 'done' },
        { label: 'Facture INV-2311 · prix unitaire', value: '47,65 ₪', state: 'alert' },
      ],
      finding: 'La facture dépasse de 1 240 ₪ le prix convenu sur la commande.',
      findingFacts: [
        { label: 'Écart', value: '+1 240 ₪' },
        { label: 'Code motif', value: 'Prix supérieur à la commande' },
      ],
      summary: 'Une hausse de prix de 19 % a été interceptée avant validation. La décision vous appartient, preuves à l’appui.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'Le comptable ne voit que les factures approuvées. Cette facture ne lui parviendra qu’après traitement et validation.' },
      },
    },
    {
      id: 'receipt',
      chain: [
        { label: 'Commande 4131 · plateaux de viennoiseries', value: '20', state: 'done' },
        { label: 'Réellement reçu', value: '14', state: 'alert' },
        { label: 'Facture · facturé', value: '20', state: 'alert' },
        { label: 'Écart de quantité · 6 plateaux', value: '342 ₪', state: 'alert' },
      ],
      finding: 'Vous avez été facturé pour 6 plateaux jamais reçus.',
      findingFacts: [
        { label: 'Commandé / reçu / facturé', value: '20 / 14 / 20' },
        { label: 'Valeur de l’écart', value: '342 ₪' },
      ],
      summary: 'La facture s’est arrêtée sur un écart de quantité. Payez 14, ou exigez le complément.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'Le comptable ne voit que les factures approuvées. Cette facture ne lui parviendra qu’après traitement et validation.' },
      },
    },
    {
      id: 'credit',
      chain: [
        { label: 'Marchandise retournée · Ferme Dagan', value: '780 ₪', state: 'done' },
        { label: 'Avoir promis', value: '✓', state: 'done' },
        { label: 'Avoir réellement reçu', value: '✗', state: 'alert' },
        { label: 'Jours ouverts', value: '18', state: 'await' as ChainState },
      ],
      finding: 'Un avoir de 780 ₪ est ouvert depuis 18 jours sans être soldé.',
      findingFacts: [
        { label: 'Montant ouvert', value: '780 ₪' },
        { label: 'Ancienneté', value: '18 jours' },
      ],
      summary: 'L’avoir ne disparaît pas : il est enregistré, ouvert, et suivi jusqu’à sa clôture.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'restricted', note: 'Les achats voient le statut de l’avoir dans le contexte de la commande, sans exécuter de transferts d’avoirs.' },
        accountant: { kind: 'full' },
      },
    },
    {
      id: 'payment',
      chain: [
        { label: 'Facture INV-2287 · Emballages du Nord', value: '3 150 ₪', state: 'await' as ChainState },
        { label: 'Commande d’achat liée', value: '✗', state: 'alert' },
        { label: 'Demande de paiement', value: 'Bloquée', state: 'alert' },
        { label: 'Paiement', value: 'Non exécuté', state: 'idle' },
      ],
      finding: 'La facture a avancé sans commande derrière elle, le paiement est donc bloqué.',
      findingFacts: [
        { label: 'Motif de blocage', value: 'Chaîne incomplète' },
        { label: 'Montant retenu', value: '3 150 ₪' },
      ],
      summary: 'Pas un shekel ne sort sans chaîne complète : commande, réception, facture, validation.',
      access: {
        owner: { kind: 'full' },
        office: { kind: 'full' },
        accountant: { kind: 'restricted', note: 'Le comptable n’exécute que les paiements adossés à une demande approuvée. Celle-ci est bloquée, donc indisponible.' },
      },
    },
  ],
};

const sets: Record<Locale, FixtureSet> = { he, en, fr };
export const getFixtures = (locale: Locale): FixtureSet => sets[locale];
