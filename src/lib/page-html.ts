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
import { peopleByLocale, fullName, type Person } from '@/content/people'
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

/* The mark, as `src/components/Folio.tsx` draws it.
   These documents shared the app's `.brandchip`, and that rule hides the
   wordmark below 480px because the app's chip has this mark underneath it.
   The static markup had no mark, so on every phone the brand of all twelve
   supporting pages was an empty 44px circle. */
const MARK =
  '<svg class="brandchip__mark" viewBox="1659.81 677.84 156.29 156.29" aria-hidden="true" fill="currentColor">' +
  '<path d="M 1669.44 755.823 L 1710.28 755.879 C 1708.61 767.232 1707.38 778.645 1706.59 790.092 L 1736.02 790.07 C 1736.92 781.041 1737.62 771.993 1738.13 762.934 L 1760.32 763.051 C 1759.51 774.972 1758.47 786.875 1757.2 798.755 L 1754.87 825.177 L 1663.53 825.087 L 1669.44 755.823 z" />' +
  '<path d="M 1720.4 686.812 L 1812.38 686.801 C 1811.2 709.917 1808.06 732.974 1806.67 756.062 L 1771.75 756.048 C 1770.71 756.05 1767.89 756.114 1767.79 755.436 C 1766.97 749.628 1769.92 723.931 1770.27 718.871 L 1740.77 718.879 C 1739.68 728.796 1739.03 738.754 1737.95 748.673 C 1729.48 748.622 1723.1 748.384 1714.61 749.043 C 1716.84 728.328 1718.77 707.582 1720.4 686.812 z" />' +
  '</svg>'

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

/**
 * One founder, as 21st.dev's team-member-card.
 *
 * `data-person` carries the joined name, which is what g21 compares with the
 * graph. The card prints the two halves on two lines and a gate reading the
 * markup would have to join them back; the attribute says the fact plainly.
 *
 * Chosen by the owner on 28.08.2026 (@Shatlyk1011, id team-member-card, whose
 * own source is emerald-ui.com). Its anatomy is taken as it stands: a spaced
 * uppercase role label above; a 360 by 500 portrait; a text panel pulled 32px
 * back over the picture and lifted above it; the given name in extralight at
 * 48px over the family name in regular; and the biography under them.
 *
 * THREE THINGS ARE NOT COPIED, AND EACH FOR A REASON
 *
 * The 80px circle with the arrow. In the catalogue it is a link to the person,
 * with `cursor-pointer` and a tab stop. The owner's decision of 28.08.2026 is
 * that no personal profile is published on this site, so the circle would be a
 * control that goes nowhere and takes a keyboard stop on the way.
 *
 * The entrance. The catalogue component fades the three parts in from three
 * directions on `whileInView`, which needs Framer Motion, and these documents
 * ship no JavaScript at all. A CSS animation would fire on load rather than on
 * arrival, which for a card this far down the page means it finishes before
 * anybody sees it. The hover on the portrait is CSS and is kept.
 *
 * The colours. `zinc` is not a colour this site has. The card is repainted in
 * the page's own tokens, exactly as the flow button, the plan cards, the FAQ
 * panels and the colophon were.
 */
const founder = (p: Person) => `
          <div class="doc-member" data-person="${attr(fullName(p))}">
            <p class="doc-member__role">${escape(p.jobTitle)}</p>
            <div class="doc-member__row">${
              /* AVIF first, because the browser takes the first type it
                 understands, and a WebP source above it would mean nothing ever
                 reaches the AVIF. Both carry a width descriptor and the size of
                 the frame they are drawn in: one rung is not a ladder, but g23
                 asserts that every candidate declares its width, and it is right
                 to. A srcset entry without one is a file whose size the browser
                 has to guess at. */
              p.portrait
                ? `
              <div class="doc-member__frame">
                <span class="doc-member__veil" aria-hidden="true"></span>
                <picture>
                  <source type="image/avif" srcset="/assets/${p.portrait}.avif 720w" sizes="360px" />
                  <source type="image/webp" srcset="/assets/${p.portrait}.webp 720w" sizes="360px" />
                  <img src="/assets/${p.portrait}.webp" alt=""
                       width="720" height="1000" loading="lazy" decoding="async" />
                </picture>
              </div>`
                : ''
            }
              <div class="doc-member__panel">
                <p class="doc-member__name">${escape(p.given)}<br /><span>${escape(
                  p.family
                )}</span></p>${
                  p.bio.length
                    ? `
                <div class="doc-member__bio">
                  ${p.bio.map((para) => `<p>${copy(para)}</p>`).join('\n                  ')}
                </div>`
                    : ''
                }
              </div>
            </div>
          </div>`

// Order matters, and the shape says so: `paras` introduce, `list` or `table`
// carries the substance, `after` closes. The first cut had one `paras` field
// rendered before the list, which put every closing sentence above the thing it
// was closing.
/**
 * The words of a section, as one string, for the Answer in the graph.
 *
 * In reading order: the paragraphs that introduce, the list, then the
 * paragraphs that close. The first cut of this took `paras` and `after` only,
 * on the theory that a list is the shape of an answer rather than its words.
 * The build disagreed immediately: five of the twenty-six questions per
 * language answer in a list and carry no prose at all, and they are among the
 * best of them. "מה קורה לחשבונית מהרגע שהיא נכנסת" is answered by the six steps
 * that happen to it, and a Question declared with an empty Answer is worth less
 * than no declaration at all.
 *
 * The table is still left out. Its rows are two columns that mean something
 * against each other, and flattened into a sentence they read as a list of
 * fragments — which is the failure the first theory was actually about.
 *
 * `emphasiseBrand` has not run on these yet, so the only markup to strip is
 * what the dictionary authored by hand.
 */
const answerOf = (s: Section) =>
  [...(s.paras || []), ...(s.list?.items || []), ...(s.after || [])]
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const section = (s: Section, locale: LocaleCode) => `
        <section class="doc-section"${s.ask ? ` data-faq-q="${attr(s.h2)}"` : ''}>
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
  'procurement-software': { published: '2026-08-27', updated: '2026-08-28' },
  'supplier-invoices': { published: '2026-08-27', updated: '2026-08-28' },
  'invoice-matching': { published: '2026-08-27', updated: '2026-08-28' },
  'vs-spreadsheet': { published: '2026-08-27', updated: '2026-08-28' },
  'vs-erp': { published: '2026-08-27', updated: '2026-08-28' },
  about: { published: '2026-08-27', updated: '2026-08-28' },
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
  name: fullName(p),
  jobTitle: p.jobTitle,
  // Schema takes one string, so the paragraphs are joined with a space. An
  // empty list declares no description at all rather than an empty one.
  ...(p.bio.length ? { description: p.bio.join(' ') } : {}),
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
  // A section marked `ask` with no prose would declare a Question whose Answer
  // is empty, which g21-schema fails on the built page. Failing here says which
  // section, in the file where it is written, instead of which page.
  const asked = page.sections.filter((s) => s.ask)
  for (const s of asked) {
    if (!answerOf(s)) {
      throw new Error(`${page.slug} (${locale}): section "${s.h2}" is marked ask and has no prose to answer with`)
    }
  }
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
      // The questions this page answers, declared as questions.
      //
      // Added 31.08.2026, after the SEO audit found `FAQPage` on the home page
      // and nowhere else while these six pages were already written as questions
      // with self-contained answers beneath them. The home page's block is built
      // the same way in src/entry-static.tsx, out of the same dictionary the page
      // renders, and for the same reader: ChatGPT, Perplexity and Claude lift a
      // question and its answer as a unit when they are told the two belong
      // together. Google retired FAQ rich results on 07.05.2026 and will draw
      // nothing here, which is not the point and never was.
      //
      // Which sections are questions is `ask` in src/content/pages.ts, decided
      // per section rather than guessed from the heading. The two legal
      // documents mark none, so this node is absent from them, which is what
      // g21-schema asserts in both directions: a page that prints questions
      // declares them, and a page that declares them prints them.
      ...(asked.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              name: page.h1,
              inLanguage: lang,
              isPartOf: { '@id': `${url}#webpage` },
              mainEntity: asked.map((s) => ({
                '@type': 'Question',
                name: s.h2,
                acceptedAnswer: { '@type': 'Answer', text: answerOf(s) },
              })),
            },
          ]
        : []),
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
      /* 21st.dev's team-member-card, repainted. Every measurement below is the
         catalogue component's own, converted out of its Tailwind classes: my-16
         is 64px, mb-4 is 16px, w-90 by h-125 is 360 by 500, its negative inline
         offset of 8 is 32px (written out rather than quoted, because g4 reads
         this file for physical direction words and it is right to),
         gap-14 is 56px, text-5xl is 48px, text-xs is 12px, text-sm is 14px. */
      .doc-member { margin-block: 4rem; }
      .doc-member__role { margin-block-end: 1rem; font-size: 0.75rem;
        font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase;
        color: var(--color-ink-dim); }
      /* No side is named anywhere in this card. In Hebrew the portrait falls at
         the start of the row and the panel overlaps it from the end; the same
         two rules put them the other way round in English. */
      /* stretch, where the catalogue centres, and this took three goes.
         Centring is right when the panel and the picture are near the same
         height, and these two never are: one biography is three paragraphs and
         the other is one, and the English of the first is longer again than its
         Hebrew. Centred, the shorter name began 93px below the top edge of its
         photograph. Aligned at the start, the top edges met and the longest
         biography then hung 168px below the bottom of the picture beside it.
         Stretched, the picture is as tall as the words are: both edges meet at
         once, which is what the owner asked for. */
      .doc-member__row { display: flex; align-items: stretch;
        justify-content: flex-end; }
      /* z-index 1 rather than none, so the frame is a stacking context and the
         wash inside it stays inside it. Without this the wash sits at 10 in the
         page's own stacking order and paints over the panel at 2. */
      /* 500px is the catalogue's height, and it is the floor rather than the
         figure: the frame grows with the biography beside it and never shrinks
         under a short one. The cover fit on the image below is what makes that
         safe, and the sources are 720 by 1000, so there is height in hand to
         crop from at every size this reaches. */
      .doc-member__frame { position: relative; z-index: 1; flex: none;
        inline-size: 360px; min-block-size: 500px; overflow: hidden; }
      .doc-member__frame picture { display: block; block-size: 100%; }
      .doc-member__frame img { inline-size: 100%; block-size: 100%;
        object-fit: cover;
        transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1); }
      .doc-member__frame:hover img { transform: scale(1.05); }
      /* The catalogue washes black up from the foot of the picture. Kept
         literally, because it is what settles a photograph onto a dark ground. */
      .doc-member__veil { position: absolute; inset: 0; z-index: 10;
        pointer-events: none;
        background: linear-gradient(to top, rgb(0 0 0 / 0.2), transparent 50%); }
      /* The overlap is the card's signature: the panel's box tucks 32px under
         the picture. What must NOT tuck under it is the words, and in the
         catalogue nothing does, because the 80px circle stands at the start of
         the lower row and absorbs exactly that much. The circle is not here, so
         the panel pays it back as padding.
         3.75rem rather than the 2rem that merely cancels the overlap: at 2rem
         every line ended flush on the photograph, losing nothing and reading as
         though it had been cut. Measured, on the widest line of each: the ink
         stopped at 603px and the picture began at 603px. The extra 28px is the
         air that makes the two read as separate things. */
      .doc-member__panel { position: relative; z-index: 2;
        margin-inline-start: -2rem; padding-inline-start: 3.75rem;
        inline-size: calc(100% - 320px);
        display: flex; flex-direction: column; gap: 3.5rem; }
      .doc-member__name { margin: 0; font-size: 3rem; line-height: 1.1;
        font-weight: 200; letter-spacing: -0.025em; color: var(--color-ink); }
      .doc-member__name span { font-weight: 400; }
      /* One paragraph or three. The panel's own 3.5rem holds the name off the
         biography; inside it the paragraphs sit at a reading gap. */
      .doc-member__bio { display: flex; flex-direction: column; gap: 1rem; }
      .doc-member__bio p { margin: 0; font-size: 0.875rem; line-height: 1.8;
        color: var(--color-ink-soft); }
      /* The catalogue card is built for a page that is nothing but the card. In
         a 44rem reading column the panel runs out of room first, so below 46rem
         the two stack and the frame gives up its fixed width. */
      @media (max-width: 46rem) {
        .doc-member__row { display: block; }
        .doc-member__frame { inline-size: 100%; max-inline-size: 360px;
          block-size: auto; min-block-size: 0; aspect-ratio: 360 / 500; }
        .doc-member__panel { margin-inline-start: 0; inline-size: 100%;
          gap: 1.5rem; margin-block-start: 1.75rem; }
        .doc-member__name { font-size: 2.25rem; }
      }
      /* THE LIGHT VIEW NEEDS NOTHING HERE, AND ASKING FOR IT BROKE IT.
         Three rules used to sit at this spot, each naming --color-ink-on-light
         for the light view. That reads as the right token and is the wrong one:
         -on-light means "type on the cream plate", and the light view is the
         two grounds trading places, so in it that token holds the CREAM. The
         name was painted cream on cream at 1.05:1 — invisible, which is what the
         owner reported on 30.08.2026 — and the biography and the role went to
         2.12:1.

         The rules above already say --color-ink, --color-ink-soft and
         --color-ink-dim, and those three swap with the view on their own:
         16.93 / 8.39 / 5.41 in the dark view, and on the wheat ground
         --color-ink-dim is the measured #63737a that G7 holds to 4.5:1. The
         correct override is no override. */
      .doc-table { border-collapse: collapse; inline-size: 100%; min-inline-size: 28rem; font-size: 0.95rem; }
      .doc-table th, .doc-table td { text-align: start; padding: 0.7rem 0.9rem; vertical-align: top;
        border-block-end: 1px solid var(--color-onyx-line); }
      .doc-table th { color: var(--color-ink); font-weight: 700; }
      .doc-cta { display: grid; justify-items: start; gap: 1rem;
        margin-block-start: clamp(2.5rem, 6vh, 3.5rem); padding: clamp(1.5rem, 4vw, 2rem);
        border: 1px solid var(--color-onyx-line); border-radius: 16px;
        background: color-mix(in srgb, var(--color-onyx-lift) 82%, transparent); }
      /* The note under the button is a .cap, and a .cap is drawn in
         --color-ink-dim, whose light-view value is measured against the page's
         own wheat ground. This panel is not that ground: it is a lifted plate,
         a shade darker, and the same ink measured 4.38:1 on it where AA asks
         4.5. One step up in the same family clears it on both grounds without
         introducing a colour. Found by G7 on 30.08.2026, the first run after
         the gate was taught to read these pages. */
      .doc-cta .cap { color: var(--color-ink-soft); }
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
      }

      /* ================================================== THE PHONE EDITION
         28.08.2026. These twelve documents were never measured on a phone.
         Three faults, all of them in this bar and this table:

         The running head was 223px tall in Hebrew and 274px in English on an
         844px screen, because four nav pills wrapped over two and three rows
         inside a flex box that was still laid out for a desktop. It is sticky,
         so that was a third of the reading area, permanently, on every one of
         the twelve. It is a two-row grid here — the brand and the switch on
         one line, the chapters on a rail that scrolls sideways on the other —
         and it measures under 120px.

         The comparison table declared a 28rem minimum, which is
         448px, and sat in a 288px column: 160px of it off the side of a 320px
         phone, with no scrollbar drawn to say so, and the second column cut
         mid-word. The minimum goes below 640px and the cells wrap instead.

         The two columns stay two columns. Every one of these tables is a
         comparison — the spreadsheet against InPlace, the order against the
         invoice — and a comparison read one side at a time is not one. The
         header row stays drawn for the same reason: it is the pair of words
         that says which side is which. */
      @media (max-width: 767px) {
        .doc-top__in {
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-areas: "brand switch" "nav nav";
          align-items: center;
          gap: 0.5rem;
          padding-block: 0.55rem;
        }
        .doc-top .brandchip { grid-area: brand; }
        .doc-top .theme-toggle { grid-area: switch; justify-self: end; margin-inline-start: 0; }
        /* One row that scrolls, bleeding to both screen edges so the pill at
           each end is not cut by the reading column's own margin. */
        .doc-top nav {
          grid-area: nav;
          flex-wrap: nowrap;
          overflow-x: auto;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
          margin-inline: -1rem;
          padding-inline: 1rem;
          margin-block-end: -0.35rem;
          padding-block-end: 0.35rem;
          /* The four pills are 484px of content in 390px of screen, so one of
             them is always cut by the edge. Cut, it reads as a fault; faded,
             it reads as the rest of the row, which is what it is. */
          mask-image: linear-gradient(to right, transparent 0, #000 1.25rem, #000 calc(100% - 1.25rem), transparent 100%);
        }
        .doc-top nav::-webkit-scrollbar { display: none; }
        .doc-top nav > * { flex: none; }
      }

      @media (max-width: 639px) {
        .doc-scroll { position: relative; }
        .doc-table { min-inline-size: 0; font-size: 0.92rem; }
        .doc-table th, .doc-table td {
          padding: 0.6rem 0.55rem;
          overflow-wrap: anywhere;
        }
        .doc-table th:first-child, .doc-table td:first-child { padding-inline-start: 0; }
        .doc-table th:last-child, .doc-table td:last-child { padding-inline-end: 0; }
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
        <a class="brandchip" href="${locale === 'he' ? '/' : '/en/'}" aria-label="InPlace">
          <span class="brandchip__fill" aria-hidden="true"></span>
          ${MARK}
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
            .replace('{expert}', fullName(peopleByLocale[locale].nir))
            .replace('{builder}', fullName(peopleByLocale[locale].moshe))
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
    <script>${themeBody(t.toLight, t.toDark)}
    </script>
  </body>
</html>
`
}
