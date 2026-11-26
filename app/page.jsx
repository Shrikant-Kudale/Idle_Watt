'use client';
import { useEffect, useMemo, useState } from 'react';
import { CHART_CSS } from './components/charts.jsx';
import { insights, ACT, LVL } from '../lib/insights/index.js';
import { buildReport } from '../lib/report/index.jsx';
import { TABS } from '../lib/client/constants.js';
import { f0, clean, dl, csvOf } from '../lib/client/utils.js';
import { parseCsv } from '../lib/client/csv.js';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Overview from './components/Overview.jsx';
import Machines from './components/Machines.jsx';
import Servers from './components/Servers.jsx';
import Tradeoffs from './components/Tradeoffs.jsx';
import Quality from './components/Quality.jsx';
import Report from './components/Report.jsx';
import Guide from './components/Guide.jsx';
export default function Page() {
  const [tab, setTab] = useState('Overview'), [theme, setTheme] = useState('auto'), [p, setP] = useState({ n: 150, headroom: 0.15, target: 0.8, price: 1.5, seed: 7, source: 'azure' });
  const [custom, setCustom] = useState(null), [upErr, setUpErr] = useState(''), [d, setD] = useState(null), [sw, setSw] = useState(null), [swErr, setSwErr] = useState(false), [sel, setSel] = useState(0), [ai, setAi] = useState(null), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [q, setQ] = useState(''), [cls, setCls] = useState('all'), [rep, setRep] = useState(null);
  useEffect(() => { try { const t = localStorage.getItem('iw-theme'); if (t) setTheme(t); } catch {} const h = decodeURIComponent(location.hash.slice(1)); if (TABS.includes(h)) setTab(h); }, []);
  useEffect(() => { if (theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = theme; try { localStorage.setItem('iw-theme', theme); } catch {} }, [theme]);
  const go = (t, extra) => { setTab(t); if (extra?.filter) setCls(extra.filter); history.replaceState(null, '', '#' + t); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const body = (x = {}) => JSON.stringify({ ...p, ...(custom ? { vms: custom } : {}), ...x });
  const post = (url, x) => fetch(url, { method: 'POST', body: body(x) }).then((r) => r.json());
  useEffect(() => { const t = setTimeout(async () => { try { const j = await post('/api/plan'); if (j.error) { setErr(j.error); return; } setD(j); setSel(0); setAi(null); setSw(null); setRep(null); setSwErr(false); setErr(''); } catch { setErr('Could not compute the plan. Try different settings.'); } }, 250); return () => clearTimeout(t); }, [p, custom]);
  useEffect(() => { if ((tab === 'Trade-offs' || tab === 'Report') && !sw && d) { setSwErr(false); post('/api/plan', { sweep: true }).then((j) => (Array.isArray(j) ? setSw(j) : setSwErr(true))).catch(() => setSwErr(true)); } }, [tab, sw, d]);
  useEffect(() => { if (tab === 'Report' && d && sw) { try { setRep(buildReport(d, sw, ai ? clean(ai.text) : [])); } catch { setRep('<p>The report could not be built.</p>'); } } }, [tab, d, sw, ai]);
  const [scen, setScen] = useState([]);
  useEffect(() => { try { setScen(JSON.parse(localStorage.getItem('iw-scen') || '[]')); } catch {} }, []);
  const persist = (a) => { setScen(a); try { localStorage.setItem('iw-scen', JSON.stringify(a)); } catch {} };
  const saveScen = () => d && persist([...scen.slice(-7), { id: Date.now(), label: `Cushion ${Math.round(p.headroom * 100)}% · Fill ${Math.round(p.target * 100)}%`, headroom: p.headroom, target: p.target, servers: d.kpi.optimizedServers, savings: d.kpi.monthlySavings, risk: d.kpi.vmOverloadPct }]);
  const delScen = (id) => persist(scen.filter((s) => s.id !== id));
  const I = useMemo(() => (d ? insights(d) : null), [d]), k = d?.kpi, row = d?.rows?.[sel] || d?.rows?.[0];
  const best = sw ? sw.filter((x) => x.vmOverloadPct <= 1).sort((a, b) => b.savings - a.savings)[0] : null;
  const rows = useMemo(() => (d ? d.rows.map((r, i) => ({ ...r, i })).filter((r) => (cls === 'all' || r.label === cls) && r.name.toLowerCase().includes(q.toLowerCase())) : []), [d, q, cls]);
  const openMachine = (i) => { setSel(i); go('Overview'); setTimeout(() => document.getElementById('forecast')?.scrollIntoView({ behavior: 'smooth' }), 120); };
  const set = (key) => (e) => setP({ ...p, [key]: +e.target.value });
  const upload = (e) => { const f = e.target.files?.[0]; if (!f) return; f.text().then((t) => { try { const v = parseCsv(t); setCustom(v); setUpErr(''); setP((s) => ({ ...s, n: Math.min(s.n, v.length) })); } catch (x) { setUpErr(x.message); } }); e.target.value = ''; };
  const brief = async () => { setBusy(true); try { setAi(await fetch('/api/explain', { method: 'POST', body: JSON.stringify({ kpi: k }) }).then((r) => r.json())); } catch { setAi({ text: 'The AI summary is unavailable right now.', source: 'none' }); } setBusy(false); };
  const maxN = custom ? custom.length : p.source === 'azure' ? 269 : 200;
  const actionCsv = () => csvOf([['Machine', 'Type', 'Cores now', 'Cores recommended', 'Cores freed', 'What to do'], ...d.rows.filter((r) => r.action !== 'Keep').sort((a, b) => b.cores - b.size - (a.cores - a.size)).map((r) => [r.name, r.kind, r.cores, r.size, r.cores - r.size, ACT[r.action]])]);
  const machinesCsv = () => csvOf([['Machine', 'Type', 'Id', 'Cores given', 'Cores needed', 'Typical use %', 'Usage level', 'Advice', 'Note', 'Went above new size %'], ...d.rows.map((r) => [r.name, r.kind, r.id, r.cores, r.size, r.util, LVL[r.label], ACT[r.action], r.flag, r.overloadPct])]);
  const c = { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen };
  return <><style>{CHART_CSS}</style><Header {...c} /><div className="app"><Sidebar {...c} /><main><div className="tabs">{TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => go(t)}>{t}</button>)}</div>
    {err && <div className="card">{err}</div>}{!d ? <div className="card">Working out your plan…</div> : <>
      {tab === 'Overview' && <Overview {...c} />}{tab === 'Machines' && <Machines {...c} />}{tab === 'Servers' && <Servers {...c} />}{tab === 'Trade-offs' && <Tradeoffs {...c} />}{tab === 'Quality' && <Quality {...c} />}{tab === 'Report' && <Report {...c} />}{tab === 'Guide' && <Guide {...c} />}
    </>}</main></div></>;
}
