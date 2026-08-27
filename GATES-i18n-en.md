# Gates: English locale and multilingual typography

Scope: add a first-class English edition, a browser-style language control,
and the approved LT Superior plus Hasubi Mono font pairing without changing
the frozen Hebrew copy.

## Depth tree

1. Font assets and licenses
   1.1. Self-host LT Superior at the weights already used by headings
   1.2. Self-host Hasubi Mono for labels and figures
2. Locale contract
   2.1. English dictionaries mirror the current Hebrew dictionaries
   2.2. `/` remains Hebrew RTL and `/en/` is English LTR
3. Language control
   3.1. Keyboard and pointer access
   3.2. Current language, alternate language, and direction are announced
4. Delivery evidence
   4.1. Static metadata and hreflang are correct
   4.2. Desktop and phone renders have no horizontal overflow

- [ ] G1: the multilingual production build succeeds
  CHECK: npm.cmd run build
  EXPECT: built in
  EVIDENCE: pending

- [ ] G2: English content mirrors the Hebrew content contract and static metadata
  CHECK: node scripts/gates/g18-i18n.mjs
  EXPECT: G18 PASS
  EVIDENCE: pending

- [ ] G3: approved fonts are licensed, self-hosted, loadable, and used in their assigned roles
  CHECK: node scripts/gates/g19-fonts.mjs
  EXPECT: G19 PASS
  EVIDENCE: pending

- [ ] G4: the language control and both reading directions work at desktop and phone widths
  CHECK: node scripts/gates/g20-locale-ui.mjs
  EXPECT: G20 PASS
  EVIDENCE: pending

- [ ] G5: Hebrew and English renders preserve the approved editorial composition
  EVIDENCE: pending

