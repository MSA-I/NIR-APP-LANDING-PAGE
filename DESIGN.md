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

Chapter numbering (narrowed 24.08 after the impeccable critique): the numeral
kicker on every head was AI grammar, so it is gone. A CSS counter now runs
across exactly the three sections that ARE a sequence — money leaks (the
problem), the money trail (the mechanism), the guided demo (the invitation) —
rendered only as the giant Suez One ghost watermark, 01/02/03. No copy to
translate; `content: counter() / ''` keeps it out of the accessibility tree.

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

Depth statics: giant ghost chapter numerals (Suez One watermark, 7%/5% tint,
alt-empty) on the three chapter sections. The film-grain overlay was removed
in the 24.08 critique round: it existed to mask flatness rather than to say
anything, which is the tell trying to hide the tell.

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

## Critique round (24.08, impeccable 29/40 + emil motion review)

Fixed: mobile lost its primary CTA (compact `ctaShort` pill now lives in the
sticky bar at every width); the accent underline was wheat-on-canvas and
therefore invisible (`--wheat-deep #f5d9a0`, a decorative token, never a status
color); the pinned trail leaked its punchline from station 1 (the closing line
is now the timeline's final beat) and offered no cue that scrolling advances it;
three look-alike pill groups behaved three different ways (`src/lib/radiogroup.ts`
gives all of them APG roving tabindex plus RTL-aware arrows, asserted in the
a11y gate); `og:image` was missing while `twitter:card` promised a large image;
the hero panel jumped when `.has-media` resolved (space is reserved statically
now); an action-colored label in the replica invited a dead click.

Also surfaced: INV-2311 and its 1,240 gap run through the hero, the money trail,
the assistant, the roles switch and the guided demo, but the page never said so.
The roles sub now names the thread ("this is the same invoice you met at the
top, INV-2311"), which is where it pays off: the reader realizes the page has
been following one real case, not showing five samples.

Motion, per the emil pass: FAQ close is faster than open (200/320ms, the system
responds faster than it deliberates), `chip-pop` lost its 1.06 overshoot (bounce
reads playful; this page is about money controls) and starts at 0.86 rather than
0, and the spine moved to the reading-start edge so it no longer sits under the
RTL scrollbar.

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

## Critique round 2 (24.08, scored 27/40) and what it changed

The second review scored lower than the first (29 -> 27) because it looked
harder, not because the page regressed: it found two P0s the first pass missed.
Both are fixed. Pricing now speaks per plan (four distinct CTAs, `?plan=` on
every href, the free-first sentence inside the card it qualifies) instead of
saying "open a free account" on a 449-shekel tier. The hero replica lost its
`role="img"` wrapper, which had flattened the page's entire opening proof to a
single label for screen readers while axe passed it as valid.

The guided demo became guided (step counter, progress rail, a primary next
control, the two pill groups boxed apart). The placeholder testimonial no longer
ships: a quote with a footnote calling it illustrative costs more credibility
than an absent section, so it is gated behind `HAS_REAL_CUSTOMER_QUOTE`.

The lesson worth keeping is process, not CSS. Three systems this document
defended at length were, in the reviewer's words, "imperceptible, broken, and
positioned against its own stated rationale": the chapter tint was ~2-3% apart
(below perception), chapter 03 never painted (a `z-index:-1` numeral behind its
own section background), and the spine sat on the scrollbar edge. All three
passed source review. `npm run measure` now asserts eight render truths in a
real browser, and it caught two more live defects the moment it was written.
A gate about something visible is met by a measurement, not by code that looks
right.

## Guardrails (runnable)

`npm run measure` = eight render truths sampled in a real browser: chapter tint
channel delta, every chapter numeral actually painting (and its section opening
a stacking context), the spine not sharing an edge with the scrollbar in either
direction, hero choreography settling under 1s, Suez One confined to Hebrew, one
selected-state color across all four pill groups, a live as_of date, and the
hero replica's facts reaching the accessibility tree.

`npm run verify` = tokens single-source (no raw hex outside tokens.css),
claims policy (no savings %, no SLA, no published user/storage quotas, no
em-dash in prose), section inventory, SEO/i18n contracts, JS budget <=170KB gz.
`node tests/e2e.mjs all` = demo/assistant/roi/lang flows, overflow,
reduced-motion, axe (serious+critical = fail), screenshots. Axe stays in the
battery: cascade-resolved contrast beats declared-token math (proven once).
