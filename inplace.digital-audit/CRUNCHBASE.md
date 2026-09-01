# Crunchbase listing — InPlace Procurement

Ready to paste. Written 01.09.2026.

Same rule as the LinkedIn page: every claim is taken from what the site already says, so the listing
and the site cannot disagree. Same purpose too, and it is not marketing. It is another external anchor
tying the name to **this** company rather than to InPlace Software in Australia or Inplace at
inplace.co.il, and `sameAs` in the schema is what will point at it once it exists.

Create at **crunchbase.com** → *Add a company* (free account required; a listing usually takes a day
or two to be approved).

---

## The fields

| Field | Value |
|---|---|
| **Organization Name** | `InPlace Procurement` |
| **Also Known As** | `InPlace` |
| **Legal Name** | `In Place` |
| **Website** | `https://inplace.digital` |
| **LinkedIn** | `https://www.linkedin.com/company/inplace-digital` |
| **Headquarters** | HaRotem 14, Kfar Adumim, Israel |
| **Operating Status** | Active |
| **Company Type** | For Profit |
| **Number of Employees** | 1–10 |
| **Contact Email** | `support@inplace.digital` |
| **Phone** | `+972-54-254-7074` |
| **Founded** | *see below* |

**The name carries the category here on purpose.** This is exactly the place a machine has to decide
which InPlace a record is about, which is why the site's schema now declares
`alternateName: "InPlace Procurement"`. *Also Known As* keeps the bare name attached, so a search for
either finds the same record.

---

## Short description

Crunchbase's short description is a single line under the company name. Roughly 200 characters is a
safe target; trim in the form if it objects.

```
InPlace connects purchase orders, goods received and supplier invoices into one chain, and stops a mismatch before the payment leaves the business.
```

---

## Full description

```
InPlace is a procurement-to-payment system for businesses that buy from suppliers regularly.

Three documents describe every purchase: what was ordered, what arrived, and what the supplier is asking to be paid. When one disagrees with the other two, that is the moment a business loses money without knowing it. InPlace compares all three on its own, and a gap stops and waits for a decision instead of surfacing after the transfer has already gone out.

The system connects the whole chain into one source of truth: suppliers, price lists, purchase orders, goods receipt marked from a phone at the receiving door, invoices, credit notes, payment requests, bank transfers and reconciliation.

Three roles work inside it, and the separation between them is structural rather than configurable: the owner approves but does not pay, the procurement manager runs the buying but never touches the bank, and the accountant is the only one who moves money and only against an approved request. There is no emergency route around the approval.

English and Hebrew are both complete editions, right to left included, rather than a translation layer added at the end. Mobile is a first-class surface, because goods receipt happens at the door and not at a desk.

InPlace is not an ERP, not an expense-management tool, and not a metrics dashboard. It does one thing: the journey from the order to the bank transfer.

Operated by In Place, registration number 036689081, Kfar Adumim, Israel.
```

---

## Industries

Crunchbase takes these from a fixed list. Pick from:

```
Procurement · SaaS · Enterprise Software · Small and Medium Businesses · B2B · Supply Chain Management
```

**Do not pick FinTech or Accounting**, tempting as they look. `brand/positioning.md` refuses
spend-management framing in its own words, and the product is procurement-to-payment rather than
accounting. A category that attracts the wrong searches is worse than one fewer category.

---

## Two fields to fill in yourself

**Founded** — I do not know the year. An invented date in a directory that feeds entity matching is
the same mistake as an invented address, and Crunchbase records are widely scraped.

**Founders** — Nir Barmocha and Moshe Senanes, both already named publicly on
[/about/](https://inplace.digital/about/) with their biographies, so listing the names is consistent
with what the site already publishes.

Linking their **personal** LinkedIn profiles is a separate decision, and it runs against the one
recorded in DEBT.md §21: no personal profile is published on the site, because a personal profile
identifies a person and the field in question identifies a company. Crunchbase is not the site, so
it is your call, but it is worth making deliberately rather than because a form had a box.

---

## After it is approved

Send me the URL. It joins `sameAs` beside the LinkedIn page, in `src/entry-static.tsx` and
`src/lib/page-html.ts`, and covers all 30 pages.

---

## Israeli directories, briefly

Lower value each than Crunchbase, and worth it because they are in Hebrew and the Hebrew collision is
the one with an Israeli company:

- **דפי זהב / B144** — the general business directories, and the ones a Hebrew search is most likely
  to surface beside `inplace.co.il`
- **Startup Nation Central** — the Israeli tech ecosystem database, if the product qualifies as a
  startup listing
- **Google Business Profile** — only if you want the address public and are willing to receive
  visitors there. The site is not a local-service business, so this is optional and it comes with a
  physical-address commitment. Skip it if that is not wanted.

Keep the name, address and phone **identical** across every one of them and to the schema. A directory
that disagrees with the site about the address weakens the exact signal all of this exists to build.
