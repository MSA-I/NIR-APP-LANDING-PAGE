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
import { peopleByLocale, type Person } from '@/content/people'
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
    toLight: 'מעבר לתצוגה בהירה',
    toDark: 'מעבר לתצוגה כהה',
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
    updated: 'עודכן',
    dateFormat: 'he-IL',
    ogAlt: 'InPlace: כל מה שקורה בין ההזמנה לכסף, במקום אחד',
    fonts: ['NotoSansHebrew-Hebrew.woff2', 'Heebo-hebrew.woff2'],
  },
  en: {
    dir: 'ltr',
    ogLocale: 'en',
    navLabel: 'Main navigation',
    toLight: 'Switch to the light view',
    toDark: 'Switch to the dark view',
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
    updated: 'Updated',
    dateFormat: 'en-GB',
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
/**
 * One founder: the name, the role, and the paragraph under them.
 *
 * `data-person` is what g21 reads. The name is also inside the <b>, and the gate
 * could scrape that instead, but a class name and a tag are layout and this is a
 * fact about who is speaking, which is the thing being compared with the graph.
 *
 * A person whose biography has not been supplied prints the name and the role
 * and stops. The alternative is a sentence with a hole in it, and the hole would
 * be published.
 */
const founder = (p: Person) => `
          <div class="doc-founder" data-person="${attr(p.name)}">${
  /* AVIF first, because the browser takes the first type it understands, and a
     WebP source above it would mean nothing ever reaches the AVIF. Both carry a
     width descriptor and a `sizes` of the box they are drawn in: one rung is not
     a ladder, but g23 asserts that every candidate declares its width, and it is
     right to. A srcset entry without one is a file whose size the browser has to
     guess at. */
  p.portrait
    ? `
            <picture>
              <source type="image/avif" srcset="/assets/${p.portrait}.avif 320w" sizes="96px" />
              <source type="image/webp" srcset="/assets/${p.portrait}.webp 320w" sizes="96px" />
              <img class="doc-portrait" src="/assets/${p.portrait}.webp" alt=""
                   width="320" height="320" loading="lazy" decoding="async" />
            </picture>`
    : ''
}
            <p class="body"><b>${escape(p.name)}</b>, ${escape(p.jobTitle)}.${
  p.bio ? ` ${copy(p.bio)}` : ''
}</p>
          </div>`

const section = (s: Section, locale: LocaleCode) => `
        <section class="doc-section">
          <h2>${escape(s.h2)}</h2>
          ${(s.paras || []).map((p) => `<p class="body">${copy(p)}</p>`).join('\n          ')}
          ${
            s.people
              ? `<p class="body">${copy(peopleByLocale[locale].intro)}</p>
          ${founder(peopleByLocale[locale].nir)}
          ${founder(peopleByLocale[locale].moshe)}`
              : ''
          }
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

/**
 * When each supporting page was written, and when its words last changed.
 *
 * WHY IT IS HERE AND NOT IN THE DICTIONARY
 * One date per page, not one per translation: the English edition of
 * /invoice-matching/ is the Hebrew page said again, so the two are the same
 * document and they were last revised together. Keyed by slug, so the two
 * dictionaries cannot drift apart on the one field they must agree on.
 *
 * WHY IT IS WRITTEN BY HAND
 * The alternatives are worse. A file mtime is the moment of `git clone` on the
 * build machine, so it would stamp every page with the deploy date; the build
 * date itself would claim in public that every page was revised this morning.
 * Neither is true, and a date that is not true is worth less than no date.
 *
 * THE RULE: change `updated` in the same commit that changes the page's words,
 * and only then. A typo fix is a change; a stylesheet is not.
 */
const DATES: Record<string, { published: string; updated: string }> = {
  'procurement-software': { published: '2026-08-27', updated: '2026-08-27' },
  'supplier-invoices': { published: '2026-08-27', updated: '2026-08-27' },
  'invoice-matching': { published: '2026-08-27', updated: '2026-08-27' },
  'vs-spreadsheet': { published: '2026-08-27', updated: '2026-08-27' },
  'vs-erp': { published: '2026-08-27', updated: '2026-08-27' },
  about: { published: '2026-08-27', updated: '2026-08-27' },
  terms: { published: '2026-08-27', updated: '2026-08-27' },
  privacy: { published: '2026-08-27', updated: '2026-08-27' },
}

/**
 * The three widths every product screenshot ships in.
 *
 * `null` is the original file, which is 2000px on five of the six and 1800px on
 * the control centre. The numbers and the reasoning behind them live in
 * scripts/build-shots.mjs, which writes the files; the widest descriptor is read
 * off the picture itself rather than assumed, because those two are not the same
 * number and a descriptor that lies about a file's width defeats the whole
 * mechanism.
 */
const RUNGS = [800, 1440] as const

/**
 * The fragment that identifies the author node, in both editions.
 *
 * A person is one entity whatever language the page describing them is written
 * in, so the id does not travel with the locale the way `#website` does. An
 * engine reading the Hebrew page and the English one must be able to tell that
 * it has met the same man twice.
 */
const AUTHOR_ID = 'nir'

/**
 * One product screen, as a complete <picture>.
 *
 * AVIF first because the browser takes the first type it understands, and AVIF
 * is 40% smaller than the WebP on this material — measured, not assumed; the
 * table is in scripts/build-shots.mjs. The <img> at the end carries the WebP
 * ladder and is what a browser without AVIF gets, which is also what every
 * crawler reads.
 *
 * `sizes` is the reading column: .doc is 44rem wide and the picture fills it.
 */
const picture = (image: { src: string; w: number; h: number; alt: string; cap: string }) => {
  const base = image.src.replace(/\.webp$/, '')
  const { w, h } = image
  const set = (ext: string) =>
    [...RUNGS.map((r) => `/${base}-${r}.${ext} ${r}w`), `/${base}.${ext} ${w}w`].join(', ')
  const sizes = '(min-width: 46rem) 44rem, 100vw'
  return `
        <figure class="doc-shot">
          <picture>
            <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}" />
            <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}" />
            <img src="/${image.src}" alt="${attr(image.alt)}" width="${w}" height="${h}"
                 loading="lazy" decoding="async" />
          </picture>
          <figcaption class="cap">${escape(image.cap)}</figcaption>
        </figure>`
}

/**
 * A founder, as a node.
 *
 * `description` is omitted rather than emptied for a person whose biography has
 * not been supplied. An empty string declares that this person has no
 * description, which is a different claim from making none, and g21 fails it.
 */
const personNode = (p: Person, id: string) => ({
  '@type': 'Person',
  '@id': `${ORIGIN}/#${id}`,
  name: p.name,
  jobTitle: p.jobTitle,
  ...(p.bio ? { description: p.bio } : {}),
  // The WebP, not the AVIF. This is the field a crawler reads, and the WebP is
  // the one the <img> itself carries, so the picture declared is the picture a
  // reader without AVIF is served.
  ...(p.portrait ? { image: `${ORIGIN}/assets/${p.portrait}.webp` } : {}),
  worksFor: { '@id': `${ORIGIN}/#organization` },
})

const schemaFor = (page: Page, locale: LocaleCode) => {
  const lang = locale === 'he' ? 'he-IL' : 'en'
  const home = locale === 'he' ? `${ORIGIN}/` : `${ORIGIN}/en/`
  const url = `${ORIGIN}${pathOf(page.slug, locale)}`
  const p = peopleByLocale[locale]
  // The page that prints both founders is the page that declares them, and it is
  // the only one. Everywhere else the author alone is declared, because that is
  // the only person those pages name.
  const printsPeople = page.sections.some((s) => s.people)
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
        // Only where they are printed, which is /about/ and nowhere else. The
        // Person nodes themselves are below; this is the edge from the company
        // to them, and it is the same rule that keeps an Offer off a page with
        // no price.
        ...(printsPeople
          ? {
              founder: [
                { '@id': `${ORIGIN}/#${AUTHOR_ID}` },
                { '@id': `${ORIGIN}/#moshe` },
              ],
            }
          : {}),
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
        // When it was written and when it last changed. An answer engine
        // weighs a page it can date against one it cannot, and until now
        // nothing on this site carried a date at all — not in the markup and
        // not on the screen.
        ...(DATES[page.slug] && {
          datePublished: DATES[page.slug].published,
          dateModified: DATES[page.slug].updated,
        }),
        ...(page.legal ? {} : { author: { '@id': `${ORIGIN}/#${AUTHOR_ID}` } }),
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
      // Who is speaking on this page.
      //
      // The six professional pages are `author`ed by the founder whose working
      // life they describe, and the credit line at the foot of each says the same
      // thing in the page's own words, so the declaration is not a claim the
      // reader cannot see. The two legal documents take neither: they carry the
      // text a user consents to, and attributing terms of use to a person as
      // their author is a different statement from the one those pages make.
      //
      // No `sameAs`. The owner's decision of 28.08.2026 is that no personal
      // profile is published here and the only external profile this site will
      // carry is the company's own, which does not exist yet. DEBT.md item 21.
      ...(page.legal ? [] : [personNode(p.nir, AUTHOR_ID)]),
      ...(printsPeople ? [personNode(p.moshe, 'moshe')] : []),
    ],
  }
}

/* The view, before the first paint.
   The same lines index.html carries, and for the same reason: which of the
   page's two grounds is underneath is one attribute on <html>, and a reader who
   chose the light view must not watch a dark page arrive first. These documents
   ship no JavaScript at all, so this and THEME_BODY below are the only script
   on them, and between them they are the whole of their state. */
const THEME_HEAD = `
      try {
        if (localStorage.getItem('inplace.theme') === 'light') {
          document.documentElement.dataset.theme = 'light'
          document.querySelector('meta[name="theme-color"]').setAttribute('content', '#fffcf8')
        }
      } catch (e) {}`

/* The switch itself, as markup rather than as a component.
   Same class names as src/components/ThemeToggle.tsx, so it inherits the whole
   control out of the shared stylesheet and there is one set of numbers to keep.
   The one difference is that both icons are always in the DOM and the CSS below
   shows one of each pair: a static page has no render to swap them in. */
const themeIcon = (name: 'moon' | 'sun', paths: string) =>
  `<svg class="i-${name}" width="16" height="16" viewBox="0 0 24 24" fill="none" ` +
  `stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">${paths}</svg>`

const MOON = themeIcon('moon', '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>')
const SUN = themeIcon(
  'sun',
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>' +
    '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
    '<path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/>' +
    '<path d="m19.07 4.93-1.41 1.41"/>'
)

const themeToggle = (toLight: string) =>
  `<button type="button" class="theme-toggle" data-theme-state="dark"
          aria-pressed="false" aria-label="${attr(toLight)}">
          <span class="theme-toggle__track">
            <span class="theme-toggle__knob">${MOON}${SUN}</span>
            <span class="theme-toggle__ghost">${SUN}${MOON}</span>
          </span>
        </button>`

/* Bringing the button into step with the attribute the head script set, and
   keeping it there. */
const themeBody = (toLight: string, toDark: string) => `
      (function () {
        var box = document.querySelector('.theme-toggle')
        if (!box) return
        var paint = function (t) {
          document.documentElement.dataset.theme = t
          box.dataset.themeState = t
          box.setAttribute('aria-pressed', String(t === 'light'))
          box.setAttribute('aria-label', t === 'light' ? ${JSON.stringify(toDark)} : ${JSON.stringify(toLight)})
          document
            .querySelector('meta[name="theme-color"]')
            .setAttribute('content', t === 'light' ? '#fffcf8' : '#0a171d')
        }
        paint(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
        box.addEventListener('click', function () {
          var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'
          paint(next)
          try { localStorage.setItem('inplace.theme', next) } catch (e) {}
        })
      })()`

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
      /* The screen this page is about. Same frame the home page draws round the
         same six pictures: a light card, because the product's own screens are
         light and a dark border round them reads as a hole in the page. */
      .doc-shot { margin: clamp(1.75rem, 4vh, 2.5rem) 0 0; }
      .doc-shot picture { display: block; overflow: clip; border-radius: 10px;
        border: 1px solid var(--color-wheat-line); background: #fff;
        box-shadow: 0 30px 70px -40px rgba(10, 23, 29, 0.55); }
      .doc-shot img { display: block; inline-size: 100%; block-size: auto; }
      .doc-shot figcaption { margin-block-start: 0.75rem; }
      /* The credit sits under the date and reads at the same weight: it is a
         fact about the page, not a signature the page is proud of. */
      .doc-credit { max-inline-size: 44rem; }
      /* A founder: the portrait at the start of the row, the paragraph beside it.
         Laid out with flex and no side named, so the picture falls on the right
         in Hebrew and on the left in English without a second rule. */
      .doc-founder { display: flex; gap: 1.1rem; align-items: flex-start;
        margin-block-start: 1.25rem; }
      .doc-founder .body { margin: 0; }
      /* The flex item is the <picture>, not the <img> inside it, so this is
         where the size and the refusal to shrink belong. Putting the no-shrink
         rule on the image instead leaves the wrapper free to collapse, and it
         does: the
         first cut drew both portraits as 24px slivers of a 96px face. */
      .doc-founder picture { display: block; flex: none;
        inline-size: 96px; block-size: 96px; }
      .doc-portrait { inline-size: 100%; block-size: 100%; border-radius: 50%;
        object-fit: cover; border: 1px solid var(--color-onyx-line); }
      /* Under 30rem the picture would leave the paragraph a column four words
         wide, so it goes above it instead of beside it. */
      @media (max-width: 30rem) {
        .doc-founder { display: block; }
        .doc-founder picture { margin-block-end: 0.75rem; }
      }
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
      .doc-top .theme-toggle { margin-inline-start: 0.5rem; }
      .theme-toggle .i-moon, .theme-toggle .i-sun { display: none; }
      .theme-toggle[data-theme-state="dark"] .theme-toggle__knob .i-moon,
      .theme-toggle[data-theme-state="dark"] .theme-toggle__ghost .i-sun,
      .theme-toggle[data-theme-state="light"] .theme-toggle__knob .i-sun,
      .theme-toggle[data-theme-state="light"] .theme-toggle__ghost .i-moon { display: block; }
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
  //
  // x-default points at the ENGLISH edition, which is what index.html and
  // en/index.html have always said and what these pages said the opposite of
  // until 28.08.2026. Two homes claiming /en/ and sixteen supporting pages
  // claiming the Hebrew one is a site arguing with itself about which document
  // serves a reader whose language matches neither, and a crawler resolving
  // that argument is not obliged to resolve it the way anybody here would.
  // English is the right answer to the question x-default actually asks: a
  // Hebrew speaker is already served by hreflang="he", so the fallback is only
  // ever read by somebody who is neither.
  const alternates = `
    <link rel="alternate" hreflang="he" href="${ORIGIN}/${page.slug}/" />
    <link rel="alternate" hreflang="en" href="${ORIGIN}/en/${page.slug}/" />
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}/en/${page.slug}/" />`

  return `<!doctype html>
<html lang="${locale}" dir="${t.dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${attr(page.title)}</title>
    <meta name="description" content="${attr(page.description)}" />
    <meta name="theme-color" content="#0a171d" />
    <script>${THEME_HEAD}
    </script>
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
        ${themeToggle(t.toLight)}
      </div>
    </header>

    <div class="wrap doc">
      <main>
        <p class="eyebrow">${escape(page.eyebrow)}</p>
        <h1>${copy(page.h1)}</h1>
        <p class="lede">${copy(page.lede)}</p>${page.image ? picture(page.image) : ''}
${page.sections.map((s) => section(s, locale)).join('\n')}

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
        <p class="eyebrow">InPlace</p>${
          DATES[page.slug]
            ? `
        <p class="cap"><time datetime="${DATES[page.slug].updated}">${escape(
                t.updated
              )} ${escape(
                new Intl.DateTimeFormat(t.dateFormat, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(`${DATES[page.slug].updated}T00:00:00Z`))
              )}</time></p>`
            : ''
        }${
          /* The credit, on the six professional pages and not on the two legal
             ones. It is the sentence the `author` node declares, printed where a
             reader can see it: a declaration a page does not make in its own
             words is a claim about the page rather than a fact of it. */
          page.legal
            ? ''
            : `
        <p class="cap doc-credit">${escape(
          peopleByLocale[locale].credit
            .replace('{expert}', peopleByLocale[locale].nir.name)
            .replace('{builder}', peopleByLocale[locale].moshe.name)
        )}</p>`
        }
        <div class="doc-rail">
          ${pill(locale === 'he' ? '/' : '/en/', escape(t.home))}
          ${pill('https://app.inplace.digital', escape(t.login))}
          ${pill(pathOf('terms', locale), escape(t.terms))}
          ${pill(pathOf('privacy', locale), escape(t.privacy))}
        </div>
      </footer>
    </div>
    <div class="grain" aria-hidden="true"></div>
    <script>${themeBody(t.toLight, t.toDark)}
    </script>
  </body>
</html>
`
}
