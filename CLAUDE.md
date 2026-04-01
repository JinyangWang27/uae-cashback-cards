# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server → http://localhost:5173/uae-cashback-cards/
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check without emitting

# Validate a single card JSON file
npm run validate-card -- src/data/cards/<card-id>.json
```

There are no automated tests beyond the card validation script.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v3. Single-page app with hash-based routing (`#compare`, `#simulator`, `#cards`, `#cards/<id>`). No router library — routing is handled in `App.tsx` via `window.location.hash` and `parseHash()`.

### Data flow

All card data is statically imported in `App.tsx` as JSON and typed as `Card[]`. There is no API or runtime data fetching. The `CARDS` array is passed down as props to every view component.

### Simulation engine (`src/utils/simulate.ts`)

`simulate(cards, monthlySpend)` is the core logic. Per category: `cashback = min(spend × rate, monthly_cap_aed)`. A `min_monthly_spend_aed` on a rule blocks all cashback for that card that month if total spend falls below the threshold. An overall `monthly_cashback_cap_aed` is applied after summing categories. Fee waiver zeroes `annual_fee_aed` when `totalMonthlySpend × 12 ≥ fee_waiver.value`. Results are sorted by `netAnnualCashback` descending.

### Card data (`src/data/cards/`)

One JSON file per card, validated against `src/data/cards/schema.json` (JSON Schema draft-07). The `id` field must match the filename (without `.json`). Every card must have an `"other"` cashback rule as a catch-all fallback. `last_verified` (ISO date) drives the 90-day staleness warning banner and the monthly CI stale-check job.

### Adding a new card

1. Copy an existing JSON, name it `<kebab-id>.json`
2. Fill all fields; rates are decimals (`0.05` = 5%)
3. Run `npm run validate-card -- <path>` to check schema
4. Import the JSON in `App.tsx` and add it to the `CARDS` array
5. CI (`validate-cards.yml`) re-validates any changed card files on every PR

### CI

- **`validate-cards.yml`** — runs on PRs that touch `src/data/cards/*.json`; validates changed files with `validate-card.ts`
- **`stale-cards.yml`** — runs monthly; opens GitHub Issues for cards whose `last_verified` is >90 days old
- **`deploy.yml`** — deploys to GitHub Pages on every push to `main`
