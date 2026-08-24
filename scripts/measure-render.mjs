/* Render truths, MEASURED. Adopted after the 24.08 critique found a chapter tint
   below the perception threshold and a chapter numeral that never painted: both
   passed source review. Source is not evidence for anything visible.
   Usage: node scripts/measure-render.mjs */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const MS_PW = 'C:/Users/art1/AppData/Local/ms-playwright';
const exe = () => {
  const dirs = readdirSync(MS_PW).filter((d) => d.startsWith('chromium-')).sort();
  return join(MS_PW, dirs.at(-1), 'chrome-win64', 'chrome.exe');
};
const BASE = 'http://localhost:5212';
const fail = (m) => {
  console.error('FAIL:', m);
  process.exit(1);
};

const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => srgbToLin(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const parseRgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

const server = await serve();
const browser = await chromium.launch({ executablePath: exe() });
const out = [];

try {
  // ---- 1. Chapter grounds must be perceptibly different -------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const sample = async (sel) => {
      await p.locator(sel).scrollIntoViewIfNeeded();
      await p.waitForTimeout(1100); // the 800ms morph plus slack
      return p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    };
    const warm = parseRgb(await sample('#roi'));
    const cool = parseRgb(await sample('#assistant'));
    const lumDelta = Math.abs(luminance(warm) - luminance(cool));
    const chanDelta = Math.max(...warm.map((v, i) => Math.abs(v - cool[i])));
    out.push(`chapter tint: warm=rgb(${warm}) cool=rgb(${cool}) lumDelta=${lumDelta.toFixed(4)} maxChannelDelta=${chanDelta}`);
    if (chanDelta < 6) fail(`chapter tint imperceptible: max channel delta ${chanDelta} (want >= 6)`);
    await ctx.close();
  }

  // ---- 2. Every chapter numeral must actually paint ------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const numerals = await p.evaluate(() => {
      const sels = ['.leaks > .container', '.trail > .container', '#demo > .container'];
      return sels.map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { sel, ok: false, reason: 'element missing' };
        const cs = getComputedStyle(el, '::after');
        const painted =
          cs.content && cs.content !== 'none' && cs.content !== 'normal' && parseFloat(cs.fontSize) > 40;
        // A numeral behind an opaque ancestor background is not visible: the
        // section must open its own stacking context for z-index:-1 to work.
        const section = el.parentElement;
        const secStyle = getComputedStyle(section);
        const hasOpaqueBg =
          secStyle.backgroundImage !== 'none' ||
          (secStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && secStyle.backgroundColor !== 'transparent');
        const opensContext = secStyle.zIndex !== 'auto' || secStyle.isolation === 'isolate';
        return { sel, ok: painted, content: cs.content, fontSize: cs.fontSize, hasOpaqueBg, opensContext };
      });
    });
    for (const n of numerals) {
      out.push(`numeral ${n.sel}: content=${n.content} size=${n.fontSize} opaqueBg=${n.hasOpaqueBg} stackingContext=${n.opensContext}`);
      if (!n.ok) fail(`numeral not rendered for ${n.sel}`);
      if (n.hasOpaqueBg && !n.opensContext) fail(`${n.sel}: z-index:-1 numeral hidden behind its own section background`);
    }
    await ctx.close();
  }

  // ---- 3. The spine must not sit under the scrollbar ----------------------
  for (const [path, name] of [['/', 'he/rtl'], ['/en/', 'en/ltr']]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const geo = await p.evaluate(() => {
      const spine = document.querySelector('.spine');
      if (!spine) return null;
      const r = spine.getBoundingClientRect();
      const root = document.documentElement.getBoundingClientRect();
      return {
        spineCenter: r.left + r.width / 2,
        clientWidth: document.documentElement.clientWidth,
        innerWidth: window.innerWidth,
        rootLeft: root.left,
      };
    });
    if (!geo) fail(`${name}: spine missing`);
    const sbWidth = geo.innerWidth - geo.clientWidth;
    // rootLeft > 0 means the browser put the scrollbar on the left edge.
    const scrollbarOnLeft = geo.rootLeft > 1;
    const spineOnLeft = geo.spineCenter < geo.innerWidth / 2;
    const clash = sbWidth > 0 && scrollbarOnLeft === spineOnLeft;
    out.push(
      `spine ${name}: center=${Math.round(geo.spineCenter)}px scrollbar=${sbWidth}px on ${scrollbarOnLeft ? 'left' : 'right'}, spine on ${spineOnLeft ? 'left' : 'right'}`
    );
    if (clash) fail(`${name}: spine shares its edge with the scrollbar`);
    await ctx.close();
  }

  // ---- 4. Hero choreography must finish fast ------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const worst = await p.evaluate(() => {
      const els = [...document.querySelectorAll('.hero h1 .w, .hero .sub, .hero .ctas, .hero .hero-visual, .hero .chips .badge')];
      return Math.max(
        ...els.map((el) => {
          const cs = getComputedStyle(el);
          const d = (cs.animationDelay.split(',')[0] || '0s').trim();
          const u = (cs.animationDuration.split(',')[0] || '0s').trim();
          const ms = (v) => (v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000);
          return ms(d) + ms(u);
        })
      );
    });
    out.push(`hero choreography settles at ${Math.round(worst)}ms`);
    if (worst > 1000) fail(`hero choreography too slow: ${Math.round(worst)}ms (want <= 1000)`);
    await ctx.close();
  }

  // ---- 5. Latin locales must not use the Hebrew display face -------------
  for (const [path, name, wantSuez] of [['/', 'he', true], ['/en/', 'en', false], ['/fr/', 'fr', false]]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    const fam = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily);
    const hasSuez = /Suez/i.test(fam);
    out.push(`h1 font ${name}: ${fam}`);
    if (hasSuez !== wantSuez) fail(`${name}: h1 Suez One presence is ${hasSuez}, expected ${wantSuez}`);
    await ctx.close();
  }

  // ---- 6. One selected-state color across every pill group ---------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    for (const sel of ['#assistant', '#roles', '#demo', '#pricing']) await p.locator(sel).scrollIntoViewIfNeeded();
    await p.waitForTimeout(700);
    const colors = await p.evaluate(() =>
      [
        ['assistant', '.asst-pill.on'],
        ['roles', '.roles-tab[aria-selected="true"]'],
        ['demo', '[data-demo-root] .asst-pill.on'],
        ['pricing', '.period-toggle button[aria-checked="true"]'],
      ]
        .map(([name, sel]) => {
          const el = document.querySelector(sel);
          return el ? { name, bg: getComputedStyle(el).backgroundColor } : { name, bg: 'MISSING' };
        })
    );
    out.push('selected states: ' + colors.map((c) => `${c.name}=${c.bg}`).join(' '));
    const unique = new Set(colors.map((c) => c.bg));
    if (unique.size !== 1) fail(`pill groups disagree on the selected color: ${[...unique].join(' vs ')}`);
    await ctx.close();
  }

  // ---- 7. as_of must be generated, not frozen ---------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.locator('#assistant').scrollIntoViewIfNeeded();
    await p.locator('.asst-card').waitFor({ state: 'visible' });
    const text = await p.locator('.asst-card').innerText();
    const today = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
    out.push(`as_of on page contains today (${today}): ${text.includes(today)}`);
    if (!text.includes(today)) fail(`as_of is not today's date (expected ${today})`);
    await ctx.close();
  }

  // ---- 8. The hero replica must reach assistive tech ---------------------
  // role="img" on the wrapper was technically valid, so axe passed while the
  // page's whole opening proof was invisible to screen readers.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    // playwright-core exposes the CDP accessibility domain; the legacy
    // page.accessibility helper is not available in this build.
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Accessibility.enable');
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const flat = JSON.stringify(nodes.map((n) => n.name?.value).filter(Boolean));
    const facts = ['INV-2311', '1,240', 'חסומה לתשלום'];
    const missing = facts.filter((f) => !flat.includes(f));
    out.push(`hero replica in a11y tree: ${facts.length - missing.length}/${facts.length} facts present`);
    if (missing.length) fail(`hero replica facts missing from the a11y tree: ${missing.join(', ')}`);
    await ctx.close();
  }

  console.log(out.join('\n'));
  console.log('RENDER_OK');
} finally {
  await browser.close();
  server.close();
}
