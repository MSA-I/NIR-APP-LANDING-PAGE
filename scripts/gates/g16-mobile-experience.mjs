// G16: the marketing page behaves like a phone experience, not a squeezed
// desktop composition. Measurements cover narrow iPhone and Android widths,
// touch targets, horizontal containment and the primary conversion path.

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { checker, ROOT, scrollTo, withPage } from './lib.mjs'

const c = checker('G16')
const EVIDENCE = path.join(ROOT, '.unlazy', 'mobile', 'evidence')
const VIEWPORTS = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
]
const STOPS = [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1]
const SHOTS = [
  ['top', '#top'],
  ['film', '[data-film]'],
  ['what', '#what'],
  ['voices', '#voices'],
  ['plans', '#plans'],
  ['faq', '#faq'],
  ['footer', '.footer-panel'],
]

await mkdir(EVIDENCE, { recursive: true })

for (const viewport of VIEWPORTS) {
  await withPage(
    async (page, { errors }) => {
      await page.waitForTimeout(700)

      const base = await page.evaluate(() => {
        const doc = document.documentElement
        const header = document.querySelector('header')?.getBoundingClientRect()
        const plate = document.querySelector('#top .plate')?.getBoundingClientRect()
        const primary = document.querySelector('#top .flow--primary')?.getBoundingClientRect()
        const h1 = document.querySelector('h1')
        const h1Style = h1 ? getComputedStyle(h1) : null
        const plans = document.querySelector('.plans-tray')
        const plansStyle = plans ? getComputedStyle(plans) : null

        const touchSelector = [
          'a.flow',
          'a.brandchip',
          'a.announce__link',
          'button.announce__close',
          'button.plans-switch__track',
          'button.language-switcher__trigger',
          '#what [role="tab"]',
          '.voices-rail__controls button',
          'summary.faq-card__q',
          'a.footer-top',
        ].join(',')
        const targets = [...document.querySelectorAll(touchSelector)]
          .map((el) => {
            const r = el.getBoundingClientRect()
            const s = getComputedStyle(el)
            return {
              name:
                el.getAttribute('aria-label') ||
                el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 34) ||
                el.className,
              width: r.width,
              height: r.height,
              display: s.display,
              visibility: s.visibility,
            }
          })
          .filter((x) => x.display !== 'none' && x.visibility !== 'hidden' && x.width > 0 && x.height > 0)

        const textSelector = 'h1,h2,h3,p,li,summary'
        const escapedText = [...document.querySelectorAll(textSelector)]
          .filter(
            (el) =>
              !el.closest('[aria-hidden="true"],.logos__run,.footer-strip,.plans-tray')
          )
          .map((el) => {
            const r = el.getBoundingClientRect()
            const s = getComputedStyle(el)
            return {
              text: el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 42),
              start: r.left,
              end: r.right,
              width: r.width,
              display: s.display,
              visibility: s.visibility,
            }
          })
          .filter(
            (x) =>
              x.text &&
              x.display !== 'none' &&
              x.visibility !== 'hidden' &&
              x.width > 0 &&
              (x.start < -1 || x.end > innerWidth + 1)
          )

        return {
          direction: getComputedStyle(doc).direction,
          width: doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          headerBottom: header?.bottom ?? -1,
          plateTop: plate?.top ?? -1,
          primary: primary
            ? { width: primary.width, height: primary.height, top: primary.top, bottom: primary.bottom }
            : null,
          h1Size: h1Style ? parseFloat(h1Style.fontSize) : 0,
          h1LineHeight: h1Style ? parseFloat(h1Style.lineHeight) : 0,
          planColumns: plansStyle?.gridTemplateColumns || '',
          planOverflow: plansStyle?.overflowX || '',
          planSnap: plansStyle?.scrollSnapType || '',
          planScrollWidth: plans?.scrollWidth || 0,
          planClientWidth: plans?.clientWidth || 0,
          // The tray's CONTENT box. `clientWidth` includes its 1rem of padding,
          // and a ticket filling the line fills the content box, not the
          // padding as well: measured against `clientWidth` a correct 254px
          // ticket read as 32px short.
          planContentWidth: plans
            ? plans.clientWidth -
              parseFloat(plansStyle?.paddingLeft || '0') -
              parseFloat(plansStyle?.paddingRight || '0')
            : 0,
          planCardWidth: plans?.querySelector('.plan-card')?.getBoundingClientRect().width || 0,
          targets,
          escapedText,
        }
      })

      c.ok(base.direction === 'rtl', `${viewport.width}px: root direction is ${base.direction}, not rtl`)
      c.ok(
        Math.abs(base.scrollWidth - base.width) <= 1,
        `${viewport.width}px: ${base.scrollWidth - base.width}px horizontal overflow at page load`
      )
      c.ok(
        base.plateTop >= base.headerBottom - 1,
        `${viewport.width}px: fixed header overlaps the hero by ${(base.headerBottom - base.plateTop).toFixed(1)}px`
      )
      c.ok(Boolean(base.primary), `${viewport.width}px: hero primary action is missing`)
      if (base.primary) {
        c.ok(
          base.primary.width >= 44 && base.primary.height >= 44,
          `${viewport.width}px: hero primary action is ${base.primary.width.toFixed(1)}x${base.primary.height.toFixed(1)}px`
        )
        c.ok(
          base.primary.top < viewport.height * 1.25,
          `${viewport.width}px: hero primary action begins below the first 1.25 viewports at ${base.primary.top.toFixed(1)}px`
        )
      }
      c.ok(
        base.h1Size >= 38 && base.h1LineHeight >= 38,
        `${viewport.width}px: hero type is too small or cramped (${base.h1Size}px / ${base.h1LineHeight}px)`
      )
      /* THE PRICING TICKETS, RE-DECIDED 28.08.2026.
         These four assertions used to require the opposite of what they
         require now: `overflow-x: auto`, more than 40px of horizontal travel,
         a mandatory inline snap, and a ticket between 70% and 78% of the
         viewport. That is the rail pattern, it is what a phone usually wants,
         and it was measured and green from the day it was written.

         The owner reversed it on 28.08.2026, and the reason is this chapter
         rather than the pattern: a rail shows one plan and a slice of the
         next, and a reader comparing five prices has to hold the one that
         scrolled away in their head to compare it with the one on screen. Read
         down the page all five are present.

         A gate is not evidence if it keeps passing whichever way the page is
         built, so these do not become notes. They now measure the column, and
         they fail on the rail exactly as the old four failed on the column. */
      c.ok(
        base.planOverflow !== 'auto' && base.planOverflow !== 'scroll',
        `${viewport.width}px: pricing tickets are still a sideways rail (overflow-x: ${base.planOverflow})`
      )
      c.ok(
        base.planScrollWidth <= base.planClientWidth + 1,
        `${viewport.width}px: pricing tickets have ${base.planScrollWidth - base.planClientWidth}px of horizontal travel`
      )
      c.ok(
        !base.planSnap.includes('mandatory'),
        `${viewport.width}px: pricing tickets still snap (${base.planSnap})`
      )
      c.ok(
        base.planCardWidth >= base.planContentWidth - 1,
        `${viewport.width}px: pricing ticket is ${base.planCardWidth.toFixed(1)}px of an available ${base.planContentWidth}px (${base.planColumns})`
      )

      const shortTargets = base.targets.filter((x) => x.width < 44 || x.height < 44)
      c.ok(
        shortTargets.length === 0,
        `${viewport.width}px: undersized touch targets: ${shortTargets
          .slice(0, 8)
          .map((x) => `${x.name} ${x.width.toFixed(0)}x${x.height.toFixed(0)}`)
          .join(' | ')}`
      )
      c.ok(
        base.escapedText.length === 0,
        `${viewport.width}px: meaningful text escapes the viewport: ${base.escapedText
          .slice(0, 6)
          .map((x) => x.text)
          .join(' | ')}`
      )

      let worstOverflow = 0
      for (const stop of STOPS) {
        await scrollTo(page, stop)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        worstOverflow = Math.max(worstOverflow, overflow)
      }
      c.ok(worstOverflow <= 1, `${viewport.width}px: worst horizontal overflow is ${worstOverflow}px`)

      await scrollTo(page, 0.18)
      await page.waitForTimeout(420)
      const compactHeader = await page.evaluate(() => {
        const header = document.querySelector('header')
        const notice = document.querySelector('.announce')?.getBoundingClientRect()
        const row = document.querySelector('.folio__row')?.getBoundingClientRect()
        return {
          lifted: header?.getAttribute('data-lifted'),
          noticeBottom: notice?.bottom ?? 999,
          rowTop: row?.top ?? -999,
          rowBottom: row?.bottom ?? 999,
        }
      })
      c.ok(compactHeader.lifted === 'true', `${viewport.width}px: mobile folio never enters compact state`)
      c.ok(
        compactHeader.noticeBottom <= 1 && compactHeader.rowTop >= -1 && compactHeader.rowBottom <= 70,
        `${viewport.width}px: compact folio geometry is notice ${compactHeader.noticeBottom.toFixed(1)}, row ${compactHeader.rowTop.toFixed(1)}-${compactHeader.rowBottom.toFixed(1)}`
      )
      c.ok(errors.length === 0, `${viewport.width}px: browser errors: ${errors.slice(0, 3).join(' | ')}`)

      for (const [name, selector] of SHOTS) {
        const found = await page.$(selector)
        c.ok(Boolean(found), `${viewport.width}px: screenshot anchor ${selector} is missing`)
        if (!found) continue
        await page.evaluate((target) => {
          document.querySelector(target)?.scrollIntoView({ block: 'start', behavior: 'instant' })
        }, selector)
        await page.waitForTimeout(180)
        await page.screenshot({
          path: path.join(EVIDENCE, `${viewport.width}-${name}.png`),
          animations: 'disabled',
        })
      }

      c.note(
        `${viewport.width}px: ${base.targets.length} touch targets measured, ${STOPS.length} scroll positions clean`
      )
    },
    { viewport, reducedMotion: 'reduce' }
  )
}

c.report()
