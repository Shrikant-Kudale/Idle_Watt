# Architecture
```mermaid
flowchart LR
  subgraph Browser
    P[app/page.jsx state + routing] --> C[app/components/*]
    C --> CH[components/charts.jsx SVG]
    P --> RP[lib/report: HTML report builder]
    P --> IN[lib/insights: plain-English findings]
    P --> CL[lib/client: csv, utils, content]
  end
  P -->|POST settings or CSV fleet| A1[/api/plan/]
  P -->|POST totals| A2[/api/explain/]
  A3[/api/health/] & A4[/api/dataset/]
  A1 --> V[engine/validate.js]
  A1 --> PL[engine/plan.js]
  PL --> F[forecast.js] & FZ[fuzzy.js] & G[ga.js] & Q[quality.js] & S[schedule.js] & D[data.js]
  A1 --> SW[engine/sweep.js]
  A2 --> AI[lib/ai/chain.js] --> PR[providers.js: Gemini, Pollinations, Ollama] --> T[template.js]
  PL --> DS[(data/azure_sample.json)]
```
## Layers
| Layer | Folder | Rule |
|---|---|---|
| Presentation | `app/components`, `app/page.jsx` | No business logic; props in, JSX out |
| API | `app/api/*` | Thin: validate, call engine/AI, return JSON |
| Domain engine | `lib/engine/*` | Pure functions, deterministic given a seed |
| Narrative | `lib/insights`, `lib/report`, `lib/ai` | Turn numbers into words; AI always has a fallback |
| Data | `data/`, `scripts/` | Real sample plus a resumable builder and validator |
## Data flow for one request
settings -> `validateFleet` (uploads only) -> `generate` or sample -> per machine: `forecast` -> size -> `fuzzy` -> `offHours` -> `pack` (GA) -> heat map backtest -> `assessQuality` -> KPIs. `sweep` repeats this 18 times for the trade-off chart.
## Design decisions
* **No chart or stats library**: charts are small SVG components that also render inside the downloadable report.
* **Report built in the browser**: Next.js blocks `react-dom/server` in route handlers, and a client-built report keeps the server stateless.
* **Seeded randomness**: the same "repeatability code" always gives the same plan, which makes results testable.
