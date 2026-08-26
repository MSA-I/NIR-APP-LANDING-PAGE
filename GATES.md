# GATES.md — build 3 (`inplace-folio`), branch `aui-editorial`

Acceptance gates for this build only. Build 2's ledger is archived in
`archive/GATES-round2.md`; its gates for a worldflight page (map stops, leg
seams, one continuous camera) do not describe this page and are not run.

Every row below is either **MET** with the measurement that proves it, or
**ABANDON:** with the reason. Nothing is reported as done on inspection alone.

Run: `node scripts/gates/g4-rtl.mjs`, `g6-overflow`, `g7-contrast`, `g14-folio`.

| # | Gate | State | Evidence |
|---|---|---|---|
| G1 | The page builds, one locale, no template errors | **MET** | `npm run build` → `he dist\index.html 20.4 KB` |
| G4 | RTL is carried by logical properties only | **MET** | `G4 PASS` — control fixture fires on 18 physical properties; `site.css` 613 lines, 0 hits |
| G6 | No horizontal overflow at any width | **MET** | `G6 PASS` — clean at 8 scroll positions × 390 / 768 / 1024 / 1440 px |
| G7 | Text clears WCAG AA on the composited render, both grounds | **MET** | `G7 PASS` — 94 text runs × 10 scroll positions, worst **5.85:1** (`.btn`, needs 4.5). Positive control: a near-white line planted on the wheat plate measures 1.01:1 and is caught |
| G14a | Grammar holds: one scrub chapter, one `<h1>`, four chapters | **MET** | `G14 PASS`, 4 chapters, 10.34vh, 1 act, 1 scrub clip, 1 `<h1>` |
| G14b | Tabs: five steps, five distinct screens, exactly one panel open | **MET** | `G14 PASS` — each tab opens its own panel, 5 distinct image sources, `aria-selected` follows |
| G14c | The apparatus is complete in both directions | **MET** | `G14 PASS`, 8 cited figures against 8 sources, no orphan figure, no uncited source |
| G14d | The film actually scrubs with scroll | **MET** | `G14 PASS` — `currentTime` 4.84s → 12.74s across a fifth of the page |
| G14e | The folio names the chapter the reader is in | **MET** | `G14 PASS` — "שער" at the top, "פרק 03 — להתחיל" at the foot |
| G14f | Keyboard: skip link focusable and targeted, tablist has one tab stop, RTL arrow keys advance in reading order | **MET** | `G14 PASS` — skip link takes focus and resolves; 1 of 5 tabs is a tab stop; ArrowLeft moves to `tab-1` |
| G14g | Reduced motion: no transitions, no smooth scroll, poster still paints | **MET** | `G14 PASS` — strip and button transitions 0s, `scroll-behavior: auto`, poster loaded |
| G14h | No console or page errors | **MET** | `G14 PASS` — zero after adding the inline favicon that was 404ing |
| G-vis | Every stage of the page looked at, not just measured | **MET** | Desktop 1600×900 at 0.16 / 0.30 / 0.44 / 0.55 / 0.68 / 0.74 / 0.86 / 0.90 / 1.0; mobile 390×844 at 0.10 / 0.22 / 0.34 / 0.46 / 0.60 / 0.70 / 0.74 / 0.88 / 1.0. Four defects found by eye that no gate caught: the engine's media rule out-specifying the plate inset, all five tab panels rendering at once (`display:grid` beating `[hidden]`), the `<img>` height attribute defeating `aspect-ratio`, and light-ground ink inherited by the dark board spread |
| G-mob | The product screens are readable on a phone | **MET** | 390px capture at 0.70: `הזמנות רכש`, `7 הזמנות בתצוגה · 17 בסך הכול`, supplier names and dates all legible. The frame scrolls horizontally at 900px rather than shrinking the screen to a smudge |
| G-fp | Clears 4 of 6 fingerprint dimensions against every existing row | **MET** | See `FINGERPRINTS.md` — 6 of 6 against row 1, 6 of 6 against row 2 |
| G-fig | Every figure on the page is real | **MET** | All eight sources re-read off `lab/app-reference/*.png` this session, four of them opened and checked by eye: `owner-dashboard`, `office-orders`, `office-invoices`, `owner-exceptions`, `owner-payment-requests` |

## Abandoned

**ABANDON: G8 scroll smoothness / G-fps frame rate.** Build 2's motion gates
measure a nine-leg worldflight scrubbing one continuous camera across 16vh —
the failure mode they exist for. This page has one 5.3vh scrub in a bounded
plate and no camera handover anywhere, so the gates' thresholds describe a
different page. Not re-authored, because the defect class they guard (a seam
between legs) does not exist here. If a second scrub chapter is ever added,
they come back first.

**ABANDON: G12 locale parity.** One locale on this branch by instruction. The
gate returns when `en` and `fr` come back out of `archive/i18n-v2/`.

**ABANDON: real-device check.** Headless Chrome cannot reproduce an iPhone's
video decoder, autoplay policy or Low Power Mode. Everything above is a desktop
Chrome measurement at a phone viewport, which is not the same thing. The film
clip in particular has only been proven to scrub in headless Chrome.

---

## Round 2: the design pass (impeccable, page-cro, design-taste-frontend, copywriting)

Run after the owner asked for those four skills on the structured chapters.

| # | Gate | State | Evidence |
|---|---|---|---|
| D1 | Zero em-dashes in anything the visitor can see | **MET** | 26 found by `detect.mjs`, including 5 hidden in image `alt` text. `grep -o "—" dist/index.html \| wc -l` now returns **0** |
| D2 | The mechanical design detector is clean | **MET** | `node detect.mjs --json dist/index.html site.css surface.js` returns `[]` |
| D3 | The five steps are all visible at once | **MET** | The pill tab strip is now a chain of five named stations on one rule. Verified at 1600x900 and 390x844; the chain wraps 2+2+1 on the phone and keeps the active marker |
| D4 | An ask exists between the title page and the close | **MET** | `.midask` after the control-centre spread. Previously nine viewport-heights separated the two asks |
| D5 | Eyebrow count within budget | **MET** | 2 eyebrows across 5 blocks (budget is ceil(5/3) = 2). The board eyebrow was filler and is gone; the sources label is a list label, not a section eyebrow, and carries its own class |
| D6 | No three-equal-cards shape, no repeated layout family back to back | **MET** | The three stat cards are now one hairline figure row cited once, and the board's screen runs wider than the plate's so the two sections do not share a rhythm |
| D7 | Gates still green after the rework | **MET** | `G4 PASS`, `G6 PASS`, `G7 PASS` (88 runs, worst 5.85:1, control fires at 1.01:1), `G14 PASS` |

### Page Conversion Readiness and Impact Index

Scored per the page-cro rubric, on the structured chapters.

| Category | Score | Note |
|---|---|---|
| Value proposition clarity | 20 / 25 | What it is and what it does are now unmistakable. What is missing is the differentiator: nothing on the page says why InPlace rather than an accountant plus a spreadsheet, or rather than an ERP |
| Conversion goal focus | 18 / 20 | One primary action, one secondary, same two labels everywhere, and now three placements instead of two |
| Traffic and message match | 10 / 15 | Cannot be scored higher without knowing where the traffic comes from |
| Trust and credibility | 8 / 15 | Product proof is unusually strong (real screens, every figure sourced). Social proof is absent: no customer, no testimonial, no count of businesses, no security or compliance statement, on a system that touches company money |
| Friction and UX barriers | 13 / 15 | No form, one click to sign up, mobile works, page is 10.3 viewport-heights |
| Objection handling | 3 / 10 | The fineprint answers "what does it cost me to try". Nothing answers setup time, whether it works with the visitor's accountant, what happens to existing suppliers, or price |
| **Total** | **72 / 100** | **Moderate readiness.** Fix the two gaps below before running any A/B test |

**ABANDON: closing the trust and objection gaps.** Both need facts the page does
not have and I will not invent: real customers, real security posture, real
setup time, real pricing. Raised with the owner rather than filled with
plausible copy.

---

## Round 3: differentiation, FAQ and footer

Added on the owner's instruction. The constraint that governed the whole round:
**every claim had to come from a document in the product repo, or not ship.**

| # | Gate | State | Evidence |
|---|---|---|---|
| E1 | The differentiation section makes no claim I cannot source | **MET** | Both columns are lifted from `../NIR-APP/brand/positioning.md` ("מה InPlace מסרבת להיות", "נקודות הוכחה") and `../NIR-APP/PRODUCT.md`. The right column is InPlace's own refusal list, not an assertion about anyone else's product |
| E2 | Every FAQ answer is sourced | **MET** | Roles and the capability contract from `PRODUCT.md`; the document intake from the `office-documents-inbox` capture, read this session; exceptions from the `owner-exceptions` capture; the payment path (approved request, step-up, reason, audit) from `PRODUCT.md` and `CLAUDE.md`; per-organization isolation from the `org_id` + RLS rule in `CLAUDE.md`; Hebrew-first from `PRODUCT.md` |
| E3 | The FAQ works with no JavaScript | **MET** | Native `<details>`/`<summary>`. `G14 PASS`: 7 entries, exactly one open at rest |
| E4 | No footer link points at nothing | **MET** | `G14 PASS`: 9 links, none empty, none a `#` stub, none a placeholder domain. **Three of them still need the owner's confirmation** (see below) |
| E5 | Contrast holds on both new sections | **MET** | `G7 PASS`, 132 text runs across 10 scroll positions (was 88), worst **5.26:1** on `.btn`, control fires at 1.01:1 |
| E6 | Still zero em-dashes, detector still clean | **MET** | `grep -o "—" dist/index.html \| wc -l` = 0; `detect.mjs` returns `[]` |
| E7 | Layout families stay distinct | **MET** | Six blocks, six families: title page, sticky film spread, chain plus wide screen, two-column refusal list, `<details>` accordion, colophon. No family repeats |
| E8 | Gates still green at the new length | **MET** | `G4 PASS`, `G6 PASS` (390/768/1024/1440), `G7 PASS`, `G14 PASS`. Page is now **13.06vh** |

**ABANDON: three footer destinations.** `inplace.digital/pricing`, `/terms` and
`/privacy` come from the product's own route list in
`artifacts/domain-cutover/PRE-CUTOVER-SNAPSHOT`, which is a snapshot of the
pre-cutover domain. Whether they resolve on `inplace.digital` today is not
something this repo can prove. They are all in `i18n/he.js` under
`footer.cols`, and the owner has to confirm or correct them before the page is
published.

**ABANDON: pricing, setup time and accounting-software integration.** Three
questions a visitor asks that the page still does not answer, because the facts
do not exist in any document I can read. They were left out rather than
answered plausibly.

---

## Round 4: the plans chapter

Added on the owner's instruction ("צריך גם להוסיף אזור מנויים, המחירים נמצאים
באפליקציה של ניר"). Two owner decisions in `../NIR-APP/docs/OPEN-DECISIONS.md`
govern what may appear:

- **#267** (25.08.2026): no sum reaches a public surface before launch. The
  decision names the marketing site explicitly and records that a check was
  added there which fails on any currency symbol inside the pricing block.
  Public surfaces publish volume only; the amount appears inside the account at
  upgrade, where the billing country is known.
- **#266** (24.08.2026): exactly one usage metric is published, documents per
  month. The page ceiling is derived and unpublished; the assistant quota stays
  hidden from every customer surface until a signed DPA (#271).
- **#201**: ביזנס carries no published figure.

| # | Gate | State | Evidence |
|---|---|---|---|
| P1 | Five plans, published as a real table | **MET** | `G14 PASS`: 5 rows. A `<table>` with `<th scope>` on both axes, so each figure carries its column for a screen reader |
| P2 | No sum anywhere in the plans section | **MET, and the check is proven to fire** | `G14 PASS` clean. Injecting `69 ₪ לחודש` into one price cell made it fail with `found ₪ in the plans section`, then the file was restored. A negative assertion that has never failed is not evidence |
| P3 | Only the one published metric appears | **MET** | Documents per month only: 20 / 40 / 150 / 375 / חוזי. No page ceiling, no assistant quota, no user or branch count |
| P4 | No unimplemented capability is advertised | **MET** | The per-plan capability locks of #274 and the 30-day window of #276 are both `DECIDED / NOT_IMPLEMENTED`, so neither is on the page. The "who it is for" column carries fit, not a feature promise |
| P5 | Contrast and layout hold with the new section | **MET** | `G7 PASS` 131 runs, worst 5.85:1; `G6 PASS` at 390/768/1024/1440; `G4 PASS`; detector `[]`; zero em-dashes |
| P6 | The footer's pricing link resolves | **MET** | It pointed at `inplace.digital/pricing`, one of the three destinations round 3 could not confirm. It now points at `#plans` on this page, so one of the three open questions is closed |

**ABANDON: publishing the actual amounts.** 69 / 249 / 449 ₪ per month exist and
are verified in `supabase/migrations/0184_launch_plan_and_price_catalogue.sql`
lines 235-237. They are not on the page because #267 forbids it, and #267 is an
owner decision recorded the day before this session. Reversing it is the owner's
call, not mine; the copy and the gate are both one edit away.

**ABANDON: the quota deploy dependency.** The published quotas 20/40/150/375 are
#266's values. #266's status is `IMPLEMENTED / MERGED / NOT_DEPLOYED` and
production still stands on migration `0170`, which carries the earlier
25/50/200/500. **This page must not go live before that migration deploys**, or
it will publish a quota the running system does not enforce.

---

## Round 5: prices published

The owner reversed decision #267 for this page on 26.08.2026: *"תוסיף את
המחירים, זה יהיה נתון לשינוי בכל מקרה, יש עוד מלא זמן לאתר נחיתה עד שהוא יהיה
באוויר."* #267 still governs the product's own `Pricing.tsx` and the branch
`fix/no-public-prices-20260825`; nothing here touches those.

| # | Gate | State | Evidence |
|---|---|---|---|
| M1 | Every amount matches the launch catalogue | **MET, and the check is proven to fire** | `G14 PASS`: the six amounts on the page are exactly `69, 249, 449, 690, 2490, 4490`, the `launch-il` rows of `0184_launch_plan_and_price_catalogue.sql:234-241`. Editing one cell to `259 ₪` made it fail with both a stray and a missing amount, then the file was restored |
| M2 | The prices carry a source, like every other figure | **MET** | Note 9 in the apparatus names the catalogue, the interval, the before-tax basis and the date. `G14 PASS`: 9 cited figures against 9 sources |
| M3 | The old no-price assertion is replaced, not deleted | **MET** | The negative check became a positive one. A gate that was removed rather than replaced would have left the amounts unguarded |
| M4 | Contrast holds | **MET, after fixing a real defect it caught** | `G7 PASS`, 132 runs, worst now **6.76:1**. It first reported **4.43:1** on the primary CTA. That was neither a false positive nor a capture artifact: the folio's ground flip transitions the button's colours, and for ~160ms the CTA sits blended between two palettes. Measured mid-flip at `rgb(50,169,182)` on `rgb(29,43,47)`. The transition is now suppressed on that button |
| M5 | The bar's ground follows every cream plate | **MET** | The flip was bound to the first plate only, so the bar stayed dark over the FAQ plate. It now tracks all of them |

**Note on the diagnosis in M4.** The first hypothesis was that Playwright's
screenshot path had dropped a composited layer, which is a known failure on this
machine. Switching the capture to CDP reproduced the same 4.43:1, which is what
ruled the hypothesis out and sent the search to the transition. The gate keeps
the CDP capture: it is the correct path for a page carrying a `<video>` and a
`backdrop-filter`.

**ABANDON: the quota deploy dependency, unchanged.** The published quotas
20/40/150/375 are #266's values and production still stands on migration `0170`
with 25/50/200/500. The page must not go live before that deploy lands.
