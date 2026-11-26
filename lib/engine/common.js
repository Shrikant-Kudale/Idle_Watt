// Shared constants and helpers for the engine.
// IdleWatt engine: synthetic sample -> seasonal forecast + 95% band -> fuzzy classes -> GA packing -> cost/energy/risk -> backtest
export const CAT = { Interactive: 'User-facing app', 'Delay-insensitive': 'Background job', Unknown: 'General workload' };
export const H = 24, W = 168, TRAIN = 504, SIZES = [1, 2, 4, 8, 16];
export const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const sum = (a) => a.reduce((x, y) => x + y, 0);
export const r2 = (x) => Math.round(x * 100) / 100;

