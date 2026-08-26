# FINGERPRINTS

One row per shipped build. A new build must differ from **every** existing row
on at least 4 of the 6 dimensions, checked against each row individually.
Dimension 6 is free, because a signature move is unique by definition, so the
gate really asks for three more out of the remaining five.

If a planned build fails the gate, change the plan, not this file. Rewriting a
row to make a new build fit is the one thing that makes this file worthless.

| # | Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move |
|---|---|---|---|---|---|---|---|
| 1 | `inplace` | Live surface | App chrome: a fixed station rail at the reading-start edge that is also the money's track, plus an Onyx status bar carrying the tracked amount, the pace and a ledger toggle. No wordmark-and-CTA bar anywhere. | A pinned surface already in a state, with three exceptions arriving on cues inside a real card. No media, no claim over a photograph. | 11 acts, 12.34vh: pin@1.5 · flow · count · reveal · flow · reveal · **pin@2.9 (peak)** · pointer · flow · reveal · pin@1.3. Five families, none twice in a row, zero scrub. | An Onyx act holding the accumulated ledger read back to the visitor, resolving into a real email input and submit. No spotlight, no magnet, no button island. | **השקל בתנועה** — one amount rides the station rail for the whole page; it mutates across the eight stations (6,384 → 7,624 → 6,384), scroll velocity is money velocity so out-running the controls stamps a skip, and a controlled second pass clears it. The ledger it accumulates is read back at the close. |
| 2 | `inplace-hall` | Continuous world (real worldflight: one fixed stage, nine legs, one spacer, zero acts) | A map, not a bar: a horizontal floor-plan strip along the bottom edge with nine clickable stations and a run line that fills as the hall is travelled. The wordmark and the language links exist only in the dark and leave at 0.19 of the track, because past that they sit on top of the product's own chrome inside every screenshot. | Leg 1 of the flight: a lit tower of eleven real supplier documents standing on a dark walnut desk, leaning and coming down toward the camera. Scrubbed, not pinned. | 9 legs, 16vh track (15vh of legs + 1): 1.5 / 1.5 / 1.4 / 1.8 / 1.8 / **2.6 (peak)** / 1.4 / 1.4 / 1.6. No acts and no devices at all; the whole page is one camera. Pace held at 0.215vh per second of film, spread 0.00%. | Arrival, in the same canvas: the flight passes head-on through the payment screen, its light goes out, the hall is dark for a beat, and the control centre the visitor first saw from the floor rises to fill the frame. The ask sits on an Onyx plate and on the paper card, both objects in that room. No email field, no ledger. | **המסמך שנוסע איתך** — eleven documents fall in leg 1 and are in the film; the twelfth is live markup. Invoice 2088, נקי וזוהר, 1,062.00 ₪. It is picked up when the camera lifts off the floor, drifts after the pointer with mass and lag, alternates to whichever side the copy is not on, restates itself at every waypoint (בערימה → לא הושוותה → ... → שולמה חלקית), leaves the hand at the peak to become a row, comes back for the exception, and opens at the close as the object the CTA sits on. |
| 3 | `inplace-folio` | Chaptered editorial (a title page, three chapters, a colophon; one scrub chapter, everything else ordinary document flow) | A folio, not a bar: wordmark, the **live chapter name** updating as chapters pass, and one ask. It changes ground with the page — dark over Onyx, cream over the wheat plate. No links, no menu. | A **title page**. Type on the Onyx ground, no media above the fold, two CTAs, and a printed index of the three chapters with their subtitles. The film does not start until chapter 01. | A title page and five chapters, 13.06vh: title page · **scrub 5.3 (the one act)** · cream plate, chain of five, board spread · two-column refusal list · FAQ on a second cream plate · colophon. One device on the whole page; every other section is ordinary document flow. | A **colophon**: the ask set as a line of running text with the two buttons under it on one side, and the complete source apparatus — eight numbered sources in an `<ol>` — on the other. No spotlight, no magnet, no input, no arrival. | **מנגנון ההערות** — the page cites itself. Every real figure in the copy carries a superscript source number; passing one lights it, lights its row in the colophon list, and names its source in a footnote strip at the foot of the page: which screen, which supplier, which date, which status. The `<ol>` is real markup, so a reader with no JS or a screen reader gets the whole apparatus and loses only the reading head. |

## What row 1 spends, for the next build to avoid

- **Grammar**: live surface is taken. It is also the only grammar that suits a
  page whose argument is "watch what it does", so the next product page here
  has to find a different argument, not a different skin.
- **Ground language**: paper canvas hard-cutting to Onyx, with the product's own
  status palette. Any build on the same brand inherits the palette; it must not
  inherit the cut pattern.
- **Chrome as navigation**: a rail that doubles as a progress track. A second
  build that puts a different-looking rail in the same corner has changed one
  dimension, not four.
- **The peak's mechanic**: scattered objects converging into a sorted grid with
  one exception left ringed. Distinct from a pinned type act, and now spent.
- **Length band**: 12.3vh. Prior scrollcraft builds clustered at 13.6-13.8vh;
  this one sits just below that band, so the band is still crowded. Aim well
  outside it.


## What row 2 spends, for the next build to avoid

- **Grammar**: continuous world is now taken, and taking it means worldflight
  for real. Rows 1 and 2 between them spend the two grammars that suit a
  software product best, so a third InPlace page has to argue differently, not
  look different.
- **The world**: a dark room with the product's own screens standing in it as
  lit objects, over a photographed walnut desk. Any build that puts a screen
  in a dark room now looks like this one.
- **The peak's mechanic**: paper converging on a real table and converting into
  its rows. Distinct from row 1's sort-into-a-grid, and now spent too.
- **Chrome that leaves**: page chrome fading out because the world supplies its
  own. Cheap and effective; a second build doing it has copied, not decided.
- **Length band**: 16vh. Rows now sit at 12.3 and 16.0, and prior scrollcraft
  builds clustered at 13.6-13.8. The gap between 12.5 and 15.5 is the free
  space left.
- **The render pipeline**: legs cut from one continuous CSS-3D camera function
  by t, so seams are exact rather than matched. Reusable, but the *look* it
  produced here is spent.
- **The lesson, not a dimension**: the first cut of this row passed sixteen
  gates and the owner still found four faults, because every gate measured a
  still frame and none measured motion. Any future build here carries the
  motion gates in `scripts/gates/` from the start.


## What row 3 spends, for the next build to avoid

- **Grammar**: chaptered editorial is now taken, and with rows 1 and 2 that is
  three of the eight gone on one product. A fourth InPlace page has five left,
  and typographic poster and split stage are the only two that suit software.
- **The reference-layout move**: bounded plates on a ground, alternating dark
  and cream, huge display type with a small accent micro-label above it. Any
  build that reaches for that layout again has copied row 3, not decided.
- **The chapter index on the title page**: an honest and effective answer to
  "the visitor does not know what this is". Cheap, and now spent.
- **The film as a chapter rather than a hero**: reusing an earlier build's
  world as bounded media inside a reading column. Reusable as a technique, spent
  as a look.
- **The apparatus**: a page that sources its own figures. Distinct from both
  earlier signatures, and now the third one spent.
- **Length band**: 13.06vh, after the differentiation and FAQ chapters were
  added. Rows now sit at 12.3, 13.06 and 16.0, and prior scrollcraft builds
  clustered at 13.6-13.8. Free space left: below 12, and above 16.5. The band
  is now crowded enough that the next build should pick length deliberately
  rather than letting content decide it.
- **The lesson, not a dimension**: four real defects on this build were invisible
  to every gate and visible in the first screenshot — an engine rule
  out-specifying a page rule, `display:grid` beating `[hidden]`, an `<img>`
  height attribute defeating `aspect-ratio`, and light-ground ink inherited by a
  dark section. Gates measure what you thought to ask. Read the screenshots.
- **The refusal list**: a two-column "what it does / what it refuses to be",
  taken verbatim from the brand's own positioning doc rather than written as a
  competitor comparison. Honest and effective, and now spent.
- **The FAQ as `<details>`**: no JavaScript, one entry open at rest. Reusable
  as a technique; the pairing of it with a second cream plate is spent.
