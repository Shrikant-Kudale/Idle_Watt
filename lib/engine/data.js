import { rng, H } from './common.js';
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
    vms.push({ id: 'vm-' + String(i + 1).padStart(3, '0'), name: 'Demo workload ' + String(i + 1).padStart(2, '0'), cores, series: s });
  }
  return vms;
}

