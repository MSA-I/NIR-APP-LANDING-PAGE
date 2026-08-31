# Schema / Structured Data

**Score: 92/100**  (weight 10%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- Every JSON-LD block on all 18 pages parses with zero errors
- Home page graph: Organization with legalName, vatID, logo, PostalAddress, telephone and two ContactPoints; WebSite; SoftwareApplication with 12 screenshots and offers; VideoObject with duration, uploadDate, thumbnailUrl and contentUrl; WebPage with primaryImageOfPage and dimensions; FAQPage with 8 questions
- Sub-pages add BreadcrumbList and Person, with WebPage.author linked by @id to a founder
- Offers are two catalogues rather than one converted at a rate: ILS on Hebrew pages, USD 20/79/149 on English
- No aggregateRating or review markup anywhere, because the testimonials are in-house examples; publishing rating markup for those would be a manual-action risk
- FAQPage is now declared on all six supporting pages in both editions, 50 questions in total, each held to the printed page in both directions by g21-schema

## Findings

### [High] Organization has no sameAs

The single most consequential schema gap. sameAs is the primary mechanism by which Google's Knowledge Graph and AI answer engines decide which entity a name refers to. Nothing on this site connects the brand to any external profile, while InPlace Software, an Australian ed-tech SaaS founded 2010, owns the English-language entity with a G2 profile and directory listings. NOTE 31.08.2026: this is a known, documented decision rather than an oversight — DEBT.md §21 records that the owner decided on 28.08.2026 that no personal profile would be published and the only external profile the site will carry is the company's own, which did not exist at that date. The owner confirmed on 31.08.2026 that a profile now exists; the URL is still to be supplied, and an invented address would be worse than a missing one.

**Fix:** Add sameAs pointing at LinkedIn, Facebook and Crunchbase profiles. If none exist, creating a LinkedIn company page is the prerequisite and the highest-value single action for entity disambiguation.

### [Resolved] FAQPage schema existed only on the home page — FIXED

The eight sub-pages already carry question-shaped h2 headings with self-contained answers beneath them, roughly twenty additional questions across the site. This is precisely the structure extracted into AI Overviews and quoted by answer engines, and it is unmarked. The content exists; only the markup is missing. RESOLVED 31.08.2026: an opt-in `ask` flag was added to the Section type in src/content/pages.ts, set per section rather than guessed from the heading, and marked on the same 25 sections in both editions. src/lib/page-html.ts prints data-faq-q on those sections and declares a FAQPage node built from them; the Answer text is paragraphs, then the list, then the closing paragraphs, in reading order. schemaFor throws if a marked section has nothing to answer with. Verified live: 50 questions declared and 50 printed across 12 pages, no empty answers, and none on the four legal documents, which carry numbered clauses rather than questions.

**Fix:** Generate the FAQPage node from the existing headings in the same script that already builds the graph, so the markup cannot drift from the visible copy.

### [Low] Organization could carry more attributes

No description, foundingDate, email or areaServed on the Organization node.

**Fix:** Add all four while editing the node for sameAs. Each is another attribute the Knowledge Graph can attach to the entity.

