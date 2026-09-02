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

  // Retranslated 30.08.2026 with the owner's second set of responses, which
  // arrived hours after the first and say what these five people actually do in
  // the product rather than what it stopped costing them. Translated sentence
  // for sentence and cut nowhere. The names are transliterated and keep the
  // one-letter surname the Hebrew carries; the roles are the roles he gave.
  //
  // The two colons in the fourth and fifth are em-dashes in the source. See the
  // note in extra.ts: it is the house rule, and it is the only mark that moved.
  testimonials: {
    folioless: true,
    eyebrow: 'What the change sounds like',
    h2: 'Five users on what&nbsp;changed',
    disclosure:
      'These responses were given to us by people using the system, and are quoted as they were given.',
    items: [
      {
        q: 'What caught me is that I do not have to put the whole order with one supplier. I pick the products, and the system shows me how they can be split between several suppliers, what each one comes to, and where the minimum order changes the picture. Even when I would rather keep it all with one supplier, I can see exactly what that convenience costs me.',
        who: 'Itai L.',
        of: 'Restaurant owner',
      },
      {
        q: 'A change in price used to surface only on the next order, or once the invoice had already arrived. Today I see the previous price against the current one, who put theirs up and who brought theirs down, and how far each offer is from the cheapest. That gives me a real basis to talk to the supplier instead of negotiating on a hunch.',
        who: 'Shira M.',
        of: 'Procurement manager',
      },
      {
        q: 'Payment requests reach me after they have been checked and approved, with the invoices and the amounts already attached to them. I can see whether there is a credit to set against it, make the transfer and upload the receipt without going hunting through email. The reconciliation against the bank movement then stays in the same process.',
        who: 'Ronit A.',
        of: 'Bookkeeper',
      },
      {
        q: 'Documents reach us from every direction: invoices, delivery notes and files from different suppliers. I upload them to one place and see what the system managed to read, what has been matched already and what still needs somebody to go over it. On a busy day that saves a lot of the time that used to go on hunting for files and typing them in again.',
        who: 'Omer S.',
        of: 'Operations manager, business group',
      },
      {
        q: 'I do not open the system to go through every order and every invoice one by one. I want to know what needs a decision now: how much money is still open, which payments are coming up, where there is an exception and what has not been reconciled in the bank yet. The dashboard gives me that picture without my having to ask everyone in the business for an update.',
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
    // See the note in extra.ts. The dollar catalogue is built the same way as
    // the shekel one -- $200 against $240, $790 against $948, $1,490 against
    // $1,788 -- so this edition can say the same true thing, and the badge no
    // longer promises a discount the prices under it do not give.
    saveLabel: 'Two months free',
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

  // The pricing chapter's own words, round 20. See extra.ts for what each of
  // these is and why the quota panel is written out rather than composed: the
  // reason is Hebrew's noun agreement, so this edition could compose it — and
  // does not, because one shape for two dictionaries is worth more than four
  // saved lines, and `satisfies typeof extraHe` would not let it diverge.
  //
  // NO PERCENTAGE HERE EITHER. The struck figure and the difference in dollars,
  // both computed from the two catalogues in PlansChapter.
  plansUi: {
    tabsLabel: 'Plan type',
    tabIndividual: 'Individual plans',
    tabBusiness: 'Business plan',

    popular: 'Most popular',
    bestValue: 'Best value',

    quota: [
      {
        head: '20 documents a month',
        lines: ['One active user', 'One location'],
        chip: 'A fixed quota, with no usage billing',
      },
      {
        head: '40 documents a month',
        lines: ['5 active users', 'One location'],
        chip: 'A fixed quota, with no usage billing',
      },
      {
        head: '150 documents a month',
        lines: ['15 active users', 'One location'],
        chip: 'A fixed quota, with no usage billing',
      },
      {
        head: '375 documents a month',
        lines: ['30 active users', 'Up to 10 locations'],
        chip: 'A fixed quota, with no usage billing',
      },
      {
        head: 'A quota set by contract',
        lines: ['Unlimited active users', 'Unlimited locations'],
        chip: 'The quota is agreed with your business',
      },
    ],

    blockWork: 'Work and automation',
    blockWorkNote: 'What the system does to your documents',
    blockMoney: 'Money and connections',
    blockMoneyNote: 'The full set is included',
    blockMoneyNone: 'No access to money and connections',
    blockMoneyFrom: 'Opens on the {name} plan',

    introTag: 'First 30 days only',

    was: 'The price when billed monthly',
    save: 'Saves {n} against monthly billing',
    saveNone: 'No difference against monthly billing',

    compareOpen: 'Full comparison',
    hideLabel: 'Hide',

    selectLabel: 'Choose the {name} plan',
  },

  // The ladder, translated. Its source is NIR-APP's 0213 migration and the two
  // read models a browser may call; see extra.ts for what is published and what
  // deliberately is not. The Hebrew labels there are the migration’s own public
  // labels, so these are translations of those labels rather than new copy.
  ladder: {
    compareLabel: 'What every plan includes',
    featuresHeader: 'Features',
    moreLabel: 'More details',
    included: 'Included',
    absent: 'Not included',
    contract: 'Per contract',
    unlimited: 'Unlimited',
    // 02.09.2026: see extra.ts. Two of the five are not on Basic, so they are described as
    // the introduction's five rather than a plan's. The list itself is unchanged.
    introNote: 'The free plan includes 20 documents a month, one user and one location, the full chain from purchase to payment, and the three roles with separation of duties. For the first 30 days from email verification it also opens five further capabilities: automatic document reading, full history, Excel exports and accountant reports, the supplier performance board, and email alerts and automations.',

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
        // 02.09.2026: was '5' for Basic; production answers 1. See extra.ts.
        cells: ['1', '1', '15', '30', 'Unlimited'],
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
        // 02.09.2026: Basic was `true` here and below; production returns false for both.
        // They start at Pro. See extra.ts.
        label: 'Excel exports and accountant reports',
        cells: ['intro', false, true, true, true],
      },
      {
        icon: 'reports',
        label: 'Supplier performance board',
        cells: ['intro', false, true, true, true],
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
    // The Pages Function, not a mailto:. See functions/api/contact.ts for
    // why, and for what CONTACT_WEBHOOK has to be set to before it delivers.
    action: '/api/contact',
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
    // The three things that can happen after the press, which the form had
    // no way of saying while it was a mailto:. Approved by the owner on
    // 01.09.2026; they live here rather than in the frozen he.ts.
    states: {
      sending: 'Sending…',
      sent: 'Got it. We will come back to you within one business day.',
      failed: 'That did not send. You can write to us directly:',
      failedAddress: 'support@inplace.digital',
    },
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

  boardStats: [
    { v: '15', l: 'open tasks across all queues' },
    { v: '30,225$', l: 'open invoice balance' },
    { v: '7', l: 'items requiring attention today' },
  ],

  demoHint: 'Press a screen to open it at full size.',

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
