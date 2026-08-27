// The supporting pages, as documents.
//
// These are written as HTML strings rather than as React components, and the
// reason is the whole point of them: they carry no JavaScript at all. A page
// that answers one question in nine hundred words has nothing to hydrate, and
// the home page's 380KB of startup script would be the largest thing on it.
//
// They still belong to the same site. They link the built stylesheet, so they
// inherit every token, both faces and the whole type scale from
// src/styles.css; the small block below only lays out what the home page has
// no equivalent for, which is a long reading column.
//
// Rendered by scripts/prerender.mjs, straight into dist/<slug>/index.html.

import type { Page, Section } from '@/content/pages'
import { emphasiseBrand } from '@/lib/motion'

const ORIGIN = 'https://inplace.digital'

const escape = (s: string) =>
  s.replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Titles and descriptions go into attributes, where a quote would end the
// attribute early. Everything else is authored copy that may carry <b>.
const attr = (s: string) =>
  s.replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const copy = (s: string) => emphasiseBrand(s)

// Order matters, and the shape says so: `paras` introduce, `list` or `table`
// carries the substance, `after` closes. The first cut had one `paras` field
// rendered before the list, which put every closing sentence above the thing it
// was closing.
const section = (s: Section) => `
        <section class="doc-section">
          <h2>${escape(s.h2)}</h2>
          ${(s.paras || []).map((p) => `<p class="body">${copy(p)}</p>`).join('\n          ')}
          ${
            s.list
              ? `<ul class="doc-list" aria-label="${attr(s.list.label)}">
            ${s.list.items.map((i) => `<li>${copy(i)}</li>`).join('\n            ')}
          </ul>`
              : ''
          }
          ${
            s.table
              ? `<div class="doc-scroll">
            <table class="doc-table">
              <thead><tr><th>${escape(s.table.headers[0])}</th><th>${escape(
                  s.table.headers[1]
                )}</th></tr></thead>
              <tbody>
                ${s.table.rows
                  .map((r) => `<tr><td>${copy(r[0])}</td><td>${copy(r[1])}</td></tr>`)
                  .join('\n                ')}
              </tbody>
            </table>
          </div>`
              : ''
          }
          ${(s.after || []).map((p) => `<p class="body">${copy(p)}</p>`).join('\n          ')}
        </section>`

const schemaFor = (page: Page) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${ORIGIN}/#organization`,
      name: 'InPlace',
      url: ORIGIN,
      logo: `${ORIGIN}/assets/logo.svg`,
      inLanguage: 'he-IL',
    },
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      name: 'InPlace',
      url: ORIGIN,
      inLanguage: 'he-IL',
      publisher: { '@id': `${ORIGIN}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${ORIGIN}/${page.slug}/#webpage`,
      url: `${ORIGIN}/${page.slug}/`,
      name: page.title,
      description: page.description,
      inLanguage: 'he-IL',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      publisher: { '@id': `${ORIGIN}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'InPlace', item: `${ORIGIN}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.eyebrow,
          item: `${ORIGIN}/${page.slug}/`,
        },
      ],
    },
  ],
})

/** The page-only layout. Everything else comes from the site's own stylesheet. */
const STYLE = `
      body { background: var(--color-onyx); color: var(--color-ink-soft); }
      .doc { max-inline-size: 44rem; margin-inline: auto; padding-block: clamp(2.5rem, 7vh, 5rem) clamp(4rem, 10vh, 7rem); }
      .doc-top { display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; align-items: baseline;
        padding-block-end: 1.25rem; border-block-end: 1px solid var(--color-onyx-line); }
      .doc-top a { color: var(--color-ink); text-decoration: none; font-weight: 700; }
      .doc-top nav { display: flex; flex-wrap: wrap; gap: 1rem; margin-inline-start: auto; font-size: 0.9rem; }
      .doc-top nav a { color: var(--color-ink-soft); font-weight: 400; }
      .doc-top nav a:hover, .doc-top a:hover { color: var(--color-oceanic); }
      .doc h1 { font-family: var(--font-display); font-weight: 800; letter-spacing: -0.01em;
        font-size: clamp(2rem, 5.5vw, 3.1rem); line-height: 1.1; color: var(--color-ink);
        margin-block: clamp(2rem, 5vh, 3rem) 1.25rem; text-wrap: balance; }
      .doc h2 { font-family: var(--font-display); font-weight: 800; font-size: clamp(1.35rem, 3vw, 1.75rem);
        line-height: 1.25; color: var(--color-ink); margin-block-end: 0.85rem; text-wrap: balance; }
      .doc-section { margin-block-start: clamp(2.25rem, 5vh, 3.25rem); }
      .doc-section p + p { margin-block-start: 0.9rem; }
      .doc-list { margin-block-start: 1rem; margin-block-end: 1rem; padding-inline-start: 1.15rem;
        display: grid; gap: 0.6rem; list-style: disc; }
      .doc-list li::marker { color: var(--color-oceanic); }
      .doc-scroll { overflow-x: auto; margin-block-start: 1.25rem; }
      .doc-table { border-collapse: collapse; inline-size: 100%; min-inline-size: 28rem; font-size: 0.95rem; }
      .doc-table th, .doc-table td { text-align: start; padding: 0.7rem 0.9rem; vertical-align: top;
        border-block-end: 1px solid var(--color-onyx-line); }
      .doc-table th { color: var(--color-ink); font-weight: 700; }
      .doc-cta { margin-block-start: clamp(2.5rem, 6vh, 3.5rem); padding: clamp(1.5rem, 4vw, 2rem);
        border: 1px solid var(--color-onyx-line); border-radius: 12px; background: var(--color-onyx-lift); }
      .doc-cta a.go { display: inline-flex; align-items: center; gap: 0.5rem; margin-block-start: 1rem;
        padding: 0.8rem 1.4rem; border-radius: 10px; background: var(--color-action-solid);
        color: var(--color-ink); font-weight: 600; text-decoration: none; }
      .doc-cta a.go:hover { background: var(--color-oceanic-deep); }
      .doc-related { margin-block-start: clamp(2.5rem, 6vh, 3.5rem); padding-block-start: 1.5rem;
        border-block-start: 1px solid var(--color-onyx-line); }
      .doc-related ul { list-style: none; padding: 0; margin-block-start: 0.75rem; display: grid; gap: 0.5rem; }
      .doc-related a { color: var(--color-oceanic); }
      .doc-foot { margin-block-start: clamp(3rem, 7vh, 4.5rem); padding-block-start: 1.25rem;
        border-block-start: 1px solid var(--color-onyx-line); font-size: 0.85rem; color: var(--color-ink-dim);
        display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; }
      .doc-foot a { color: var(--color-ink-dim); }
      :focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }`

/**
 * One complete document.
 *
 * `css` is the hashed stylesheet from the same build, read out of the home
 * page. Hard-coding it would break on the next build, and shipping a second
 * copy of 74KB of CSS per page would be worse.
 */
export function pageHtml(page: Page, all: Page[], css: string, cta: { label: string; href: string; note: string }) {
  const url = `${ORIGIN}/${page.slug}/`
  const related = page.related
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Page => Boolean(p))

  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${attr(page.title)}</title>
    <meta name="description" content="${attr(page.description)}" />
    <meta name="theme-color" content="#0a171d" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
    <link rel="icon" sizes="any" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/assets/icon-192.png" />
    <meta property="og:title" content="${attr(page.title)}" />
    <meta property="og:description" content="${attr(page.description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="InPlace" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:image" content="${ORIGIN}/assets/og-cover.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="InPlace: כל מה שקורה בין ההזמנה לכסף, במקום אחד" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(page.title)}" />
    <meta name="twitter:description" content="${attr(page.description)}" />
    <meta name="twitter:image" content="${ORIGIN}/assets/og-cover.jpg" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/NotoSansHebrew-Hebrew.woff2" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/Heebo-hebrew.woff2" />
    <link rel="stylesheet" href="${css}" />
    <style>${STYLE}
    </style>
    <script type="application/ld+json">
${JSON.stringify(schemaFor(page), null, 2).replace(/<\//g, '<\\/')}
    </script>
  </head>
  <body>
    <div class="wrap doc">
      <header class="doc-top">
        <a href="/">InPlace</a>
        <nav aria-label="ניווט ראשי">
          <a href="/#what">מה המערכת עושה</a>
          <a href="/#why">למה דווקא זה</a>
          <a href="/#plans">מסלולים</a>
          <a href="/#faq">שאלות</a>
        </nav>
      </header>

      <main>
        <p class="eyebrow">${escape(page.eyebrow)}</p>
        <h1>${copy(page.h1)}</h1>
        <p class="lede">${copy(page.lede)}</p>
${page.sections.map(section).join('\n')}

        <div class="doc-cta">
          <p class="body">${copy('מתחילים מספק אחד, ורואים את השרשרת עובדת על העסק שלך.')}</p>
          <a class="go" href="${cta.href}">${escape(cta.label)}</a>
          <p class="cap" style="margin-block-start:0.75rem">${escape(cta.note)}</p>
        </div>

        <nav class="doc-related" aria-label="עמודים נוספים">
          <p class="eyebrow">להמשך קריאה</p>
          <ul>
            ${related
              .map((p) => `<li><a href="/${p.slug}/">${escape(p.h1)}</a></li>`)
              .join('\n            ')}
          </ul>
        </nav>
      </main>

      <footer class="doc-foot">
        <span>InPlace</span>
        <a href="/">דף הבית</a>
        <a href="https://app.inplace.digital">כניסה למערכת</a>
        <a href="https://app.inplace.digital/terms">תנאי שימוש</a>
        <a href="https://app.inplace.digital/privacy">פרטיות</a>
      </footer>
    </div>
  </body>
</html>
`
}
