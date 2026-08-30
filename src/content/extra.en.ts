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

  testimonials: {
    placeholder: true,
    folioless: true,
    eyebrow: 'What the change sounds like',
    h2: 'Five examples of what the system&nbsp;changes',
    disclosure:
      'These are sample statements written by us, not customer testimonials. Each one describes behaviour that exists in the product today. They will be replaced by verified customer recommendations after launch.',
    // Retranslated 27.08.2026, because the Hebrew moved. The five English
    // sentences here were faithful translations of the five Hebrew ones as they
    // stood that morning, and those were rewritten the same day for a reason
    // that survives translation: a clean, complete, on-message sentence is the
    // one thing people do not sound like, and a written example that reads as
    // marketing copy makes the disclosure above it look like an excuse.
    //
    // So these carry the same details that serve no argument, and the same two
    // admissions that the thing being praised was irritating first.
    items: [
      {
        q: 'I used to find the gap at month end, after I had already paid. Now the invoice gets stuck before the payment and I have to decide what to do with it. In the moment that is annoying. Afterwards it is exactly what I wanted.',
        who: 'Owner',
        of: 'Two-location restaurant',
      },
      {
        q: 'Every order leaves with a number and a price list. I used to scroll WhatsApp for ten minutes trying to remember what was agreed, and half the time I did not find it.',
        who: 'Procurement manager',
        of: 'Coffee shop group',
      },
      {
        q: 'I mark what arrived from my phone, at the receiving door, while the driver is still standing there. It used to be a note in my pocket that I remembered on Thursday.',
        who: 'Operations manager',
        of: 'Central kitchen',
      },
      {
        q: 'Only approved invoices reach me. I pay, upload the receipt, and that is it. Anything unapproved never gets to me at all, and mostly what that saved me was phone calls.',
        who: 'Accountant',
        of: 'External practice',
      },
      {
        q: 'The biggest change is that I approve and somebody else transfers. At first it annoyed me that there was no way around it when something was urgent. Today it is the thing I trust most.',
        who: 'Owner',
        of: 'Food business',
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
