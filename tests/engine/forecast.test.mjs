import test from 'node:test'; import assert from 'node:assert/strict';
import { forecast, generate } from '../../lib/engine/index.js';
test('weekly path: p95 >= p50 and one week long', () => { const f = forecast(generate(1)[0].series, 504); assert.equal(f.p50.length, 168); assert.ok(f.p95.every((v, i) => v >= f.p50[i])); });
test('level path (short history): flat arrays sized to the test window', () => { const s = generate(1, 3, 3)[0].series, f = forecast(s, 54); assert.equal(f.p50.length, s.length - 54); assert.ok(f.p95[0] >= f.p50[0]); });
