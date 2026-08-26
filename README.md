# InPlace — landing page

Hebrew-first, RTL landing page for **InPlace**, the procurement-to-payment
control system in [MSA-I/NIR-APP](https://github.com/MSA-I/NIR-APP).

Static HTML built by one Node script. No framework, no database, no
credentials, nothing that can reach production. The only runtime dependency is
`playwright-core`, and only for the verification harness.

This repository replaces the earlier Astro marketing site. That site is
preserved on the `archive/astro-site` branch; nothing was deleted.

---

## What it is

The page is a **printed feature**: a title page, five chapters and a colophon.
Chapters are the unit, they hard-cut between grounds, and only one of them
carries motion.

| | Chapter | Ground | What it does |
|---|---|---|---|
| — | שער | Onyx | What this is, both CTAs, and an index of the five chapters |
| 01 | מהערימה למרכז הבקרה | Onyx | A 24.7s scrubbed film. Four copy blocks travel beside it |
| 02 | מה המערכת עושה | Wheat, then Onyx | Five stations, five real product screens, then the control centre |
| 03 | למה דווקא זה | Onyx | What InPlace does, against what it refuses to be |
| 04 | מסלולים | Onyx | Five plans, one published usage metric, the launch prices |
| 05 | שאלות | Wheat | Seven answers, as native `<details>` |
| 06 | להתחיל | Onyx | The ask, and the source of every figure on the page |

About 14 viewport-heights. The design intent, the interview it came from and
the feeling curve are in [BRIEF.md](BRIEF.md); the acceptance ledger with its
evidence is [GATES.md](GATES.md); the build's registry row is
[FINGERPRINTS.md](FINGERPRINTS.md).

### The film

Chapter 01 is the one place the scroll engine is used. The clip is four legs of
a previous build's world, stream-copied into one 593-frame file: a stack of
supplier documents comes down, two numbers for one supplier contradict each
other, the camera lifts, and the cut lands halfway through the reveal of the
real control centre. From that cut on, everything on the page is a screenshot
of the running product.

### The signature move: the apparatus

The page cites itself, the way a printed feature does. Every real figure in the
running copy carries a superscript source number; passing one lights it, lights
its row in the colophon, and names its source at the foot of the page: which
screen, which supplier, which date, which status.

The full list is real markup in the colophon, so a reader with no JavaScript or
a screen reader gets the whole apparatus and loses only the reading head. The
gate asserts it in both directions: no figure without a source, no source
nothing cites.

---

## Run it

```bash
npm install
```

```bash
npm run build
```

```bash
npm run serve
```

The page is then at <http://localhost:4500>. `npm run build` writes `dist/`,
which is not committed.

## Verify it

```bash
node scripts/gates/all.mjs
```

Four gates, about 20 seconds, and it exits non-zero on any failure.

| Gate | What it measures |
|---|---|
| G4 | RTL is carried by logical properties only. Runs a control fixture first to prove the scanner fires |
| G6 | No horizontal overflow, at eight scroll positions across four widths |
| G7 | Text contrast on the composited render, both grounds. Plants an unreadable line and confirms it is caught |
| G14 | This build's own behaviour: the chapters, the chain, the film's playhead, the folio, the apparatus, the FAQ, the footer, the prices, the keyboard path and reduced motion |

One gate by id:

```bash
node scripts/gates/all.mjs g7
```

Screenshots at chosen scroll fractions, desktop or phone:

```bash
node scripts/peek.mjs --url http://localhost:4500 --out lab/peek --at 0,0.25,0.5,0.75,1
```

**A green run is not the whole check.** Look at the frames. Every gate measures
what somebody thought to ask; four real defects in this build were invisible to
all of them and obvious in the first screenshot, and they are listed in
[GATES.md](GATES.md).

---

## Files

| Path | What it is |
|---|---|
| `src/page.mjs` | The page, as one function of a dictionary |
| `i18n/he.js` | All copy and every figure, with the source of each in a comment |
| `site.css` | The page's own layer. Logical properties only, enforced by G4 |
| `surface.js` | The folio, the chain, and the apparatus. Three IntersectionObservers, no scroll loop |
| `engine/` | scrollcraft, copied verbatim. Never edited per-project |
| `assets/` | The film, its poster, the product screens, the Hebrew subset of Noto Sans |
| `scripts/build.mjs` | The build. One locale in, one static file out |
| `scripts/gates/` | The acceptance ledger, one file per gate, plus control fixtures |
| `lab/app-reference/` | Screenshots of the running product. Every figure on the page is read off these |
| `archive/` | Previous builds' briefs, locales and gates, kept rather than deleted |

---

## Before you edit

**No invented figures.** Every number on the page is read off a capture in
`lab/app-reference/` or a migration in the product repo, and every one of them
is cited in the apparatus. A figure with no source does not ship; G14 fails on
one. If a number changes, change its source line in `i18n/he.js` too, or the
apparatus lies.

**The prices come from the product's catalogue, not from taste.** They are the
`launch-il` rows of `0184_launch_plan_and_price_catalogue.sql`. G14 asserts that
the set of amounts on the page equals that catalogue exactly, so a hand-edited
price fails the build rather than shipping.

**No em-dash in anything a visitor can see**, including image `alt` text.
Hebrew takes a colon, a comma, a period or parentheses everywhere the dash was
doing the work.

**Status colour carries business meaning, never decoration.** done / await /
alert / info / idle, inherited from the product. A metric with no data renders
a rule, never a zero, because zero is a claim about reality.

**Nothing inside a product screenshot is recoloured.** The screens are the real
captures, cropped by CSS only.

---

## Two things that must be true before this goes live

1. **The quota migration has to deploy first.** The plans table publishes
   20 / 40 / 150 / 375 documents per month, which are decision #266's values.
   That decision is merged but not deployed, and production still stands on
   migration `0170` with 25 / 50 / 200 / 500. Publishing a quota the running
   system does not enforce is the one thing this page must not do.

2. **Two footer destinations need confirming**: `inplace.digital/terms` and
   `inplace.digital/privacy`. Both come from the product's own route list in
   `artifacts/domain-cutover/`, which is a snapshot of the pre-cutover domain.
   They are together in `i18n/he.js` under `footer.cols`.

Prices are published here by owner instruction of 26.08.2026, which reverses
decision #267 for this page only. #267 still governs the product's own
`Pricing.tsx` and the `fix/no-public-prices-20260825` branch in NIR-APP.
