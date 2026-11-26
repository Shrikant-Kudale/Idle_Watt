// Free-first AI text providers. Each throws on failure so the chain can fall through.
export const buildPrompt = (k) => `You are a cloud FinOps analyst. Write exactly 6 short plain-text sentences, one per line. No markdown, no asterisks, no hashes, no bullets, no numbering. Explain this cloud right-sizing result to a non-technical manager in plain everyday words, with one sentence on risk and one on next steps. Data: ${JSON.stringify(k)}`;
export async function gemini(p) {
  const key = process.env.GEMINI_API_KEY; if (!key) throw new Error('no key');
  const m = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: p }] }] }), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error('gemini ' + r.status); return (await r.json()).candidates[0].content.parts[0].text;
}
export async function pollinations(p) {
  const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(p), { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error('pollinations ' + r.status); const t = await r.text(); if (t.length < 20) throw new Error('empty'); return t;
}
export async function ollama(p) {
  const u = process.env.OLLAMA_URL; if (!u) throw new Error('no ollama');
  const r = await fetch(u + '/api/generate', { method: 'POST', body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3.2', prompt: p, stream: false }), signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error('ollama ' + r.status); return (await r.json()).response;
}
