# Gates: English locale and multilingual typography

Scope: add a first-class English edition, a browser-style language control,
and the approved LT Superior plus Hasubi Mono font pairing without changing
the frozen Hebrew copy.

## Depth tree

1. Font assets and licenses
   1.1. Self-host LT Superior at the weights used by headings
   1.2. Self-host Hasubi Mono for labels and figures
2. Locale contract
   2.1. English dictionaries mirror the Hebrew dictionaries
   2.2. `/` remains Hebrew RTL and `/en/` is English LTR
3. Language control
   3.1. Keyboard and pointer access
   3.2. Current language, alternate language and direction are announced
4. Delivery evidence
   4.1. Static metadata and hreflang are correct
   4.2. Desktop and phone renders have no horizontal overflow

- [x] G1: the multilingual production build succeeds
  CHECK: npm.cmd run build
  EXPECT: built in
  EVIDENCE: exit=0; dist/index.html and dist/en/index.html generated; built in 4.58s.

- [x] G2: English content mirrors the Hebrew content contract and static metadata
  CHECK: node scripts/gates/g18-i18n.mjs
  EXPECT: G18 PASS
  EVIDENCE: exit=0; both locales contain 7 folios, 6 index items, 5 plans and 7 FAQs; G18 PASS.

- [x] G3: approved fonts are licensed, self-hosted, loadable and used in their assigned roles
  CHECK: node scripts/gates/g19-fonts.mjs
  EXPECT: G19 PASS
  EVIDENCE: exit=0; 4 font files copied to dist with OFL attribution; G19 PASS.

- [x] G4: the language control and both reading directions work at desktop and phone widths
  CHECK: node scripts/gates/g20-locale-ui.mjs
  EXPECT: G20 PASS
  EVIDENCE: exit=0; four language-menu proofs written under lab/i18n-en; G20 PASS.

- [x] G5: Hebrew and English renders preserve the approved editorial composition
  EVIDENCE: Playwright renders reviewed at 1440x900 and 390x844 in both locales; LT Superior 500-600 preserves hierarchy and both menus remain inside the viewport.
