// The page, as one function of a dictionary.
//
// Real HTML: real headings, real reading order, real text in the document.
// Nothing here is rendered at runtime; surface.js only drives state that
// already has markup behind it.
//
// The score (live-surface grammar, 11 acts, 12.34 viewport-heights measured):
//
//    0  cold open      pin      1.5   the surface is already running, already wrong
//    1  price list     flow           the rate the whole journey is measured against
//    2  order          count          the commitment becomes a number
//    3  receiving      reveal         reality gets a vote
//    4  invoice        flow           the gap
//    5  the held line  reveal         the inhale. one sentence, one screen
//    6  the sorter     pin      2.9   THE PEAK
//    7  roles          pointer        the boundary, under the hand
//    8  payment        flow           paid once, matched, receipted
//    9  what is open   reveal         the honesty beat
//   10  close          pin      1.3   the ledger, then the invitation
//
// Five device families, none twice in a row, zero scrub. G5 measures this from
// the rendered DOM, so this comment is the intent and the gate is the record.

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Deterministic scatter for the peak. A fixed seed, so two builds of the same
// content produce the same composition and a screenshot diff means something.
function scatter(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const MARK = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <rect width="32" height="32" rx="7" fill="currentColor"/>
  <path d="M9 9h6v6H9zM17 17h6v6h-6zM17 9h6v3h-6zM9 17h3v6H9z" fill="var(--canvas)"/>
</svg>`

export function render(t) {
  const money = (n) => t.fmtMoney(n)

  // ---- chrome: the station rail, which is also the money's track ----------
  const rail = `
<nav class="rail" aria-label="${esc(t.a11y.railNav)}">
  <a class="rail__mark" href="#top">${MARK}<span>${esc(t.brand.name)}</span></a>
  <p class="rail__head">${esc(t.chrome.railLabel)}</p>
  <div class="rail__track" data-track>
    <span class="rail__line" aria-hidden="true"></span>
    ${t.stations
      .map(
        (s, i) => `
    <a class="rail__stop" href="#${s.id}" data-stop="${s.id}" data-index="${i}">
      <span class="rail__dot" aria-hidden="true"></span>
      <span>${esc(s.nav)}</span>
      <span class="rail__skip">${esc(t.chrome.skipBadge)}</span>
    </a>`
      )
      .join('')}
    <span class="token" data-token aria-hidden="true">
      <span class="token__glyph">₪</span><span data-token-amount>—</span>
    </span>
  </div>
</nav>`

  const statusbar = `
<div class="statusbar" role="status" aria-live="polite">
  <span class="statusbar__group">
    <span class="statusbar__label">${esc(t.chrome.amountLabel)}</span>
    <span class="statusbar__value num" data-status-amount>—</span>
  </span>
  <span class="statusbar__sep" aria-hidden="true"></span>
  <span class="statusbar__group statusbar__hideable">
    <span class="statusbar__label">${esc(t.chrome.statusLabel)}</span>
    <span class="statusbar__value" data-status-entity>${esc(t.chrome.entity)}</span>
  </span>
  <span class="statusbar__sep statusbar__hideable" aria-hidden="true"></span>
  <span class="statusbar__group statusbar__hideable">
    <span class="statusbar__label">${esc(t.chrome.velocity)}</span>
    <span class="statusbar__value" data-status-velocity>${esc(t.chrome.velocityCalm)}</span>
  </span>
  <span class="statusbar__spacer"></span>
  <span class="chip-demo statusbar__hideable" title="${esc(t.brand.demoTitle)}">${esc(t.brand.demoChip)}</span>
  <button type="button" class="ledger-toggle" data-ledger-toggle aria-expanded="false" aria-controls="ledger">
    <span>${esc(t.chrome.ledgerOpen)}</span>
    <span class="ledger-toggle__count num" data-ledger-count>0</span>
  </button>
</div>

<aside class="ledger" id="ledger" data-ledger hidden>
  <h2 class="ledger__title">${esc(t.chrome.ledgerTitle)}</h2>
  <p class="ledger__empty" data-ledger-empty>${esc(t.chrome.ledgerEmpty)}</p>
  <ol class="ledger__list" data-ledger-list></ol>
</aside>`

  // ---- act 0 · cold open · pin -------------------------------------------
  const act0 = `
<section class="act" id="top" data-sc-act="pin" data-sc-span="1.5" data-station="pricelist">
  <div class="stagehold" data-sc-stage>
    <div class="wrap">
      <div class="open__grid">
        <article class="card">
          <div class="card__head">
            <h1 class="card__title">${esc(t.open.screenTitle)}</h1>
            <span class="card__meta">${esc(t.open.screenSub)}</span>
          </div>
          <ul class="open__rows">
            ${t.open.rows
              .map(
                (r, i) => `
            <li data-sc-cue="${
              // Row one greets: the landing view every visitor sees must not be
              // waiting for a cue to ramp. The rest arrive as the surface
              // works through its queue, and all three close before the act
              // un-pins so nothing is still lit over the section below.
              i === 0 ? '0 1 0 0' : i === 1 ? '0.16 1 0.22 0' : '0.34 1 0.22 0'
            }">
              <span class="open__ref">${esc(r.ref)}</span>
              <span class="open__note">${esc(r.note)}</span>
              <span class="open__val"><span class="money num${
                r.state === 'alert' ? ' money--alert' : ''
              }">${esc(r.value)}</span></span>
            </li>`
              )
              .join('')}
          </ul>
          <p class="open__foot">${esc(t.open.footnote)}</p>
        </article>

        <article class="card card--dark">
          <div class="card__head"><h2 class="card__title">${esc(t.open.helpTitle)}</h2></div>
          <div class="card__body">
            <p class="help__body">${esc(t.open.helpBody)}</p>
            <div class="help__actions">
              <a class="btn" href="${esc(t.ctaHref)}">${esc(t.cta)}</a>
            </div>
            <p class="ctanote">${esc(t.ctaNote)}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>`

  // ---- act 1 · price list · flow + in ------------------------------------
  const pl = t.pricelist
  const act1 = `
<section class="act act--flow" id="pricelist" data-ground="paper" data-sc-act="flow" data-station="pricelist">
  <div class="wrap stack">
    <div class="stack__head" data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(pl.title)}</h2>
      <p class="lede">${esc(pl.body)}</p>
    </div>
    <article class="card" data-sc-in>
      <div class="card__head"><h3 class="card__title">${esc(pl.tableCaption)}</h3></div>
      <div class="tblwrap">
        <table class="tbl">
          <thead><tr>${pl.cols.map((c, i) => `<th scope="col"${i === 1 ? ' class="cell-end"' : ''}>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${pl.rows
              .map(
                (r) => `
            <tr>
              <td class="cell-key">${esc(r.item)}</td>
              <td class="cell-end"><span class="num">${esc(r.price)}</span></td>
              <td><span class="num">${esc(r.until)}</span></td>
              <td><span class="pill" data-state="${r.state}">${esc(r.stateLabel)}</span></td>
            </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </article>
  </div>
</section>`

  // ---- act 2 · the order · count -----------------------------------------
  const o = t.order
  const act2 = `
<section class="act act--flow" id="order" data-sc-act="flow" data-station="order">
  <div class="wrap solo">
    <div data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(o.title)}</h2>
      <p class="lede">${esc(o.body)}</p>
    </div>
    <article class="card" data-sc-in>
      <div class="card__head"><h3 class="card__title">${esc(o.lineLabel)}</h3></div>
      <div class="calc">
        <p class="calc__row"><span>${esc(o.qty)}</span> <span aria-hidden="true">${esc(o.times)}</span> <b class="num">${esc(t.stations[0].unit)}</b></p>
        <hr class="calc__rule">
        <p class="calc__total">
          <span>${esc(o.total)}</span>
          <b class="num" data-sc-count="0 ${esc(t.countTarget)}" data-sc-count-at="0.32 0.66">0</b>
        </p>
      </div>
    </article>
    <p class="note" data-sc-in>${esc(o.note)}</p>
  </div>
</section>`

  // ---- act 3 · receiving · reveal ----------------------------------------
  const rc = t.receiving
  const act3 = `
<section class="act act--flow" id="receiving" data-ground="paper" data-sc-act="flow" data-station="receiving">
  <div class="wrap two">
    <div data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(rc.title)}</h2>
      <p class="lede">${esc(rc.body)}</p>
      <p class="note">${esc(rc.aside)}<br><span class="num">${esc(rc.asideExample)}</span></p>
    </div>
    <article class="card">
      <div class="card__head"><h3 class="card__title">${esc(rc.counterTitle)}</h3></div>
      <div class="match" data-sc-reveal="up" data-sc-reveal-at="0.14 0.5">
        <div class="match__pair">
          <span class="match__side">
            <span class="match__k">${esc(rc.ordered)}</span>
            <span class="match__v num">160</span>
          </span>
          <span class="match__op" aria-hidden="true">=</span>
          <span class="match__side">
            <span class="match__k">${esc(rc.received)}</span>
            <span class="match__v num">160</span>
          </span>
        </div>
        <p><span class="pill" data-state="done">${esc(rc.match)}</span></p>
      </div>
    </article>
  </div>
</section>`

  // ---- act 4 · the invoice · flow, and the silence before the peak --------
  const iv = t.invoice
  const act4 = `
<section class="act act--flow" id="invoice" data-sc-act="flow" data-station="invoice">
  <div class="wrap two two--flip">
    <div data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(iv.title)}</h2>
      <p class="lede">${esc(iv.body)}</p>
    </div>
    <article class="card" data-sc-in>
      <div class="card__head">
        <h3 class="card__title">${esc(t.stations[3].title)}</h3>
        <span class="card__meta">${esc(t.stations[3].ref)}</span>
      </div>
      <div class="gap">
        <div class="gap__two">
          <p class="gap__cell">
            <span class="gap__k">${esc(iv.ordered)}</span>
            <span class="gap__v num">${esc(money(6384))}</span>
          </p>
          <p class="gap__cell gap__cell--alert">
            <span class="gap__k">${esc(iv.billed)}</span>
            <span class="gap__v num">${esc(money(7624))}</span>
          </p>
        </div>
        <p class="gap__delta">
          <span>${esc(iv.gap)} <span class="num">(${esc(iv.gapPct)})</span></span>
          <b class="num">${esc(iv.gapValue)}</b>
        </p>
        <p class="hold"><span class="pill" data-state="alert">${esc(iv.holdBadge)}</span><span>${esc(iv.hold)}</span></p>
      </div>
    </article>
  </div>
</section>
<section class="act act--flow act--quiet" data-ground="wash" data-sc-act="flow" data-station="invoice">
  <!-- The held line is wiped into view rather than faded. A fade is what every
       other beat on the page does; an uncovering is the quietest way to put one
       sentence on a screen and still have it read as authored. The reveal sits
       on a wrapper so the clip cannot eat the type's own descenders. -->
  <div class="wrap">
    <div data-sc-reveal="up" data-sc-reveal-at="0.18 0.58">
      <p class="lede lede--held">${esc(iv.holdNote)}</p>
    </div>
  </div>
</section>`

  // ---- act 5 · THE PEAK · pin --------------------------------------------
  const so = t.sort
  const rand = scatter(20260825)
  const docs = so.docs
    .slice()
    // exception first in the settled list: what needs a decision goes to the top
    .sort((a, b) => (b.exception ? 1 : 0) - (a.exception ? 1 : 0))
    .map((d, i) => {
      // Settled grid: two columns, exception in the first slot, which is where
      // the product itself puts what needs a decision.
      const col = i % 2
      const row = Math.floor(i / 2)
      const sx = (rand() - 0.5) * 0.58
      const sy = (rand() - 0.5) * 0.72
      const sr = (rand() - 0.5) * 15
      return `
      <article class="doc${d.exception ? ' doc--exception' : ''}"
        style="--row:${row};--col:${col};--sx:${sx.toFixed(3)};--sy:${sy.toFixed(3)};--sr:${sr.toFixed(1)}">
        <span class="doc__ref">${esc(d.ref)}</span>
        <span class="doc__kind">${esc(d.kind)}</span>
        <span class="doc__match">${esc(d.exception ? so.stateException : d.match)}</span>
      </article>`
    })
    .join('')

  const act5 = `
<section class="act act--shell on-shell" id="decision" data-sc-act="pin" data-sc-span="2.9" data-station="decision">
  <div class="stagehold" data-sc-stage data-sorter>
    <div class="wrap">
      <!-- The heading holds through the whole sort. Letting it fade at a third
           left the reader watching unlabelled cards move for a viewport and a
           half, which is when a peak stops reading as a point being made. -->
      <p class="eyebrow" data-sc-cue="0 0.66 0 0.12">${esc(so.kicker)}</p>
      <h2 class="h" data-sc-cue="0 0.7 0 0.12">${esc(so.title)}</h2>
      <p class="lede" data-sc-cue="0.04 0.46 0.06 0.3">${esc(so.body)}</p>

      <div class="sorter" data-stage>${docs}</div>

      <div class="peakfoot" data-sc-cue="0.62 1 0.1 0.02">
        <span class="peakstat"><b class="num">${esc(so.resolvedCount)}</b><span>${esc(so.resolved)}</span></span>
        <span class="peakstat"><b class="num">1</b><span>${esc(so.exceptionTitle)}</span></span>
        <span class="peakstat"><span class="pill" data-state="alert">${esc(so.exceptionNote)}</span></span>
      </div>
      <p class="note" data-sc-cue="0.72 1 0.08 0.02">${esc(so.closing)}</p>
    </div>
  </div>
</section>`

  // ---- act 6 · the roles · pointer ---------------------------------------
  const ro = t.roles
  const act6 = `
<section class="act act--flow" id="request" data-ground="paper" data-sc-act="flow" data-station="request">
  <div class="wrap">
    <div data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(ro.title)}</h2>
      <p class="lede">${esc(ro.body)}</p>
      <p class="note"><span>${esc(ro.amountLabel)}</span> <span class="money num">${esc(ro.amount)}</span></p>
    </div>
    <div class="roles" data-sc-in data-sc-stagger="60">
      ${ro.items
        .map(
          (r) => `
      <article class="card" data-sc-tilt="6">
        <div class="card__body" style="padding-block-start:1.15rem">
          <h3 class="role__name">${esc(r.name)}</h3>
          <ul class="role__list">
            <li><span class="role__k" data-k="can">${esc(ro.can)}</span><span>${esc(r.can)}</span></li>
            <li><span class="role__k" data-k="cannot">${esc(ro.cannot)}</span><span>${esc(r.cannot)}</span></li>
          </ul>
        </div>
      </article>`
        )
        .join('')}
    </div>
    <p class="note" data-sc-in>${esc(ro.note)}</p>
  </div>
</section>`

  // ---- act 7 · payment and bank · flow -----------------------------------
  const st = t.settle
  const act7 = `
<section class="act act--flow" id="payment" data-sc-act="flow" data-station="payment">
  <div class="wrap stack">
    <div class="stack__head" data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(st.title)}</h2>
      <p class="lede">${esc(st.body)}</p>
    </div>
    <article class="card" data-sc-in>
      <ul class="steps">
        ${st.steps
          .map(
            (s) => `
        <li>
          <span class="steps__k">${esc(s.label)}</span>
          <span class="money num">${esc(s.value)}</span>
          <span class="pill" data-state="${s.state}">${esc(t.doneLabel)}</span>
        </li>`
          )
          .join('')}
      </ul>
    </article>
  </div>
</section>

<!-- act 7b · what is still open · reveal. The honesty beat: a system that
     rounded its own corners to look finished would be lying about money. -->
<section class="act act--flow" id="bank" data-ground="paper" data-sc-act="flow" data-station="bank">
  <div class="wrap two two--flip">
    <div data-sc-in data-sc-stagger="70">
      <h2 class="h">${esc(st.openTitle)}</h2>
      <p class="lede">${esc(st.openNote)}</p>
    </div>
    <article class="card" data-sc-reveal="up" data-sc-reveal-at="0.16 0.54">
      <ul class="steps">
        ${st.openRows
          .map(
            (r) => `
        <li>
          <span class="steps__k">${esc(r.label)}</span>
          <span class="money num${r.state === 'alert' ? ' money--alert' : ''}">${esc(r.value)}</span>
          <span class="pill" data-state="${r.state}">${esc(r.state === 'alert' ? t.blockedLabel : t.openLabel)}</span>
        </li>`
          )
          .join('')}
      </ul>
    </article>
  </div>
</section>`

  // ---- act 8 · the close · pin + a real input ----------------------------
  const cl = t.close
  const act8 = `
<section class="act act--shell on-shell" id="close" data-sc-act="pin" data-sc-span="1.3">
  <div class="stagehold" data-sc-stage>
    <div class="wrap">
      <div class="close__grid">
        <div data-sc-cue="0.04">
          <h2 class="h">${esc(cl.title)}</h2>
          <p class="lede">${esc(cl.body)}</p>
          <ol class="recap" data-recap></ol>
          <p class="note" data-recap-note>${esc(cl.cleanNote)}</p>
        </div>
        <form class="trial" data-sc-cue="0.04" action="${esc(t.ctaHref)}" method="get">
          <h3 class="h--sm" style="color:var(--shell-ink)">${esc(cl.trialTitle)}</h3>
          <label class="trial__label" for="trial-email">${esc(cl.trialLabel)}</label>
          <div class="trial__field">
            <input id="trial-email" name="email" type="email" inputmode="email"
                   autocomplete="email" placeholder="${esc(cl.trialPlaceholder)}" required>
            <button class="btn" type="submit">${esc(t.cta)}</button>
          </div>
          <p class="ctanote">${esc(cl.trialHelp)}</p>
          <p class="ctanote">${esc(t.ctaNote)}</p>
        </form>
      </div>

      <footer class="foot">
        <span>${esc(t.foot.product)}</span>
        <a href="${esc(t.foot.appHref)}">${esc(t.foot.app)}</a>
        <a href="${esc(t.foot.appHref)}/legal/terms">${esc(t.foot.terms)}</a>
        <a href="${esc(t.foot.appHref)}/legal/privacy">${esc(t.foot.privacy)}</a>
        <span class="foot__claims">${esc(t.foot.claims)}</span>
      </footer>
    </div>
  </div>
</section>`

  const alt = t.alternates
    .map(
      (a) =>
        `<link rel="alternate" hreflang="${a.code}" href="${esc(a.href)}">`
    )
    .join('\n')

  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<meta property="og:title" content="${esc(t.meta.title)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0a171d">
${alt}
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%230a171d'/><path d='M9 9h6v6H9zM17 17h6v6h-6zM17 9h6v3h-6zM9 17h3v6H9z' fill='%23f4f5f3'/></svg>">
<link rel="preload" href="assets/fonts/NotoSansHebrew-Hebrew.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="engine/scrollcraft.css">
<link rel="stylesheet" href="site.css">
</head>
<body>
<a class="skip" href="#top">${esc(t.a11y.skip)}</a>
${rail}
<main class="page">
${act0}
${act1}
${act2}
${act3}
${act4}
${act5}
${act6}
${act7}
${act8}
</main>
${statusbar}
<script src="engine/scrollcraft.js"></script>
<script src="surface.js"></script>
<script>
  ScrollCraft.mount(document.body);
  InPlaceSurface.mount(${JSON.stringify({
    stations: t.stations.map((s) => ({
      id: s.id,
      nav: s.nav,
      amount: s.amount,
      state: s.state,
      ledger: s.ledger,
    })),
    strings: {
      ledgerOpen: t.chrome.ledgerOpen,
      ledgerClose: t.chrome.ledgerClose,
      velocityCalm: t.chrome.velocityCalm,
      velocityFast: t.chrome.velocityFast,
      skipLine: t.chrome.skipLine,
      cleanNote: t.close.cleanNote,
      skippedNote: t.close.skippedNote,
      dash: '—',
    },
    locale: t.intlLocale,
    currency: 'ILS',
  })});
</script>
</body>
</html>
`
}
