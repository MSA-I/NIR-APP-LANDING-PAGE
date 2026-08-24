# InPlace — Marketing Landing Page

Trilingual (Hebrew-RTL first, English, French) marketing site for
[InPlace](https://github.com/MSA-I/NIR-APP), the procurement-to-payment control
system. Core promise: **"רואים לפני שמשלמים" / "See it before you pay."**

Static-first Astro site, fully separate from the product app: no shared build,
no database, no credentials. Every demo on the page runs on deterministic
fixtures; nothing here can reach production.

## Stack

- **Astro 5** — static HTML for everything content
- **React 19 islands** — guided demo, assistant showcase, ROI calculator (lazy-hydrated)
- **GSAP ScrollTrigger** — exactly one pinned scroll narrative ("the money trail"),
  with a complete static fallback under reduced motion / mobile
- **Plain CSS design tokens** (`src/styles/tokens.css`) — no CSS framework;
  palette and rules documented in [DESIGN.md](DESIGN.md)
- **Heebo** (variable, OFL, self-hosted subsets) — metric twin of the product's
  Hebrew fallback, tabular digits for financial numbers

## Commands

```bash
npm install
npm run dev        # dev server, port 5210
npm run build      # production build to dist/
npm run preview    # serve the build, port 5211
npm run verify     # static gates: i18n, SEO, tokens, sections, pricing truth,
                   # claims policy, RTL discipline, JS budget (<=170KB gzip)
node tests/e2e.mjs all   # Playwright battery: demo/assistant/roi/lang flows,
                         # overflow (390/768/1024/1440 x 3 locales),
                         # reduced-motion, axe a11y, screenshots
```

E2E uses a local Chromium from the Playwright browser cache (see `tests/e2e.mjs`).

## Structure

```
src/
  content/       he.ts en.ts fr.ts (copy dictionaries) · fixtures.ts (demo data)
  components/
    marketing/   the 13 page sections (Astro)
    demo/        GuidedDemo + AssistantShowcase (React islands)
    roi/         RoiCalculator (React island)
  layouts/       Base.astro (SEO, hreflang, JSON-LD, direction contract)
  styles/        tokens.css · global.css · islands.css
scripts/         gate check scripts (check-*.mjs) + static server
tests/           e2e.mjs (Playwright, no framework)
public/
  brand/         InPlace logo set (SVG)
  fonts/         Heebo + Noto Sans Hebrew woff2 subsets (OFL, see LICENSES.md)
  media/         generated hero loop + poster (audit trail in docs/ASSETS.md)
docs/            BRIEF.md · ASSETS.md · FINISH-REVIEW.md
GATES.md         verification ledger (18/20 machine-verified, 2 manual)
```

## Locales

`/` Hebrew (RTL) · `/en/` English · `/fr/` French. The `<html>` element carries
`lang` + `dir` per locale; layout uses logical CSS properties only (enforced by
`scripts/check-rtl.mjs`). A globe switcher in the nav links the three versions;
`hreflang` alternates are emitted on every page. The shekel sign lives in the
Hebrew font subset, which therefore loads on all locales.

## Content rules

Pricing shows the four public plans from the owner's decisions (monthly ILS
before VAT on Hebrew, USD elsewhere; annual = 10 monthly payments; quotas for
documents / scanned pages / assistant questions only). The claims gate
(`scripts/check-claims.mjs`) fails the build on: savings percentages, SLA or
uptime claims, user/storage quotas, invented customer volume, and em-dashes in
prose. The customer quote is a **disclosed placeholder** pending the real pilot
customer's words.

## Media

The ambient hero video was generated via Higgsfield (GPT Image 2 still →
Seedance 2.0 image-to-video with start/end anchors for a seamless loop).
Prompts, rejected takes and the derivation pipeline are logged in
[docs/ASSETS.md](docs/ASSETS.md). The video is desktop-only, lazy, save-data
aware, and poster-only under reduced motion; the page never depends on it.

## Deploy

Not deployed yet. Target: `inplace.digital` (Cloudflare Pages or equivalent) —
the product app moves to `app.inplace.digital` as part of the domain cutover.
Build output is `dist/`, fully static.
