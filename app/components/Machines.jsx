'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Machines(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<div className="card"><div className="row sp" style={{ marginBottom: 6 }}><div className="row"><input placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 190 }} /><select value={cls} onChange={(e) => setCls(e.target.value)} style={{ width: 170 }}><option value="all">All usage levels</option><option value="idle">Mostly unused</option><option value="steady">Moderately used</option><option value="busy">Heavily used</option></select><span className="mut">{rows.length} machines</span></div><div className="row"><button className="btn pri" onClick={() => dl('idlewatt_action_plan.csv', actionCsv(), 'text/csv')}>⬇ Action plan</button><button className="btn" onClick={() => dl('idlewatt_machines.csv', machinesCsv(), 'text/csv')}>⬇ All machines</button></div></div>
        <p className="cap">Each row is one cloud machine. “Given” is what it has today, “Needs” is the smallest size that would have coped. Click a row to see its forecast.</p>
        <div className="tbl"><table><thead><tr><th>Machine</th><th>Given (cores)</th><th>Needs (cores)</th><th>Typical use</th><th>Usage level</th><th title="Hours per week predicted under 10% use">Idle h/week</th><th>Advice</th><th title="How often it went above the new size in the test week">Went above new size</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="go" title={r.flag} onClick={() => openMachine(r.i)}><td><b>{r.name}</b><br /><span className="mut" style={{ fontSize: 12 }}>{r.kind}{r.memGb ? ` · ${r.memGb} GB memory` : ''}</span></td><td>{r.cores}</td><td>{r.size}</td><td>{r.util}%</td><td><span className={'tag ' + r.label}>{LVL[r.label]}</span></td><td>{r.offHours || "–"}</td><td>{ACT[r.action]}</td><td>{r.overloadPct}%</td></tr>)}</tbody></table></div></div>
  );
}
