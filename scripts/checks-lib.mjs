import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const PAGES = [
  { file: 'dist/index.html', locale: 'he', dir: 'rtl', path: '/' },
  { file: 'dist/en/index.html', locale: 'en', dir: 'ltr', path: '/en/' },
  { file: 'dist/fr/index.html', locale: 'fr', dir: 'ltr', path: '/fr/' },
];

export function loadPages() {
  return PAGES.map((p) => {
    if (!existsSync(p.file)) {
      console.error(`FAIL: missing ${p.file} (run npm run build first)`);
      process.exit(1);
    }
    return { ...p, html: readFileSync(join(process.cwd(), p.file), 'utf8') };
  });
}

export function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}
