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
// of the work rather than out of market research are all his. The owner
// confirmed the spelling of both names on the same day.
//
// WHAT IS DELIBERATELY ABSENT
// `sameAs`. Neither person's profile is published here, by the owner's decision
// of 28.08.2026: the only external profile this site will carry is the company's
// own, and it does not exist yet. DEBT.md item 21 holds that. A Person node with
// no `sameAs` is still worth declaring -- it names who is speaking, which is the
// part that was missing -- and it says nothing that is not true.

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
   * The paragraph under the name on the about page.
   *
   * Empty for a person whose biography has not been supplied yet, and the page
   * then prints the name and the role alone rather than a sentence with a hole
   * in it. A short true line beats a long one that waits.
   */
  bio: string
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
    bio:
      'מעל עשרים שנה בעולם העסקים והתפעול, בישראל ובחוץ לארץ. הקים וניהל עסקים, ובהם רשת בתחום המזון, ועבד יום־יום מול ספקים, הזמנות, מלאי, עובדים, תשלומים וחשבוניות. הרעיון למערכת לא נולד ממחקר שוק אלא מהעבודה עצמה: הצורך לעשות סדר בתהליכים שבהרבה עסקים עדיין מתנהלים בוואטסאפ, באקסלים, בטלפון ובבדיקה ידנית. מה שכתוב בעמודים המקצועיים באתר הזה מגיע מהשטח הזה.',
    portrait: 'portrait-nir',
  },
  moshe: {
    given: 'משה',
    family: 'סננס',
    jobTitle: 'מייסד',
    // His own words, supplied 28.08.2026, carried as written. The name and the
    // role that opened them are stripped because the template prints those.
    bio:
      'שלוש שנים בבניית מערכות שמחברות בין נתונים, אוטומציה ותהליכים עסקיים, שבהן דיוק ובקרה הם חלק מהפעולה עצמה. הניסיון הזה הוביל לעיקרון שעליו InPlace בנויה: לא לגלות בדוח אחרי שהתשלום יצא שמשהו היה לא נכון, אלא לזהות את החריגה ולעצור אותה לפני שהכסף יוצא.',
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
    bio:
      'More than twenty years in business and operations, in Israel and abroad. He has founded and run businesses, among them a chain in food, and worked day to day with suppliers, orders, stock, staff, payments and invoices. The idea for the system did not come out of market research. It came out of the work itself: the need to put order into processes that in many businesses still run on WhatsApp, on spreadsheets, on the telephone and on a manual check. What is written on the professional pages of this site comes from that ground.',
    portrait: 'portrait-nir',
  },
  moshe: {
    given: 'Moshe',
    family: 'Sananes',
    jobTitle: 'Founder',
    bio:
      'Three years building systems that join data, automation and business processes, in which accuracy and control are part of the operation itself. That experience led to the principle InPlace is built on: not to find out from a report, after the payment has gone out, that something was wrong, but to identify the exception and stop it before the money leaves.',
    portrait: 'portrait-moshe',
  },
  credit:
    'Written on the experience of {expert}, founder of InPlace. The system was built by {builder}.',
}

export const peopleByLocale: Record<LocaleCode, People> = { he, en }

export default he
