import { rng } from './common.js';
// Genetic algorithm over item orderings, decoded by first-fit. Lower fitness = fewer servers, tighter fill.
export function pack(items, cap, seed = 1, gens = 80, popN = 40) {
  const r = rng(seed), n = items.length, it = items.map((x) => Math.min(x, cap));
  const decode = (o) => { const b = [], a = Array(n); for (const i of o) { let k = b.findIndex((x) => x + it[i] <= cap + 1e-9); if (k < 0) { b.push(0); k = b.length - 1; } b[k] += it[i]; a[i] = k; } return { b, a }; };
  const fit = (o) => { const { b } = decode(o); return b.length * 1000 - b.reduce((s, x) => s + x * x, 0) / cap; };
  const ffd = [...Array(n).keys()].sort((a, b) => it[b] - it[a]);
  const shuffle = () => { const o = [...ffd]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
  const ox = (p, q) => { const a = Math.floor(r() * n), b = a + Math.floor(r() * (n - a)), c = Array(n).fill(-1); for (let i = a; i <= b && i < n; i++) c[i] = p[i]; const u = new Set(c); let j = 0; for (const g of q) { if (u.has(g)) continue; while (c[j] !== -1) j++; c[j] = g; } return c; };
  let pop = [ffd, ...Array.from({ length: popN - 1 }, shuffle)].map((o) => ({ o, f: fit(o) }));
  const tour = () => { const a = pop[Math.floor(r() * popN)], b = pop[Math.floor(r() * popN)]; return a.f < b.f ? a : b; };
  const hist = [];
  for (let g = 0; g < gens; g++) {
    pop.sort((a, b) => a.f - b.f); hist.push(decode(pop[0].o).b.length);
    const next = pop.slice(0, 4);
    while (next.length < popN) { const c = ox(tour().o, tour().o); if (r() < 0.3) { const i = Math.floor(r() * n), j = Math.floor(r() * n); [c[i], c[j]] = [c[j], c[i]]; } next.push({ o: c, f: fit(c) }); }
    pop = next;
  }
  pop.sort((a, b) => a.f - b.f);
  const { b, a } = decode(pop[0].o);
  return { servers: b.length, assign: a, fills: b, history: hist };
}

// Plain first-fit bin count; desc=true gives the classic first-fit-decreasing (FFD) baseline.
export function firstFit(items, cap, desc = false) {
  const a = desc ? [...items].sort((x, y) => y - x) : items, b = [];
  for (const x0 of a) { const x = Math.min(x0, cap); let k = b.findIndex((y) => y + x <= cap + 1e-9); if (k < 0) { b.push(0); k = b.length - 1; } b[k] += x; }
  return b.length;
}
