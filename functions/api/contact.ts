// Where a ביזנס enquiry actually goes.
//
// Until 01.09.2026 the contact form's action was `mailto:support@inplace.digital`
// with `method="post"`. On a machine with a registered mail handler that opens a
// compose window the visitor still has to send; on one without — the default
// state of most business desktops running Gmail or Outlook in a browser — the
// press does nothing at all, and the page says nothing either way. Success and
// total failure were indistinguishable, on the only capture path the site has
// for its highest-value customer.
//
// This is a Cloudflare Pages Function, so it deploys with `wrangler pages
// deploy dist` and needs no server. It does not send mail itself: it forwards
// the enquiry as JSON to whatever CONTACT_WEBHOOK names — an email service, a
// Zapier or Make hook, a Slack incoming webhook, the app's own API. That keeps
// the choice of delivery outside the repository and adds no dependency.
//
// WITHOUT CONTACT_WEBHOOK SET, THIS ENDPOINT ANSWERS 503 AND THE PAGE SAYS SO.
// That is deliberate: a silent success would put us back where we started.

// Typed here rather than from @cloudflare/workers-types: tsconfig's `include`
// is ["src"], so this file is never typechecked by `npm run build`, and adding
// a dependency to name one handler shape would be the wrong trade.
interface Env {
  CONTACT_WEBHOOK?: string
}

type Ctx = { request: Request; env: Env }
type Body = Record<string, string>

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

/** Trim, cap, and drop anything that is not a string. */
const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  let raw: Body
  try {
    raw = (await request.json()) as Body
  } catch {
    return json(400, { ok: false, reason: 'bad-json' })
  }

  // The field names are the Hebrew and English labels the form renders, so the
  // enquiry arrives readable in whichever edition it was sent from. They are
  // read positionally here rather than by name for that reason.
  const name = clean(raw.name, 200)
  const business = clean(raw.business, 200)
  const email = clean(raw.email, 320)
  const phone = clean(raw.phone, 60)
  const message = clean(raw.message, 4000)
  const locale = clean(raw.locale, 8) || 'he'

  // The same three the form marks `required`. Validation runs here as well as
  // in the browser because a native form is not the only thing that can POST.
  if (!name || !business || !email) return json(400, { ok: false, reason: 'missing-field' })
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return json(400, { ok: false, reason: 'bad-email' })

  // A bot fills every field it finds. This one is hidden from people and from
  // assistive technology, so anything in it did not come from a visitor.
  if (clean(raw.company_website, 200)) return json(200, { ok: true })

  const hook = env.CONTACT_WEBHOOK
  if (!hook) {
    console.error('CONTACT_WEBHOOK is not set: enquiry received and NOT delivered', { business })
    return json(503, { ok: false, reason: 'no-endpoint' })
  }

  const forwarded = await fetch(hook, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      source: 'inplace.digital contact form',
      locale,
      name,
      business,
      email,
      phone,
      message,
      receivedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
    }),
  })

  if (!forwarded.ok) {
    console.error('CONTACT_WEBHOOK rejected the enquiry', forwarded.status, await forwarded.text())
    return json(502, { ok: false, reason: 'upstream' })
  }

  return json(200, { ok: true })
}
