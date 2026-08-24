/* Runs all static checks in order (build first, then e2e separately). */
import { spawnSync } from 'node:child_process';

const checks = ['check-i18n', 'check-seo', 'check-tokens', 'check-sections', 'check-pricing', 'check-claims', 'check-rtl', 'check-budget'];
for (const c of checks) {
  const r = spawnSync(process.execPath, [`scripts/${c}.mjs`], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log('VERIFY_OK');
