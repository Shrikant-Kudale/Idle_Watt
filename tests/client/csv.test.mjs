import test from 'node:test'; import assert from 'node:assert/strict';
import { parseCsv, TEMPLATE } from '../../lib/client/csv.js'; import { readFileSync } from 'node:fs'; import { plan } from '../../lib/engine/index.js';
test('parses the built-in template', () => { const v = parseCsv(TEMPLATE); assert.equal(v.length, 4); assert.equal(v[0].series.length, 48); });
test('the shipped example CSV parses and plans', () => { const v = parseCsv(readFileSync(new URL('../../examples/example_fleet.csv', import.meta.url), 'utf8')); assert.equal(v.length, 6); assert.equal(plan({ n: 6 }, { vms: v }).kpi.vms, 6); });
test('helpful errors', () => { assert.throws(() => parseCsv('a,b\n1,2'), /machine,cores,hour,cpu_percent/); assert.throws(() => parseCsv('machine,cores,hour,cpu_percent\nx,4,0,5'), /at least 4/); });
