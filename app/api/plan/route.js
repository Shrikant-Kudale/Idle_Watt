import sample from '../../../data/azure_sample.json';
import { plan, sweep } from '../../../lib/engine.js';
export const runtime = 'nodejs';
export async function POST(req) {
  try { const b = await req.json(); const src = b.source === 'synthetic' ? null : sample; return Response.json(b.sweep ? sweep(b, src) : plan(b, src)); }
  catch (e) { return Response.json({ error: 'bad request' }, { status: 400 }); }
}
