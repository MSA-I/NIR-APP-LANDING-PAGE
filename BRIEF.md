# BRIEF.md — InPlace landing, build 3

Build name: `inplace-folio`
Branch: `aui-editorial` (cut from the `main` baseline that holds build 2)
Interviewed: 2026-08-26, with Moshe. **Not self-authored.**
Supersedes build 2 (`inplace-hall`), whose BRIEF is preserved in
`archive/BRIEF-v2.md`. Build 1's is in `archive/BRIEF-v1.md`.

Product: InPlace (codebase name SupplyFlow) — Hebrew-first, RTL, multi-tenant
procurement-to-payment control system. Product repo: `../NIR-APP`.

---

## Why build 2 was cut down rather than rejected

Moshe's words: he liked the idea, and specifically the stretch **"מערימה עד
פערים"**. Everything after it was *"נורא מבולגן וממש לא כמו שדימיינתי"*, and the
consequence he named is the one that matters: *"לקוח עתידי שייכנס לדף נחיתה לא
יבין מי נגד מי. האתר נחיתה אמור להסביר ללקוח מה המוצר עושה."*

That is a precise diagnosis, not a mood. Build 2 was one unbroken world with no
document flow at all: nine legs of camera, copy arriving at waypoints, and not a
single place where a visitor could stop and read what the product does. It was
an experience about a feeling. A landing page has to be an explanation.

So build 3 keeps the part that worked — the film — and replaces the grammar
around it.

**Correction taken mid-build:** the first plan ended the film after "פערים".
Moshe corrected it to **"נגמר באמצע בקרה"**, so the film now runs legs 01-03 and
stops halfway through leg 04, on the reveal of the control centre. That is a
better cut than the one I proposed: the film ends on the product, not on the
mess, and it hands straight into the chapter that explains the product.

---

## The interview answers

Asked as four questions, answered 2026-08-26.

**1. Where does the film end and the structured page begin?**

> "אחרי 'פערים'" — corrected the same session to **"נגמר באמצע בקרה"**.

**2. Palette: copy the reference, or stay with InPlace?**

> "מבנה הרפרנס, צבעי InPlace"

The layout language is taken from the reference. The palette is not.

**3. Which content sections go into the structured page?**

> "מה המערכת עושה — 5 יכולות + מסך אמיתי"

One section, chosen out of four offered. The other three (before/after with
tabs, the three roles, the full chain) were **not** selected and are not on the
page. They are one instruction away and nothing in the build blocks them.

**4. Languages?**

> "עברית בלבד (מומלץ לעכשיו)"

`en` and `fr` are parked in `archive/i18n-v2/`. `scripts/build.mjs` builds `he`
only. The template is unchanged in shape, so restoring them is a one-line edit.

## The reference, read rather than glanced at

`https://www.aui.io/` read on 2026-08-26, computed styles sampled off the live
page rather than eyeballed from the screenshot:

| | measured | used here as |
|---|---|---|
| page ground | `#121212` | Onyx `#0a171d` |
| light band | `#f1f0e0` | Wheat `#fff6e9` |
| accent | `#ff4800` | Oceanic `#38b3c0` on dark, `#00525d` on light |
| plates | inset 10px, radius 12px, max ~1225px | same |
| display | 72 / 64 / 54px, weight 350-400, tracking -0.05em, leading 0.95 | Hebrew has no uppercase, so scale and weight carry it: clamp to 76 / 58 / 42px at weight 700, tracking -0.022em, leading ~1.0 |
| micro-label | 14px, uppercase, accent, tracking +0.01em | 13px, weight 600, accent, tracking +0.055em |
| body | 16-20px, weight 300-400 | 16-19px, weight 400 |
| structure | bounded plates on a ground, hard cuts, alternating dark and cream, real product UI inside its own panel with a label | same |

What was **not** taken: the section counters, the careers grid, the partnership
card, the logo wall (InPlace has no client logos it can show), and the palette.

---

## The grammar — chaptered editorial

The page is a printed feature: a title page, three chapters, a colophon. This is
the fork that makes build 3 a different page rather than build 2 with a new
skin, and it is the grammar the reference is actually written in.

Why the other seven lost:

- **Filmic one-shot** — the default drift, and the thing Moshe just rejected in
  a different costume. It forbids a visible index, which is exactly the thing a
  confused visitor needs.
- **Live surface** — spent by build 1, and it forbids display type and marketing
  chrome, which is the entire layout Moshe asked for.
- **Continuous world** — spent by build 2, and it is the grammar that produced
  the complaint.
- **Typographic poster** — forbids photographic ground and any real screens. The
  brief is "show the customer what the product does".
- **Gallery / catalog** — the visitor's question here is not "what are the
  options", it is "what is this".
- **Split stage** — the before/after comparison it exists for is exactly the
  section Moshe did **not** select.
- **Rhythmic cutlist** — hard cuts at speed, no dwell. The product screens need
  dwell; they are dense tables a reader has to actually read.

What the grammar forbids, and how it is honoured: no full-bleed scrub hero (the
film is a bounded plate in chapter 01, and the hero is a title page with no
media above the fold); no pinned crossfade type acts (the copy in chapter 01 is
sticky text in its own column, never cued over the film); media never bleeds
under type (film and copy are separate columns, every screen has a caption);
scrub in one chapter only (one act on the page, asserted by G14); no magnetic
CTA (the close is a colophon, the ask is a line of running text plus buttons).

## The chapters

| | Chapter | Ground | What it does |
|---|---|---|---|
| — | Title page | Onyx | What this is, in two paragraphs. Both CTAs. An index of the three chapters, so a visitor knows the shape before scrolling |
| 01 | מהערימה למרכז הבקרה | Onyx | The film. Four copy blocks travelling beside it |
| 02 | מה המערכת עושה | Wheat plate, then Onyx | Five steps, five real screens, tab-switched. Then the control centre at full width with three real figures |
| 03 | להתחיל | Onyx | The colophon: the ask, and the full source apparatus |

Length: **10.15 viewport-heights**. Deliberately outside the 13.6-13.8 band the
first four scrollcraft builds clustered in, and outside build 1's 12.3 and build
2's 16.0.

## The film

Legs 01, 02, 03 of build 2's world plus the first half of leg 04, stream-copied
into one clip: 593 frames, 24.71s, 9.5MB desktop / 4.2MB mobile. Stream copy,
not a re-encode — a re-encode of the same four legs came out at 18.6MB for worse
pixels, because a dense-GOP encode of already-compressed video pays twice.

Span 5.3vh, which is build 2's measured pace of 0.215 viewport-heights per
second of film.

## The feeling curve

| # | Beat | Feeling | What causes it |
|---|---|---|---|
| — | Title page | Orientation | A sentence that says what this is, and an index that says how long it will take |
| 1 | הערימה | Weight, then alarm | The stack of twelve supplier documents stands, leans and comes down |
| 2 | הפערים | Sharp frustration | Two numbers for one supplier, and nobody compared them |
| 3 | האור | Curiosity | The camera lifts off the floor; something is lit far ahead |
| 4 | הבקרה | Relief — **the peak** | The lit thing is the real control centre, and the film stops there, mid-reveal, and hands the page to the product |
| 5 | חמשת השלבים | Competence | Five real screens, readable, one click apart |
| 6 | מרכז הבקרה, מלא | Settled | The same screen the film stopped on, now full width and legible, with its three real numbers |
| 7 | הסגירה | Trust, then invited | Every number on the page, with the screen it came from. Then the ask |

No two adjacent beats carry the same feeling. Beat 3 is the calmest thing on the
page, deliberately, so beat 4 has something to break.

## The peak

**The cut.** The film stops halfway through the control-centre reveal and the
page hard-cuts to the cream plate. It is the largest single change on the page —
ground, grammar, and mode of attention all change in one scroll — and it is
where the visitor stops watching and starts reading.

The sentence a visitor would say:

> "The mess comes down, the camera finds the screen, and right when you want to
> look at the screen the film stops and hands you the actual thing."

Deliberately **not** build 2's peak (paper converting into rows) and not build
1's (objects sorting into a grid). Both are spent and logged.

## Authored silence

Two places, intentional, not dead scroll:

1. The third copy block in chapter 01 — the camera simply travels, the copy says
   one plain sentence, nothing is claimed. This is the inhale before the reveal.
2. The head of chapter 02, above the tabs — an eyebrow, a heading and one line,
   on an empty cream plate, before any screen appears.

## The tell-someone sentence

> It's the site where the film stops in the middle and hands you the actual
> screens, with a receipt for every number on the page.

---

## The signature move — "מנגנון ההערות"

The page cites itself, the way a printed feature does.

Every real figure in the running copy carries a superscript source number:
2,884.50 ₪, 4,720.00 ₪, 17 הזמנות, 5 הזמנות ממתינות, 14 חשבוניות, 8 חריגים,
דרישה 58#, and the control centre's 13 / 17,825 ₪ / 6. As the reader passes one,
a footnote strip at the foot of the page names its source: which screen, which
supplier, which date, which status. The figure and its row in the full list both
light while it is named.

The full apparatus is real markup in the colophon — an ordered list of all eight
sources — so a reader with no JavaScript, or a screen reader, gets the whole
thing and loses only the reading head. G14 asserts it in both directions: no
figure without a source, and no source nothing cites.

Why this and not a nicer effect: the fault Moshe named is that a visitor cannot
tell what is real. A page about a system whose entire promise is "numbers that
agree" should be able to show where its own numbers came from. It is the only
device on the page that argues rather than decorates.

Distinct from build 1's `השקל בתנועה` (one amount riding a chrome rail, mutating
with scroll velocity) and build 2's `המסמך שנוסע איתך` (an object following the
pointer through a world). Neither of those was a citation, and neither had a
non-JS equivalent.

---

## What is deliberately not here

Stated so it reads as a decision rather than an omission:

- **Three of the four offered content sections.** Moshe selected one. The
  before/after comparison, the three roles, and the full supplier-to-bank chain
  are not on the page.
- **English and French.** Parked, not deleted.
- **Any invented number.** Every figure is read off a capture in
  `lab/app-reference/`, taken 2026-08-26 from the product running locally.
- **A logo wall.** InPlace has no customer logos it can show, and a row of
  greyed placeholder marks is the reference's least honest component.
