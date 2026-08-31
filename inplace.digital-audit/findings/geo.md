# AI Search Readiness

**Score: 90/100**  (weight 10%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- llms.txt is published and generated from the build, listing all 18 pages with descriptions, naming the operator and registration number
- Its Notes section proactively tells a model that the testimonials are in-house examples and the two price lists are separate catalogues, which is unusually honest and exactly what makes a source quotable
- Every page is complete HTML with no JavaScript requirement, the ideal shape for retrieval
- The prose is passage-level citable: short, self-contained, declarative paragraphs
- PerplexityBot and OAI-SearchBot are not in the Cloudflare block, so Perplexity and ChatGPT search can still reach the site
- IndexNow already announces every deploy to Bing, Yandex and Naver automatically, so new pages reach those indexes in minutes rather than waiting for a crawl
- 58 questions are now declared across the site in FAQPage form — 8 on the home page and 50 across the supporting pages — which is the structure answer engines lift as a unit
- The Organization is now tied to an external company profile by sameAs, which is what an answer engine reads to decide which InPlace a page is about
- 78 questions are declared across the supporting pages, up from 50, each one printed on the page and held to it in both directions by g21-schema
- The guides add 26 question-and-answer pairs aimed at what a buyer asks before they know the product exists, which is the shape an answer engine retrieves against

## Findings

### [Resolved] Eight AI agents were blocked at robots.txt — FIXED

Resolved 31.08.2026. See Technical SEO. GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, meta-externalagent, Amazonbot and Bytespider can all reach the site again, and a live check now fails the deploy if that changes.

**Fix:** Turn off Cloudflare's managed robots.txt block.

### [High] The brand name is contested in both languages

Searching for InPlace returns InPlace Software at inplacesoftware.com, an Australian ed-tech SaaS founded 2010, with a G2 profile, a Serchen listing and vendor directory pages. It owns the English-language entity. Ask any language model what InPlace is and it describes student placement software. The nine /en/ pages also compete for generic English procurement terms against Precoro, Procurify, Coupa and Stampli, from a domain with no authority, under a name attached to a different company. CORRECTION 31.08.2026: an earlier pass of this audit stated that the Hebrew field was clear and no competing InPlace entity existed there. That was wrong. inplace.co.il is an active Israeli company trading as Inplace — today an influencer and content-creator marketing platform for businesses, listed on LinkedIn under Staffing and Recruiting — and it holds both the .co.il domain and the linkedin.com/company/inplace slug. So the name is contested in Hebrew as well as English, by a company selling to the same buyer (Israeli business owners) in an adjacent category.

**Fix:** Entity disambiguation now matters in both markets, not just English. A LinkedIn Company Page for InPlace, a Crunchbase entry and Israeli directory listings are each an external anchor tying the name to this company; sameAs in the schema is what points at them. Note that the obvious company slugs are taken: linkedin.com/company/inplace belongs to the Israeli Inplace and linkedin.com/company/inplace-digital returns 404 and is free. Whether the name itself is worth revisiting is a business decision this audit does not make, but it should be made knowingly rather than by default.

### [Low] No Bing Webmaster Tools verification

No msvalidate.01 meta tag and BingSiteAuth.xml returns 404, so the site is not registered in Bing Webmaster Tools. IndexNow, which is the mechanism that actually tells Bing about new and changed URLs, is already configured and automated — so this is about reporting and diagnostics, not about discovery.

**Fix:** Verify in Bing Webmaster Tools for crawl and query reporting. Bing feeds Copilot and parts of ChatGPT search, so its view of the site is worth being able to read. No IndexNow work is needed.

### [Partly resolved] No question-shaped content beyond the eight home-page FAQs

Answer engines retrieve against questions. The site answers eight. The sub-page headings would add roughly twenty more the moment they are marked up, and a content hub would add more still. RESOLVED IN PART 31.08.2026: the sub-page questions are now marked up, taking the site from 8 declared questions to 58. What remains is the content hub, which would add question-shaped pages rather than markup.

**Fix:** Mark up the sub-page Q&As, then open the content hub described under Content Quality.

### [Resolved] A personal profile was offered for sameAs; a Company Page replaced it — RESOLVED

The owner supplied https://www.linkedin.com/in/inplace-734499173/ on 31.08.2026 for the Organization sameAs. It is an /in/ URL, which is a personal member profile, displayed as 'InPlace .' with a trailing full stop because LinkedIn requires a surname. Job title 'Founder & CEO', 48 connections, 54 followers, unverified, company field blank, and its stated location is Ruhama, South District, while the Organization node in the schema publishes HaRotem 14, Kfar Adumim. It was not added, for three reasons. First, sameAs on an Organization is read as a reference to a page about that organization; LinkedIn /in/ URLs are Person entities in both LinkedIn's model and Google's, so the signal would be pointing at the wrong entity type. Second, DEBT.md §21 records an owner decision taken twice on 28.08.2026 that no personal profile would be published on this site and the only external profile it would carry is the company's own, with the closing note that a personal profile identifies a person while the missing field identifies a company. Third, the conflicting location would feed contradictory data into the exact signal that is supposed to resolve who this company is, which matters more now that the name is contested in both languages. RESOLVED 31.08.2026: the owner created a LinkedIn Company Page at linkedin.com/company/inplace-digital, and that URL, not the personal profile, is what the schema declares.

**Fix:** Done. The remaining entity work is external: a Crunchbase entry and Israeli directory listings, each another anchor tying the name to this company rather than to the Australian InPlace Software or the Israeli Inplace.

