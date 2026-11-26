import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { plan, validateFleet } from '../../lib/engine/index.js';
const real = JSON.parse(readFileSync(new URL('../../data/azure_sample.json', import.meta.url)));
test('shipped real sample is valid and large enough', () => { assert.equal(validateFleet(real.vms).ok, true); assert.ok(real.vms.length >= 200 && real.vms[0].series.length >= 600); });
test('real data uses the weekly path and stays safe', () => { const p = plan({ n: 150 }, real); assert.equal(p.meta.real, true); assert.equal(p.meta.trainHours, 504); assert.ok(p.kpi.optimizedServers <= p.kpi.baselineServers); assert.ok(p.rows.every((r) => r.size <= r.cores && r.actual.length === p.meta.testHours)); assert.ok(Number.isFinite(p.quality.coverage)); });
