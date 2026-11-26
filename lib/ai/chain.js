import { buildPrompt, gemini, pollinations, ollama } from './providers.js';
import { template } from './template.js';
const cache = new Map();
// Order: cache -> Gemini (free tier) -> Pollinations (no key) -> Ollama (local only) -> template. Never throws.
export async function explain(kpi, providers = [['gemini', gemini], ['pollinations', pollinations], ['ollama', ollama]]) {
  const key = JSON.stringify(kpi);
  if (cache.has(key)) return { text: cache.get(key), source: 'cache' };
  const prompt = buildPrompt(kpi);
  for (const [name, fn] of providers) {
    try { const text = await fn(prompt); cache.set(key, text); if (cache.size > 100) cache.delete(cache.keys().next().value); return { text, source: name }; } catch {}
  }
  return { text: template(kpi), source: 'template' };
}
