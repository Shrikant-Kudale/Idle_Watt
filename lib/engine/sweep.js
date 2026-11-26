import { plan } from './plan.js';
// Savings vs risk frontier: headroom x target-utilisation grid (the core trade-off for a cost team)
export function sweep(params, real) {
  const out = [];
  for (const target of [0.6, 0.8, 0.9]) for (const headroom of [-0.4, -0.2, 0, 0.15, 0.3, 0.5]) {
    const k = plan({ ...params, headroom, target }, real).kpi;
    out.push({ headroom, target, servers: k.optimizedServers, savings: k.monthlySavings, overloadPct: k.serverOverloadHoursPct, vmOverloadPct: k.vmOverloadPct });
  }
  return out;
}
