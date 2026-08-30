// Copy added after build 4 shipped, on the owner's instruction of 26.08.2026.
//
// It lives here and NOT in he.ts on purpose. scripts/gates/g2-content-parity
// diffs he.ts against archive/build3/i18n/he.js leaf by leaf, so that file is
// frozen at build 3's wording and any addition to it fails the build. The
// sections below are new copy for new sections; the guarantee G2 makes about
// the old copy is worth more than the convenience of one dictionary.
//
// NOTHING IN THIS FILE IS FLAGGED `placeholder: true` ANY MORE, and it took
// two supplies from the owner for that to be true. The logo wall was flagged
// until 26.08.2026, when he sent six real marks. The quotes were flagged until
// 30.08.2026, when he sent five real responses with names.
//
// The flag and its machinery stay in the build: scripts/gates/g15-placeholders
// asserts that any block flagged here renders a disclosure on the page, so the
// next thing that stands in for something the product does not have yet cannot
// reach the page quietly. Today nothing does.
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
  // Round thirteen, 30.08.2026, and the first one that is not writing. The
  // owner supplied responses from people using the system, with names, and they
  // are quoted here as he gave them, word for word, under the names he gave
  // them under: a first name and one letter of the surname.
  //
  // TWO SETS, THE SAME DAY. The first five said what the product had stopped
  // costing them. These five, sent hours later, say what they actually do in
  // it: the order split between suppliers, the previous price beside the
  // current one, the payment request that arrives already checked, the
  // documents landing in one place, the dashboard that answers what needs a
  // decision now. They run about 280 characters against the first set's 230,
  // and the card takes it, because the card measures itself (Voices.tsx).
  //
  // ONE MARK CHANGED, in two of the five. Both carried an em-dash, and the
  // house rule at the top of he.ts is that no em-dash appears in visible copy
  // on this page: Hebrew takes a colon, a comma, a period or parentheses
  // everywhere the dash was doing the work. Both are colons here. Not one word
  // moved, and nothing else in any of the five did either.
  //
  // What follows from these being real, and it is the whole of the change made
  // when the first set arrived:
  //
  //   1. `placeholder: true` is gone. It was true while these five were
  //      examples written in-house. A flag reading "invented" over five real
  //      people would be its own kind of false statement.
  //   2. The disclosure no longer disclaims authorship, because we did not
  //      write these. It says what the reader is looking at instead, and it
  //      still renders in the same slot, where g15 measures it.
  //   3. scripts/gates/g15-placeholders.mjs was rewritten with the first set.
  //      Two of its assertions had become the wrong assertion: that this block
  //      IS flagged, and that no quote carries a name. What it keeps is the
  //      machinery and the readability of the note.
  //   4. `Review` and `AggregateRating` schema stay absent. The reason moved
  //      and the answer did not; the note in src/entry-static.tsx says why.
  //
  // Nothing here was shortened, tidied or smoothed to fit.
  testimonials: {
    folioless: true,
    eyebrow: 'איך זה נשמע כשזה עובד',
    h2: 'חמישה משתמשים מספרים מה&nbsp;השתנה',
    disclosure:
      'התגובות כאן נמסרו על ידי משתמשים במערכת ומצוטטות כלשונן.',
    items: [
      {
        q: 'מה שתפס אותי הוא שאני לא חייב להוציא את כל ההזמנה לספק אחד. אני בוחר את המוצרים, והמערכת מראה לי איך אפשר לפצל אותם בין כמה ספקים, כמה יוצא אצל כל אחד ואיפה מינימום ההזמנה משנה את התמונה. גם כשאני מעדיף לרכז הכול אצל ספק אחד, אני רואה בדיוק כמה הנוחות הזאת עולה לי.',
        who: 'איתי ל׳',
        of: 'בעל מסעדה',
      },
      {
        q: 'פעם שינוי במחיר היה מתגלה רק בהזמנה הבאה או כשהחשבונית כבר הגיעה. היום אני רואה מחיר קודם מול מחיר נוכחי, מי העלה ומי הוריד, וגם כמה כל הצעה רחוקה מהמחיר הזול ביותר. זה נותן לי בסיס אמיתי לדבר עם הספק ולא לנהל משא ומתן לפי תחושת בטן.',
        who: 'שירה מ׳',
        of: 'מנהלת רכש',
      },
      {
        q: 'דרישות התשלום מגיעות אליי אחרי שכבר עברו בדיקה ואישור, עם החשבוניות והסכומים המשויכים אליהן. אני יכולה לראות אם קיים זיכוי שאפשר לקזז, לבצע את ההעברה ולהעלות אסמכתה בלי להתחיל לחפש מידע במיילים. אחר כך גם ההתאמה מול תנועת הבנק נשארת באותו תהליך.',
        who: 'רונית א׳',
        of: 'מנהלת חשבונות',
      },
      {
        q: 'אצלנו מסמכים מגיעים מכל כיוון: חשבוניות, תעודות משלוח וקבצים מספקים שונים. אני מעלה אותם למקום אחד ורואה מה המערכת הצליחה לזהות, מה כבר שויך ומה עדיין צריך שמישהו יעבור עליו. ביום עמוס זה חוסך הרבה זמן שפעם הלך על חיפוש קבצים והקלדה מחדש.',
        who: 'עומר ש׳',
        of: 'מנהל תפעול ברשת עסקים',
      },
      {
        q: 'אני לא נכנס למערכת כדי לעבור על כל הזמנה וחשבונית בנפרד. אני רוצה לדעת מה דורש החלטה עכשיו: כמה כסף עדיין פתוח, אילו תשלומים מתקרבים, איפה יש חריגה ומה עוד לא הותאם בבנק. הדשבורד נותן לי את התמונה הזאת בלי שאצטרך לבקש עדכון מכל אחד בעסק.',
        who: 'אלון כ׳',
        of: 'בעל עסק',
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
    // The saving badge on the billing control.
    //
    // IT DOES NOT MATCH THE CATALOGUE, AND THAT IS THE OWNER'S CALL OF
    // 28.08.2026. The yearly row in NIR-APP 0184 is TEN months of the monthly
    // one by construction: 690 against 828, 2,490 against 2,988, 4,490 against
    // 5,388. Every one of those is 16.67% off, and the badge says 30%. It read
    // "two months free" until this round, which is the same fact in the
    // catalogue's own words.
    //
    // The two ways to make it true are a change to the yearly prices in that
    // migration, or a badge that says 17%. Until one of them happens this line
    // is a claim the prices under it contradict; DEBT.md 24 carries it.
    //
    // The yearly billing line lost "12 months for the price of 10" in the same
    // move, because a card cannot print the real ratio one line under a badge
    // that disagrees with it.
    saveLabel: '30% הנחה',
    billedMonthly: 'חיוב חודשי',
    billedYearly: 'חיוב שנתי',
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

  // ------------------------------------------------- what each plan actually is
  // Round thirteen, 28.08.2026. Until now this page said the plans differ only in
  // the document count and that every capability is open on every one of them.
  // That was true of the catalogue as 0184 shipped it, and NIR-APP's 0213
  // migration reversed it: OPEN-DECISIONS #274 turned the boolean entitlements
  // into a ladder, and #276 gave a new Free organisation the Basic capability set
  // for its first thirty days.
  //
  // EVERY LINE BELOW IS READ OFF THAT MIGRATION, and off the two read models it
  // exposes to a browser rather than off the tables behind them:
  //
  //   get_public_plan_quotas()   documents.monthly, users.max, branches.max, and
  //                              nothing else. `storage.bytes` is an internal
  //                              safety ceiling (#200) and the OCR page dial
  //                              stopped being a number anyone is sold (0208,
  //                              #266), so neither is on this page.
  //   get_public_plan_features() the eleven published capability rows, in the
  //                              display order and with the public labels the
  //                              migration itself carries. The wording here is
  //                              those labels, not a paraphrase of them.
  //
  // `assistant_runs.monthly` is decided (0202: 20/40/100/250) and is deliberately
  // absent: 0210 has the assistant panel switched on by a pre-launch demo grant
  // that expires, and the provider gate is a DPA decision made outside the plan.
  // A quota for a feature whose availability is a window is not a plan promise.
  ladder: {
    compareLabel: 'מה כלול בכל מסלול',
    featuresHeader: 'יכולות',
    // The phone's way into the comparison, on the card itself. Below 640px the
    // table is not drawn at all: it is five columns and fifteen rows, and on a
    // 390px screen that was one visible column and a sideways scroll with
    // nothing saying it was there — the owner's note of 30.08.2026. Each card
    // opens its own plan's fifteen rows instead, with the same values.
    moreLabel: 'פרטים נוספים',
    // The value a cell carries when the capability is not on that plan, and the
    // one Business carries where a number would be.
    included: 'כלול',
    absent: 'לא כלול',
    contract: 'לפי חוזה',
    unlimited: 'ללא הגבלה',
    // Free does hold the five Basic capabilities, for thirty days from the first
    // email verification (#276). A cell that said only "not included" would be
    // wrong for a month, and one that said "included" would be wrong afterwards.
    introNote: 'המסלול החינמי כולל 20 מסמכים בחודש, משתמש אחד וסניף אחד, את השרשרת המלאה מרכש עד תשלום ואת שלושת התפקידים עם הפרדת סמכויות. בנוסף, ב־30 הימים הראשונים מרגע אימות המייל פתוחות בו גם חמש היכולות של מסלול בסיס: קריאה אוטומטית של מסמכים, היסטוריה מלאה, ייצוא Excel ודוחות לרו״ח, לוח ביצועי ספקים והתראות ואוטומציות במייל.',

    // WHICH ROWS EACH CARD PRINTS, by row key, in the order below.
    //
    // Owner, 28.08.2026: Pro, Premium and Business were saying almost the same
    // thing. They were: every card printed all fifteen rows, and the top three
    // carry between thirteen and fifteen of them, so three cards stood side by
    // side with the same fifteen lines and almost the same fifteen ticks.
    //
    // So the lists climb now, 5 / 8 / 11 / 13 / 15, and a card prints only what
    // its plan actually carries. Two rules decide what is dropped rather than a
    // pair of scissors:
    //
    //   NOTHING A PLAN DOES NOT CARRY. The struck-through lines are gone from
    //   the cards. A card says what a plan IS; the table under it is where an
    //   absence is stated, and it states every one of them.
    //
    //   NEVER ITS OWN RUNG. What a plan is bought FOR always prints. Pro keeps
    //   the bank, the accountant queue and the consolidated invoices; Premium
    //   keeps the integrations and the extended support; Business keeps
    //   everything, because "everything" is what Business is. What gives way in
    //   the middle of the ladder is the tier below it, which the card above has
    //   already shown and the table repeats in full.
    //
    // The keys are the row keys, so they are the same in every language and the
    // English dictionary reads this array rather than restating it.
    cardRows: [
      ['documents', 'users', 'branches', 'chain', 'roles'],
      ['documents', 'users', 'branches', 'chain', 'roles', 'automation', 'history', 'export'],
      [
        'documents', 'users', 'branches', 'chain', 'roles',
        'automation', 'history', 'export',
        'bank', 'payments', 'invoices',
      ],
      [
        'documents', 'users', 'branches', 'chain', 'roles',
        'automation', 'history', 'export',
        'bank', 'payments', 'invoices',
        'api', 'support',
      ],
      [
        'documents', 'users', 'branches', 'chain', 'roles',
        'automation', 'history', 'export', 'reports', 'mail',
        'bank', 'payments', 'invoices',
        'api', 'support',
      ],
    ],

    // Every card prints THESE rows, all of them, in this order, with a rule
    // through the ones its plan does not carry (owner, 28.08.2026). One list
    // and one order for the cards and for the table under them: a card that
    // showed only its own wins made five cards impossible to read against each
    // other, which is the one thing a price table is for.
    //
    // The first two are not entitlements and never move: they are what the
    // product IS, and they are on this page already (chapter 01 and the FAQ).
    // The rest are the ladder, in the migration's own display order.
    rows: [
      {
        icon: 'documents',
        label: 'מסמכים בחודש',
        cells: ['20', '40', '150', '375', 'לפי חוזה'],
      },
      {
        icon: 'users',
        label: 'משתמשים פעילים',
        cells: ['1', '5', '15', '30', 'ללא הגבלה'],
      },
      {
        icon: 'branches',
        label: 'סניפים',
        cells: ['1', '1', '1', '10', 'ללא הגבלה'],
      },
      {
        icon: 'chain',
        label: 'שרשרת מלאה מרכש עד תשלום',
        cells: [true, true, true, true, true],
      },
      {
        icon: 'roles',
        label: 'שלושה תפקידים והפרדת סמכויות',
        cells: [true, true, true, true, true],
      },
      {
        icon: 'automation',
        label: 'קריאה אוטומטית של מסמכים',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'history',
        label: 'היסטוריה מלאה',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'export',
        label: 'ייצוא Excel ודוחות לרו״ח',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'reports',
        label: 'לוח ביצועי ספקים',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'mail',
        label: 'התראות ואוטומציות במייל',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'bank',
        label: 'התאמות בנק',
        cells: [false, false, true, true, true],
      },
      {
        icon: 'payments',
        label: 'תור תשלומים לרואה החשבון',
        cells: [false, false, true, true, true],
      },
      {
        icon: 'invoices',
        label: 'חשבוניות מרכזות',
        cells: [false, false, true, true, true],
      },
      {
        icon: 'api',
        label: 'חיבור למערכות אחרות',
        cells: [false, false, false, true, true],
      },
      {
        icon: 'support',
        label: 'תמיכה מורחבת',
        cells: [false, false, false, true, true],
      },
    ],
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
  // The wording the top bar uses, which is not the wording the footer uses.
  // A pill in a fixed row has one line; the footer has a column and can afford
  // a sentence. Hebrew reads short either way, English does not.
  folioNav: [
    { t: 'מה המערכת עושה', href: '#what' },
    { t: 'למה דווקא זה', href: '#why' },
    { t: 'שאלות נפוצות', href: '#faq' },
    { t: 'מסלולים', href: '#plans' },
  ],

  // The heading over the supporting pages in the colophon. Rendered only where
  // those pages exist in the reader's language; see App.tsx.
  moreLabel: 'להעמיק',

  languages: {
    label: 'שפה',
    menuLabel: 'תרגום העמוד',
    currentLabel: 'השפה הנוכחית',
    options: {
      he: { label: 'עברית', href: '/', dir: 'rtl' },
      en: { label: 'English', href: '/en/', dir: 'ltr' },
    },
  },

  /* The two states of the light/dark switch, written as the ACTION the button
     performs rather than as the state it is in: a screen reader announces the
     label on focus, and "dark view" on a dark page tells you nothing. */
  theme: {
    toLight: 'מעבר לתצוגה בהירה',
    toDark: 'מעבר לתצוגה כהה',
  },

  /* The phone folio, 28.08.2026. Below 1024px the chapter list is not in the
     running head, and until this round there was no other way to reach a
     chapter from a phone at all. The trigger says what it opens; the panel
     carries its own name because it is a menu, not a region. */
  folioMenu: {
    open: 'תפריט',
    close: 'סגירת התפריט',
    label: 'פרקי העמוד',
  },

  /* Chapter 02's hint, for a reader who has no pointer.
     `what.demoHint` in he.ts says the reader can press the navigation drawn
     inside the screen — and below 768px that layer is `display: none`, because
     a finger landing on one of those boxes would jump to another station
     instead of opening the screen it pressed. So on those widths the page was
     promising an interaction it had deliberately removed, in both editions.
     The sentence that replaces it there is the one that IS true: the picture
     opens. It lives here and not in he.ts because that file is build 3's copy
     and G2 fails on a key added to it. */
  demoTouchHint: 'לחיצה על המסך פותחת אותו בגודל מלא.',

  accessibility: {
    screenAltSuffix: 'מסך מתוך InPlace',
    dashboardAlt: 'מרכז הבקרה של InPlace, מסך מלא מתוך המערכת',
    nextTestimonial: 'הציטוט הבא',
    previousTestimonial: 'הציטוט הקודם',
    /* Chapter 02's screens are 2000px wide and a phone draws them at 344.
       Their type lands under 3px there, so on a phone the picture is a
       control that opens the real one. */
    zoomScreen: 'הגדלת המסך',
    closeScreen: 'סגירת המסך',
  },
}
