import sample from '../../../data/azure_sample.json';
import pkg from '../../../package.json';
export const runtime = 'nodejs';
export async function GET() {
  return Response.json({ ok: true, version: pkg.version, dataset: sample.meta, ai: { gemini: !!process.env.GEMINI_API_KEY, pollinations: true, ollama: !!process.env.OLLAMA_URL, template: true } });
}
