---
target: landing homepage (rounds 2-4 build)
total_score: 29
p0_count: 0
p1_count: 3
timestamp: 2026-08-24T15-32-20Z
slug: src-pages-index-astro
---
# Critique — InPlace landing (src/pages/index.astro), rounds 2-4 build

## Design Health Score (Nielsen)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Pinned trail gives no "scroll to advance" cue |
| 2 | Match System / Real World | 4 | Real invoice semantics, reconciling arithmetic |
| 3 | User Control and Freedom | 2 | ~3,100px scroll-jack pin, no skip; "How it works" lands inside it |
| 4 | Consistency and Standards | 3 | Three look-alike pill widgets, three behaviors; one CTA label on all 4 plans |
| 5 | Error Prevention | 3 | mailto pilot CTA = silent dead click without a mail handler |
| 6 | Recognition Rather Than Recall | 3 | INV-2311 continuity across 5 sections never surfaced |
| 7 | Flexibility and Efficiency | 2 | No arrow keys on demo pills / pricing toggle; no way past the pin |
| 8 | Aesthetic and Minimalist Design | 3 | Five simultaneous decorative systems vs "quiet control room" thesis |
| 9 | Error Recovery | 3 | not_permitted states explain and imply the fix |
| 10 | Help and Documentation | 3 | ROI visible formula = help-in-context done right |
| **Total** | | **29/40** | Good band; held back by control + efficiency, not looks |

## Anti-Patterns Verdict

LLM: NOT slop. Distinctive core (Suez One Hebrew slab, product-true replicas whose math reconciles: 47.65-39.90=7.75 x 160 = +1,240) outweighs the garnish. Strongest tell: numbered eyebrows 01-08 + ghost watermark numerals on EVERY section head (2025-26 editorial-AI house pattern, uniform = wallpaper). Grain overlay earns nothing. Accumulation of 5 decorative systems (grain, numerals, aurora, spine, chapter tint) contradicts the stated thesis.

Detector: 1 advisory finding, numbered-section-markers (dist/index.html, sequence snippet "08, 09, 10, 12" = content numbers, partial false positive; the real CSS-counter instance is invisible to the detector but the LLM caught it independently; A+B converge on this pattern).

Browser overlay: skipped (no in-page detect.js injection run); fallback evidence = Playwright motion + static captures reviewed in-session.

## Priority Issues

- [P1] Mobile has no persistent primary CTA: .nav-cta hidden <1024px on a ~35-screen page. Fix: compact CTA in mobile bar or sticky bottom CTA after hero.
- [P1] Accent underline invisible: wheat #FFF6E9 bar over canvas #F4F5F3; the 880ms draw animates something the eye can't see. Fix: deepen/thicken the bar.
- [P1] Pinned trail: closing line visible from station 1 (leaked punchline), half-empty frames, no scroll cue at pin start. Fix: fold close into the timeline's final beat + cue.
- [P2] Unify pill controls (roving tabindex + arrows) by extracting the Roles.astro implementation.
- [P2] og:image missing while twitter:card=summary_large_image declared; all shares render imageless.
- [P2] Hero: (a) has-media 26% padding applied post-HEAD = visible layout jump; (b) "open investigation" is action-colored dead <span>.
- [P3] Trim decorative systems: drop grain, keep ghost numerals on 2-3 chapter-defining sections only.

## Emil (motion) findings

- FAQ open/close symmetric 320ms -> close 200ms (exit faster than enter).
- chip-pop overshoot 1.06 = micro-bounce against a "quiet financial" voice -> direct 0.7->1.
- Word stagger 110ms slightly above 30-80 guidance; acceptable for a 3-5 word hero.
- Micro-interaction layer already textbook: scale(0.97) active, cubic-bezier(0.23,1,0.32,1), explicit transition properties, hover gated behind (hover:hover).

## Persona Red Flags

Jordan: "How it works" -> lands in scroll-jack with no cue (reads as frozen page); dead "open investigation" span; premium card CTA says "open free account".
Riley: arrow keys dead on 2 of 3 pill groups; mailto silent fail x2; hero media layout jump.
Casey: no CTA in sticky bar on mobile; demo at ~8k px; ROI = 7-field form on phone; spine absent on mobile (no progress affordance on the longest variant).

## Minor Observations

- Spine sits inline-start = right edge in RTL, same side as scrollbar; consider inline-end.
- Section numbers 01-08 map to nothing navigable.
- Leftover empty class="" in Proof.astro:12, Faq.astro:12.
- .pricing-notes concatenates 3 unrelated notes.
- role="img" flattens the hero invoice replica for screen readers.

## Questions to Consider

1. If all five decorative systems vanished, which would you re-add first, and can you defend the rest?
2. INV-2311 stars in five sections; why is that continuity never surfaced to the reader?
3. What would the page be if the hero's blocked invoice WERE the demo?
