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

## Round 4 (2026-08-24, owner: build the next tier)

- [x] G27: Word-by-word hero headline: h1 renders as staggered word spans (110ms steps, accent word integrated), static text intact in HTML, downstream choreography retimed; reduced motion = static
  CHECK: node scripts/check-budget.mjs (tag-stripped headline) + motion capture
  EXPECT: BUDGET_OK + capture shows partial words mid-flight
  EVIDENCE: BUDGET_OK; r4-words-inflight.png: first word landed, accent word landing, last word still blurred mid-rise
- [x] G28: Scroll spine: fixed money-trail line at the page edge that fills with scroll progress, glowing chip at the tip; desktop + motion-allowed only, aria-hidden, JS rAF-throttled
  CHECK: motion capture + measured --sp value
  EXPECT: visible progressive fill
  EVIDENCE: --sp measured 0.707 at #roi scroll position; chip+fill visible in r4-chapter-cool/warm captures at different heights
- [x] G29: Scroll-driven product scenes: leak cards + assistant card + roles widget + demo panel + roi results enter via CSS view-timeline (scrubbed by scroll, alternating tilt settle) where supported; auto-reveal fallback elsewhere; reduced motion static
  CHECK: node tests/e2e.mjs all (Chromium supports view())
  EXPECT: all *_OK
  EVIDENCE: full battery green (DEMO/ASSISTANT/ROI/LANG/OVERFLOW/REDUCED/A11Y/ANALYTICS/SCREENSHOTS); r4-scene-midentry.png shows cards blurred+tilted mid-entry driven by scroll position
- [x] G30: Chapter color transitions: body background morphs (canvas/warm/cool) as sections cross the viewport, 800ms ease; sections with explicit canvas backgrounds made transparent; axe contrast still clean
  CHECK: node tests/e2e.mjs a11y + motion captures in different chapters
  EXPECT: A11Y_OK + visible tint shift
  EVIDENCE: A11Y_OK all locales; r4-chapter-cool.png (assistant, oceanic wash) vs r4-chapter-warm.png (roi, wheat wash) show distinct grounds; JS guarded to motion-allowed wide viewports; JS 111.0KB gzip

## Round 5 (2026-08-24, impeccable critique 29/40 + emil review — owner: fix everything incl. P3)

- [x] G31: P1 fixes: mobile persistent CTA in nav bar; accent underline visible (new decorative token, not a status color); trail close folded into timeline final beat + scroll cue at pin start
  CHECK: build + e2e all + motion captures
  EXPECT: green + visible underline + cue in capture
  EVIDENCE: he-mobile-hero.png shows the compact "דמו חי" pill in the sticky bar at 390w; r3-hero-motion.png shows the --wheat-deep #f5d9a0 bar under "לפני" (was wheat-on-canvas, invisible); r3-trail-midpin.png confirms the closing line no longer leaks mid-pin (GSAP autoAlpha 0 until beat n-0.35); scroll cue added with one-shot fade at 0.55. Regression caught by the battery en route: mobile CTA caused 39px overflow at en/390 -> per-locale ctaShort + globe-only lang label below 560px, OVERFLOW_OK restored.
- [x] G32: P2 fixes: roving tabindex + RTL-aware arrow keys on demo pills, assistant pills, pricing toggle; og:image 1200x630 shipped + meta; hero media layout reserved statically (no post-HEAD jump); dead action-colored span muted
  CHECK: node tests/e2e.mjs a11y (new radiogroup assertions) + og meta in built HTML
  EXPECT: green
  EVIDENCE: A11Y_OK with new per-group assertions (exactly 1 tab stop + ArrowRight moves selection, across demo/assistant/pricing groups, RTL-aware via src/lib/radiogroup.ts); og-cover.jpg 78KB 1200x630 + og:image/twitter:image/alt meta in all three pages; hero padding now static on >=1024 so .has-media cannot shift layout; ghost-action recolored to --ink-muted.
- [x] G33: P3 + emil + minors: grain removed; ghost numerals only on leaks/trail/demo; FAQ close 200ms (asymmetric); chip-pop overshoot removed; spine moved off the scrollbar edge in RTL; pricing-notes split; empty class attrs removed
  CHECK: npm run verify + e2e all + fresh screenshots reviewed
  EXPECT: all green
  EVIDENCE: VERIFY_OK + full battery green TWICE (flake-free); JS 111.4KB gzip. Numbering now runs 01/02/03 across the three sections that are a real sequence (problem/mechanism/invitation) instead of 01-08 on every head; kicker removed entirely. Trail panels promoted to display type and the pinned section centers in the viewport (r3-trail-midpin.png). Two e2e robustness fixes (demo clickUntil, radiogroup retry) for client:visible hydration races.

## Round 6 (2026-08-24, critique round 2 = 27/40, owner: fix everything incl. P2/P3)

Standing rule adopted from this critique: a gate about something VISIBLE is not
met by source that looks right. It is met by a measurement of the render
(computed style, pixel delta, or a capture). The broken 03 numeral and the
imperceptible chapter tint both passed source review and failed the screen.

New runnable gate: `npm run measure` (scripts/measure-render.mjs) asserts eight
render truths in a real browser. It caught two live defects the moment it was
written: the trail numeral was hidden behind its own Onyx ground (same class of
bug as the demo one), and the hero choreography still settled at 1100ms.

- [x] G34: P0 pricing CTA: per-plan labels + ?plan= on hrefs; free-first note moves into the card
  CHECK: node scripts/check-pricing.mjs + rendered labels differ across the 4 cards
  EXPECT: PRICING_OK + 4 distinct labels
  EVIDENCE: PRICING_OK; r6-pricing-ctas.png shows four distinct labels (פתיחת חשבון חינם / התחלה במסלול בסיס / פרו / פרימיום), each href carries ?plan=<id>, and "מתחילים חינם, משדרגים כשמוכנים" now sits under the button it qualifies instead of under the whole grid.
- [x] G35: P0 hero a11y: the invoice replica is reachable by assistive tech
  CHECK: CDP Accessibility.getFullAXTree assertion (axe passes role="img", so axe cannot catch this)
  EXPECT: replica facts present in the a11y tree
  EVIDENCE: measure-render step 8 = "3/3 facts present" (INV-2311, 1,240, חסומה לתשלום). role="img" replaced by role="group" + aria-labelledby on the titlebar.
- [x] G36: P1 guided demo becomes guided: step indicator, ordered progression, primary next control with progress
  CHECK: node tests/e2e.mjs demo
  EXPECT: DEMO_OK + visible step state
  EVIDENCE: DEMO_OK; r6-demo-guided.png shows "תרחיש 1 מתוך 4", a four-tick progress rail, a primary "לתרחיש הבא 2/4" button (the pilot CTA became the secondary link), and the two pill groups boxed apart so seven look-alike pills no longer read as one row.
- [x] G37: P1 placeholder story does not render until a real quote exists
  CHECK: node scripts/check-sections.mjs (now FAILS if the story ships)
  EXPECT: no story section in the build
  EVIDENCE: SECTIONS_OK with the inverted assertion; HAS_REAL_CUSTOMER_QUOTE=false in Story.astro gates the section out of all three pages.
- [x] G38: P1 hero choreography capped, product panel starts early, no blur on display words
  CHECK: measured animation-delay + duration across every hero element
  EXPECT: settles <= 1000ms
  EVIDENCE: measured 940ms (was ~1720ms). Panel now starts at 120ms; word spans use translate+opacity only (blur removed: it ghosted at 68px).
- [x] G39: P2 rendering truths MEASURED
  CHECK: npm run measure
  EXPECT: measured deltas reported, not asserted
  EVIDENCE: chapter tint warm=rgb(246,239,226) cool=rgb(234,240,240), max channel delta 14 (was ~2-3, below perception); all three numerals render at 190px with their sections opening stacking contexts; spine he/rtl center=1416px (right), en/ltr center=24px (left), scrollbar on the opposite edge in both.
- [x] G40: P2 consistency + freshness
  CHECK: computed styles compared across groups; page carries today's date
  EXPECT: single color + live date
  EVIDENCE: all four pill groups measured at rgb(0,63,71); as_of generated by buildAsOf() at build time, measured as containing today (24.08.2026).
- [x] G41: P2 Suez One Hebrew-only; ROI disclaimer states whose assumptions these are
  CHECK: computed font-family per locale + copy check
  EXPECT: Heebo on Latin, honest disclaimer
  EVIDENCE: measured h1 font = Suez One on he, Heebo on en and fr (r6-en-hero-heebo.png); Suez preload dropped for Latin locales. ROI disclaimer now reads "המספרים כרגע הם הנחות פתיחה שלנו, לא נתונים שלכם" until a field is edited.
- [x] G42: P3 sweep
  CHECK: npm run verify + node tests/e2e.mjs all + grep the built HTML
  EXPECT: all green, zero process scaffolding in dist
  EVIDENCE: DIRECTION CONTRACT removed from <body> and check-sections now fails if it returns; Cyrillic artifact fixed; rolesAmount labelled "סך החשבונית"; Roles.astro imports arrowTarget from radiogroup.ts (one implementation) and no longer forces focus on mouse click; trail pin uses gsap.matchMedia so breakpoint changes rebuild instead of stranding the session; Base.astro re-evaluates its media queries on change; security icons mapped one-to-one to their statements (r6-security-icons.png); aria-live narrowed from the two-column body to the summary; intro-quota note now says "מעבר למכסה החודשית". Pin shortened from 520px to 300px per station; station labels 12px -> 13.5px in 84px cells.

## Evidence log (2026-08-24)

- G1..G16: npm run build clean; npm run verify => I18N_OK SEO_OK TOKENS_OK SECTIONS_OK PRICING_OK CLAIMS_OK RTL_OK BUDGET_OK (JS total 109.0KB gzip); node tests/e2e.mjs all => DEMO_OK ASSISTANT_OK ROI_OK LANG_OK OVERFLOW_OK REDUCED_OK A11Y_OK SCREENSHOTS_OK. Shell: Git Bash, repo root.
- G17: screenshots captured for he/en/fr desktop+mobile + trail-fixed.png (pinned stage mid-animation), reviewed in-session against the direction contract; check-evidence EVIDENCE_OK.
- G18: DONE. Owner approved generation (chat 24.08). Takes 1-2 rejected (documented in docs/ASSETS.md); approved pipeline: GPT Image 2 still (S1) -> Seedance 2.0 image-to-video with start+end anchors. Shipped: hero-loop.webm 939KB / .mp4 2.4MB / poster.webp 62.5KB / mobile.mp4 273KB, all measured with ffprobe; hero screenshot with live video captured (video state playing, currentSrc set).
- G19: DONE. Fresh-context reviewer (opus): initial fix-then-ship with 14 material findings; all applied in one batch; verdict pass scored 14/14 RESOLVED on fresh captures; final disposition SHIP. Full log: docs/FINISH-REVIEW.md.
- G20: pushed to https://github.com/MSA-I/NIR-APP-LANDING-PAGE.git main (new branch main -> origin/main).

## Evidence log — round 2 (2026-08-24, later same day)

- Reference browsing (owner-requested): fontesk.com/tag/hebrew (both pages; premium Hebrew display candidates thin — novelty-heavy), fontshare.com (confirmed: no Hebrew coverage, Latin-only ITF catalog), styles.refero.design fintech search (Brex DESIGN.md read in full — display face selective use pattern; Slash/Jeton/Mercury observed), land-book.com procurement search (Zip, Pivot), awwwards.com/websites/fintech (wCopilot serif-emphasis pattern). Font decision: Suez One (OFL, Hebrew-native slab, single weight) — distinctive without re-opening the rejected Frank Ruhl literary-serif direction.
- G21..G23: evidence inline above. Full battery re-run green after changes; JS 110.2KB gzip (was 109.5KB; +0.7KB = analytics layer).
