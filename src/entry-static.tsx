// The page, rendered to a string at build time.
//
// WHY
// Every word on this page arrives after the browser has run 442KB of
// JavaScript. Google runs it, so Google sees the page. GPTBot, PerplexityBot
// and ClaudeBot do not, and the SEO audit of 27.08.2026 measured what they get
// instead: 121 characters, against 5,474 in a real browser. The whole argument
// of the page, for the engines that are increasingly how a buyer asks a
// question, was the <noscript> paragraph.
//
// The page is entirely static: one dictionary in, one document out, no
// database, no session, nothing that varies by reader. So the fix is a build
// step, not an architecture.
//
// WHY `reducedMotion: "always"`
// Every move in src/lib/motion.tsx already asks `useReducedMotion()` and
// returns a plain, finished element when the answer is yes: `Reveal` renders a
// bare <div>, `SplitHeading` renders the words without `aria-hidden` and
// without the per-word wrappers. Rendering the static pass under that setting
// therefore produces the semantic document with no `opacity: 0` baked into it
// and no duplicated headline text, without a second renderer to maintain.
//
// WHY THE CLIENT STILL USES `createRoot`
// Not `hydrateRoot`: the client renders WITH motion and the server rendered
// without it, so hydration would be an intentional mismatch. React replaces
// the contents of #root on mount, which is exactly what we want. The static
// markup is there for the readers who never get that far.

import { renderToStaticMarkup } from 'react-dom/server'
import { MotionConfig } from 'motion/react'
import App from './App'
import { contentByLocale, type LocaleCode } from './content/locales'
import site from './content/pages'
import siteEn from './content/pages.en'
import { pageHtml } from './lib/page-html'

// The locale is an argument rather than a lookup: there is no URL here, and
// both documents — dist/index.html and dist/en/index.html — come out of this
// one build.
export function render(locale: LocaleCode = 'he') {
  return renderToStaticMarkup(
    <MotionConfig reducedMotion="always">
      <App locale={locale} />
    </MotionConfig>
  )
}

const ORIGIN = 'https://inplace.digital'

/**
 * The structured data, built from the same dictionary the page renders.
 *
 * Generated rather than hand-written for one reason: the prices. `he.ts` is the
 * catalogue and g14 holds the rendered page to it; a JSON-LD block typed out
 * beside it would be a second catalogue that nothing compares, and the first
 * time a price moved the page and the markup would disagree in public.
 *
 * WHAT IS DELIBERATELY ABSENT
 * - `FAQPage`. Google retired FAQ rich results for every site on 07.05.2026.
 *   There is no SERP feature left to earn, and claiming one is not a reason.
 * - `Review` / `AggregateRating`. The quotes in src/content/extra.ts are marked
 *   `placeholder: true` and the page says in its own words that they are
 *   examples written in-house, not customers. Marking them up as reviews would
 *   turn an honest disclosure into a structured-data violation.
 * - `Review` is still absent; see above. The Organization's registered name,
 *   address and telephone were supplied by the owner on 27.08.2026 and are
 *   here now. They were withheld until then on purpose: an Organization with
 *   an invented address is worse than one without.
 *
 * WHY IT TAKES A LOCALE
 * Each document describes itself in its own language, out of its own dictionary.
 * The English page prints English plan names, and g21 compares every offer in
 * the graph against the names printed in the markup beside it: one Hebrew graph
 * shipped under /en/ would fail that comparison, and deserve to.
 *
 * The prices are NOT the same catalogue in both. Israel is billed in shekels
 * and everywhere else in dollars — two published catalogues in NIR-APP's 0184
 * migration, not one converted at a rate — so the currency travels with the
 * dictionary the offer was read from.
 */
export function schema(locale: LocaleCode = 'he') {
  const d = contentByLocale[locale]
  const url = locale === 'he' ? `${ORIGIN}/` : `${ORIGIN}/${locale}/`
  const lang = locale === 'he' ? 'he-IL' : 'en'

  const currency = locale === 'he' ? 'ILS' : 'USD'

  // Thousands separators out, currency symbol out, decimal point kept. '$1,490'
  // is 1490 and '449 ₪' is 449; a free plan says so in words and declares no
  // digits, so it is read off the word rather than off the string.
  const price = (raw: string) => {
    const digits = raw.replace(/,/g, '').replace(/[^\d.]/g, '')
    if (raw.includes('ללא עלות')) return '0'
    return digits.length ? digits : null
  }

  // "בשיחה" / "Contact us" carries no figure, and neither does the free plan's
  // "No charge": the English page prints no digit there, so it declares no
  // offer there. An offer without a price is not an offer.
  const offers = d.plans.rows
    .map((row) => {
      const amount = price(row.price)
      if (amount === null) return null
      return {
        '@type': 'Offer',
        name: row.name,
        price: amount,
        priceCurrency: currency,
        description:
          locale === 'he'
            ? `${row.docs} מסמכים בחודש. ${row.who}`
            : `${row.docs} documents a month. ${row.who}`,
        url: `${url}#plans`,
        availability: 'https://schema.org/InStock',
      }
    })
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${ORIGIN}/#organization`,
        name: d.brand,
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
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+972-54-254-7074',
            contactType: 'sales',
            availableLanguage: ['he', 'en'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+972-52-416-7881',
            contactType: 'customer support',
            availableLanguage: ['he', 'en'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: d.brand,
        url,
        inLanguage: lang,
        publisher: { '@id': `${ORIGIN}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${url}#software`,
        name: d.brand,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Procurement',
        operatingSystem: 'Web',
        url,
        inLanguage: lang,
        // The title page's lede is two paragraphs; the first is the sentence
        // that says what the product does, which is what a description is for.
        description: d.title_page.lede[0].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
        publisher: { '@id': `${ORIGIN}/#organization` },
        offers,
      },
    ],
  }
}

/**
 * The supporting pages, as finished documents.
 *
 * They are their own answer to their own search, and they carry no client
 * JavaScript: a page of nine hundred words has nothing to hydrate, and the home
 * page's startup bundle would be the heaviest thing on it by an order of
 * magnitude.
 *
 * `css` is the hashed stylesheet from this same build, which the caller reads
 * out of the built home page. That is the only thing these documents need from
 * the application, and it is why they still look like the site.
 */
export function supportingPages(css: string, locale: LocaleCode = 'he') {
  const src = locale === 'he' ? site : siteEn
  return src.pages.map((page) => ({
    // Where the file goes, relative to dist/. The English edition sits under
    // /en/ beside its own home page rather than at the root beside the Hebrew
    // one, so a reader who switched language stays switched.
    slug: locale === 'he' ? page.slug : `en/${page.slug}`,
    title: page.title,
    html: pageHtml(page, src.pages, css, src.cta, locale),
  }))
}
