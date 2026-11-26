// Fallback chain: cache -> Gemini (free tier) -> Pollinations (no key) -> Ollama (local only) -> fixed template
export const runtime = 'nodejs';
const cache = new Map();
const mk = (k) => `You are a cloud FinOps analyst. Write exactly 6 short plain-text sentences, one per line. No markdown, no asterisks, no hashes, no bullets, no numbering. Explain this right-sizing result to a cloud cost team, include risks and next steps. Data: ${JSON.stringify(k)}`;
async function gemini(p) { const k = process.env.GEMINI_API_KEY; if (!k) throw 0; const m = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }] }), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw 0; return (await r.json()).candidates[0].content.parts[0].text; }
async function pollinations(p) { const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(p), { signal: AbortSignal.timeout(20000) }); if (!r.ok) throw 0; const t = await r.text(); if (t.length < 20) throw 0; return t; }
async function ollama(p) { const u = process.env.OLLAMA_URL; if (!u) throw 0;
  const r = await fetch(u + '/api/generate', { method: 'POST', body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3.2', prompt: p, stream: false }), signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw 0; return (await r.json()).response; }
const template = (k) => `- ${k.vms} VMs fit on ${k.optimizedServers} servers instead of ${k.baselineServers} (${k.serversSaved} fewer).\n- Estimated saving: $${k.monthlySavings}/month, ~${k.kwhSavedMonth} kWh and ~${k.co2KgSavedMonth} kg CO2 (estimates).\n- ${k.downsized} VMs are downsize candidates; ${k.idleVMs} look idle.\n- Backtest: ${k.serverOverloadHoursPct}% of server-hours overloaded on the held-out week.\n- Risk: CPU only. Check memory, IO and burst limits before acting.\n- Next: pilot on the idle group first, then re-run weekly.`;
export async function POST(req) {
  const { kpi } = await req.json(); const key = JSON.stringify(kpi);
  if (cache.has(key)) return Response.json({ text: cache.get(key), source: 'cache' });
  const p = mk(kpi);
  for (const [name, fn] of [['gemini', gemini], ['pollinations', pollinations], ['ollama', ollama]]) {
    try { const text = await fn(p); cache.set(key, text); return Response.json({ text, source: name }); } catch {}
  }
  return Response.json({ text: template(kpi), source: 'template' });
}
