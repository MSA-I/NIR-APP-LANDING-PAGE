// The two people who made this.
//
// WHY THIS FILE EXISTS
// The AEO audit of 28.08.2026 asked a question the five SEO audits do not:
// not whether an answer engine can read this page, which is settled and gated,
// but whether it would cite it. One of the things it weighs is who is speaking.
// Until now the answer on this site was "In Place, a registered business", with
// a registration number and an address. That is an entity, not a person, and
// experience and expertise are properties of people. In a subject that is about
// other people's money, every engine weighs that harder than it does elsewhere.
//
// WHY NOT IN pages.ts
// Two documents need these names and neither may drift from the other: the
// about page prints them, and both structured-data generators declare them --
// src/entry-static.tsx as the Organization's founders, src/lib/page-html.ts as
// the author of the six professional pages. One file, read by all three.
//
// WHERE THE FACTS COME FROM
// Nir's biography is his own answer of 28.08.2026, condensed but not embellished:
// the twenty years, the chain in food, and the sentence that the idea came out
// of the work rather than out of market research are all his. Moshe's is his own
// words of the same day, carried as written. The owner confirmed the spelling of
// both names.
//
// Both biographies name the product, and that is deliberate rather than tidy.
// Moshe's said InPlace from the first draft and Nir's did not, which left the
// man who conceived it as the only one of the two never named beside it. It
// matters twice over: on the page the two paragraphs now read as a pair, and in
// the graph each Person's `description` states the relation to the entity in the
// same sentence as the person, which is the join an answer engine is looking for.
//
// WHAT IS DELIBERATELY ABSENT
// `sameAs`. Neither person's profile is published here, by the owner's decision
// of 28.08.2026: the only external profile this site carries is the company's
// own. That profile exists as of 31.08.2026 and the Organization node declares
// it, in src/entry-static.tsx and src/lib/page-html.ts; DEBT.md item 21 closed
// with it. Nothing changes here, because the decision was never about the
// company page being missing -- it was that a personal profile identifies a
// person while the field in question identifies a company. A Person node with no
// `sameAs` is still worth declaring: it names who is speaking, which is the part
// that was missing, and it says nothing that is not true.

import type { LocaleCode } from './locales'

export type Person = {
  /**
   * The name, in two halves.
   *
   * 21st.dev's team-member-card sets the given name in extralight and the family
   * name in regular on the line below it, so the card needs the two separately.
   * Everything else needs them joined, and `fullName` below is the only place
   * that joins them, so the printed name and the declared one cannot drift.
   */
  given: string
  family: string
  jobTitle: string
  /**
   * The paragraphs under the name on the about page.
   *
   * A list rather than one string since 28.08.2026, when the owner supplied
   * Nir's in three. The graph takes one string and joins them with a space; the
   * page prints one paragraph each.
   *
   * Empty for a person whose biography has not been supplied yet, and the page
   * then prints the name and the role alone rather than a sentence with a hole
   * in it. A short true line beats a long one that waits.
   */
  bio: string[]
  /**
   * The portrait, without an extension.
   *
   * scripts/build-portraits.mjs writes `<slug>.webp` and `<slug>.avif` at
   * 720x1000 into public/assets, which is twice the card's 360x500 frame. One
   * size, because the frame does not change with the viewport: there is no
   * ladder to pick from.
   *
   * The `alt` is deliberately not written here. A portrait beside the name it
   * belongs to is decoration for a screen reader that has just read the name,
   * so src/lib/page-html.ts marks it `alt=""` rather than reading the name out
   * a second time.
   */
  portrait?: string
}

/** The two halves, joined. The only place they are, so nothing can drift. */
export const fullName = (p: Person) => `${p.given} ${p.family}`

export type People = {
  /** The subject-matter expert. He is the `author` of the six professional pages. */
  nir: Person
  /** The one who built it. */
  moshe: Person
  /** The line that introduces the pair, above their two paragraphs. */
  intro: string
  /** The credit under every professional page. `{expert}` and `{builder}` are the two names. */
  credit: string
}

const he: People = {
  intro:
    'InPlace נבנתה בידי שני אנשים, לא בידי מחלקת מוצר. ניר ברמוחה הביא את הבעיה, ומשה סננס בנה את המערכת שפותרת אותה.',
  nir: {
    given: 'ניר',
    family: 'ברמוחה',
    jobTitle: 'מייסד',
    // The owner's text of 28.08.2026, carried word for word.
    //
    // Two things in it were flagged rather than corrected, because a biography
    // is the one kind of copy where somebody else's wording is the whole point.
    // He then ruled on both the same day: the full stop at the end is his, added
    // on his instruction, and the dash in the third paragraph stays, although
    // he.ts asks for a colon or a comma in Hebrew. The house rule loses to the
    // author here, and that is worth writing down so the next reader does not
    // "fix" it.
    bio: [
      'מעל עשרים שנות ניסיון בעולם העסקים והתפעול, בישראל ובחו״ל. כיום עוסק בניהול עסקים, בהם רשת בתחום המזון, ומכיר מקרוב את העבודה היומיומית מול ספקים, הזמנות, מלאי, עובדים, תשלומים וחשבוניות.',
      'מתוך הניסיון הזה נולד הרעיון להקים את InPlace. לא בעקבות מחקר שוק תיאורטי, אלא מתוך צורך אמיתי שעלה מהשטח: לעשות סדר בתהליכים שבעסקים רבים עדיין מתנהלים באמצעות וואטסאפ, קבצי אקסל, שיחות טלפון ובדיקות ידניות.',
      'גם התוכן המקצועי באתר נכתב מאותה נקודת מבט — מתוך ניסיון מעשי, היכרות עם האתגרים היומיומיים והבנה של הדרך שבה עסקים באמת מתנהלים.',
    ],
    portrait: 'portrait-nir',
  },
  moshe: {
    given: 'משה',
    family: 'סננס',
    jobTitle: 'מייסד',
    // His own words, supplied 28.08.2026, carried as written. The name and the
    // role that opened them are stripped because the template prints those.
    bio: [
      'שלוש שנים בבניית מערכות שמחברות בין נתונים, אוטומציה ותהליכים עסקיים, שבהן דיוק ובקרה הם חלק מהפעולה עצמה. הניסיון הזה הוביל לעיקרון שעליו InPlace בנויה: לא לגלות בדוח אחרי שהתשלום יצא שמשהו היה לא נכון, אלא לזהות את החריגה ולעצור אותה לפני שהכסף יוצא.',
    ],
    portrait: 'portrait-moshe',
  },
  credit: 'נכתב על סמך הניסיון של {expert}, מייסד InPlace. המערכת נבנתה בידי {builder}.',
}

const en: People = {
  intro:
    'InPlace was built by two people, not by a product department. Nir Barmuha brought the problem, and Moshe Sananes built the system that solves it.',
  nir: {
    given: 'Nir',
    family: 'Barmuha',
    jobTitle: 'Founder',
    // A translation of the Hebrew above rather than a second original.
    bio: [
      'More than twenty years of experience in business and operations, in Israel and abroad. He runs businesses today, among them a chain in food, and knows at first hand the daily work with suppliers, orders, stock, staff, payments and invoices.',
      'The idea of founding InPlace came out of that experience. Not out of theoretical market research, but out of a real need that came off the ground: to put order into processes that in many businesses still run on WhatsApp, on spreadsheet files, on telephone calls and on manual checks.',
      'The professional content on this site is written from that same point of view: out of practical experience, out of familiarity with the daily difficulties, and out of an understanding of how businesses actually run.',
    ],
    portrait: 'portrait-nir',
  },
  moshe: {
    given: 'Moshe',
    family: 'Sananes',
    jobTitle: 'Founder',
    bio: [
      'Three years building systems that join data, automation and business processes, in which accuracy and control are part of the operation itself. That experience led to the principle InPlace is built on: not to find out from a report, after the payment has gone out, that something was wrong, but to identify the exception and stop it before the money leaves.',
    ],
    portrait: 'portrait-moshe',
  },
  credit:
    'Written on the experience of {expert}, founder of InPlace. The system was built by {builder}.',
}

export const peopleByLocale: Record<LocaleCode, People> = { he, en }

export default he
