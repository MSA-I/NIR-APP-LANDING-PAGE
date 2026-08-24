/* E2E verification against the built dist/ using playwright-core + local Chromium.
   Usage: node tests/e2e.mjs <demo|assistant|roi|lang|overflow|reduced-motion|a11y|screenshots|all> */
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from '../scripts/serve.mjs';

const MS_PW = 'C:/Users/art1/AppData/Local/ms-playwright';
const exe = () => {
  const dirs = readdirSync(MS_PW).filter((d) => d.startsWith('chromium-')).sort();
  return join(MS_PW, dirs.at(-1), 'chrome-win64', 'chrome.exe');
};
const BASE = 'http://localhost:5212';
const LOCALES = [
  { path: '/', dir: 'rtl', name: 'he' },
  { path: '/en/', dir: 'ltr', name: 'en' },
  { path: '/fr/', dir: 'ltr', name: 'fr' },
];
const WIDTHS = [390, 768, 1024, 1440];

const mode = process.argv[2] || 'all';
const fail = (msg) => {
  console.error('FAIL:', msg);
  process.exit(1);
};

const server = await serve();
const browser = await chromium.launch({ executablePath: exe() });

async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  return { ctx, page: await ctx.newPage() };
}

async function runDemo() {
  const { ctx, page: p } = await page();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#demo').scrollIntoViewIfNeeded();
  const root = p.locator('[data-demo-root]');
  await root.waitFor({ state: 'visible', timeout: 15000 });
  // price scenario default: expect the finding text
  await root.getByText('1,240').first().waitFor({ timeout: 10000 });
  // switch scenario to receipt
  await root.getByRole('radio', { name: 'קבלה חלקית' }).click();
  await root.getByText('20 / 14 / 20').first().waitFor({ timeout: 5000 });
  // switch role to accountant: restricted note appears
  await root.getByRole('radio', { name: 'רואה חשבון' }).click();
  await root.getByText('חשבוניות מאושרות בלבד').first().waitFor({ timeout: 5000 });
  // back to owner + credit scenario
  await root.getByRole('radio', { name: 'בעלים' }).click();
  await root.getByRole('radio', { name: 'זיכוי פתוח' }).click();
  await root.getByText('780').first().waitFor({ timeout: 5000 });
  await ctx.close();
  console.log('DEMO_OK');
}

async function runAssistant() {
  const { ctx, page: p } = await page();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#assistant').scrollIntoViewIfNeeded();
  const root = p.locator('.asst');
  await root.waitFor({ state: 'visible', timeout: 15000 });
  await root.getByText('נכון ל-24.08.2026').first().waitFor({ timeout: 10000 });
  await root.getByText('חלון: 30 ימים').first().waitFor();
  await root.getByText('תשובה מלאה').first().waitFor();
  await root.getByText('בדיקת חשבונית INV-2311').first().waitFor();
  // bank question as office => not permitted
  await root.getByRole('radio', { name: 'רכש' }).click();
  await root.getByRole('radio', { name: /תנועות בנק/ }).click();
  await root.getByText('לא מורשה בתפקיד זה').first().waitFor({ timeout: 5000 });
  await ctx.close();
  console.log('ASSISTANT_OK');
}

async function runRoi() {
  const { ctx, page: p } = await page();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#roi').scrollIntoViewIfNeeded();
  const root = p.locator('.roi');
  await root.waitFor({ state: 'visible', timeout: 15000 });
  const yearlyCell = root.locator('tbody tr').nth(3).locator('td.num').nth(1);
  const before = await yearlyCell.textContent();
  // island hydrates lazily (client:visible); retry until the handler is live
  let changed = false;
  for (let i = 0; i < 8 && !changed; i++) {
    await p.locator('#roi-docs').fill(String(300 + i));
    await p.waitForTimeout(400);
    changed = (await yearlyCell.textContent()) !== before;
  }
  if (!changed) fail('ROI did not recompute after input change');
  const disclaimer = await root.locator('.roi-disclaimer').textContent();
  if (!disclaimer || disclaimer.length < 10) fail('ROI disclaimer missing');
  await ctx.close();
  console.log('ROI_OK');
}

async function runLang() {
  const { ctx, page: p } = await page();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('[data-lang-switcher] summary').click();
  await p.locator('[data-lang-switcher] a[lang="en"]').click();
  await p.waitForURL('**/en/');
  const dir = await p.evaluate(() => document.documentElement.dir);
  if (dir !== 'ltr') fail('en page dir is not ltr');
  await p.locator('[data-lang-switcher] summary').click();
  await p.locator('[data-lang-switcher] a[lang="fr"]').click();
  await p.waitForURL('**/fr/');
  const lang = await p.evaluate(() => document.documentElement.lang);
  if (lang !== 'fr') fail('fr page lang mismatch');
  await ctx.close();
  console.log('LANG_OK');
}

async function runOverflow() {
  for (const loc of LOCALES) {
    for (const width of WIDTHS) {
      const { ctx, page: p } = await page({ viewport: { width, height: 900 } });
      await p.goto(BASE + loc.path, { waitUntil: 'networkidle' });
      await p.evaluate(() => new Promise((r) => setTimeout(r, 400)));
      const over = await p.evaluate(() => {
        const d = document.documentElement;
        return d.scrollWidth - d.clientWidth;
      });
      if (over > 1) fail(`horizontal overflow ${over}px at ${loc.name} width ${width}`);
      await ctx.close();
    }
  }
  console.log('OVERFLOW_OK');
}

async function runReduced() {
  const { ctx, page: p } = await page({ reducedMotion: 'reduce' });
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  // pinned stage must stay hidden; static list visible
  const stageHidden = await p.locator('[data-trail-stage]').evaluate((el) => el.hidden);
  if (!stageHidden) fail('trail stage active under reduced motion');
  const staticVisible = await p.locator('[data-trail-static]').isVisible();
  if (!staticVisible) fail('static trail list not visible under reduced motion');
  // all reveal content must be readable (no opacity trap)
  const hiddenReveals = await p.evaluate(() => {
    let n = 0;
    document.querySelectorAll('.reveal').forEach((el) => {
      if (getComputedStyle(el).opacity === '0') n++;
    });
    return n;
  });
  if (hiddenReveals > 0) fail(`${hiddenReveals} .reveal elements invisible under reduced motion`);
  await ctx.close();
  console.log('REDUCED_OK');
}

async function runA11y() {
  const axeSource = readFileSync(join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
  for (const loc of LOCALES) {
    const { ctx, page: p } = await page();
    await p.goto(BASE + loc.path, { waitUntil: 'networkidle' });
    await p.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    await p.addScriptTag({ content: axeSource });
    const result = await p.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    });
    const bad = result.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    if (bad.length) fail(`${loc.name}: axe violations ${JSON.stringify(bad)}`);
    await ctx.close();
  }
  // keyboard: tab into roles tabs and arrow through
  const { ctx, page: p } = await page();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#roles').scrollIntoViewIfNeeded();
  await p.locator('[role="tab"]').first().focus();
  await p.keyboard.press('ArrowLeft');
  const selected = await p.evaluate(() => document.activeElement?.textContent?.trim());
  if (!selected) fail('roles tab keyboard navigation dead');
  await ctx.close();
  console.log('A11Y_OK');
}

async function runScreenshots() {
  mkdirSync('artifacts/screenshots', { recursive: true });
  for (const loc of LOCALES) {
    for (const [w, h, label] of [
      [1440, 900, 'desktop'],
      [390, 844, 'mobile'],
    ]) {
      const { ctx, page: p } = await page({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      await p.goto(BASE + loc.path, { waitUntil: 'networkidle' });
      await p.evaluate(() => new Promise((r) => setTimeout(r, 700)));
      await p.screenshot({ path: `artifacts/screenshots/${loc.name}-${label}-full.png`, fullPage: true });
      await p.screenshot({ path: `artifacts/screenshots/${loc.name}-${label}-hero.png` });
      await ctx.close();
    }
  }
  console.log('SCREENSHOTS_OK');
}

try {
  const runs = {
    demo: runDemo,
    assistant: runAssistant,
    roi: runRoi,
    lang: runLang,
    overflow: runOverflow,
    'reduced-motion': runReduced,
    a11y: runA11y,
    screenshots: runScreenshots,
  };
  if (mode === 'all') {
    for (const fn of Object.values(runs)) await fn();
  } else if (runs[mode]) {
    await runs[mode]();
  } else {
    fail(`unknown mode ${mode}`);
  }
} finally {
  await browser.close();
  server.close();
}
