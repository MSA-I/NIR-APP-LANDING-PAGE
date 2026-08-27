import he from './he'

// English edition of the current Hebrew page. The object is checked against
// the Hebrew dictionary at compile time so a new section cannot ship in one
// language and silently disappear from the other.
const en = {
  code: 'en',
  dir: 'ltr',
  htmlLang: 'en',
  path: 'en',

  title: 'InPlace: procurement, invoices and payments in one place',
  description:
    'A procurement-to-payment system that connects purchase orders, goods received and invoices, then stops mismatches before money leaves the business.',

  brand: 'InPlace',
  skip: 'Skip to content',
  folioLabel: 'Position on page',

  ctaPrimary: 'Open a free account',
  ctaPrimaryHref: 'https://app.inplace.digital/signup',
  fineprint: 'No credit card. Start with one supplier.',

  title_page: {
    folio: 'Cover',
    eyebrow: 'Procurement, invoices and payments. One controlled workflow.',
    h1: 'When the order and invoice do not&nbsp;agree, it stops here.',
    lede: [
      'InPlace compares what you ordered, what arrived and what you were asked to pay. A mismatch stops and waits for a decision instead of surfacing after month end.',
      'Underneath is one chain: supplier, price list, purchase order, goods receipt, invoice, approval and payment. Every document receives a row, a status and a link to the order it came from.',
    ],
    indexLabel: 'On this page',
    index: [
      { n: '01', t: 'The stack', d: 'From a pile of documents to the control centre' },
      { n: '02', t: 'What the system does', d: 'Five steps, five real product screens' },
      { n: '03', t: 'Why this approach', d: 'And what InPlace refuses to become' },
      { n: '04', t: 'Plans', d: 'Five plans, one published usage measure' },
      { n: '05', t: 'Questions', d: 'Who works, how documents arrive, who moves money' },
      { n: '06', t: 'Get started', d: 'Open an account and try the workflow' },
    ],
  },

  film: {
    folio: 'Chapter 01: from the stack to the control centre',
    caption: 'Visualisation: one month of supplier documents, and the workflow that replaces them.',
    blocks: [
      {
        h: 'Your business stands on a&nbsp;stack',
        p: 'Orders in WhatsApp, delivery notes in a binder, invoices in email. Each one lives somewhere else and arrives at another time. Whatever falls off the stack appears at month end, after you have paid.',
      },
      {
        h: 'Two numbers, one&nbsp;supplier',
        p: 'The purchase order to Basar VeHaben said <b>2,884.50 ₪</b>. The invoice from the same supplier asked for <b>4,720.00 ₪</b>. Without a system, nobody puts them side by side and the invoice amount gets paid.',
      },
      {
        h: 'There is one way to organise&nbsp;it',
        p: 'A defined place for every supplier, every order and every document that arrives. Not a binder or a WhatsApp group, but one chain that can be followed from order to bank.',
      },
      {
        h: 'This is the check that replaces the&nbsp;stack',
        p: 'InPlace places the order, the goods actually received and the invoice side by side, then marks the difference: <b>red</b> for money it could cost you, <b>green</b> for money coming back. From here on this is not a visualisation. These are the product screens.',
      },
    ],
  },

  what: {
    folio: 'Chapter 02: what the system does',
    eyebrow: 'Five steps, one chain',
    h2: 'What InPlace does in&nbsp;practice',
    lede: 'This is the chain every purchase follows, from the supplier order to the bank transfer. Every step is a capture from the running product, not an illustration. Select a step to open it.',
    stepsLabel: 'The five steps',
    demoHint: 'The product screens show the current Hebrew interface. You can also select the navigation inside each screen.',
    steps: [
      {
        k: 'Purchase order',
        t: 'An order leaves with a number, not in WhatsApp',
        p: 'Every supplier order is opened in the system, receives a number and a price list, then gets sent. Its state, whether draft, sent, approved or partially received, lives in one place instead of someone’s memory.',
        img: 'assets/screen-office-orders.webp',
        cap: 'Purchase orders: <b>17 orders</b>, seven still open. Order 24# to Basar VeHaben, 2,884.50 ₪, approved.',
      },
      {
        k: 'Goods received',
        t: 'Record what arrived against what was ordered',
        p: 'The person receiving goods records actual quantities, shortages and differences. That becomes the basis for the invoice check, so it can be done on a phone at the receiving door.',
        img: 'assets/screen-office-receiving.webp',
        cap: 'Goods received: <b>5 orders waiting</b>, all requiring action.',
      },
      {
        k: 'Invoice check',
        t: 'The invoice is checked before payment',
        p: 'Every incoming invoice receives a row, a review status and a link to its purchase order. An invoice that does not agree cannot continue. It remains under review until somebody decides.',
        img: 'assets/screen-office-invoices.webp',
        cap: 'Invoices: <b>14 invoices</b>. Invoice 7702 from Basar VeHaben, 4,720.00 ₪, requires review.',
      },
      {
        k: 'Exceptions',
        t: 'What does not match identifies itself',
        p: 'The system compares the order, goods received and invoice, then marks amount mismatches, suspected duplicate invoices, unknown suppliers and payments without invoices. Every exception has a severity, owner and opening date.',
        img: 'assets/screen-owner-exceptions.webp',
        cap: 'Exceptions: <b>8 open exceptions</b>, two with high severity.',
      },
      {
        k: 'Approval and payment',
        t: 'Money moves only after approval',
        p: 'Procurement opens a payment request, the owner approves it, and the accountant executes it and uploads the receipt. Three different hands on the same line, with a record of every action. The owner cannot move money and the accountant cannot change orders.',
        img: 'assets/screen-owner-payment-requests.webp',
        cap: 'Payment requests: request <b>58#</b> stopped on a suspected duplicate of request 57#, same supplier and same amount.',
      },
    ],
  },

  board: {
    h2: 'And the control centre above&nbsp;it, in full',
    p: 'The control centre gathers queues, open money and alerts into one place, ordered by urgency. Below are the trends: monthly purchasing, what is due this week and where the money is concentrated. These are the first three figures the owner sees.',
    stats: [
      { v: '13', l: 'open tasks across all queues' },
      { v: '17,825 ₪', l: 'open invoice balance' },
      { v: '6', l: 'items requiring attention today' },
    ],
    img: 'assets/screen-owner-dashboard.webp',
    cap: 'The full control centre, including trends and charts.',
  },

  midAsk: {
    line: 'That is what the system does, on the product screens themselves. Open an account and start with one supplier.',
  },

  why: {
    folio: 'Chapter 03: why this approach',
    h2: 'Why not a spreadsheet, and why not an&nbsp;ERP',
    lede: 'Today the work is split between a spreadsheet, WhatsApp, the accountant and a supplier ordering system. InPlace replaces that split with one journey, one source of truth and a clear owner for every step.',
    yesLabel: 'What InPlace does',
    yes: [
      { t: 'One continuous journey', p: 'From suppliers and price lists to payment and bank reconciliation. One chain that does not leave the system halfway through.' },
      { t: 'An exception is a decision', p: 'The system distinguishes information, waiting, exception and completion. What deviates rises to the top instead of being buried in a report.' },
      { t: 'Only real data', p: 'A measure without data shows a dash, not zero. Zero is a statement about reality, and in a financial system that difference costs money.' },
      { t: 'Separated responsibility', p: 'Owner, procurement and accountant. Each person gets exactly what their role requires, and no more.' },
      { t: 'A record of every action', p: 'Every sensitive financial action records a reason, and payment moves only through an approved request and an additional verification step.' },
    ],
    noLabel: 'What it does not try to become',
    no: [
      { t: 'Not another dashboard', p: 'A screen that only displays data is not an operational screen. Every screen is measured by one question: can the manager identify the next three actions within ten seconds?' },
      { t: 'Not an expense tracker', p: 'The value is not learning what you spent at month end. It is stopping what does not agree before the money leaves.' },
      { t: 'Not a heavy general ERP', p: 'One domain, from procurement to payment. No modules that nobody in the business will open.' },
      { t: 'Not a noisy system', p: 'An interface handling other people’s money should neither surprise nor impress. The tool disappears into the task.' },
    ],
  },

  plans: {
    folio: 'Chapter 04: plans',
    h2: 'Plans',
    lede: 'Plans differ by the number of documents the system processes each month. Every other capability is available on every plan.',
    tableLabel: 'Plan comparison',
    headers: { plan: 'Plan', who: 'Best for', docs: 'Documents per month', price: 'Price' },
    rows: [
      { name: 'Free', who: 'Start and see the system working on your own business', docs: '20', price: 'No charge' },
      { name: 'Basic', who: 'A business working with several regular suppliers', docs: '40', price: '69 ₪' },
      { name: 'Pro', who: 'A business whose accountant works inside the system', docs: '150', price: '249 ₪' },
      { name: 'Premium', who: 'A business operating more than one location', docs: '375', price: '449 ₪' },
      { name: 'Business', who: 'An organisation requiring custom quotas and terms', docs: 'Custom', price: 'Contact us' },
    ],
    priceNote: 'All prices exclude VAT.',
    note: 'Move between plans at any time. All accumulated data remains available after moving to a lower plan.',
  },

  faq: {
    folio: 'Chapter 05: questions',
    h2: 'Questions asked before getting&nbsp;started',
    lede: 'These answers describe the product as it works today.',
    items: [
      {
        q: 'Who works in the system, and what can each person see?',
        a: 'There are three roles. The <b>owner</b> sees the full picture, approves and reviews, but cannot move money. <b>Procurement</b> manages suppliers, price lists, orders, goods received and invoices, but cannot see payments or banking. The <b>accountant</b> sees approved invoices, executes payment and handles bank reconciliation, but cannot change orders or price lists.',
      },
      {
        q: 'How does an invoice enter the system?',
        a: 'Upload the document to the documents area: a PDF, scan or photo received in WhatsApp. The system captures it, connects it to the relevant business record and shows the processing state of every document. Invoices, delivery notes and credit notes live in one place.',
      },
      {
        q: 'What happens when something does not agree?',
        a: 'The system compares the order, what was actually received and the invoice, then opens an exception for amount mismatches, suspected duplicates, unknown suppliers or payments without invoices. Every exception has a severity, owner and opening date, and it cannot continue until somebody decides.',
      },
      {
        q: 'Who actually transfers the money?',
        a: 'Only the accountant, and only after the payment request has been approved. Execution requires additional verification and a reason, and the receipt is stored on the line. The owner has no direct payment route, even in an urgent case. This is separation of duties, not a setting that can be bypassed.',
      },
      {
        q: 'Is there a record of who did what?',
        a: 'Yes. Every sensitive financial action is written to the activity log with the reason provided, not only the date and user.',
      },
      {
        q: 'Is my business data separated from other businesses?',
        a: 'Yes. Every record carries its organisation identifier and every query is filtered by the signed-in user’s organisation. Tenant separation is a foundation of the system, not an option somebody turns on.',
      },
      {
        q: 'Is the product Hebrew or translated?',
        a: 'Hebrew is the product’s source language today. The interface was built right to left from the ground up, with clear Hebrew errors and Israeli number and date formats. This English site explains the product for international evaluation; it does not claim that the current application interface is already localised.',
      },
    ],
  },

  close: {
    folio: 'Chapter 06: get started',
    h2: 'Everything in place.',
    sub: 'And the next step is clear.',
    p: 'Opening an account takes one minute, and you can start with one supplier. The system works on your own data from the first document you upload.',
  },

  footer: {
    tagline: 'Control from procurement to payment. Everything in place, with a clear next step.',
    rights: '© 2026 InPlace',
    cols: [
      {
        h: 'Get started',
        links: [
          { t: 'Open a free account', href: 'https://app.inplace.digital/signup' },
          { t: 'Sign in', href: 'https://app.inplace.digital' },
        ],
      },
      {
        h: 'Product',
        links: [
          { t: 'What the system does', href: '#what' },
          { t: 'Why this approach', href: '#why' },
          { t: 'Frequently asked questions', href: '#faq' },
          { t: 'Plans', href: '#plans' },
        ],
      },
      {
        h: 'Legal',
        links: [
          { t: 'Terms of use', href: 'https://app.inplace.digital/terms' },
          { t: 'Privacy', href: 'https://app.inplace.digital/privacy' },
        ],
      },
    ],
  },

  noscript:
    'This page includes a film controlled by scrolling. Without JavaScript you can still read what the system does and open an account.',
} satisfies typeof he

export default en
