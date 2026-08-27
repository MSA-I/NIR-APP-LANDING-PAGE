// Copy added after build 4 shipped, on the owner's instruction of 26.08.2026.
//
// It lives here and NOT in he.ts on purpose. scripts/gates/g2-content-parity
// diffs he.ts against archive/build3/i18n/he.js leaf by leaf, so that file is
// frozen at build 3's wording and any addition to it fails the build. The
// sections below are new copy for new sections; the guarantee G2 makes about
// the old copy is worth more than the convenience of one dictionary.
//
// ONE BLOCK IS MARKED `placeholder: true` BELOW: `testimonials`. Five quotes
// written as examples of what the product does, attributed to a ROLE and a
// KIND of business, never to a named person or a named company.
//
// It is not a claim that anyone said anything. The product has not launched
// and has no customers to quote, so the section says so in its own lede rather
// than inventing five people. scripts/gates/g15-placeholders.mjs asserts that
// every block flagged here renders its disclosure on the page, so the flag
// cannot be dropped quietly and leave five invented quotes reading as real.
//
// The logo wall WAS flagged and is not any more: on 26.08.2026 the owner
// supplied six real marks, and a disclosure under real logos would be a
// stranger claim than none.
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
  // The placeholders are gone: these are the marks the owner supplied, keyed
  // and tinted by scripts/build-logos.py. The sources are their own brand
  // assets and are not committed here.
  //
  // Six on 26.08.2026, and six again after 27.08.2026, when the owner took Xel
  // Extreme Linen off the wall and put Spring Footwear on it. The `w` and `h`
  // are the built file's own pixels, printed by the build script; they are what
  // reserves the box before the picture arrives.
  logos: {
    eyebrow: 'עובדים איתנו',
    h2: 'עסקים שמריצים את הרכש&nbsp;שלהם כאן.',
    items: [
      { src: 'assets/logos/falafel.webp', name: 'פלאפל בתחנה', w: 80, h: 80 },
      { src: 'assets/logos/adir.webp', name: 'Adir Contracting', w: 283, h: 60 },
      { src: 'assets/logos/gamos.webp', name: 'GAMOS אירועים', w: 68, h: 74 },
      { src: 'assets/logos/nir.webp', name: 'NIR Estate', w: 177, h: 60 },
      { src: 'assets/logos/priscilla.webp', name: 'פרסיליה', w: 145, h: 60 },
      { src: 'assets/logos/spring.webp', name: 'Spring Footwear', w: 191, h: 60 },
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
    // Round twelve, 27.08.2026. All five were rewritten; the section moved below
    // the prices. It briefly went down to three and the owner put it back to
    // five the same day, so the count here is his and the writing is the work.
    //
    // What was wrong with the old five is the problem a disclosure cannot fix:
    // every one of them was a clean, complete, on-message sentence, which is the
    // one thing people do not sound like. A written example that reads as
    // marketing copy makes the disclosure above it look like an excuse.
    //
    // What changed in the writing, and nothing else did: each one now carries a
    // detail that serves no argument (the driver still standing there, the note
    // remembered on Thursday, the ten minutes of scrolling that found nothing),
    // and two of them admit that the thing they praise was irritating before it
    // was reassuring. No new capability is claimed in any of them; every
    // behaviour described is on this page already.
    items: [
      {
        q: 'פעם הייתי מגלה את הפער בסוף החודש, כשכבר שילמתי. עכשיו החשבונית נתקעת לי לפני התשלום ואני צריך להחליט מה עושים איתה. ברגע הראשון זה מעצבן. אחר כך זה בדיוק מה שרציתי.',
        who: 'בעלים',
        of: 'מסעדה עם שני סניפים',
      },
      {
        q: 'כל הזמנה יוצאת עם מספר ועם מחירון. פעם הייתי גולל בוואטסאפ עשר דקות כדי להיזכר מה בדיוק סוכם, ובחצי מהפעמים גם לא מצאתי.',
        who: 'מנהל רכש',
        of: 'רשת בתי קפה',
      },
      {
        q: 'אני מסמנת מה הגיע מהטלפון, ליד דלת הקבלה, כשהנהג עוד עומד שם. פעם זה היה פתק בכיס שנזכרתי בו ביום חמישי.',
        who: 'מנהלת תפעול',
        of: 'מטבח מרכזי',
      },
      {
        q: 'מגיעות אליי רק חשבוניות שאושרו. אני משלם, מעלה אסמכתה, וזהו. מה שלא אושר לא מגיע אליי בכלל, וזה חסך לי בעיקר טלפונים.',
        who: 'רואה חשבון',
        of: 'משרד חיצוני',
      },
      {
        q: 'מה שהכי שינה זה שאני מאשר ומישהו אחר מעביר. בהתחלה הרגיז אותי שאין דרך לעקוף כשדחוף. היום זה הדבר שאני הכי סומך עליו.',
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
    perMonth: 'לחודש',
    perYear: 'לשנה',
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

  // ------------------------------------------------- the plan cards' own asks
  // Round twelve, 27.08.2026. Until now every card carried `t.ctaPrimary`,
  // which meant the card priced "בשיחה" offered "פתיחת חשבון חינם" and pointed
  // at /signup. The largest customer on the page was the one whose button did
  // not do what it said.
  //
  // The card picks its ask from its own PRICE, not from its index, so a change
  // to the catalogue cannot quietly put the signup button back on a plan that
  // has no self-serve path.
  plansCta: {
    free: 'להתחיל חינם',
    paid: 'להתחיל במסלול הזה',
    contact: 'לדבר איתנו',
    contactHref: '#contact',
  },

  // -------------------------------------------------------------- the eighth
  // The seven questions in he.ts are frozen by G2, and a NEW leaf in that file
  // fails the gate outright rather than being allowlistable. So the eighth
  // question lives here.
  //
  // It is the onboarding objection, which is the most common one in B2B and the
  // only one the seven did not answer. The answer is the owner's, given
  // 27.08.2026: it works immediately, from the first document. Both halves of
  // it are already claimed elsewhere on this page (the close chapter's "המערכת
  // רצה על הנתונים שלך מהמסמך הראשון שתעלה" and the fineprint's "אפשר להתחיל
  // מספק אחד"), so nothing new is promised here.
  faqExtra: {
    items: [
      {
        q: 'כמה זמן לוקח עד שהמערכת עובדת על העסק שלי?',
        a: 'מיד. אין שלב הקמה שצריך לעבור לפניו: פותחים חשבון, מעלים את המסמך הראשון, והמערכת עובדת עליו. אפשר להתחיל מספק אחד ולהוסיף את השאר תוך כדי עבודה.',
      },
    ],
  },

  // ------------------------------------------------------------------ contact
  // The destination of the ביזנס card. Anatomy from 21st.dev's contact form
  // (@meschacirung, Tailark): a labelled two-column top row, a full-width
  // subject line, a message area, one submit. Repainted on this page's own
  // vocabulary rather than imported, exactly as the flow button, the plan
  // cards, the FAQ panels and the colophon were, because the catalogue version
  // is built on shadcn primitives this project does not have and should not
  // acquire for one form.
  //
  // ENDPOINT: `action` is where a submission actually goes, and it is the one
  // thing on this page that cannot be verified from the repository. The owner
  // named the support mailbox on 27.08.2026. If it ever stops being monitored,
  // this form drops enquiries in silence, which is worse than the button it
  // replaced, so it is worth a look whenever the address changes.
  contact: {
    eyebrow: 'מסלול ביזנס',
    h2: 'ארגון עם מכסות והסדר&nbsp;משלו',
    lede: 'המסלול הזה נבנה מול העסק ולא נרכש מהמדף. השאירו פרטים ונחזור אליכם עם הצעה שמתאימה לכמות המסמכים ולמבנה ההרשאות שלכם.',
    action: 'mailto:support@inplace.digital',
    fields: {
      name: 'שם מלא',
      business: 'שם העסק',
      email: 'אימייל',
      phone: 'טלפון',
      message: 'מה חשוב שנדע לפני השיחה?',
      messageHint: 'כמה סניפים, כמה ספקים קבועים, ומי אמור לעבוד במערכת.',
    },
    submit: 'שליחה',
    fineprint: 'הפרטים משמשים אותנו רק כדי לחזור אליכם. אין כאן רשימת דיוור.',
    optional: 'לא חובה',
  },

  // ---------------------------------------------------------- locale control
  languages: {
    label: 'שפה',
    menuLabel: 'תרגום העמוד',
    currentLabel: 'השפה הנוכחית',
    options: {
      he: { label: 'עברית', short: 'HE', href: '/', dir: 'rtl' },
      en: { label: 'English', short: 'EN', href: '/en/', dir: 'ltr' },
    },
  },

  /* The two states of the light/dark switch, written as the ACTION the button
     performs rather than as the state it is in: a screen reader announces the
     label on focus, and "dark view" on a dark page tells you nothing. */
  theme: {
    toLight: 'מעבר לתצוגה בהירה',
    toDark: 'מעבר לתצוגה כהה',
  },

  accessibility: {
    screenAltSuffix: 'מסך מתוך InPlace',
    dashboardAlt: 'מרכז הבקרה של InPlace, מסך מלא מתוך המערכת',
    nextTestimonial: 'הציטוט הבא',
    previousTestimonial: 'הציטוט הקודם',
  },
}
