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
  'id="faq"',
  'class="final on-onyx',
  '<footer class="footer"',
];
for (const p of loadPages()) {
  for (const m of markers) {
    if (!p.html.includes(m)) fail(`${p.file}: missing section marker ${m}`);
  }
  // The placeholder customer story must NOT ship (BRIEF §11): a disclaimed
  // quote costs more credibility than an absent section.
  if (p.html.includes('class="section story"')) fail(`${p.file}: placeholder story section is in the build`);
  // Process scaffolding must NOT ship: the direction contract lives in DESIGN.md,
  // not in a comment inside <body> that anyone can read via view-source.
  if (p.html.includes('DIRECTION CONTRACT')) fail(`${p.file}: process scaffolding shipped to production`);
}
console.log('SECTIONS_OK');
