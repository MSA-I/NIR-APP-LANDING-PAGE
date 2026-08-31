# Content Quality

**Score: 84/100**  (weight 23%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- The prose is concrete, names the failure it prevents, and does not pad; no AI slop anywhere on the site
- Passages admit the tool is not always right, which is what makes a source both quotable and believable
- Two founder Person entities carry substantive biographies, and every sub-page WebPage node declares an author linked by @id to one of them
- The company publishes a street address, a registration number and two phone numbers
- The site states in llms.txt that the testimonials are in-house examples, rather than implying they are customer reviews
- The five commercial pages now carry a worked three-way-match example, the four alert types, what is kept from a decision, why there is no route around the approval, what happens after the payment, why an invoice is never deleted, why a spreadsheet cannot stop a payment, and what an ERP does that this does not

## Findings

### [Resolved] Commercial pages were thin for the field they are entering — FIXED

Hebrew word counts: /procurement-software/ 529, /invoice-matching/ 433, /vs-erp/ 391, /vs-spreadsheet/ 390, /supplier-invoices/ 388. English runs 526-731. Hebrew packs more meaning per word than English because prefixes attach, so 400 Hebrew words reads closer to 520 English; even adjusted these are short. A search for the head term returns established incumbents: StoreNext, Segment, CloudCom reselling Procurify, Mboss, CRTV, Rasner, plus Priority and Hashavshevet resellers with years of index history. Segment makes InPlace's exact core claim of verifying invoices against purchase orders and delivery reports in real time. RESOLVED 31.08.2026: all five pages deepened in both editions, 15 new sections in total. Hebrew: procurement-software 529 to 905, invoice-matching 433 to 694, supplier-invoices 388 to 650, vs-spreadsheet 390 to 611, vs-erp 391 to 621. English: 731 to 1290, 588 to 964, 533 to 899, 526 to 851, 537 to 867. Every capability sentence traces to ../NIR-APP/PRODUCT.md or the brand documents, and the one recommendation NOT acted on is recorded below.

**Fix:** Done, with one deliberate exception. This audit recommended adding the Israeli specifics no international competitor covers (Israel Invoices, VAT, shotef-plus terms). Nothing in PRODUCT.md or the brand documents says the system handles any of them, and the repository rule is that every capability sentence is traceable to a source document. Writing them would have been an invented capability claim on the page that ranks for the head term. It waits for a source rather than for a decision.

### [High] There is no content hub

Nine pages per language, all of them product or legal. No blog, no guides, no glossary. For a domain with no backlink profile and no history this is the missing growth surface, and question-shaped content is also what AI answer engines retrieve against most readily.

**Fix:** Open a Hebrew-first content section with 5-8 pages on topics the founders actually know: three-way matching for small businesses, separation of duties in procurement, what Israel Invoices changed, common supplier payment errors, and migrating from a spreadsheet. Defer English content until the brand disambiguation work lands.

### [Medium] The page carrying the trust signals has one inbound link

/about/ holds both founder biographies, both portraits and both Person entities. Exactly one internal link points at it, from the home page. The other sixteen pages do not link to it at all.

**Fix:** Add contextual in-body links from all 16 other pages, anchored where the copy already refers to practical experience or names a founder.

### [Medium] All internal anchor text is identical and non-contextual

Every link to /procurement-software/ reads 'tochnat rechesh'; every link to /invoice-matching/ reads 'hat'amat cheshbonit'. They all originate in the same further-reading block at the foot of each page. Not one contextual link exists inside a paragraph anywhere on the site.

**Fix:** Vary the anchor text and place links inside body paragraphs, where they carry more weight and read as editorial rather than navigational.

