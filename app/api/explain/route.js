import { explain } from '../../../lib/ai/chain.js';
export const runtime = 'nodejs';
export async function POST(req) {
  try { const { kpi } = await req.json(); if (!kpi || typeof kpi !== 'object') throw new Error('kpi'); return Response.json(await explain(kpi)); }
  catch { return Response.json({ error: 'send { kpi: {...} }' }, { status: 400 }); }
}
