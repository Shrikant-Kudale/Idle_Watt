import { r2 } from './common.js';
const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
// Fuzzy membership over mean utilisation (% of allocated cores)
export function fuzzy(u) {
  const idle = 1 - ramp(u, 5, 20), busy = ramp(u, 15, 40), steady = Math.max(0, 1 - Math.max(idle, busy));
  const m = { idle: r2(idle), steady: r2(steady), busy: r2(busy) };
  return { ...m, label: Object.keys(m).sort((a, b) => m[b] - m[a])[0] };
}

