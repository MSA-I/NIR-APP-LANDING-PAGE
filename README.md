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

The page is a **printed feature**: a title page and six chapters.
Chapters are the unit, they hard-cut between grounds, and only one of them
carries motion.

| | Chapter | Ground | What it does |
|---|---|---|---|
| — | שער | Onyx | What this is, the ask, and an index of the six chapters |
| 01 | מהערימה למרכז הבקרה | Onyx | A 27.6s scrubbed film, the one place the scroll engine is used. Four copy blocks travel beside it |
| 02 | מה המערכת עושה | Wheat, then Onyx | Five stations, five real product screens, then the control centre |
| 03 | למה דווקא זה | Onyx | What InPlace does, against what it refuses to be |
| 04 | מסלולים | Onyx | Five plans, one published usage metric, the launch prices |
| 05 | שאלות | Wheat | Seven answers, as native `<details>` |
| 06 | להתחיל | Onyx | The one ask |

About 13.7 viewport-heights. The design intent, the interview it came from and
the feeling curve are in [BRIEF.md](BRIEF.md); the acceptance ledger with its
evidence is [GATES.md](GATES.md); the build's registry row is
[FINGERPRINTS.md](FINGERPRINTS.md).

### The film, and the handover

A stack of supplier documents comes down, two numbers for one supplier
contradict each other, and the camera lifts off the floor toward something lit
in the dark. Then the film does not cut, it hands over: it dissolves out of the
world and into the product's own control centre, filling the frame head-on, and from that
second on every pixel on the page is a screenshot of the running system. The
last frame of `assets/film.mp4` and the first product screen the reader meets
are deliberately the same screen.

That clip is built, not hand-cut:

```bash
node scripts/build-film.mjs
```

Legs are stream-copied from `assets/0{1,2,3,4}.mp4`; only the 1.6s dissolve at
the end is encoded. Re-encoding the whole clip was tried and produced 18.6MB of
worse pixels, because a dense-GOP pass over already-compressed video pays twice.

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
| G14 | This build's own behaviour: the chapters, the chain, the film's playhead, the folio, the single CTA, the FAQ, the footer, the prices, the keyboard path and reduced motion |

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
| `surface.js` | The folio and the chain. No scroll loop, no animation frame |
| `engine/` | scrollcraft, copied verbatim. Never edited per-project |
| `assets/` | The film, its poster, the product screens, the Hebrew subset of Noto Sans |
| `scripts/build.mjs` | The build. One locale in, one static file out |
| `scripts/build-film.mjs` | Rebuilds chapter 01's clip from the world legs |
| `scripts/gates/` | The acceptance ledger, one file per gate, plus control fixtures |
| `lab/app-reference/` | Screenshots of the running product. Every figure on the page is read off these |
| `archive/` | Previous builds' briefs, locales and gates, kept rather than deleted |

---

## Before you edit

**No invented figures.** Every number on the page is read off a capture in
`lab/app-reference/` or a migration in the product repo, and the comment block
at the top of `i18n/he.js` names the source of each one. The page used to print
those sources for the visitor; that was removed as noise, so the comment block
is now the only place they live. Keep it true.

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
