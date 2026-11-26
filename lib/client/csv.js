export const TEMPLATE = ['machine,cores,hour,cpu_percent', ...['billing-api', 'web-shop', 'nightly-report', 'test-box'].flatMap((m, i) => Array.from({ length: 48 }, (_, h) => `${m},${[4, 8, 16, 2][i]},${h},${Math.round(8 + [30, 45, 70, 3][i] * (0.6 + 0.4 * Math.sin((h / 24) * 6.28)))}`))].join('\n');
export function parseCsv(text) {
  const L = text.trim().split(/\r?\n/), h = L.shift().toLowerCase().split(',').map((s) => s.trim()), ix = ['machine', 'cores', 'hour', 'cpu_percent'].map((n) => h.indexOf(n));
  if (ix.some((i) => i < 0)) throw new Error('The first row must be: machine,cores,hour,cpu_percent');
  const by = {}; for (const line of L) { const f = line.split(','); if (f.length < 4) continue; const k = f[ix[0]].trim(); if (!by[k]) by[k] = { cores: +f[ix[1]], pts: [] }; by[k].pts.push([+f[ix[2]], +f[ix[3]]]); }
  const vms = Object.entries(by).map(([id, v]) => { v.pts.sort((a, b) => a[0] - b[0]); return { id, name: id, cores: v.cores, series: v.pts.map((p) => +((p[1] / 100) * v.cores).toFixed(3)) }; }).filter((v) => v.cores > 0 && v.series.every((x) => Number.isFinite(x)));
  const len = Math.min(...vms.map((v) => v.series.length)); if (vms.length < 4 || len < 24) throw new Error('Need at least 4 machines with 24 or more hourly rows each');
  return vms.map((v) => ({ ...v, series: v.series.slice(0, len) }));
}
