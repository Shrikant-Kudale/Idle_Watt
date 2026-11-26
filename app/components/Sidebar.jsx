'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Sidebar(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<aside><h4>Quick styles</h4><p className="hint">One click sets the two settings below.</p><div className="pre">{Object.entries(PRESETS).map(([n, [h, t]]) => <button key={n} className="btn sm" onClick={() => setP({ ...p, headroom: h, target: t })}>{n}</button>)}</div>
      <h4 style={{ marginTop: 18 }}>Settings</h4>
      <Ctl label="Data to analyse" hint="Real usage from Microsoft Azure’s public dataset, or generated demo data."><select disabled={!!custom} value={p.source} onChange={(e) => setP({ ...p, source: e.target.value })}><option value="azure">Real data</option><option value="synthetic">Demo data</option></select></Ctl>
      <Ctl label={`Cloud machines: ${p.n}`} hint="How many cloud machines (virtual computers) to include."><input type="range" min={Math.min(8, maxN)} max={maxN} value={Math.min(p.n, maxN)} onChange={set('n')} /></Ctl>
      <Ctl label={`Safety cushion: ${Math.round(p.headroom * 100)}%`} hint="Extra room kept above each machine’s busiest predicted hour. Higher is safer but saves less."><input type="range" min="0" max="0.5" step="0.05" value={p.headroom} onChange={set('headroom')} /></Ctl>
      <Ctl label={`How full to fill servers: ${Math.round(p.target * 100)}%`} hint="Higher packs more work onto each server and saves more, but leaves less room for spikes."><input type="range" min="0.5" max="0.95" step="0.05" value={p.target} onChange={set('target')} /></Ctl>
      <Ctl label="Cost of one server per hour ($)" hint="Only used to turn servers saved into dollars. Type your own rate."><input type="number" step="0.1" min="0" value={p.price} onChange={set('price')} /></Ctl>
      <Ctl label="Repeatability code" hint="The same code gives the same answer every time. Change it to try a different random arrangement."><input type="number" value={p.seed} onChange={set('seed')} /></Ctl>
      <h4 style={{ marginTop: 18 }}>Bring your own data</h4><p className="hint">Upload a CSV with columns machine, cores, hour, cpu_percent (hourly, 4+ machines, 24+ hours).</p>
      <div className="drop"><input type="file" accept=".csv,text/csv" onChange={upload} />{custom && <p className="hint">Using your file: {custom.length} machines. <a href="#" onClick={(e) => { e.preventDefault(); setCustom(null); }}>Back to sample data</a></p>}{upErr && <p className="hint" style={{ color: 'var(--bad)' }}>{upErr}</p>}<button className="btn sm" style={{ marginTop: 6 }} onClick={() => dl('idlewatt_template.csv', TEMPLATE, 'text/csv')}>⬇ Example CSV</button></div>
      <button className="btn sm" style={{ marginTop: 14 }} onClick={saveScen}>💾 Save this scenario</button><p className="hint">Keep up to 8 settings and compare them in Trade-offs.</p><div className="warn">{d?.disclaimer}</div></aside>
  );
}
