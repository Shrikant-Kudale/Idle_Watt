import test from 'node:test'; import assert from 'node:assert/strict';
import { plan } from '../../lib/engine/index.js';
test('quality block is sane on demo data', () => { const q = plan({ n: 40 }).quality; assert.ok(q.coverage > 90 && q.coverage <= 100); assert.equal(q.models.length, 3); assert.ok(q.models[0].mae < q.models[1].mae, 'weekly model should beat flat average on seasonal data'); });
