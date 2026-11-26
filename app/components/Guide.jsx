'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Guide(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<><div className="card"><h3>Why IdleWatt exists</h3><p>Most companies pay for far more cloud capacity than they use, because nobody wants to risk slowing a system down. IdleWatt shows <b>how much is wasted, what to change, and how risky the change is</b>, in words a manager can follow and with numbers an engineer can check.</p></div>
        <h2 className="sec">Who it is for</h2><div className="insg">{GUIDE.who.map(([i, t, x]) => <div className="card" key={t} style={{ margin: 0 }}><div style={{ fontSize: 28 }}>{i}</div><h3>{t}</h3><p className="mut">{x}</p></div>)}</div>
        <div className="g3" style={{ marginTop: 14 }}><div className="card"><h3>Real-world uses</h3><ul>{GUIDE.uses.map((u) => <li key={u}>{u}</li>)}</ul></div><div className="card"><h3>How it works</h3>{GUIDE.steps.map(([t, x], i) => <div className="step" key={t}><span>{i + 1}</span><div><b>{t}</b><br /><span className="mut">{x}</span></div></div>)}</div></div>
        <div className="g3"><div className="card"><h3>How to read the charts</h3>{GUIDE.charts.map(([t, x]) => <p key={t}><b>{t}.</b> <span className="mut">{x}</span></p>)}</div><div className="card"><h3>Glossary</h3>{Object.entries(GUIDE.gloss).map(([a, b]) => <p key={a}><b>{a}:</b> <span className="mut">{b}</span></p>)}</div></div>
        <div className="card"><h3>Questions</h3>{GUIDE.faq.map(([a, b]) => <p key={a}><b>{a}</b><br /><span className="mut">{b}</span></p>)}</div></>
  );
}
