// Build 3 — `inplace-folio`. Chaptered editorial.
//
// The page is a printed feature with three chapters and a title page. Chapters
// are the unit; there are no acts anywhere except chapter 01, which is the one
// chapter allowed a scrub under this grammar.
//
// The engine owns exactly one thing here: the film in chapter 01. Everything
// else is ordinary document flow, because a chaptered page IS ordinary document
// flow — that is the whole difference from build 2, which had no flow at all.

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// Copy is authored in this repo with <b>, <em> and &nbsp; allowed, so it goes
// through unescaped on purpose. None of it is user input.
const raw = (s) => String(s)

// The film is legs 01-03 of build 2's world plus the first half of leg 04,
// stream-copied into one clip. 593 frames at 24fps = 24.71s, one continuous
// camera: the stack standing, leaning and coming down; the two contradicting
// numbers lighting up on the fallen pages; the lift off the floor toward the
// lit thing in the dark; and the cut lands mid-reveal of the control centre,
// which is where the owner asked it to end.
//
// Paced at build 2's measured 0.215 viewport-heights per second of film.
const FILM_SPAN = 5.3

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

  const panels = t.what.steps.map((s, i) => `
          <div class="panel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i === 0 ? '' : ' hidden'}>
            <div class="panel__say">
              <h3 class="h-step">${raw(s.t)}</h3>
              <p class="body">${raw(s.p)}</p>
            </div>
            <figure class="panel__shot shot">
              <div class="shot__frame">
                <img src="${esc(s.img)}" alt="${esc(s.t)}. מסך מתוך InPlace"
                     width="2000" height="1334" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
              </div>
              <figcaption class="cap">${raw(s.cap)}</figcaption>
            </figure>
          </div>`).join('')

  // A hairline row, not three identical cards. Three equal cards is the stock
  // feature-grid shape, and all three figures come from ONE screen, so they are
  // cited once at the end of the row instead of carrying the same marker thrice.
  const stats = t.board.stats.map((s, i) => `
            <div class="figrow__cell">
              <p class="figrow__v ip-num">${esc(s.v)}${i === 2 ? `<b class="fig fig--bare" data-note="${esc(t.board.statsNote)}"></b>` : ''}</p>
              <p class="figrow__l">${esc(s.l)}</p>
            </div>`).join('')

  const whyList = (rows) => rows.map((r) => `
              <li class="why__row">
                <b class="why__t">${esc(r.t)}</b>
                <span class="why__p">${esc(r.p)}</span>
              </li>`).join('')

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

  const notes = t.notes.map((n) => `
            <li class="note" id="note-${esc(n.id)}">
              <span class="note__id">${esc(n.id)}</span>
              <span class="note__t ip-num">${esc(n.t)}</span>
              <span class="note__s">${esc(n.s)}</span>
            </li>`).join('')

  const asks = (variant) => `
        <div class="asks asks--${variant}">
          <a class="btn btn--primary" href="${esc(t.ctaPrimaryHref)}">${esc(t.ctaPrimary)}</a>
          <a class="btn btn--ghost" href="${esc(t.ctaSecondaryHref)}">${esc(t.ctaSecondary)}</a>
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
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%230a171d'/%3E%3Cpath fill='%2338b3c0' d='M3 3h8.5v8.5H3V3zm9.5 9.5H21V21h-8.5v-8.5zM12.5 3H21v7.5h-8.5V3zM3 12.5h8.5V21H3v-8.5z'/%3E%3C/svg%3E">
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
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M3 3h8.5v8.5H3V3zm9.5 9.5H21V21h-8.5v-8.5zM12.5 3H21v7.5h-8.5V3zM3 12.5h8.5V21H3v-8.5z" opacity=".92"/>
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
            <img src="${esc(t.board.img)}" alt="מרכז הבקרה של InPlace, מסך מתוך המערכת"
                 width="2000" height="1334" loading="lazy" decoding="async">
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

    <!-- ============================================================= chapter 05 -->
    <section class="ch ch--close" data-folio="${esc(t.close.folio)}">
      <div class="wrap">
        <div class="colophon">
          <div class="colophon__say">
            <h2 class="h-big">${raw(t.close.h2)}<em class="h-sub">${raw(t.close.sub)}</em></h2>
            <p class="lede">${esc(t.close.p)}</p>
            ${asks('close')}
          </div>

          <div class="apparatus-list">
            <p class="apparatus-list__label">${esc(t.notesLabel)}</p>
            <p class="apparatus-list__lede">${esc(t.notesLede)}</p>
            <ol class="notes">${notes}
            </ol>
          </div>
        </div>

      </div>
    </section>

  </main>

  <footer class="sitefoot">
    <div class="wrap">
      <div class="sitefoot__top">
        <div class="sitefoot__brand">
          <a class="folio__brand" href="/">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M3 3h8.5v8.5H3V3zm9.5 9.5H21V21h-8.5v-8.5zM12.5 3H21v7.5h-8.5V3zM3 12.5h8.5V21H3v-8.5z" opacity=".92"/>
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

  <!-- The signature move. A live footnote strip: every real figure in the
       running copy is a numbered source, and the strip names the source of the
       figure the reader is standing on. The <ol> above is the same apparatus,
       complete, and is what a reader without JS or with a screen reader gets. -->
  <aside class="apparatus" data-apparatus hidden aria-hidden="true">
    <span class="apparatus__id" data-apparatus-id>1</span>
    <span class="apparatus__body">
      <b class="apparatus__t ip-num" data-apparatus-t></b>
      <span class="apparatus__s" data-apparatus-s></span>
    </span>
  </aside>

  <noscript>
    <style>
      .film-stage { position: static !important; height: auto !important; }
      .film-stage__media { position: static !important; inset: auto !important;
                           width: 100% !important; height: auto !important; }
      video.film-stage__media { display: none !important; }
      .ch--film { display: block !important; height: auto !important; }
      .panel[hidden] { display: block !important; }
      .tabs { display: none !important; }
      .apparatus { display: none !important; }
    </style>
    <p class="noscript">${esc(t.noscript)}</p>
  </noscript>

  <script>window.IP_NOTES = ${JSON.stringify(t.notes)};</script>
  <script src="engine/scrollcraft.js" defer></script>
  <script src="surface.js" defer></script>
  <script defer>addEventListener('DOMContentLoaded', function () { ScrollCraft.mount(document.body); });</script>
</body>
</html>
`
}
