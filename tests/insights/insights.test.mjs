import test from 'node:test'; import assert from 'node:assert/strict';
import { plan } from '../../lib/engine/index.js'; import { insights } from '../../lib/insights/index.js';
test('plain-English insights are complete and clean', () => { const I = insights(plan({ n: 30 })); assert.ok(I.headline.length > 20 && I.cards.length >= 6 && I.top.length > 0 && I.after >= I.before); assert.ok(I.cards.every((c) => !/NaN|undefined/.test(c.title + c.text))); });
