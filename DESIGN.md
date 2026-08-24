# InPlace Landing — design system (recorded from the built site)

Documented at finish, from ground truth in `src/styles/*.css` and the shipped
components. The product app's DESIGN.md governs the product; this file governs
the marketing site only. Single source of values: `src/styles/tokens.css`.

## World

"Quiet financial control room." Light paper page; Onyx is reserved for exactly
three assertions: the money-trail narrative, the guided-demo summary strip, and
the final CTA (plus the footer). Oceanic is action and brand only. Wheat marks
warm proof surfaces (proof strip, security). Status colors carry business
meaning exclusively; a disclosure chip (e.g. "demo data") is neutral, never a
status color. The real product UI, rebuilt as `pui` replicas over deterministic
fixtures, is the primary visual material; generated media is atmosphere behind
it, never a substitute for it.

## Tokens

- Structural: `--onyx #0a171d` · `--oceanic #003f47` · `--wheat #fff6e9` ·
  `--canvas #f4f5f3`; bright-on-dark variants `--oceanic-bright`, `--alert-bright`,
  `--onyx-lift`.
- Ink: `--ink / -mid / -muted` on paper; `--ink-inverse*` on Onyx. `--ink-muted`
  and `--idle-fg` are contrast-pinned (>=4.5:1 on their soft surfaces; axe-verified).
- Status: done/await/alert/info/idle, `-fg` + `-soft` pairs, stock-ramp derived
  (product law). Solid = fill, fg = text.
- Shadows: Oceanic-tinted, offset + soft blur (`--shadow-card/-card-hover/-panel`).
  No black halos, no borders on cards.
- Radii: cards 16 · controls 10 · pills full. One system, no exceptions.
- Motion: `--ease-out cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out`, micro 180ms,
  section 520ms.

## Type

Two voices (owner decision 24.08 r2, after a fintech reference pass across
refero/awwwards/land-book — the Brex pattern: a display face used selectively
for hero-level statements, single weight, tight leading):

- **Display: Suez One 400** (`--font-display`), h1/h2 only. Hebrew-native slab,
  flat tracking (0), leading 1.12/1.16. Self-hosted woff2 hebrew+latin subsets
  (6.7KB + 15KB), per-locale preload. The earlier literary serif (Frank Ruhl)
  stays rejected; Suez One is headline authority, not literature.
- **Body/UI: Heebo variable** (400/500/600), unchanged. Fallback Noto Sans
  Hebrew (product parity) → Arial → system-ui.

Hero accent: the promise's hinge word (`hero.h1Accent` — לפני/before/avant)
renders as `.accent-word`: Oceanic ink over a Wheat underline bar. One accent
does the talking; `.on-onyx` swaps to `--oceanic-bright`, no bar.

Editorial eyebrows: every `.section-head`/`.trail-head` carries an auto-numbered
kicker (CSS counter, 01…08, tracked-out 13px) — no copy to translate, empty
alt keeps it off screen readers.

Numbers always `.num` (tabular). Money is locale-formatted from fixtures/Intl:
he `1,240 ₪` (trailing ₪), en `₪1,240`, fr `1 240 ₪` with comma decimals.
The ₪ glyph lives in the hebrew subset, which therefore loads on all locales.

## Layout and RTL

Logical properties only (enforced by `scripts/check-rtl.mjs`). `--page-max
1200px`, section padding `clamp(64px, 9vw, 120px)`. Pricing runs 1/2/4 columns
at base/768/1200 (4-up needs >=1200 for French CTA labels). Every wide table
scrolls inside its own container. Breakpoints verified overflow-free at
390/768/1024/1440 in all three locales.

## Motion rules

Owner decision 24.08 r3 ("flat, no animations" — wow pass). Three layers, all
gone under reduced motion (full static page, trail as list, poster-only video):

1. **Hero load choreography** (CSS, once per view): headline → sub → CTAs →
   product panel blur-up rise (760-860ms), chain chips pop staggered
   (780/900/1020ms), accent underline draws itself (680ms delay), delta badge
   pulses once.
2. **Auto-reveal entrances**: Base.astro tags section heads, cards, list rows
   and island wrappers `.reveal` and staggers siblings via `--ri` (70ms steps,
   capped 8); one IntersectionObserver adds `.in` once. Blur-up rise 640ms.
   Root cause fixed here: the reveal system existed but was applied to exactly
   one element site-wide.
3. **The pinned money trail** (GSAP, desktop >=1024): unchanged, still the only
   pinned/scrubbed moment.

Ambient (also no-preference only): hero glow field drifts 26s alternate; dark
sections (`.aurora`) get a luminous seam + drifting radial wash 22s. Nav
condenses on scroll (`.scrolled`, JS toggle). Cards lift −4px on hover. FAQ
opens animate via `interpolate-size` (Chromium, progressive).

Depth statics: film grain overlay (SVG turbulence, opacity .05, fixed, on top,
pointer-events none) and giant ghost chapter numerals (Suez One watermark,
`::after` of each head, 7%/5% tint, alt-empty).

Tier 2 (owner decision 24.08 r4), all motion-allowed only:

- **Word-by-word headline**: hero h1 renders as word spans (build-time split,
  110ms steps); the accent word additionally draws its underline at 880ms.
- **Scroll spine** (desktop): fixed hairline at the page edge fills with scroll
  progress, glowing chip at the tip — the money trail follows the reader.
  rAF-throttled JS sets `--sp`; aria-hidden.
- **Scroll-driven scenes**: `.leaks .card`, `.asst-card`, `.roles-widget`,
  `.gdemo`, `.roi-results` are scrubbed by CSS `view()` (deep rise, alternating
  ±1.4deg tilt settling to 0, `entry 4%→78%`) where supported; Base.astro keeps
  them in auto-reveal elsewhere. Still no pinning beyond the money trail.
- **Chapter color travel**: sections carry `data-chapter` (warm/cool/base); an
  IntersectionObserver on the viewport's middle band morphs `body`
  background-color (wheat 44% / oceanic 5% washes, 800ms). Roles/Pricing/Story/
  Faq backgrounds are transparent so they ride the tint; Proof/Security (wheat)
  and the dark blocks keep their own ground.

## Media

Ambient hero loop behind the invoice replica: desktop-only, saveData-aware,
HEAD-gated on the poster, sources on `data-src` until `window.load`, muted loop
`playsinline`, poster-first for LCP. Assets and their generation audit live in
`docs/ASSETS.md`; regenerate through the still-first pipeline (image anchor,
then image-to-video with start+end anchors).

## Analytics

Provider-agnostic layer (`src/lib/analytics.ts`, zero deps): every event lands
in `window.dataLayer` and forwards to `plausible()`/`gtag()` when present.
Events (research doc §16.3): `demo_started`, `demo_completed` (>=2 scenarios
seen), `demo_scenario_view`, `assistant_example_run`, `assistant_source_opened`,
`roi_completed` (first assumption edit), `pilot_requested`, `cta_demo_click`,
`cta_how_click`, `web_vitals` (hand-rolled LCP/CLS/INP observers, reported once
on hide). Static CTAs use `data-track`/`data-track-place` attributes with one
delegated listener in Base.astro; islands import `track`/`trackOnce`.
Verified end-to-end by `node tests/e2e.mjs analytics`.

## Guardrails (runnable)

`npm run verify` = tokens single-source (no raw hex outside tokens.css),
claims policy (no savings %, no SLA, no published user/storage quotas, no
em-dash in prose), section inventory, SEO/i18n contracts, JS budget <=170KB gz.
`node tests/e2e.mjs all` = demo/assistant/roi/lang flows, overflow,
reduced-motion, axe (serious+critical = fail), screenshots. Axe stays in the
battery: cascade-resolved contrast beats declared-token math (proven once).
