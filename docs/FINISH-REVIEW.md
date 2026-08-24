# Finish review — verdict and fix log (2026-08-24)

Reviewer: fresh-context agent (opus, read-only), spawned per the impeccable finish
protocol with the direction contract, all screenshots, and the craft-floor reference.
Note: the harness has no shipped `impeccable-finish-reviewer` agent type; a fresh
general-purpose agent ran the same packet (disclosed per protocol).

## Verdict summary

- CONTRACT: THESIS kept · OWN-WORLD kept (one palette note) · STORY kept ·
  FIRST VIEWPORT partly broken (2 items, both fixed below).
- PERSUADE: passes the five-second test in all three locales.
- CLAIMS: clean. No invented savings, no SLA/uptime, no logos; ROI arithmetic
  verified correct in all 15 cells; the single percentage (19%) is derived.
- Initial disposition: **fix-then-ship** (14 material findings).
- After fixes: reviewer upgraded to **ship-after-visual-confirmation**; the four
  requested confirmation crops were captured and passed to the reviewer.

## Findings → fixes (all 14 applied)

| # | Finding | Fix |
|---|---|---|
| 1 | Hero video frame ended mid-card | `.media-frame` `inset: 0`; visual padding 26% top |
| 2 | 3 of 4 pricing cards had no CTA | CTA on every card (primary/ghost/wheat), bottom-aligned |
| 3 | Hardcoded ₪ literals leaked to en/fr | per-locale `fixtures.heroLine` + `rolesAmount` |
| 4 | WhatsApp names Hebrew-only | `WHATSAPp name: Record<Locale,string>` (Moshe/Nir) |
| 5 | FR pricing baselines misaligned | `.tagline min-block-size: 2.6em` |
| 6 | "vaut-il" broke mid-word | U+2011 non-breaking hyphen in fr dict |
| 7 | Demo-data badge collapsed to a circle | `.gdemo-badge` centered/flex-none + neutral chip (not a status color) |
| 8 | Hardcoded ← + bare ✓/×/✗ glyphs | labelled SVG check/cross set; arrow removed |
| 9 | Money row labelled as a count | "Value of gaps caught per month" in all locales |
| 10 | FR decimal separators inconsistent | factor rendered through `Intl.NumberFormat` |
| 11 | Hero numbers not reconcilable | qty line "160 crates ordered" added to the replica |
| 12 | 3px colored quote border | reduced to 1px |
| 13 | Identical entrance on all 12 sections | `.reveal` kept only on the trail's close line |
| 14 | `badge-idle` 4.34:1 | `--idle-fg #55637a` (measured 5.55:1) |

Post-batch regressions caught and fixed in the same round: pricing 4-col overflow
at 1024 with French CTA labels (4-col now >=1200px), and `.plan-hi .per` contrast
(2.01:1 → 82% on-action mix, axe clean).

## On the record (settled decisions, not defects)

- Nav is a full-width sticky bar, not the contracted floating pill.
- `--font-display` aliases `--font-sans` (Heebo only) — owner decision 24.08,
  serif display rejected as too literary.
- Status ramps (`info`/`idle` etc.) derive from Tailwind stock hues by product law
  (DESIGN.md: status families come from stock ramps); not treated as a palette leak.

## Reviewer credits

- Money-trail pinned section called "genuinely good … carries information rather
  than decorating", with graceful reduced-motion degradation.
- Hero video loading called "a model of restraint" (desktop-gated, saveData-aware,
  HEAD-gated poster, reduced-motion poster-only, zero bytes until window load).
- Copy called "the strongest layer of the build".
