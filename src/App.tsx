// Build 4, `inplace-aui`. The chapters of build 3, on a live ground.
//
// The order is build 3's order and the copy is build 3's copy, verbatim, out
// of src/content/he.ts. scripts/gates/g2-content-parity.mjs diffs that file
// against archive/build3/i18n/he.js and fails on any drift, because the one
// thing this rebuild was not allowed to change is what the page says.

import t from '@/content/he'
import x from '@/content/extra'
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
import { CloseChapter } from '@/components/CloseChapter'
import { SiteFooter } from '@/components/SiteFooter'

export default function App() {
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
        first={t.title_page.folio}
        links={t.footer.cols[1].links}
        ctaLabel={t.ctaPrimary}
        ctaHref={t.ctaPrimaryHref}
        loginLabel={t.footer.cols[0].links[1].t}
        loginHref={t.footer.cols[0].links[1].href}
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
        />

        <LogoCloud
          eyebrow={x.logos.eyebrow}
          h2={x.logos.h2}
          disclosure={x.logos.disclosure}
          items={x.logos.items}
        />

        <FilmChapter folio={t.film.folio} caption={t.film.caption} blocks={t.film.blocks} />

        <WhatChapter
          folio={t.what.folio}
          eyebrow={t.what.eyebrow}
          h2={t.what.h2}
          lede={t.what.lede}
          stepsLabel={t.what.stepsLabel}
          demoHint={t.what.demoHint}
          steps={t.what.steps}
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

        <Voices
          eyebrow={x.testimonials.eyebrow}
          h2={x.testimonials.h2}
          disclosure={x.testimonials.disclosure}
          items={x.testimonials.items}
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
          ctaLabel={t.ctaPrimary}
          ctaHref={t.ctaPrimaryHref}
          billing={x.billing}
          recommendedLabel={x.billing.recommendedLabel}
          everywhereLabel={x.billing.everywhereLabel}
          everywhere={x.billing.everywhere}
        />

        <FaqChapter folio={t.faq.folio} h2={t.faq.h2} lede={t.faq.lede} items={t.faq.items} />

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
        marquee={t.title_page.index.map((c) => c.t)}
        topLabel={t.title_page.folio}
      />

      <div className="grain" aria-hidden="true" />
    </>
  )
}
