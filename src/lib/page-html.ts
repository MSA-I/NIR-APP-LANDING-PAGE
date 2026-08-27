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
import type { LocaleCode } from '@/content/locales'
import { emphasiseBrand } from '@/lib/motion'

const ORIGIN = 'https://inplace.digital'

// Everything on a supporting page that is not the page's own copy. Kept here
// rather than in the dictionaries because it belongs to this template and to
// nothing else: the home page has its own words for all of it.
const CHROME = {
  he: {
    dir: 'rtl',
    ogLocale: 'he_IL',
    navLabel: 'ניווט ראשי',
    nav: [
      ['/#what', 'מה המערכת עושה'],
      ['/#why', 'למה דווקא זה'],
      ['/#plans', 'מסלולים'],
      ['/#faq', 'שאלות'],
    ],
    readOn: 'להמשך קריאה',
    readOnLabel: 'עמודים נוספים',
    ctaLine: 'מתחילים מספק אחד, ורואים את השרשרת עובדת על העסק שלך.',
    home: 'דף הבית',
    login: 'כניסה למערכת',
    terms: 'תנאי שימוש',
    privacy: 'מדיניות פרטיות',
    operator: 'מפעילת השירות: In Place, הרותם 14, כפר אדומים. מספר רישום 036689081. טלפון 054-254-7074.',
    ogAlt: 'InPlace: כל מה שקורה בין ההזמנה לכסף, במקום אחד',
    fonts: ['NotoSansHebrew-Hebrew.woff2', 'Heebo-hebrew.woff2'],
  },
  en: {
    dir: 'ltr',
    ogLocale: 'en',
    navLabel: 'Main navigation',
    nav: [
      ['/en/#what', 'What the system does'],
      ['/en/#why', 'Why this approach'],
      ['/en/#plans', 'Plans'],
      ['/en/#faq', 'Questions'],
    ],
    readOn: 'Read on',
    readOnLabel: 'More pages',
    ctaLine: 'Start with one supplier, and watch the chain work on your own business.',
    home: 'Home',
    login: 'Sign in',
    terms: 'Terms of use',
    privacy: 'Privacy policy',
    operator: 'Operated by In Place, HaRotem 14, Kfar Adumim, Israel. Registration number 036689081. Telephone +972-54-254-7074.',
    ogAlt: 'InPlace: everything between the order and the money, in one place',
    fonts: ['NotoSansHebrew-Latin.woff2', 'Heebo-latin.woff2'],
  },
} as const

// The same arrow the page's buttons carry, as markup. `Cta` renders lucide's
// `ArrowLeft`; these documents ship no JavaScript, so the two paths are written
// out. Leftwards is forwards in Hebrew, and `html:dir(ltr) .flow__arrow` in the
// stylesheet turns it round for the English edition.
const arrow = (kind: 'lead' | 'trail') =>
  `<svg class="flow__arrow flow__arrow--${kind}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`

/** One of the page's buttons, with the ground that opens out of its own centre. */
const pill = (href: string, label: string, kind: 'primary' | 'ghost' = 'ghost', small = true) =>
  `<a class="flow flow--${kind}${small ? ' flow--sm' : ''}" href="${href}">` +
  `<span class="flow__fill" aria-hidden="true"></span>${arrow('lead')}` +
  `<span class="flow__label">${label}</span>${arrow('trail')}</a>`

/** Where a page lives, in the edition it belongs to. */
const pathOf = (slug: string, locale: LocaleCode) =>
  locale === 'he' ? `/${slug}/` : `/en/${slug}/`

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

const schemaFor = (page: Page, locale: LocaleCode) => {
  const lang = locale === 'he' ? 'he-IL' : 'en'
  const home = locale === 'he' ? `${ORIGIN}/` : `${ORIGIN}/en/`
  const url = `${ORIGIN}${pathOf(page.slug, locale)}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${ORIGIN}/#organization`,
        name: 'InPlace',
        legalName: 'In Place',
        vatID: '036689081',
        url: ORIGIN,
        logo: `${ORIGIN}/assets/logo.svg`,
        inLanguage: lang,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'הרותם 14',
          addressLocality: 'כפר אדומים',
          addressCountry: 'IL',
        },
        telephone: '+972-54-254-7074',
      },
      {
        '@type': 'WebSite',
        '@id': `${home}#website`,
        name: 'InPlace',
        url: home,
        inLanguage: lang,
        publisher: { '@id': `${ORIGIN}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: lang,
        isPartOf: { '@id': `${home}#website` },
        publisher: { '@id': `${ORIGIN}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'InPlace', item: home },
          { '@type': 'ListItem', position: 2, name: page.eyebrow, item: url },
        ],
      },
    ],
  }
}

/** The page-only layout. Everything else comes from the site's own stylesheet. */
const STYLE = `
      /* The ground the home page paints with a shader, painted with two
         gradients instead. These documents carry no JavaScript, and a WebGL
         canvas for a reading column would be the largest thing on the page. */
      body { background: var(--color-onyx); color: var(--color-ink-soft);
        background-image:
          radial-gradient(120% 70% at 80% -10%, color-mix(in srgb, var(--color-oceanic) 16%, transparent), transparent 60%),
          radial-gradient(90% 50% at 0% 8%, color-mix(in srgb, var(--color-oceanic-deep) 34%, transparent), transparent 65%);
        background-attachment: fixed; }
      .doc { max-inline-size: 44rem; margin-inline: auto; padding-block: 0 clamp(4rem, 10vh, 7rem); }
      /* The bar spans the window and its contents keep the reading column, the
         way the folio does on the home page. Inside the reading column it
         blurred a 44rem strip with two hard edges mid-screen. */
      .doc-top { position: sticky; inset-block-start: 0; z-index: 20;
        border-block-end: 1px solid var(--color-onyx-line);
        background: color-mix(in srgb, var(--color-onyx) 82%, transparent);
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
      .doc-top__in { max-inline-size: 44rem; display: flex; flex-wrap: wrap;
        gap: 0.5rem 0.75rem; align-items: center; padding-block: 0.75rem; }
      .doc-top nav { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-inline-start: auto; }
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
      .doc-cta { display: grid; justify-items: start; gap: 1rem;
        margin-block-start: clamp(2.5rem, 6vh, 3.5rem); padding: clamp(1.5rem, 4vw, 2rem);
        border: 1px solid var(--color-onyx-line); border-radius: 16px;
        background: color-mix(in srgb, var(--color-onyx-lift) 82%, transparent); }
      .doc-related, .doc-operator, .doc-foot { margin-block-start: clamp(2.5rem, 6vh, 3.5rem);
        padding-block-start: 1.5rem; border-block-start: 1px solid var(--color-onyx-line); }
      .doc-rail { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-start: 0.9rem; }
      .doc-operator { display: grid; gap: 0.6rem; }
      .doc-foot .eyebrow { color: var(--color-ink-dim); }
      :focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }

      /* The reveal the home page runs on Motion, run by the browser instead.
         Nothing is hidden without it: an engine with no scroll-driven
         animations, and a reader who asked for less motion, both get the
         finished page. */
      @media (prefers-reduced-motion: no-preference) {
        @supports (animation-timeline: view()) {
          .doc-section, .doc-cta, .doc-related, .doc-operator {
            animation: doc-rise linear both;
            animation-timeline: view();
            animation-range: entry 6% cover 24%;
          }
        }
      }
      @keyframes doc-rise {
        from { opacity: 0; translate: 0 1.1rem; }
        to { opacity: 1; translate: 0 0; }
      }`

/**
 * One complete document.
 *
 * `css` is the hashed stylesheet from the same build, read out of the home
 * page. Hard-coding it would break on the next build, and shipping a second
 * copy of 74KB of CSS per page would be worse.
 */
export function pageHtml(
  page: Page,
  all: Page[],
  css: string,
  cta: { label: string; href: string; note: string },
  locale: LocaleCode = 'he'
) {
  const t = CHROME[locale]
  const url = `${ORIGIN}${pathOf(page.slug, locale)}`
  const related = page.related
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Page => Boolean(p))

  // Every supporting page exists in both editions as of 27.08.2026, the two
  // legal documents included, so every one of them names its twin.
  const alternates = `
    <link rel="alternate" hreflang="he" href="${ORIGIN}/${page.slug}/" />
    <link rel="alternate" hreflang="en" href="${ORIGIN}/en/${page.slug}/" />
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}/${page.slug}/" />`

  return `<!doctype html>
<html lang="${locale}" dir="${t.dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${attr(page.title)}</title>
    <meta name="description" content="${attr(page.description)}" />
    <meta name="theme-color" content="#0a171d" />
    <link rel="canonical" href="${url}" />${alternates}
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
    <link rel="icon" sizes="any" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/assets/icon-192.png" />
    <meta property="og:title" content="${attr(page.title)}" />
    <meta property="og:description" content="${attr(page.description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="InPlace" />
    <meta property="og:locale" content="${t.ogLocale}" />
    <meta property="og:image" content="${ORIGIN}/assets/og-cover.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${attr(t.ogAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(page.title)}" />
    <meta name="twitter:description" content="${attr(page.description)}" />
    <meta name="twitter:image" content="${ORIGIN}/assets/og-cover.jpg" />
${t.fonts
      .map(
        (f) =>
          `    <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/${f}" />`
      )
      .join('\n')}
    <link rel="stylesheet" href="${css}" />
    <style>${STYLE}
    </style>
    <script type="application/ld+json">
${JSON.stringify(schemaFor(page, locale), null, 2).replace(/<\//g, '<\\/')}
    </script>
  </head>
  <body>
    <header class="doc-top">
      <div class="wrap doc-top__in">
        <a class="brandchip" href="${locale === 'he' ? '/' : '/en/'}">
          <span class="brandchip__fill" aria-hidden="true"></span>
          <span>InPlace</span>
        </a>
        <nav aria-label="${attr(t.navLabel)}">
          ${t.nav.map(([href, label]) => pill(href, escape(label))).join('\n          ')}
        </nav>
      </div>
    </header>

    <div class="wrap doc">
      <main>
        <p class="eyebrow">${escape(page.eyebrow)}</p>
        <h1>${copy(page.h1)}</h1>
        <p class="lede">${copy(page.lede)}</p>
${page.sections.map(section).join('\n')}

${
          page.legal
            ? `
        <div class="doc-operator">
          <p class="cap">${escape(t.operator)}</p>
        </div>`
            : `
        <div class="doc-cta">
          <p class="body">${copy(t.ctaLine)}</p>
          ${pill(cta.href, escape(cta.label), 'primary', false)}
          <p class="cap">${escape(cta.note)}</p>
        </div>

        <nav class="doc-related" aria-label="${attr(t.readOnLabel)}">
          <p class="eyebrow">${escape(t.readOn)}</p>
          <div class="doc-rail">
            ${related
              .map((p) => pill(pathOf(p.slug, locale), escape(p.nav)))
              .join('\n            ')}
          </div>
        </nav>`
        }
      </main>

      <footer class="doc-foot">
        <p class="eyebrow">InPlace</p>
        <div class="doc-rail">
          ${pill(locale === 'he' ? '/' : '/en/', escape(t.home))}
          ${pill('https://app.inplace.digital', escape(t.login))}
          ${pill(pathOf('terms', locale), escape(t.terms))}
          ${pill(pathOf('privacy', locale), escape(t.privacy))}
        </div>
      </footer>
    </div>
    <div class="grain" aria-hidden="true"></div>
  </body>
</html>
`
}
