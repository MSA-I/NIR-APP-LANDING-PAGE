# GATES — InPlace Landing Page

Ledger for the full build. A checked box with no evidence is unmet.
Shell: bash (Git Bash, Windows). CWD: repo root.

## Build foundation

- [ ] G1 Astro production build passes with zero errors
  CHECK: npm run build 2>&1 | tail -5 && ls dist/index.html >/dev/null && echo BUILD_OK
  EXPECT: BUILD_OK
- [ ] G2 Trilingual routes emitted with correct lang+dir (he RTL root, en+fr LTR prefixed)
  CHECK: node scripts/check-i18n.mjs
  EXPECT: I18N_OK
- [ ] G3 SEO contract per page: unique title+description, canonical, hreflang x3 + x-default, OG, JSON-LD
  CHECK: node scripts/check-seo.mjs
  EXPECT: SEO_OK
- [ ] G4 Design tokens single source: tokens.css defines onyx/oceanic/wheat/canvas + status ramp; zero raw hex in components (var() only)
  CHECK: node scripts/check-tokens.mjs
  EXPECT: TOKENS_OK

## Content and sections

- [ ] G5 All 13 storyboard sections render in built HTML (nav, hero, proof, leaks, trail, assistant, roles, demo, roi, pricing, security, story, faq+cta, footer)
  CHECK: node scripts/check-sections.mjs
  EXPECT: SECTIONS_OK
- [ ] G6 Pricing truth: he shows 0/69/249/449 ILS before-VAT note; en+fr show $0/$20/$79/$149; annual = 10x monthly; exactly 4 public plans, no Business card
  CHECK: node scripts/check-pricing.mjs
  EXPECT: PRICING_OK
- [ ] G7 No invented claims: no savings percentages, no uptime/SLA numbers, no user/branch/storage quotas, no customer logos; placeholder story marked; em-dash absent from visible copy
  CHECK: node scripts/check-claims.mjs
  EXPECT: CLAIMS_OK

## Interactive islands (Playwright against preview build)

- [ ] G8 Guided demo: role switch (owner/office/accountant) x scenario switch works; evidence chain renders; no dead state
  CHECK: node tests/e2e.mjs demo
  EXPECT: DEMO_OK
- [ ] G9 Assistant showcase: question -> answer with fact value, as_of, window label, source route, permission state; role switch changes permitted view
  CHECK: node tests/e2e.mjs assistant
  EXPECT: ASSISTANT_OK
- [ ] G10 ROI calculator: editable assumptions recompute conservative/base/optimistic range live; marked as estimate; no fabricated benchmark defaults presented as industry data
  CHECK: node tests/e2e.mjs roi
  EXPECT: ROI_OK
- [ ] G11 Language switcher navigates he<->en<->fr preserving page position (globe control in nav)
  CHECK: node tests/e2e.mjs lang
  EXPECT: LANG_OK

## Quality gates

- [ ] G12 No horizontal overflow at 390/768/1024/1440 on all three locales
  CHECK: node tests/e2e.mjs overflow
  EXPECT: OVERFLOW_OK
- [ ] G13 Reduced motion: pinned/scrub disabled, full content visible and usable
  CHECK: node tests/e2e.mjs reduced-motion
  EXPECT: REDUCED_OK
- [ ] G14 Keyboard + a11y: demo tabs operable by keyboard, visible focus, axe-core zero critical/serious violations on all locales
  CHECK: node tests/e2e.mjs a11y
  EXPECT: A11Y_OK
- [ ] G15 Perf budget: initial JS on landing route <= 170KB gzip; hero LCP element is static DOM (not canvas/video); media lazy
  CHECK: node scripts/check-budget.mjs
  EXPECT: BUDGET_OK
- [ ] G16 RTL discipline: no physical left/right CSS properties in src styles (logical only)
  CHECK: node scripts/check-rtl.mjs
  EXPECT: RTL_OK

## Evidence and finish

- [ ] G17 Visual verification: desktop+mobile screenshots captured for he/en/fr, reviewed against direction contract (files under artifacts/screenshots/)
  CHECK: node tests/e2e.mjs screenshots && node scripts/check-evidence.mjs
  EXPECT: EVIDENCE_OK
- [ ] G18 Higgsfield media integrated (hero loop + poster + mobile variant) OR explicitly deferred by owner decision
  MANUAL: requires owner approval of storyboard + asset manifest before generation
- [ ] G19 Finish review round completed (impeccable finish reviewer), verdict recorded, material fixes applied
  MANUAL: reviewer verdict table in docs/FINISH-REVIEW.md
- [ ] G20 Git: full project committed and pushed to https://github.com/MSA-I/NIR-APP-LANDING-PAGE.git main
  CHECK: git log --oneline -1 && git status --porcelain | head -3 && git ls-remote origin main | head -1
  EXPECT: main
