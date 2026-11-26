#!/usr/bin/env python3
"""Build data/azure_sample.json from the REAL Azure Public Dataset V2 (https://github.com/Azure/AzurePublicDataset).
Streams the files and keeps only the sampled VMs; the full 156 GB is never stored.
Each cpu file covers ~3.7 h of ALL VMs, so hours covered = ~3.67 x number of files. 7 files ~ 24 h; 195 files = 30 days.
Usage: python3 scripts/build_real_sample.py --files 7 --vms 300 --hours 24 [--vmtable path] [--cpu local1.gz local2.gz ...]"""
import argparse, csv, gzip, hashlib, io, json, os, urllib.request
from multiprocessing import Pool
B = 'https://github.com/Azure/AzurePublicDataset/releases/download/dataset-v2/'
def op(src):
    if src.startswith('http'):
        return io.TextIOWrapper(gzip.GzipFile(fileobj=urllib.request.urlopen(src)), encoding='utf8', newline='')
    return gzip.open(src, 'rt', newline='')
def pick(vmtable, n, hours):
    end, c = hours * 3600, []
    with op(vmtable) as f:
        for r in csv.reader(f):
            try: created, deleted, cores, mem = int(r[3]), int(r[4]), int(r[9]), int(r[10])
            except ValueError: continue
            if created <= 0 and deleted >= end + 3600:       # alive for the whole window
                c.append((hashlib.md5(r[0].encode()).hexdigest(), r, cores, mem))
    c.sort(key=lambda x: x[0]); return c[:n]                 # deterministic sample
def scan(a):
    src, ids, hours = a; acc = {}
    with op(src) as f:
        for line in f:
            p = line.split(',')
            if p[1] in ids:
                h = int(p[0]) // 3600
                if h < hours:
                    s = acc.setdefault(p[1], {}).setdefault(h, [0.0, 0]); s[0] += float(p[4]); s[1] += 1
    print('done', src[-40:], flush=True); return acc
def scan2(a): return a[0], scan(a[1:])
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--vmtable', default=B + 'trace_data_vmtable_vmtable.csv.gz')
    ap.add_argument('--files', type=int, default=7); ap.add_argument('--cpu', nargs='*', default=[])
    ap.add_argument('--parts', default=None, help='dir for resumable per-file results'); ap.add_argument('--first', type=int, default=1); ap.add_argument('--last', type=int, default=0); ap.add_argument('--workers', type=int, default=4); ap.add_argument('--merge', action='store_true')
    ap.add_argument('--vms', type=int, default=300); ap.add_argument('--hours', type=int, default=24); ap.add_argument('--out', default='data/azure_sample.json')
    a = ap.parse_args()
    cpu = a.cpu + [B + f'trace_data_vm_cpu_readings_vm_cpu_readings-file-{i}-of-195.csv.gz' for i in range(len(a.cpu) + 1, a.files + 1)]
    cp = (a.parts or '.') + '/chosen.json'
    if a.parts and os.path.exists(cp): chosen = json.load(open(cp))
    else:
        chosen = pick(a.vmtable, a.vms, a.hours)
        if a.parts: os.makedirs(a.parts, exist_ok=True); json.dump(chosen, open(cp, 'w'))
    ids = {r[0] for _, r, _, _ in chosen}
    if a.parts:   # resumable mode: scan files first..last that are not done yet, then --merge writes the sample
        todo = [i for i in range(a.first, (a.last or a.files) + 1) if not os.path.exists(f'{a.parts}/file-{i}.json')]
        with Pool(a.workers) as p:
            for i, acc in p.imap_unordered(scan2, [(i, B + f'trace_data_vm_cpu_readings_vm_cpu_readings-file-{i}-of-195.csv.gz', ids, a.hours) for i in todo]):
                json.dump(acc, open(f'{a.parts}/file-{i}.json', 'w'))
        print('files done:', len([f for f in os.listdir(a.parts) if f.startswith('file-')]), flush=True)
        if not a.merge: raise SystemExit
        parts = [json.load(open(f'{a.parts}/{f}')) for f in os.listdir(a.parts) if f.startswith('file-')]
    else:
        print('sampled', len(ids), 'VMs; scanning', len(cpu), 'files', flush=True)
        with Pool(min(4, len(cpu))) as p: parts = p.map(scan, [(s, ids, a.hours) for s in cpu])
    out = []
    for _, r, cores, mem in chosen:
        h = {}
        for part in parts:
            for k, (s, c) in part.get(r[0], {}).items(): x = h.setdefault(int(k), [0.0, 0]); x[0] += s; x[1] += c
        if any(k not in h or h[k][1] < 3 for k in range(a.hours)): continue   # need full coverage
        out.append({'id': 'az-' + r[0][:6].replace('/', '_').replace('+', '-'), 'cores': cores, 'memGb': mem, 'category': r[8],
                    'lifeAvgPct': round(float(r[6]), 2), 'lifeP95MaxPct': round(float(r[7]), 2), 'lifeMaxPct': round(float(r[5]), 2),
                    'series': [round(h[k][0] / h[k][1] / 100 * cores, 3) for k in range(a.hours)]})
    json.dump({'meta': {'source': 'Azure Public Dataset V2 (real)', 'hours': a.hours, 'files': len(parts), 'vms': len(out)}, 'vms': out}, open(a.out, 'w'))
    print('wrote', a.out, len(out), 'VMs x', a.hours, 'h', flush=True)
