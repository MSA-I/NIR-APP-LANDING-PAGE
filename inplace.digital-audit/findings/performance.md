# Performance (CWV)

**Score: 90/100**  (weight 10%)

Audited 31.08.2026 against https://inplace.digital.

## What works

- CLS is 0 on both desktop and mobile, with no layout shift events recorded at all
- TTFB 80 ms desktop, 283 ms mobile; DOM interactive 151 ms; load 419 ms desktop and 643 ms mobile
- 21 requests and 421 KB total transfer; compressed payloads are main JS 107 KB, Motion 46 KB, icons 6 KB, CSS 19 KB, fonts 12-32 KB, all brotli
- Repeated HTML fetches returned in 149-348 ms
- The 10 MB films use preload=metadata, so the bytes are never fetched on page view

## Findings

### [Low] Six client logos are preloaded at highest priority

Six link rel=preload as=image hints in the head fetch the trusted-by logo strip, which sits below the hero. They also carry loading=eager and decoding=sync. This places six below-fold images ahead of the LCP element in the fetch queue. On a fast connection it costs nothing; on 3G it delays the headline.

**Fix:** Drop the preload hints and let the logos load normally, or keep at most one if the strip is genuinely above the fold on desktop.

### [Info] LCP could not be measured and no field data exists

The embedded browser suppresses paint timing entries, so no LCP figure was obtained. CrUX has no data because the site went live 28.08.2026 and is below the reporting threshold. PageSpeed Insights returned a quota error because no GOOGLE_API_KEY is configured. Given CLS of 0, a 419 ms load and server-rendered HTML, LCP is very likely inside the 2.5 s threshold, but this is inference rather than measurement.

**Fix:** Confirm in PageSpeed Insights once an API key is configured, and watch CrUX once the traffic threshold is met.

