---
target: landing homepage (round 2, after fix batch)
total_score: 27
p0_count: 2
p1_count: 3
timestamp: 2026-08-24T16-35-16Z
slug: src-pages-index-astro
---
# Critique round 2 — InPlace landing (src/pages/index.astro), after the round-1 fix batch

## Design Health Score (Nielsen)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Mobile demo output changes ~800px below the pills you tapped |
| 2 | Match System / Real World | 4 | Real P2P vocabulary, not marketing paraphrase |
| 3 | User Control and Freedom | 2 | Pinned trail seizes 3,120px with no skip affordance |
| 4 | Consistency and Standards | 2 | Same role pills 3x with two different selected colors; 4 identical pricing CTAs; inline style= bypassing tokens |
| 5 | Error Prevention | 3 | ROI clamps negatives, but the pricing CTA actively misleads |
| 6 | Recognition Rather Than Recall | 2 | 7 numbers across 5 sections; unlabeled 12,412 reconciles with nothing |
| 7 | Flexibility and Efficiency | 3 | Anchor nav, persistent CTA, roving tabindex, RTL arrows |
| 8 | Aesthetic and Minimalist Design | 3 | Ghost numerals, imperceptible tint, black media frame = decoration not paying rent |
| 9 | Error Recovery | 2 | not_permitted is a grey dead end with no route forward |
| 10 | Help and Documentation | 3 | Six real FAQ answers, visible ROI formula, mechanism-level security |
| **Total** | | **27/40** | Down from 29 (round 1). Different reviewer, deeper lens. |

## Anti-Patterns Verdict

LLM: "a very good model made this under heavy supervision." Tells concentrated in ORNAMENT, not substance. Ghost numerals anchored to the 720px head box (float mid-canvas, not at a margin); six-icon security grid with icons assigned BY ARRAY INDEX (zero semantic correspondence); four structurally identical leak cards; documented-but-invisible systems (chapter tint delta ~2-3% luminance, below JND); DIRECTION CONTRACT process comment shipped inside <body>; Cyrillic characters inside an English CSS comment (token artifact).

Genuinely distinctive: Suez One Hebrew display; hero as a blocked invoice mid-decision; wheat/onyx/oceanic with zero purple/glass/gradient; status colors constrained to business meaning with a neutral disclosure chip; accent underline with correct RTL flip.

Detector: 1 advisory (numbered-section-markers) VERIFIED FALSE POSITIVE this round: the matched sequence "08, 09, 10, 12" comes from date strings (24.08.2026, 09:40), the 30-day window and "12 lines checked", not from section markers. The real CSS-counter numerals are invisible to a static scanner.

## Priority Issues

- [P0] All four pricing cards say "open a free account" and link to a bare APP_URL. Verified: Pricing.astro:48-52. The section cannot express "I want Pro" at the highest-intent moment.
- [P0] Hero replica invisible to assistive tech: role="img" on .hero-visual makes the whole subtree presentational; the page's entire first proof is lost. Axe passes it (technically valid), so the gate cannot catch it.
- [P1] The "guided demo" is a filter panel, not guided: no step, no sequence, no progress, 12 combinations with no recommended path. BRIEF §4 specified a progression.
- [P1] Labeled placeholder testimonial ships live; tells the visitor at the trust moment that no customer will be named.
- [P1] Hero spends its first ~1.5s empty (chips land ~1,720ms); blur(6px) on 68px Hebrew display ghosts badly.
- [P2] Chapter "03" never renders: numeral is z-index:-1 and .demo-section paints an opaque gradient with no stacking context. VERIFIED in source. 01/02/(nothing).
- [P2] Same role selector 3x with two different selected colors; state does not persist across them.
- [P2] as_of timestamp hardcoded in all three locales, on the one claim (freshness) that cannot afford staleness.
- [P2] Pinned trail wastes its peak: ~45% empty viewport, 12px labels wrapping to three lines.
- [P2] Suez One's Latin cut fights the positioning on en/fr (quirky/Victorian at display size).
- [P2] ROI pre-fills vendor assumptions while the disclaimer says "based on the assumptions YOU entered."
- [P3] Unlabeled 12,412; spine on the scrollbar edge in LTR (comment says reading-start, property is inline-END); motion breakpoints never re-evaluated on resize; Roles.astro reimplements radiogroup.ts inline; hero sub verbatim identical to meta.description.

## Persona Red Flags

Jordan: 7 identical pills, two meanings, two dark selected states at once; evidence column mixes unit prices and line totals silently; unexplained grey "01" floating between heading and cards.
Riley: resize across 1024px leaves spine/tint/trail in the wrong mode for the session; role="img" swallows the hero for screen readers; ROI cost=0 silently reads x1; variance=100 returns 85,000/month with no bound.
Casey: demo block ~1,050px tall, taps change things below the fold; 13,429px page; two identically-weighted WhatsApp contacts at the close.

## Questions to Consider

1. The numbering was narrowed once already and the third numeral does not render. What is it doing that the headings do not? Deleting may beat fixing.
2. Every control on the page is a view switch. For a product promising "you see it BEFORE you pay," is there a version where the visitor blocks the invoice themselves?
3. Three systems DESIGN.md defends at length are respectively imperceptible, broken, and positioned against their own stated rationale. What would the ledger have to measure to catch that class of failure?
