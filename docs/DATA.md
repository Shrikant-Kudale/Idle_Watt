# Data
**Source:** [Azure Public Dataset V2](https://github.com/Azure/AzurePublicDataset/blob/master/AzurePublicDatasetV2.md), ~2.7 M VMs over 30 days. `vmtable` has per-VM stats; each of 195 `vm_cpu_readings` files holds ~3.7 hours of 5-minute readings for all VMs, so a 28-day series needs ~180 files (about 156 GB). `scripts/build_real_sample.py` streams them and keeps only sampled VMs.
## Shipped sample (`data/azure_sample.json`)
269 VMs alive for the whole window, picked by a deterministic hash, 660 hourly points each. Fields: `id, cores, memGb, category, lifeAvgPct, lifeP95MaxPct, lifeMaxPct, series[]` (cores in use per hour).
**Bias:** only long-running VMs, one trace, many very lightly used.
## Rebuild
```bash
python3 scripts/build_real_sample.py --parts parts --files 180 --last 180 --vms 300 --hours 660 --workers 4 --merge
npm run validate:data
```
Resumable: finished files are skipped on re-run (~17 s per file on one core).
## Your own data (CSV)
Header `machine,cores,hour,cpu_percent`; hourly rows; >= 4 machines, >= 24 hours each (see `examples/example_fleet.csv`). The server validates it (`lib/engine/validate.js`) and returns a readable error if anything is wrong. Uploads are not stored.
