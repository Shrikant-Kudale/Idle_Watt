import test from 'node:test'; import assert from 'node:assert/strict';
import { offHours, scheduleSummary } from '../../lib/engine/index.js';
test('offHours counts hours under 10% of cores, weekly profiles only', () => { assert.equal(offHours(Array(168).fill(0.1), 4), 168); assert.equal(offHours(Array(168).fill(3), 4), 0); assert.equal(offHours(Array(50).fill(0), 4), 0); });
test('scheduleSummary only counts machines idle 40+ h/week', () => { const s = scheduleSummary([{ offHours: 100, size: 4 }, { offHours: 10, size: 4 }], 1.5, 64); assert.equal(s.scheduleVMs, 1); assert.ok(s.scheduleSavings > 0); });
