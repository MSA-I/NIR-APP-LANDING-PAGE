# GATES — mobile scroll length

Branch: `impeccable/critique-landing`
Origin: users reported the landing page is too long and takes too long to reach the product.
Owner decisions recorded 2026-09-01. Nothing in this file is implemented yet.

## Constraints (owner-set, binding)

1. **Phone only.** Every change is scoped to `@media (max-width: 767px)`. Desktop pixels must not move.
2. **Hebrew copy is locked.** `src/content/he.ts` is frozen by the G2 content-parity gate. No word is added, removed, or reworded. Any change that needs new visible text stops and asks first.
3. **The plans section is not touched.** Not its cards, not its spacing, not its order.
4. **Means allowed:** tighten spacing and sizes; shorten the film's scroll distance; hide the hero chapter index on phone; add one product screenshot to the hero.
5. **Means excluded:** collapsing content behind taps (except where it already exists), moving sections to separate pages, cutting chapters.

## Baseline — measured, not estimated

Viewport 375×812, Vite dev server, Hebrew edition.

| Region | Top | Height | Screens |
|---|---|---|---|
| Hero (`#top`) | 0 | 1,756 | 2.2 |
| — hero plate | 67 | 1,059 | |
| — chapter index (`.title-index`) | 1,126 | 630 | |
| Logo cloud | 1,756 | 308 | |
| Chapter 01 — film (`[data-film]`) | 2,064 | 1,977 | 2.4 |
| Chapter 02 — what + board | 4,041 | 2,375 | |
| Chapter 03 — why (`#why`) | 6,416 | 1,702 | |
| Chapter 04 — plans (`#plans`) | 8,119 | 3,977 | 4.9 |
| Voices (`#voices`) | 12,095 | 817 | |
| Chapter 05 — faq (`#faq`) | 12,912 | 1,282 | |
| Contact (`#contact`) | 14,194 | 1,145 | |
| Chapter 06 — close | 15,340 | 579 | |
| Footer | 15,918 | 590 | |
| **Total** | | **16,508** | **20.3** |

First pixel of the actual product: `screen-office-orders-800.avif` at y=**4,714** = screen **5.8**.

### Film anatomy (the scroll-distance lever)

1,977 = 96 section padding + 350 sticky figure + 20 margin + 1,104 copy blocks + **406 tail padding**.

- `.film-block` — 4 blocks, each box 276px (`min-block-size: 34svh`), real content 153/153/153/180px, padding 40px. **Measured slack: 83+83+83+56 = 305px.**
- `.film-copy` — `padding-block-end: 406px` (`50svh`), pure empty space whose job is to keep the figure pinned until the clip's last frame.
- Video duration 34.83s; progress mapping is `useScroll({offset: ['start start','end end']})` over the section.
- Reading window under the pinned figure: **358px**. The tallest block is 220px of content+padding, so it fits with room.

### Plans anatomy (untouched, recorded for the record)

3,977 = 5 cards (493 + 586 + 673 + 730 + 781 = 3,263) + heading/lede + 120 padding.
`.plans-compare` is `display: none` on phone — the comparison table does not exist here.

## What this plan can and cannot deliver

With plans excluded, the single largest block on the phone (3,263px, 20% of the page) is off the table. The honest ceiling:

| Move | Mechanism | Saving | Confidence |
|---|---|---|---|
| Hide hero chapter index on phone | `.title-index { display: none }` ≤767 | −630 | **measured** |
| Film copy blocks 34svh → 27svh | `.film-block { min-block-size }` | −227 | **measured slack** |
| Film tail padding 406 → ~200 | `.film-copy { padding-block-end }` | −200 | empirical, gated |
| Section padding across 8 sections | `src/styles.css` ≤767 blocks | −350 | estimate |
| Inner spacing: hero plate, why, faq, contact, voices | `src/styles.css` ≤767 | −300 | estimate |
| Plans | untouched | 0 | decided |
| **Subtotal saved** | | **−1,707** | |
| Product screenshot into hero | `TitlePage.tsx` | **+300** | estimate |
| **Net** | | **≈ −1,400** | |

**Projected: 16,508 → ~15,100px ≈ 18.6 screens (−8%).**
**Projected: first product pixel 5.8 screens → ~1 screen.**

The length reduction is modest and this is a direct consequence of constraint 3. The time-to-product improvement is large and is the change the users actually asked for. If the length number matters more than it currently appears to, the only remaining lever of size is the plans section.

## Gates

Each gate is measured on the dev server at 375×812, Hebrew edition, before the work is called done. A gate with no recorded measurement is not passed.

### G1 — Product visible on the first screen
`document.querySelector('#top img[src*="screen-"]')` exists, and its top edge is **< 812px**.
Records: y-offset of the image, and which asset was used.

### G2 — Total document height
`document.documentElement.scrollHeight` at 375×812 is **≤ 15,300px**.
Records: before 16,508, after N, delta, percent.

### G3 — First product pixel outside the hero still moves up
The first `screen-*` image below the hero starts at **< 3,600px** (was 4,714).

### G4 — The film's last beat still plays before the figure releases
Scroll to the point where `.film-fig--stick` stops being pinned (its `getBoundingClientRect().top` starts moving up past its sticky offset). At that scroll position, `video.currentTime` must be **≥ 34.3s of 34.83s**.
This gate governs G-film tuning. If it fails, the tail padding goes back up until it passes.

### G5 — A film block's heading and its paragraph are visible together
At each of the 4 beats, the block's full box (≤ 358px) fits under the pinned figure with no clipping.
Records: measured block height per beat, and the window height.

### G6 — Desktop is unchanged
`document.documentElement.scrollHeight` at 1440×900 is **16,247 ± 10px** — the measured baseline. Any drift means a change leaked out of the phone media query.

### G7 — Nothing regressed that the critique already passed
At 375×812: 0 interactive elements under 44×44, `scrollWidth − clientWidth = 0`, one `h1`, no skipped heading levels, 0 console errors.

### G8 — Copy parity
`node scripts/gates/g2-content-parity.mjs` passes. `git diff src/content/he.ts` is empty.

## Work items, in order

1. **Hero product screenshot** — `src/components/TitlePage.tsx`. Reuse an existing asset (`screen-office-orders-800.avif` or `screen-owner-dashboard.webp`); no new image is generated. Placed inside the hero plate, below the actions, above the lede. Needs alt text → **new visible text, stop and ask**. Gate: G1.
2. **Hide the chapter index on phone** — `src/styles.css`, `@media (max-width: 767px)`. The six links stay reachable from the header nav and the drawer. Gate: G2.
3. **Film copy blocks** — `.film-block { min-block-size: 27svh }` ≤767. Gates: G5, G4.
4. **Film tail padding** — `.film-copy { padding-block-end }` stepped down from 406px and re-measured against G4 at each step. Stop at the last value that passes with ≥ 60px of margin. Gates: G4, G2.
5. **Section and inner spacing** — one pass across the ≤767 blocks in `src/styles.css`, excluding `#plans`. Gates: G2, G5, G6.
6. **Final measurement** — re-run every gate, record before/after, report.

## Risks

- **R1.** The film's two tuned values (34svh, 50svh) were set deliberately to fix two real bugs documented in `src/styles.css`. G4 and G5 exist to catch a regression, but the tuning is empirical and may yield less than the 427px budgeted.
- **R2.** The hero screenshot needs alt text, which is new visible text against a locked-copy constraint. Blocked on owner approval of the wording.
- **R3.** The estimated 650px from spacing is the least certain line in the budget. It hardens only after the first pass, and G2's threshold may need revisiting once it is real.
- **R4.** Removing the chapter index on phone removes a navigation affordance. The header nav carries 4 of its 6 links and the drawer carries all 6, so the loss is duplication — but it is a change to how the page presents itself on its first screen.

---

---

## Results — measured 2026-09-01, Vite dev, Hebrew edition

| Gate | Threshold | Measured | |
|---|---|---|---|
| G1 product on first screen | image top < 812 | **WITHDRAWN** — see below | n/a |
| G2 document height | <= 15,300 | **15,290** (was 16,508) | PASS |
| G3 first shot | < 3,600 | 3,462, screen 4.3 (was 4,714, screen 5.8) | PASS |
| G4 film's last beat before release | end <= release | margin **352px** | PASS |
| G5 beat fits under the film | block <= window | 219/219/219/220, window 404 | PASS |
| G6 desktop unchanged | 16,247 +/- 10 | **16,247, delta 0** | PASS |
| G7 no regression | 0 small targets, 1 h1, no overflow, 0 errors | 0 / 1 / 0 / 0 | PASS |
| G8 copy parity | gate passes, he.ts clean | G2 PASS, diff empty | PASS |

Phone: **20.3 screens -> 18.8**. Hero: 1,756 -> **885**.
First product pixel: screen 5.8 -> **screen 4.3**.

### G1 withdrawn

The hero proof shot was built, measured passing (top 524, bottom 744, whole
above the fold) and then removed on the owner's read of it: at 329px wide the
2000px capture is an unreadable smear, so it moved the product earlier without
moving any information earlier. `accessibility.zoomScreen` in extra.ts exists
for exactly this reason and its note said so before the shot was tried —
chapter 02's screens are 2000px and a phone draws them at 344.

Getting the product onto screen 1 needs a phone-sized render, which does not
exist in `public/assets`. It is not a CSS problem.

The hero floor removal that the shot motivated was kept on its own merit: the
type measures 669px and was being held inside 1,057.

### Delivered

hero index -630, hero floor -471, film blocks -228, film tail -203,
section rhythm -264. Plans untouched by decision: 3,977px, 26% of the phone
page, and the whole gap between 18.8 screens and 14.

`npx tsc --noEmit` clean.

A desktop reading of 16,476 (+229) recorded mid-run came from a stale Vite
process still serving port 4501 from an earlier session, not from these
changes. A fresh server returns 16,247.
