'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Overview(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<><section className="hero"><div><div className="eyebrow">Your cloud bill, in plain English</div><h2>{I.headline}</h2><p className="mut">{I.sub}</p><div className="row"><button className="btn pri" onClick={() => go('Machines')}>Review the machines</button><button className="btn" onClick={() => go('Report')}>Get the full report</button></div></div>
          <div className="gaugebox"><Gauge pct={I.after} /><p className="hint">Servers are about {I.before}% busy today, and {I.after}% busy after the plan.</p></div></section>
        <div className="kpis">{[['🖥️', `${k.baselineServers} → ${k.optimizedServers}`, 'servers, today → plan', 'Servers'], ['💰', `$${f0(k.monthlySavings)}`, `saved a month · $${f0(I.yearly)} a year`, 'Report'], ['⚡', `${f0(k.kwhSavedMonth)} kWh`, 'electricity saved a month', 'Report'], ['🌱', `${f0(k.co2KgSavedMonth)} kg`, 'CO₂ avoided a month', 'Report'], ['😴', `${k.idleVMs} of ${k.vms}`, 'machines mostly unused', 'Machines']].map(([i, a, b, t]) => <div className="card kpi" key={b} onClick={() => go(t, t === 'Machines' ? { filter: 'idle' } : null)}><i>{i}</i><div><b>{a}</b><small>{b}</small></div></div>)}</div>
        <h2 className="sec">What we found</h2><div className="insg">{I.cards.map((c) => <div className="card ins" key={c.title} onClick={() => go(c.tab, c.filter ? { filter: c.filter } : null)}><i>{c.icon}</i><h3>{c.title}</h3><p>{c.text}</p><a>{c.cta} →</a></div>)}</div>
        <div className="card" id="forecast"><div className="row sp"><h3>A closer look: {row.name}</h3><select style={{ width: 'auto', maxWidth: 300 }} value={sel} onChange={(e) => setSel(+e.target.value)}>{d.rows.map((r, i) => <option key={r.id} value={i}>{r.name} · {r.cores} cores</option>)}</select></div>
          <p className="cap"><b>What you are looking at:</b> the orange line is what this machine really used during a week the tool had never seen. The green zone is the prediction with a safety margin. The red dotted line is the size we recommend ({row.size} of {row.cores} cores). While orange stays under red, the smaller size would have worked.</p><Forecast r={row} />
          {row.flag && <p className="hint">Note: {row.flag}</p>}</div>
        <div className="g2"><div className="card"><h3>Biggest opportunities</h3><p className="cap">Machines given far more processing power than they use. Click one to inspect it.</p><table><thead><tr><th>Machine</th><th>Given</th><th>Needs</th><th>Freed</th><th>Advice</th></tr></thead><tbody>{I.top.map((t) => <tr key={t.i} className="go" onClick={() => openMachine(t.i)}><td><b>{t.name}</b><br /><span className="mut" style={{ fontSize: 12 }}>{t.kind}</span></td><td>{t.cores}</td><td>{t.size}</td><td>{t.freed}</td><td>{ACT[t.action]}</td></tr>)}</tbody></table></div>
          <div className="card"><h3>How machines are used</h3><p className="cap">Fuzzy logic sorts each machine by how much of its capacity it really uses.</p><Donut parts={I.byClass.map((c) => ({ l: c.label, v: c.count, s: { idle: 'var(--wa)', steady: 'var(--ac2)', busy: 'var(--bad)' }[c.key] }))} /></div></div>
        <div className="g2"><div className="card"><h3>Before and after</h3><p className="cap">Same work, fewer servers, lower bill.</p><Compare rows={[['Servers', k.baselineServers, k.optimizedServers, f0], ['Monthly cost ($)', k.monthlyCostBefore, k.monthlyCostAfter, (v) => '$' + f0(v)]]} /></div>
          <div className="card"><h3>What to do next</h3><ol>{I.actions.map((a) => <li key={a}>{a}</li>)}</ol></div></div></>
  );
}
