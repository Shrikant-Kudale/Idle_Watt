import sample from '../../../data/azure_sample.json';
export const runtime = 'nodejs';
export async function GET() {
  return Response.json({ meta: sample.meta, machines: sample.vms.length, hours: sample.vms[0].series.length, fields: { id: 'short hashed id', cores: 'allocated cores', memGb: 'memory bucket', category: 'Interactive | Delay-insensitive | Unknown', lifeP95MaxPct: 'real 30-day p95 of max CPU %', series: 'hourly mean CPU demand in cores' }, source: 'https://github.com/Azure/AzurePublicDataset/blob/master/AzurePublicDatasetV2.md' });
}
