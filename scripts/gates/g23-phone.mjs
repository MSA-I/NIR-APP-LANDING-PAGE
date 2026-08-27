// G23: the phone edition of the WHOLE site, not just the home page.
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

const c = checker('G23')
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
              const cards = [...tray.querySelectorAll('.plan-card')]
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
        c.ok(
          Boolean(m.login) && m.login.w >= 44 && m.login.h >= 44 && m.login.label.length > 0,
          `${tag}: no phone way back in (${m.login ? `${m.login.w}x${m.login.h} "${m.login.label}"` : 'missing'})`
        )
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

        // The five tickets, one under the next.
        c.ok(Boolean(m.plans), `${tag}: the pricing tray could not be measured`)
        if (m.plans) {
          c.ok(m.plans.count === 5, `${tag}: ${m.plans.count} pricing tickets, not 5`)
          c.ok(m.plans.tops === 5, `${tag}: the 5 tickets sit on ${m.plans.tops} rows, not 5`)
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

        // the menu actually opens and holds the four chapters
        if (m.menu) {
          await page.click('[data-folio-menu-trigger]')
          await page.waitForTimeout(400)
          const open = await page.evaluate(() => {
            const panel = document.querySelector('[data-folio-menu]')
            if (!panel) return null
            const r = panel.getBoundingClientRect()
            const items = [...panel.querySelectorAll('a[href^="#"]')]
            return {
              visible: r.width > 0 && r.height > 0 && getComputedStyle(panel).visibility !== 'hidden',
              chapters: items.length,
              short: items
                .map((el) => el.getBoundingClientRect())
                .filter((r) => r.width < 44 || r.height < 44).length,
              overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            }
          })
          c.ok(Boolean(open) && open.visible, `${tag}: the chapter menu does not open`)
          c.ok(Boolean(open) && open.chapters >= 4, `${tag}: the open menu holds ${open?.chapters} chapters, not 4`)
          c.ok(Boolean(open) && open.short === 0, `${tag}: ${open?.short} menu item(s) under 44px`)
          c.ok(Boolean(open) && open.overflow <= 1, `${tag}: the open menu pushes ${open?.overflow}px of horizontal overflow`)

          // Escape closes it and hands focus back, the way the language
          // control beside it already does. A panel that can only be dismissed
          // by pressing somewhere else is a trap for a keyboard.
          await page.keyboard.press('Escape')
          await page.waitForTimeout(300)
          const afterEsc = await page.evaluate(() => ({
            hidden: document.querySelector('[data-folio-menu]')?.hasAttribute('hidden'),
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
          await page.waitForTimeout(300)
          const byKey = await page.evaluate(
            () => document.querySelector('[data-folio-menu]')?.hasAttribute('hidden') === false
          )
          c.ok(byKey, `${tag}: Enter on the trigger does not open the chapter menu`)
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

c.report()
