import sample from '../../../data/azure_sample.json';
import { plan } from '../../../lib/engine.js';
export const runtime = 'nodejs';
export async function POST(req) {
  try { const b = await req.json(); return Response.json(plan(b, b.source === 'synthetic' ? null : sample)); }
  catch (e) { return Response.json({ error: 'bad request' }, { status: 400 }); }
}
