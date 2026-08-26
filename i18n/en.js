// English. Mirrors i18n/he.js exactly, including every figure — the numbers
// come from the same captures of the running product and must not drift.

export default {
  code: 'en',
  dir: 'ltr',
  htmlLang: 'en',
  path: 'en',

  title: 'InPlace — procurement, invoices and payments in one place',
  description:
    'A procurement-to-payment control system. One screen that says what needs attention today, what could cost money, and where the business stands right now.',

  skip: 'Skip to the action',
  mapLabel: 'Map of the journey',
  langsLabel: 'Languages',
  noscript:
    'This page is built as a scroll experience. Without JavaScript you can still read what the product does and open an account.',

  map: ['The stack', 'The gap', 'The light', 'Control', 'The journey', 'Invoices', 'Exception', 'Payment', 'Close'],

  ctaPrimary: 'Open a free account',
  ctaPrimaryHref: 'https://app.inplace.digital/signup',
  ctaSecondary: 'Book a demo',
  ctaSecondaryHref: 'https://inplace.digital/demo',
  fineprint: 'No credit card. You can start with a single supplier.',

  doc: {
    label: 'The document travelling with you',
    kind: 'Invoice 2088',
    supplier: 'Naki VeZohar',
    amount: '1,062.00 ₪',
    states: [
      { text: 'In the stack',          tone: 'idle'  },
      { text: 'Never compared',        tone: 'alert' },
      { text: 'Scanned',               tone: 'idle'  },
      { text: 'Captured',              tone: 'idle'  },
      { text: 'Matched to an order',   tone: 'idle'  },
      { text: 'Given a row',           tone: 'done'  },
      { text: 'Checked against the order', tone: 'done' },
      { text: 'Approved for payment',  tone: 'done'  },
      { text: 'Partially paid',        tone: 'done'  },
    ],
  },

  copy: [
    {
      win: '0 0.088 0 0.40', at: 'ip-at-start',
      h1: 'Your business runs on a&nbsp;stack',
      lede: 'Orders, delivery notes and invoices, each in a different place and each at a different moment. Whatever falls off the stack surfaces at the end of the month.',
    },
    {
      win: '0.098 0.198 0.18 0.18', at: 'ip-at-end',
      h2: 'Three numbers, one&nbsp;transaction',
      lede: 'The purchase order said <strong class="ip-num">2,884.50 ₪</strong>. The invoice that arrived asked for <strong class="ip-num ip-alert">4,720.00 ₪</strong>. Nobody put them side by side.',
    },
    {
      win: '0.205 0.292 0.18 0.18', at: 'ip-at-middle',
      line: 'There is one way to fix this: a defined place for every&nbsp;thing.',
    },
    {
      win: '0.300 0.410 0.18 0.18', at: 'ip-at-start',
      kicker: 'Control centre',
      h2: 'What needs attention&nbsp;today',
      lede: '<strong class="ip-num">13</strong> open tasks across every queue, <strong class="ip-num">17,825 ₪</strong> in open invoices, and six alerts waiting on a decision. All on one screen, with nothing to go looking for.',
    },
    {
      win: '0.420 0.530 0.18 0.18', at: 'ip-at-end',
      h2: 'The whole journey, one&nbsp;place',
      lede: 'Suppliers and price lists, purchase orders, goods receiving, invoices and credits, payment requests, payment and bank reconciliation. One chain that never leaves the building.',
    },
    {
      win: '0.545 0.645 0.18 0.18', at: 'ip-at-middle',
      h2: 'Paper becomes the system',
      lede: 'Every document that arrives gets a row, a status, and a link back to the order it came from.',
    },
    {
      win: '0.712 0.797 0.18 0.18', at: 'ip-at-start',
      h2: 'The exception finds&nbsp;itself',
      lede: 'The system compares order, receipt and invoice. A gap of <strong class="ip-num ip-alert">1,835.50 ₪</strong> from the same supplier does not move on. It is flagged, and it waits for a decision.',
    },
    {
      win: '0.806 0.890 0.18 0.18', at: 'ip-at-end',
      h2: 'The money moves&nbsp;once',
      lede: 'An approved payment request, executed by the accountant, receipt stored, and the line closed against the bank. Full separation of duties, and a record of every action.',
    },
    {
      win: 'finale', at: 'ip-at-crown',
      h2: 'Everything in place.',
      lede: 'And the next step is clear.',
    },
  ],
}
