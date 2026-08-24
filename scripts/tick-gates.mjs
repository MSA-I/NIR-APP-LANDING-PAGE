// One-off: tick met gates. Kept for the record of what was ticked and when.
import { readFileSync, writeFileSync } from 'node:fs';
const met = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G20'];
let s = readFileSync('GATES.md', 'utf8');
for (const g of met) s = s.replace(`- [ ] ${g} `, `- [x] ${g} `);
writeFileSync('GATES.md', s);
console.log('unchecked left:', (s.match(/- \[ \]/g) || []).length);
