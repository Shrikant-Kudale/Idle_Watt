import test from 'node:test'; import assert from 'node:assert/strict';
import { validateFleet } from '../../lib/engine/index.js';
const ok = (n = 4) => Array.from({ length: n }, (_, i) => ({ id: 'm' + i, cores: 4, series: Array(24).fill(1) }));
test('accepts a good fleet', () => assert.equal(validateFleet(ok()).ok, true));
test('rejects too few machines, ragged series, NaN and bad cores', () => {
  assert.equal(validateFleet(ok(3)).ok, false);
  const r = ok(); r[1].series = Array(30).fill(1); assert.equal(validateFleet(r).ok, false);
  const n = ok(); n[0].series[3] = NaN; assert.equal(validateFleet(n).ok, false);
  const c = ok(); c[2].cores = 0; assert.equal(validateFleet(c).ok, false);
});
