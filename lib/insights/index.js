// Turns the numbers into plain-English findings anyone can read.
export const ACT = { 'Retire / schedule off-hours': 'Switch off or schedule', Downsize: 'Move to a smaller size', Keep: 'Keep as is' };
export const LVL = { idle: 'Mostly unused', steady: 'Moderately used', busy: 'Heavily used' };
const f0 = (n) => Math.round(n).toLocaleString('en-US');
export function insights(d) {
  const k = d.kpi, R = d.rows, n = R.length, sc = d.params.serverCores;
  const used = R.reduce((s, r) => s + (r.util * r.cores) / 100, 0);
  const before = Math.min(100, Math.round((100 * used) / (k.baselineServers * sc))), after = Math.min(100, Math.round((100 * used) / (k.optimizedServers * sc)));
  const shrink = R.filter((r) => r.size < r.cores), freed = shrink.reduce((s, r) => s + r.cores - r.size, 0);
  const top = R.map((r, i) => ({ i, name: r.name, kind: r.kind, cores: r.cores, size: r.size, freed: r.cores - r.size, level: r.label, action: r.action })).sort((a, b) => b.freed - a.freed).slice(0, 8);
  const byClass = ['idle', 'steady', 'busy'].map((l) => { const g = R.filter((r) => r.label === l); return { key: l, label: LVL[l], count: g.length, avgUtil: g.length ? Math.round(g.reduce((s, r) => s + r.util, 0) / g.length) : 0, cores: g.reduce((s, r) => s + r.cores, 0) }; });
  const yearly = k.monthlySavings * 12, idle = k.idleVMs;
  const headline = k.serversSaved > 0 ? `The same ${n} machines can run on ${k.optimizedServers} servers instead of ${k.baselineServers}, saving about $${f0(k.monthlySavings)} a month.` : `Your ${n} machines already fit well: no servers can be removed at these settings.`;
  const sub = `That is roughly $${f0(yearly)} a year and about ${f0(k.co2KgSavedMonth * 12)} kg of CO₂ avoided (estimates). The plan was sized on ${d.meta.trainHours} hours of history and then tested on ${d.meta.testHours} hours it had never seen.`;
  const cards = [
    { icon: '🔌', title: `Servers are only ${before}% busy`, text: `On average your servers use about ${before}% of the processing power you pay for. The rest is waste, and that is what this plan goes after.`, tab: 'Servers', cta: 'See the server plan' },
    { icon: '😴', title: `${idle} of ${n} machines are mostly unused`, text: 'Each one uses under about 20% of what it was given. Good candidates to switch off outside working hours or retire.', tab: 'Machines', cta: 'Review these machines', filter: 'idle' },
    { icon: '📏', title: `${shrink.length} machines are oversized`, text: shrink.length ? `They were given ${f0(freed)} more processor cores than they need. In the replay week they stayed within their new size ${f0(100 - k.vmOverloadPct)}% of the time.` : 'None were given more than they need at these settings.', tab: 'Machines', cta: 'See which ones', filter: 'all' },
    { icon: '🧩', title: `${k.baselineServers} servers become ${k.optimizedServers}`, text: `Moving workloads next to each other, like packing a suitcase, frees ${k.serversSaved} server${k.serversSaved === 1 ? '' : 's'} without changing what runs.`, tab: 'Servers', cta: 'Open the load map' },
    { icon: '🛡️', title: k.serverOverloadHoursPct === 0 ? 'No server ran out of room' : `${k.serverOverloadHoursPct}% of server-hours ran out of room`, text: 'We replayed a week the tool had never seen. Use the trade-off chart to choose how bold or cautious to be.', tab: 'Trade-offs', cta: 'Explore the trade-off' },
    { icon: '🌱', title: `${f0(k.co2KgSavedMonth)} kg CO₂ avoided a month`, text: `About ${f0(k.kwhSavedMonth)} kWh of electricity a month (estimate). Fewer powered-on servers means less energy and cooling.`, tab: 'Report', cta: 'Get the full report' },
  ];
  if (k.scheduleVMs > 0) cards.push({ icon: '🌙', title: `${k.scheduleVMs} machines sit idle 40+ hours a week`, text: `Switching them off in those hours could save roughly $${f0(k.scheduleSavings)} a month. This is a separate estimate: do not add it to the consolidation saving.`, tab: 'Machines', cta: 'See the machines' });
  const actions = [`Switch off or schedule the ${idle} mostly-unused machines, starting with the biggest.`, `Move ${shrink.length} oversized machines to a smaller size and keep the old size ready for rollback.`, `Consolidate the workload onto ${k.optimizedServers} servers, one server at a time.`, 'Check memory, disk and network for each machine before changing anything. This tool only sees processor use.', 'Re-run the plan every week with fresh data and compare the risk numbers.'];
  return { headline, sub, before, after, used, shrink: shrink.length, freed, top, byClass, yearly, cards, actions };
}
