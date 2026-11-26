'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Quality(c) {
  const { d } = c, Q = d.quality, P = d.packing, gap = P.bound ? Math.round((100 * (P.ga - P.bound)) / P.bound) : 0, pc = d.params.price / d.params.serverCores;
  const sched = d.rows.filter((r) => r.offHours >= 40).sort((a, b) => b.offHours - a.offHours).slice(0, 10);
  const verdict = Q.coverage >= 93 ? 'The safety range is honest: it held about as often as promised.' : Q.coverage >= 88 ? 'Slightly optimistic. Consider a larger safety cushion.' : 'Too optimistic for this data. Raise the safety cushion before acting.';
  return (<>
    <div className="g2"><div className="card"><h3>Is the safety range honest?</h3><p className="cap">The tool promised that real use would stay under the green line 95% of the time. We checked that on a stretch of time it never saw, across {f0(Q.hours)} machine-hours.</p>
      <div className="row" style={{ gap: 30 }}><Gauge pct={Math.round(Q.coverage)} label="of hours inside the range" /><div style={{ flex: 1, minWidth: 220 }}><b>{verdict}</b><p className="mut">Target 95%, measured {Q.coverage}%. Average band width: {Q.bandWidth} cores above the typical forecast.</p></div></div></div>
      <div className="card"><h3>Does it beat simple guesses?</h3><p className="cap">Average forecast error in cores (shorter bar is better).</p><Bars rows={Q.models.map((m, i) => ({ label: m.name, v: m.mae, hl: i === 0 }))} fmt={(v) => v.toFixed(3)} /><p className="mut">{Q.improvementPct >= 0 ? `Our forecast is ${Q.improvementPct}% more accurate than a flat average.` : `A flat average is ${-Q.improvementPct}% more accurate here, so rely on the safety range, not the pattern.`}</p></div></div>
    <div className="g2"><div className="card"><h3>Did the packing search work?</h3><p className="cap">Servers needed by four methods (fewer is better). The “theoretical minimum” is total size divided by server room, so no method can beat it.</p>
      <Bars rows={[{ label: 'Today’s method', v: P.naive }, { label: 'Biggest-first rule', v: P.ffd }, { label: 'IdleWatt search (GA)', v: P.ga, hl: true }, { label: 'Theoretical minimum', v: P.bound }]} fmt={f0} /><p className="mut">The search found {P.ga} servers, within {gap}% of the theoretical minimum.</p></div>
      <div className="card"><h3>How machines are classified</h3><p className="cap">Fuzzy logic gives each machine a score for each usage level instead of one hard label. Dots are real machines.</p><Membership rows={d.rows} /></div></div>
    <div className="card"><h3>Off-hours scheduling</h3><p className="cap">Machines predicted to use under 10% of their cores for 40 or more hours a week could be switched off in those hours. This is a separate estimate: do not add it to the consolidation saving.</p>
      {sched.length ? <table><thead><tr><th>Machine</th><th>Idle hours / week</th><th>Est. saving / month</th></tr></thead><tbody>{sched.map((r) => <tr key={r.id}><td><b>{r.name}</b></td><td>{r.offHours}</td><td>${f0((r.offHours / 168) * r.size * pc * 730)}</td></tr>)}</tbody></table> : <p className="mut">No machine is idle for 40+ hours a week in this data (needs 3+ weeks of history).</p>}</div></>
  );
}
