'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Report(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<><div className="card"><div className="row sp"><div><h3>Full report</h3><p className="cap" style={{ margin: 0 }}>Summary, findings, charts, server plan, risks, method and glossary, ready to share.</p></div><div className="row"><button className="btn" onClick={brief} disabled={busy}>{busy ? 'Writing…' : ai ? '↻ Rewrite AI commentary' : '✨ Add AI commentary'}</button>
          <button className="btn pri" disabled={!rep} onClick={() => dl('idlewatt_report.html', rep, 'text/html')}>⬇ Report (.html)</button><button className="btn" disabled={!rep} onClick={() => dl('idlewatt_report.doc', rep, 'application/msword')}>⬇ Word</button><button className="btn" disabled={!rep} onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(rep); w.document.close(); w.focus(); setTimeout(() => w.print(), 400); } }}>🖨 Save as PDF</button>
          <button className="btn" onClick={() => dl('idlewatt_action_plan.csv', actionCsv(), 'text/csv')}>⬇ Action plan</button></div></div>{ai && <p className="hint">Commentary written by: {ai.source}. Only totals are sent, never machine names.</p>}</div>
        {rep ? <iframe title="Report preview" srcDoc={rep} /> : <div className="card">Building your report…</div>}</>
  );
}
