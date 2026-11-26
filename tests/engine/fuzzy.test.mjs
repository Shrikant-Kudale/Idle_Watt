import test from 'node:test'; import assert from 'node:assert/strict';
import { fuzzy } from '../../lib/engine/index.js';
test('labels at the extremes', () => { assert.equal(fuzzy(2).label, 'idle'); assert.equal(fuzzy(30).label !== 'idle', true); assert.equal(fuzzy(60).label, 'busy'); });
test('memberships stay within 0..1 and idle falls as use rises', () => { let prev = 2; for (let u = 0; u <= 60; u += 5) { const f = fuzzy(u); for (const k of ['idle', 'steady', 'busy']) assert.ok(f[k] >= 0 && f[k] <= 1); assert.ok(f.idle <= prev); prev = f.idle; } });
