// Build 4, `inplace-aui`. The chapters of build 3, on a live ground.
//
// The order is build 3's order and the copy is build 3's copy, verbatim, out
// of src/content/he.ts. scripts/gates/g2-content-parity.mjs diffs that file
// against archive/build3/i18n/he.js and fails on any drift, because the one
// thing this rebuild was not allowed to change is what the page says.

import { useEffect } from 'react'
import { contentByLocale, extraByLocale, localeFromPath, type LocaleCode } from '@/content/locales'
import site from '@/content/pages'
import siteEn from '@/content/pages.en'
import { Announcement } from '@/components/Announcement'
import { Folio } from '@/components/Folio'
import { TitlePage } from '@/components/TitlePage'
import { FilmChapter } from '@/components/FilmChapter'
import { WhatChapter } from '@/components/WhatChapter'
import { BoardChapter } from '@/components/BoardChapter'
import { WhyChapter } from '@/components/WhyChapter'
import { LogoCloud } from '@/components/LogoCloud'
import { PlansChapter } from '@/components/PlansChapter'
import { Voices } from '@/components/Voices'
import { FaqChapter } from '@/components/FaqChapter'
import { ContactChapter } from '@/components/ContactChapter'
import { CloseChapter } from '@/components/CloseChapter'
import { SiteFooter } from '@/components/SiteFooter'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'

// `locale` is passed in by the static render in src/entry-static.tsx, which
// runs in Node, where there is no `window` to read a path off. In the browser
// nobody passes it and the path decides, exactly as before.
export default function App({ locale: given }: { locale?: LocaleCode } = {}) {
  const locale = given ?? localeFromPath(window.location.pathname)
  const t = contentByLocale[locale]
  const x = extraByLocale[locale]
  const direction = t.dir as 'rtl' | 'ltr'

  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    document.documentElement.dir = direction
    document.documentElement.dataset.locale = locale
    document.title = t.title
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', t.description)
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', t.title)
    document
      .querySelector<HTMLMetaElement>('meta[property="og:description"]')
      ?.setAttribute('content', t.description)
  }, [direction, locale, t.description, t.htmlLang, t.title])

  return (
    <>
      <a className="skip" href="#what">
        {t.skip}
      </a>

      <Folio
        announcement={
          <Announcement
            text={x.announce.text}
            linkLabel={x.announce.linkLabel}
            href={x.announce.href}
            dismissLabel={x.announce.dismissLabel}
          />
        }
        brand={t.brand}
        links={x.folioNav}
        ctaLabel={t.ctaPrimary}
        ctaHref={t.ctaPrimaryHref}
        loginLabel={t.footer.cols[0].links[1].t}
        loginHref={t.footer.cols[0].links[1].href}
        menuLabels={x.folioMenu}
        themeControl={<ThemeToggle toLight={x.theme.toLight} toDark={x.theme.toDark} />}
        languageControl={
          <LanguageSwitcher
            current={locale}
            label={x.languages.label}
            menuLabel={x.languages.menuLabel}
            currentLabel={x.languages.currentLabel}
            options={x.languages.options}
          />
        }
      />

      <main className="relative z-10 bg-onyx">
        <TitlePage
          folio={t.title_page.folio}
          eyebrow={t.title_page.eyebrow}
          h1={t.title_page.h1}
          lede={t.title_page.lede}
          indexLabel={t.title_page.indexLabel}
          index={t.title_page.index}
          ctaLabel={t.ctaPrimary}
          ctaHref={t.ctaPrimaryHref}
          secondLabel={t.footer.cols[1].links[0].t}
          fineprint={t.fineprint}
          dir={direction}
        />

        <LogoCloud eyebrow={x.logos.eyebrow} h2={x.logos.h2} items={x.logos.items} />

        <FilmChapter folio={t.film.folio} caption={t.film.caption} blocks={t.film.blocks} />

        <WhatChapter
          folio={t.what.folio}
          eyebrow={t.what.eyebrow}
          h2={t.what.h2}
          lede={t.what.lede}
          stepsLabel={t.what.stepsLabel}
          demoHint={t.what.demoHint}
          steps={t.what.steps}
          dir={direction}
          screenAltSuffix={x.accessibility.screenAltSuffix}
          zoomLabel={x.accessibility.zoomScreen}
          closeZoomLabel={x.accessibility.closeScreen}
        />

        <BoardChapter
          h2={t.board.h2}
          p={t.board.p}
          stats={t.board.stats}
          img={t.board.img}
          cap={t.board.cap}
          midLine={t.midAsk.line}
          ctaLabel={t.ctaPrimary}
          ctaHref={t.ctaPrimaryHref}
          fineprint={t.fineprint}
          imageAlt={x.accessibility.dashboardAlt}
        />

        <WhyChapter
          folio={t.why.folio}
          h2={t.why.h2}
          lede={t.why.lede}
          yesLabel={t.why.yesLabel}
          yes={t.why.yes}
          noLabel={t.why.noLabel}
          no={t.why.no}
        />

        <PlansChapter
          folio={t.plans.folio}
          h2={t.plans.h2}
          lede={t.plans.lede}
          tableLabel={t.plans.tableLabel}
          headers={t.plans.headers}
          rows={t.plans.rows}
          priceNote={t.plans.priceNote}
          note={t.plans.note}
          ctaHref={t.ctaPrimaryHref}
          plansCta={x.plansCta}
          billing={x.billing}
          recommendedLabel={x.billing.recommendedLabel}
          everywhereLabel={x.billing.everywhereLabel}
          everywhere={x.billing.everywhere}
        />

        {/* Round twelve, 27.08.2026, on the owner's decision. The quotes used
            to stand between chapter 03 and the prices, which is the place a
            reader is looking for reassurance, and five sentences declaring
            themselves written examples is the weakest thing to hand them
            there. Below the prices they illustrate a decision instead of
            trying to make one, and the logo wall, which is real, is what now
            carries the proof before the ask. */}
        <Voices
          eyebrow={x.testimonials.eyebrow}
          h2={x.testimonials.h2}
          disclosure={x.testimonials.disclosure}
          items={x.testimonials.items}
          dir={direction}
          nextLabel={x.accessibility.nextTestimonial}
          previousLabel={x.accessibility.previousTestimonial}
        />

        {/* The eighth question comes from extra.ts: he.ts is frozen leaf by
            leaf and a new key there fails G2 outright. */}
        <FaqChapter
          folio={t.faq.folio}
          h2={t.faq.h2}
          lede={t.faq.lede}
          items={[...t.faq.items, ...x.faqExtra.items]}
        />

        <ContactChapter
          eyebrow={x.contact.eyebrow}
          h2={x.contact.h2}
          lede={x.contact.lede}
          action={x.contact.action}
          fields={x.contact.fields}
          submit={x.contact.submit}
          fineprint={x.contact.fineprint}
          optional={x.contact.optional}
        />

        <CloseChapter
          folio={t.close.folio}
          h2={t.close.h2}
          sub={t.close.sub}
          p={t.close.p}
          ctaLabel={t.ctaPrimary}
          ctaHref={t.ctaPrimaryHref}
          fineprint={t.fineprint}
        />
      </main>

      <SiteFooter
        brand={t.brand}
        tagline={t.footer.tagline}
        rights={t.footer.rights}
        cols={t.footer.cols}
        // Six supporting pages per edition since 27.08.2026. The legal two are
        // excluded here because the colophon already links them under its own
        // heading, and they exist in Hebrew only.
        more={{
          h: x.moreLabel,
          links: (locale === 'he' ? site.pages : siteEn.pages)
            .filter((p) => !p.legal)
            .map((p) => ({ t: p.nav, href: locale === 'he' ? `/${p.slug}/` : `/en/${p.slug}/` })),
        }}
        marquee={t.title_page.index.map((c) => c.t)}
        topLabel={t.title_page.folio}
      />

      <div className="grain" aria-hidden="true" />
    </>
  )
}
