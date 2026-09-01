// Chapter 04. The plans.
//
// THIRD REFERENCE, 01.09.2026. The owner supplied four screenshots of
// higgsfield.ai's pricing page and asked for its anatomy in place of the row of
// five cards this chapter shipped with on 28.08.2026. Read off those images,
// part by part, with what each one becomes here:
//
//   THE TABS    the reference sells to two audiences behind two buttons. Here
//               that is the four self-serve plans and ביזנס, the one plan sold
//               in a conversation. The owner picked this split over two others
//               on 01.09.2026: no plan is hidden from the catalogue and none
//               changes tier to make the row come out at three.
//   THE PANEL   the reference's credits box. An inset plate carrying the plan's
//               quota in a headline, the two figures that go with it under it,
//               and a ticked chip stating the terms. It is the first of the
//               three capability groups the owner asked for.
//   THE BLOCKS  the reference groups what a plan carries under titles instead
//               of printing one flat list, and it draws a group the plan does
//               NOT carry as a grey twin of the same block rather than as a
//               gap. Two blocks under the price — the work and the money — and
//               the money block is blue on every card that carries it.
//   THE PRICE   a struck monthly total beside the live figure and the saving
//               stated under the button. BOTH ARE ARITHMETIC over the two
//               catalogues; see `money` below.
//   THE PHONE   screenshots three and four: a label strip on the card's own
//               edge, a select circle, a price chip at the far edge of the
//               head, two summary lines, a press that opens the rest, and ONE
//               action under the list that follows the selection.
//
// NO PERCENTAGE IS PRINTED ANYWHERE ON THIS CHAPTER. The owner was offered a
// `17% הנחה` badge alongside the struck figure on 01.09.2026 and chose the
// struck figure alone, so that every number on a card can be checked against
// the two catalogues with nothing taken on trust. The reference's `20% OFF`
// pills are the one thing in those images that is deliberately not copied.
//
// WHAT THE LADDER SAYS IS STILL NOT A DESIGN DECISION. Every row, label and
// cell comes from NIR-APP's 0213 migration and the two read models it exposes
// to a browser; see the `ladder` block in src/content/extra.ts. This round
// regrouped those rows and changed nothing in them.
//
// THE CONTRACTS THIS FILE PUBLISHES ARE UNCHANGED, and that is why a rebuild
// this size did not need the catalogue touched: `data-plan-key`,
// `data-plan-price` (ALWAYS the monthly amount, whatever the switch shows),
// `data-plan-yearly`, `data-plan-docs`, `data-ladder-*`, one `role="switch"`,
// and one `.plan-card__action a` per card. scripts/gates/g14-figures.mjs and
// scripts/check-live-catalogue.mjs read the catalogue through those rather than
// through the layout, and both still do.

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  Banknote,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Files,
  History,
  LifeBuoy,
  Lock,
  Mail,
  Minus,
  Plug,
  ScanText,
  Sheet,
  ShieldCheck,
  Sparkles,
  Table2,
  Users,
  Wallet,
  Workflow,
  X,
} from 'lucide-react'

import { Cta } from './Cta'
import { Html, Reveal, RevealGroup, RevealItem, SplitHeading, useCalm } from '@/lib/motion'

// `key` is the product's own plan key ('free'...'business'), not a label. It is
// the join between this page and the live catalogue, and it is published as
// `data-plan-key` because a name cannot join two languages to one database.
type Row = { key: string; name: string; who: string; docs: string; price: string }

type Billing = {
  monthlyLabel: string
  yearlyLabel: string
  switchLabel: string
  perMonth: string
  perYear: string
  docsLabel: string
  yearly: string[]
  saveLabel: string
  billedMonthly: string
  billedYearly: string
}

type Cell = string | boolean

type Ladder = {
  compareLabel: string
  featuresHeader: string
  moreLabel: string
  included: string
  absent: string
  contract: string
  unlimited: string
  introNote: string
  cardRows: string[][]
  rows: { icon: string; label: string; cells: Cell[] }[]
}

type PlansUi = {
  tabsLabel: string
  tabIndividual: string
  tabBusiness: string
  popular: string
  bestValue: string
  quota: { head: string; lines: string[]; chip: string }[]
  blockWork: string
  blockWorkNote: string
  blockMoney: string
  blockMoneyNote: string
  blockMoneyNone: string
  blockMoneyFrom: string
  introTag: string
  was: string
  save: string
  saveNone: string
  compareOpen: string
  hideLabel: string
  selectLabel: string
}

/* ------------------------------------------------------------------- money
   The struck figure and the saving are the two numbers this round adds to the
   page, and neither is typed anywhere. Both are read out of the catalogue the
   card already publishes:

     struck  = the monthly amount × 12, which is what a year costs at the
               monthly term and therefore what the yearly price is a discount
               OFF. Stating it is the reference's move and it is checkable.
     saving  = that total MINUS the yearly amount, rather than "two months" —
               the two catalogues happen to be built at ten months today
               (69→690, 249→2,490, 449→4,490; $20→$200, $79→$790, $149→$1,490),
               and a subtraction stays right if that ever stops being true.

   The shape of the amount travels with it: the Hebrew catalogue writes '69 ₪'
   and the English one '$20', so the head and the tail are taken off the figure
   being read rather than assumed. A price with no digits in it ("ללא עלות",
   "בשיחה") parses to null and every derived figure is simply not drawn.
   ========================================================================= */
type Shape = { head: string; n: number; tail: string }

function parseAmount(v: string): Shape | null {
  const m = /^(\D*)([\d,]+)(.*)$/.exec(v.trim())
  if (!m) return null
  const n = Number(m[2].replace(/,/g, ''))
  return Number.isFinite(n) ? { head: m[1], n, tail: m[3] } : null
}

function formatAmount(shape: Shape, n: number) {
  return shape.head + n.toLocaleString('en-US') + shape.tail
}

/**
 * The amount on a card, counting between the two catalogues.
 *
 * Unchanged from the build before this one, and for the same reason: pressing
 * the yearly switch shows the SAME price at another term, and a number that
 * travels says that while a number that dissolves into another one does not.
 *
 * Only the digits move. "ללא עלות" and "בשיחה" carry no figure, so they swap
 * outright, and the thousands separators are re-rendered from the target's own
 * shape at every step so the width does not jitter.
 */
function Amount({ value }: { value: string }) {
  const calm = useCalm()
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    // The head is whatever sits before the first digit, which in the English
    // catalogue is the dollar sign. Without it '$20' parsed as no figure at
    // all: the card printed the price as a word, dropped "per month" under it,
    // and the count between the two terms never ran.
    const a = parseAmount(from.current)
    const b = parseAmount(value)
    from.current = value

    if (calm || !a || !b || a.n === b.n) {
      setShown(value)
      return
    }

    const start = performance.now()
    const span = 520
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / span, 1)
      // The same ease the figures in chapter 02 count on.
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(formatAmount(b, Math.round(a.n + (b.n - a.n) * eased)))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setShown(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [calm, value])

  return <>{shown}</>
}

/** The plan the vendor points at, and the one above it. Both are pointers of
    the same kind, which is why they are two indices and not two mechanisms. */
const RECOMMENDED = 2
const BEST_VALUE = 3

/** Which tray each plan belongs to. The owner's split of 01.09.2026. */
const INDIVIDUAL = [0, 1, 2, 3]
const BUSINESS = [4]

/**
 * Which face each card wears.
 *
 * PLAIN and LIFT follow the view, because they ARE the view: חינם is the ground
 * beside it and בסיס is that ground lifted one step. The other three keep a
 * colour of their own in both views, because they are objects rather than
 * surfaces — see the pinned ink in styles.css.
 *
 * THE THREE COLOURS ARE THE OWNER'S, NAMED ON 01.09.2026 as "exactly like
 * Higgsfield": lime on the recommended plan, magenta on the plan above it, and
 * a treatment of its own on the plan above it.
 *
 * WHAT EACH ONE IS TOOK THREE PASSES, all on 01.09.2026, and the last two are
 * the owner pointing at particular cards in the reference:
 *
 *   פרו      lime, then amber, and now the FRAME. The reference's ENTERPRISE
 *            card: a white surround with the pointer's word on it, a cool
 *            slate body inside, and a white button. It is the loudest card in
 *            that page without carrying a hue at all.
 *   פרימיום  magenta throughout, unchanged since the first pass.
 *   ביזנס    the reference's TEAM card: a plain dark plate and a white button,
 *            which is the shape a plan sold in a conversation should have —
 *            considered, not shouted.
 *
 * חינם and בסיס stay on the page's own ground, which is what the reference does
 * with STARTER. The blue block inside the cards became glass on the second
 * pass; see `.plan-block--money`.
 */
const FACE = [
  'plan-card--plain',
  'plan-card--lift',
  'plan-card--framed',
  'plan-card--magenta',
  'plan-card--slate',
]

/**
 * The three groups, as a partition of the ladder's row keys.
 *
 * The owner picked this grouping over two others on 01.09.2026. It is here and
 * not in the content dictionaries because the keys are the same in every
 * language, so grouping them in a dictionary would state the same decision
 * twice and let the two editions drift apart. The TITLES over the groups are
 * copy and live in `plansUi`.
 *
 * Every one of the fifteen rows is in exactly one group. A row added to the
 * catalogue without a home here would silently vanish from the cards, so the
 * assertion under it is not decoration.
 */
const GROUPS = {
  quota: ['documents', 'users', 'branches'],
  work: ['chain', 'roles', 'automation', 'history', 'export', 'reports', 'mail'],
  money: ['bank', 'payments', 'invoices', 'api', 'support'],
}

/**
 * The table's row glyphs, keyed by the `icon` in the content.
 *
 * A map rather than a component per row: the rows are data, and a row added to
 * the catalogue should reach the page by adding a line to extra.ts, not by
 * editing this file as well.
 */
const ROW_ICONS: Record<string, typeof Check> = {
  documents: Files,
  users: Users,
  branches: Building2,
  chain: Workflow,
  roles: ShieldCheck,
  automation: ScanText,
  history: History,
  export: Sheet,
  reports: BarChart3,
  mail: Mail,
  bank: Banknote,
  payments: Wallet,
  invoices: FileText,
  api: Plug,
  support: LifeBuoy,
}

/** One capability row inside a card's block. The reference's shape: a mark, the
    label, and a chip at the far edge where there is something to qualify. */
function BlockRow({ cell, label, tag }: { cell: Cell; label: string; tag: string }) {
  // `'intro'` IS A LIMIT AND IS DRAWN AS ONE — a clock rather than a tick, in
  // the quieter ink, with the chip saying how long it lasts.
  //
  // It was a plain tick for one round, and the owner's note on the second pass
  // of 01.09.2026 was that the free card then read as the FULLEST card on the
  // page: five ticks for five capabilities it loses on day thirty-one. A tick
  // that expires is not a tick. The comparison table has drawn this as absent
  // since 28.08.2026 and still does; between them the card now says what the
  // table says, with the duration attached.
  const intro = cell === 'intro'
  const on = cell === true
  return (
    <li className={`plan-row ${on ? '' : intro ? 'plan-row--intro' : 'plan-row--off'}`}>
      <span className="plan-row__mark" aria-hidden="true">
        {on ? (
          <Check className="size-3.5" strokeWidth={2.6} />
        ) : intro ? (
          <Clock className="size-3.5" strokeWidth={2.4} />
        ) : (
          <X className="size-3.5" strokeWidth={2.6} />
        )}
      </span>
      <span className="plan-row__label">{label}</span>
      {intro && <span className="plan-row__tag">{tag}</span>}
    </li>
  )
}

export function PlansChapter({
  folio,
  h2,
  lede,
  tableLabel,
  rows,
  priceNote,
  note,
  ctaHref,
  plansCta,
  billing,
  ladder,
  ui,
}: {
  folio: string
  h2: string
  lede: string
  tableLabel: string
  rows: Row[]
  priceNote: string
  note: string
  ctaHref: string
  plansCta: { free: string; paid: string; contact: string; contactHref: string }
  billing: Billing
  ladder: Ladder
  ui: PlansUi
}) {
  const [yearly, setYearly] = useState(false)
  const [tab, setTab] = useState<'individual' | 'business'>('individual')
  // The phone's selection. It starts on the plan the vendor points at, which is
  // the one card the reader would otherwise have to find.
  const [picked, setPicked] = useState(RECOMMENDED)
  const switchId = useId()
  const tabsId = useId()
  const tabsRef = useRef<HTMLDivElement>(null)

  /* A `role="tablist"` promises arrow keys, and a tablist that does not answer
     them is a worse control than two plain buttons: a screen reader announces
     "tab, 1 of 2" and then the key that is supposed to move between them does
     nothing. G13 holds the product chain in chapter 02 to exactly this, and
     what is true of that tablist is true of this one.

     Both directions are honoured on both axes, and `dir` decides which way is
     forward: this page is Hebrew first, where ArrowLeft moves ON and ArrowRight
     moves BACK, and /en/ is the other way round. Home and End go to the ends. */
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const order: Array<'individual' | 'business'> = ['individual', 'business']
    const rtl = tabsRef.current
      ? getComputedStyle(tabsRef.current).direction === 'rtl'
      : false
    const forward =
      e.key === 'ArrowDown' || (rtl ? e.key === 'ArrowLeft' : e.key === 'ArrowRight')
    const at = order.indexOf(tab)
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? order.length - 1
          : (at + (forward ? 1 : order.length - 1)) % order.length
    setTab(order[next])
    // A tablist moves focus with the selection; otherwise the next arrow press
    // is read against a tab the reader has already left.
    const buttons = tabsRef.current?.querySelectorAll('button')
    buttons?.[next]?.focus()
  }

  const rowByKey = useMemo(
    () => new Map(ladder.rows.map((r) => [r.icon, r])),
    [ladder.rows]
  )

  // The first plan in the catalogue that carries any of the money group. The
  // grey block on the plans below it names that plan rather than hard-coding
  // "פרו", so the sentence cannot go stale when the ladder moves.
  const moneyFrom = useMemo(() => {
    for (let i = 0; i < rows.length; i += 1) {
      if (GROUPS.money.some((k) => rowByKey.get(k)?.cells[i] === true)) return rows[i]?.name ?? ''
    }
    return ''
  }, [rowByKey, rows])

  /** What a card asks for, and where the ask goes.
   *
   *  The card picks from its own PRICE, not from its position, and from
   *  `r.price` rather than the figure on screen — so flipping the billing
   *  switch cannot change what a card asks for and a plan with no self-serve
   *  path can never end up offering the signup button again.
   *
   *  The discriminator is the DOCUMENT COUNT, not the price text. This was
   *  `r.price !== 'ללא עלות'` until 27.08.2026, which is a Hebrew string
   *  literal inside a component that renders two languages: on /en/ the free
   *  plan reads "No charge", failed the comparison, and offered "Talk to us"
   *  over a plan anybody can open themselves.
   *
   *  Every self-serve plan carries a NUMBER of documents (20, 40, 150, 375) and
   *  the one that does not is the one sold in a conversation. That holds in any
   *  locale, because it is a fact about the catalogue rather than the wording.
   */
  const askFor = (r: Row) => {
    const hasAmount = /\d/.test(r.price)
    const contactOnly = !hasAmount && !/\d/.test(r.docs)
    return hasAmount
      ? { label: plansCta.paid, href: ctaHref }
      : contactOnly
        ? { label: plansCta.contact, href: plansCta.contactHref }
        : { label: plansCta.free, href: ctaHref }
  }

  const card = (i: number) => {
    const r = rows[i]
    if (!r) return null
    const face = FACE[i] ?? 'plan-card--plain'
    const tone = face.slice('plan-card--'.length)
    const shown = yearly ? (billing.yearly[i] ?? r.price) : r.price
    const hasAmount = /\d/.test(shown)
    const ask = askFor(r)
    const quota = ui.quota[i]

    // The two derived figures. Only in the yearly term, and only where both
    // catalogues carry a number: a struck total beside "ללא עלות" would be a
    // discount off nothing.
    const monthly = parseAmount(r.price)
    const yearlyShape = parseAmount(billing.yearly[i] ?? '')
    const struck = yearly && monthly ? formatAmount(monthly, monthly.n * 12) : ''
    const saved =
      yearly && monthly && yearlyShape && monthly.n * 12 > yearlyShape.n
        ? formatAmount(monthly, monthly.n * 12 - yearlyShape.n)
        : ''

    const carriesMoney = GROUPS.money.some((k) => rowByKey.get(k)?.cells[i] === true)
      // THE POINTER IS THE STRIP, AND IT IS SAID ONCE. The card carried a
    // `recommendedLabel` pill beside its name as well until 01.09.2026, which
    // is the same claim twice on the same card — "Most popular" on the strip
    // and "Recommended" under it — and on /en/ it was the third pill in a head
    // that then wrapped, dropping פרו's price row 30px below the other three.
    // The word that survives is the strip's, because it is the one the
    // reference puts there and the one that reads at a glance.
    const strip =
      i === RECOMMENDED ? ui.popular : i === BEST_VALUE ? ui.bestValue : ''

    const price = (
      <>
        {struck && (
          <span className="plan-card__was">
            <span className="sr-only">{ui.was}: </span>
            {struck}
          </span>
        )}
        <span
          data-plan-key={r.key}
          data-plan-name={r.name}
          data-plan-price={r.price}
          data-plan-yearly={billing.yearly[i] ?? ''}
          className={`plan-card__price ${hasAmount ? 'ip-fig' : 'plan-card__price--words'}`}
        >
          <Amount value={shown} />
        </span>
        {/* No slash before the term. The reference reads "$29 / month", and this
            catalogue's terms are already prepositional ("לחודש", "per month"),
            so a slash on top of one of them would read "/ per month". */}
        {hasAmount && (
          <span className="plan-card__per">{yearly ? billing.perYear : billing.perMonth}</span>
        )}
      </>
    )

    return (
      <RevealItem
        key={r.key}
        className={`plan-slot plan-slot--${tone} ${strip ? 'plan-slot--pointed' : ''}`}
      >
        {/* The strip on the card's own edge. It keeps its height on the cards
            that say nothing in it, so four heads sit on one line. */}
        <span className={`plan-slot__strip ${strip ? '' : 'plan-slot__strip--blank'}`}>
          {strip}
        </span>

        <div className={`plan-card ${face}`} data-picked={picked === i ? 'true' : 'false'}>
          <div className="plan-card__head">
            {/* The phone's select circle, and the reason it is a BUTTON and
                `display: none` above 768px rather than an always-present radio
                hidden by CSS: a `display: none` control is out of the
                accessibility tree and out of the tab order, so a desktop reader
                is never offered a selector for a list that has no single action
                to follow it. Its box is 2.75rem even though the ring is 1.35rem
                — G16 holds every target on this page to 44px. */}
            <button
              type="button"
              className="plan-pick"
              aria-label={ui.selectLabel.replace('{name}', r.name)}
              aria-pressed={picked === i}
              onClick={() => setPicked(i)}
            >
              <span className="plan-pick__dot" aria-hidden="true">
                <Check className="size-3" strokeWidth={3} />
              </span>
            </button>

            <span className="plan-card__headtext">
              <span className="plan-card__title-row">
                <h3 className="plan-card__name">{r.name}</h3>
                {/* THE DISCOUNT PILL, ON THE CARD. Owner, third pass of
                    01.09.2026: the saving was riding the billing switch, where
                    it says something about the control rather than about any
                    plan. The reference puts it beside the plan's NAME — `20%
                    OFF` on PLUS, `18% OFF` on TEAM — and so does this now.

                    It is dropped below 768px by CSS: the phone's price chip
                    already shows the struck figure over the live one, and a
                    third pill in a head that is three lines deep was the
                    difference between a tight card and a cramped one. */}
                {hasAmount && yearly && (
                  <span
                    className="plan-card__badge plan-card__badge--save"
                    data-plan-save={billing.saveLabel}
                  >
                    {billing.saveLabel}
                  </span>
                )}
              </span>
              <p className="plan-card__who">{r.who}</p>
            </span>

            {/* The phone's price chip, at the far edge of the head. Same figures
                as the block below and the same `data-plan-*` contract is NOT
                repeated here: one card publishes the catalogue once. */}
            <span className="plan-card__chip" aria-hidden="true">
              {struck && <span className="plan-card__was">{struck}</span>}
              <span className={`plan-card__price ${hasAmount ? '' : 'plan-card__price--words'}`}>
                {shown}
              </span>
              {hasAmount && (
                <span className="plan-card__per">{yearly ? billing.perYear : billing.perMonth}</span>
              )}
            </span>
          </div>

          {/* The quota panel — the first of the three groups. The figures in it
              are the ladder's documents, users and branches rows, written out in
              the dictionaries rather than composed: Hebrew agrees a noun with
              its number, so a template prints "1 משתמשים פעילים" on the first
              card in the row. `data-plan-docs` rides the panel because G14 reads
              the published quota off the card as an attribute, never as text. */}
          {quota && (
            <div className="plan-quota" data-plan-docs={r.docs}>
              <p className="plan-quota__head">
                <Sparkles className="plan-quota__glyph size-4" strokeWidth={1.8} aria-hidden="true" />
                {quota.head}
              </p>
              <ul className="plan-quota__lines">
                {quota.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="plan-quota__chip">
                <Check className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
                {quota.chip}
              </p>
            </div>
          )}

          <p className="plan-card__pricing">{price}</p>
          <p className="plan-card__billed">
            {hasAmount ? (yearly ? billing.billedYearly : billing.billedMonthly) : ' '}
          </p>

          <div className="plan-card__action">
            <Cta href={ask.href} variant={i === RECOMMENDED ? 'primary' : 'ghost'} size="sm" block>
              {ask.label}
            </Cta>
          </div>

          <p className="plan-card__save">
            {saved ? (
              <>
                {ui.save.split('{n}')[0]}
                <b>{saved}</b>
                {ui.save.split('{n}')[1]}
              </>
            ) : yearly && hasAmount ? (
              ui.saveNone
            ) : (
              ' '
            )}
          </p>

          {/* The work block. */}
          <div className="plan-block">
            <div className="plan-block__head">
              <Lock className="size-3.5" strokeWidth={2} aria-hidden="true" />
              <span className="plan-block__title">{ui.blockWork}</span>
            </div>
            <p className="plan-block__note">{ui.blockWorkNote}</p>
            <ul className="plan-block__rows">
              {GROUPS.work.map((k) => {
                const row = rowByKey.get(k)
                if (!row) return null
                return (
                  <BlockRow key={k} cell={row.cells[i] ?? false} label={row.label} tag={ui.introTag} />
                )
              })}
            </ul>
          </div>

          {/* The money block: blue where the plan carries it, and the grey twin
              where it carries none of it — the reference's own two states, and
              the grey one names the plan the group opens on. */}
          <div className={`plan-block ${carriesMoney ? 'plan-block--money' : 'plan-block--none'}`}>
            <div className="plan-block__head">
              <Wallet className="size-3.5" strokeWidth={2} aria-hidden="true" />
              <span className="plan-block__title">
                {carriesMoney ? ui.blockMoney : ui.blockMoneyNone}
              </span>
            </div>
            <p className="plan-block__note">
              {carriesMoney
                ? ui.blockMoneyNote
                : ui.blockMoneyFrom.replace('{name}', moneyFrom)}
            </p>
            <ul className="plan-block__rows">
              {GROUPS.money.map((k) => {
                const row = rowByKey.get(k)
                if (!row) return null
                return (
                  <BlockRow key={k} cell={row.cells[i] ?? false} label={row.label} tag={ui.introTag} />
                )
              })}
            </ul>
          </div>

          {/* THE WHOLE LADDER, ON A PHONE, IS HERE.
              The two blocks above are closed below 768px and this is opened in
              their place: the same fifteen rows the table carries, for this
              card's plan only, behind a press. Both shapes are in the markup at
              every width — what a plan includes is this page's most quoted fact
              and it is answered here in two shapes rather than moved between
              them, so a crawler reading either one reads the whole catalogue.

              THE CLASS NAMES ARE A CONTRACT. scripts/check-live-catalogue.mjs
              opens every `.plan-card__more` on a 390px page and asserts the
              `.plan-card__ladder` inside it draws real rows against the live
              database; that is how "a plan is unreadable on a phone" gets
              caught, and it is why this survived a rebuild that removed the
              flat list it used to sit under. */}
          <details className="plan-card__more">
            <summary aria-label={`${ladder.moreLabel}: ${r.name}`}>
              <span className="plan-card__more-shut">{ladder.moreLabel}</span>
              <span className="plan-card__more-open">{ui.hideLabel}</span>
              <ChevronDown className="plan-card__more-chevron size-4" aria-hidden="true" />
            </summary>
            <ul className="plan-card__ladder">
              {ladder.rows.map((row) => {
                const cell = row.cells[i]
                return (
                  <li
                    key={row.label}
                    data-ladder-plan={r.key}
                    data-ladder-key={row.icon}
                    data-ladder-value={String(cell)}
                  >
                    <span>{row.label}</span>
                    {cell === true ? (
                      <span className="plan-card__ladder-yes">
                        <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                        <span className="sr-only">{ladder.included}</span>
                      </span>
                    ) : cell === false || cell === 'intro' ? (
                      <span className="plan-card__ladder-no">
                        <Minus className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                        <span className="sr-only">{ladder.absent}</span>
                      </span>
                    ) : (
                      <span className="plan-card__ladder-num ip-fig">{cell}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </details>
        </div>
      </RevealItem>
    )
  }

  const pickedRow = rows[picked] ?? rows[RECOMMENDED]
  const pickedAsk = pickedRow ? askFor(pickedRow) : null

  return (
    <section id="plans" data-folio={folio} className="py-[clamp(4rem,10vh,7rem)]">
      <div className="wrap">
        <header className="mx-auto max-w-[46rem] text-center">
          <SplitHeading className="h-big text-center" text={h2} />
          <Reveal delay={0.08}>
            <p className="lede mx-auto mt-4">{lede}</p>
          </Reveal>
        </header>

        <Reveal delay={0.12}>
          <div className="plans-head">
            {/* The two audiences. A real tablist: two `tab`s naming two
                `tabpanel`s, so the arrow keys and the screen reader both get
                what the two buttons look like they are. */}
            <div
              className="plans-tabs"
              role="tablist"
              aria-label={ui.tabsLabel}
              ref={tabsRef}
              onKeyDown={onTabKey}
            >
              <button
                type="button"
                role="tab"
                id={`${tabsId}-t1`}
                aria-selected={tab === 'individual'}
                aria-controls={`${tabsId}-p1`}
                tabIndex={tab === 'individual' ? 0 : -1}
                className="plans-tabs__tab"
                onClick={() => setTab('individual')}
              >
                {ui.tabIndividual}
              </button>
              <button
                type="button"
                role="tab"
                id={`${tabsId}-t2`}
                aria-selected={tab === 'business'}
                aria-controls={`${tabsId}-p2`}
                tabIndex={tab === 'business' ? 0 : -1}
                className="plans-tabs__tab"
                onClick={() => setTab('business')}
              >
                {ui.tabBusiness}
              </button>
            </div>

            {/* THE REFERENCE'S TOGGLE, since the owner's second pass on
                01.09.2026: the two terms sit OUTSIDE a small switch rather than
                inside a segmented pill, which is what the screenshot draws and
                what he asked for by pointing at it.

                Still ONE control with two states, so it is still one
                `role="switch"`: the two words are labels on those states rather
                than controls of their own, they stay out of the accessibility
                tree, and the button carries the name. The thumb travels on a
                MARGIN and not on a translate, so it moves toward the inline end
                in either reading direction.

                IT IS NOT DRAWN IN THE BUSINESS TAB. That plan is priced in a
                conversation and has no monthly or yearly figure for a switch to
                move between, so a control offering to change its term was
                offering something that does not exist. */}
            {tab === 'individual' && (
              <div className="plans-switch">
                <span className={`plans-switch__word ${yearly ? '' : 'is-on'}`} aria-hidden="true">
                  {billing.monthlyLabel}
                </span>
                <button
                  type="button"
                  id={switchId}
                  role="switch"
                  aria-checked={yearly}
                  aria-label={billing.switchLabel}
                  className="plans-switch__track"
                  onClick={() => setYearly((v) => !v)}
                >
                  <span className="plans-switch__rail" aria-hidden="true">
                    <span className="plans-switch__thumb" />
                  </span>
                </button>
                <span className={`plans-switch__word ${yearly ? 'is-on' : ''}`} aria-hidden="true">
                  {billing.yearlyLabel}
                </span>
                {/* THE CLAIM STAYS HERE; THE CHIP MOVED TO THE CARDS.
                    `check-live-catalogue` divides the live yearly amount by
                    twelve monthly ones and holds this line to the answer, and
                    it finds the claim through `data-plan-save` rather than
                    through the layout — so the sentence has to remain published
                    at every moment, including the monthly term, where no card
                    draws its pill.

                    `sr-only` and not `hidden`: a reader on a screen reader
                    arriving at the switch is told what the other term is worth,
                    which is the one place that sentence is useful before a
                    single card has been read. */}
                <span className="sr-only" data-plan-save={billing.saveLabel}>
                  {billing.saveLabel}
                </span>
              </div>
            )}
          </div>
        </Reveal>

        {/* BOTH PANELS ARE IN THE MARKUP AT EVERY WIDTH, and the closed one is
            `hidden` rather than unmounted. The catalogue is five plans whichever
            tab a reader is on: G14 counts five `[data-plan-name]` on this page,
            G17 crawls all five, and a search engine indexes the ביזנס plan
            without pressing anything. */}
        <div
          role="tabpanel"
          id={`${tabsId}-p1`}
          aria-labelledby={`${tabsId}-t1`}
          hidden={tab !== 'individual'}
        >
          <RevealGroup
            className="plans-tray mt-[clamp(1.5rem,4vh,2.25rem)] grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4"
            each={0.06}
            aria-label={tableLabel}
          >
            {INDIVIDUAL.map((i) => card(i))}
          </RevealGroup>

          {/* The phone's one action, following the selection. Drawn below 768px
              only; above it every card carries its own. */}
          {/* The action carries the SELECTED card's colour, not the page's.
              Every accent in this chapter is keyed to `--plan-accent`.

              A `data-face` ATTRIBUTE AND NOT THE FACE CLASS. The class was the
              obvious way to say it and it was wrong: a face declares the card's
              own `background-color` and `background-image` as well as its
              accent, so putting it on this wrapper painted the card's slate
              behind a cream button — the block the owner circled on the phone,
              01.09.2026. The attribute carries only the two variables. */}
          {pickedRow && pickedAsk && (
            <div className="plans-pinned" data-face={(FACE[picked] ?? '').slice('plan-card--'.length)}>
              <Cta href={pickedAsk.href} variant="primary" block>
                {pickedAsk.label} · {pickedRow.name}
              </Cta>
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          id={`${tabsId}-p2`}
          aria-labelledby={`${tabsId}-t2`}
          hidden={tab !== 'business'}
        >
          <RevealGroup
            className="plans-tray plans-tray--business mt-[clamp(1.5rem,4vh,2.25rem)] grid items-stretch gap-3"
            each={0.06}
            aria-label={ui.tabBusiness}
          >
            {BUSINESS.map((i) => card(i))}
          </RevealGroup>
        </div>

        {/* The comparison, behind a press since this round. A real <table>,
            because it is one: a reader on a screen reader gets the row and the
            column read back with the cell, which a grid of <div>s cannot give
            them. It scrolls inside its own box on a narrow screen rather than
            widening the page. */}
        <Reveal delay={0.1}>
          <details className="plans-compare">
            <summary>
              <Table2 className="size-4" strokeWidth={1.9} aria-hidden="true" />
              <span>{ui.compareOpen}</span>
              <ChevronDown className="plans-compare__chevron size-4" aria-hidden="true" />
            </summary>
            <div className="plans-compare__box">
              <div className="plans-compare__scroll">
                <table className="plans-compare__table">
                  <caption className="sr-only">{ladder.compareLabel}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{ladder.featuresHeader}</th>
                      {/* Each name sits in a chip cut from its card's face, so a
                          column is identifiable without reading it. The chip is
                          what is coloured and the type on it is not, so the ink
                          stays a solid, measurable colour on a ground that keeps
                          still. */}
                      {rows.map((r, i) => (
                        <th
                          key={r.key}
                          scope="col"
                          className={`is-${(FACE[i] ?? '').slice('plan-card--'.length)}`}
                        >
                          <span className="plans-compare__chip">
                            <span className="plans-compare__chip-name">{r.name}</span>
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ladder.rows.map((row) => {
                      const RowIcon = ROW_ICONS[row.icon] ?? Check
                      return (
                        <tr key={row.label}>
                          <th scope="row">
                            <span className="plans-compare__row">
                              <span className="plans-compare__glyph" aria-hidden="true">
                                <RowIcon className="size-[1.05rem]" strokeWidth={1.7} />
                              </span>
                              <span>{row.label}</span>
                            </span>
                          </th>
                          {row.cells.map((cell, i) => (
                            <td
                              key={rows[i]?.key ?? i}
                              className={`is-${(FACE[i] ?? '').slice('plan-card--'.length)}`}
                              data-ladder-plan={rows[i]?.key ?? ''}
                              data-ladder-key={row.icon}
                              data-ladder-value={String(cell)}
                            >
                              {/* `'intro'` DRAWS AS ABSENT here, like `false`.
                                  Owner, 28.08.2026: the free column should say
                                  what the free plan gets, and five cells reading
                                  "30-day introduction" is not that. The fact is
                                  kept in the data, stated in words in the note
                                  under this table, and drawn on the free card
                                  itself as a tick with a chip beside it. */}
                              {cell === true ? (
                                <>
                                  <span className="plans-compare__yes">
                                    <Check className="size-3.5" strokeWidth={2.5} />
                                  </span>
                                  <span className="sr-only">{ladder.included}</span>
                                </>
                              ) : cell === false || cell === 'intro' ? (
                                <>
                                  <span className="plans-compare__no" aria-hidden="true">
                                    <Minus className="size-3.5" strokeWidth={2.5} />
                                  </span>
                                  <span className="sr-only">{ladder.absent}</span>
                                </>
                              ) : (
                                <span className="plans-compare__num">{cell}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </Reveal>

        <Reveal delay={0.06} className="plans__notes mt-5">
          <p className="cap">{ladder.introNote}</p>
          <Html html={priceNote} className="plans__prices cap" />
          <p className="cap">{note}</p>
        </Reveal>
      </div>
    </section>
  )
}
