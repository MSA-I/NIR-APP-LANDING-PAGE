# InPlace scroll landing

A Hebrew-first, RTL scroll landing page for **InPlace** (the procurement-to-payment
control product in `../NIR-APP`, shipped as SupplyFlow). English and French
mirrors ship from the same dictionaries.

Not related visually to the existing marketing site in
`../NIR-APP-LANDING-PAGE`. What carries over is the brand palette, the 24px card
language and the fixture figures. Nothing else.

## What it is

Built in the **live-surface** grammar: the page *is* the product, running, and
scroll drives its state. There is no marketing nav bar, no display-type hero and
no photograph with a claim laid over it. The chrome is app chrome — a station
rail and a status bar — and the close is a real input rather than a button.

The page follows one payment through the product's seven stations. Its
arithmetic is checkable and inherited, not invented:

```
160 crates x 39.90 = 6,384    the order
160 crates x 47.65 = 7,624    what invoice INV-2311 asked for
7,624 - 6,384      = 1,240    the gap the product stops
```

**The signature move: "השקל בתנועה".** One amount rides the station rail for the
whole page. Its position is scroll position, so scrolling is literally moving
money through the pipeline. The amount *mutates* as it travels; scroll velocity
is money velocity, so out-running the controls stamps a skip onto the rail and
into the ledger; and a controlled second pass clears it. The close reads the
accumulated ledger back to the visitor, skips included.

Design intent, the interview it came from and the feeling curve are in
[BRIEF.md](BRIEF.md). The acceptance ledger is [GATES.md](GATES.md). The build's
registry row is [FINGERPRINTS.md](FINGERPRINTS.md).

## Run it

```bash
node scripts/build.mjs
```

Then serve `dist/`:

```bash
node scripts/serve.mjs --root dist --port 4500
```

`he` is at `/`, `en` at `/en/`, `fr` at `/fr/`.

## Verify it

The whole acceptance ledger, sequentially:

```bash
node scripts/gates/all.mjs
```

One gate by id:

```bash
node scripts/gates/all.mjs g7
```

The scroll harness, which walks every act at six positions, waits for motion to
settle, and writes a contact sheet:

```bash
node scripts/shoot.mjs --url http://localhost:4500 --out lab/shots
```

Mobile and reduced-motion passes:

```bash
node scripts/shoot.mjs --url http://localhost:4500 --out lab/mobile --width 390 --height 844
```

```bash
node scripts/shoot.mjs --url http://localhost:4500 --out lab/reduced --reduced-motion
```

**A green run is not the whole check.** Read `lab/shots/sheet.png` by eye: the
harness proves a frame changed, not that the composition is good or that the
page means anything. Four real defects in this build were found only that way,
and they are listed under G14 in [GATES.md](GATES.md).

## Files

| Path | What it is |
|---|---|
| `src/page.mjs` | The page, as one function of a dictionary. The act score is at the top. |
| `i18n/{he,en,fr}.js` | Copy and fixtures. `he` is the source; the others mirror its shape, and G12 enforces that. |
| `site.css` | The page's own layer. Logical properties only, enforced by G4. |
| `surface.js` | The signature move: the rail, the token, the velocity rule, the ledger. |
| `engine/` | scrollcraft, copied verbatim. Never edited per-project. |
| `scripts/gates/` | The acceptance ledger, one file per gate, plus positive-control fixtures. |
| `scripts/capture-app.mjs` | Captures reference screenshots of the real product. |
| `scripts/extract-tokens.mjs` | Reads the product's computed design tokens out of the running app. |
| `data/product-tokens.json` | Those tokens. G3 measures the page against this file. |
| `lab/` | Verification output: scroll frames, contact sheets, product reference captures. |

## Two things to know before editing

**The palette is not decorative.** Status colours carry business meaning only:
done / await / alert / info / idle. A metric with no data renders an em dash,
never a zero, because zero is a claim about reality. Both rules come from the
product and outrank any design preference here.

**Colours ship as sRGB hex, authored in oklch.** The product authors in oklch;
this page stores the exact sRGB that Chrome paints for those values, because
`getComputedStyle` hands oklch back verbatim and every contrast tool in the
chain parses colour with an `rgb()`-shaped regex. `scripts/oklch-to-hex.mjs`
does the conversion by reading a painted pixel. Keep it that way: a page that
cannot be measured cannot be verified.
