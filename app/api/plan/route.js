import sample from '../../../data/azure_sample.json';
import { plan, sweep, validateFleet } from '../../../lib/engine/index.js';
export const runtime = 'nodejs';
export async function POST(req) {
  try {
    const b = await req.json();
    if (b.vms !== undefined) { const v = validateFleet(b.vms); if (!v.ok) return Response.json({ error: v.error }, { status: 400 }); }
    const src = b.vms ? { vms: b.vms, source: 'Your uploaded data' } : b.source === 'synthetic' ? null : sample;
    return Response.json(b.sweep ? sweep(b, src) : plan(b, src));
  } catch { return Response.json({ error: 'Bad request' }, { status: 400 }); }
}
