# InPlace — landing page

Hebrew-first, RTL landing page for **InPlace**, the procurement-to-payment
control system in [MSA-I/NIR-APP](https://github.com/MSA-I/NIR-APP).

React 19 + Vite + Tailwind v4 + Motion. No database, no credentials, nothing
that can reach production. `playwright-core` is a dev dependency and only the
verification harness uses it.

---

## What it is

The page is a **printed feature**: a title page and six chapters. Chapters are
the unit, they hard-cut between grounds, and only one of them carries a scroll.

| | Chapter | Ground | What it does |
|---|---|---|---|
| — | שער | Onyx, live | What this is, the ask, and an index of the six chapters, over a fluted-glass shader |
| 01 | מהערימה למרכז הבקרה | Onyx | A 27.6s scrubbed film. Four copy blocks travel beside it while it stays |
| 02 | מה המערכת עושה | Wheat, then Onyx | Five stations, five real product screens you can click through from the product's own navigation, then the control centre in full |
| 03 | למה דווקא זה | Onyx | What InPlace does, against what it refuses to be |
| 04 | מסלולים | Onyx | Five plan cards, one published usage metric each, the launch prices |
| 05 | שאלות | Wheat | Seven answers, as native `<details>` in monochrome panels |
| 06 | להתחיל | Onyx, live | The one ask, on the ground the page opened on |

The design intent and the interview it came from are in [BRIEF.md](BRIEF.md);
the acceptance ledger with its evidence is [GATES.md](GATES.md); the build's
registry row is [FINGERPRINTS.md](FINGERPRINTS.md).

### Build 4, and what changed

Build 3 (`inplace-folio`, static HTML from one Node script) had already taken
the reference's **layout** — aui.io's bounded page, its inset plates, one very
large display size per chapter, a small accent label above it. The owner's
verdict on it was that the layout was right and the surface was not: "הכל נורא
שטוח ובסיסי".

Build 4 keeps build 3's copy **verbatim** and rebuilds the surface. The list
below is the second cut, after the owner's review of 26.08.2026:

- A **WebGL fluted-glass shader** behind the title page and the close, from
  [21st.dev](https://21st.dev/@paper-design/components/fluted-glass-folds)
  (Paper Shaders, Apache-2.0). Ribbed panes with a slow fold travelling through
  them, painted in the running application's own tokens — shell → action →
  action-line → topbar. It does **not** answer the pointer: the cursor branch
  and its listeners are removed from the component, not switched off.
- A **display typeface**. Headlines are Heebo 800; reading copy stays Noto Sans
  Hebrew. Both self-hosted, two subsets each, no third-party font request.
- **The application's palette**, converted from the OKLCH tokens in
  `data/product-tokens.json`. The first cut used a turquoise (#38b3c0) the
  product does not contain.
- **Entrance motion** on every chapter: headlines arrive word by word, blocks
  rise and clear as they enter.
- **The flow button** ([21st.dev](https://21st.dev/@xubohuah/components/flow-button)):
  the ground opens out of the button's centre, the label slides forward, an
  arrow crosses. Rewritten on logical properties so it runs the right way in
  Hebrew.
- **Plans as cards** ([21st.dev](https://21st.dev/@uilayout.contact/components/pricing-section-3)),
  **FAQ as monochrome panels** ([21st.dev](https://21st.dev/@larsen66/components/faq-monocrhome)),
  and a **curtain colophon** ([21st.dev](https://21st.dev/@easemize/components/motion-footer)),
  all repainted in the product's colours. The colophon is rebuilt on Motion
  rather than GSAP, and the FAQ keeps its native `<details>` underneath.
- **Crop marks** on every plate, which is the reference's printer's
  registration and the one piece of its decoration worth copying.
- **A re-textured film.** Chapter 01's desk is a photographic dark walnut and
  its documents are photographed uncoated stock, both generated at 2K
  (Higgsfield, GPT Image 2) and re-rendered through the world scene.

Build 3's sources are parked, unedited, in `archive/build3/`. Nothing was
deleted. The copy in `src/content/he.ts` is a byte-for-byte carry of
`archive/build3/i18n/he.js`, and G2 fails the ledger on any drift.

### The film, and the handover

A stack of supplier documents comes down, two numbers for one supplier
contradict each other, and the camera lifts off the floor toward something lit
in the dark. Then the film does not cut, it hands over: it dissolves out of the
world and into the product's own control centre, and from that second on every
pixel on the page is a screenshot of the running system. The last frame of
`public/assets/film.mp4` and the first product screen the reader meets are
deliberately the same screen.

Build 3 drove that clip through the scrollcraft engine (56KB of vanilla scroll
machinery). Build 4 drives it with one scroll progress and one assignment to
`currentTime`, so the engine is not carried over.

The scene it is rendered from is in this repository, at `world/`: one CSS-3D
world, one camera as a function of t, its two textures, and the nine product
captures it hangs on its panels. Render the four legs the film uses, then build
the clip:

```bash
node scripts/render-world.mjs --only 01,02,03,04
```

```bash
node scripts/build-film.mjs
```

Legs are stream-copied from `public/assets/0{1,2,3,4}.mp4`; only the 1.6s
dissolve at the end is encoded. Re-encoding the whole clip was tried and
produced 18.6MB of worse pixels, because a dense-GOP pass over already
compressed video pays twice.

---

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

`npm run dev` serves on <http://localhost:4501>, `npm run preview` serves the
built `dist/` on <http://localhost:4500>. `dist/` is not committed.

## Verify it

```bash
node scripts/gates/all.mjs
```

Twelve gates, about ninety seconds, non-zero on any failure.

| Gate | What it measures |
|---|---|
| G2 | The copy is build 3's copy, leaf by leaf |
| G3 | Every shader colour is a token the application defines, and no pointer code survives |
| G4 | Direction is logical-only, in the CSS **and** in the class names |
| G6 | No horizontal overflow, eight scroll positions across four widths |
| G7 | Text contrast on the composited render, over the moving ground included |
| G8 | Seven chapters, in the printed order |
| G9 | The display face is loaded and the headlines are actually set in it |
| G10 | The film's playhead follows the scroll |
| G11 | The chain switches panels; 25 hotspots land where the navigation is |
| G12 | `prefers-reduced-motion` stops the shader, the film and every transition |
| G13 | The keyboard reaches everything, and every stop shows a ring |
| G14 | The published figures are the launch catalogue; legal links on the app host |

One gate by id:

```bash
node scripts/gates/all.mjs g7
```

Screenshots at chosen scroll fractions, desktop or phone:

```bash
node scripts/peek.mjs --out lab/build4 --at 0,0.25,0.5,0.75,1
```

**A green run is not the whole check.** Look at the frames. Every gate measures
what somebody thought to ask, and [GATES.md](GATES.md) ends with the three
things on this page that nothing measures.

---

## Files

| Path | What it is |
|---|---|
| `index.html` | The document shell: title, description, favicons, font preloads |
| `src/App.tsx` | The page, as one function of the dictionary |
| `src/content/he.ts` | All copy and every figure, with the source of each in a comment |
| `src/styles.css` | Tokens, the two faces, the plate, the crop marks, the buttons |
| `src/lib/motion.tsx` | The whole motion vocabulary: three moves, and no more |
| `src/components/ShaderBackground.tsx` | The WebGL ground, repainted from 21st.dev |
| `src/components/*Chapter.tsx` | One file per chapter |
| `src/data/demo-nav.json` | The product's own navigation boxes, measured off the running app |
| `public/assets/` | The film, its poster, the product screens, both typefaces |
| `world/` | The scene the film is rendered from: the world, its textures, its product captures |
| `scripts/gates/` | The harness behind [GATES.md](GATES.md) |
| `archive/build3/` | Build 3 entire, unedited: page, styles, engine, its own ledger |
