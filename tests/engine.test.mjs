import test from 'node:test'; import assert from 'node:assert/strict';
import { plan, forecast, fuzzy, pack, generate } from '../lib/engine.js';
test('plan is deterministic', () => assert.deepEqual(plan({ n: 12 }).kpi, plan({ n: 12 }).kpi));
test('GA never uses more servers than naive baseline', () => { const p = plan({ n: 40 }); assert.ok(p.kpi.optimizedServers <= p.kpi.baselineServers); });
test('p95 band >= p50', () => { const f = forecast(generate(1)[0].series); assert.ok(f.p95.every((v, i) => v >= f.p50[i])); });
test('fuzzy classes', () => { assert.equal(fuzzy(2).label, 'idle'); assert.equal(fuzzy(60).label, 'busy'); });
test('packing respects capacity', () => { const r = pack([5, 7, 3, 9, 2, 8], 10, 1, 20); assert.ok(r.fills.every((f) => f <= 10 + 1e-9)); });
import { readFileSync } from 'node:fs';
test('real Azure sample: weekly path, safe sizing, GA <= baseline', () => {
  const real = JSON.parse(readFileSync(new URL('../data/azure_sample.json', import.meta.url)));
  assert.ok(real.vms.length >= 100 && real.vms[0].series.length >= 600);
  const p = plan({ n: 150 }, real);
  assert.equal(p.meta.real, true); assert.equal(p.meta.trainHours, 504);
  assert.ok(p.kpi.optimizedServers <= p.kpi.baselineServers);
  assert.ok(p.rows.every((r) => r.size <= r.cores && r.actual.length === p.meta.testHours && r.p95.length === p.meta.testHours));
});
