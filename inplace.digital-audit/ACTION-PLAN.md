# Action Plan — inplace.digital

**Status 31.08.2026.** Phase 1 is done and verified live. Phases 2.1, 2.2 and 2.3 are done. Only 2.4,
the English share card, remains in Phase 2.


Ordered by impact. Scope is given in countable units — files touched, pages affected, entries added —
not in days or weeks.

---

## Phase 1 — Critical  ·  **DONE 31.08.2026**

### 1.1 Stop Cloudflare from blocking the AI crawlers  ·  DONE

**Scope:** one dashboard setting. No code.

Cloudflare injects a managed block into `robots.txt` that disallows GPTBot, ClaudeBot, CCBot,
Google-Extended, Applebot-Extended, meta-externalagent, Amazonbot and Bytespider. The repo file says
the opposite, in a comment, on purpose.

Cloudflare dashboard → the `inplace.digital` zone → **AI Crawl Control** → the managed `robots.txt`
setting. Turn off the managed block, or set it to allow. Also clear `Content-Signal: ai-train=no` if
it is separately toggleable.

Verify:

```bash
curl -s https://inplace.digital/robots.txt | grep -c "^Disallow"
```

Expected: `0`. Anchor the pattern to the line start — the repo file mentions the word `Disallow`
three times in its own comments, so an unanchored `grep -c` returns 3 even when the fix has landed.
Right now it returns 12 unanchored, 9 anchored: nine real directives.

**Note:** Googlebot is *not* blocked — ordinary Google Search and AI Overviews were never affected.
This is about ChatGPT, Claude, Gemini grounding, Apple Intelligence and Common Crawl.

### 1.2 Make the build gate check the live file  ·  DONE

**Scope:** one gate in the build.

`g17-crawl` asserts no `Disallow` in `public/robots.txt`. That assertion passed the whole time the
served file said the opposite. Point it at `https://inplace.digital/robots.txt` in the post-deploy
step so the gate measures what the internet receives.

---

## Phase 2 — High impact

### 2.1 Give the Organization a `sameAs`  ·  DONE 31.08.2026

**Scope:** one schema builder in `scripts/`, propagates to all 18 pages.

"InPlace" is already an established Australian ed-tech SaaS with a G2 profile. Nothing on this site
currently distinguishes the two entities. `sameAs` is the mechanism that does.

```json
"sameAs": [
  "https://www.linkedin.com/company/<handle>",
  "https://www.facebook.com/<handle>",
  "https://www.crunchbase.com/organization/<handle>"
]
```

If none of these exist yet, creating a LinkedIn company page is the prerequisite and the highest-value
single action for entity disambiguation. While editing the node, add `description`, `foundingDate`,
`email` and `areaServed: "IL"`.

### 2.2 Mark up the sub-page Q&As as `FAQPage`  ·  DONE 31.08.2026

**Scope:** 8 pages × 2 languages = 16 pages. The content already exists; only the markup is missing.

Each sub-page already carries question-shaped `<h2>`s with self-contained answers — למה זה נעצר לפני
התשלום ולא אחריו, מי מחליט על חריגה, למה שלושה מסמכים ולא שניים. That is roughly twenty additional
questions across the site, in the exact shape AI Overviews and answer engines extract.

Generate the `FAQPage` node from the existing headings in the same script that already builds the
graph, so it cannot drift from the visible copy.

### 2.3 Deepen the five commercial pages  ·  DONE 31.08.2026

**Scope:** 5 pages × 2 languages. Current: 388–529 Hebrew words. Target: roughly double.

These pages compete with StoreNext, Segment, CloudCom/Procurify, Mboss, CRTV and the Priority and
חשבשבת reseller ecosystem. Segment makes InPlace's exact core claim and has years of index history.

Length alone is not the goal. Add the material that is checkable and specific:

- A worked numeric example of a three-way match catching a partial delivery — real numbers, the
  actual arithmetic, the actual stop
- The Israeli specifics that no international competitor covers: חשבוניות ישראל, מע״מ, שוטף+ payment terms
- Annotated screenshots — the site already has 12, currently used decoratively
- The edges: what happens when a supplier is right, when a price rose by agreement, when a document
  arrives out of order

Priority order: `/procurement-software/` (broadest term), `/invoice-matching/` (sharpest differentiator),
`/supplier-invoices/`, then the two comparison pages.

### 2.4 Build the English share card

**Scope:** `scripts/build-og.mjs`, one new output, 9 pages switch to it.

All 18 pages point at `og-cover.jpg`, whose visible text is Hebrew. `og-cover-en.jpg` returns 404.
The template and build script already exist, so this is a second render, not a design project. Fix
`og:image:alt` on the English pages at the same time — it currently describes the image in English
while the image speaks Hebrew.

---

## Phase 3 — Content and authority

### 3.1 Link to `/about/` from inside the body copy

**Scope:** 16 pages, one link each.

`/about/` holds both founder biographies, both portraits and both `Person` entities, and has exactly
one inbound link. When a page says "מתוך ניסיון מעשי" or names a founder, that is where the link goes.

### 3.2 Vary the anchor text and put links inside paragraphs

**Scope:** the "להמשך קריאה" block plus in-body links across 18 pages.

Every link to `/procurement-software/` currently reads "תוכנת רכש", from a footer block. Not one
contextual link exists inside a paragraph anywhere on the site. Contextual links carry more weight
and read as editorial rather than navigational.

### 3.3 Open a content hub

**Scope:** a new section; start with 5–8 Hebrew pages.

Nine pages per language, all product or legal. Nothing question-shaped, nothing link-worthy. Topics
that fit what the founders actually know and that answer engines retrieve against:

- מה זה three-way matching ולמה זה חשוב לעסק קטן
- הפרדת סמכויות ברכש: מי מאשר ומי משלם
- חשבוניות ישראל: מה השתנה ומה זה אומר על תהליך הרכש
- טעויות נפוצות בתשלום לספקים ואיך תופסים אותן
- מעבר מאקסל למערכת רכש: מה להעביר קודם

Hebrew first. The English market needs the brand disambiguation of 2.1 before content investment
there pays.

### 3.4 Verify in Bing Webmaster Tools

**Scope:** one verification. No IndexNow work — it is already automated.

`BingSiteAuth.xml` returns 404 and there is no `msvalidate.01` tag, so the site is not registered in
Bing Webmaster Tools. This is about being able to read Bing's crawl and query view of the site; Bing
feeds Copilot and parts of ChatGPT search.

IndexNow is **already configured and firing** — `.github/workflows/indexnow.yml` submits the live
sitemap after every successful deploy, and `public/c6fda1454ac9fb23548f545592b8dda4.txt` is its key
file. Nothing to do there.

---

## Phase 4 — Monitoring

### 4.1 Connect Search Console to this audit tooling

**Scope:** one OAuth flow.

GSC is already verified by DNS TXT. The API credentials are not configured here, which is why this
audit has no indexation status, no impressions and no query data — the most valuable missing input.

```bash
claude-seo run google_auth.py --check
```

Currently reports *Credential Tier: -1 — No credentials configured*. Adding a `GOOGLE_API_KEY` also
unlocks PageSpeed Insights and CrUX.

### 4.2 Submit the sitemap and request indexing

**Scope:** 18 URLs.

The site is three days old and does not yet appear for its own brand name. Submit
`https://inplace.digital/sitemap.xml` in GSC and request indexing for the home page and the five
commercial pages.

### 4.3 Confirm LCP once traffic exists

LCP could not be measured — the embedded browser suppresses paint timing. CLS is 0 and load is
419 ms, so LCP is very likely fine, but that is inference. Re-check in PageSpeed Insights, and watch
CrUX once the traffic threshold is met.

### 4.4 Capture a drift baseline

The site has strong build gates. A stored SEO baseline would catch the class of problem this audit
found — where the deployed artefact diverges from the repository — on every future deploy.

---

## Deliberately not changing

- **No review or rating markup.** The testimonials are in-house examples and the site says so.
  Adding `aggregateRating` would be a manual-action risk. Leave it.
- **Two price catalogues, not one converted.** ILS on Hebrew, USD on English, as separate `Offer`
  sets. Correct as built.
- **No CSP yet.** Documented in `public/_headers` with reasoning and scheduled for stage 4 as
  report-only first. That plan is sound.
- **`preload="metadata"` on the films.** 10 MB files that never load on page view. Correct.
