# PRODUCT.md — InPlace marketing landing

register: brand

## What this is

The marketing site for InPlace (inplace.digital): a Hebrew-first,
procure-to-pay control product for SMEs. The site's one job: a business owner
understands within ten seconds what InPlace stops before money leaves, and can
experience it in under a minute (ungated guided demo). The operational product
lives in a separate repo (NIR-APP) and at app.inplace.digital; this repo is the
independent, static-first Astro site.

## Audience

Three buyer roles, one page: business owner (money picture, approvals), office /
procurement (orders, receiving, invoice checks), accountant (approved invoices,
payment, bank). Hebrew-first RTL; English and French mirrors ship from the same
dictionaries.

## Core promise

"רואים לפני שמשלמים." (See it before you pay.) The page proves it with the real
product UI rebuilt as deterministic replicas: a blocked invoice with its
evidence chain, one scroll-driven money-trail narrative, an evidence-first
assistant (question, fact, as_of, source, permission state), a three-role truth
switch, a guided demo, a transparent ROI calculator, and published pricing.

## Non-negotiables (claims policy)

No invented savings percentages, no SLA/uptime numbers, no customer logos, no
user/branch/storage quotas, placeholder customer story stays marked until a
real pilot quote lands. Status colors carry business meaning only. Every demo
number comes from fixtures with real product semantics.

## Quality bars

WCAG 2.1 AA (axe serious+critical = fail), reduced-motion full static page,
no horizontal overflow at 390/768/1024/1440, initial JS <= 170KB gzip, RTL via
logical properties only, trilingual parity enforced by typed dictionaries.
Runnable gates: `npm run verify` + `node tests/e2e.mjs all`; ledger in GATES.md.

## Design authority

DESIGN.md in this repo governs the site (recorded from the shipped build);
docs/BRIEF.md is the execution contract derived from the 24.08.2026 research
document; the product's own design system (Onyx / Oceanic / Wheat / canvas,
Heebo) is the identity anchor.
