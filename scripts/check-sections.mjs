import { loadPages, fail } from './checks-lib.mjs';

const markers = [
  'class="nav-wrap"',
  'class="hero"',
  'class="proof"',
  'id="leaks"',
  'id="trail"',
  'id="assistant"',
  'id="roles"',
  'id="demo"',
  'id="roi"',
  'id="pricing"',
  'id="security"',
  'class="section story"',
  'id="faq"',
  'class="final on-onyx',
  '<footer class="footer"',
];
for (const p of loadPages()) {
  for (const m of markers) {
    if (!p.html.includes(m)) fail(`${p.file}: missing section marker ${m}`);
  }
  // direction contract must survive the build (impeccable §5)
  if (!p.html.includes('DIRECTION CONTRACT')) fail(`${p.file}: direction contract comment stripped`);
}
console.log('SECTIONS_OK');
