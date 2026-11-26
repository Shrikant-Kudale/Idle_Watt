# Contributing
1. `npm install`, then `npm test` (26+ tests) and `npm run build` must pass.
2. Engine code in `lib/engine/` stays pure (no React, no network) so it is unit-testable; add a test beside every change in `tests/engine/`.
3. UI text is for non-technical readers: plain words, one helper sentence under each control and chart.
4. Never add a paid API. New AI providers go in `lib/ai/providers.js` and must fail soft.
5. If you change the data shape, update `lib/engine/validate.js`, `docs/DATA.md` and `scripts/validate_sample.mjs`.
