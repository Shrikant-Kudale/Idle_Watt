import test from 'node:test'; import assert from 'node:assert/strict';
import { explain } from '../../lib/ai/chain.js'; import { template } from '../../lib/ai/template.js';
const kpi = { vms: 10, optimizedServers: 2, baselineServers: 3, monthlySavings: 100, kwhSavedMonth: 50, co2KgSavedMonth: 20, idleVMs: 4, serverOverloadHoursPct: 0 };
test('template mentions the numbers and has no markdown', () => { const t = template(kpi); assert.ok(t.includes('$100') && !/[*#]/.test(t)); });
test('chain falls through failing providers to the template', async () => { const r = await explain({ ...kpi, vms: 11 }, [['a', async () => { throw new Error('x'); }]]); assert.equal(r.source, 'template'); });
test('chain uses a working provider, then serves from cache', async () => { const k = { ...kpi, vms: 12 }; const a = await explain(k, [['ok', async () => 'A fine plain sentence for testing.']]); assert.equal(a.source, 'ok'); assert.equal((await explain(k, [])).source, 'cache'); });
