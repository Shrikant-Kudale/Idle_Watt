export const f0 = (n) => Math.round(n).toLocaleString('en-US');
export const clean = (t) => String(t).split('\n').map((l) => l.replace(/[*_#`>]+/g, '').replace(/^\s*(?:[-•]|\d+[.)])\s*/, '').trim()).filter((l) => l.length > 3);
export const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
export const csvOf = (rows) => rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
