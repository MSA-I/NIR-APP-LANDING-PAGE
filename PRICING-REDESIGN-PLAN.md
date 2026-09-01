# Pricing chapter — Higgsfield rebuild

Branch: `claude/pricing-display-redesign-24a280` (worktree).
Reference: four screenshots of higgsfield.ai's pricing page, supplied 01.09.2026.
Decisions confirmed by the owner in the same session are marked **[owner]**.

## 1. What replaces what

Today chapter 04 is: one tray of five cards, a fifteen-row comparison table
always open under it, and a `<details>` accordion per card that carries the
same fifteen rows on phones. The reference's anatomy is different in four ways,
and all four are adopted.

| | today | after |
|---|---|---|
| plan grouping | five cards, one row | tab bar: **מסלולים אישיים** (4) / **מסלולים עסקיים** (1) **[owner]** |
| capabilities | flat tick list on the card, fifteen-row table below | three titled blocks inside the card |
| comparison table | always open | behind a **השוואה מלאה** button **[owner]** |
| yearly saving | one badge beside the switch | struck monthly total + "חוסך X ₪" per card **[owner]** |

Nothing is removed from the catalogue. All five plans stay, all fifteen ladder
rows stay, and both trays stay in the DOM at every width so a crawler reads the
whole catalogue whichever tab is live.

## 2. The three colours **[owner: exactly like Higgsfield]**

| role | hex | where |
|---|---|---|
| Lime | `#d9f32b` | פרו — the recommended card: fill, CTA, badge |
| Magenta | `#e0357f` → `#a02ad9` gradient | פרימיום — the top card: fill, CTA, badge |
| Blue | `#1d4ed8` | the "כספים וחיבורים" block **inside** every card |

חינם and בסיס stay on the page's own ground, exactly as STARTER does. **[owner]**

These are three colours the product does not contain. They enter as three new
tokens in `styles.css`, used only inside `#plans`, and they must survive G7's
contrast walk in both the dark and the light view — see §7.

## 3. The card, part by part (desktop)

Read off screenshot 1, mapped onto this catalogue:

1. **Name row** — plan name, uppercase, heavy. Badge beside it:
   `הכי פופולרי` on פרו, `הכי משתלם` on פרימיום, and `חודשיים חינם` on both
   paid cards in yearly mode. NO PERCENTAGE ANYWHERE — the owner chose the
   struck figure and the shekel saving over a `% OFF` badge. **[owner]**
2. **Description** — one line, the plan's `who` string, already in `he.ts`.
3. **Quota panel** — inset box, the first of the three blocks **[owner]**:
   headline `20 מסמכים בחודש`, two grey sub-lines (`משתמש פעיל אחד`,
   `סניף אחד`), and a ticked footer chip inside the panel.
   This is the reference's credits panel, one for one.
4. **Price row** — in yearly mode: struck `828 ₪` beside `690 ₪`, then
   `לשנה, בחיוב שנתי`. Monthly mode drops the struck figure. **[owner]**
5. **CTA** — full width, in the card's own colour.
6. **Saving line** — `חוסך 138 ₪ לעומת חיוב חודשי`, or on חינם
   `אין הפרש לעומת חיוב חודשי`. Computed, never typed: struck = monthly×12,
   saving = monthly×2 (both catalogues are built at ten months — 69→690,
   249→2,490, 449→4,490, $20→$200, $79→$790, $149→$1,490).
7. **Block 2 — עבודה ואוטומציה** **[owner]**: שרשרת, תפקידים, קריאת מסמכים,
   היסטוריה, ייצוא, דוחות ספקים, מייל. ✓ or ✗ per row, with a tag on the right
   where the ladder says `'intro'` → `30 יום ראשונים`. That is the reference's
   `No unlimited` / `7-day unlimited` tag, and our data already carries it.
8. **Block 3 — כספים וחיבורים** **[owner]**: בנק, תשלומים, חשבוניות, API,
   תמיכה. Blue panel where the plan carries them; grey "אין גישה — נפתח
   במסלול פרו" panel where it does not, exactly as `NO ACCESS TO SEEDANCE 2.5`
   is drawn on STARTER.

The card is shorter than today's despite carrying more, because the quota
figures move off the flat list and into the panel and the fifteen-row accordion
is gone from the card.

## 4. Mobile (screenshots 3 and 4)

Below 768px the tray becomes the reference's stacked list:

- A label strip **on** the card's coloured edge above it: `הכי פופולרי`,
  `הכי משתלם` + `17% הנחה`.
- Card head: a select circle (○ / ✓) at the inline start, plan name and
  `690 ₪, בחיוב שנתי` under it, and a price chip at the inline end carrying
  the struck figure over the live one.
- Hairline, then two summary rows with glyphs — the plan's quota and its top
  capability.
- `לפרטים נוספים ⌄` pill at the inline end; open, it shows the rest of the
  rows and becomes `להסתיר ⌃`.
- **The circle selects.** One action button pinned under the list follows the
  selected card. **[owner]**
- Under the list: the fine print, then the **השוואה מלאה** button.

## 5. Business tab

One wide ביזנס card: name, `בשיחה`, the capability blocks laid two-up, and
`לדבר איתנו` pointing at the existing `#contact` form. The seat stepper in
screenshot 2 has no counterpart in this catalogue and is not built.

## 6. Files

| file | change |
|---|---|
| `src/components/PlansChapter.tsx` | rewritten: tabs, new card anatomy, mobile select, comparison behind a button |
| `src/content/extra.ts` / `extra.en.ts` | tab labels, block titles, quota sub-lines, tags, saving line, badges. New copy goes here and not in `he.ts` — G2 fails a new leaf in `he.ts` outright |
| `src/styles.css` | three accent tokens; card, panel, tab bar, mobile list, price chip |
| `scripts/gates/g14-figures.mjs` | teach it the tabs and the struck figure |
| `scripts/gates/g16-mobile-experience.mjs`, `g24-phone.mjs` | four visible cards, not five; add a business-tab pass |
| `GATES.md` | the round's entry |

`he.ts` prices are **not** touched. `data-plan-key`, `data-plan-price`,
`data-plan-yearly`, `data-plan-docs` and `data-ladder-*` all stay exactly as
they are: they are the contract three gates and `check-live-catalogue.mjs` read
the catalogue through.

## 7. The three risks, named

1. **Contrast.** Lime `#d9f32b` carries dark ink and passes easily. The magenta
   gradient under white ink is the one that has to be measured, in both the dark
   and the light view, before it ships. If a stop fails, the stop moves — the
   hue does not.
2. **Gate arithmetic.** G16 and G24 assert *five* cards in one column on a
   phone. Splitting ביזנס into its own tab makes that four. Both gates are
   updated to assert four in the individual tab and one in the business tab;
   neither assertion is weakened, both are re-aimed.
3. **The saving figure is a claim about NIR-APP's catalogue.** `828 ₪` and
   `138 ₪` are computed in the component from the monthly figure, so a price
   change in `he.ts` cannot leave a stale saving on the page. No percentage is printed
   anywhere on the chapter at all: the owner chose the struck figure and the
   shekel saving precisely so every number on the card can be checked against
   the two catalogues with nothing to take on trust. **[owner]**

## 8. Order of work

1. GATES.md entry for the round.
2. Content: `extra.ts` + `extra.en.ts`, both editions in step.
3. CSS: the three tokens, then the card, then the mobile list.
4. `PlansChapter.tsx`.
5. Gates G14 / G16 / G24, then `npm run gates` clean.
6. Screenshots: desktop and 390px, dark and light, `/` and `/en/` — eight
   frames, compared against the four references before anything is called done.

---

## 9. What was actually built, where it differs from §1–§8

Six things came out differently once the chapter was on screen. All six are
recorded here rather than in a commit message, because each is a decision.

1. **`'intro'` draws as a TICK with a chip on the card, and stays an absence in
   the table.** The plan said "with a tag where the ladder says `intro`" without
   saying which mark it would sit beside. On the card it is a tick reading
   `30 יום ראשונים`, which is the reference's `7-day unlimited` row exactly and
   is what the free plan actually gives. In the table it is still drawn as
   absent, which is the owner's decision of 28.08.2026 and unchanged: a column
   of five cells each reading "30-day introduction" is not a comparison.
2. **ביזנס lost its WebGL field.** It was the only card running a shader of its
   own, for a ground nobody reads a price on, and it is now the reference's
   ENTERPRISE card — the page's deep ground inside a bright ring.
   `PlanShader.tsx` is deleted.
3. **The magenta is darker than the screenshot's.** `#e0357f` carries white type
   at 4.2:1 and this page holds every string to 4.5:1. `#cf2670` is the same hue
   at 5.05:1. Flagged as a risk in §7; it came true and was answered the way §7
   said it would be — the stop moved, the hue did not.
4. **The plans tablist answers the arrow keys.** Not in the plan, and not
   optional: `role="tablist"` promises them, and a tablist that ignores them
   announces "tab, 1 of 2" and then does nothing.
5. **Four gates were re-scoped, not just the three §6 named.** Chapter 04 now has
   a second `[role="tab"]` on the page, and G11, G13 and G20 were all reading
   `[role="tab"]` unscoped while meaning chapter 02's product chain. G11 would
   have counted seven stations on a five-station chain; G20 would have resolved
   two selected tabs to a strict-mode error. All three now say `#what`.
6. **`scripts/shot-plans.mjs` is new.** Ten frames — desktop and 390px, dark and
   light, both editions, both tabs, both terms, comparison open — taken under
   reduced motion, because every block in this chapter enters on `whileInView`
   and a full-element screenshot photographs whatever never reached the viewport
   at opacity 0. Two runs of it produced a chapter with no comparison button and
   no fine print, and nothing was wrong with either.

**Not built, and deliberately:** the reference's seat stepper (`− 5 seats +`).
This catalogue has no per-seat business plan for it to count.
