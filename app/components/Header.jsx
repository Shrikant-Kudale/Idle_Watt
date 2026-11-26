'use client';
import { Forecast, Donut, Compare, Frontier, Heat, Gauge, Bars, Membership } from './charts.jsx';
import { ACT, LVL } from '../../lib/insights/index.js';
import { f0, dl, csvOf } from '../../lib/client/utils.js';
import { TEMPLATE } from '../../lib/client/csv.js';
import { GUIDE } from '../../lib/client/content.js';
import { PRESETS } from '../../lib/client/constants.js';
import { Ctl } from './ui.jsx';
export default function Header(c) {
  const { tab, theme, setTheme, p, setP, set, custom, setCustom, upErr, upload, maxN, d, I, k, row, sel, setSel, go, openMachine, rows, q, setQ, cls, setCls, sw, setSw, swErr, best, brief, busy, ai, rep, actionCsv, machinesCsv, scen, saveScen, delScen } = c;
  return (
<header><h1>⚡ IdleWatt</h1><small>Stop paying for cloud capacity nobody uses.</small>{d && <span className="chip">{custom ? 'Your data' : d.meta.real ? 'Real data' : 'Demo data'} · {Math.round(d.meta.hours / 24)} days</span>}
    <button className="tg" onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark')}>{theme === 'dark' ? '🌙 Dark' : theme === 'light' ? '☀️ Light' : '🖥️ Auto'}</button></header>
  );
}
