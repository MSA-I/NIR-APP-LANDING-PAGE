# GATES.md — build 2, remediation round

Round 1's ledger is archived at `archive/GATES-round1.md`. Every gate in it
passed, and the owner then found four faults in the page. That is the finding
worth carrying forward: **round 1 measured still frames and never measured
motion.** This ledger fixes that.

The owner's four findings, taken at face value:

1. "מלא פליקרים ובאגים בגלילה" — flicker and jank while scrolling.
2. "הפס שמראה את סדר התנועה" — the map bar is part of it.
3. "הטקסטים לא מודגשים מספיק ומתערבבים בבלאגן" — copy loses against a busy frame.
4. "למה יש אספלט ולא טקסטורה של שולחן עבודה" — the ground is wrong. A business
   owner's documents sit on a desk, not on a road. This is the most damaging of
   the four, because it makes the world's whole premise wrong.

---

## G1 — no layout-animating property is driven per frame

    CHECK: node scripts/gates/no-layout-anim.mjs
    EXPECT: LAYOUT-ANIM-CLEAN

Driving `width`/`height`/`top`/`left`/`inset` from a per-frame write forces
layout every frame. The map's run bar did exactly that.

## G2 — no CSS transition fights a per-frame write

    CHECK: node scripts/gates/no-transition-fight.mjs
    EXPECT: TRANSITION-FIGHT-CLEAN

An element with `transition: opacity` whose opacity is rewritten every rAF
restarts that transition every frame and never settles. It reads as a pulse.

## G3 — continuous scroll has no frame-to-frame discontinuity

    CHECK: node scripts/gates/scroll-smooth.mjs --url http://localhost:4500
    EXPECT: SCROLL-SMOOTH-OK

Scrolls the whole track in small real steps and compares consecutive frames. A
jump beyond threshold between adjacent samples is a visible flicker. This is
the gate round 1 did not have.

## G4 — every map stop lands inside its own leg

    CHECK: node scripts/gates/map-stops.mjs --url http://localhost:4500
    EXPECT: MAP-STOPS-OK

## G5 — the page holds a real frame rate while scrolling

    CHECK: node scripts/gates/frame-rate.mjs --url http://localhost:4500
    EXPECT: FRAME-RATE-OK

Measures actual rAF deltas during a driven scroll. Long frames are what the
owner is seeing, and no screenshot can show them.

## G6 — copy is legible against the worst frame it is ever shown on

    CHECK: node scripts/gates/copy-contrast.mjs --url http://localhost:4500
    EXPECT: COPY-CONTRAST-OK

Round 1 cleared 4.5:1 with a soft scrim and the owner still could not read the
copy against a busy frame. This gate requires 7:1.

## G7 — the ground is a desk, and no road surface remains

    MANUAL: probe frames from the ground-level legs show a desk surface.
    Evidence: `lab/world/desk/*.png`, read and described in the report.

## G8 — the scroll harness still passes on all three profiles

    CHECK: node scripts/gates/harness-all.mjs
    EXPECT: HARNESS-ALL-OK

Desktop, 390px and reduced motion: no dead scroll, all legs paint, contrast.

---

## Evidence log

Measured 2026-08-26, after the re-render. Shell: Git Bash on Windows.
CWD: `D:\משה פרוייקטים\פיתוח אתרים\LANDING-PAGE-NIR`. Server: `http://localhost:4500`.

| Gate | Result | Evidence |
|---|---|---|
| G1 | MET | `LAYOUT-ANIM-CLEAN`. Falsified first: with the old `width: calc(var(--ip-run) * 100%)` restored in a control stylesheet the gate printed `LAYOUT-ANIM-BAD` and exited 1. The first version of the gate MISSED that control because it anchored the property to line start; it was fixed before being trusted. |
| G2 | MET | `TRANSITION-FIGHT-CLEAN`. Falsified: a control carrying `transition: opacity 420ms` on `.ip-brand` printed `TRANSITION-FIGHT-BAD`. That rule was real and shipped in round 1. |
| G3 | MET | `SCROLL-SMOOTH-OK`, 170 frames, worst adjacent step 48.8 at t=0.888, no pops, no cliffs. Falsified: one frame replaced with black in a copied capture produced `CLIFF` + `POP` and exit 1. **Before the fixes the same gate found 17 flagged steps with a worst of 126.2.** |
| G4 | MET | `MAP-STOPS-OK`. All nine stations land inside their own leg and `aria-current` agrees each time. |
| G5 | MET | `FRAME-RATE-OK`. 417 driven frames, mean 16.7ms, p95 16.8ms, zero frames over 33ms. The flicker was never jank. |
| G6 | MET | `COPY-CONTRAST-OK`. All **nine** copy blocks measured, every one on a plate at alpha 0.95, worst text 8.36:1 against a 7:1 floor. The first version of this gate passed having measured **two of nine** because it only read what the harness happened to sample; it was rewritten to measure every block itself. |
| G7 | MET | The ground is a photographed walnut desk. Evidence read: `lab/peek/hx.png` (paper stack and scatter on wood), `lab/peek/fin.png`, `lab/peek-m/m.png`. No road or concrete surface remains anywhere; the concrete texture is deleted. |
| G8 | MET | `HARNESS-ALL-OK`. desktop / 390px / reduced motion all pass: no dead scroll, all 9 legs paint a real frame, contrast clear. |

**Measured: 8 met, 0 unmet, 0 abandoned.**

## What actually caused the owner's four findings

1. **Flicker.** Not jank. Chrome silently stops rastering tiles for very large
   layers, and the ground was a 16000x16000 element — 256 megapixels. Captures
   came back with whole panels missing, and those frames were encoded into the
   clips. The DOM was correct at every sampled position, which is why round 1's
   still-frame gates all passed. Fixed at the source (a 2200px element scaled
   up covers the same ground) and now proven per frame: the renderer reduces
   every frame to a signature and recaptures any frame unlike both its
   neighbours. Both full re-renders reported `dropped frames recaptured: 0`.
2. **The map bar.** It animated `width` from a value rewritten every frame,
   forcing layout on every frame of the scroll. Now `transform: scaleX()`.
   Separately, `.ip-brand` and `.ip-langs` carried a 420ms opacity transition
   while JS rewrote their opacity every frame, so the transition restarted
   every frame and never settled. Both are now gated.
3. **Copy lost in the mess.** It sat on a soft radial scrim that cleared 4.5:1
   and no more. Every block now sits on an opaque Onyx plate at 8.4:1 or better.
4. **The ground.** It was polished concrete, which is a road, not a desk. The
   owner was right and it is now walnut.

Two further faults were found while measuring, neither of them reported:
the leg 4 / leg 5 seam did not line up (leg 4's last frame had no dashboard in
it at all, from a dropped raster), and the engine's poster push-in scaled the
poster to 1.03–1.17 while the video played unscaled, so every leg popped once
on arrival. Both fixed.

## Known limits, stated rather than hidden

- **A real phone is still not covered.** Headless Chrome cannot reproduce an
  iPhone's video decoder, autoplay policy or Low Power Mode. The 390px pass is
  a layout and contrast check.
- **The demo CTA URL is an assumption.** `https://inplace.digital/demo` is a
  placeholder pending the owner's confirmation.
- **G3's thresholds are judgement, not physics.** A pop is any frame unlike
  both neighbours; a cliff is one step over 70. The page contains deliberate
  dissolves that legitimately move 30-50 in a step, and those are not failures.
  The numbers are reported rather than hidden behind the verdict.
