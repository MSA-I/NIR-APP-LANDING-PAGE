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
    items: [
      {
        q: 'I used to find the difference at month end, after we had paid. Now the invoice stops before payment and I decide what happens next.',
        who: 'Owner',
        of: 'Two-location restaurant',
      },
      {
        q: 'Every order leaves with a number and a price list. Nobody has to scroll back through WhatsApp to remember what was agreed.',
        who: 'Procurement manager',
        of: 'Coffee shop group',
      },
      {
        q: 'Goods received are recorded on a phone at the receiving door. A shortage is marked there, not a week later.',
        who: 'Operations manager',
        of: 'Central kitchen',
      },
      {
        q: 'I see only approved invoices, execute the payment and upload the receipt. Anything unapproved never reaches me.',
        who: 'Accountant',
        of: 'External practice',
      },
      {
        q: 'The biggest change is separation of duties. I approve and somebody else transfers. There is no bypass, even when it feels urgent.',
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
