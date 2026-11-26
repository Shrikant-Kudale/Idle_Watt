'use client';
import { useEffect, useState, useMemo } from 'react';
const TABS = ['Dashboard', 'VM classes', 'Packing', 'AI brief', 'Checklist', 'Glossary', 'How to use'];
const CHECK = ['Confirm memory, disk and network are also low (CPU alone is not proof)', 'Check no VM has licence, affinity or compliance constraints', 'Pilot on the idle group first', 'Keep rollback sizes ready for every downsized VM', 'Schedule changes in a low-traffic window', 'Re-run the plan weekly and compare overload rate'];
const GLOSS = { 'p50 / p95': 'Typical demand and the 95th-percentile safety range for each hour of the week.', Fuzzy: 'A VM can be partly idle and partly steady; membership scores 0 to 1 instead of a hard cut.', 'Genetic algorithm (GA)': 'Tries many VM orderings, keeps the best, to fit workloads on fewer servers.', Headroom: 'Extra capacity added on top of the p95 forecast.', 'Target utilisation': 'Max share of a server you are willing to fill.', Backtest: 'Plan sized on weeks 1-3, checked against week 4.', 'Overload hour': 'An hour where packed VMs together needed more cores than the server has.', Rightsizing: 'Moving a VM to a smaller size that still covers its forecast peak.' };
const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); };
function Chart({ r }) {
  const max = Math.max(...r.p95, ...r.actual) * 1.1 || 1, W = 900, Hh = 230, X = (i) => (i / (r.actual.length - 1 || 1)) * W, Y = (v) => Hh - (v / max) * Hh;
  const p = (a) => a.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  return <svg viewBox={`0 0 ${W} ${Hh}`} style={{ width: '100%', height: 260 }}>
    <path d={p(r.p95) + `L${W},${Hh}L0,${Hh}Z`} fill="#22d3a622" /><path d={p(r.p95)} stroke="#22d3a6" fill="none" strokeDasharray="4" />
    <path d={p(r.p50)} stroke="#60a5fa" fill="none" /><path d={p(r.actual)} stroke="#fbbf24" fill="none" />
    <line x1="0" x2={W} y1={Y(r.size)} y2={Y(r.size)} stroke="#f87171" strokeDasharray="2 4" /></svg>;
}
export default function Page() {
  const [tab, setTab] = useState(0), [p, setP] = useState({ n: 48, headroom: 0.15, target: 0.8, price: 1.5, seed: 7, source: 'azure' });
  const [d, setD] = useState(null), [sel, setSel] = useState(0), [ai, setAi] = useState(null), [busy, setBusy] = useState(false), [done, setDone] = useState({}), [err, setErr] = useState('');
  useEffect(() => { const t = setTimeout(async () => { try { const r = await fetch('/api/plan', { method: 'POST', body: JSON.stringify(p) }); const j = await r.json(); if (j.error) throw 0; setD(j); setSel(0); setAi(null); setErr(''); } catch { setErr('Could not compute plan'); } }, 250); return () => clearTimeout(t); }, [p]);
  const k = d?.kpi, row = d?.rows?.[sel] || d?.rows?.[0];
  const csv = useMemo(() => d ? ['vm,cores,mean_util_pct,class,idle,steady,busy,recommended_size,action,flag,backtest_overload_pct', ...d.rows.map((r) => [r.id, r.cores, r.util, r.label, r.idle, r.steady, r.busy, r.size, r.action, '"' + r.flag + '"', r.overloadPct].join(','))].join('\n') : '', [d]);
  const brief = async () => { setBusy(true); try { const r = await fetch('/api/explain', { method: 'POST', body: JSON.stringify({ kpi: k }) }); setAi(await r.json()); } catch { setAi({ text: 'Unavailable', source: 'none' }); } setBusy(false); };
  const set = (key) => (e) => setP({ ...p, [key]: +e.target.value });
  return <div className="app">
    <aside><h1>Idle<span>Watt</span></h1><div className="sub">Shrink waste and show the risk</div>
      <label>Data source</label><select value={p.source} onChange={(e) => setP({ ...p, source: e.target.value })} style={{ width: '100%' }}><option value="azure">Real Azure trace (27.5 days)</option><option value="synthetic">Synthetic (3-week weekly demo)</option></select>
      <label>VMs in sample: {p.n}</label><input type="range" min="8" max="300" value={p.n} onChange={set('n')} />
      <label>Headroom over p95: {Math.round(p.headroom * 100)}%</label><input type="range" min="0" max="0.5" step="0.05" value={p.headroom} onChange={set('headroom')} />
      <label>Target server utilisation: {Math.round(p.target * 100)}%</label><input type="range" min="0.5" max="0.95" step="0.05" value={p.target} onChange={set('target')} />
      <label>Server price ($/hour)</label><input type="number" step="0.1" value={p.price} onChange={set('price')} />
      <label>Sample seed</label><input type="number" value={p.seed} onChange={set('seed')} />
      <div className="warn">{d?.disclaimer}</div></aside>
    <main>{d && <div className="sub">Data: <b style={{ color: d.meta.real ? 'var(--ac)' : 'var(--wa)' }}>{d.meta.source}</b> · {d.meta.hours} h per VM · sized on first {d.meta.trainHours} h · tested on last {d.meta.testHours} h</div>}<div className="tabs">{TABS.map((t, i) => <button key={t} className={i === tab ? 'on' : ''} onClick={() => setTab(i)}>{t}</button>)}</div>
      {err && <div className="card">{err}</div>}{!d ? <div className="card">Computing…</div> : <>
      {tab === 0 && <><div className="kpis">
        {[[`${k.baselineServers} → ${k.optimizedServers}`, 'servers (baseline → GA)'], [`$${k.monthlySavings}`, 'est. monthly saving'], [`${k.kwhSavedMonth} kWh`, 'est. energy saved / month'], [`${k.co2KgSavedMonth} kg`, 'est. CO₂ avoided / month'], [`${k.serverOverloadHoursPct}%`, 'server-hours overloaded (backtest)'], [`${k.downsized} / ${k.idleVMs}`, 'downsize / idle VMs']].map(([a, b]) => <div className="card kpi" key={b}><b>{a}</b><small>{b}</small></div>)}</div>
        <div className="grid2"><div className="card"><div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Forecast with safety range (held-out window)</b>
          <select value={sel} onChange={(e) => setSel(+e.target.value)}>{d.rows.map((r, i) => <option key={r.id} value={i}>{r.id} ({r.label})</option>)}</select></div>
          <Chart r={row} /><small style={{ color: 'var(--mut)' }}>Amber actual · blue p50 · green p95 band · red dotted recommended size ({row.size} cores of {row.cores})</small></div>
          <div className="card"><b>GA convergence</b><p style={{ color: 'var(--mut)' }}>Servers needed per generation: {d.history[0]} → {d.history.at(-1)}</p>
            <p>Cost before <b>${k.monthlyCostBefore}</b> · after <b>${k.monthlyCostAfter}</b></p><p>Avg VM overload on held-out week: <b>{k.vmOverloadPct}%</b></p></div></div></>}
      {tab === 1 && <div className="card"><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><b>Per-VM plan</b><button className="btn pri" onClick={() => dl('idlewatt_vm_plan.csv', csv, 'text/csv')}>Download CSV</button></div>
        <div className="tbl"><table><thead><tr><th>VM</th><th>Cores</th><th>Mean util %</th><th>Class</th><th>Idle</th><th>Steady</th><th>Busy</th><th>Rec. size</th><th>Action</th><th>Note</th><th>Overload %</th></tr></thead><tbody>
          {d.rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.cores}</td><td>{r.util}</td><td><span className={'tag ' + r.label}>{r.label}</span></td><td>{r.idle}</td><td>{r.steady}</td><td>{r.busy}</td><td>{r.size}</td><td>{r.action}</td><td>{r.flag}</td><td>{r.overloadPct}</td></tr>)}</tbody></table></div></div>}
      {tab === 2 && <div className="card"><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><b>{d.servers.length} servers after GA packing</b><button className="btn pri" onClick={() => dl('idlewatt_plan.json', JSON.stringify(d, null, 2), 'application/json')}>Download full plan (JSON)</button></div>
        <div className="tbl"><table><thead><tr><th>Server</th><th>Fill</th><th>VMs</th></tr></thead><tbody>{d.servers.map((s) => <tr key={s.id}><td>{s.id}</td><td style={{ width: 200 }}><div className="bar"><i style={{ width: `${(s.usedCores / 64) * 100}%` }} /></div>{s.usedCores}/64 cores</td><td>{s.vms.join(', ')}</td></tr>)}</tbody></table></div></div>}
      {tab === 3 && <div className="card"><button className="btn pri" onClick={brief} disabled={busy}>{busy ? 'Writing…' : 'Generate AI brief'}</button>
        {ai && <><p style={{ color: 'var(--mut)' }}>Source: {ai.source} (only aggregate numbers are sent, never VM IDs)</p><pre>{ai.text}</pre><button className="btn" onClick={() => dl('idlewatt_brief.md', ai.text, 'text/markdown')}>Download brief (.md)</button></>}</div>}
      {tab === 4 && <div className="card"><b>Pre-change checklist</b><ul style={{ listStyle: 'none', padding: 0 }}>{CHECK.map((c) => <li key={c}><label style={{ margin: 0, color: 'var(--tx)', fontSize: 15 }}><input type="checkbox" checked={!!done[c]} onChange={() => setDone({ ...done, [c]: !done[c] })} /> {c}</label></li>)}</ul>
        <button className="btn" onClick={() => dl('idlewatt_checklist.md', CHECK.map((c) => `- [${done[c] ? 'x' : ' '}] ${c}`).join('\n'), 'text/markdown')}>Download checklist</button></div>}
      {tab === 5 && <div className="card">{Object.entries(GLOSS).map(([a, b]) => <p key={a}><b>{a}</b>: <span style={{ color: 'var(--mut)' }}>{b}</span></p>)}</div>}
      {tab === 6 && <div className="card"><b>How to use IdleWatt</b><ol><li>Set sample size, headroom, target utilisation and server price in the sidebar. The plan recomputes.</li><li><b>Dashboard</b>: read savings, then pick a VM to see forecast vs. what really happened in the held-out window.</li><li><b>VM classes</b>: fuzzy idle/steady/busy scores and the recommended size. Download the CSV.</li><li><b>Packing</b>: the GA placement and per-server fill. Download the JSON.</li><li><b>AI brief</b>: a short narrative. Chain: cache → Gemini → Pollinations → Ollama → template.</li><li>Walk the <b>Checklist</b> before changing anything real.</li></ol>
        <p style={{ color: 'var(--mut)' }}>Technologies: Next.js (UI + API routes), a pure-JS engine (seasonal forecast, fuzzy logic, GA), node:test, Vercel.</p></div>}
      </>}</main></div>;
}
