import { W, TRAIN } from './common.js';
// >=3 weeks: hour-of-week profile (p50) + 95th pct of training residuals (p95).
// Shorter real windows: smoothed level (p50) + empirical 95th percentile of the training hours (p95).
export function forecast(s, train = TRAIN) {
  if (train >= TRAIN) {
    const p = Array(W).fill(0), c = Array(W).fill(0);
    for (let t = 0; t < train; t++) { p[t % W] += s[t]; c[t % W]++; }
    for (let i = 0; i < W; i++) p[i] /= c[i] || 1;
    // Leave-one-week-out residuals: honest out-of-sample errors (in-sample residuals make the safety band too narrow).
    const prof = (skip) => { const a = Array(W).fill(0), n = Array(W).fill(0); for (let t = 0; t < train; t++) { if (Math.floor(t / W) === skip) continue; a[t % W] += s[t]; n[t % W]++; } return a.map((x, i) => x / (n[i] || 1)); };
    const res = [], weeks = Math.floor(train / W);
    for (let w = 0; w < weeks; w++) { const pw = prof(w); for (let i = 0; i < W; i++) res.push(s[w * W + i] - pw[i]); }
    res.sort((a, b) => a - b);
    const q = Math.max(res[Math.floor(res.length * 0.95)] || 0, 0);
    return { p50: p, p95: p.map((v) => v + q) };
  }
  const tr = s.slice(0, train), srt = [...tr].sort((a, b) => a - b); let lvl = tr[0];
  for (const x of tr) lvl = 0.3 * x + 0.7 * lvl;
  const q = srt[Math.min(srt.length - 1, Math.floor(srt.length * 0.95))], L = s.length - train;
  return { p50: Array(L).fill(lvl), p95: Array(L).fill(Math.max(q, lvl)) };
}

