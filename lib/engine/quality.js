import { sum } from './common.js';
// Forecast quality on the held-out window: error vs. simple baselines, and honesty of the 95% safety range.
export function assessQuality(vms, rows, train) {
  const L = vms[0].series.length, hasLast = train >= 168 && L - train <= 168;
  let n = 0, eM = 0, eF = 0, eL = 0, cover = 0, width = 0;
  vms.forEach((v, i) => {
    const r = rows[i], mean = sum(v.series.slice(0, train)) / train;
    v.series.slice(train).forEach((x, t) => { n++; eM += Math.abs(x - r.p50[t]); eF += Math.abs(x - mean); if (hasLast) eL += Math.abs(x - v.series[train + t - 168]); if (x <= r.p95[t]) cover++; width += r.p95[t] - r.p50[t]; });
  });
  const m3 = (e) => Math.round((e / n) * 1000) / 1000;
  const models = [{ key: 'model', name: train >= 504 ? 'IdleWatt (weekly pattern)' : 'IdleWatt (smoothed level)', mae: m3(eM) }, { key: 'flat', name: 'Flat average', mae: m3(eF) }];
  if (hasLast) models.push({ key: 'last', name: 'Repeat last week', mae: m3(eL) });
  return { models, coverage: Math.round((1000 * cover) / n) / 10, target: 95, hours: n, vms: vms.length, bandWidth: m3(width), improvementPct: eF ? Math.round(100 * (1 - eM / eF)) : 0 };
}
