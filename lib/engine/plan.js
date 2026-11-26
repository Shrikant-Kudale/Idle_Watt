import { generate } from './data.js';
import { forecast } from './forecast.js';
import { fuzzy } from './fuzzy.js';
import { pack, firstFit } from './ga.js';
import { assessQuality } from './quality.js';
import { offHours, scheduleSummary } from './schedule.js';
import { CAT, SIZES, TRAIN, sum, r2 } from './common.js';
export function plan({ n = 48, headroom = 0.15, target = 0.8, seed = 7, serverCores = 64, price = 1.5, kg = 0.4 } = {}, real = null) {
  headroom = +headroom; target = +target; price = +price; seed = +seed;
  const vms = real?.vms?.length ? real.vms.slice(0, Math.max(4, Math.min(real.vms.length, +n))) : generate(Math.max(4, Math.min(200, +n)), seed);
  const isReal = !!(real?.vms?.length); n = vms.length;
  const L = vms[0].series.length, train = L >= 600 ? TRAIN : Math.floor(L * 0.75), Lt = L - train, cap = serverCores * target, hrs = 730;
  const rows = vms.map((v, ix) => {
    const f = forecast(v.series, train), wNeed = Math.max(...f.p95);
    const lifeNeed = v.lifeP95MaxPct != null ? (v.lifeP95MaxPct / 100) * v.cores : 0; // real 30-day p95 of max CPU
    const need = Math.max(wNeed, lifeNeed) * (1 + headroom);
    const util = (100 * sum(v.series.slice(0, train))) / train / v.cores, fz = fuzzy(util);
    const size = Math.min(SIZES.find((x) => x >= need) || v.cores, v.cores), test = v.series.slice(train);
    const over = test.filter((x) => x > size).length / test.length;
    const action = fz.label === 'idle' ? 'Retire / schedule off-hours' : size < v.cores ? 'Downsize' : 'Keep';
    const off = offHours(f.p95, v.cores);
    const flag = lifeNeed > wNeed * 1.1 ? '30-day p95 of max CPU is above window p95 of hourly avg: sized on the higher (conservative)' : '';
    return { id: v.id, name: v.name || (v.category != null ? `${CAT[v.category] || 'Workload'} ${String(ix + 1).padStart(2, '0')}` : v.id), kind: v.category != null ? CAT[v.category] || 'General workload' : 'Workload', cores: v.cores, memGb: v.memGb ?? null, category: v.category ?? null, util: r2(util), ...fz, size, action, flag, offHours: off, overloadPct: r2(over * 100), p50: f.p50.slice(0, Lt).map(r2), p95: f.p95.slice(0, Lt).map(r2), actual: test.map(r2) };
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
    vmOverloadPct: r2(sum(rows.map((x) => x.overloadPct)) / n), serverOverloadHoursPct: r2((100 * overH) / (ga.servers * Lt)), ...scheduleSummary(rows, price, serverCores),
  };
  return { params: { n, headroom, target, seed, serverCores, price, kg }, kpi, rows,
    meta: { source: isReal ? real.source || 'Azure Public Dataset V2 (real)' : 'Synthetic (Azure-shaped)', real: isReal, hours: L, trainHours: train, testHours: Lt },
    servers: ga.fills.map((f, i) => ({ id: 'srv-' + (i + 1), name: 'Server ' + (i + 1), usedCores: r2(f), vms: rows.filter((_, j) => ga.assign[j] === i).map((x) => x.name) })), history: ga.history, heat, quality: assessQuality(vms, rows, train), packing: { naive: baseNaive, ffd: firstFit(rows.map((x) => x.size), cap, true), ga: ga.servers, bound: Math.ceil(sum(rows.map((x) => x.size)) / cap) },
    disclaimer: (isReal ? `Real usage data: ${L} hours per machine (first ${train} h used to size, last ${Lt} h held back to test). ` : 'Synthetic sample, for demoing the 3-week weekly forecast. ') + 'CPU alone cannot prove a smaller size is safe: memory, IO and bursts are not modelled. Cost and energy are estimates.' };
}

