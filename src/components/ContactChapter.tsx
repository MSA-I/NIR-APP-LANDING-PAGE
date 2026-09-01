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
// The form is still NATIVE. The inputs are uncontrolled, validation is the
// browser's, and with the bundle blocked the element still submits to `action`
// on its own — a controlled React form would buy nothing and cost that path.
// What JavaScript adds here is only the two things a native submit to another
// origin cannot give: the request goes to an endpoint that reports whether it
// arrived, and the reader is told which of the three things happened.
//
// Before 01.09.2026 `action` was a mailto: address. On a machine without a
// registered mail handler the press did nothing and the page said nothing, so
// a delivered enquiry and a lost one looked identical. See functions/api/contact.ts.

import { useRef, useState } from 'react'
import { Reveal, RevealGroup, RevealItem, SplitHeading } from '@/lib/motion'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

type States = {
  sending: string
  sent: string
  failed: string
  failedAddress: string
}

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
  states,
  locale,
}: {
  eyebrow: string
  h2: string
  lede: string
  action: string
  fields: Fields
  submit: string
  fineprint: string
  optional: string
  states: States
  locale: string
}) {
  const [status, setStatus] = useState<Status>('idle')
  const formRef = useRef<HTMLFormElement>(null)
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

          {/* `action` and `method` stay on the element so a reader with the
              bundle blocked still submits somewhere. When JavaScript is
              running, onSubmit takes over and posts JSON instead. */}
          <form
            ref={formRef}
            className="cform"
            action={action}
            method="post"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const data = new FormData(form)
              const pick = (label: string) => String(data.get(label) ?? '')
              setStatus('sending')
              try {
                const res = await fetch(action, {
                  method: 'POST',
                  headers: { 'content-type': 'application/json; charset=utf-8' },
                  body: JSON.stringify({
                    name: pick(fields.name),
                    business: pick(fields.business),
                    email: pick(fields.email),
                    phone: pick(fields.phone),
                    message: pick(fields.message),
                    company_website: pick('company_website'),
                    locale,
                  }),
                })
                if (!res.ok) throw new Error(String(res.status))
                setStatus('sent')
                form.reset()
              } catch {
                // Every failure lands here and says so. The address is shown
                // as selectable text in the message, because a reader who has
                // just typed five fields deserves a way through that does not
                // depend on us.
                setStatus('failed')
              }
            }}
          >
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

            {/* Not a real field. Hidden from the layout and from assistive
                technology, and left out of the tab order, so only a bot fills
                it; functions/api/contact.ts drops anything that arrives in it. */}
            <div className="cform__trap" aria-hidden="true">
              <label htmlFor="c-company-website">Company website</label>
              <input id="c-company-website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <Reveal delay={0.12}>
              <div className="cform__foot">
                <button className="cform__submit" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? states.sending : submit}
                </button>
                <p className="fineprint">{fineprint}</p>
              </div>
            </Reveal>

            {/* One region for all three outcomes, polite rather than assertive:
                the reader pressed the button, so the answer is expected and
                does not need to interrupt what they are doing. It carries the
                status role so it is announced without moving focus. */}
            <p className="cform__status" role="status" aria-live="polite" data-state={status}>
              {status === 'sent' ? states.sent : null}
              {status === 'failed' ? (
                <>
                  {states.failed}{' '}
                  <a className="cform__status-mail" href={`mailto:${states.failedAddress}`}>
                    {states.failedAddress}
                  </a>
                </>
              ) : null}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
