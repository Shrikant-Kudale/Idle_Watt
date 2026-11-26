import { fuzzy } from '../../lib/engine/fuzzy.js';
// Pure SVG charts (no hooks, no libraries) so they render in the browser and inside the server-built report.
export const CHART_CSS = `.ax{stroke:var(--bd)}.fa{fill:var(--ac)}.fb{fill:var(--ac2)}.fw{fill:var(--wa)}.sa{stroke:var(--ac);fill:none}.sb{stroke:var(--ac2);fill:none}.sw{stroke:var(--wa);fill:none}.sr{stroke:var(--bad)}svg text{fill:var(--mut);font-size:11px}`;
const f0 = (n) => Math.round(n).toLocaleString('en-US');
const Axis = ({ W, H, max, unit = '' }) => [0, 0.25, 0.5, 0.75, 1].map((q) => <g key={q}><line className="ax" x1="44" x2={W} y1={H - q * (H - 24) - 12} y2={H - q * (H - 24) - 12} /><text x="40" y={H - q * (H - 24) - 8} textAnchor="end">{(max * q).toFixed(max < 5 ? 1 : 0)}{unit}</text></g>);
export function Forecast({ r }) {
  const W = 900, H = 260, max = Math.max(...r.p95, ...r.actual, r.size) * 1.12 || 1, n = r.actual.length - 1 || 1, X = (i) => 44 + (i / n) * (W - 48), Y = (v) => H - 12 - (v / max) * (H - 24);
  const p = (a) => a.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }} role="img" aria-label="Forecast versus actual processor use"><Axis W={W} H={H} max={max} />
    <path d={p(r.p95) + `L${X(n)},${Y(0)}L${X(0)},${Y(0)}Z`} className="fa" opacity=".13" /><path d={p(r.p95)} className="sa" strokeDasharray="5 4" strokeWidth="1.6" />
    <path d={p(r.p50)} className="sb" strokeWidth="2" /><path d={p(r.actual)} className="sw" strokeWidth="1.8" />
    <line className="sr" x1="44" x2={W} y1={Y(r.size)} y2={Y(r.size)} strokeDasharray="2 5" strokeWidth="1.6" /><text x={W - 4} y={Y(r.size) - 5} textAnchor="end">recommended size: {r.size} cores</text>
    <text x="44" y={H - 0}>start of test week</text><text x={W} y={H - 0} textAnchor="end">end →</text><text x="4" y="10">cores in use</text></svg>;
}
export function Gauge({ pct, label = 'servers busy after plan' }) {
  const c = pct < 35 ? 'var(--bad)' : pct < 60 ? 'var(--wa)' : 'var(--ac)', L = 219.9;
  return <svg viewBox="0 0 160 100" style={{ width: '100%', maxWidth: 260 }} role="img" aria-label={`Servers ${pct}% busy`}><path d="M10 85 A70 70 0 0 1 150 85" fill="none" stroke="var(--bd)" strokeWidth="14" strokeLinecap="round" /><path d="M10 85 A70 70 0 0 1 150 85" fill="none" style={{ stroke: c }} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(pct / 100) * L} ${L}`} />
    <text x="80" y="76" textAnchor="middle" style={{ fontSize: 30, fontWeight: 800, fill: 'var(--tx)' }}>{pct}%</text><text x="80" y="95" textAnchor="middle">{label}</text></svg>;
}
export function Donut({ parts }) {
  const tot = parts.reduce((s, x) => s + x.v, 0) || 1; let off = 0;
  return <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}><svg viewBox="0 0 120 120" width="150" role="img" aria-label="Machines by usage level"><g transform="rotate(-90 60 60)">{parts.map((x) => { const len = (x.v / tot) * 301.6, el = <circle key={x.l} cx="60" cy="60" r="48" fill="none" strokeWidth="18" strokeDasharray={`${len} 301.6`} strokeDashoffset={-off} style={{ stroke: x.s }} />; off += len; return el; })}</g><text x="60" y="58" textAnchor="middle" style={{ fontSize: 20, fontWeight: 700, fill: 'var(--tx)' }}>{tot}</text><text x="60" y="73" textAnchor="middle">machines</text></svg>
    <div>{parts.map((x) => <div key={x.l}><span style={{ color: x.s }}>●</span> {x.l}: <b>{x.v}</b> ({Math.round((100 * x.v) / tot)}%)</div>)}</div></div>;
}
export function Compare({ rows }) {
  return <div>{rows.map(([l, a, b, fmt]) => { const m = Math.max(a, b) || 1; return <div key={l} style={{ marginBottom: 14 }}><div style={{ fontSize: 13, color: 'var(--mut)' }}>{l}</div>
    {[['Today', a, 'var(--ac2)'], ['Plan', b, 'var(--ac)']].map(([n, v, c]) => <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '3px 0' }}><span style={{ width: 44, fontSize: 12, color: 'var(--mut)' }}>{n}</span><div style={{ flex: 1, height: 14, background: 'var(--sf2)', borderRadius: 7, overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${(v / m) * 100}%`, background: c }} /></div><b style={{ width: 74, textAlign: 'right' }}>{fmt(v)}</b></div>)}</div>; })}</div>;
}
export function Frontier({ pts, best }) {
  const W = 640, H = 310, mx = Math.max(...pts.map((p) => p.vmOverloadPct), 1) * 1.15, my = Math.max(...pts.map((p) => p.savings), 1) * 1.12, X = (v) => 56 + (v / mx) * (W - 70), Y = (v) => H - 40 - (v / my) * (H - 64), col = { 0.6: 'var(--ac2)', 0.8: 'var(--ac)', 0.9: 'var(--bad)' };
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }} role="img" aria-label="Savings versus risk"><line className="ax" x1="56" x2={W} y1={H - 40} y2={H - 40} /><line className="ax" x1="56" x2="56" y1="14" y2={H - 40} />
    <text x={W / 2} y={H - 10} textAnchor="middle">Risk: share of machine-hours above their new size (%)  →  riskier</text><text x="4" y="12">Dollars saved per month ↑</text>
    {[0, 0.5, 1].map((q) => <text key={'y' + q} x="50" y={Y(q * my) + 4} textAnchor="end">${f0(q * my)}</text>)}{[0, 0.5, 1].map((q) => <text key={'x' + q} x={X(q * mx)} y={H - 24} textAnchor="middle">{(q * mx).toFixed(1)}</text>)}
    {pts.map((p, i) => <circle key={i} cx={X(p.vmOverloadPct)} cy={Y(p.savings)} r={6 + (p.headroom + 0.4) * 11} style={{ fill: col[p.target], fillOpacity: 0.5, stroke: col[p.target] }}><title>{`Fill servers to ${p.target * 100}%, cushion ${p.headroom * 100}%: saves $${f0(p.savings)}/month, risk ${p.vmOverloadPct}%`}</title></circle>)}
    {best && <g><circle cx={X(best.vmOverloadPct)} cy={Y(best.savings)} r="20" fill="none" style={{ stroke: 'var(--tx)' }} strokeDasharray="3 3" /><text x={X(best.vmOverloadPct)} y={Y(best.savings) - 26} textAnchor="middle" style={{ fontWeight: 700, fill: 'var(--tx)' }}>best under 1% risk</text></g>}
    {Object.entries(col).map(([t, c], i) => <g key={t}><circle cx={W - 230 + i * 78} cy="14" r="5" style={{ fill: c }} /><text x={W - 221 + i * 78} y="18">fill {t * 100}%</text></g>)}</svg>;
}
export function Heat({ heat }) {
  const B = 3, cols = Math.ceil(heat[0].length / B), cw = 12, ch = 18, W = 64 + cols * cw;
  const col = (v) => v > 100 ? '#dc3c4a' : `hsl(${165 - Math.min(v, 100) * 1.15} 68% ${50 - Math.min(v, 100) * 0.14}%)`;
  return <div style={{ overflow: 'auto' }}><svg width={W} height={heat.length * ch + 26} role="img" aria-label="Server load over the test week">{heat.map((row, k) => <g key={k}><text x="56" y={k * ch + 13} textAnchor="end">Server {k + 1}</text>{Array.from({ length: cols }, (_, c) => { const v = Math.max(...row.slice(c * B, c * B + B)); return <rect key={c} x={62 + c * cw} y={k * ch} width={cw - 1} height={ch - 2} rx="2" fill={col(v)}><title>{`Server ${k + 1}, hours ${c * B}-${c * B + B}: ${v}% of capacity`}</title></rect>; })}</g>)}
    <text x="62" y={heat.length * ch + 18}>test week, left to right · green = spare room · red = ran out of room</text></svg></div>;
}

export function Bars({ rows, fmt = (v) => v }) {
  const m = Math.max(...rows.map((r) => r.v), 1e-9);
  return <div>{rows.map((r) => <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '7px 0' }}><span style={{ width: 175, fontSize: 13, color: r.hl ? 'var(--tx)' : 'var(--mut)', fontWeight: r.hl ? 700 : 400 }}>{r.label}</span><div style={{ flex: 1, height: 16, background: 'var(--sf2)', borderRadius: 8, overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${(r.v / m) * 100}%`, background: r.hl ? 'var(--ac)' : 'var(--ac2)', opacity: r.hl ? 1 : 0.6 }} /></div><b style={{ width: 72, textAlign: 'right' }}>{fmt(r.v)}</b></div>)}</div>;
}
export function Membership({ rows }) {
  const W = 640, H = 240, X = (u) => 50 + (u / 60) * (W - 64), Y = (v) => H - 40 - v * (H - 70), us = Array.from({ length: 61 }, (_, i) => i), col = { idle: 'var(--wa)', steady: 'var(--ac2)', busy: 'var(--bad)' };
  const path = (k) => us.map((u, i) => `${i ? 'L' : 'M'}${X(u).toFixed(1)},${Y(fuzzy(u)[k]).toFixed(1)}`).join('');
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }} role="img" aria-label="Fuzzy membership functions"><line className="ax" x1="50" x2={W} y1={H - 40} y2={H - 40} /><line className="ax" x1="50" x2="50" y1="14" y2={H - 40} />
    {['idle', 'steady', 'busy'].map((k) => <path key={k} d={path(k)} fill="none" style={{ stroke: col[k] }} strokeWidth="2.6" />)}
    {rows.filter((_, i) => i % 3 === 0).map((r, i) => <circle key={i} cx={X(Math.min(r.util, 60))} cy={Y(Math.max(r.idle, r.steady, r.busy))} r="3.2" style={{ fill: col[r.label] }} opacity=".55" />)}
    {[0, 20, 40, 60].map((u) => <text key={u} x={X(u)} y={H - 24} textAnchor="middle">{u}%{u === 60 ? '+' : ''}</text>)}<text x={W / 2} y={H - 6} textAnchor="middle">typical use of the cores a machine was given →</text><text x="4" y="12">membership (0–1)</text>
    {[['Mostly unused', 'idle'], ['Moderately used', 'steady'], ['Heavily used', 'busy']].map(([t, k], i) => <g key={k}><circle cx={W - 330 + i * 110} cy="14" r="5" style={{ fill: col[k] }} /><text x={W - 322 + i * 110} y="18">{t}</text></g>)}</svg>;
}
