# Methodology
## 1. Data and split
Hourly mean CPU demand in **cores** per machine, `x_t = util_t * cores`. With >= 600 hours the first 504 h (3 weeks) train and the rest test; shorter histories use the first 75% to train.
## 2. Forecast and safety band
For hour-of-week `h`, `p50(h)` is the mean of `x` over training weeks at `h`. The band is `p95(h) = p50(h) + q`, where `q` is the 95th percentile of **leave-one-week-out residuals**: for each training week `w`, the profile is rebuilt from the other weeks and residuals are taken on `w`. In-sample residuals make `q` too small (we measured 81-85% coverage before this fix; 95% on demo data after).
Short histories use an EWMA level (alpha 0.3) and the empirical 95th percentile of training hours.
## 3. Right-sizing
`need = max(peak(p95), life_p95_max) * (1 + cushion)` where `life_p95_max` is Azure's real 30-day p95 of per-5-minute max CPU (when present). The recommended size is the smallest of {1,2,4,8,16} cores >= need, never above current cores.
## 4. Fuzzy usage levels
With `u` = mean use as % of cores: `idle = 1 - ramp(u,5,20)`, `busy = ramp(u,15,40)`, `steady = max(0, 1 - max(idle, busy))`, where `ramp(x,a,b) = clamp((x-a)/(b-a), 0, 1)`. The label is the arg-max.
## 5. Packing (genetic algorithm)
Chromosome = permutation of machines, decoded by first-fit into servers of capacity `serverCores * target`. Fitness = `1000*servers - sum(fill^2)/cap` (fewer servers first, tighter bins second). Population 40, 80 generations, tournament selection, order crossover (OX), swap mutation (p=0.3), elitism 4, seeded with first-fit-decreasing. Result is compared with the theoretical lower bound `ceil(sum(sizes)/cap)`.
## 6. Backtest
Server load per test hour = sum of the actual demand of the machines placed on it. A server-hour is overloaded above 100% of its cores. Per machine, risk = share of test hours above its recommended size.
## 7. Cost, energy, CO2
`cost = servers * price * 730`. `kWh = servers * 730 * (0.15 + 0.25 * min(1, demand/(servers*cores)))`. `CO2 = kWh * 0.4`. Savings compare with a fixed baseline: current sizes, first-fit in given order at 80% of a server.
## 8. Off-hours scheduling
A weekly hour is idle if `p95(h) <= 10% of cores`. Machines idle for >= 40 h/week could be switched off then; saving = `idleHours/168 * size * (price/serverCores) * 730`. Reported separately; do not add it to consolidation savings.
## 9. Forecast quality
Mean absolute error (cores) of our forecast vs. a flat average and vs. "repeat last week", plus **coverage**: share of test machine-hours at or below `p95`.
## Known limits
CPU only; no memory, disk or network. One public trace. Bursts shorter than an hour are averaged away.
