// Deterministic fallback: always works, no network, no key.
export const template = (k) => `${k.vms} cloud machines can run on ${k.optimizedServers} servers instead of ${k.baselineServers}.
That saves about $${k.monthlySavings} a month, roughly ${k.kwhSavedMonth} kWh of electricity and ${k.co2KgSavedMonth} kg of CO2 (estimates).
${k.idleVMs} machines are mostly unused and can probably be switched off or scheduled.
When we replayed a week the plan had never seen, ${k.serverOverloadHoursPct}% of server-hours ran out of room.
The main risk is that this looks at processor use only, so memory and disk must be checked too.
Start with the unused machines, then re-run the plan every week.`;
