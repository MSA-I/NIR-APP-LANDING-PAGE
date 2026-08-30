import extraHe from './extra'

const extraEn = {
  announce: {
    text: 'Launch pricing is now published. Start on the free plan.',
    linkLabel: 'See plans',
    href: '#plans',
    dismissLabel: 'Dismiss announcement',
  },

  logos: {
    eyebrow: 'Working with us',
    h2: 'Businesses running procurement&nbsp;here.',
    items: extraHe.logos.items,
  },

  // Retranslated 30.08.2026, because the Hebrew stopped being ours to write.
  // These five are the owner's five real responses, translated sentence for
  // sentence and cut nowhere. The names are transliterated and keep the same
  // one-letter surname the Hebrew carries; the roles are the roles he gave.
  //
  // The disclosure changed with them: it used to say we wrote these, which was
  // true when we did.
  testimonials: {
    folioless: true,
    eyebrow: 'What the change sounds like',
    h2: 'Five users on what&nbsp;changed',
    disclosure:
      'These responses were given to us by people using the system, and are quoted as they were given. Surnames appear as a single letter, in the form we received them.',
    items: [
      {
        q: 'Before InPlace the invoices, the price lists and the orders were scattered between email, WhatsApp and the binders. Today I can see in one place what I ordered, what arrived and what the supplier is asking to be paid for. On the first check alone we found a few gaps that would probably have gone past us before.',
        who: 'Itai L.',
        of: 'Restaurant owner',
      },
      {
        q: 'The part that helps me most is not having to remember by heart where every order stands. I can see whether it went out, what was received and what does not match the invoice. It does not replace my work, but it takes a lot of searching and manual checking out of it.',
        who: 'Shira M.',
        of: 'Procurement manager',
      },
      {
        q: 'I used to receive partial documents and chase the missing ones as the payment came due. Now the documents and the gaps are in order before they reach me, and I can look only at the cases that really need checking. The process with the business and with the suppliers became much clearer.',
        who: 'Ronit A.',
        of: 'Bookkeeper',
      },
      {
        q: 'With several locations it is hard to know whether what we were charged for really matches what arrived at each one. In InPlace you can follow the order, the receipt and the invoice in the same process. When something is short or the price is different, you do not have to start digging through old messages to work out what happened.',
        who: 'Omer S.',
        of: 'Operations manager, business group',
      },
      {
        q: 'I was not looking for another system with dozens of screens, I was looking for a simple way to control the money going out to suppliers. Today I see what is waiting for approval, where there is a discrepancy and what needs handling before payment. I have more control without being involved in every small action.',
        who: 'Alon K.',
        of: 'Business owner',
      },
    ],
  },

  billing: {
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Yearly',
    switchLabel: 'Switch between monthly and yearly pricing',
    perMonth: 'per month',
    perYear: 'per year',
    docsLabel: 'Documents per month',
    recommendedLabel: 'Recommended',
    everywhereLabel: 'Included in every plan',
    everywhere: [
      'Full chain: supplier, order, receipt, invoice and payment',
      'Three roles with separation of duties',
      'A record of every sensitive financial action',
    ],
    yearly: ['No charge', '$200', '$790', '$1,490', 'Contact us'],
    saveLabel: '30% off',
    billedMonthly: 'Billed monthly',
    billedYearly: 'Billed yearly',
  },

  // Each card asks for what it can actually give. The plan with no figure has
  // no self-serve path, so it does not offer a signup button. See extra.ts.
  plansCta: {
    free: 'Start free',
    paid: 'Start on this plan',
    contact: 'Talk to us',
    contactHref: '#contact',
  },

  // The ladder, translated. Its source is NIR-APP's 0213 migration and the two
  // read models a browser may call; see extra.ts for what is published and what
  // deliberately is not. The Hebrew labels there are the migration’s own public
  // labels, so these are translations of those labels rather than new copy.
  ladder: {
    compareLabel: 'What every plan includes',
    featuresHeader: 'Features',
    included: 'Included',
    absent: 'Not included',
    contract: 'Per contract',
    unlimited: 'Unlimited',
    introNote: 'The free plan includes 20 documents a month, one user and one location, the full chain from purchase to payment, and the three roles with separation of duties. For the first 30 days from email verification it also opens the five Basic capabilities: automatic document reading, full history, Excel exports and accountant reports, the supplier performance board, and email alerts and automations.',

    // Which rows each card prints. Row keys, so the decision is made once; see
    // extra.ts for the two rules that pick them.
    cardRows: extraHe.ladder.cardRows,

    // Every card prints THESE rows, all of them, in this order, with a rule
    // through the ones its plan does not carry. See extra.ts for why.

    rows: [
      {
        icon: 'documents',
        label: 'Documents per month',
        cells: ['20', '40', '150', '375', 'Per contract'],
      },
      {
        icon: 'users',
        label: 'Active users',
        cells: ['1', '5', '15', '30', 'Unlimited'],
      },
      {
        icon: 'branches',
        label: 'Locations',
        cells: ['1', '1', '1', '10', 'Unlimited'],
      },
      {
        icon: 'chain',
        label: 'Full chain from purchase to payment',
        cells: [true, true, true, true, true],
      },
      {
        icon: 'roles',
        label: 'Three roles with separation of duties',
        cells: [true, true, true, true, true],
      },
      {
        icon: 'automation',
        label: 'Automatic document reading',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'history',
        label: 'Full history',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'export',
        label: 'Excel exports and accountant reports',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'reports',
        label: 'Supplier performance board',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'mail',
        label: 'Email alerts and automations',
        cells: ['intro', true, true, true, true],
      },
      {
        icon: 'bank',
        label: 'Bank reconciliation',
        cells: [false, false, true, true, true],
      },
      {
        icon: 'payments',
        label: 'Accountant payment queue',
        cells: [false, false, true, true, true],
      },
      {
        icon: 'invoices',
        label: 'Consolidated invoices',
        cells: [false, false, true, true, true],
      },
      {
        icon: 'api',
        label: 'Integrations with other systems',
        cells: [false, false, false, true, true],
      },
      {
        icon: 'support',
        label: 'Extended support',
        cells: [false, false, false, true, true],
      },
    ],
  },

  // The eighth question. It lives here rather than in the frozen dictionary,
  // for the reason set out in extra.ts.
  faqExtra: {
    items: [
      {
        q: 'How long before the system works on my business?',
        a: 'Immediately. There is no setup phase to get through first: open an account, upload the first document, and the system works on it. You can start with a single supplier and add the rest as you go.',
      },
    ],
  },

  contact: {
    eyebrow: 'Business plan',
    h2: 'An organisation with its own quotas&nbsp;and structure',
    lede: 'This plan is built around the business rather than bought off the shelf. Leave your details and we will come back with a proposal that fits your document volume and your permission structure.',
    action: 'mailto:support@inplace.digital',
    fields: {
      name: 'Full name',
      business: 'Business name',
      email: 'Email',
      phone: 'Phone',
      message: 'What should we know before the call?',
      messageHint: 'How many locations, how many regular suppliers, and who will be working in the system.',
    },
    submit: 'Send',
    fineprint: 'We use these details only to get back to you. There is no mailing list here.',
    optional: 'optional',
  },

  folioNav: [
    { t: 'What it does', href: '#what' },
    { t: 'Why this', href: '#why' },
    { t: 'FAQ', href: '#faq' },
    { t: 'Plans', href: '#plans' },
  ],

  moreLabel: 'Read on',

  languages: {
    label: 'Language',
    menuLabel: 'Translate this page',
    currentLabel: 'Current language',
    options: {
      he: { label: 'עברית', href: '/', dir: 'rtl' },
      en: { label: 'English', href: '/en/', dir: 'ltr' },
    },
  },

  theme: {
    toLight: 'Switch to the light view',
    toDark: 'Switch to the dark view',
  },

  folioMenu: {
    open: 'Menu',
    close: 'Close the menu',
    label: 'Chapters',
  },

  accessibility: {
    screenAltSuffix: 'InPlace product screen',
    dashboardAlt: 'The full InPlace control centre screen',
    nextTestimonial: 'Next example statement',
    previousTestimonial: 'Previous example statement',
    zoomScreen: 'Open the screen full size',
    closeScreen: 'Close the screen',
  },
} satisfies typeof extraHe

export default extraEn
