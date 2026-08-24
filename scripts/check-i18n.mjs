import { loadPages, fail } from './checks-lib.mjs';

for (const p of loadPages()) {
  if (!p.html.includes(`<html lang="${p.locale}" dir="${p.dir}"`)) fail(`${p.file}: wrong lang/dir attrs`);
}
const [he, en, fr] = loadPages();
if (he.html === en.html) fail('he and en pages identical');
if (!en.html.includes('lang="en"')) fail('en page lang');
if (!fr.html.match(/Français|français/)) fail('fr page missing French switcher label');
console.log('I18N_OK');
