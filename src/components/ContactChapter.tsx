// The destination of the ביזנס plan card.
//
// Anatomy from 21st.dev's contact form (@meschacirung, Tailark): a labelled
// pair of columns, a message area under them, one submit, and the fineprint
// beside it. Repainted on this page's own vocabulary rather than imported,
// which is what happened to the flow button, the plan cards, the FAQ panels
// and the colophon before it. The catalogue version is built on shadcn's Card,
// Input, Textarea, Select, Label and Button; this project has none of those and
// should not acquire a component kit to ask four questions.
//
// No JavaScript runs this form. It is a native <form> with native validation
// and a native submit, so it works with the bundle blocked, it is keyboard and
// screen-reader operable without any work from us, and there is no state to get
// out of sync. A controlled React form here would buy nothing and cost the
// no-JS path.
//
// Where a submission GOES is `x.contact.action`, and it is the one claim on
// this page that the repository cannot verify. See the note there.

import { Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Fields = {
  name: string
  business: string
  email: string
  phone: string
  message: string
  messageHint: string
}

export function ContactChapter({
  eyebrow,
  h2,
  lede,
  action,
  fields,
  submit,
  fineprint,
  optional,
}: {
  eyebrow: string
  h2: string
  lede: string
  action: string
  fields: Fields
  submit: string
  fineprint: string
  optional: string
}) {
  // No `data-folio`. The running head numbers the printed chapters, and this is
  // not one of them: it is where the ביזנס card lands. The quotes section is
  // folioless for the same reason.
  //
  // The plate takes the page's own onyx rather than the lift the film and the
  // board use. On the lift, the accent the eyebrow is set in measures 4.48:1
  // against the ground and G7 wants 4.5. Two hundredths is not worth arguing
  // with when the darker ground is the one the title page and the close sit on.
  return (
    <section id="contact" className="py-[clamp(2rem,5vh,3.5rem)]">
      <div className="plate crops border border-onyx-line/70 bg-onyx py-[clamp(3.5rem,9vh,6rem)]">
        <span className="crops__b" aria-hidden="true" />

        <div className="wrap grid gap-[clamp(2.5rem,6vh,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-16">
          <header>
            <Reveal>
              <p className="eyebrow mb-5">{eyebrow}</p>
            </Reveal>
            <SplitHeading className="h-big max-w-[16ch]" text={h2} tint={1} />
            <Reveal delay={0.08}>
              <p className="lede mt-6 max-w-[42ch]">{lede}</p>
            </Reveal>
          </header>

          {/* method="post" and text/plain, because the action is a mailto:
              address: without them the fields arrive percent-encoded on one
              line and nobody can read the enquiry they were sent. */}
          <form className="cform" action={action} method="post" encType="text/plain">
            <RevealGroup className="cform__grid" each={0.05}>
              <RevealItem className="cform__row">
                <label className="cform__label" htmlFor="c-name">
                  {fields.name}
                </label>
                <input
                  className="cform__input"
                  id="c-name"
                  name={fields.name}
                  type="text"
                  autoComplete="name"
                  required
                />
              </RevealItem>

              <RevealItem className="cform__row">
                <label className="cform__label" htmlFor="c-business">
                  {fields.business}
                </label>
                <input
                  className="cform__input"
                  id="c-business"
                  name={fields.business}
                  type="text"
                  autoComplete="organization"
                  required
                />
              </RevealItem>

              <RevealItem className="cform__row">
                <label className="cform__label" htmlFor="c-email">
                  {fields.email}
                </label>
                <input
                  className="cform__input"
                  id="c-email"
                  name={fields.email}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  required
                />
              </RevealItem>

              <RevealItem className="cform__row">
                <label className="cform__label" htmlFor="c-phone">
                  {fields.phone}
                  <span className="cform__optional">{optional}</span>
                </label>
                <input
                  className="cform__input"
                  id="c-phone"
                  name={fields.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                />
              </RevealItem>

              <RevealItem className="cform__row cform__row--wide">
                <label className="cform__label" htmlFor="c-message">
                  {fields.message}
                  <span className="cform__optional">{optional}</span>
                </label>
                <textarea
                  className="cform__input cform__input--area"
                  id="c-message"
                  name={fields.message}
                  rows={4}
                  placeholder={fields.messageHint}
                />
              </RevealItem>
            </RevealGroup>

            <Reveal delay={0.12}>
              <div className="cform__foot">
                <button className="cform__submit" type="submit">
                  {submit}
                </button>
                <p className="fineprint">{fineprint}</p>
              </div>
            </Reveal>
          </form>
        </div>
      </div>
    </section>
  )
}
