// Usage: node scripts/validate_sample.mjs [path]   (also runs in CI)
import { readFileSync } from 'node:fs';
import { validateFleet } from '../lib/engine/validate.js';
const path = process.argv[2] || new URL('../data/azure_sample.json', import.meta.url);
const d = JSON.parse(readFileSync(path)); const v = validateFleet(d.vms);
if (!v.ok) { console.error('INVALID:', v.error); process.exit(1); }
console.log(`OK: ${d.vms.length} machines x ${v.hours} hours (${d.meta?.source})`);
