'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
function Saved({ scen, delScen, setP, p }) {
  return <div className="card"><h3>My saved scenarios</h3><p className="cap">Use “Save this scenario” in the sidebar to keep a setting, then compare it here.</p>{scen.length ? <table><thead><tr><th>Scenario</th><th>Servers</th><th>Saves / month</th><th>Risk</th><th></th></tr></thead><tbody>{scen.map((s) => <tr key={s.id}><td>{s.label}</td><td>{s.servers}</td><td>${f0(s.savings)}</td><td>{s.risk}%</td><td><button className="btn sm" onClick={() => setP({ ...p, headroom: s.headroom, target: s.target })}>Use</button> <button className="btn sm" onClick={() => delScen(s.id)}>Delete</button></td></tr>)}</tbody></table> : <p className="mut">Nothing saved yet.</p>}</div>;
}
export default function Tradeoffs(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<><><div className="card"><h3>Money saved versus risk</h3><p className="cap">Saving more means packing tighter or trusting smaller sizes, and that raises risk. We tried 18 combinations. Higher on the chart = more money saved. Further right = riskier. Pick the point where extra savings stop being worth it.</p>
          {sw ? <Frontier pts={sw} best={best} /> : swErr ? <p>Could not run the scenarios. <button className="btn sm" onClick={() => setSw(null)}>Try again</button></p> : <p className="mut">Running 18 scenarios…</p>}</div>
        {sw && <div className="g2"><div className="card"><h3>All scenarios</h3><p className="cap">Press “Use” to apply a scenario to the whole app.</p><div className="tbl"><table><thead><tr><th>Cushion</th><th>Fill</th><th>Servers</th><th>Saves / month</th><th>Risk</th><th></th></tr></thead><tbody>{[...sw].sort((a, b) => b.savings - a.savings).map((x, i) => <tr key={i}><td>{Math.round(x.headroom * 100)}%</td><td>{Math.round(x.target * 100)}%</td><td>{x.servers}</td><td>${f0(x.savings)}</td><td>{x.vmOverloadPct}%</td><td><button className="btn sm" onClick={() => setP({ ...p, headroom: x.headroom, target: x.target })}>Use</button></td></tr>)}</tbody></table></div></div>
          <div className="card"><h3>Our suggestion</h3>{best ? <><p>Fill servers to <b>{Math.round(best.target * 100)}%</b> with a <b>{Math.round(best.headroom * 100)}%</b> safety cushion. It saves about <b>${f0(best.savings)}</b> a month on {best.servers} servers while keeping risk under 1%.</p><button className="btn pri" onClick={() => setP({ ...p, headroom: best.headroom, target: best.target })}>Apply this</button></> : <p>No scenario stays under 1% risk with this data.</p>}<p className="cap">Risk here means the share of machine-hours that went above their new size in the test week.</p></div></div>}</><Saved scen={scen} delScen={delScen} setP={setP} p={p} /></>
  );
}