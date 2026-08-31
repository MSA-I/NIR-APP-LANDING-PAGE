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
import { contentByLocale, extraByLocale, type LocaleCode } from './content/locales'
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
 * Every screen of the product this site publishes, at full width.
 *
 * Written out rather than read off the dictionaries because they are spread
 * across four files — five stations and a board in `he.ts`, and one per
 * supporting page in `pages.ts` — and the graph wants one absolute list.
 *
 * The narrow `-800` and `-1440` cuts that scripts/build-shots.mjs writes are
 * deliberately absent, and so are the AVIF twins of all of them: they are the
 * same twelve pictures at other sizes and in another format, and offering each
 * six times over would describe a product with seventy-two screens.
 */
const SCREENSHOTS = [
  // The six the home page shows, in the order it shows them.
  'screen-office-orders',
  'screen-office-receiving',
  'screen-office-invoices',
  'screen-owner-exceptions',
  'screen-owner-payment-requests',
  'screen-owner-dashboard',
  // The six the supporting pages show, added 28.08.2026. They are six OTHER
  // screens rather than these six again, on the owner's instruction, and
  // scripts/build-doc-shots.mjs records which page carries which.
  'screen-office-suppliers',
  'screen-office-credits',
  'screen-owner-alerts',
  'screen-office-prices',
  'screen-owner-analytics',
  'screen-accountant-bank',
].map((n) => `${ORIGIN}/assets/${n}.webp`)

/**
 * When the home page's words last changed.
 *
 * The same rule as `DATES` in src/lib/page-html.ts, and for the same reason:
 * change it in the commit that changes what the page says, never in a commit
 * that changes how it looks. A build date here would tell every answer engine
 * that this page was revised this morning, every morning.
 */
const UPDATED = '2026-08-28'

/**
 * Authored copy, as the text a machine should read.
 *
 * Everything in the dictionaries is written for the page: emphasis as <b>, and
 * &nbsp; where two words must not be split across a line. Neither belongs in a
 * schema string, which is read rather than laid out.
 */
const plain = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')

/**
 * The structured data, built from the same dictionary the page renders.
 *
 * Generated rather than hand-written for one reason: the prices. `he.ts` is the
 * catalogue and g14 holds the rendered page to it; a JSON-LD block typed out
 * beside it would be a second catalogue that nothing compares, and the first
 * time a price moved the page and the markup would disagree in public.
 *
 * WHY `FAQPage` IS HERE AFTER ALL
 * It was absent until 28.08.2026, on the ground that Google retired FAQ rich
 * results for every site on 07.05.2026. That reasoning was sound and it was
 * about the wrong reader. A rich result is a SERP feature; this block is not
 * published to earn one. ChatGPT, Perplexity and Claude parse `FAQPage` to
 * lift a question and its answer as a unit, and they do it whether or not
 * Google draws an accordion. The seven answers were already on the page, in
 * native `<details>`, readable with JavaScript switched off; the only thing
 * missing was the declaration that they are questions and answers.
 *
 * It costs nothing to be wrong about this. Google ignores a `FAQPage` it will
 * not render, which is the same thing it did before the block existed.
 *
 * WHAT IS DELIBERATELY ABSENT
 * - `HowTo`. Google retired it as well, and unlike the answers above there is
 *   no set of steps on this page waiting to be declared. It would have to be
 *   written first, and a schema type is not a reason to write copy.
 * - `Review` / `AggregateRating`. The quotes in src/content/extra.ts were
 *   marked `placeholder: true` until 30.08.2026, and the page said in its own
 *   words that they were examples written in-house; marking those up as
 *   reviews would have turned an honest disclosure into a structured-data
 *   violation. They are five real responses now, and both types stay out
 *   anyway: a `Review` wants an author that can be checked and these carry a
 *   first name and one letter, and an `AggregateRating` wants a rating that
 *   nobody was ever asked for.
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
        // The company, somewhere other than here.
        //
        // DEBT.md §21 was open from 28.08.2026 to 31.08.2026 for one reason: no
        // company profile existed, and a `sameAs` pointing at an invented or
        // borrowed address is worse than a missing one. The page exists now.
        //
        // WHY THIS FIELD IS WORTH MORE HERE THAN ON MOST SITES
        // The name is taken twice over. InPlace Software in Australia owns the
        // English-language entity, and Inplace at inplace.co.il owns the Hebrew
        // one. `sameAs` is the mechanism by which a knowledge graph and an answer
        // engine decide which of the three a document is about, and until now
        // nothing on this site answered that question at all.
        //
        // It is the /company/ URL and not the /in/ one. A personal profile was
        // offered first and refused: an `/in/` URL is a Person in LinkedIn's
        // model and in Google's, the owner's decision of 28.08.2026 was that no
        // personal profile is published here, and that profile's stated location
        // contradicted the address three lines below. LinkedIn's own canonical
        // form carries no trailing slash, so neither does this.
        sameAs: ['https://www.linkedin.com/company/inplace-digital'],
        // NO POSTAL ADDRESS AND NO TELEPHONE, by the owner's decision of
        // 31.08.2026, and this is a reversal of his own decision of 27.08.2026.
        //
        // What was here was a street, a locality and two mobile numbers. They
        // were asked for because an Organization with no address is an
        // anonymous one, and because "who is behind this" is the first thing a
        // buyer checks before letting a supplier near his financial system. All
        // of that is still true.
        //
        // What changed is that the site went live and is now crawled. The
        // address was a home and the numbers were personal, and a structured
        // -data block is the one place on a site that exists to be machine-read
        // and republished. The entity is still identified -- legalName, vatID
        // and the LinkedIn edge below -- and it is still reachable, through the
        // address printed on /about/ and the contact form.
        //
        // If a business address and a business number ever exist, they belong
        // here, and this comment can go.
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'support@inplace.digital',
            contactType: 'customer support',
            availableLanguage: ['he', 'en'],
          },
        ],
        // NO `founder` HERE, and the reason is this gate's oldest rule.
        //
        // Until 28.08.2026 the answer this site gave to "who is behind it" was a
        // registration number and an address, which identifies an entity and not
        // a person. Experience is a property of people, and in a subject that is
        // about other people's money every engine weighs that harder. So the two
        // founders are declared now.
        //
        // They are declared on /about/, which is the page that prints them. This
        // home page never names either man, and g21 already holds that an Offer
        // on a page with no price is a claim with no source. A founder on a page
        // that does not name him is the same claim, and the gate said so: it
        // failed the first cut of this block by name.
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
        description: plain(d.title_page.lede[0]),
        publisher: { '@id': `${ORIGIN}/#organization` },
        // The screens the page already shows. They were in the sitemap for
        // image search and in the markup with their alt text, and nowhere in
        // the graph, so nothing tied a picture of the product to the entity
        // that is the product.
        screenshot: SCREENSHOTS,
        offers,
      },
      // The film, declared.
      //
      // The owner's ruling of 28.08.2026, taken with the risk stated: this is a
      // rendered visualisation of the workflow, with no voice and no narrative,
      // and marking it up as a video is a claim that a reader clicking through
      // from a video result gets a video. The page does not hide what it is —
      // the caption below the film opens with the word "visualisation" in both
      // editions, and that same sentence is the `description` here, so the
      // declaration says exactly what the page says.
      //
      // `contentUrl` is the desktop cut. The phone cut is the same film at
      // another size, and offering both would describe two videos.
      {
        '@type': 'VideoObject',
        '@id': `${url}#film`,
        name: d.film.folio,
        description: d.film.caption,
        inLanguage: lang,
        // The film was rebuilt on this date, at the compression the owner
        // approved after reviewing it frame by frame. Change it when the film
        // changes, not when the page does.
        uploadDate: '2026-08-28',
        // 34.88 seconds, from ffprobe. ISO 8601 takes whole seconds.
        duration: 'PT35S',
        thumbnailUrl: `${ORIGIN}/assets/film.webp`,
        contentUrl: `${ORIGIN}/assets/film.mp4`,
        embedUrl: url,
        publisher: { '@id': `${ORIGIN}/#organization` },
      },
      // The document itself. The other three nodes describe the company, the
      // site and the software; none of them described the page a reader is on,
      // which is the node every supporting page has carried since it was
      // written and the home page had not.
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: d.brand,
        description: plain(d.title_page.lede[0]),
        inLanguage: lang,
        dateModified: UPDATED,
        isPartOf: { '@id': `${url}#website` },
        publisher: { '@id': `${ORIGIN}/#organization` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          '@id': `${url}#primaryimage`,
          url: `${ORIGIN}/assets/screen-owner-dashboard.webp`,
          width: 1800,
          height: 1788,
        },
      },
      // Chapter 05, declared as what it already is.
      //
      // Read out of the same two lists App.tsx hands the chapter, in the same
      // order: the seven in `he.ts`, then the eighth in `extra.ts`, which lives
      // there because g2 freezes `he.ts` leaf by leaf and a new key in it fails
      // the build. Declaring only the seven is what the first cut of this node
      // did, and g21 failed it — which is the whole point of comparing the graph
      // with the markup in both directions, exactly as it does for the prices.
      //
      // The answers are authored with <b> and &nbsp; for the page. Schema takes
      // text, so both come out here, and the answer an engine quotes is the
      // sentence a reader reads rather than a fragment of markup.
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        name: plain(d.faq.h2),
        inLanguage: lang,
        isPartOf: { '@id': `${url}#webpage` },
        mainEntity: [...d.faq.items, ...extraByLocale[locale].faqExtra.items].map((item) => ({
          '@type': 'Question',
          name: plain(item.q),
          acceptedAnswer: { '@type': 'Answer', text: plain(item.a) },
        })),
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
