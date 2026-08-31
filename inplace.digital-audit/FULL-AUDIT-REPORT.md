# SEO Audit — inplace.digital

Audited 31.08.2026. Crawl of all 18 published URLs, live measurement in a real browser,
schema parsed and validated, competitive check against the Israeli market.

**SEO Health Score: 91 / 100**  —  81 at audit; four findings were fixed and verified the same day.

> **Fixed 31.08.2026, both verified against the live host**
> 1. Cloudflare's managed robots.txt is off. The eight AI crawlers are unblocked, and a new
>    check (verify-live L8) parses the *served* file on every deploy, so this cannot come back quietly.
> 2. `FAQPage` now covers all six supporting pages in both editions — 50 questions, up from 8 site-wide.
> 3. A LinkedIn **Company Page** was created and `sameAs` declares it on all 18 pages, closing DEBT.md §21.
> 4. All five commercial pages deepened in both editions — 15 new sections, +60 to +76 per cent of body
>    copy each, every claim traced to a source document.
>
> Still open: the content hub, the brand collision in both languages, the Hebrew share card on the
> English pages, and internal linking.

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 22% | 95 |
| Content Quality | 23% | 84 |
| On-Page SEO | 20% | 94 |
| Schema / Structured Data | 10% | 98 |
| Performance (CWV) | 10% | 90 |
| AI Search Readiness | 10% | 88 |
| Images | 5% | 88 |

Business type: **B2B SaaS**, procurement-to-payment, bilingual (he-IL primary, en-US secondary),
selling to Israeli SMBs. Not a local-service business — no GBP/map-pack surface applies.

---

## Executive summary

This is a well-built site. Eighteen pages, all returning 200, each with exactly one H1, a valid
heading order, a canonical, a robots directive, and complete bidirectional hreflang including
`x-default`. Thirty images on the home page and not one is missing `alt`, `width` or `height`.
Cumulative Layout Shift is 0. The schema graph is richer than most funded startups ship. The
redirect set is correct in all four directions. There is no fake review markup anywhere, and the
site says in its own `llms.txt` that the quotes are written in-house — a deliberate, correct call
that most sites at this stage get wrong.

The problems are not craft problems. They are four:

1. **Cloudflare is publishing a robots.txt that blocks eight AI crawlers**, overriding the owner's
   documented decision and silently defeating the build gate meant to prevent exactly this.
2. **The brand name is already taken** in the English-speaking market by an established company.
3. **The commercial pages are thin** against an Israeli field with real incumbents.
4. **The Q&A structure that would earn AI citations is unmarked** on every page except the home page.

### Top 5 issues

1. Cloudflare's managed robots.txt block disallows GPTBot, ClaudeBot, CCBot, Google-Extended and four
   others — the exact opposite of the decision written into `public/robots.txt` (Critical)
2. No `sameAs` on the Organization entity, while "InPlace Software" is an established Australian
   ed-tech SaaS that owns the English-language brand search (High)
3. Commercial pages run 388–529 Hebrew words against incumbents making the same claim (High)
4. `FAQPage` schema exists only on the home page; eight sub-pages carry unmarked Q&A headings (High)
5. The English pages share the Hebrew share card, so every English link preview is in Hebrew (Medium)

### Top 5 quick wins

1. Turn off Cloudflare's managed robots.txt block — dashboard toggle, no code (Critical, minutes)
2. Add `sameAs` to the Organization schema pointing at whatever profiles exist (High, one file)
3. Mark up the existing Q&A headings on the eight sub-pages as `FAQPage` (High, generated already)
4. Build an English OG card and switch the nine `/en/` pages to it (Medium, `scripts/build-og.mjs` exists)
5. Add contextual in-body links to `/about/`, which currently has one inbound link (Medium)

---

## Technical SEO — 95

### What works

- **Redirects, all four cases correct.** `http://` → `https://` 301; `www.` → apex 301;
  `/about` → `/about/` 308; unknown path → a real 404 carrying `<meta name="robots" content="noindex">`
  and weighing 3.5 KB. Query strings do not spawn duplicates because every page carries a canonical.
- **Security headers** are set on every response: HSTS (`max-age=31536000; includeSubDomains`),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy:
  strict-origin-when-cross-origin`, and a `Permissions-Policy` that closes geolocation, microphone,
  camera and interest-cohort.
- **Caching is right.** Hashed assets under `/assets/*` get `max-age=31536000, immutable`;
  `robots.txt` and `sitemap.xml` get one hour; the HTML root gets `max-age=0, must-revalidate`.
- **No JavaScript is required to read the site.** Every page ships complete server-rendered HTML.
  The words a crawler receives are the words a reader receives.
- **Sitemap** is generated from the build (`scripts/build-sitemap.mjs`), lists all 18 URLs, and
  carries `xhtml:link` alternates plus 24 `image:image` entries on the home page.
- **Google Search Console is verified** by DNS TXT record
  (`google-site-verification=OA2qvXDaYBJ-MbqSVSLDK-9dFyDepHYT1apNIXd2bFk`).
- **IndexNow fires by itself after every successful deploy**
  (`.github/workflows/indexnow.yml`). It reads the *live* sitemap rather than building one, so it can
  only announce what is actually being served; it runs on the deploy workflow completing rather than on
  a timer, so a failed deploy announces nothing; and `scripts/ping-indexnow.mjs` discovers the key file
  by pattern rather than hardcoding it. Bing, Yandex and Naver learn about changes in minutes.

### Findings

**[RESOLVED 31.08.2026] Cloudflare published a robots.txt that blocked eight AI crawlers**

> Fixed the same day. The dashboard setting is now "Disable robots.txt configuration", so
> `public/robots.txt` is served exactly as written; the anchored `Disallow` count is 0 and the
> `Content-Signal` line is gone. Guarded by a new check, verify-live L8, which parses the file the
> host actually returns and names every disallowed agent. The record of the problem is kept below.

The file at `public/robots.txt` contains no `Disallow` and says so explicitly in a comment: *"The AI
crawlers are NOT blocked, by the owner's decision of 27.08.2026."* The build gate `g17-crawl`
asserts that no `Disallow` appears in it.

The file served at `https://inplace.digital/robots.txt` opens with a block Cloudflare injects above
the repo's content:

```
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
User-agent: Amazonbot
Disallow: /
User-agent: Applebot-Extended
Disallow: /
User-agent: Bytespider
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: CloudflareBrowserRenderingCrawler
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: GPTBot
Disallow: /
User-agent: meta-externalagent
Disallow: /
# END Cloudflare Managed Content
```

Under the robots.txt specification, a named group wins over `User-agent: *`, so each of those eight
agents reads its own `Disallow: /` and stops. The repo's `Allow: /` further down never applies to them.

What is actually blocked, precisely:

| Agent | Consequence |
|---|---|
| GPTBot | ChatGPT training and browsing |
| ClaudeBot | Claude |
| CCBot | Common Crawl, which feeds most open training corpora |
| Google-Extended | Gemini app grounding and Vertex AI |
| Applebot-Extended | Apple Intelligence |
| meta-externalagent | Meta AI |
| Amazonbot, Bytespider | Amazon, TikTok |

What is **not** blocked, and worth knowing before panicking: **Googlebot itself matches `User-agent: *`
and is fully allowed**, so ordinary Google Search and AI Overviews are unaffected — AI Overviews are
served by Googlebot, not Google-Extended. `PerplexityBot` and `OAI-SearchBot` (ChatGPT's *search*
crawler, separate from GPTBot) are not named in the block and remain allowed.

The `Content-Signal: ai-train=no` line is a second, softer contradiction of the same decision.

The gate did not catch this because it validates the file in the repository, not the file the
internet receives. **Fix in the Cloudflare dashboard** — AI Crawl Control → manage robots.txt — not
in the codebase. Then extend `g17-crawl` to fetch the live URL, so the served file is what gets asserted.

**[LOW] No Content-Security-Policy**

Absent, and deliberately so — `public/_headers` documents the reasoning (Motion writes inline styles,
so a strict `style-src` would break animation without breaking loading) and schedules CSP for stage 4
as report-only first. No action now; the note is here so the audit does not read as if it were missed.

**[INFO] A third-party beacon is injected**

`static.cloudflareinsights.com/beacon.min.js` loads on every page. It is not in the repo — Cloudflare
Web Analytics adds it. It is the only third-party request on the site. Worth confirming the privacy
policy names it, since that page already enumerates sub-processors.

---

## Content Quality — 84

### What works

The writing is genuinely good, and that is not a courtesy. It is concrete, it names the failure it
prevents, and it does not pad. From `/invoice-matching/`:

> "לא כל חריגה היא טעות. לפעמים המחיר עלה בהסכמה, לפעמים הגיעה כמות אחרת בתיאום, ולפעמים הספק צודק."

That is a paragraph that admits the tool is not always right, which is exactly the kind of passage a
language model quotes and a buyer believes. There is no AI slop anywhere on the site.

E-E-A-T signals are real and specific. Two founder `Person` entities carry substantive biographies —
twenty years of operations experience, a food chain being run today — and every sub-page's `WebPage`
node declares an `author` pointing at one of them. The company publishes a street address, a
registration number and two phone numbers.

### Findings

**[RESOLVED 31.08.2026] Commercial pages were thin for the field they are entering**

> Fixed the same day, in both editions.
>
> | | Hebrew | English |
> |---|---|---|
> | `/procurement-software/` | 529 → **905** | 731 → **1290** |
> | `/invoice-matching/` | 433 → **694** | 588 → **964** |
> | `/supplier-invoices/` | 388 → **650** | 533 → **899** |
> | `/vs-spreadsheet/` | 390 → **611** | 526 → **851** |
> | `/vs-erp/` | 391 → **621** | 537 → **867** |
>
> Fifteen new sections. A worked three-way-match example catching a partial delivery; the four alert
> types the alerts screen raises; what is kept from a decision; why there is no route around the
> approval; what happens after the payment; why an invoice is never deleted; double payments caught at
> two points; what is left when someone leaves; why a spreadsheet cannot stop a payment; what an ERP
> does that this does not; why three fixed roles instead of configurable permissions.
>
> **One recommendation was deliberately not acted on.** This report asked for the Israeli specifics no
> international competitor covers — Israel Invoices, VAT, shotef-plus terms. Nothing in `PRODUCT.md` or
> the brand documents says the system handles any of them, and the repository's rule is that every
> capability sentence traces to a source. Writing them would have been an invented capability claim on
> the page that ranks for the head term. It waits for a source, not for a decision.
>
> The record of the original finding is kept below.

| Page | Hebrew words | English words |
|---|---|---|
| `/procurement-software/` | 529 | 731 |
| `/invoice-matching/` | 433 | 588 |
| `/vs-erp/` | 391 | 537 |
| `/vs-spreadsheet/` | 390 | 526 |
| `/supplier-invoices/` | 388 | 533 |

Hebrew packs more meaning per word than English — prefixes attach — so 400 Hebrew words reads closer
to 520 English. Even adjusted, these are short for the terms they target.

A search for תוכנת רכש לעסקים returns established incumbents: StoreNext (20 years, B2B supply
chain), Segment, CloudCom reselling Procurify, Mboss, CRTV, Rasner, plus Priority and חשבשבת ERP
resellers who have owned these terms for years and publish long, illustrated guides.

[Segment](https://www.segment.co.il/) is the sharpest problem: it makes InPlace's exact core claim —
verifying invoices against purchase orders and delivery reports in real time — and it has been
indexed for years.

Depth is not the same as length. What these pages are missing is the specific, checkable material
that would make them worth ranking above a competitor: a worked numeric example of a three-way match
that catches a partial delivery, screenshots annotated with what to look at, the Israeli specifics
(חשבוניות ישראל, מע״מ, תנאי תשלום שוטף+), and what happens at the edges.

**[HIGH] There is no content hub**

Nine pages per language, all of them either product or legal. No blog, no guides, no glossary,
nothing that earns a link or catches a question-shaped search. For a domain with no backlink profile
and no history, this is the missing growth surface — and it is also what AI answer engines index most
readily, because question-shaped content is what they retrieve against.

**[MEDIUM] `/about/` carries the trust signals and has one inbound link**

`/about/` holds both founder biographies, both portraits, and both `Person` entities. Exactly one
internal link points at it — from the home page. The other sixteen pages do not link to it at all.
For a three-day-old brand asking businesses to route their payments through it, that is the wrong page
to bury.

**[MEDIUM] All internal anchor text is identical**

Every link to `/procurement-software/` reads "תוכנת רכש". Every link to `/invoice-matching/` reads
"התאמת חשבונית". They all come from the same "להמשך קריאה" block at the foot of each page. There
is not one contextual link inside a paragraph anywhere on the site.

---

## On-Page SEO — 94

Near-perfect. Across all 18 pages:

- Exactly one `<h1>` each; heading order valid on every page with no skipped levels
- Titles 20–69 characters, every one distinct, none truncating in a SERP
- Meta descriptions 118–165 characters, every one distinct and written rather than generated
- `<link rel="canonical">` self-referential and correct on all 18
- `<meta name="robots" content="index, follow, max-image-preview:large">` on all 18
- `lang` and `dir` correct (`he`/`rtl`, `en`/`ltr`)
- Hreflang complete and reciprocal: `he`, `en`, `x-default` on every page, declared in both the HTML
  and the sitemap, pointing both directions
- Open Graph and Twitter cards complete on both language editions, including `og:locale:alternate`
  in both directions
- Semantic HTML is correct: `<main>`, `<nav>`, `<footer>`, `<header>`, `<section>`, `<details>` and a
  real `<table>` all present

The only deduction is the share-card language mismatch, recorded under Images.

---

## Schema / Structured Data — 98

### What works

Every page validates. Zero parse errors. The home page graph:

| Node | Contents |
|---|---|
| `Organization` | name, legalName, vatID `036689081`, logo, PostalAddress, telephone, two ContactPoints |
| `WebSite` | publisher linked by `@id` |
| `SoftwareApplication` | BusinessApplication/Procurement, 12 screenshots, offers |
| `VideoObject` | name, description, duration PT35S, uploadDate, thumbnailUrl, contentUrl |
| `WebPage` | dateModified, primaryImageOfPage with dimensions |
| `FAQPage` | 8 questions |

Sub-pages add `BreadcrumbList` and `Person`, with `WebPage.author` linked by `@id` to the founder.

Two decisions worth naming as correct: the offers are **two catalogues, not one converted at a rate**
— ILS on the Hebrew pages, USD 20/79/149 on the English — and there is **no `aggregateRating` or
`review` anywhere**, because the testimonials are in-house examples. Publishing rating markup for
those would be a manual-action risk. It was not published. Good.

### Findings

**[RESOLVED 31.08.2026] `Organization` had no `sameAs`**

> Fixed the same day. A LinkedIn Company Page was created and
> `https://www.linkedin.com/company/inplace-digital` is declared in `sameAs` on the `Organization`
> node in both generators, covering all 18 pages. Verified in the built output and live. The two
> `Person` nodes still carry none, which is the same owner decision rather than an omission: a
> personal profile identifies a person, and this field identifies a company. The record of the gap
> is kept below.

This is the single most consequential schema gap, because of what the next section describes. `sameAs`
is the primary mechanism by which Google's Knowledge Graph and AI answer engines decide *which*
entity a name refers to. Without it, nothing on this site connects the brand to any external profile.

It is a documented decision rather than an oversight: DEBT.md §21 records that on 28.08.2026 the owner
decided no personal profile would be published and the only external profile the site would carry is
the company's own, which did not exist then. The owner confirmed on 31.08.2026 that a profile now
exists and the URL is to follow. It goes in two places: `src/entry-static.tsx` and
`src/lib/page-html.ts`. An invented address would be worse than a missing one, so it waits for the
real one.

**[RESOLVED 31.08.2026] `FAQPage` was only on the home page**

> Fixed the same day. An opt-in `ask` flag on the `Section` type marks the 25 question-shaped
> sections in each edition; `src/lib/page-html.ts` prints `data-faq-q` on them and builds the
> `FAQPage` node from the same source. Verified live: 50 declared, 50 printed, no empty answers,
> and none on the four legal documents. The record of the problem is kept below.

The eight sub-pages already carry Q&A-shaped `<h2>`s written as questions:

- למה זה נעצר לפני התשלום ולא אחריו
- מי מחליט על חריגה
- למה שלושה מסמכים ולא שניים

Each has a self-contained answer beneath it. This is precisely the structure that gets extracted into
AI Overviews and quoted by answer engines, and it is unmarked. The content already exists; only the
markup is missing.

**[LOW] `Organization` could carry more**

No `description`, `foundingDate`, `email`, or `areaServed`. Cheap to add, and each one is another
attribute the Knowledge Graph can attach to the entity.

---

## Performance (Core Web Vitals) — 90

Measured live on 31.08.2026. **No field data exists** — the site went live 28.08.2026, and CrUX
requires a traffic threshold no three-day-old site meets. These are lab numbers from a real browser.

| Metric | Desktop | Mobile (375×812) |
|---|---|---|
| TTFB | 80 ms | 283 ms |
| DOM interactive | 151 ms | — |
| Load | 419 ms | 643 ms |
| **CLS** | **0** | **0** |
| Total Blocking Time | — | ~119 ms (one 169 ms task at 397 ms) |
| Requests | 21 | 21 |
| Transfer | 421 KB | 421 KB |

Repeated HTML fetches returned in 149–348 ms. Compressed payloads: main JS 107 KB, Motion 46 KB,
icons 6 KB, CSS 19 KB, fonts 12–32 KB each, all brotli.

LCP could not be measured reliably — the embedded browser suppresses paint timing entries. Given
CLS of 0, a 419 ms load and server-rendered HTML, it is very likely inside the 2.5 s threshold, but
this is inference, not measurement. Confirm it in PageSpeed Insights once there is traffic.

### Findings

**[LOW] Six client logos are preloaded at highest priority**

```html
<link rel="preload" as="image" href="/assets/logos/falafel.webp"/>
... five more
```

These are the "trusted by" strip, which sits below the hero. Preloading them puts six images ahead of
the LCP element in the fetch queue. They also carry `loading="eager"` and `decoding="sync"`, which is
belt and braces. On a fast connection this costs nothing; on 3G it delays the headline.

**[GOOD] The films are correctly restrained**

`film.mp4` and `film-en.mp4` are ~10 MB each, with 4 MB phone cuts. The `<video>` element uses
`preload="metadata"`, so the bytes are never fetched on load. This was handled correctly.

---

## AI Search Readiness (GEO) — 88

The lowest score, and the one worth the most attention.

### What works

- `llms.txt` is published, generated from the build, and genuinely good — it lists all 18 pages with
  descriptions, names the operator and registration number, and includes a Notes section that
  proactively tells a model the testimonials are in-house examples and the two price lists are
  separate catalogues. That is unusually honest and exactly what makes a source quotable.
- Every page is complete HTML with no JS requirement — the ideal shape for retrieval.
- The prose is passage-level citable: short, self-contained, declarative paragraphs.
- `PerplexityBot` and `OAI-SearchBot` are not in the Cloudflare block, so Perplexity and ChatGPT
  search can still reach the site.
- **IndexNow already announces every deploy** to Bing, Yandex and Naver automatically.

### Findings

**[RESOLVED 31.08.2026] Eight AI agents were blocked at robots.txt** — see Technical SEO. Fixed and
verified live; the deploy now fails if it returns.

**[HIGH] The brand name is contested in both languages**

Searching for "InPlace" returns [InPlace Software](https://inplacesoftware.com/), an Australian
ed-tech SaaS founded in 2010, with a [G2 profile](https://www.g2.com/products/inplace-software-inplace-software/reviews),
a [Serchen listing](https://www.serchen.com/company/inplace-software) and vendor directory pages. It
owns the English-language entity.

This has two consequences. Ask any language model "what is InPlace" and it will describe student
placement software — this is testable right now. And the nine `/en/` pages are competing for generic
English procurement terms (Precoro, Procurify, Coupa, Tipalti, Stampli) from a domain with no
authority, under a name already attached to a different company.

**Correction, 31.08.2026.** An earlier pass of this report said the Hebrew field was clear and no
competing InPlace entity existed there. That was wrong. [inplace.co.il](https://www.inplace.co.il) is
an active Israeli company trading as **Inplace** — today an influencer and content-creator marketing
platform for businesses, listed on LinkedIn under Staffing and Recruiting — and it holds both the
`.co.il` domain and the `linkedin.com/company/inplace` slug.

So the name is contested in Hebrew as well: by an Israeli company selling to the same buyer, business
owners, in an adjacent category. The Hebrew pages are still the realistic near-term surface, because
the search terms they target are procurement terms rather than the brand name, but the entity work is
now needed in both markets rather than only in English.

Whether the name itself is worth revisiting is a business decision this audit does not make. It should
be made knowingly rather than by default.

`sameAs` is the lever. So is a LinkedIn company page, a Crunchbase entry, and any Israeli directory
listing — each one is an external anchor tying the name to *this* company.

**[LOW] No Bing Webmaster Tools verification**

No `msvalidate.01` tag, and `BingSiteAuth.xml` returns 404, so the site is not registered in Bing
Webmaster Tools. IndexNow — the mechanism that actually tells Bing about new and changed URLs — is
already configured and automated, so this is about reporting and diagnostics, not discovery. Bing's
index feeds Copilot and parts of ChatGPT search, so being able to read its view of the site is worth
the one verification.

**[RESOLVED 31.08.2026] A personal profile was offered for `sameAs`; a Company Page replaced it**

> The owner created `linkedin.com/company/inplace-digital` and that URL, not the personal profile,
> is what the schema declares. The reasoning that led there is kept below, because it is the reason
> the field is worth anything at all.

On 31.08.2026 the owner supplied `https://www.linkedin.com/in/inplace-734499173/` for the
Organization `sameAs`. It was **not added**, and the reasons are worth stating plainly because the
field was the audit's single highest-value schema gap.

It is an `/in/` URL — a personal member profile. It displays as "InPlace ." with a trailing full stop,
because LinkedIn requires a surname. Founder & CEO, 48 connections, 54 followers, unverified, company
field blank. Its stated location is **Ruhama, South District**, while the `Organization` node on every
page of this site publishes **HaRotem 14, Kfar Adumim**.

Three reasons not to publish it:

1. **Wrong entity type.** `sameAs` on an `Organization` is read as a reference to a page *about that
   organization*. A LinkedIn `/in/` URL is a Person entity, in LinkedIn's model and in Google's. The
   signal would point at the wrong kind of thing.
2. **It reverses a written decision.** DEBT.md §21 records the owner deciding, twice on 28.08.2026,
   that no personal profile would be published here and the only external profile this site would
   carry is the company's own — closing with the note that *a personal profile identifies a person,
   and the missing field identifies a company*.
3. **It contradicts the address the site already publishes.** Feeding a conflicting location into the
   one signal meant to resolve who this company is makes it worse, not better — and that matters more
   now that the name is contested in both languages.

**What closes it:** a LinkedIn **Company Page**, created from the same account in a couple of minutes.
`linkedin.com/company/inplace-digital` returns 404 and is free; `linkedin.com/company/inplace` is
taken by the Israeli Inplace. Once it exists the change is one value in two files —
`src/entry-static.tsx` and `src/lib/page-html.ts` — and it covers all 18 pages.

If the owner decides on reflection to publish the personal profile anyway, that reverses a recorded
decision, and DEBT.md §21 should be amended to say so rather than the code quietly diverging from it.

**[MEDIUM] No question-shaped content beyond the eight home-page FAQs**

Answer engines retrieve against questions. The site answers eight. The sub-page headings would add
roughly twenty more the moment they are marked up.

---

## Images — 88

Close to flawless on the technical side.

- **30 images on the home page: zero missing `alt`, zero missing `width`/`height`, zero missing
  `loading` where appropriate.** This is why CLS is 0.
- AVIF with WebP fallback via `<picture>`, three widths each (800/1440/2000) with correct `sizes`
- Alt text is descriptive and real ("פלאפל בתחנה", "Adir Contracting"), not filename mush
- 24 images declared in the sitemap under `image:image`

### Finding

**[MEDIUM] All nine English pages serve the Hebrew share card**

Every page on the site — both languages — points `og:image` at
`https://inplace.digital/assets/og-cover.jpg`. That image reads, in Hebrew:
*"כל מה שקורה בין ההזמנה לכסף, במקום אחד."*

So an English reader sharing `/en/procurement-software/` on LinkedIn gets an English title over a
Hebrew picture. There is a second mismatch inside it: `og:image:alt` on the English pages says
*"everything between the purchase order and the money, in one place"* — describing, in English, an
image whose visible text is Hebrew.

`/assets/og-cover-en.jpg` returns 404. `scripts/build-og.mjs` and `scripts/og-template.html` already
exist, so the second card is a build-script change, not a design project.

**[LOW] Sub-pages share the home page's card.** Acceptable, and a per-page card is a nice-to-have
rather than a fix.

---

## Accessibility spot check

Not an SEO category, but it was measured, so it is reported. 347 text elements checked against
WCAG AA with correct alpha compositing:

**5 failures, three of them marginal:**

| Element | Ratio | Required |
|---|---|---|
| `.why-card__n` — the "01" step numbers | 2.90–3.00 | 4.5 |
| `.footer-strip__dot` — the "✦" separator (decorative) | 3.14 | 4.5 |
| `.plan-card__billed` — "חיוב חודשי" on the blue plan | 4.31 | 4.5 |
| `.cap.demo-hint` — "לחיצה על המסך פותחת אותו בגודל מלא." | 4.44 | 4.5 |

The step numbers are the only real one. The rest are within rounding of the threshold or decorative.
For 347 elements on a page this visually dense, that is a good result.

---

## Method and limits

**Measured:** all 18 URLs fetched and parsed; headers inspected; robots.txt, sitemap.xml and llms.txt
read in full; every JSON-LD block parsed; redirects and 404 behaviour tested; internal link graph
built across all 18 pages; live browser measurement on desktop and mobile viewports; contrast checked
across 347 elements; competitive SERP checks in Hebrew.

**Not available:**

- **CrUX field data** — the site is three days old and below the reporting threshold. Every
  performance number here is lab, from one location.
- **PageSpeed Insights** — the shared API key hit its daily quota; no `GOOGLE_API_KEY` is configured.
- **Search Console data** — GSC is verified by DNS, but no API credentials are configured here, so
  impressions, indexation status and query data could not be read. This is the most valuable missing
  input and it is one OAuth flow away.
- **Backlink profile** — no Moz or Bing Webmaster credentials configured. For a three-day-old domain
  the profile is almost certainly empty, but it was not verified.

**Confidence:** high on everything crawled and measured directly; the LCP estimate and the empty
backlink profile are stated as inference and labelled as such.

**Corrections made during the audit.** A third: an earlier pass said the Hebrew market had no
competing InPlace entity. It has one — inplace.co.il, which also holds the
`linkedin.com/company/inplace` slug. The brand-collision finding now covers both languages.

An earlier pass reported that the site had no IndexNow, and
flagged `public/c6fda1454ac9fb23548f545592b8dda4.txt` as an unidentified verification file. Both were
wrong. That file *is* the IndexNow key, and `.github/workflows/indexnow.yml` has been submitting the
live sitemap after every successful deploy since 28.08.2026. Technical SEO was rescored 78 → 80 and
AI Search Readiness 55 → 58, moving the overall score from 80 to 81. A second early reading — that a
slow hero entrance animation was delaying LCP — was also checked and ruled out; the `h1` carries no
animation at any level in its ancestor chain, and the blur seen in early captures was an artifact of
the capture pipeline.
