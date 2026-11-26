import test from 'node:test'; import assert from 'node:assert/strict';
import { plan, sweep } from '../../lib/engine/index.js';
test('deterministic', () => assert.deepEqual(plan({ n: 12 }).kpi, plan({ n: 12 }).kpi));
test('GA <= naive baseline; packing ordering holds', () => { const p = plan({ n: 40 }); assert.ok(p.kpi.optimizedServers <= p.kpi.baselineServers); assert.ok(p.packing.bound <= p.packing.ga && p.packing.ga <= p.packing.ffd); });
test('friendly names, server names, heat shape', () => { const p = plan({ n: 12 }); assert.ok(p.rows.every((r) => r.name && !/^vm-/.test(r.name))); assert.ok(p.servers[0].name.startsWith('Server')); assert.equal(p.heat.length, p.kpi.optimizedServers); assert.equal(p.heat[0].length, p.meta.testHours); });
test('sweep returns 18 scenarios', () => { const s = sweep({ n: 30 }, null); assert.equal(s.length, 18); assert.ok(s.every((x) => Number.isFinite(x.savings) && x.vmOverloadPct >= 0)); });
test('custom fleet keeps the user names and short-history path', () => {
  const vms = ['a', 'b', 'c', 'd'].map((id, i) => ({ id, name: id, cores: 4, series: Array.from({ length: 48 }, (_, h) => 0.5 + i * 0.1 + 0.2 * Math.sin(h / 4)) }));
  const c = plan({ n: 4 }, { vms, source: 'Your uploaded data' }); assert.deepEqual(c.rows.map((r) => r.name), ['a', 'b', 'c', 'd']); assert.equal(c.meta.trainHours, 36);
});
