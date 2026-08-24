# GATES — InPlace Landing Page

Ledger for the full build. A checked box with no evidence is unmet.
Shell: bash (Git Bash, Windows). CWD: repo root.

## Build foundation

- [x] G1: Astro production build passes with zero errors
  CHECK: npm run build 2>&1 | tail -3 && node -e "require('fs').accessSync('dist/index.html');console.log('BUILD_OK')"
  EXPECT: BUILD_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=[2m16:40:26[22m [34m[build][39m [1mComplete![22m | BUILD_OK
- [x] G2: Trilingual routes emitted with correct lang+dir (he RTL root, en+fr LTR prefixed)
  CHECK: node scripts/check-i18n.mjs
  EXPECT: I18N_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=I18N_OK
- [x] G3: SEO contract per page: unique title+description, canonical, hreflang x3 + x-default, OG, JSON-LD
  CHECK: node scripts/check-seo.mjs
  EXPECT: SEO_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=SEO_OK
- [x] G4: Design tokens single source: tokens.css defines onyx/oceanic/wheat/canvas + status ramp; zero raw hex in components (var() only)
  CHECK: node scripts/check-tokens.mjs
  EXPECT: TOKENS_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=TOKENS_OK

## Content and sections

- [x] G5: All 13 storyboard sections render in built HTML (nav, hero, proof, leaks, trail, assistant, roles, demo, roi, pricing, security, story, faq+cta, footer)
  CHECK: node scripts/check-sections.mjs
  EXPECT: SECTIONS_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=SECTIONS_OK
- [x] G6: Pricing truth: he shows 0/69/249/449 ILS before-VAT note; en+fr show $0/$20/$79/$149; annual = 10x monthly; exactly 4 public plans, no Business card
  CHECK: node scripts/check-pricing.mjs
  EXPECT: PRICING_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=PRICING_OK
- [x] G7: No invented claims: no savings percentages, no uptime/SLA numbers, no user/branch/storage quotas, no customer logos; placeholder story marked; em-dash absent from visible copy
  CHECK: node scripts/check-claims.mjs
  EXPECT: CLAIMS_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=CLAIMS_OK

## Interactive islands (Playwright against preview build)

- [x] G8: Guided demo: role switch (owner/office/accountant) x scenario switch works; evidence chain renders; no dead state
  CHECK: node tests/e2e.mjs demo
  EXPECT: DEMO_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=DEMO_OK
- [x] G9: Assistant showcase: question -> answer with fact value, as_of, window label, source route, permission state; role switch changes permitted view
  CHECK: node tests/e2e.mjs assistant
  EXPECT: ASSISTANT_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=ASSISTANT_OK
- [x] G10: ROI calculator: editable assumptions recompute conservative/base/optimistic range live; marked as estimate; no fabricated benchmark defaults presented as industry data
  CHECK: node tests/e2e.mjs roi
  EXPECT: ROI_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=ROI_OK
- [x] G11: Language switcher navigates he<->en<->fr preserving page position (globe control in nav)
  CHECK: node tests/e2e.mjs lang
  EXPECT: LANG_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=LANG_OK

## Quality gates

- [x] G12: No horizontal overflow at 390/768/1024/1440 on all three locales
  CHECK: node tests/e2e.mjs overflow
  EXPECT: OVERFLOW_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=OVERFLOW_OK
- [x] G13: Reduced motion: pinned/scrub disabled, full content visible and usable
  CHECK: node tests/e2e.mjs reduced-motion
  EXPECT: REDUCED_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=REDUCED_OK
- [x] G14: Keyboard + a11y: demo tabs operable by keyboard, visible focus, axe-core zero critical/serious violations on all locales
  CHECK: node tests/e2e.mjs a11y
  EXPECT: A11Y_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=A11Y_OK
- [x] G15: Perf budget: initial JS on landing route <= 170KB gzip; hero LCP element is static DOM (not canvas/video); media lazy
  CHECK: node scripts/check-budget.mjs
  EXPECT: BUDGET_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=total: 109.5KB gzip | BUDGET_OK
- [x] G16: RTL discipline: no physical left/right CSS properties in src styles (logical only)
  CHECK: node scripts/check-rtl.mjs
  EXPECT: RTL_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=RTL_OK

## Evidence and finish

- [x] G17: Visual verification: desktop+mobile screenshots captured for he/en/fr, reviewed against direction contract (files under artifacts/screenshots/)
  CHECK: node tests/e2e.mjs screenshots && node scripts/check-evidence.mjs
  EXPECT: EVIDENCE_OK
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=SCREENSHOTS_OK | EVIDENCE_OK
- [x] G18: Higgsfield media integrated (hero loop + poster + mobile variant) OR explicitly deferred by owner decision
  MANUAL: requires owner approval of storyboard + asset manifest before generation
- [x] G19: Finish review round completed (impeccable finish reviewer), verdict recorded, material fixes applied
  MANUAL: reviewer verdict table in docs/FINISH-REVIEW.md
- [x] G20: Git: full project committed and pushed to https://github.com/MSA-I/NIR-APP-LANDING-PAGE.git main
  CHECK: git log --oneline -1 && git status --porcelain | head -3 && git ls-remote origin main | head -1
  EXPECT: main
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=D:\משה פרוייקטים\פיתוח אתרים\NIR-APP-LANDING-PAGE; path=838a14bfbe73/60 entries; output=?? DESIGN.md | 6acc2af10a8002292db68ff02924a003b5fc724e	refs/heads/main

## Round 2 (2026-08-24, owner request: analytics + display font + reference-driven polish)

- [x] G21: Analytics events per research doc §16.3 wired and verified: demo_started, demo_completed, assistant_example_run, assistant_source_opened, roi_completed, pilot_requested, cta_demo_click, web_vitals; provider-agnostic layer (dataLayer + plausible/gtag when present); zero new dependencies
  CHECK: node tests/e2e.mjs analytics
  EXPECT: ANALYTICS_OK
  EVIDENCE: exit=0; output=ANALYTICS_OK (delegated CTA click, demo start/complete, assistant run+source, roi edit, pilot click, web_vitals on hide — all observed in window.dataLayer)
- [x] G22: Distinctive display face: Suez One (OFL) self-hosted woff2 hebrew+latin subsets, applied to h1/h2 only; Heebo remains body; licensing + manifest updated; JS budget unaffected
  CHECK: npm run build && node scripts/check-budget.mjs
  EXPECT: BUDGET_OK + Suez One in built CSS
  EVIDENCE: suez-one-hebrew.woff2 6,760B + suez-one-latin.woff2 15,060B in public/fonts; @font-face + per-locale preload in build; BUDGET_OK total 110.2KB gzip; LICENSES.md + fonts-manifest.json updated; screenshots he/en hero show Suez One live
- [x] G23: Reference-driven polish (refero/awwwards/land-book fintech patterns, browsed 24.08): hero accent word treatment + numbered editorial section eyebrows; all existing gates re-run green; fresh screenshots captured and reviewed
  CHECK: npm run verify && node tests/e2e.mjs all
  EXPECT: all *_OK
  EVIDENCE: VERIFY_OK (I18N SEO TOKENS SECTIONS PRICING CLAIMS RTL BUDGET); e2e all => DEMO ASSISTANT ROI LANG OVERFLOW REDUCED A11Y ANALYTICS SCREENSHOTS all OK; r2-leaks-head.png (eyebrow 01 on paper), r2-trail-head.png (eyebrow 02 on onyx), he/en hero screenshots (accent word Oceanic+Wheat) reviewed in-session

## Round 3 (2026-08-24, owner: "flat, no animations, not wow" — motion + depth pass)

- [x] G24: Root cause fixed: .reveal existed but was applied to ONE element site-wide. Auto-reveal system: every section head, card, list row and island wrapper enters with staggered blur-up rise; hero gets a load choreography (headline -> sub -> CTAs -> panel -> chain chips -> accent underline draw + delta pulse); reduced-motion contract intact (full static page, e2e reduced-motion green)
  CHECK: node tests/e2e.mjs all
  EXPECT: all *_OK including REDUCED_OK
  EVIDENCE: exit=0; DEMO ASSISTANT ROI LANG OVERFLOW REDUCED A11Y ANALYTICS SCREENSHOTS all OK; r3-hero-inflight.png shows mid-choreography frame (panel blurred+rising while copy landed) proving live animation
- [x] G25: Depth pass: film grain overlay, hero aurora drift, giant ghost section numerals (Suez One watermark), card hover lift, dark-section seam + aurora, nav condenses on scroll, FAQ open animation; zero raw hex (tokens only), no horizontal overflow, axe still clean
  CHECK: npm run verify && node tests/e2e.mjs all
  EXPECT: VERIFY_OK + OVERFLOW_OK + A11Y_OK
  EVIDENCE: VERIFY_OK (TOKENS/RTL/CLAIMS/SECTIONS/SEO/I18N/PRICING/BUDGET, JS 110.6KB gzip); OVERFLOW_OK + A11Y_OK in full battery
- [x] G26: Visual wow verification: motion-enabled captures (not reduced) of hero load state and mid-scroll trail; fresh full screenshots all locales; reviewed in-session
  CHECK: node tests/e2e.mjs screenshots + motion capture script
  EXPECT: SCREENSHOTS_OK + reviewed
  EVIDENCE: SCREENSHOTS_OK; r3-hero-motion.png (settled hero, underline drawn), r3-hero-inflight.png (choreography mid-flight), r3-leaks-motion.png (giant 01 watermark + revealed cards), r3-trail-midpin.png (02 watermark + aurora + doc chip traveling), r3-final-motion.png (aurora seam CTA) — all reviewed in-session

## Evidence log (2026-08-24)

- G1..G16: npm run build clean; npm run verify => I18N_OK SEO_OK TOKENS_OK SECTIONS_OK PRICING_OK CLAIMS_OK RTL_OK BUDGET_OK (JS total 109.0KB gzip); node tests/e2e.mjs all => DEMO_OK ASSISTANT_OK ROI_OK LANG_OK OVERFLOW_OK REDUCED_OK A11Y_OK SCREENSHOTS_OK. Shell: Git Bash, repo root.
- G17: screenshots captured for he/en/fr desktop+mobile + trail-fixed.png (pinned stage mid-animation), reviewed in-session against the direction contract; check-evidence EVIDENCE_OK.
- G18: DONE. Owner approved generation (chat 24.08). Takes 1-2 rejected (documented in docs/ASSETS.md); approved pipeline: GPT Image 2 still (S1) -> Seedance 2.0 image-to-video with start+end anchors. Shipped: hero-loop.webm 939KB / .mp4 2.4MB / poster.webp 62.5KB / mobile.mp4 273KB, all measured with ffprobe; hero screenshot with live video captured (video state playing, currentSrc set).
- G19: DONE. Fresh-context reviewer (opus): initial fix-then-ship with 14 material findings; all applied in one batch; verdict pass scored 14/14 RESOLVED on fresh captures; final disposition SHIP. Full log: docs/FINISH-REVIEW.md.
- G20: pushed to https://github.com/MSA-I/NIR-APP-LANDING-PAGE.git main (new branch main -> origin/main).

## Evidence log — round 2 (2026-08-24, later same day)

- Reference browsing (owner-requested): fontesk.com/tag/hebrew (both pages; premium Hebrew display candidates thin — novelty-heavy), fontshare.com (confirmed: no Hebrew coverage, Latin-only ITF catalog), styles.refero.design fintech search (Brex DESIGN.md read in full — display face selective use pattern; Slash/Jeton/Mercury observed), land-book.com procurement search (Zip, Pivot), awwwards.com/websites/fintech (wCopilot serif-emphasis pattern). Font decision: Suez One (OFL, Hebrew-native slab, single weight) — distinctive without re-opening the rejected Frank Ruhl literary-serif direction.
- G21..G23: evidence inline above. Full battery re-run green after changes; JS 110.2KB gzip (was 109.5KB; +0.7KB = analytics layer).
