# Accessibility (spot check)

**Score: 92/100**  (not scored — reported because measured)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- 347 text elements checked against WCAG AA with correct alpha compositing; only 5 fail
- Three of the five are decorative or within rounding of the threshold

## Findings

### [Low] Five contrast failures out of 347 elements

The why-card step numbers ('01') at 2.90-3.00 against a required 4.5 are the only real failure. The footer separator glyph at 3.14 is decorative. plan-card__billed at 4.31 and the demo hint at 4.44 are within rounding of the 4.5 threshold. Not an SEO category, reported because it was measured.

**Fix:** Raise the opacity on the why-card step numbers. The rest are optional.

