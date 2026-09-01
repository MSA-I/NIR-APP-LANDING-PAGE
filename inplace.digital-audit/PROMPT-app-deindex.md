# Prompt for an agent working in NIR-APP

Copy everything below the line into a new session opened on the **NIR-APP** repository.

---

`app.inplace.digital` is fully indexable by search engines, it is titled "InPlace", and it is
outranking the marketing site at `inplace.digital` for the company's own brand name. Please fix that.
It is an application behind a login and it should not be in a search index at all.

## What I measured on the live host, 01.09.2026

```
app.inplace.digital/robots.txt                     200  text/html      ← not a robots file
app.inplace.digital/                               200  text/html
app.inplace.digital/login                          200  text/html
app.inplace.digital/suppliers                      200  text/html
app.inplace.digital/this-page-does-not-exist-xyz   200  text/html      ← no 404 exists
app.inplace.digital/sitemap.xml                    200  text/html
```

- `<meta name="robots">` is **absent** from the served HTML.
- `<link rel="canonical">` is absent.
- `<title>` is `InPlace`, which is exactly the brand term the marketing site needs to win.
- `public/_redirects` ends with `/* /index.html 200`, which is why every path above answers with the
  application shell. A request for `/robots.txt` gets an HTML document, so there is effectively no
  robots.txt: a crawler asking about crawling rules is handed a web page.

Cloudflare's AI Crawl Control shows crawlers are actively hitting this host: 15 requests for
`app.inplace.digital/sitemap.xml` in 24 hours, all answered with HTML.

## Why it matters, in two ways

1. **It competes with the marketing site for the brand name.** A search for the company currently
   surfaces the application instead of the page written to sell the product.
2. **Internal screens can end up in search results.** Route paths like `/suppliers` return a 200 HTML
   document to anyone, crawler included. Whatever renders after authentication is a separate
   question, but the URLs themselves are indexable today.

## The important subtlety, please do not get this backwards

The instinct is to add `robots.txt` with `Disallow: /`. **On its own that makes the problem worse for
anything already indexed.** A page blocked by robots.txt cannot be fetched, so the crawler never sees
a `noindex`, and already-indexed URLs can persist in results as bare links indefinitely.

The correct order is:

1. **First, allow crawling and serve `noindex`.** Google must be able to fetch the pages in order to
   learn it should drop them.
2. **Only once the URLs are gone from the index**, add `Disallow: /` to a real robots.txt, if you want
   to save the crawl budget at all.

## What to change

**1. `noindex` on everything the host serves.**

Prefer the header over the meta tag: this is a single-page application, and a header covers non-HTML
responses and does not depend on anything rendering. `public/_headers` is read by Cloudflare Pages
from the root of the published output:

```
/*
  X-Robots-Tag: noindex, nofollow
```

Add the meta tag to `index.html` as well if you want belt and braces. They do not conflict.

**2. A real `robots.txt` that still ALLOWS crawling for now.**

Put an actual file at `public/robots.txt`. Cloudflare Pages serves files from `public/` before the
`/*` catch-all in `_redirects`, which is how the marketing site fixed exactly this problem on
27.08.2026, so the file will be served as `text/plain` rather than swallowed by the SPA fallback.

Its content should, for the moment, be:

```
# app.inplace.digital is an application behind a login and is not a search
# surface. Crawling is deliberately ALLOWED so that the X-Robots-Tag: noindex
# in public/_headers can be seen and acted on; a Disallow here would hide that
# header from the crawler and leave already-indexed URLs in place.
#
# Once Search Console reports the URLs gone, this becomes Disallow: /

User-agent: *
Allow: /
```

Write the reason into the file. The next person to read it will otherwise assume the `Allow` is an
oversight and change it.

**3. Do NOT change `/* /index.html 200` to fix the missing 404.**

It is tempting, and it is the wrong trade here. That rule is what makes client-side routing work, and
breaking it to satisfy a crawler would be a real regression for a fake gain: once the host is
`noindex`, a soft 404 costs nothing. Leave it alone.

## Please verify against the live host, not the build

After deploying:

```bash
curl -sI https://app.inplace.digital/ | grep -i x-robots-tag
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://app.inplace.digital/robots.txt
curl -s https://app.inplace.digital/robots.txt
```

Expected: the header present on the first, `200 text/plain` on the second, and the file's own text on
the third. A `text/html` content type means the catch-all is still swallowing it and the fix has not
landed.

If this repository has a live-host verification script, add these as checks to it rather than running
them by hand once. The marketing repository learned this the hard way: its build gate asserted a
property of the file in the repository while the host served something different for days, and only a
check that asked the live host caught it.

## Before you start

Read this repository's `CLAUDE.md`, `AGENTS.md` and `GATES.md` first and follow them. In particular,
find out whether it has gates that must pass before a commit, and whether another session is working
in the tree right now (`git status`, and check for worktrees) — two agents editing one working tree
caused real, wasted debugging on the sibling repository today.

## Not in scope, and please leave alone

- `inplace.digital` and the `LANDING-PAGE-NIR` repository. Separate site, separate repository, already
  audited and fixed.
- What the application renders after authentication. This task is about the URLs being indexable, not
  about auth.

## One thing for the owner, not for you

Once the change is live, the URLs already in Google's index need a removal request in Search Console
(`Removals` → `Temporary removals`) to disappear quickly rather than at the next crawl. Please tell
the owner that this step exists and is theirs; do not attempt it.
