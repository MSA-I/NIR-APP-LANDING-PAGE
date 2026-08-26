// One template, three locales. The page is a worldflight: one fixed stage,
// nine legs, one spacer, and nothing else in document flow.
//
// The leg weights here MUST match scripts/render-world.mjs. The renderer slices
// one continuous camera by the same cumulative fractions the engine uses to lay
// out the track, which is what makes every seam exact instead of matched.

export const LEGS = [
  { id: '01', w: 1.5, linger: 0.20 },
  { id: '02', w: 1.5, linger: 0.25 },
  { id: '03', w: 1.4, linger: 0.15 },
  { id: '04', w: 1.8, linger: 0.42 },
  { id: '05', w: 1.8, linger: 0.18 },
  { id: '06', w: 2.6, linger: 0.45 },   // the peak
  { id: '07', w: 1.4, linger: 0.40 },
  { id: '08', w: 1.4, linger: 0.20 },
  { id: '09', w: 1.6, linger: 0.48 },
]

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// Copy is authored as plain strings with <strong> allowed, so it goes through
// unescaped on purpose; every string is written in this repo, none is user
// input.
const raw = (s) => String(s)

export function render(t) {
  const rtl = t.dir === 'rtl'
  const legs = LEGS.map((l, i) => ({ ...l, label: t.map[i] }))

  const segments = legs.map((l) => `
        <div data-sc-segment data-sc-w="${l.w}" data-sc-linger="${l.linger}"
             data-sc-waypoint="${esc(l.label)}">
          <img class="sc-world__poster" src="assets/${l.id}.webp" alt="" decoding="async">
          <video data-sc-src="assets/${l.id}.mp4"
                 data-sc-src-mobile="assets/${l.id}-m.mp4"
                 playsinline muted preload="none"></video>
        </div>`).join('')

  const stops = legs.map((l, i) => `
          <li><button class="ip-map__stop" type="button" data-leg="${i}"
                      aria-current="${i === 0}">
            <span class="ip-map__label">${esc(l.label)}</span>
          </button></li>`).join('')

  const blocks = t.copy.map((c) => `
        <div class="ip-copy ${c.at}" data-sc-copy data-sc-window="${c.win}">
          ${c.kicker ? `<p class="ip-kicker">${raw(c.kicker)}</p>` : ''}
          ${c.h1 ? `<h1 class="ip-h1">${raw(c.h1)}</h1>` : ''}
          ${c.h2 ? `<h2 class="ip-h2">${raw(c.h2)}</h2>` : ''}
          ${c.line ? `<p class="ip-line">${raw(c.line)}</p>` : ''}
          ${c.lede ? `<p class="ip-lede">${raw(c.lede)}</p>` : ''}
        </div>`).join('')

  const alts = (t.alternates || []).map((a) =>
    `<link rel="alternate" hreflang="${a.code}" href="${a.href}">`).join('\n  ')

  const langs = (t.alternates || []).map((a) =>
    `<a href="${a.href}" hreflang="${a.code}" aria-current="${a.code === t.code}">${a.code.toUpperCase()}</a>`).join('')

  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.description)}">
  <meta name="theme-color" content="#04080b">
  <meta property="og:title" content="${esc(t.title)}">
  <meta property="og:description" content="${esc(t.description)}">
  <meta property="og:type" content="website">
  ${alts}
  <link rel="preload" as="font" type="font/woff2" crossorigin
        href="assets/fonts/NotoSansHebrew-${rtl ? 'Hebrew' : 'Latin'}.woff2">
  <link rel="preload" as="image" href="assets/01.webp" fetchpriority="high">
  <link rel="stylesheet" href="engine/scrollcraft.css">
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <a class="ip-skip" href="#ask">${esc(t.skip)}</a>

  <a class="ip-brand" href="/">
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M3 3h8.5v8.5H3V3zm9.5 9.5H21V21h-8.5v-8.5zM12.5 3H21v7.5h-8.5V3zM3 12.5h8.5V21H3v-8.5z" opacity=".92"/>
    </svg>
    InPlace
  </a>

  <nav class="ip-langs" aria-label="${esc(t.langsLabel)}">${langs}</nav>

  <div data-sc-mode="worldflight" data-sc-seam="0.16" data-sc-lerp="0.12"
       role="main" aria-label="${esc(t.title)}">

    <div data-sc-world>${segments}
    </div>

    <div data-sc-world-copy>
${blocks}
    </div>

    <div data-sc-spacer aria-hidden="true"></div>
  </div>

  <nav class="ip-map" aria-label="${esc(t.mapLabel)}">
    <div class="ip-map__rule" aria-hidden="true"></div>
    <div class="ip-map__run" aria-hidden="true"></div>
    <ul class="ip-map__list">${stops}
    </ul>
  </nav>

  <aside class="ip-doc" id="ask" aria-label="${esc(t.doc.label)}">
    <p class="ip-doc__kind">${esc(t.doc.kind)}</p>
    <p class="ip-doc__sup">${esc(t.doc.supplier)}</p>
    <p class="ip-doc__amt ip-num">${esc(t.doc.amount)}</p>
    <div class="ip-doc__rule" aria-hidden="true"></div>
    <p class="ip-doc__state" data-doc-state>${esc(t.doc.states[0].text)}</p>
    <div class="ip-doc__ask">
      <a class="ip-btn ip-btn--primary" href="${esc(t.ctaPrimaryHref)}">${esc(t.ctaPrimary)}</a>
      <a class="ip-btn ip-btn--ghost" href="${esc(t.ctaSecondaryHref)}">${esc(t.ctaSecondary)}</a>
      <p class="ip-fineprint">${esc(t.fineprint)}</p>
      <nav class="ip-langs ip-langs--close" aria-label="${esc(t.langsLabel)}">${langs}</nav>
    </div>
  </aside>

  <noscript>
    <style>
      .sc-world, .ip-map, .ip-doc { display: none !important; }
      .ip-copy { position: static; opacity: 1 !important; max-width: none; }
      .ip-copy::before { display: none; }
      body { display: block; }
    </style>
    <div class="ip-nojs">
      <h1 class="ip-h2">${raw(t.copy[0].h1)}</h1>
      <p class="ip-lede">${raw(t.copy[0].lede)}</p>
      <p class="ip-lede">${raw(t.noscript)}</p>
      <p><a class="ip-btn ip-btn--primary" href="${esc(t.ctaPrimaryHref)}">${esc(t.ctaPrimary)}</a></p>
    </div>
  </noscript>

  <script>window.IP_DOC_STATES = ${JSON.stringify(t.doc.states)};</script>
  <script src="engine/scrollcraft.js" defer></script>
  <script src="surface.js" defer></script>
  <script defer>addEventListener('DOMContentLoaded', function () { ScrollCraft.mount(document.body); });</script>
</body>
</html>
`
}
