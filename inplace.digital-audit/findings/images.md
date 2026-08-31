# Images

**Score: 96/100**  (weight 5%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- 30 images on the home page with zero missing alt, zero missing width or height, which is why CLS is 0
- AVIF with WebP fallback via picture elements, three widths each at 800, 1440 and 2000, with correct sizes attributes
- Alt text is descriptive and real rather than filename mush
- 24 images declared in the sitemap under image:image
- Each edition has its own share card, rendered from one template so the two cannot drift, and the build fails if a headline falls back to Arial or does not fit the plate

## Findings

### [Resolved] All nine English pages served the Hebrew share card — FIXED

Every page on the site, both languages, points og:image at assets/og-cover.jpg, whose visible text is Hebrew. An English reader sharing /en/procurement-software/ on LinkedIn gets an English title over a Hebrew picture. There is a second mismatch inside it: og:image:alt on the English pages describes the image in English while its visible text is Hebrew. assets/og-cover-en.jpg returns 404. RESOLVED 31.08.2026: scripts/og-template.html now takes five substitutions (language, direction, both faces, the headline split at its tint, and the chain) and scripts/build-og.mjs renders it once per edition. The English card reads left to right, is set in the Latin cuts of the same two faces, and turns the chain arrows round. An `ogImage` field joined the per-locale table in src/lib/page-html.ts beside the `ogAlt` that already described each card correctly, and en/index.html switched its two references. Verified live: /en/ pages serve og-cover-en.jpg and Hebrew pages serve og-cover.jpg. A second build check now fails the build if a headline does not fit the plate, and the launch uses the Chrome the gates use rather than a Playwright download that is not on every machine.

**Fix:** Done.

### [Low] Sub-pages share the home page's card

All 18 pages use the same og:image. Acceptable, and a per-page card is a nice-to-have rather than a fix.

**Fix:** Optional. Consider per-page cards for the five commercial pages once the English card exists.

