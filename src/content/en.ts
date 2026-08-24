/* English copy. Mirrors he.ts exactly: same keys, same array lengths, same
   machine values (ids, states, role keys). Only human-visible text differs.
   Claims policy (docs/BRIEF.md §11): no savings percentages, no SLA/uptime,
   no user/branch/storage quotas, no customer logos, no invented benchmarks.
   Demo fixtures stay an Israeli business (shekel amounts, Tal-Fresh).
   Plan prices are USD and come from src/lib/i18n.ts, not from here. */

import type { Dict } from './he';

export const en: Dict = {
  meta: {
    title: 'InPlace · See it before you pay',
    description:
      'InPlace connects suppliers, price lists, orders, goods receiving, invoices and payments, so you know within seconds what needs attention before the money goes out. Try the live demo, no signup.',
  },

  nav: {
    product: 'Product',
    assistant: 'Assistant',
    demo: 'Live demo',
    pricing: 'Pricing',
    security: 'Security',
    faq: 'FAQ',
    login: 'Log in to InPlace',
    cta: 'Try the live demo',
    ctaShort: 'Live demo',
    langLabel: 'Language',
    menuLabel: 'Menu',
  },

  hero: {
    h1: 'See it before you pay.',
    h1Accent: 'before',
    sub: 'InPlace connects suppliers, price lists, orders, goods receiving, invoices and payments, so you know within seconds what needs attention before the money goes out.',
    ctaPrimary: 'Try the live demo',
    ctaSecondary: 'How it works',
    demoNote: 'Every demonstration on this page runs on demo data.',
  },

  /* Hero product-UI replica: a blocked invoice, the product's real semantics. */
  heroUi: {
    screenTitle: 'Invoice check',
    invoiceId: 'INV-2311',
    supplier: 'Tal-Fresh Marketing Ltd.',
    statusBlocked: 'Blocked for payment',
    reasonTitle: 'Why it is blocked',
    reason: 'Line price is higher than the price agreed on the order',
    lineName: 'Cherry tomatoes, 5 kg crate',
    ordered: 'Ordered',
    billed: 'Billed',
    delta: 'Gap',
    deltaValue: '+₪1,240',
    chain: [
      { label: 'Order 4127', state: 'done' },
      { label: 'Goods receipt', state: 'done' },
      { label: 'Invoice', state: 'alert' },
    ],
    action: 'Open the investigation',
    asOf: 'As of now · Demo data',
  },

  proof: {
    h2: 'Not another dashboard. A decision engine.',
    items: [
      { title: 'One unbroken chain', body: 'From the supplier and the price list to the payment and the bank match. No gaps along the way.' },
      { title: 'Every number has evidence', body: 'Every amount has a source you can open: an order, a goods receipt, an invoice or a bank transaction.' },
      { title: 'Three roles, real permissions', body: 'Owner, procurement and accountant each see exactly what they are allowed to see.' },
      { title: 'An audit log with a reason', body: 'Every sensitive action is recorded: who, when, and why. The reason is stored with the action, never added afterwards.' },
    ],
  },

  leaks: {
    h2: 'Where does the money leak out?',
    sub: 'Four situations that happen in every business. The only difference is when you catch them.',
    items: [
      {
        title: 'A quiet price increase',
        before: 'The invoice price differs from the price list and from the order, and nobody compares them.',
        after: 'InPlace shows the exact gap and where the price came from, before approval.',
        result: 'You handle it before you pay.',
        badge: 'Price gap',
      },
      {
        title: 'A partial delivery',
        before: '20 were ordered, 14 arrived, and the invoice came for 20.',
        after: 'Automatic matching across order, goods receipt and invoice, line by line.',
        result: 'You do not pay for what never arrived.',
        badge: 'Quantity gap',
      },
      {
        title: 'A forgotten credit',
        before: 'The supplier promised a credit, and it vanished somewhere between phone calls.',
        after: 'Open exposure stays listed by supplier and document, until the credit is actually settled.',
        result: 'The money stays tracked.',
        badge: 'Open credit',
      },
      {
        title: 'A payment with no chain behind it',
        before: 'An invoice moves toward payment without an order or a complete approval behind it.',
        after: 'It is held as blocked, with the reason and the evidence in front of you.',
        result: 'Control stays with you.',
        badge: 'Blocked for payment',
      },
    ],
  },

  trail: {
    h2: 'The money trail',
    sub: 'One document passes through every stop. Every stop runs a check, and every check leaves evidence.',
    stations: [
      { title: 'Supplier and price list', body: 'The agreed price is stored with a full history of every change.' },
      { title: 'Purchase order', body: 'The price is locked at the moment of ordering. That is the baseline for every comparison that follows.' },
      { title: 'Goods receiving', body: 'What arrived is counted against what was ordered, line by line.' },
      { title: 'Invoice', body: 'Three-way match: order against goods receipt against invoice. An exception stops here.', alert: 'A ₪1,240 gap caught before payment' },
      { title: 'Credit and payment request', body: 'Credits stay tracked until they close. A payment only ever starts from an approved request.' },
      { title: 'Payment and bank matching', body: 'The payment is recorded, the proof of transfer is stored, and the transaction is matched in the bank.' },
    ],
    close: 'That is the whole story: see the gap before it turns into a payment.',
  },

  assistant: {
    h2: 'Ask your business. Get an answer with the evidence.',
    sub: 'The InPlace assistant is not a chatbot. It answers only from numbers the server computed, and every answer carries its source, its timestamp and its permission.',
    tryLabel: 'Sample questions',
    roleLabel: 'Role',
    runs: [
      {
        id: 'blocked',
        question: 'Why is the Tal-Fresh invoice blocked?',
        answer: 'The invoice is ₪1,240 above the price agreed on the order.',
        facts: [
          { label: 'Line price gap', value: '+₪1,240' },
          { label: 'Lines checked', value: '12' },
          { label: 'Reason code', value: 'Price above order' },
        ],
        source: 'Invoice check INV-2311',
        state: 'complete',
        roles: ['owner', 'office', 'accountant'],
      },
      {
        id: 'credits',
        question: 'How much money is sitting in open credits?',
        answer: 'Three open credits, ₪2,180 in total, across two suppliers.',
        facts: [
          { label: 'Open credits total', value: '₪2,180' },
          { label: 'Suppliers', value: '2' },
          { label: 'Oldest credit', value: '18 days' },
        ],
        source: 'Open credits by supplier',
        state: 'complete',
        roles: ['owner', 'office'],
      },
      {
        id: 'orders',
        question: 'Which orders were sent but never confirmed?',
        answer: 'Two orders are waiting on supplier confirmation. The oldest has been waiting four days.',
        facts: [
          { label: 'Orders waiting', value: '2' },
          { label: 'Longest wait', value: '4 days' },
        ],
        source: 'Orders in status Sent',
        state: 'complete',
        roles: ['owner', 'office'],
      },
      {
        id: 'bank',
        question: 'Which bank transactions are unmatched?',
        answer: 'Four transactions are waiting to be matched, ₪9,640 in total.',
        facts: [
          { label: 'Unmatched transactions', value: '4' },
          { label: 'Total amount', value: '₪9,640' },
        ],
        source: 'Bank matching',
        state: 'complete',
        roles: ['owner', 'accountant'],
        notPermittedAnswer: 'Bank transactions are not available in the procurement role.',
      },
    ],
    stateLabels: {
      complete: 'Complete answer',
      partial: 'Partial answer',
      not_measured: 'Not measured',
      not_permitted: 'Not permitted in this role',
    },
    windowLabel: 'Window: last 30 days',
    asOfLabel: 'As of Aug 24, 2026, 09:40',
    openSource: 'Open the source',
    demoNote: 'A deterministic walkthrough on demo data. In the product, every answer is checked against your own permissions.',
  },

  roles: {
    h2: 'One truth. Three views.',
    sub: 'This is the same invoice you met at the top, INV-2311, in three views. Each person sees exactly what they are allowed to see, and not an ounce more.',
    tabs: [
      {
        id: 'owner',
        label: 'Owner',
        summary: 'Sees everything, approves and reviews. Does not execute payments.',
        sees: ['The full picture and the money trail', 'Invoice and payment request approvals', 'Reports, audit and credits'],
        blocked: 'The actual execution belongs to the accountant.',
      },
      {
        id: 'office',
        label: 'Procurement',
        summary: 'Runs the buying journey: suppliers, orders, receiving and invoices.',
        sees: ['Suppliers, price lists and orders', 'Goods receiving and invoice checks', 'Invoice and credit status in the buying context'],
        blocked: 'Cannot see payments, bank, financial reports or the financial audit.',
      },
      {
        id: 'accountant',
        label: 'Accountant',
        summary: 'Sees approved invoices only, executes payments and matches the bank.',
        sees: ['Approved invoices with minimal context', 'Approved payment execution and proof upload', 'Bank matching, credits and the monthly export'],
        blocked: 'Cannot change orders, products or price lists.',
      },
    ],
    invoiceCaption: 'Invoice INV-2311 as seen by',
    invoiceTotal: 'invoice total',
  },

  demo: {
    h2: 'Try it yourself. No signup.',
    sub: 'Two minutes, four scenarios, three roles. All of it on demo data.',
    stepRole: 'Pick a role',
    stepScenario: 'Pick a scenario',
    scenarios: [
      { id: 'price', label: 'Price increase' },
      { id: 'receipt', label: 'Partial delivery' },
      { id: 'credit', label: 'Open credit' },
      { id: 'payment', label: 'Blocked payment' },
    ],
    evidenceTitle: 'The evidence chain',
    askAssistant: 'What does the assistant say?',
    summaryTitle: 'What InPlace stopped here',
    ctaPilot: 'Open a pilot workspace',
    restart: 'Another scenario',
    demoBadge: 'Demo data',
    stepOf: 'Scenario {n} of {total}',
    nextScenario: 'Next scenario',
    tourDone: 'You have seen all four scenarios',
  },

  roi: {
    h2: 'What is this worth to your business?',
    sub: 'A transparent calculator: you set the assumptions, we only do the arithmetic. This is an estimate, not a promise.',
    inputs: {
      docs: 'Documents per month (invoices and orders)',
      minutes: 'Minutes of manual checking per document',
      hourly: 'Average hourly labor cost ($)',
      spend: 'Monthly purchasing spend ($)',
      variance: 'Estimated rate of price and quantity gaps (%)',
      recoverable: 'How much of those gaps you can stop or recover (%)',
      cost: 'Estimated monthly cost of InPlace ($)',
    },
    results: {
      title: 'The result, in three scenarios',
      conservative: 'Conservative',
      base: 'Base',
      optimistic: 'Optimistic',
      timeSaved: 'Checking hours saved per month',
      leakage: 'Value of gaps caught per month',
      monthly: 'Estimated monthly value',
      yearly: 'Estimated annual value',
      roi: 'Estimated annual return ratio',
      formulaTitle: 'How we calculated this',
      formula:
        'Operational saving = documents × minutes × hourly cost ÷ 60. Gaps caught = purchasing spend × gap rate × stop rate. Annual value = (saving + gaps) × 12, set against the cost of the subscription.',
      disclaimer: 'An estimate only. There is no industry benchmark here and no promise of savings.',
      disclaimerDefault: 'These are our starting assumptions, not your numbers. Change any field and the calculation follows.',
      disclaimerEdited: 'This calculation uses the assumptions you entered.',
    },
  },

  pricing: {
    h2: 'Every capability, on every plan.',
    sub: 'Plans differ by volume only: documents, scanned pages and assistant questions. No surprises.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlyNote: 'Paid yearly: you pay for 10 months',
    perMonth: 'per month',
    perYear: 'per year',
    vatNote: 'Prices before tax.',
    plans: {
      free: { name: 'Free', tagline: 'Start seeing' },
      basic: { name: 'Basic', tagline: 'For a small, steady business' },
      pro: { name: 'Pro', tagline: 'For a full workload' },
      premium: { name: 'Premium', tagline: 'For genuinely high volume', highlight: 'Full volume' },
    },
    quota: {
      docs: 'Documents per month',
      pages: 'Scanned pages per month',
      assistant: 'Assistant questions per month',
    },
    introNote: 'On every plan: 50 assistant questions in the first 30 days, on top of the monthly quota.',
    freeCta: 'Open a free account',
    planCta: {
      free: 'Open a free account',
      basic: 'Start on Basic',
      pro: 'Start on Pro',
      premium: 'Start on Premium',
    },
    planCtaNote: 'Start free, upgrade when ready',
    upgradeNote: 'Every plan starts as a free account, with no credit card. You upgrade from inside the system when you are ready.',
  },

  security: {
    h2: 'Built like a product that touches money.',
    sub: 'Because it is one. These are not marketing promises. They are the principles the product was built on.',
    items: [
      { title: 'Organization isolation in the database', body: 'Every row belongs to one organization, and a policy at the database level enforces the boundary. Isolation is a founding principle here, not a feature.' },
      { title: 'Three roles, real boundaries', body: 'Owner, procurement and accountant get different access surfaces. Permissions are enforced on the server, not in the interface.' },
      { title: 'An audit log with a reason', body: 'Every sensitive action is recorded: who did it, when, and for what reason. Financial records are only ever soft deleted.' },
      { title: 'An assistant that does not invent numbers', body: 'Every answer rests on a value the server computed, with its source and its permission. An answer without evidence is rejected.' },
      { title: 'Payment only through a complete chain', body: 'A payment always passes through an approved request, step-up authentication, a stated reason and an audit entry.' },
      { title: 'This demo is fully isolated', body: 'The page you are reading is static, runs on demo data, and has no access at all to the product or to the database.' },
    ],
  },

  story: {
    /* PLACEHOLDER: to be replaced with the real pilot customer's words (owner action).
       Launch gate: docs/BRIEF.md §11 blocks publishing until replaced. */
    h2: 'From the field',
    quote: '“Before InPlace we found the gaps after the money had already gone out. Now the invoice stops first, and the reason and the proof are right there on the screen.”',
    attribution: 'Business owner, pilot customer',
    placeholderNote: 'Illustrative quote from the pilot program. Will be replaced with a full customer story.',
  },

  faq: {
    h2: 'Questions that keep coming up',
    items: [
      {
        q: 'Does InPlace replace our ERP or our bookkeeping?',
        a: 'No. InPlace sits on top of the purchasing and payment process and adds a layer of control and decision: who approved, what was checked, and where the gap is. Your bookkeeping carries on exactly as before.',
      },
      {
        q: 'How long does it take to get started?',
        a: 'You open a free account, import your suppliers and a price list, and start ordering and capturing documents. There is no implementation project and no commitment.',
      },
      {
        q: 'Does it work on mobile?',
        a: 'Yes. The interface was built for mobile from the ground up, and the goods receiving flow was designed for the phone before anything else, because that is where it actually happens.',
      },
      {
        q: 'Who in the business sees what?',
        a: 'Three roles. The owner sees and approves everything. Procurement runs the journey up to the invoice without seeing payments or the bank. The accountant sees approved invoices only and executes the payment.',
      },
      {
        q: 'How much does it cost?',
        a: 'You start free, with 25 documents per month. Paid plans differ by volume only, and every capability is open on all of them. Prices are shown above, before tax.',
      },
      {
        q: 'What happens when we go over the quota?',
        a: 'Processing of new documents pauses until the next period begins or until you upgrade. Nothing is deleted, and everything from the past stays readable.',
      },
    ],
  },

  finalCta: {
    h2: 'Want to see this on your own data?',
    sub: 'A proper pilot: you connect, import a price list and your suppliers, and test it on your real business.',
    email: 'Open a pilot workspace',
    whatsapp: 'WhatsApp with',
    or: 'or',
  },

  footer: {
    blurb: 'A procurement to payment system for businesses: suppliers, price lists, orders, receiving, invoices, credits, payments and bank. One connected chain.',
    product: 'Product',
    contact: 'Contact',
    login: 'Log in to InPlace',
    rights: '© 2026 InPlace. All rights reserved.',
    demoDisclaimer: 'Every figure on this page is demonstration data.',
  },
};
