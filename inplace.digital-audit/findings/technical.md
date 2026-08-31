# Technical SEO

**Score: 95/100**  (weight 22%)

Audited 31.08.2026 against https://inplace.digital — all 18 published URLs.

## What works

- All four redirect cases correct: http to https 301, www to apex 301, no-slash to slash 308, unknown path to a real 404 carrying noindex at 3.5 KB
- Security headers on every response: HSTS max-age 31536000 includeSubDomains, X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy closing geolocation, microphone, camera and interest-cohort
- Caching correct by class: hashed /assets/* immutable for a year, robots.txt and sitemap.xml one hour, HTML root max-age 0 must-revalidate
- Every page ships complete server-rendered HTML; no JavaScript is required to read the site
- Sitemap generated from the build, lists all 18 URLs with xhtml:link alternates and 24 image:image entries
- Google Search Console verified by DNS TXT record
- Semantic HTML complete: main, nav, footer, header, section, details and a real table
- IndexNow is configured and fires automatically after every successful deploy (.github/workflows/indexnow.yml), reading the live sitemap rather than a built one so it can only announce what is actually served; the key file is discovered by pattern rather than hardcoded, and a failed deploy announces nothing
- The served robots.txt is now guarded by verify-live L8, which parses the file the host actually returns rather than the one in the repository — the gap that let this regression pass unnoticed

## Findings

### [Resolved] Cloudflare published a robots.txt that blocked eight AI crawlers — FIXED

public/robots.txt contains no Disallow and documents in a comment that AI crawlers are deliberately not blocked, and g17-crawl asserts that. The file served at https://inplace.digital/robots.txt opens with a '# BEGIN Cloudflare Managed content' block disallowing Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, CloudflareBrowserRenderingCrawler, Google-Extended, GPTBot and meta-externalagent, plus Content-Signal: ai-train=no. Under the robots.txt specification a named group wins over User-agent: *, so each of those agents reads its own Disallow: / and stops. Googlebot matches User-agent: * and is fully allowed, so ordinary Google Search and AI Overviews are unaffected; PerplexityBot and OAI-SearchBot are not named and remain allowed. The gate passed throughout because it validates the repository file, not the served one. RESOLVED 31.08.2026: Cloudflare's managed robots.txt was set to 'Instruct AI bots to not scrape content'; it is now set to 'Disable robots.txt configuration', so public/robots.txt is served exactly as written. Verified live: the anchored Disallow count is 0, and the Content-Signal line is gone. Guarded against regression by a new check L8 in scripts/verify-live.mjs, which parses the SERVED file the way robots.txt is actually read and names every disallowed agent; it runs in the deploy workflow, so the build goes red if this ever comes back.

**Fix:** Cloudflare dashboard, inplace.digital zone, AI Crawl Control, turn off the managed robots.txt block. Verify with: curl -s https://inplace.digital/robots.txt | grep -c "^Disallow", expecting 0 (anchor to the line start: the repo file mentions the word three times in its own comments, so an unanchored count returns 3 even once fixed; it currently returns 9 anchored). Then extend g17-crawl to fetch the live URL post-deploy so the gate measures what the internet receives.

### [Low] No Content-Security-Policy

Absent, and deliberately so. public/_headers documents the reasoning: Motion writes inline styles on every animated element, so a strict style-src would stop animation without stopping loading, which is the hardest kind of failure to notice. CSP is scheduled for stage 4 as report-only first.

**Fix:** No action now. Recorded so the audit does not read as if it were missed.

### [Info] A third-party beacon is injected on every page

static.cloudflareinsights.com/beacon.min.js loads on all 18 pages. It is not in the repository; Cloudflare Web Analytics adds it. It is the only third-party request on the site.

**Fix:** Confirm the privacy policy names it, since that page already enumerates sub-processors.

