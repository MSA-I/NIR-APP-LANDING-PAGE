# GATES.md — InPlace scroll landing, build 2 (`inplace-hall`)

Acceptance gates for the rebuild. A gate is only PASS with evidence named next
to it. A gate that is dropped is marked `ABANDON:` with the reason, never
quietly removed.

Opened 2026-08-26. Supersedes the build-1 gate list.

| # | Gate | How it is measured | State |
|---|---|---|---|
| G1 | The brief is interviewed, not assumed | `BRIEF.md` carries all eight answers verbatim, marked not self-authored | PASS — BRIEF.md |
| G2 | Grammar is continuous world, and it is really worldflight | `data-sc-mode="worldflight"`, no `data-sc-act` anywhere in `dist/` | PASS — no `data-sc-act` in dist; `data-sc-mode="worldflight"` only |
| G3 | Nothing in document flow but the spacer | `worldflight-assert.mjs` | PASS — worldflight-assert |
| G4 | Spacer height = (sum of weights + 1) x vh | `worldflight-assert.mjs` | PASS — 14400px = 16 x 900 |
| G5 | One pace across the whole flight | render log: weight / clip-seconds spread within a few percent | PASS — 0.07% spread |
| G6 | Seams are exact, not matched | one camera function sliced by t; leg N's last frame is leg N+1's first, by construction | PASS — by construction; render log shows both ends of every leg on the same camera function |
| G7 | No dead scroll | `shoot.mjs` reports none | PASS — desktop, phone and reduced motion all report none |
| G8 | No leg stuck on its poster, none permanently mid-dissolve | `shoot.mjs` | PASS — all 9 legs reach full opacity and paint a real frame |
| G9 | Copy contrast >= 4.5:1 on the composited frame | `shoot.mjs` contrast pass, desktop and mobile | PASS — all cues clear 4.5:1 at their worst frame, desktop and 390px |
| G10 | Every figure on the page is real | each traced to a capture in `lab/app-reference` in `i18n/he.js` header | PASS — he.js header, arithmetic checkable |
| G11 | The peak has the most scroll room by a visible margin | leg 6 weight 2.6 against a 1.67 average | PASS — src/page.mjs LEGS |
| G12 | Fingerprint gate: 4 of 6 against every existing row | checked against row 1 in `FINGERPRINTS.md` | PASS — 6 of 6 against row 1 |
| G13 | Signature move exists and is bespoke | the twelfth document, `surface.js` + `.ip-doc` | PASS — the twelfth document, `surface.js` + `.ip-doc` |
| G14 | Reduced motion still tells the whole story | `shoot.mjs --reduced-motion` | PASS — posters only, no clip fetched, all 9 legs legible |
| G15 | Keyboard: map stops and CTAs reachable, focus visible | manual tab pass | PASS — tab order skip/brand/langs/9 map stops; focus ring captured; faded chrome leaves the tab order |
| G16 | Three locales build and carry identical figures | `node scripts/build.mjs`, spot-check he/en/fr | PASS — he/en/fr build, same figures in all three |
| G17 | Portrait is composed, not cropped | mobile clips rendered from a portrait camera, `shoot.mjs --width 390` | PASS — portrait rendered from a portrait camera, not a crop |
| G18 | Asset weight is stated honestly | `du` of `assets/`, reported to the owner | PASS — 23.1 MB desktop + 10.2 MB portrait, 35 MB dist total. Stated to the owner. |

## What a green run here does NOT cover

- **A real phone.** Headless Chrome cannot reproduce an iPhone's video decoder,
  autoplay policy, Low Power Mode or touch scrolling. The 390px pass is a
  layout and contrast check, not a device check.
- **The lerp-convergence assertion.** `worldflight-assert.mjs` reads
  `window.__sc.clips`; the engine shipped with this skill exposes
  `ScrollCraft`, not `__sc`, so that one assertion cannot run. The five
  structural assertions before it all pass, and the playhead was checked
  indirectly: `shoot.mjs` waits for the playhead to settle before every shot and
  reported `settled=true` on all 106 desktop samples.
- **The harness's FROZEN CLIP warning is an act-mode check applied to
  worldflight** and is expected here: every leg stays mounted for the life of
  the page, so a leg outside its own range legitimately holds its first or last
  frame while another leg is on screen. Each leg advances across its own range
  in the per-shot log.

## Known limits, stated rather than hidden

- **The demo CTA URL is an assumption.** `https://inplace.digital/demo` is a
  placeholder pending the owner's confirmation; the signup URL is inherited
  from build 1.
