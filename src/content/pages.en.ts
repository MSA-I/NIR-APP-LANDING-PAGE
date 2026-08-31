import type { Page } from './pages'

// The English edition of the six supporting pages, published at /en/<slug>/.
//
// Written against the Hebrew pages section by section rather than translated
// phrase by phrase: these documents promise what the product does, and a
// sentence that survives a literal translation while losing its qualifier is
// exactly how a promise grows in one language and not the other. Where the
// Hebrew leans on an idiom, the English says the same thing in its own words.
//
// The two legal documents are here as of 27.08.2026, at the owner's
// instruction. They are the same documents in English, and each says under its
// title that the Hebrew version is the one a user consents to and the one that
// governs — because a translation presented as the agreement itself is an
// agreement nobody signed.
//
// The structure is checked, not assumed: scripts/gates/g18-i18n.mjs holds this
// file to the same slugs and the same section count as pages.ts, so a page
// cannot quietly exist in one language only.

const CTA_EN = {
  label: 'Open a free account',
  href: 'https://app.inplace.digital/signup',
  note: 'No credit card. Start with one supplier.',
}

const pagesEn: Page[] = [
  // ---------------------------------------------------------------- 1 of 6
  {
    slug: 'procurement-software',
    nav: 'Procurement software',
    title: 'Procurement software for SMBs: from order to payment | InPlace',
    description:
      'Procurement software for small and mid-sized businesses: suppliers, orders, goods received, invoices and payments in one chain, with separation of duties.',
    eyebrow: 'Procurement software',
    h1: 'Procurement software built around one chain',
    lede:
      'Most businesses do not suffer from a shortage of data. They suffer from its scattering. The order is in WhatsApp, the delivery note is in a binder, the invoice is in email, and the accountant receives all of it at month end. InPlace connects that chain into one place.',
    sections: [
      {
        h2: 'What procurement software is supposed to do',
        ask: true,
        paras: [
          'Procurement software is not a place to file documents. Its job is to make certain that what you ordered, what you received and what you were asked to pay are the same thing, and to stop whatever does not match before the money leaves.',
          'Everything in InPlace runs in one sequence: suppliers, price lists, orders, goods receipt, invoices, credit notes, payment requests, payments, bank reconciliation and reports. Every document that arrives receives a row, a status and a link to the order it came from.',
        ],
      },
      {
        h2: 'Three roles, duties kept apart',
        paras: [
          '[[guides/separation-of-duties|Separation of duties]] is not a setting somebody has to remember to switch on. It is [[about|the structure of the system]], and each role sees and does only what belongs to it.',
        ],
        table: {
          headers: ['Role', 'What they do'],
          rows: [
            [
              'Owner',
              'Manages, approves and reviews. Opens the system to see what needs attention and what may cost money. Does not execute payment.',
            ],
            [
              'Procurement',
              'Suppliers, price lists, orders, goods receipt and invoices. Can see whether an invoice was paid, but does not run payments and does not touch the bank.',
            ],
            [
              'Accountant',
              'Sees approved invoices only, executes the approved payment, uploads the confirmation and handles bank reconciliation and credit notes.',
            ],
          ],
        },
      },
      {
        h2: 'Who it is for',
        ask: true,
        list: {
          label: 'The businesses the system was built for',
          items: [
            'Businesses where procurement, goods receipt and accounting pass between several people',
            'Businesses with more than one location that need to see both in one picture',
            'Businesses whose accountant is external and has to work inside the same system',
          ],
        },
        after: [
          'And who it is not for: a business looking only for an expense tool or corporate cards, and an organisation that wants a general ERP for every department.',
        ],
      },
      {
        h2: 'What happens when something does not match',
        ask: true,
        paras: [
          '[[invoice-matching|The system compares what you ordered, what you received and what you were asked to pay]]. When the three disagree, the invoice stops and waits for a decision. It is not deleted, not approved automatically, and not left quietly in a folder until somebody notices it.',
          'The owner sees the mismatch as something that needs attention, not as a line in a monthly report. That is the difference between a system that manages a process and a system that enables a decision: a screen that only displays data is [[about|an operational screen, not a decision screen]].',
        ],
      },
      {
        // See the Hebrew page for why this one carries its own disclaimer.
        h2: 'An example: a partial delivery caught before payment',
        paras: [
          'This is not a customer case. It illustrates the one that costs the most money and is the hardest to catch by eye: paying in full for a partial delivery.',
        ],
        table: {
          headers: ['The document', 'What it says'],
          rows: [
            ['The purchase order', '40 crates of tomatoes, at that supplier\u2019s price list'],
            ['The goods receipt', '34 crates. Six short, marked from a phone at the receiving door'],
            ['The invoice', '40 crates, the full amount'],
          ],
        },
        after: [
          'Two comparisons would have missed it. The order and the invoice agree completely: same item, same quantity, same price. Only the third comparison, against what actually arrived, shows that the business is about to pay for goods it never received.',
          'The invoice stops and waits for a decision. Perhaps the supplier will send the rest, perhaps a credit note follows, and perhaps the quantity was agreed in advance and nothing is wrong. The system does not decide for anyone; it puts the gap in front of the person with the authority to settle it, and keeps the decision.',
        ],
      },
      {
        h2: 'Why there is no way around the approval',
        ask: true,
        paras: [
          'Most systems have a back door. A special permission, an emergency route, or an option for the owner to pay directly when it is urgent. That door opens at exactly the moments when the control is needed most.',
          'There is no such route here. A payment always goes through an approved request, with a reason and a record, and not even the owner can step around it. The emergency route existed in the system and was removed from it.',
          'What that means in practice is simple: when it is urgent, the process is the same process. The separation between the person who approves and the person who moves the money does not rest on the discipline of someone under pressure at the end of a day.',
        ],
      },
      {
        h2: 'What happens after the payment goes out',
        ask: true,
        paras: [
          'Plenty of procurement systems end the story at the transfer. In practice that is where the part it is easy to lose money in begins: a credit note promised and never received, a double payment nobody compared against the bank, and a confirmation sitting in the mailbox of someone who has left.',
        ],
        list: {
          label: 'What continues after the transfer',
          items: [
            'The payment confirmation is filed on the invoice itself, not in a separate folder',
            'A credit note is a document in its own right, linked to the invoice it came from',
            'Bank reconciliation runs against the actual transactions, so a payment that never left or left twice surfaces',
            'The accountant is the only one who does these, and the same record stays visible to the owner',
          ],
        },
        after: [
          'That is why the journey does not end at the payment but at the bank reconciliation and the reports. An invoice with no confirmation is an invoice nobody can prove was paid.',
        ],
      },
      {
        h2: 'Where my business ends and another one begins',
        ask: true,
        paras: [
          'The system serves several organisations on one set of infrastructure, and the separation between them is not a feature that can be switched off or forgotten. It is a founding principle of the system: every user belongs to one organisation, and every record is read through that link.',
          'For anyone weighing up moving their supplier list, price lists and payments in here, that is the question that needs an answer before the question of features.',
        ],
      },
      {
        h2: 'What the overview shows',
        ask: true,
        paras: [
          'Every screen in the system was built on one principle: that a manager understands within seconds what needs attention, what may cost money, and where the business stands right now. Success is defined plainly — a manager opens the screen and knows within ten seconds what his next three actions are.',
          'Which is why the system carries no invented static figures. A measure with no data behind it shows a dash, not a zero, because a zero is a claim about reality rather than an absence of information.',
        ],
      },
      {
        h2: 'What it is not',
        ask: true,
        list: {
          label: 'Four things the system does not try to be',
          items: [
            'Not another metrics screen with no decision on it',
            'Not an expense product that measures value by how much you spent',
            'Not [[vs-erp|a general ERP for every department in the organisation]]',
            'Not a loud or colourful SaaS brand. The system handles other people’s money',
          ],
        },
      },
      {
        h2: 'How to start',
        ask: true,
        paras: [
          'You can start with a single supplier. The free plan takes 20 documents a month and every other capability is open on it, because what separates the plans is the number of documents rather than a list of features.',
          'No credit card is needed to begin, and you can move between plans at any point. Accumulated data stays in full even when moving to a lower plan.',
        ],
      },
    ],
    image: {
      src: 'assets/screen-office-suppliers-en.webp',
      w: 2000,
      h: 1334,
      alt: 'The suppliers screen in InPlace: every supplier with its category, contact, minimum order and open alerts',
      cap: 'Every supplier in one place, with what you need to know about them before you order.',
    },
    related: ['supplier-invoices', 'invoice-matching', 'vs-erp'],
    source: 'PRODUCT.md (Users, Capability contract, Product Purpose); en.ts (plans)',
  },

  // ---------------------------------------------------------------- 2 of 6
  {
    slug: 'supplier-invoices',
    nav: 'Supplier invoices',
    title: 'Supplier invoice management, end to end | InPlace',
    description:
      'Supplier invoice management from arrival to bank transfer: linked to its order, checked against goods received, approved and filed with its confirmation.',
    eyebrow: 'Supplier invoices',
    h1: 'Supplier invoices, from arrival to transfer',
    lede:
      'An invoice that arrives by email and is saved to a folder is not managed, it is stored. Management begins the moment the invoice is linked to the order it came from and to the goods that actually arrived.',
    sections: [
      {
        h2: 'What happens to an invoice from the moment it arrives',
        ask: true,
        list: {
          label: 'The path of a single invoice',
          items: [
            'The invoice arrives and receives a row, a status and a link to its order',
            '[[invoice-matching|The system compares what was ordered, what was received and what is being claimed]]',
            'Whatever does not match stops and waits for a decision, instead of surfacing at month end',
            'After approval, a payment request is created',
            'The accountant executes the approved payment and uploads the confirmation',
          ],
        },
      },
      {
        h2: 'Who sees what',
        ask: true,
        paras: [
          'Procurement sees the amount, the status and whether the invoice was paid, but does not run payments and sees no bank or financial reports. The accountant sees approved invoices only, with the minimum context of their order and receipt.',
          'This is separation of duties: whoever approves is not whoever transfers, and there is no route around it, however urgent.',
        ],
      },
      {
        h2: 'Credit notes and bank reconciliation',
        paras: [
          'A credit note is not a document filed to one side. It is part of the same chain, and the accountant is the one who processes it and reconciles it against the bank. Procurement sees the credit note’s status in the procurement context only.',
        ],
      },
      {
        h2: 'What happens to an invoice that does not match',
        ask: true,
        paras: [
          'It stops. Not deleted, not approved with a caveat, and not waiting quietly. It is marked as a mismatch and waits for a decision from whoever is authorised to take it.',
          'The difference from ordinary working practice is timing. Without a system, a gap between the order and the invoice surfaces at month end, after the money has gone, and dealing with it means a correspondence with the supplier. With a system it surfaces before payment, and dealing with it is a decision.',
        ],
      },
      {
        h2: 'Reports and export',
        paras: [
          'The owner and the accountant see reports and export them. Procurement sees no financial reports and does not export — not because there is no need, but because that information is not part of the role inside the system.',
          'The monthly export is part of the accountant’s work, alongside bank reconciliation and credit notes.',
        ],
      },
      {
        h2: 'The record',
        paras: [
          'Every sensitive financial action is recorded, on every plan, the free one included. A confirmation uploaded after payment stays attached to the invoice and to the order everything started from.',
          'A record is not an addition for the annual audit. It is what makes it possible to answer [[about|“who approved this, and why”]] without searching somebody else’s inbox.',
        ],
      },
      {
        h2: 'Why an invoice is never deleted',
        ask: true,
        paras: [
          'A wrong invoice is still a document that arrived. Deleting it solves the discomfort and erases the trail: afterwards there is no way to explain why the supplier believes they are owed money and you believe they are not.',
          'Instead a credit request is opened against it, with the reason, and it stays open until the money comes back. The credit note is a document in its own right, linked to the invoice it came from, and the accountant is the one who posts it.',
          'The procurement manager sees that the credit exists and what its status is, in the procurement context only. They do not post it themselves.',
        ],
      },
      {
        h2: 'What happens when an invoice is paid twice',
        ask: true,
        paras: [
          'A double payment is the hardest kind to catch, because each of the two looks correct on its own. Neither is unusual. What is unusual is that there are two.',
          'Two checks catch it at two different points. Before the payment, the suspected-double-charge alert compares the invoice number against the same supplier. After the payment, bank reconciliation compares against the actual transactions, which surfaces both a payment that went out twice and one that never left at all.',
          'That reconciliation is why the journey does not end at the transfer. Until the bank transaction has been matched, what is known is that an instruction was sent, not that the money moved.',
        ],
      },
      {
        h2: 'What is left when someone leaves the business',
        ask: true,
        paras: [
          'In [[vs-spreadsheet|work split between mail, chat and a spreadsheet]], a great deal of the knowledge sits with a person. Who agreed what with the supplier, why that price was approved, where the confirmation is. When the person leaves, it leaves with them.',
          'Here the knowledge sits on the document. The confirmation is filed on the invoice rather than in a separate folder, the reason for an approval is kept with the approval, and a credit note is linked to the invoice it came from. None of it depends on a particular person still being here.',
          'That is what the question “who approved this, and why” means, when it can be answered without searching someone else’s mailbox.',
        ],
      },
    ],
    image: {
      src: 'assets/screen-office-credits-en.webp',
      w: 2000,
      h: 799,
      alt: 'The credits screen in InPlace: credit requests against suppliers, the reason for each and the invoice it is linked to',
      cap: 'A wrong invoice is not deleted. A credit request opens against it, and stays open until the money comes back.',
    },
    related: ['invoice-matching', 'procurement-software', 'guides/separation-of-duties'],
    source: 'PRODUCT.md (Capability contract, Product Purpose); en.ts (chapter 02, why.yes)',
  },

  // ---------------------------------------------------------------- 3 of 6
  {
    slug: 'invoice-matching',
    nav: 'Invoice matching',
    title: 'Matching an invoice to its purchase order and goods receipt | InPlace',
    description:
      'Automatic comparison of the purchase order, the goods received and the invoice. A gap stops before payment, instead of surfacing after the money has left.',
    eyebrow: 'Invoice matching',
    h1: 'Matching the invoice to the order and the goods received',
    lede:
      'Three documents describe the same purchase: what was ordered, what arrived, and what you are being asked to pay. When one of them disagrees with the other two, that is precisely the moment a business loses money without knowing it.',
    sections: [
      {
        h2: 'Two numbers, one supplier',
        paras: [
          'The purchase order to the supplier said one amount. The invoice from that same supplier asked for another. Without a system, nobody puts the two side by side, and what the invoice says is what gets paid.',
          'This is not a rare fault. It is the default of [[vs-spreadsheet|work split between a spreadsheet, a WhatsApp group and an email folder]].',
        ],
      },
      {
        h2: 'What the system compares',
        ask: true,
        list: {
          label: 'The three points of comparison',
          items: [
            'What was ordered: the purchase order and the price list it was built from',
            'What was received: the goods receipt, marked off from a phone at the receiving door',
            'What is being claimed: [[supplier-invoices|the invoice that arrived from the supplier]]',
          ],
        },
        after: [
          'Whatever does not match between the three stops and waits for a decision. The owner sees it as something requiring attention, not as a line in a report somebody may read.',
        ],
      },
      {
        h2: 'Why it stops before payment and not after',
        ask: true,
        paras: [
          'Payment always goes through an approved request. There is no emergency route around the approval, and no permission that allows an unchecked invoice to be paid. A mismatch discovered after the transfer is no longer a decision, it is a correspondence.',
        ],
      },
      {
        h2: 'Goods receipt from a phone',
        paras: [
          'The goods receipt flow was designed for mobile first, because that is where it happens. What is missing gets marked at the receiving door rather than a week later, and without that marking the comparison runs on a figure nobody checked.',
          'This is the point at which it is easy to give up. You can assume that what was ordered is what arrived, and then compare two documents instead of three. That assumption is almost always right, and the loss sits precisely in the cases where it is not.',
        ],
      },
      {
        h2: 'Who decides on a mismatch',
        ask: true,
        paras: [
          'Not every mismatch is an error. Sometimes the price rose by agreement, sometimes a different quantity arrived by arrangement, and sometimes the supplier is right. The system does not decide for anyone; it puts the gap in front of whoever is authorised to decide, and keeps the decision.',
          'What it does prevent is a route around it. Payment always goes through an approved request, and no permission allows the approval to be skipped. The separation between whoever approves and whoever transfers holds even when it is urgent.',
        ],
      },
      {
        h2: 'Why three documents and not two',
        ask: true,
        table: {
          headers: ['What is compared', 'What it catches'],
          rows: [
            ['Order against invoice', 'A price that moved, an item never ordered, a duplicate'],
            ['Order against receipt', 'What never arrived, what arrived in part, what arrived damaged'],
            ['Receipt against invoice', 'Payment for goods that were never actually received'],
          ],
        },
        after: [
          'Two of the three comparisons catch most cases. Three also catch the one that costs the most money: paying in full for a partial delivery.',
        ],
      },
      {
        h2: 'The four alerts this screen raises',
        paras: [
          'Not every gap looks like a gap. Some of them look like a perfectly ordinary invoice, and they are caught only because something is being compared against something else.',
        ],
        table: {
          headers: ['The alert', 'What sits behind it'],
          rows: [
            ['Suspected double charge', 'Same supplier, same invoice number, twice. In a mail folder nobody would have noticed'],
            ['A price that went up', 'The invoice asks for more than the price list the order was built from'],
            ['An invoice with no order', 'A payment request arrived for something nobody ordered through the system'],
            ['An order not yet approved', 'The goods are on the way or already here, and the approval has not been given'],
          ],
        },
        after: [
          'The first three are about money that is about to leave. The fourth is about order: an unapproved order is not necessarily a mistake, but it is a state that should close before the invoice for it arrives.',
        ],
      },
      {
        h2: 'What is kept from the decision',
        ask: true,
        paras: [
          'When someone settles a mismatch, the ruling itself is a record. Who approved it, when, and what the reason was. That is kept with the document rather than in the memory of whoever was there.',
          'The practical value shows up months later, when the question is [[about|why this supplier was paid a different price from the one on their list]]. The answer sits on the invoice, not in the mailbox of someone who has left.',
          'Every sensitive financial action is recorded on every plan, the free one included. A record is not a capability you buy in an upgrade.',
        ],
      },
      {
        h2: 'And if nobody marked the goods receipt',
        ask: true,
        paras: [
          'Then the comparison knows less, and the system says so rather than pretending otherwise. A measure with no data behind it shows a dash and not a zero, because a zero is a claim about reality and a missing mark is an absence of information.',
          'This is the one point in the chain that depends on a person. Everything else happens by itself: the invoice is linked, the comparison runs, the mismatch stops. The mark at the receiving door is what turns a two-document comparison into a three-document one, and that is the difference that catches the most expensive case.',
        ],
      },
    ],
    image: {
      src: 'assets/screen-owner-alerts-en.webp',
      w: 2000,
      h: 788,
      alt: 'The alerts screen in InPlace: a suspected duplicate charge, orders not yet confirmed, prices that rose, and invoices with no order',
      cap: 'The same supplier, the same invoice number, twice. Nobody catches that in a folder.',
    },
    related: ['supplier-invoices', 'procurement-software', 'vs-spreadsheet'],
    source: 'PRODUCT.md (Product Purpose, Design Principles 5); en.ts (film blocks, chapter 02)',
  },

  // ---------------------------------------------------------------- 4 of 6
  {
    slug: 'vs-spreadsheet',
    nav: 'InPlace vs a spreadsheet',
    title: 'InPlace vs a spreadsheet for procurement | InPlace',
    description:
      'A spreadsheet manages a list, not a chain. What a procurement system adds: linked documents, separation of duties and a stop before the payment goes out.',
    eyebrow: 'Comparison',
    h1: 'A spreadsheet against a procurement system',
    lede:
      'A spreadsheet is a good tool, and that is exactly why it survives long past the point where it stops being enough. It manages a list beautifully. It does not manage a chain.',
    sections: [
      {
        h2: 'What a spreadsheet does well',
        ask: true,
        paras: [
          'It is available, everybody knows how to use it, and it obliges nobody to learn a system. A business starting out with one supplier and five orders a month needs nothing else.',
        ],
      },
      {
        h2: 'Where it breaks',
        ask: true,
        list: {
          label: 'The four breaking points',
          items: [
            'No link between documents: the order is in the sheet, the delivery note is in a binder and the invoice is in email, and nobody compares them',
            'No permissions: whoever can see can also change, and whoever changed is not recorded',
            'No stop: a spreadsheet cannot hold a payment, because it does not know that something is wrong',
            'No single source of truth: there are three versions of the same file, and one of them is right',
          ],
        },
      },
      {
        h2: 'What a system adds',
        table: {
          headers: ['In a spreadsheet', 'In InPlace'],
          rows: [
            ['A row somebody typed', 'A document with a status and a link to the order it came from'],
            ['A manual comparison, if somebody remembers', '[[invoice-matching|An automatic comparison of order, receipt and invoice]]'],
            ['Anyone who has the link', 'Three roles and separation of duties'],
            ['Partial change history', 'A record of every sensitive financial action'],
          ],
        },
      },
      {
        h2: 'What happens as the business grows',
        ask: true,
        paras: [
          'A spreadsheet does not break in a day. It breaks slowly: a tab is added, a column is added, a second file appears for the second location, and then somebody sends a version over WhatsApp and from that moment there are two truths.',
          'The clearest sign is not the size of the file but the question “which version are we working from”. Once it is asked, the spreadsheet has already stopped being the source of truth.',
        ],
      },
      {
        h2: 'What does not transfer from the spreadsheet',
        ask: true,
        paras: [
          'The habit of “I will remember to check”. A method that rests on one person’s memory works perfectly until the day he is on holiday, and stops working without announcing it.',
          'InPlace asks nobody to remember. The comparison of order, receipt and invoice runs every time, and an invoice that arrived on a busy day is checked exactly as closely.',
        ],
      },
      {
        h2: 'When it is worth moving',
        ask: true,
        paras: [
          'When more than one person touches the same purchase. The moment an order passes between [[about|procurement, whoever receives the goods and the accountant]], the spreadsheet no longer describes reality but only a part of it.',
          'You can start with one supplier and leave the spreadsheet open beside the system. Comparing the two after a month is the most honest test available.',
        ],
      },
      {
        h2: 'Why a spreadsheet cannot stop a payment',
        ask: true,
        paras: [
          'This is not a question of how well the spreadsheet is built. You can put formulas in it that turn every gap between two columns red, and it still stops nothing, because the payment does not pass through it. It happens somewhere else: at the bank, on the phone, in a transfer someone made because the supplier called.',
          'A system stops things because it sits on the route. [[supplier-invoices|The payment request is created inside it, the approval is given inside it, and the accountant pays from it]]. An invoice that was never checked simply has no way to become an approved request.',
          'The difference is not between a clever tool and a dim one. It is between a tool that describes reality and a tool that reality passes through.',
        ],
      },
      {
        h2: 'You can keep exporting to a spreadsheet',
        ask: true,
        paras: [
          'Yes, and it is not a concession. The owner and the accountant see reports and export them, and the monthly export is part of the accountant\u2019s ordinary work alongside reconciliations and credit notes.',
          'What changes is the direction. The spreadsheet stops being the place the data lives and is kept, and becomes the place you take it to when you want to cut it a different way. That is the use a spreadsheet is genuinely good at.',
        ],
      },
      {
        h2: 'How much work is it to move the suppliers over',
        ask: true,
        paras: [
          'Less than it looks, because there is no need to move everything. Start with one supplier, usually the one that generates most of the orders or most of the trouble, and leave the rest in the spreadsheet for now.',
          'The most honest test is to run both side by side for a month. At the end of it the comparison is not between two feature lists but between two pictures of the same business, and one of them caught things the other missed, or it did not.',
        ],
      },
    ],
    image: {
      src: 'assets/screen-office-prices-en.webp',
      w: 2000,
      h: 1334,
      alt: 'The price list screen in InPlace: current against previous price for every product, with the percentage change and the date it took effect',
      cap: '66 supplier prices, and seven rises it marked by itself. This is the spreadsheet nobody actually keeps up.',
    },
    related: ['vs-erp', 'invoice-matching', 'guides/separation-of-duties'],
    source: 'brand/context.md (Alternatives); en.ts (why.yes, why.no, film blocks)',
  },

  // ---------------------------------------------------------------- 5 of 6
  {
    slug: 'vs-erp',
    nav: 'InPlace vs an ERP',
    title: 'InPlace vs an ERP for procurement | InPlace',
    description:
      'An ERP covers every department. InPlace does one thing: the chain from order to payment. What the difference is, and when each one is the right choice.',
    eyebrow: 'Comparison',
    h1: 'An ERP against a dedicated procurement system',
    lede:
      'An ERP is not a bad product. It is a different product. It was built to cover every department in an organisation, and that is exactly what makes it heavy for a business that needs one thing: that the money does not leave before somebody has checked.',
    sections: [
      {
        h2: 'What InPlace refuses to be',
        ask: true,
        list: {
          label: 'Four things, from the positioning document',
          items: [
            'Not another dashboard of metrics with no decision on it',
            'Not an expense product that defines value through spending alone',
            'Not a heavy general ERP',
            'Not a loud or colourful SaaS brand',
          ],
        },
      },
      {
        h2: 'The practical difference',
        table: {
          headers: ['A general ERP', 'InPlace'],
          rows: [
            ['Every department in the organisation', 'One chain: from the order to the bank transfer'],
            ['An implementation project', 'You can start with a single supplier'],
            ['Permissions defined during implementation', 'Three fixed roles, built into the system'],
            ['A procurement module inside a large system', 'The whole product is the procurement'],
          ],
        },
      },
      {
        h2: 'When an ERP is the right choice',
        ask: true,
        paras: [
          'When the organisation needs one system for manufacturing, inventory, people, finance and procurement, and when it has the time and the people for an implementation of that size. In that case the ERP’s procurement module works against the same data as the rest of the organisation, and that is worth something.',
          'The businesses InPlace was built for sit on the other side of that line: they need [[procurement-software|control over procurement now]], not a project.',
        ],
      },
      {
        h2: 'The cost of implementation, not the cost of the licence',
        paras: [
          'The large expense in an enterprise system is not the monthly price but the time of the people who have to learn it, configure it and migrate data into it. An ERP is built on the assumption that this project exists and is budgeted for.',
          'InPlace was built on the opposite assumption: that you can start with one supplier on a Monday, and that the system has to prove itself before anybody allocates a project to it.',
        ],
      },
      {
        h2: 'What happens when you need both',
        ask: true,
        paras: [
          'It happens. An organisation with an ERP running manufacturing and inventory can still suffer from procurement managed over WhatsApp, because the ERP’s procurement module was never implemented to the end.',
          'In that case the question is not which system wins but [[invoice-matching|where the payment decision is taken]]. Whichever system holds that decision should also hold the comparison that leads to it.',
        ],
      },
      {
        h2: 'What they have in common',
        ask: true,
        paras: [
          'Both require the work to pass through them. A system somebody bypasses over WhatsApp is not a system, whether it cost a hundred thousand or nothing at all.',
          'The difference is how easy it is to bypass. When the system covers one complete chain and speaks the language of the people working in it, going around it stops being the short way.',
        ],
      },
      {
        h2: 'What an ERP does that this does not',
        ask: true,
        paras: [
          'A great deal. Manufacturing, complex inventory, human resources, full bookkeeping, project management and costing. All of it is out of scope here, not because it does not matter but because this product does one thing: the journey from the order to the bank transfer.',
          'That is said plainly because a feature list is where it is easy to promise more than exists. A business that needs those things will be better served by an ERP, and that is the right answer even when it is not the convenient one.',
        ],
      },
      {
        h2: 'Why three fixed roles instead of flexible permissions',
        ask: true,
        paras: [
          'In an ERP, permissions are built during implementation, to whatever the organisation asks for. That is flexible, and that is exactly the weakness: a separation of duties somebody configured is a separation somebody can unconfigure, usually under pressure and in the middle of a month.',
          'Here there are three roles and no more: owner, procurement manager and accountant. They cannot be redefined, and what each of them sees and does is [[about|fixed in the structure of the system]]. The accountant is the only one who moves money, and the procurement manager does not touch payments or the bank at all.',
          'The cost is flexibility. What you get for it is that the separation still exists in the third month, when nobody remembers why it was set up that way.',
        ],
      },
      {
        h2: 'What happens to the data if you stop',
        ask: true,
        paras: [
          'It belongs to the customer, and that is written into the terms of use rather than only asserted here. Moving between plans deletes nothing: what has accumulated stays in full even on the way down, because the difference between plans is the number of documents a month and not the list of features.',
          'That is a question worth asking any software supplier before the implementation rather than after it, and particularly one that holds the payment chain of the business.',
        ],
      },
    ],
    image: {
      src: 'assets/screen-owner-analytics-en.webp',
      w: 2000,
      h: 1334,
      alt: 'The supplier performance screen in InPlace: lead time, on-time rate, price changes and open exceptions for every supplier',
      cap: 'The question an ERP answers after an implementation project. Here it is a screen.',
    },
    related: ['vs-spreadsheet', 'procurement-software', 'supplier-invoices'],
    source: 'brand/positioning.md (what InPlace refuses to be); brand/context.md (Alternatives)',
  },

  // ---------------------------------------------------------------- 6 of 6
  {
    slug: 'about',
    nav: 'About',
    title: 'About InPlace: what the system is, and who it serves',
    description:
      'InPlace is a procurement-to-payment control system. What the system does, the principles it was built on, and the three roles that work inside it.',
    eyebrow: 'About',
    h1: 'About InPlace',
    lede:
      'The name says two things. Everything in place: every document, order, invoice and payment has a defined and known place. And in place in the control sense: a mechanism that actually exists and holds.',
    sections: [
      {
        h2: 'What the system does',
        ask: true,
        paras: [
          'InPlace is a procurement-to-payment system, written in Hebrew and read right to left, with this English edition beside it. It connects the chain from the supplier to the bank transfer into one source of truth, and surfaces what needs action without becoming another crowded screen.',
        ],
      },
      {
        h2: 'The principles it was built on',
        list: {
          label: 'Five principles, from the product documents',
          items: [
            'A decision screen, not a display screen: every addition is judged by whether it shortens the path from arrival to decision',
            'Truth over convenience: no invented figure, and no zero pretending to be data. A measure with no data shows a dash, not a zero',
            'One semantic language: colour marks meaning and never decoration, and meaning never rests on hue alone',
            'Earned familiarity: standard components and the same visual vocabulary on every screen',
            'Hebrew and mobile are first-class citizens, not an adaptation made at the end',
          ],
        },
      },
      {
        h2: 'The three roles',
        paras: [
          'Owner, procurement and accountant. All three work on the same chain, and none of them sees or does what belongs to another. The accountant is the only one who executes transfers, and payment always passes through an approved request carrying a reason and a record.',
        ],
      },
      {
        h2: 'What the system refuses to be',
        ask: true,
        list: {
          label: 'Four refusals, from the positioning document',
          items: [
            'Not another metrics screen with no decision on it',
            'Not an expense product that defines value through spending alone',
            'Not a heavy general ERP',
            'Not a loud, colourful or “magical” SaaS brand',
          ],
        },
        after: [
          'These refusals are not modesty. They are what allows the system to do one thing well instead of four things approximately.',
        ],
      },
      {
        h2: 'Character',
        paras: [
          'Clear, dependable, calm. An interface that handles other people’s money and is therefore never loud, never tries to surprise, and never asks for attention on its own account. The tool disappears into the task.',
          'In practice that means the system carries no animation that does not signal state, no tiny low-contrast text and no critical action hidden behind a hover.',
        ],
      },
      {
        h2: 'Who stands behind the system',
        ask: true,
        // The two names and the biography come from src/content/people.ts. See
        // the note on the Hebrew twin of this section.
        paras: [
          'InPlace is a product of In Place, a business registered in Israel. The details here are the same details that appear in the site’s structured data, so that anyone checking who is asking for access to their financial information gets one answer in both places.',
        ],
        people: true,
        table: {
          headers: ['Detail', 'Value'],
          rows: [
            ['Registered name', 'In Place'],
            ['Registration number', '036689081'],
          ],
        },
      },
      {
        // The statement, not a description of values. See the note in
        // src/content/pages.ts: Israeli regulation asks for specific things, and
        // what stood here was a paragraph and a half lifted from PRODUCT.md's
        // Accessibility chapter -- true, and about the product rather than about
        // this site. Every claim in the second paragraph is a gate that runs on
        // every build.
        h2: 'Accessibility statement',
        paras: [
          'InPlace is meant to work for someone using a keyboard alone, a screen reader, or a system preference to reduce motion. Accessibility is built into the code rather than added by a plug-in, and each of the adaptations below is measured on every build and fails it if it stops being true.',
          'Text contrast is at least 4.5 to 1, measured on the composited image — what the eye actually sees — on both grounds of the page and in both the light and dark views. Anything operable with a mouse is reachable from the keyboard, and the focus indicator is visible at every stop. When the operating system asks for reduced motion, the animations and the moving ground stop. Meaning never rests on colour alone: every status carries text or a mark as well, because a reader who does not distinguish a hue still needs to know what requires attention. Six of the pages on this site read in full with no JavaScript at all.',
          'Known limitations: the film on the home page is a silent animation with no speech, so it carries no captions; it does carry a text description for a screen reader. The application itself, at app.inplace.digital, is a separate service and this statement does not cover it.',
          'Found something that is not accessible, or ran into difficulty? We would like to know. Accessibility enquiries reach the address in the table below, and we act on them and reply.',
        ],
        table: {
          headers: ['Detail', 'Value'],
          rows: [
            ['Standard', 'Israeli Standard 5568, based on WCAG 2.1'],
            ['Conformance level', 'AA'],
            ['Tested in', 'Google Chrome'],
            ['Accessibility enquiries', 'support@inplace.digital'],
            ['Statement date', '31.08.2026'],
            ['Last updated', '31.08.2026'],
          ],
        },
      },
    ],
    image: {
      src: 'assets/screen-accountant-bank-en.webp',
      w: 2000,
      h: 1334,
      alt: 'The bank reconciliation screen in InPlace: statement lines against the payments and invoices already in the system',
      cap: 'The third role. The accountant receives the lines already matched, not a file at the end of the month.',
    },
    related: ['procurement-software', 'vs-erp', 'supplier-invoices'],
    source:
      'brand/context.md (Name meaning, Values); PRODUCT.md (Design Principles, Accessibility, Users)',
  },

  // ---------------------------------------------------------------- 7 of 8
  // The English edition of the two legal documents. The Hebrew text is the one
  // a user consents to inside the product; this is the same document in
  // English, and the note under the title says which one governs. A page that
  // quietly presents a translation as the agreement is the failure to avoid.
  {
    slug: 'terms',
    nav: 'Terms of use',
    legal: true,
    title: 'Terms of use | InPlace',
    description:
      'The terms of use for InPlace: accounts and permissions, ownership of customer data, automatic document processing, availability, liability and ending the engagement.',
    eyebrow: 'Legal',
    h1: 'Terms of use',
    lede:
      'The same terms shown inside the system, in English. The Hebrew version is the one a user consents to on joining, and it governs.',
    sections: [
      {
        h2: '1. The service',
        paras: [
          'InPlace is a system for managing procurement, invoices and payments for businesses (“the service”), operated by the service operator (“the operator”). Use of the service is intended for businesses and for users invited by a business (“the customer”), and is subject to these terms. Joining the service constitutes agreement to these terms and to the privacy policy.',
        ],
      },
      {
        h2: '2. Accounts and permissions',
        paras: [
          'Every user acts under a personal account and in the role the customer defined for them. The user is responsible for keeping their sign-in details confidential and for every action taken from their account. Sensitive actions are written to an audit log.',
        ],
      },
      {
        h2: '3. The customer’s data',
        paras: [
          'The business data the customer enters or uploads (suppliers, orders, invoices, documents) belongs to the customer. The operator processes it solely in order to provide the service, as set out in the privacy policy, and does not sell it to third parties.',
        ],
      },
      {
        h2: '4. Automatic document processing',
        paras: [
          'The service includes automatic reading and interpretation of documents (OCR and an artificial-intelligence model). The result of that interpretation may be wrong; it is marked as such when confidence is low, and can always be reviewed and reversed by an authorised user. Responsibility for the correctness of the financial records rests ultimately with the customer.',
        ],
      },
      {
        h2: '5. Availability and liability',
        paras: [
          'The operator works towards high availability of the service but does not undertake to provide uninterrupted availability. The service is provided AS-IS. The operator shall not be liable for indirect or consequential damage; its total liability is limited to the amount the customer paid for the service in the twelve months preceding the event. None of the above derogates from liability that cannot be limited by law.',
        ],
      },
      {
        h2: '6. Ending the engagement',
        paras: [
          'The customer may stop using the service at any time. On ending the engagement the customer is entitled to receive a copy of their data in a common format, on request to the operator. The operator may suspend an account for a material breach of these terms, with a reasoned notice.',
        ],
      },
      {
        h2: '7. Changes to the terms, and governing law',
        paras: [
          'A material update to the terms will be accompanied by a notice to users. These terms are governed by Israeli law, and the competent courts in Israel have jurisdiction.',
        ],
      },
    ],
    related: [],
    source: 'NIR-APP src/pages/Legal.tsx (TermsOfService), English edition',
  },

  // ---------------------------------------------------------------- 8 of 8
  {
    slug: 'privacy',
    nav: 'Privacy policy',
    legal: true,
    title: 'Privacy policy | InPlace',
    description:
      'The InPlace privacy policy: what is collected and why, which sub-processors handle the data, what happens at the AI model provider, and your rights.',
    eyebrow: 'Legal',
    h1: 'Privacy policy',
    lede:
      'The same policy shown inside the system, in English. Section 3 describes what happens at the model provider in the provider’s own terms, not as an undertaking by the operator. The Hebrew version governs.',
    sections: [
      {
        h2: '1. What is collected, and why',
        paras: [
          '<b>Account details:</b> name, email address, telephone (optional) and role — for identification, permissions and sign-in. <b>Business data:</b> suppliers, orders, invoices, payments and documents the customer uploads — in order to provide the service itself. <b>Activity logs:</b> sensitive actions are written to an audit log with the identity of whoever performed them and the reason — for security and accountability. <b>Technical data:</b> sign-in tokens and push notifications on the device — for operation. The legal basis for processing: performance of the engagement with the customer, and the user’s consent on joining.',
        ],
      },
      {
        h2: '2. Who processes the data',
        paras: [
          'The data is stored and processed by the sub-processors the service uses: Supabase (database, authentication and file storage), OpenAI (automatic interpretation of the content of uploaded documents), Cloudflare (application hosting), Resend (operational email) and Sentry (error reporting). The operator does not sell personal information and does not use it for advertising.',
        ],
      },
      {
        h2: '3. What happens at the model provider',
        paras: [
          'When a document is sent for automatic interpretation, its content reaches OpenAI. The details below were checked against the provider’s official terms on 24.08.2026, and they describe what the provider says — not an undertaking given by the operator in its place.',
          '<b>Training:</b> under the provider’s terms, data sent through the API is not used to train models unless the organisation has explicitly chosen to share it. The operator has not chosen that. <b>Retention:</b> the provider may retain input and output <b>for up to 30 days</b> in order to provide the service and detect abuse, and for longer where the law requires it or where it is needed to protect the service or a third party from harm. <b>Human review:</b> abuse logs may include the text itself, and under the provider’s terms they are accessible to its authorised employees <b>and to third-party contractors</b> bound by confidentiality, for the purpose of abuse review only.',
          '<b>What the system does, and what carries no promise:</b> on every call the system asks the provider not to store the response for later retrieval (store: false). That is a request in the provider’s interface and not an undertaking by it, and it does <b>not</b> prevent the abuse logs described above. A zero-retention arrangement with the provider requires prior approval and a separate agreement; while no such agreement exists, <b>the operator does not promise zero retention</b>.',
          '<b>Where processing happens:</b> no regional restriction has been configured with the provider, so processing and temporary storage there may take place outside Israel, including outside the European Union. Israel is not a supported region at the provider. Even on region-restricted plans, system data and metadata may leave the region.',
        ],
      },
      {
        h2: '4. Customer separation and security',
        paras: [
          'Each customer’s data is separated at the database level (row-level security by organisation), access is encrypted (TLS), sensitive actions require a fresh password check, and files are kept in a private bucket whose access is restricted to the organisation alone.',
        ],
      },
      {
        h2: '5. Retention and deletion',
        paras: [
          'Financial records are kept for the duration of the engagement and in accordance with record-keeping obligations under the law. Deletion of a financial record is a “soft delete” that preserves audit traceability. On ending the engagement you may request a copy of the data and deletion of whatever there is no legal obligation to keep.',
        ],
      },
      {
        h2: '6. Your rights',
        paras: [
          'Under the Israeli Protection of Privacy Law, 5741-1981 (as amended by Amendment 13), you have the right to review the information collected about you, to request correction of incorrect information, and to request deletion subject to obligations under the law. To raise a matter — contact the business that invited you, or the service operator.',
        ],
      },
      {
        h2: '7. Cookies and local storage',
        paras: [
          'The service uses browser local storage to manage sign-in and to work offline (receipt drafts and photographs waiting for a connection). No advertising cookies and no third-party tracking are used.',
        ],
      },
    ],
    related: [],
    source: 'NIR-APP src/pages/Legal.tsx (PrivacyPolicy), English edition',
  },
  // --------------------------------------------------------------- guide 1
  // See the Hebrew file for why the content hub exists and why it sits under
  // /guides/.
  {
    slug: 'guides/separation-of-duties',
    nav: 'Separation of duties',
    title: 'Separation of duties in procurement: who approves, who pays | InPlace',
    description:
      'Whoever approves a cost is not whoever moves the money. What that rule means in a small business, where it breaks, and how to start when one person does everything.',
    eyebrow: 'Guide',
    h1: 'Who approves a supplier payment, and who makes it',
    lede:
      'In a small business the same person orders, receives the goods, approves the invoice and moves the money. It works, until it does not. This guide is about the rule that prevents that, and why it matters long before there is a finance department.',
    sections: [
      {
        h2: 'What separation of duties is',
        ask: true,
        paras: [
          'The rule itself is one sentence: whoever approves a cost is not whoever moves the money. Two different people, two different actions, and a record showing who did which.',
          'The idea comes from audit, and there it sounds like bureaucracy. In a small business it sounds entirely different, because it is not protecting the company from its staff. It is protecting the business from a mistake nobody would catch, and protecting the person from being the only one who can explain what happened.',
        ],
      },
      {
        h2: 'Why this is not only for large organisations',
        ask: true,
        paras: [
          'In a large organisation separation of duties prevents fraud. In a small business it mostly prevents duller things that are far more common: a double payment, a payment for goods that never arrived, a price that went up unnoticed, a credit note promised and forgotten.',
          'None of those has a villain in it. Each has a busy person who saw one document rather than three, approved, and paid. When one person does both actions, there is no moment at which somebody else looks.',
        ],
      },
      {
        h2: 'Three roles, and what each one cannot do',
        paras: [
          'The division below is the one [[procurement-software|InPlace is built on]], and it is an example of a division that works. What matters in it is not the names but the second column: what each role cannot do.',
        ],
        table: {
          headers: ['The role', 'What it cannot do'],
          rows: [
            ['Owner', 'Does not make payments. They approve the request; the execution belongs to somebody else'],
            ['Procurement manager', 'Does not run payments, does not touch the bank, does not post credit notes'],
            ['Accountant', 'Does not change an order, a product or a price list, and sees only invoices already approved'],
          ],
        },
        after: [
          'Note that none of the three is limited because they have no need. They are limited because the need of one is exactly what would make the other one\u2019s check worthless.',
        ],
      },
      {
        h2: 'What happens in a business without it',
        ask: true,
        paras: [
          'Nothing happens, for a long time. That is the misleading part. A business can run for years with one person doing everything, and most of the orders genuinely are fine.',
          'The loss is not one large event but an accumulation: a price that changed, a product that did not arrive, a credit note forgotten, an invoice never checked to the end. Each is too small to justify a check, and together they are the amount nobody saw.',
          'The sign that it is happening is not a deficit. It is the question “why did we pay this supplier so much this month”, asked at the end of the month with no answer that does not involve opening a mail folder.',
        ],
      },
      {
        h2: 'Where most businesses break',
        paras: [
          'Not at the definition. At the exception to it.',
          'Almost every system that defines permissions also allows them to be stepped around: an administrator right, an emergency route, or simply a bank transfer made outside the system because the supplier called and it was urgent. The moment that route exists, it opens in exactly the cases where the check was worth the most.',
          'A separation of duties that can be switched off under end-of-day pressure is not a separation of duties. It is a statement of intent.',
        ],
      },
      {
        h2: 'How to start when one person does everything',
        ask: true,
        paras: [
          'Nobody needs to be hired. The minimum separation already worth something is between whoever orders and whoever moves the money, and in most small businesses those two are already done by two different people in practice, just without it being written anywhere.',
        ],
        list: {
          label: 'Three steps, in order',
          items: [
            'Decide who approves. One person, in writing, even if it is the owner',
            'Decide that no transfer goes out without that approval, and that the approval is kept with the document rather than in a conversation',
            'Add the check: [[invoice-matching|a comparison of the order, the goods received and the invoice]] before the approval is given',
          ],
        },
        after: [
          'The third step is what turns the first two from discipline into a process. An approval without a check is a signature on a document nobody read.',
        ],
      },
      {
        h2: 'And what about a one-person business',
        ask: true,
        paras: [
          'There you cannot separate people, but you can separate moments. The check happens when the invoice arrives, and the approval is given at a set time rather than in the same breath. It sounds small, and it is the difference between looking at a document and comparing it against two others.',
          'What stays the same is the record. Even when the approver and the payer are one person, [[about|the answer to “who approved this, and why” has to be kept somewhere]] other than their memory.',
        ],
      },
    ],
    related: ['invoice-matching', 'procurement-software', 'supplier-invoices'],
    source: 'PRODUCT.md (Users, Capability contract); brand/positioning.md (proof points)',
  },
]

export default { pages: pagesEn, cta: CTA_EN }
