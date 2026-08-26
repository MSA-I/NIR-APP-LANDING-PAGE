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
| G14a | Grammar holds: one scrub chapter, one `<h1>`, four chapters | **MET** | `G14 PASS` — 4 chapters, 1 act, 1 scrub clip, 1 `<h1>` |
| G14b | Tabs: five steps, five distinct screens, exactly one panel open | **MET** | `G14 PASS` — each tab opens its own panel, 5 distinct image sources, `aria-selected` follows |
| G14c | The apparatus is complete in both directions | **MET** | `G14 PASS` — 10 cited figures against 8 sources, no orphan figure, no uncited source |
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
