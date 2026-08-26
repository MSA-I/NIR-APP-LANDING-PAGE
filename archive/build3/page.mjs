// Build 3 — `inplace-folio`. Chaptered editorial.
//
// The page is a printed feature with three chapters and a title page. Chapters
// are the unit; there are no acts anywhere except chapter 01, which is the one
// chapter allowed a scrub under this grammar.
//
// The engine owns exactly one thing here: the film in chapter 01. Everything
// else is ordinary document flow, because a chaptered page IS ordinary document
// flow — that is the whole difference from build 2, which had no flow at all.

import NAV from '../data/demo-nav.json' with { type: 'json' }

// Which item of the product's own top nav opens which step. Measured, not
// guessed: scripts/capture-demo.mjs reads the boxes off the running app, and
// the owner's nav sits ~2% further along than the buyer's, so a single
// hand-placed set of hotspots would drift on two of the five screens.
//
// The measurement is a distance from the LEFT edge; the page is RTL and places
// the hotspots from the inline-start edge, which is the right one. So the two
// are converted, not copied: 100 - (x + w). Copied straight across, every
// hotspot lands mirrored, which is what the first cut of this did.
const NAV_STEP = {
  'הזמנות': 0, 'קבלה': 1, 'חשבוניות': 2, 'בקרה': 3, 'ניהול': 4,
}

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// Copy is authored in this repo with <b>, <em> and &nbsp; allowed, so it goes
// through unescaped on purpose. None of it is user input.
const raw = (s) => String(s)

// Built by scripts/build-film.mjs. 663 frames at 24fps = 27.63s: the stack
// standing, leaning and coming down; the two contradicting numbers lighting up
// on the fallen pages; the lift off the floor toward the lit thing in the dark;
// and a dissolve that lands on the real dashboard filling the whole frame,
// which is where the film hands the page over to the screenshots.
//
// Paced at build 2's measured 0.215 viewport-heights per second of film.
const FILM_SPAN = 5.9

export function render(t) {
  const rtl = t.dir === 'rtl'

  const index = t.title_page.index.map((c) => `
            <li class="index__row">
              <span class="index__n">${esc(c.n)}</span>
              <span class="index__t">${esc(c.t)}</span>
              <span class="index__d">${esc(c.d)}</span>
            </li>`).join('')

  // Each block gets its own slot. The slot is what gives the sticky block a
  // containing block of exactly one quarter of the act: a sticky grid item
  // clamps against the whole track in Chrome, not against its own row, and all
  // four blocks then pile up at the same offset.
  const filmBlocks = t.film.blocks.map((b) => `
        <div class="read__slot">
          <div class="read__block">
            <h2 class="h-mid">${raw(b.h)}</h2>
            <p class="body">${raw(b.p)}</p>
          </div>
        </div>`).join('')

  // A chain, not a pill strip. All five stations are readable at once, because
  // "one chain from the supplier to the bank" IS the product's claim, and a
  // tab strip that shows one keyword at a time hides exactly that.
  const chain = t.what.steps.map((s, i) => `
            <button class="chain__step" role="tab" type="button" id="tab-${i}"
                    aria-selected="${i === 0}" aria-controls="panel-${i}"
                    tabindex="${i === 0 ? 0 : -1}">
              <span class="chain__n">0${i + 1}</span>
              <span class="chain__k">${esc(s.k)}</span>
            </button>`).join('')

  // The screenshot is the demo surface: clicking the product's own navigation
  // inside it switches the panel. aria-hidden and not focusable on purpose,
  // because the chain above is the same control with a real accessible name;
  // two tab stops for one action is worse than one.
  const hotspots = (file) => {
    const items = (NAV[file] || []).filter((n) => n.label in NAV_STEP)
    if (!items.length) return ''
    return `
                <div class="hots" aria-hidden="true">${items.map((n) => `
                  <button class="hot" type="button" tabindex="-1"
                          data-goto="${NAV_STEP[n.label]}" title="${esc(n.label)}"
                          style="--x:${(100 - (n.x + n.w) * 100).toFixed(3)}%;--y:${(n.y * 100).toFixed(3)}%;--w:${(n.w * 100).toFixed(3)}%;--h:${(n.h * 100).toFixed(3)}%"></button>`).join('')}
                </div>`
  }

  const panels = t.what.steps.map((s, i) => `
          <div class="panel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i === 0 ? '' : ' hidden'}>
            <div class="panel__say">
              <h3 class="h-step">${raw(s.t)}</h3>
              <p class="body">${raw(s.p)}</p>
            </div>
            <figure class="panel__shot shot">
              <div class="shot__frame">
                <div class="shot__inner">
                  <img src="${esc(s.img)}" alt="${esc(s.t)}. מסך מתוך InPlace"
                       width="2000" height="1334" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">${hotspots(s.img.replace(/^assets\/screen-|\.webp$/g, ''))}
                </div>
              </div>
              <figcaption class="cap">${raw(s.cap)}</figcaption>
            </figure>
          </div>`).join('')

  // A hairline row, not three identical cards. Three equal cards is the stock
  // feature-grid shape, and these are three readings off one screen, not three
  // features.
  const stats = t.board.stats.map((s) => `
            <div class="figrow__cell">
              <p class="figrow__v ip-num">${esc(s.v)}</p>
              <p class="figrow__l">${esc(s.l)}</p>
            </div>`).join('')

  const whyList = (rows) => rows.map((r) => `
              <li class="why__row">
                <b class="why__t">${esc(r.t)}</b>
                <span class="why__p">${esc(r.p)}</span>
              </li>`).join('')

  // A real <table>: a plan comparison IS tabular, and the header cells give a
  // screen reader the column each figure belongs to for free.
  const planRows = t.plans.rows.map((r) => `
                <tr>
                  <th scope="row" class="plans__name">${esc(r.name)}</th>
                  <td class="plans__who">${esc(r.who)}</td>
                  <td class="plans__docs ip-num">${esc(r.docs)}</td>
                  <td class="plans__price">${esc(r.price)}</td>
                </tr>`).join('')

  // <details> rather than a scripted accordion: it opens without JavaScript,
  // it is keyboard-operable and screen-reader-announced by the browser, and it
  // is the one component on this page that needed no code at all.
  const faq = t.faq.items.map((f, i) => `
            <details class="faq__item"${i === 0 ? ' open' : ''}>
              <summary class="faq__q">${esc(f.q)}</summary>
              <div class="faq__a"><p>${raw(f.a)}</p></div>
            </details>`).join('')

  const footCols = t.footer.cols.map((c) => `
            <div class="sitefoot__col">
              <p class="sitefoot__h">${esc(c.h)}</p>
              <ul>${c.links.map((l) => `
                <li><a href="${esc(l.href)}">${esc(l.t)}</a></li>`).join('')}
              </ul>
            </div>`).join('')

  const asks = (variant) => `
        <div class="asks asks--${variant}">
          <a class="btn btn--primary" href="${esc(t.ctaPrimaryHref)}">${esc(t.ctaPrimary)}</a>
        </div>
        <p class="fineprint">${esc(t.fineprint)}</p>`

  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.description)}">
  <meta name="theme-color" content="#0a171d">
  <link rel="icon" type="image/svg+xml" href="assets/logo.svg">
  <link rel="icon" sizes="any" href="assets/favicon.ico">
  <link rel="apple-touch-icon" href="assets/icon-192.png">
  <meta property="og:title" content="${esc(t.title)}">
  <meta property="og:description" content="${esc(t.description)}">
  <meta property="og:type" content="website">
  <link rel="preload" as="font" type="font/woff2" crossorigin
        href="assets/fonts/NotoSansHebrew-${rtl ? 'Hebrew' : 'Latin'}.woff2">
  <link rel="stylesheet" href="engine/scrollcraft.css">
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <a class="skip" href="#what">${esc(t.skip)}</a>

  <header class="folio" aria-label="${esc(t.folioLabel)}">
    <a class="folio__brand" href="/">
      <svg class="mark" viewBox="1659.81 677.84 156.29 156.29" aria-hidden="true" fill="currentColor">
        <path d="M 1669.44 755.823 L 1710.28 755.879 C 1708.61 767.232 1707.38 778.645 1706.59 790.092 L 1736.02 790.07 C 1736.92 781.041 1737.62 771.993 1738.13 762.934 L 1760.32 763.051 C 1759.51 774.972 1758.47 786.875 1757.2 798.755 L 1754.87 825.177 L 1663.53 825.087 L 1669.44 755.823 z"/>
        <path d="M 1720.4 686.812 L 1812.38 686.801 C 1811.2 709.917 1808.06 732.974 1806.67 756.062 L 1771.75 756.048 C 1770.71 756.05 1767.89 756.114 1767.79 755.436 C 1766.97 749.628 1769.92 723.931 1770.27 718.871 L 1740.77 718.879 C 1739.68 728.796 1739.03 738.754 1737.95 748.673 C 1729.48 748.622 1723.1 748.384 1714.61 749.043 C 1716.84 728.328 1718.77 707.582 1720.4 686.812 z"/>
      </svg>
      ${esc(t.brand)}
    </a>
    <p class="folio__where" data-folio-out>${esc(t.title_page.folio)}</p>
    <a class="btn btn--primary btn--sm folio__ask" href="${esc(t.ctaPrimaryHref)}">${esc(t.ctaPrimary)}</a>
  </header>

  <main>

    <!-- ============================================================ title page -->
    <section class="ch ch--title" data-folio="${esc(t.title_page.folio)}">
      <div class="wrap">
        <p class="eyebrow">${esc(t.title_page.eyebrow)}</p>
        <h1 class="h-hero">${raw(t.title_page.h1)}</h1>
        <div class="title__body">
          <div class="title__say">
            <p class="lede">${raw(t.title_page.lede[0])}</p>
            <p class="lede">${raw(t.title_page.lede[1])}</p>
          </div>
          <div class="title__ask">${asks('title')}
          </div>
        </div>

        <nav class="index" aria-label="${esc(t.title_page.indexLabel)}">
          <p class="index__label">${esc(t.title_page.indexLabel)}</p>
          <ul class="index__list">${index}
          </ul>
        </nav>
      </div>
    </section>

    <!-- ============================================================= chapter 01 -->
    <section class="ch ch--film" data-folio="${esc(t.film.folio)}"
             data-sc-act="scrub" data-sc-span="${FILM_SPAN}">
      <div class="read">${filmBlocks}
      </div>
      <div class="sc-stage film-stage">
        <figure class="film-plate">
          <div class="film-plate__frame">
            <img class="sc-stage__poster" src="assets/film.webp" alt=""
                 decoding="async" fetchpriority="high">
            <video data-sc-scrub
                   data-sc-src="assets/film.mp4"
                   data-sc-src-mobile="assets/film-m.mp4"
                   playsinline muted preload="none"
                   aria-label="${esc(t.film.caption)}"></video>
          </div>
          <figcaption class="film-plate__cap">${esc(t.film.caption)}</figcaption>
        </figure>
      </div>
    </section>

    <!-- ============================================================= chapter 02 -->
    <section class="ch ch--what" id="what" data-folio="${esc(t.what.folio)}">
      <div class="plate">
        <div class="wrap">
          <header class="say">
            <p class="eyebrow eyebrow--on-light">${esc(t.what.eyebrow)}</p>
            <h2 class="h-big">${raw(t.what.h2)}</h2>
            <p class="lede">${esc(t.what.lede)}</p>
          </header>

          <div class="chain" role="tablist" aria-label="${esc(t.what.stepsLabel)}">${chain}
          </div>
          <p class="chain__hint">${esc(t.what.demoHint)}</p>

          <div class="panels">${panels}
          </div>
        </div>
      </div>

      <div class="board">
        <div class="wrap">
          <div class="board__head">
            <h2 class="h-big">${raw(t.board.h2)}</h2>
            <p class="lede">${esc(t.board.p)}</p>
          </div>
          <div class="figrow">${stats}
          </div>
        </div>
        <figure class="board__shot shot">
          <div class="shot__frame">
            <div class="shot__inner">
              <img src="${esc(t.board.img)}" alt="מרכז הבקרה של InPlace, מסך מלא מתוך המערכת"
                   width="1800" height="1382" loading="lazy" decoding="async">
            </div>
          </div>
          <figcaption class="cap">${esc(t.board.cap)}</figcaption>
        </figure>
      </div>

      <div class="midask">
        <div class="wrap">
          <p class="midask__line">${esc(t.midAsk.line)}</p>${asks('mid')}
        </div>
      </div>
    </section>

    <!-- ============================================================= chapter 03 -->
    <section class="ch ch--why" id="why" data-folio="${esc(t.why.folio)}">
      <div class="wrap">
        <header class="say">
          <h2 class="h-big">${raw(t.why.h2)}</h2>
          <p class="lede">${esc(t.why.lede)}</p>
        </header>
        <div class="why__cols">
          <div class="why__col">
            <p class="why__label">${esc(t.why.yesLabel)}</p>
            <ul class="why__list">${whyList(t.why.yes)}
            </ul>
          </div>
          <div class="why__col why__col--no">
            <p class="why__label">${esc(t.why.noLabel)}</p>
            <ul class="why__list">${whyList(t.why.no)}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================= chapter 04 -->
    <section class="ch ch--plans" id="plans" data-folio="${esc(t.plans.folio)}">
      <div class="wrap">
        <header class="say">
          <h2 class="h-big">${raw(t.plans.h2)}</h2>
          <p class="lede">${esc(t.plans.lede)}</p>
        </header>
        <div class="plans__frame">
          <table class="plans">
            <caption class="sr-only">${esc(t.plans.tableLabel)}</caption>
            <thead>
              <tr>
                <th scope="col">${esc(t.plans.headers.plan)}</th>
                <th scope="col">${esc(t.plans.headers.who)}</th>
                <th scope="col">${esc(t.plans.headers.docs)}</th>
                <th scope="col">${esc(t.plans.headers.price)}</th>
              </tr>
            </thead>
            <tbody>${planRows}
            </tbody>
          </table>
        </div>
        <p class="plans__note plans__prices">${raw(t.plans.priceNote)}</p>
        <p class="plans__note">${esc(t.plans.note)}</p>
      </div>
    </section>

    <!-- ============================================================= chapter 05 -->
    <section class="ch ch--faq" id="faq" data-folio="${esc(t.faq.folio)}">
      <div class="plate">
        <div class="wrap">
          <header class="say">
            <h2 class="h-big">${raw(t.faq.h2)}</h2>
            <p class="lede">${esc(t.faq.lede)}</p>
          </header>
          <div class="faq">${faq}
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================= chapter 06 -->
    <section class="ch ch--close" data-folio="${esc(t.close.folio)}">
      <div class="wrap">
        <div class="colophon__say">
          <h2 class="h-big">${raw(t.close.h2)}<em class="h-sub">${raw(t.close.sub)}</em></h2>
          <p class="lede">${esc(t.close.p)}</p>
          ${asks('close')}
        </div>
      </div>
    </section>

  </main>

  <footer class="sitefoot">
    <div class="wrap">
      <div class="sitefoot__top">
        <div class="sitefoot__brand">
          <a class="folio__brand" href="/">
            <svg class="mark" viewBox="1659.81 677.84 156.29 156.29" aria-hidden="true" fill="currentColor">
              <path d="M 1669.44 755.823 L 1710.28 755.879 C 1708.61 767.232 1707.38 778.645 1706.59 790.092 L 1736.02 790.07 C 1736.92 781.041 1737.62 771.993 1738.13 762.934 L 1760.32 763.051 C 1759.51 774.972 1758.47 786.875 1757.2 798.755 L 1754.87 825.177 L 1663.53 825.087 L 1669.44 755.823 z"/>
              <path d="M 1720.4 686.812 L 1812.38 686.801 C 1811.2 709.917 1808.06 732.974 1806.67 756.062 L 1771.75 756.048 C 1770.71 756.05 1767.89 756.114 1767.79 755.436 C 1766.97 749.628 1769.92 723.931 1770.27 718.871 L 1740.77 718.879 C 1739.68 728.796 1739.03 738.754 1737.95 748.673 C 1729.48 748.622 1723.1 748.384 1714.61 749.043 C 1716.84 728.328 1718.77 707.582 1720.4 686.812 z"/>
      </svg>
            ${esc(t.brand)}
          </a>
          <p class="sitefoot__tagline">${esc(t.footer.tagline)}</p>
        </div>
        <nav class="sitefoot__cols" aria-label="${esc(t.footer.cols[0].h)}">${footCols}
        </nav>
      </div>
      <div class="sitefoot__rule">
        <p dir="ltr">${esc(t.footer.rights)}</p>
      </div>
    </div>
  </footer>


  <noscript>
    <style>
      .film-stage { position: static !important; height: auto !important; }
      .film-stage__media { position: static !important; inset: auto !important;
                           width: 100% !important; height: auto !important; }
      video.film-stage__media { display: none !important; }
      .ch--film { display: block !important; height: auto !important; }
      .panel[hidden] { display: block !important; }
      .tabs { display: none !important; }
    </style>
    <p class="noscript">${esc(t.noscript)}</p>
  </noscript>

  <script src="engine/scrollcraft.js" defer></script>
  <script src="surface.js" defer></script>
  <script defer>addEventListener('DOMContentLoaded', function () { ScrollCraft.mount(document.body); });</script>
</body>
</html>
`
}
