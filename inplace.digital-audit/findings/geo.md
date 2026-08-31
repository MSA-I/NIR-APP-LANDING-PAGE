# AI Search Readiness

**Score: 78/100**  (weight 10%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- llms.txt is published and generated from the build, listing all 18 pages with descriptions, naming the operator and registration number
- Its Notes section proactively tells a model that the testimonials are in-house examples and the two price lists are separate catalogues, which is unusually honest and exactly what makes a source quotable
- Every page is complete HTML with no JavaScript requirement, the ideal shape for retrieval
- The prose is passage-level citable: short, self-contained, declarative paragraphs
- PerplexityBot and OAI-SearchBot are not in the Cloudflare block, so Perplexity and ChatGPT search can still reach the site
- IndexNow already announces every deploy to Bing, Yandex and Naver automatically, so new pages reach those indexes in minutes rather than waiting for a crawl
- 58 questions are now declared across the site in FAQPage form — 8 on the home page and 50 across the supporting pages — which is the structure answer engines lift as a unit

## Findings

### [Resolved] Eight AI agents were blocked at robots.txt — FIXED

Resolved 31.08.2026. See Technical SEO. GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, meta-externalagent, Amazonbot and Bytespider can all reach the site again, and a live check now fails the deploy if that changes.

**Fix:** Turn off Cloudflare's managed robots.txt block.

### [High] The brand name is already owned in English

Searching for InPlace returns InPlace Software at inplacesoftware.com, an Australian ed-tech SaaS founded 2010, with a G2 profile, a Serchen listing and vendor directory pages. It owns the English-language entity. Two consequences: asking any language model what InPlace is returns student placement software, which is testable now; and the nine /en/ pages compete for generic English procurement terms against Precoro, Procurify, Coupa, Tipalti and Stampli from a domain with no authority under a name attached to a different company. In Hebrew the field is clear, with no competing InPlace entity.

**Fix:** Treat the Hebrew pages as the realistic near-term surface. Build external anchors that tie the name to this company: sameAs in the schema, a LinkedIn company page, a Crunchbase entry, Israeli directory listings. Defer English content investment until disambiguation lands.

### [Low] No Bing Webmaster Tools verification

No msvalidate.01 meta tag and BingSiteAuth.xml returns 404, so the site is not registered in Bing Webmaster Tools. IndexNow, which is the mechanism that actually tells Bing about new and changed URLs, is already configured and automated — so this is about reporting and diagnostics, not about discovery.

**Fix:** Verify in Bing Webmaster Tools for crawl and query reporting. Bing feeds Copilot and parts of ChatGPT search, so its view of the site is worth being able to read. No IndexNow work is needed.

### [Partly resolved] No question-shaped content beyond the eight home-page FAQs

Answer engines retrieve against questions. The site answers eight. The sub-page headings would add roughly twenty more the moment they are marked up, and a content hub would add more still. RESOLVED IN PART 31.08.2026: the sub-page questions are now marked up, taking the site from 8 declared questions to 58. What remains is the content hub, which would add question-shaped pages rather than markup.

**Fix:** Mark up the sub-page Q&As, then open the content hub described under Content Quality.

