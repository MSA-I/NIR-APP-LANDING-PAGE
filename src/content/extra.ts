// Copy added after build 4 shipped, on the owner's instruction of 26.08.2026.
//
// It lives here and NOT in he.ts on purpose. scripts/gates/g2-content-parity
// diffs he.ts against archive/build3/i18n/he.js leaf by leaf, so that file is
// frozen at build 3's wording and any addition to it fails the build. The
// sections below are new copy for new sections; the guarantee G2 makes about
// the old copy is worth more than the convenience of one dictionary.
//
// TWO PLACEHOLDER BLOCKS ARE MARKED `placeholder: true` BELOW.
//
//   `logos`        five marks standing in for the first customers.
//   `testimonials` five quotes written as examples of what the product does,
//                  attributed to a ROLE and a KIND of business, never to a
//                  named person or a named company.
//
// Neither is a claim that anyone said anything. The product has not launched
// and has no customers to quote, so the section says so in its own lede rather
// than inventing five people. scripts/gates/g15-placeholders.mjs asserts that
// every block flagged here renders its disclosure on the page, so the flag
// cannot be dropped quietly and leave five invented quotes reading as real.
//
// No em-dash in visible copy, per the house rule in he.ts.

export default {
  // ------------------------------------------------------------- announcement
  announce: {
    // The one true new thing on this page: the launch catalogue is published.
    text: 'המחירים לשלב ההשקה פורסמו. אפשר להתחיל מהמסלול החינמי.',
    linkLabel: 'למסלולים',
    href: '#plans',
    dismissLabel: 'סגירת ההודעה',
  },

  // ----------------------------------------------------------------- logo wall
  logos: {
    placeholder: true,
    eyebrow: 'העסקים הראשונים',
    h2: 'כאן יעמדו הלוגואים של העסקים שעובדים&nbsp;עם InPlace.',
    // Shown on the page, not only in this file. See the note at the top.
    disclosure: 'מקומות שמורים. יוחלפו בלוגואים אמיתיים לפני שהדף עולה לאוויר.',
    // Five slots, per the owner's instruction. The mark is drawn from the
    // slot's own initials so the wall reads as five different companies
    // rather than five copies of one grey box.
    items: [
      { mark: 'א', name: 'מסעדה' },
      { mark: 'ב', name: 'רשת בתי קפה' },
      { mark: 'ג', name: 'מטבח מרכזי' },
      { mark: 'ד', name: 'קייטרינג' },
      { mark: 'ה', name: 'מאפייה' },
    ],
  },

  // --------------------------------------------------------------- what people
  testimonials: {
    placeholder: true,
    folioless: true,
    eyebrow: 'איך זה נשמע כשזה עובד',
    h2: 'חמש דוגמאות למה שהמערכת&nbsp;משנה',
    disclosure:
      'הציטוטים כאן הם דוגמאות ניסוח שנכתבו על ידינו, לא לקוחות. כל אחד מהם מתאר התנהגות שקיימת במערכת היום. הם יוחלפו בהמלצות אמיתיות אחרי ההשקה.',
    items: [
      {
        q: 'פעם גיליתי את הפער בסוף החודש, כשכבר שילמתי. עכשיו החשבונית נעצרת לפני התשלום, ואני מחליט מה קורה איתה.',
        who: 'בעלים',
        of: 'מסעדה עם שני סניפים',
      },
      {
        q: 'כל הזמנה יוצאת עם מספר ועם מחירון. אין יותר לגלול אחורה בוואטסאפ כדי לזכור מה בדיוק סוכם.',
        who: 'מנהל רכש',
        of: 'רשת בתי קפה',
      },
      {
        q: 'קבלת הסחורה נעשית מהטלפון, ליד דלת הקבלה. מה שחסר מסומן שם ולא שבוע אחרי.',
        who: 'מנהלת תפעול',
        of: 'מטבח מרכזי',
      },
      {
        q: 'אני רואה רק חשבוניות מאושרות, מבצע את התשלום ומעלה אסמכתה. מה שלא אושר פשוט לא מגיע אליי.',
        who: 'רואה חשבון',
        of: 'משרד חיצוני',
      },
      {
        q: 'הדבר שהכי שינה זה הפרדת הסמכויות. אני מאשר, מישהו אחר מעביר. אין מסלול עוקף גם כשדחוף.',
        who: 'בעלים',
        of: 'עסק מזון',
      },
    ],
  },

  // ------------------------------------------------------------ plans, round 8
  // The figures themselves stay in he.ts. These are the words the billing
  // switch needs, which build 3 never had because build 3 had no switch.
  billing: {
    monthlyLabel: 'חודשי',
    yearlyLabel: 'שנתי',
    switchLabel: 'מעבר בין מחיר חודשי למחיר שנתי',
    perMonth: 'לחודש, לפני מע״מ',
    perYear: 'לשנה, לפני מע״מ',
    save: 'חודשיים במתנה',
    docsLabel: 'מסמכים בחודש',
    // The catalogue component badges one card "Recommended". Build 4 dropped
    // that badge because "popular" is a claim about other customers, which
    // this page has no way to support. "מומלץ" is the vendor pointing at a
    // plan, which any vendor may do, so the badge comes back with the word
    // changed rather than the anatomy removed.
    recommendedLabel: 'מומלץ',
    // The catalogue's "Highlights" list. Identical in every card on purpose:
    // the chapter's own lede says the plans differ only in the document
    // count. Each line is lifted from he.ts (`why.yes`), not invented here.
    everywhereLabel: 'פתוח בכל מסלול',
    everywhere: [
      'שרשרת מלאה: ספק, הזמנה, קבלה, חשבונית, תשלום',
      'שלושה תפקידים והפרדת סמכויות',
      'תיעוד לכל פעולה כספית רגישה',
    ],
    // The yearly catalogue, verified against NIR-APP migration 0184 lines
    // 234-241 exactly like the monthly one in he.ts. Free carries no figure
    // and Business carries no figure, by decisions #201 and the free tier's
    // own wording.
    yearly: ['ללא עלות', '690 ₪', '2,490 ₪', '4,490 ₪', 'בשיחה'],
  },
}
