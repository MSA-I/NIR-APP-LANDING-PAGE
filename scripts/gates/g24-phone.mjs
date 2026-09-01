// G24: the phone edition of the WHOLE site, not just the home page.
//
// G16 measures the React home page and passes. Every fault this gate names was
// found on a phone anyway, because G16 never opens the six supporting pages,
// never focuses a form field, and never asks whether the chapters are reachable
// once the desktop nav is hidden.
//
// The seven measurements, and the fault each one was written against:
//
//   1. The supporting pages' running head was 223px tall in Hebrew and 274px in
//      English, sticky, on an 844px screen: a third of the reading area, spent
//      on four nav pills wrapping over three rows.
//   2. Their brand chip was an EMPTY circle. `.brandchip > span:last-child` is
//      hidden below 480px because the app's chip has an icon underneath, and
//      the static markup had no icon.
//   3. Their comparison table declares `min-inline-size: 28rem` = 448px and sat
//      in a 288px column: 160px of it unreachable at 320px, with no affordance
//      saying it scrolled, and the second column cut mid-word.
//   4. The contact fields computed to 15.68px. iOS Safari zooms the page on
//      focus for anything under 16px, and the reader has to pinch back out.
//   5. The hero fineprint's top and the second action's bottom were the same
//      number at every phone width: zero gap.
//   6. The footer wordmark link was 85x26.5px against a 44px minimum.
//   7. Two plan-card labels computed to 11.2px.
//
// Plus the three the owner decided on 28.08.2026: the chapters are reachable
// from a phone, the way back in is reachable from a phone, and a product screen
// can be opened big enough to read.

import { checker, withPage } from './lib.mjs'

const c = checker('G24')
const PHONES = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
]
const DOCS = ['/procurement-software/', '/vs-spreadsheet/', '/en/vs-spreadsheet/']

// --------------------------------------------------------------- home page
for (const viewport of PHONES) {
  for (const path of ['/', '/en/']) {
    await withPage(
      async (page) => {
        await page.waitForTimeout(500)
        const m = await page.evaluate(() => {
          const box = (el) => {
            if (!el) return null
            const r = el.getBoundingClientRect()
            return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1) }
          }
          const actions = [...document.querySelectorAll('#top .flow')].map(box)
          const fine = document.querySelector('#top .title-hero__fineprint')
          const smallType = [...document.querySelectorAll('p,li,td,dd,dt,summary,span,a')]
            .filter((el) => {
              if (el.children.length) return false
              if ((el.textContent || '').trim().length < 4) return false
              const s = getComputedStyle(el)
              if (s.display === 'none' || s.visibility === 'hidden') return false
              return parseFloat(s.fontSize) < 12
            })
            .map((el) => (el.textContent || '').trim().slice(0, 28) + ' @' + getComputedStyle(el).fontSize)
          const menu = document.querySelector('[data-folio-menu-trigger]')
          const login = document.querySelector('[data-folio-login]')
          const cta = document.querySelector('.folio__actions .flow--primary')
          const screens = [...document.querySelectorAll('#what figure button[data-screen-zoom]')]
          return {
            actions,
            fineTop: fine ? +fine.getBoundingClientRect().top.toFixed(1) : null,
            footerBrand: box(document.querySelector('.footer-brand')),
            inputs: [...document.querySelectorAll('.cform__input')].map((el) => parseFloat(getComputedStyle(el).fontSize)),
            smallType,
            menu: menu ? { ...box(menu), label: menu.getAttribute('aria-label') || '', expanded: menu.getAttribute('aria-expanded') } : null,
            login: login ? { ...box(login), label: login.getAttribute('aria-label') || '' } : null,
            cta: cta
              ? {
                  ...box(cta),
                  label: cta.getAttribute('aria-label') || '',
                  // Whether the word is DRAWN, not whether the string exists:
                  // the label stays in the markup and in the accessible name,
                  // and only the phone stylesheet takes it off the screen.
                  labelDrawn: (() => {
                    const l = cta.querySelector('.flow__label')
                    if (!l) return false
                    const r = l.getBoundingClientRect()
                    return getComputedStyle(l).display !== 'none' && r.width > 0
                  })(),
                  arrows: [...cta.querySelectorAll('.flow__arrow')].filter(
                    (a) => getComputedStyle(a).display !== 'none' && a.getBoundingClientRect().width > 0
                  ).length,
                }
              : null,
            screens: screens.length,
            // The owner's row, 28.08.2026: menu at the reading start, mark in
            // the middle of the ROW, actions at the end. Measured as offsets
            // from the row's start edge so one set of numbers holds in both
            // reading directions.
            row: (() => {
              const row = document.querySelector('.folio__row')
              const brandEl = document.querySelector('.folio__row > .brandchip')
              const acts = document.querySelector('.folio__actions')
              if (!row || !brandEl || !acts || !menu) return null
              const rtl = getComputedStyle(document.documentElement).direction === 'rtl'
              const r = row.getBoundingClientRect()
              // Distance from the row's START edge, whichever side that is.
              const from = (el) => {
                const b = el.getBoundingClientRect()
                return rtl ? r.right - b.right : b.left - r.left
              }
              const mid = (el) => {
                const b = el.getBoundingClientRect()
                return rtl ? r.right - (b.left + b.width / 2) : b.left + b.width / 2 - r.left
              }
              return {
                menuFromStart: +from(menu).toFixed(1),
                actionsFromStart: +from(acts).toFixed(1),
                brandCentreOffset: +(mid(brandEl) - r.width / 2).toFixed(1),
                rowWidth: +r.width.toFixed(1),
                menuOverlapsBrand: (() => {
                  const a = menu.getBoundingClientRect(), b = brandEl.getBoundingClientRect()
                  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
                })(),
                actionsOverlapBrand: (() => {
                  const a = acts.getBoundingClientRect(), b = brandEl.getBoundingClientRect()
                  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
                })(),
              }
            })(),
            plans: (() => {
              const tray = document.querySelector('.plans-tray')
              if (!tray) return null
              // THE SLOT, NOT THE CARD, WHERE THERE IS ONE.
              //
              // What this assertion is for is the RAIL: a ticket held to 72% of
              // the line with the next one peeking in, which the owner struck
              // out on 28.08.2026. What it must not fail on is a card that is
              // deliberately inset inside its own frame — פרו wears a white
              // surround since 01.09.2026 and its card is 9.6px narrower than
              // its slot because of it, which read here as a 246.4px ticket on
              // a 256px line.
              //
              // The plan's FOOTPRINT is the slot. Measuring that keeps the
              // assertion exactly as strong — a rail would shrink the slot too
              // — and stops it failing on 4.8px of frame.
              const cards = [...tray.querySelectorAll('.plan-slot')]
              if (!cards.length) cards.push(...tray.querySelectorAll('.plan-card'))
              const s = getComputedStyle(tray)
              return {
                count: cards.length,
                travel: tray.scrollWidth - tray.clientWidth,
                overflowX: s.overflowX,
                snap: s.scrollSnapType,
                // Every ticket on its own line: no two share a top edge.
                tops: [...new Set(cards.map((el) => Math.round(el.getBoundingClientRect().top)))].length,
                narrowest: cards.length
                  ? +Math.min(...cards.map((el) => el.getBoundingClientRect().width)).toFixed(1)
                  : 0,
                // The tray's CONTENT box: it carries 1rem of padding, and a
                // ticket filling the line fills that, not the padding too.
                available: +(
                  tray.clientWidth -
                  parseFloat(s.paddingLeft) -
                  parseFloat(s.paddingRight)
                ).toFixed(1),
              }
            })(),
          }
        })

        const tag = `${viewport.width}px ${path}`

        // 5. the fineprint has air under the actions
        const lastAction = m.actions.at(-1)
        c.ok(
          lastAction != null && m.fineTop != null && m.fineTop - lastAction.b >= 12,
          `${tag}: hero fineprint sits ${lastAction && m.fineTop != null ? (m.fineTop - lastAction.b).toFixed(1) : '?'}px under the last action`
        )

        // 6. the footer wordmark is a touch target
        c.ok(
          Boolean(m.footerBrand) && m.footerBrand.w >= 44 && m.footerBrand.h >= 44,
          `${tag}: footer brand link is ${m.footerBrand ? `${m.footerBrand.w}x${m.footerBrand.h}` : 'missing'}`
        )

        // 4. no field small enough to zoom iOS on focus
        c.ok(m.inputs.length > 0, `${tag}: no contact fields found to measure`)
        const zoomy = m.inputs.filter((px) => px < 16)
        c.ok(zoomy.length === 0, `${tag}: ${zoomy.length} contact field(s) under 16px (${zoomy.join(',')}) — iOS zooms on focus`)

        // 7. nothing readable is under 12px
        c.ok(
          m.smallType.length === 0,
          `${tag}: type under 12px: ${m.smallType.slice(0, 4).join(' | ')}`
        )

        // the owner's three, 28.08.2026
        c.ok(
          Boolean(m.menu) && m.menu.w >= 44 && m.menu.h >= 44 && m.menu.label.length > 0,
          `${tag}: no phone chapter menu (${m.menu ? `${m.menu.w}x${m.menu.h} "${m.menu.label}"` : 'missing'})`
        )
        // The way back in is still measured, and it is still the owner's
        // requirement of 28.08.2026 — "reachable from a phone". WHERE it is
        // reachable changed on 30.08.2026: it was a wordless icon circle in the
        // row beside the action's wordless icon circle, and two identical
        // circles saying nothing was the question the owner could not answer
        // from the screen. It is the first item in the drawer now, with its
        // word, so the measurement moved into the block below where the drawer
        // is open. Here we only assert it is NOT back in the row.
        // The owner's decision of 28.08.2026: on a phone the action is the
        // arrow and nothing else. Three things have to hold together, and the
        // third is the one that would break silently — a 44px circle with the
        // label hidden AND the arrow hidden is a blank button, which is what
        // the stylesheet did below 360px before this round.
        c.ok(
          Boolean(m.cta) && m.cta.w >= 44 && m.cta.h >= 44 && m.cta.w <= 56,
          `${tag}: folio action is ${m.cta ? `${m.cta.w}x${m.cta.h}` : 'missing'}, not a 44px circle`
        )
        c.ok(Boolean(m.cta) && !m.cta.labelDrawn, `${tag}: folio action still draws its label`)
        c.ok(Boolean(m.cta) && m.cta.label.length > 0, `${tag}: folio action has no accessible name`)
        c.ok(Boolean(m.cta) && m.cta.arrows >= 1, `${tag}: folio action draws nothing at all — no label and no arrow`)
        c.ok(m.screens === 5, `${tag}: ${m.screens} of 5 product screens open to full size`)

        // The row the owner asked for on 28.08.2026.
        c.ok(Boolean(m.row), `${tag}: the folio row could not be measured`)
        if (m.row) {
          c.ok(
            m.row.menuFromStart <= 1,
            `${tag}: the menu is ${m.row.menuFromStart}px from the row's start edge, not at it`
          )
          c.ok(
            m.row.actionsFromStart > m.row.rowWidth / 2,
            `${tag}: the actions start ${m.row.actionsFromStart}px in, on the near half of a ${m.row.rowWidth}px row`
          )
          // Centred against the ROW, which is what "in the middle" means, and
          // not against whatever is left between two groups of unequal width.
          c.ok(
            Math.abs(m.row.brandCentreOffset) <= 2,
            `${tag}: the mark's centre is ${m.row.brandCentreOffset}px off the row's centre`
          )
          c.ok(!m.row.menuOverlapsBrand, `${tag}: the menu overlaps the mark`)
          c.ok(!m.row.actionsOverlapBrand, `${tag}: the actions overlap the mark`)
        }

        // The tickets, one under the next.
        //
        // FOUR AND NOT FIVE SINCE ROUND 20, 01.09.2026, and the count moved
        // because the chapter did rather than because the assertion softened:
        // the owner split the catalogue into two tabs, so the tray this
        // measures is the INDIVIDUAL one and ביזנס is a tray of its own. The
        // business tray is measured below on the same terms, so all five plans
        // are still held to the column; none of them is merely no longer
        // looked at. The whole catalogue is still in the markup at every width,
        // which is what G14 counts.
        c.ok(Boolean(m.plans), `${tag}: the pricing tray could not be measured`)
        if (m.plans) {
          c.ok(m.plans.count === 4, `${tag}: ${m.plans.count} pricing tickets, not 4`)
          c.ok(m.plans.tops === 4, `${tag}: the 4 tickets sit on ${m.plans.tops} rows, not 4`)
          c.ok(
            m.plans.travel <= 1,
            `${tag}: the pricing tray still travels ${m.plans.travel}px sideways`
          )
          c.ok(
            !m.plans.snap.includes('mandatory'),
            `${tag}: the pricing tray still snaps (${m.plans.snap})`
          )
          c.ok(
            m.plans.narrowest >= m.plans.available - 1,
            `${tag}: the narrowest ticket is ${m.plans.narrowest}px of an available ${m.plans.available}px`
          )
        }

        // THE OTHER TAB, ON THE SAME TERMS. ביזנס moved into a tray of its own
        // in round 20, and a tab that is never pressed is a tab nobody
        // measured: this presses it and holds the plan behind it to the same
        // column, the same absence of sideways travel, and the same full width.
        // A BASELINE FIRST, and the reason is a footer that moves. The page
        // carries two marquees (`.logos__run`, `.footer-strip__run`) that run
        // wider than the line inside their own clip, and at 320px on /en/ the
        // footer one reports 8px of document width at some phases of its
        // animation and none at others. Asked as an absolute, this assertion
        // failed about half its runs on a chapter it does not touch. Asked as a
        // DELTA it measures the thing it was written for: what pressing the
        // business tab adds.
        const overflowBefore = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        await page.click('.plans-tabs__tab:nth-child(2)')
        await page.waitForTimeout(350)
        const biz = await page.evaluate(() => {
          const trays = [...document.querySelectorAll('.plans-tray')]
          const tray = trays.find((t) => t.getClientRects().length)
          if (!tray) return null
          const cards = [...tray.querySelectorAll('.plan-slot')]
          const st = getComputedStyle(tray)
          return {
            count: cards.length,
            travel: tray.scrollWidth - tray.clientWidth,
            narrowest: cards.length
              ? +Math.min(...cards.map((el) => el.getBoundingClientRect().width)).toFixed(1)
              : 0,
            available: +(
              tray.clientWidth -
              parseFloat(st.paddingLeft) -
              parseFloat(st.paddingRight)
            ).toFixed(1),
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            // WHAT is over the edge, not just that something is. A bare pixel
            // count sent this round chasing the wrong element twice; the widest
            // offender is the one fact that shortens the search to nothing.
            widest: (() => {
              const limit = document.documentElement.clientWidth
              let worst = null
              for (const el of document.querySelectorAll('body *')) {
                if (el.closest('.plans-compare__scroll, .logos__run')) continue
                const r = el.getBoundingClientRect()
                if (!r.width && !r.height) continue
                const over = Math.max(r.right - limit, -r.left)
                if (over > 0.5 && (!worst || over > worst.over)) {
                  worst = {
                    over: +over.toFixed(1),
                    what: el.tagName.toLowerCase() + '.' + (el.className?.toString?.() || '').split(' ')[0],
                  }
                }
              }
              return worst
            })(),
          }
        })
        c.ok(Boolean(biz), `${tag}: the business tray could not be measured`)
        if (biz) {
          c.ok(biz.count === 1, `${tag}: ${biz.count} business tickets, not 1`)
          c.ok(biz.travel <= 1, `${tag}: the business tray travels ${biz.travel}px sideways`)
          c.ok(
            biz.narrowest >= biz.available - 1,
            `${tag}: the business ticket is ${biz.narrowest}px of an available ${biz.available}px`
          )
          const added = biz.pageOverflow - overflowBefore
          c.ok(
            added <= 1,
            `${tag}: the business tab widens the page by ${added}px` +
              (biz.widest ? ` — widest over the edge: ${biz.widest.what} by ${biz.widest.over}px` : '')
          )
        }
        await page.click('.plans-tabs__tab:nth-child(1)')
        await page.waitForTimeout(250)

        // the menu actually opens and holds the four chapters
        if (m.menu) {
          await page.click('[data-folio-menu-trigger]')
          await page.waitForTimeout(400)
          const open = await page.evaluate(() => {
            const panel = document.querySelector('[data-folio-menu]')
            if (!panel) return null
            const r = panel.getBoundingClientRect()
            const items = [...panel.querySelectorAll('a[href^="#"]')]
            const login = panel.querySelector('[data-folio-login]')
            const loginBox = login?.getBoundingClientRect()
            return {
              visible: r.width > 0 && r.height > 0 && getComputedStyle(panel).visibility !== 'hidden',
              chapters: items.length,
              // The drawer is a modal <dialog> since 30.08.2026, so what has to
              // be true is that the press moved focus INTO it — which is the
              // thing this assertion was written to prove. Naming the first
              // chapter link specifically was naming one implementation of it,
              // and the panel now opens on its own wordmark.
              firstFocused: panel.contains(document.activeElement),
              modal: document.querySelector('dialog.drawer')?.matches(':modal') === true,
              login: login
                ? {
                    w: Math.round(loginBox.width),
                    h: Math.round(loginBox.height),
                    label: (login.getAttribute('aria-label') || login.textContent || '').trim(),
                  }
                : null,
              appMenuSemantics:
                panel.getAttribute('role') === 'menu' ||
                document.querySelector('[data-folio-menu-trigger]')?.getAttribute('aria-haspopup') === 'menu' ||
                items.some((item) => item.getAttribute('role') === 'menuitem'),
              short: items
                .map((el) => el.getBoundingClientRect())
                .filter((r) => r.width < 44 || r.height < 44).length,
              overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            }
          })
          c.ok(Boolean(open) && open.visible, `${tag}: the chapter menu does not open`)
          c.ok(Boolean(open) && open.chapters >= 4, `${tag}: the open menu holds ${open?.chapters} chapters, not 4`)
          c.ok(Boolean(open) && open.firstFocused, `${tag}: opening the chapter navigation does not move focus into it`)
          c.ok(Boolean(open) && open.modal, `${tag}: the drawer is not a modal dialog, so the page behind it is still live`)
          c.ok(
            Boolean(open?.login) && open.login.w >= 44 && open.login.h >= 44 && open.login.label.length > 0,
            `${tag}: no phone way back in inside the drawer (${open?.login ? `${open.login.w}x${open.login.h} "${open.login.label}"` : 'missing'})`
          )
          c.ok(
            m.login === null,
            `${tag}: the way back in is in the row again, beside the action, as two wordless circles`
          )
          c.ok(Boolean(open) && !open.appMenuSemantics, `${tag}: chapter navigation claims application-menu semantics`)
          c.ok(Boolean(open) && open.short === 0, `${tag}: ${open?.short} menu item(s) under 44px`)
          c.ok(Boolean(open) && open.overflow <= 1, `${tag}: the open menu pushes ${open?.overflow}px of horizontal overflow`)

          // Escape closes it and hands focus back, the way the language
          // control beside it already does. A panel that can only be dismissed
          // by pressing somewhere else is a trap for a keyboard.
          await page.keyboard.press('Escape')
          // Waited for rather than slept past: the panel goes when its exit
          // finishes, and that depends on what else is asking for frames.
          await page
            .waitForFunction(() => !document.querySelector('[data-folio-menu]'), { timeout: 3000 })
            .catch(() => {})
          const afterEsc = await page.evaluate(() => ({
            // Gone from the document, not hidden in it: the panel is mounted
            // while it is open and unmounted when its exit finishes.
            hidden: document.querySelector('[data-folio-menu]') === null,
            focused: document.activeElement?.hasAttribute('data-folio-menu-trigger'),
            expanded: document.querySelector('[data-folio-menu-trigger]')?.getAttribute('aria-expanded'),
          }))
          c.ok(afterEsc.hidden === true, `${tag}: Escape does not close the chapter menu`)
          c.ok(afterEsc.focused === true, `${tag}: Escape does not return focus to the menu trigger`)
          c.ok(afterEsc.expanded === 'false', `${tag}: the trigger still reports aria-expanded=${afterEsc.expanded}`)

          // And the keyboard opens it, which a <button> gives for free and a
          // div with an onClick does not. G13 exists because the catalogue
          // component this page borrowed once did exactly that.
          await page.keyboard.press('Enter')
          await page
            .waitForFunction(() => !!document.querySelector('[data-folio-menu]'), { timeout: 3000 })
            .catch(() => {})
          await page.waitForTimeout(200)
          const byKey = await page.evaluate(() => {
            const panel = document.querySelector('[data-folio-menu]')
            return { open: panel !== null, focused: panel?.contains(document.activeElement) === true }
          })
          c.ok(byKey.open, `${tag}: Enter on the trigger does not open the chapter menu`)
          c.ok(byKey.focused === true, `${tag}: keyboard opening does not move focus into the drawer`)
          await page.keyboard.press('Escape')
          await page.waitForTimeout(200)
        }

        // The screen opens, is bigger than the box it came out of, and closes
        // on Escape — the three things the owner asked a press to do.
        const zoomed = await page.evaluate(async () => {
          const shown = document.querySelector('#what [role="tabpanel"]:not([hidden])')
          const inline = shown?.querySelector('img')?.getBoundingClientRect().width || 0
          shown?.querySelector('button[data-screen-zoom]')?.click()
          await new Promise((r) => setTimeout(r, 350))
          const dialog = document.querySelector('dialog.screen-dialog')
          const big = dialog?.querySelector('img')?.getBoundingClientRect().width || 0
          return { open: dialog?.open === true, inline, big, modal: dialog?.matches(':modal') === true }
        })
        c.ok(zoomed.open, `${tag}: pressing a product screen does not open it`)
        c.ok(zoomed.modal, `${tag}: the opened screen is not a modal dialog`)
        c.ok(
          zoomed.big >= zoomed.inline * 2,
          `${tag}: the opened screen is ${zoomed.big.toFixed(0)}px against ${zoomed.inline.toFixed(0)}px in the page — not big enough to be worth opening`
        )
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
        const closed = await page.evaluate(() => document.querySelector('dialog.screen-dialog')?.open === false)
        c.ok(closed, `${tag}: Escape does not close the opened screen`)
      },
      { viewport, reducedMotion: 'reduce', path }
    )
  }
}

// -------------------------------------------------- the supporting documents
for (const viewport of PHONES) {
  for (const path of DOCS) {
    await withPage(
      async (page) => {
        await page.waitForTimeout(300)
        const m = await page.evaluate(() => {
          const el = document.querySelector('.doc-top')
          const chip = document.querySelector('.doc-top .brandchip')
          const marks = chip
            ? [...chip.querySelectorAll('svg,img')].filter((n) => {
                const r = n.getBoundingClientRect()
                return r.width > 8 && r.height > 8 && getComputedStyle(n).display !== 'none'
              }).length
            : 0
          const tables = [...document.querySelectorAll('.doc-table')].map((tb) => {
            const wrap = tb.closest('.doc-scroll')
            return {
              overflow: wrap ? wrap.scrollWidth - wrap.clientWidth : tb.scrollWidth - tb.clientWidth,
              min: getComputedStyle(tb).minInlineSize,
            }
          })
          return {
            topHeight: el ? +el.getBoundingClientRect().height.toFixed(1) : null,
            chipText: chip ? (chip.textContent || '').trim() : null,
            marks,
            tables,
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          }
        })
        const tag = `${viewport.width}px ${path}`

        // 1. the running head is a bar, not a third of the screen
        c.ok(
          m.topHeight != null && m.topHeight <= 132,
          `${tag}: sticky running head is ${m.topHeight}px tall`
        )
        // 2. the brand is visible, not an empty circle
        c.ok(m.marks >= 1, `${tag}: brand chip carries no visible mark (text "${m.chipText}" is hidden below 480px)`)
        // 3. the comparison table fits the column
        for (const [i, t] of m.tables.entries())
          c.ok(t.overflow <= 1, `${tag}: table ${i + 1} overflows its column by ${t.overflow}px (min-inline-size ${t.min})`)
        c.ok(m.pageOverflow <= 1, `${tag}: ${m.pageOverflow}px of horizontal page overflow`)
      },
      { viewport, reducedMotion: 'reduce', path }
    )
  }
}

// ------------------------------------------------- chapter 01, across a switch
//
// The film ships two renders: film.mp4 at 1920x1080 and film-m.mp4 at 810x1440.
// The stylesheet gives the element a 16/10 box above 768px and a 9/16 box below
// it, and the element is `object-fit: cover`, so the wrong cut in the right box
// is not letterboxed — it is cropped to a band out of the middle.
//
// Round eight fixed that for a fresh load in August. The query was read once at
// mount, so it was still broken for every reader who CHANGED width afterwards:
// a rotation, a resized window, or the "desktop site" switch a phone browser
// offers. Loading at 1440 and switching to 390 put film.mp4 in a 218x388 box
// with 68.4% of every frame thrown away; the other direction threw away 64.8%.
// The owner reported it on 28.08.2026 as the film being cut.
{
  const FILM = () => {
    const v = document.querySelector('.film-video')
    if (!v) return null
    const r = v.getBoundingClientRect()
    const boxRatio = r.width / r.height
    const vidRatio = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : null
    const keep = vidRatio ? (boxRatio > vidRatio ? vidRatio / boxRatio : boxRatio / vidRatio) : null
    return {
      src: (v.currentSrc || v.src || '').split('/').pop() || '(none)',
      poster: (v.poster || '').split('/').pop() || '(none)',
      natural: v.videoWidth + 'x' + v.videoHeight,
      box: r.width.toFixed(0) + 'x' + r.height.toFixed(0),
      // The share of every frame the box throws away. Zero is the two cuts
      // agreeing; 68 is the fault above.
      thrownAwayPct: keep == null ? null : +((1 - keep) * 100).toFixed(1),
      phone: matchMedia('(max-width: 767px)').matches,
    }
  }

  const journeys = [
    { name: 'straight to 390', from: [390, 844], to: null, phone: true },
    { name: '1440 then 390', from: [1440, 900], to: [390, 844], phone: true },
    { name: '1024 then 390', from: [1024, 900], to: [390, 844], phone: true },
    { name: '390 then 1440', from: [390, 844], to: [1440, 900], phone: false },
    { name: '390 then 360 (no crossing)', from: [390, 844], to: [360, 780], phone: true },
  ]

  for (const j of journeys) {
    await withPage(
      async (page) => {
        if (j.to) {
          await page.setViewportSize({ width: j.to[0], height: j.to[1] })
          await page.waitForTimeout(900)
        }
        // Stand in the middle of the chapter, where a reader is when they turn
        // the phone over, and give the swapped clip time to open.
        await page.evaluate(() => {
          const s = document.querySelector('[data-film]')
          const r = s.getBoundingClientRect()
          scrollTo(0, r.top + scrollY + r.height * 0.3)
        })
        await page.waitForTimeout(1600)
        const m = await page.evaluate(FILM)
        const tag = `film, ${j.name}`

        c.ok(Boolean(m), `${tag}: no film element`)
        if (!m) return
        c.ok(m.phone === j.phone, `${tag}: the query says phone=${m.phone}, expected ${j.phone}`)
        c.ok(
          m.src === (j.phone ? 'film-m.mp4' : 'film.mp4'),
          `${tag}: the element is playing ${m.src} in a ${m.box} box`
        )
        c.ok(
          m.poster === (j.phone ? 'film-m.webp' : 'film.webp'),
          `${tag}: the poster is ${m.poster}`
        )
        // The measurement that does not care which file it is: how much of the
        // picture survives the box.
        //
        // The two budgets are different because the two compositions are.
        // The phone box is 9/16 and the phone cut is 810x1440, which IS 9/16,
        // so anything above a rounding error there means the wrong file is in
        // the box. The wide box is 16/10 by design and the wide cut is 16/9,
        // so 10% off the width is the desktop framing and has been since the
        // chapter was built — measured at 10.0% on 28.08.2026. The budget is
        // 12% to leave the rounding room and nothing else: a wide cut wrongly
        // dropped into the phone box measures 68%, and a phone cut in the wide
        // box measures 65%, so neither can hide under either number.
        const budget = j.phone ? 3 : 12
        c.ok(
          m.thrownAwayPct != null && m.thrownAwayPct <= budget,
          `${tag}: ${m.thrownAwayPct}% of every frame is cropped away, over a ${budget}% budget (${m.natural} into ${m.box})`
        )
      },
      { viewport: { width: j.from[0], height: j.from[1] } }
    )
  }
}

c.report()
