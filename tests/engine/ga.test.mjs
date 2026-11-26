import test from 'node:test'; import assert from 'node:assert/strict';
import { pack, firstFit } from '../../lib/engine/index.js';
const items = [5, 7, 3, 9, 2, 8, 4, 6, 1, 7];
test('respects capacity', () => assert.ok(pack(items, 10, 1, 30).fills.every((f) => f <= 10 + 1e-9)));
test('never worse than first-fit-decreasing, never below the lower bound', () => { const r = pack(items, 10, 2, 40); assert.ok(r.servers <= firstFit(items, 10, true)); assert.ok(r.servers >= Math.ceil(items.reduce((a, b) => a + b) / 10)); });
test('deterministic for a given seed', () => assert.deepEqual(pack(items, 10, 5, 20).assign, pack(items, 10, 5, 20).assign));
