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
    yearly: ['No charge', '690 ₪', '2,490 ₪', '4,490 ₪', 'Contact us'],
  },

  // Each card asks for what it can actually give. The plan with no figure has
  // no self-serve path, so it does not offer a signup button. See extra.ts.
  plansCta: {
    free: 'Start free',
    paid: 'Start on this plan',
    contact: 'Talk to us',
    contactHref: '#contact',
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

  languages: {
    label: 'Language',
    menuLabel: 'Translate this page',
    currentLabel: 'Current language',
    options: {
      he: { label: 'עברית', short: 'HE', href: '/', dir: 'rtl' },
      en: { label: 'English', short: 'EN', href: '/en/', dir: 'ltr' },
    },
  },

  accessibility: {
    screenAltSuffix: 'InPlace product screen',
    dashboardAlt: 'The full InPlace control centre screen',
    nextTestimonial: 'Next example statement',
    previousTestimonial: 'Previous example statement',
  },
} satisfies typeof extraHe

export default extraEn
