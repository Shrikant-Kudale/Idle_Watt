// IdleWatt engine: synthetic sample -> seasonal forecast + 95% band -> fuzzy classes -> GA packing -> cost/energy/risk -> backtest
const H = 24, W = 168, TRAIN = 504, SIZES = [1, 2, 4, 8, 16];
export const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const sum = (a) => a.reduce((x, y) => x + y, 0);
const r2 = (x) => Math.round(x * 100) / 100;

// 28 days hourly CPU demand (in cores). Shaped like the Azure VM trace (3 weeks train, 1 week test). NOT the real trace.
export function generate(n = 48, seed = 7, days = 28) {
  const r = rng(seed), opts = [2, 4, 8, 16], vms = [];
  for (let i = 0; i < n; i++) {
    const cores = opts[Math.floor(r() * 4)], k = r();
    const kind = k < 0.3 ? 'idle' : k < 0.75 ? 'steady' : 'busy';
    const base = kind === 'idle' ? 1 + r() * 3 : kind === 'steady' ? 12 + r() * 18 : 30 + r() * 30;
    const amp = kind === 'idle' ? r() * 2 : base * (0.2 + r() * 0.5), ph = r() * 24, wk = 0.5 + r() * 0.5, s = [];
    for (let t = 0; t < days * H; t++) {
      const we = Math.floor(t / H) % 7 >= 5 ? wk : 1;
      const u = (base + amp * Math.sin((2 * Math.PI * ((t % H) - ph)) / H)) * we + (r() - 0.5) * base * 0.25;
      s.push((Math.max(0.2, Math.min(100, u)) * cores) / 100);
    }
    vms.push({ id: 'vm-' + String(i + 1).padStart(3, '0'), cores, series: s });
  }
  return vms;
}

// >=3 weeks: hour-of-week profile (p50) + 95th pct of training residuals (p95).
// Shorter real windows: smoothed level (p50) + empirical 95th percentile of the training hours (p95).
export function forecast(s, train = TRAIN) {
  if (train >= TRAIN) {
    const p = Array(W).fill(0), c = Array(W).fill(0);
    for (let t = 0; t < train; t++) { p[t % W] += s[t]; c[t % W]++; }
    for (let i = 0; i < W; i++) p[i] /= c[i] || 1;
    const res = []; for (let t = 0; t < train; t++) res.push(s[t] - p[t % W]);
    res.sort((a, b) => a - b);
    const q = Math.max(res[Math.floor(res.length * 0.95)] || 0, 0);
    return { p50: p, p95: p.map((v) => v + q) };
  }
  const tr = s.slice(0, train), srt = [...tr].sort((a, b) => a - b); let lvl = tr[0];
  for (const x of tr) lvl = 0.3 * x + 0.7 * lvl;
  const q = srt[Math.min(srt.length - 1, Math.floor(srt.length * 0.95))], L = s.length - train;
  return { p50: Array(L).fill(lvl), p95: Array(L).fill(Math.max(q, lvl)) };
}

const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
// Fuzzy membership over mean utilisation (% of allocated cores)
export function fuzzy(u) {
  const idle = 1 - ramp(u, 5, 20), busy = ramp(u, 15, 40), steady = Math.max(0, 1 - Math.max(idle, busy));
  const m = { idle: r2(idle), steady: r2(steady), busy: r2(busy) };
  return { ...m, label: Object.keys(m).sort((a, b) => m[b] - m[a])[0] };
}

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

export function plan({ n = 48, headroom = 0.15, target = 0.8, seed = 7, serverCores = 64, price = 1.5, kg = 0.4 } = {}, real = null) {
  headroom = +headroom; target = +target; price = +price; seed = +seed;
  const vms = real?.vms?.length ? real.vms.slice(0, Math.max(4, Math.min(real.vms.length, +n))) : generate(Math.max(4, Math.min(200, +n)), seed);
  const isReal = !!(real?.vms?.length); n = vms.length;
  const L = vms[0].series.length, train = L >= 600 ? TRAIN : Math.floor(L * 0.75), Lt = L - train, cap = serverCores * target, hrs = 730;
  const rows = vms.map((v) => {
    const f = forecast(v.series, train), wNeed = Math.max(...f.p95);
    const lifeNeed = v.lifeP95MaxPct != null ? (v.lifeP95MaxPct / 100) * v.cores : 0; // real 30-day p95 of max CPU
    const need = Math.max(wNeed, lifeNeed) * (1 + headroom);
    const util = (100 * sum(v.series.slice(0, train))) / train / v.cores, fz = fuzzy(util);
    const size = Math.min(SIZES.find((x) => x >= need) || v.cores, v.cores), test = v.series.slice(train);
    const over = test.filter((x) => x > size).length / test.length;
    const action = fz.label === 'idle' ? 'Retire / schedule off-hours' : size < v.cores ? 'Downsize' : 'Keep';
    const flag = lifeNeed > wNeed * 1.1 ? '30-day p95 of max CPU is above window p95 of hourly avg: sized on the higher (conservative)' : '';
    return { id: v.id, cores: v.cores, memGb: v.memGb ?? null, category: v.category ?? null, util: r2(util), ...fz, size, action, flag, overloadPct: r2(over * 100), p50: f.p50.slice(0, Lt).map(r2), p95: f.p95.slice(0, Lt).map(r2), actual: test.map(r2) };
  });
  const baseNaive = (() => { const b = []; for (const v of rows) { let k = b.findIndex((x) => x + v.cores <= serverCores * 0.8 + 1e-9); if (k < 0) { b.push(0); k = b.length - 1; } b[k] += v.cores; } return b.length; })();
  const ga = pack(rows.map((x) => x.size), cap, seed, 80);
  const meanDemand = sum(vms.map((v) => sum(v.series.slice(0, train)) / train));
  const money = (s) => s * price * hrs;
  const kwh = (s) => s * hrs * (0.15 + 0.25 * Math.min(1, meanDemand / (s * serverCores)));
  const heat = ga.fills.map((_, k) => Array.from({ length: Lt }, (_, t) => { let d = 0; vms.forEach((v, i) => { if (ga.assign[i] === k) d += v.series[train + t]; }); return r2((100 * d) / serverCores); }));
  const overH = heat.flat().filter((x) => x > 100).length; // backtest: server-hours where packed VMs need more cores than the server has
  const saved = kwh(baseNaive) - kwh(ga.servers);
  const kpi = {
    vms: n, baselineServers: baseNaive, optimizedServers: ga.servers, serversSaved: baseNaive - ga.servers,
    monthlyCostBefore: Math.round(money(baseNaive)), monthlyCostAfter: Math.round(money(ga.servers)), monthlySavings: Math.round(money(baseNaive - ga.servers)),
    kwhSavedMonth: Math.round(saved), co2KgSavedMonth: Math.round(saved * kg),
    downsized: rows.filter((x) => x.action === 'Downsize').length, idleVMs: rows.filter((x) => x.label === 'idle').length,
    vmOverloadPct: r2(sum(rows.map((x) => x.overloadPct)) / n), serverOverloadHoursPct: r2((100 * overH) / (ga.servers * Lt)),
  };
  return { params: { n, headroom, target, seed, serverCores, price, kg }, kpi, rows,
    meta: { source: isReal ? 'Azure Public Dataset V2 (real)' : 'Synthetic (Azure-shaped)', real: isReal, hours: L, trainHours: train, testHours: Lt },
    servers: ga.fills.map((f, i) => ({ id: 'srv-' + (i + 1), usedCores: r2(f), vms: rows.filter((_, j) => ga.assign[j] === i).map((x) => x.id) })), history: ga.history, heat,
    disclaimer: (isReal ? `Real Azure trace: ${L} h of 5-min CPU readings (first ${train} h to size, last ${Lt} h to test) plus each VM's real 30-day p95 of max CPU. ` : 'Synthetic sample, for demoing the 3-week weekly forecast. ') + 'CPU alone cannot prove a smaller size is safe: memory, IO and bursts are not modelled. Cost and energy are estimates.' };
}

// Savings vs risk frontier: headroom x target-utilisation grid (the core trade-off for a cost team)
export function sweep(params, real) {
  const out = [];
  for (const target of [0.6, 0.8, 0.9]) for (const headroom of [-0.4, -0.2, 0, 0.15, 0.3, 0.5]) {
    const k = plan({ ...params, headroom, target }, real).kpi;
    out.push({ headroom, target, servers: k.optimizedServers, savings: k.monthlySavings, overloadPct: k.serverOverloadHoursPct, vmOverloadPct: k.vmOverloadPct });
  }
  return out;
}
