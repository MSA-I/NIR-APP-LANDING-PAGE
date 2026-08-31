# Content Quality

**Score: 94/100**  (weight 23%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- The prose is concrete, names the failure it prevents, and does not pad; no AI slop anywhere on the site
- Passages admit the tool is not always right, which is what makes a source both quotable and believable
- Two founder Person entities carry substantive biographies, and every sub-page WebPage node declares an author linked by @id to one of them
- The company publishes a street address, a registration number and two phone numbers
- The site states in llms.txt that the testimonials are in-house examples, rather than implying they are customer reviews
- The five commercial pages now carry a worked three-way-match example, the four alert types, what is kept from a decision, why there is no route around the approval, what happens after the payment, why an invoice is never deleted, why a spreadsheet cannot stop a payment, and what an ERP does that this does not
- 32 contextual links inside sentences, 16 per edition, with sixteen distinct Hebrew anchors and every destination covered; a build-time check makes a mistyped slug fail the build rather than ship a broken link
- A content hub at /guides/ with three guides in both editions, 26 declared questions between them, each linked into the product pages and each carrying the limits of its own advice

## Findings

### [Resolved] Commercial pages were thin for the field they are entering — FIXED

Hebrew word counts: /procurement-software/ 529, /invoice-matching/ 433, /vs-erp/ 391, /vs-spreadsheet/ 390, /supplier-invoices/ 388. English runs 526-731. Hebrew packs more meaning per word than English because prefixes attach, so 400 Hebrew words reads closer to 520 English; even adjusted these are short. A search for the head term returns established incumbents: StoreNext, Segment, CloudCom reselling Procurify, Mboss, CRTV, Rasner, plus Priority and Hashavshevet resellers with years of index history. Segment makes InPlace's exact core claim of verifying invoices against purchase orders and delivery reports in real time. RESOLVED 31.08.2026: all five pages deepened in both editions, 15 new sections in total. Hebrew: procurement-software 529 to 905, invoice-matching 433 to 694, supplier-invoices 388 to 650, vs-spreadsheet 390 to 611, vs-erp 391 to 621. English: 731 to 1290, 588 to 964, 533 to 899, 526 to 851, 537 to 867. Every capability sentence traces to ../NIR-APP/PRODUCT.md or the brand documents, and the one recommendation NOT acted on is recorded below.

**Fix:** Done, with one deliberate exception. This audit recommended adding the Israeli specifics no international competitor covers (Israel Invoices, VAT, shotef-plus terms). Nothing in PRODUCT.md or the brand documents says the system handles any of them, and the repository rule is that every capability sentence is traceable to a source document. Writing them would have been an invented capability claim on the page that ranks for the head term. It waits for a source rather than for a decision.

### [Partly resolved] There was no content hub — OPENED, three of five to eight guides

Nine pages per language, all of them product or legal. No blog, no guides, no glossary. For a domain with no backlink profile and no history this is the missing growth surface, and question-shaped content is also what AI answer engines retrieve against most readily. OPENED 01.09.2026 under /guides/, with three guides in both editions: separation of duties (the rule the whole product rests on and no page explained), the five recurring supplier payment mistakes and which comparison catches each, and what to do when a supplier invoice is wrong. The sitemap went from 18 URLs to 24, all paired with hreflang. Nested slugs needed no new machinery. Each guide answers a question somebody types before they have heard of the product, and each ends on the honest limit rather than the pitch: what no check will catch, and that a credit note is a promise until the bank transaction matches it.

**Fix:** Two to five more guides to reach the original target. The next by value: what to check before paying a new supplier, and how to move off a spreadsheet without stopping the business. Both need care about sourcing, which is what kept the Israeli tax specifics off the commercial pages.

### [Resolved] The page carrying the trust signals had one inbound link — FIXED

/about/ holds both founder biographies, both portraits and both Person entities. Exactly one internal link points at it, from the home page. The other sixteen pages do not link to it at all. RESOLVED: /about/ now has twelve inbound contextual links, six per edition, placed inside sentences that were already making the point they link on.

**Fix:** Done.

### [Resolved] All internal anchor text was identical and non-contextual — FIXED

Every link to /procurement-software/ reads 'tochnat rechesh'; every link to /invoice-matching/ reads 'hat'amat cheshbonit'. They all originate in the same further-reading block at the foot of each page. Not one contextual link exists inside a paragraph anywhere on the site. RESOLVED: 32 contextual links now render across the supporting pages, 16 per edition, and all sixteen Hebrew anchors are distinct. Every destination has inbound contextual links: /about/ 12, /invoice-matching/ 8, /supplier-invoices/ 4, /vs-spreadsheet/ 4, /procurement-software/ 2, /vs-erp/ 2. They are placed by a [[slug|anchor]] notation in the dictionaries rather than by hand-written anchors, because the same paragraph exists in two editions at two different paths and an <a> written into the English file would have sent an English reader to the Hebrew page silently. linkify resolves the path per edition and throws on a slug the site does not publish, so a typo fails the build instead of shipping a 404 inside a sentence.

**Fix:** Done. No copy was reworded to make room for a link: where a sentence had nothing worth linking, it did not get one.

