# BRIEF.md — InPlace scroll landing, build 2

Build name: `inplace-hall`
Interviewed: 2026-08-26, with Moshe. **Not self-authored.**
Supersedes build 1 (`inplace`, 2026-08-25), which Moshe rejected. Build 1's
BRIEF is preserved in `archive/BRIEF-v1.md`.

Product: InPlace (codebase name SupplyFlow) — Hebrew-first, RTL, multi-tenant
procurement-to-payment control system. Product repo: `../NIR-APP`.
Out of scope by instruction: `../NIR-LANDING PAGE`.

---

## Why build 1 was rejected

Asked directly, Moshe selected all four available faults at once:

- **ריק ומופשט מדי** — too much white space, one small card in the middle, no
  visual presence.
- **לא מסביר מה המוצר עושה** — a visitor who does not already know InPlace
  cannot tell what it is from looking at it.
- **משעמם / לא מרשים** — nothing on the page makes anyone stop.
- **סכמטי במקום אמיתי** — diagrams and abstractions where the real screens and
  the real numbers should have been.

That is one fault, stated four ways: **build 1 talked about the product instead
of showing it, and it did so quietly.** Build 2 inverts both halves.

---

## The eight interview answers, verbatim

**1. Vibe**

> "עוצמתי ומרשים"

**2. The scroll journey — what comes first**

> "הכאב קודם"

The visitor opens on the mess, not on the product. The stack of documents that
does not hold, and the numbers that do not agree.

**3. The energy curve**

Powerful from the first frame, so the curve is not quiet-to-loud. It is
**pressure, then release**: the weight of the mess up front, held through the
journey, resolved at the peak, and settled — not deflated — at the close.

**4. How it should feel, and the ONE moment**

> "הכאוס מסתדר לסדר"

The remembered moment: the scattered paper stops being paper and becomes the
system. Not "documents tidy themselves into a grid" — they **turn into rows in
the real InPlace table**. The name proven in motion.

**5. One thing no other site does**

The document the visitor is carrying. See the signature move below.

**6. Aesthetic range**

> "שילוב של מה שהצעת ב 1 ו 3"

Option 1 was *bold in scale*: product colours, large scale, large typography,
strong contrast. Option 3 was *very cinematic*: deep dark ground, dramatic
lighting, screens floating in space. Both, combined. So: the brand's own Onyx
graded down to a lit room over a walnut desk, real screens as physical objects in it, and
typography at a scale the product itself would never use.

Note the tension this creates with the product's own anti-references
(`../NIR-APP/PRODUCT.md`: never loud, never flashy). Resolution, recorded and
agreed by the answers above: **the product surface stays exactly as it is —
every screen shown is the real one, uncoloured and unretouched. The drama is in
the room around it, never inside it.** InPlace stays calm; the hall it is
standing in is lit like a film.

**7. One unbroken world, or distinct scenes?**

> "עולם רציף אחד"

Explicit. This is the single biggest structural fork and Moshe took the
continuous side, so the page is worldflight and has no acts anywhere.

**8. Assets**

> "אצלם מחדש מהאפליקציה"

Only that, at interview time. Fourteen screens were captured fresh from the app
running locally against a local Supabase, on 2026-08-26.

**Changed mid-build, on Moshe's instruction.** Partway through he said the
Higgsfield CLI was available to use. Generated stills were added for the ground
only. Nothing generated appears as content — no product screen, no document, no
figure. The generated material is the room; everything in the room is a real
capture.

**Then changed again, on his review.** The first ground was polished concrete,
and he asked the right question: "למה יש אספלט ולא למשל טקסטורה של שולחן עבודה
הרי בעל העסק לא עובד על הכביש". A business owner's paperwork is on a desk. The
ground is now a photographed top-down **walnut desk**, and the concrete is
deleted. This is the single change that made the world's premise true rather
than merely atmospheric.

## The four production answers

- **Languages:** he / en / fr. Hebrew RTL is the source; en and fr mirror it.
- **CTA:** both — primary פתיחת חשבון חינם, secondary תיאום דמו.
- **Length:** long, ~16 viewport-heights.
- **Audience the page speaks to first:** בעלים / מנהל עסק. The owner's pain is
  "I cannot see the picture", so the page opens on not being able to see it.
- **Name on the page:** InPlace.
- **Pain scene, specified:** ערימת מסמכים מתערערת + מספרים שלא מתאימים. Both,
  in that order.

---

## The feeling curve

Written before the legs. One line per leg: the emotion, then what causes it.

| # | Leg | Feeling | What causes it |
|---|---|---|---|
| 1 | הערימה | Weight, then alarm | A stack of twelve documents stands on a dark walnut desk, leans, and comes down toward the camera |
| 2 | המספרים | Sharp frustration | Three fallen pages light up and contradict each other: ordered, received, invoiced |
| 3 | האור בקצה | Curiosity | The camera lifts off the floor; far ahead in the dark something is lit |
| 4 | מרכז הבקרה | Relief, first competence | The lit thing is the real dashboard, and it is legible |
| 5 | המסע | Orientation | The camera travels the hall past the stations, each one a real screen |
| 6 | **הנייר הופך לשורות** | **Release — the peak** | The scattered paper rotates, flies in, and lands as rows in the real table |
| 7 | החריגה | Tension, then trust | One row goes red on its own. Nobody caught it; the system did |
| 8 | הכסף עובר | Quiet finality | Payment and bank meet once, matched, with a receipt |
| 9 | הכול במקום | Settled, then invited | The camera passes between payment and bank and comes back to rest head-on on the control centre it first saw from the dark |

No two adjacent legs carry the same feeling. Leg 5 (orientation) is
deliberately the calmest motion on the page so leg 6 has something to break.

## The peak

**Leg 6. "הנייר הופך לשורות".** Largest weight on the page by a visible margin
(2.6 against a 1.55 average), the most render budget, and the calm of leg 5 in
front of it.

The sentence a visitor says to a friend:

> "There's a bit where all the paper flying around just turns into the actual
> rows of the system, and that's when you get what the product is."

Deliberately **not** build 1's peak, which was scattered objects converging into
a sorted grid with one exception left ringed. That mechanic is spent and logged.
Here nothing sorts: paper **converts**. The exception is not part of the peak at
all; it is leg 7, and it arrives after the release, not inside it.

## Authored silence

Two places, intentional, not dead scroll:

1. The last third of leg 5 — the camera stops banking and simply travels. The
   world is legible and nothing demands anything. This is the inhale.
2. The first third of leg 9 — the flight settles and the control centre holds,
   lit and still, before the invitation arrives.

**Changed during the build, recorded rather than quietly dropped.** Leg 9 was
written as "the camera pulls back and the whole hall is lit at once". A corridor
travelled forwards has everything behind it at the end, so that shot needs the
camera to turn around, which shows the backs of the screens; billboarding them
to face the camera turned every panel oblique mid-turn and a 2100-wide oblique
plane 900 units away crosses the camera plane and renders as a full-frame smear.
The close now returns to the control centre head-on instead. Same beat —
arrival, resolution, everything in its place — reached with geometry that
holds.

## The tell-someone sentence

> It's the site where the mess on your desk turns into the software while you
> scroll.

---

## The signature move — "המסמך שנוסע איתך"

Twelve documents fall in leg 1. Eleven of them are in the film. **The twelfth is
not.** It is live markup in the copy layer: a real paper card, and from the
moment it lands it follows the pointer with mass and lag, drifting over the
world like something the visitor is holding.

It is the same document for the whole page, and it changes as the journey
changes it:

It is invoice **2088, נקי וזוהר, 1,062.00 ₪** — a real row in the real invoices
table — and its state line restates at every waypoint:

`בערימה` → `לא הושוותה` → `נסרקה` → `נקלטה למערכת` → `שויכה להזמנה` →
`קיבלה שורה` → `נבדקה מול ההזמנה` → `אושרה לתשלום` → `שולמה חלקית`

The last state is the one the product actually records for that invoice.

At the peak it leaves the pointer, flies into the panel, and takes its place as
a row. At the close it comes back stamped, and it is the object the CTA lives
on — which is what this grammar requires an ending to be.

On touch it follows scroll velocity instead of a pointer. Under reduced motion
it stops moving and simply updates its state at each waypoint.

Distinct from build 1's signature (`השקל בתנועה`, one amount riding a fixed
rail): that was a number on chrome the page drew; this is an object in the world
the visitor is holding.
