'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Servers(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<><div className="card"><div className="row sp"><h3>Server load map</h3><button className="btn pri" onClick={() => dl('idlewatt_plan.json', JSON.stringify(d, null, 2), 'application/json')}>⬇ Full plan (JSON)</button></div><p className="cap">Each row is a server and each block is 3 hours of the test week. <b style={{ color: 'var(--ac)' }}>Green</b> means spare room, <b style={{ color: 'var(--bad)' }}>red</b> means it ran out of room. A mostly green map means the plan is safe.</p><Heat heat={d.heat} /></div>
        <div className="card"><h3>{d.servers.length} servers and what runs on them</h3><p className="cap">The packing search placed every machine so the fewest servers are needed.</p><div className="tbl"><table><thead><tr><th>Server</th><th style={{ width: 210 }}>How full</th><th>Machines on it</th></tr></thead><tbody>{d.servers.map((s) => <tr key={s.id}><td><b>{s.name}</b></td><td><div className="bar"><i style={{ width: `${(s.usedCores / d.params.serverCores) * 100}%` }} /></div><small className="mut">{s.usedCores} of {d.params.serverCores} cores reserved</small></td><td className="mut">{s.vms.slice(0, 6).join(', ')}{s.vms.length > 6 ? ` and ${s.vms.length - 6} more` : ''}</td></tr>)}</tbody></table></div></div></>
  );
}
