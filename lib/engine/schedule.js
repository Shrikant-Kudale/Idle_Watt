// Off-hours scheduling: hours of the week in which a machine is predicted to use under 10% of its cores.
export const offHours = (p95, cores) => (p95.length === 168 ? p95.filter((x) => x <= 0.1 * cores).length : 0);
// Separate estimate (do not add to consolidation savings): machines idle 40+ h/week could be switched off in those hours.
export function scheduleSummary(rows, price, serverCores, hrs = 730) {
  const perCore = price / serverCores, c = rows.filter((r) => r.offHours >= 40);
  return { scheduleVMs: c.length, scheduleSavings: Math.round(c.reduce((s, r) => s + (r.offHours / 168) * r.size * perCore * hrs, 0)) };
}
