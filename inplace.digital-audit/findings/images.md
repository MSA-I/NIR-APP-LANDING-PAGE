# Images

**Score: 88/100**  (weight 5%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- 30 images on the home page with zero missing alt, zero missing width or height, which is why CLS is 0
- AVIF with WebP fallback via picture elements, three widths each at 800, 1440 and 2000, with correct sizes attributes
- Alt text is descriptive and real rather than filename mush
- 24 images declared in the sitemap under image:image

## Findings

### [Medium] All nine English pages serve the Hebrew share card

Every page on the site, both languages, points og:image at assets/og-cover.jpg, whose visible text is Hebrew. An English reader sharing /en/procurement-software/ on LinkedIn gets an English title over a Hebrew picture. There is a second mismatch inside it: og:image:alt on the English pages describes the image in English while its visible text is Hebrew. assets/og-cover-en.jpg returns 404.

**Fix:** Render a second card with scripts/build-og.mjs and scripts/og-template.html, which already exist, and point the nine /en/ pages at it. Fix og:image:alt at the same time.

### [Low] Sub-pages share the home page's card

All 18 pages use the same og:image. Acceptable, and a per-page card is a nice-to-have rather than a fix.

**Fix:** Optional. Consider per-page cards for the five commercial pages once the English card exists.

