// Validates a fleet before it reaches the engine (uploads, sample file, tests).
export function validateFleet(vms) {
  if (!Array.isArray(vms) || vms.length < 4) return { ok: false, error: 'Provide at least 4 machines.' };
  if (vms.length > 400) return { ok: false, error: 'At most 400 machines are supported.' };
  const L = vms[0]?.series?.length;
  if (!(L >= 24)) return { ok: false, error: 'Each machine needs at least 24 hourly values.' };
  for (const v of vms) {
    if (!(v.cores > 0)) return { ok: false, error: `Machine ${v.id}: cores must be a positive number.` };
    if (!Array.isArray(v.series) || v.series.length !== L) return { ok: false, error: `Machine ${v.id}: every machine needs the same number of hourly values (${L}).` };
    if (v.series.some((x) => !Number.isFinite(x) || x < 0)) return { ok: false, error: `Machine ${v.id}: usage values must be finite and non-negative.` };
  }
  return { ok: true, hours: L };
}
