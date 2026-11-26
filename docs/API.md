# API
All endpoints return JSON. Errors: `{ "error": "message" }` with HTTP 400.
| Method & path | Body | Response |
|---|---|---|
| `POST /api/plan` | `{ n, headroom, target, price, seed, source: "azure"|"synthetic", vms? }` | `{ params, kpi, rows[], servers[], heat[][], history[], quality, packing, meta, disclaimer }` |
| `POST /api/plan` | same + `sweep: true` | array of 18 `{ headroom, target, servers, savings, overloadPct, vmOverloadPct }` |
| `POST /api/explain` | `{ kpi }` | `{ text, source: "gemini"|"pollinations"|"ollama"|"cache"|"template" }` |
| `GET /api/health` | | `{ ok, version, dataset, ai }` |
| `GET /api/dataset` | | dataset metadata and field descriptions |
`vms` format: `[{ id, name?, cores, series: [cores in use per hour, ...] }]`, at least 4 machines with the same length >= 24.
```bash
curl -X POST localhost:3000/api/plan -d '{"n":150,"source":"azure"}'
```
