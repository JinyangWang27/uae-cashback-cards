# UAE Cashback Card Comparator

> Compare UAE cashback credit cards based on your real monthly spending. Find the card that earns you the most — live, in your browser.

**[→ Open the app](https://jinyangwang27.github.io/uae-cashback-cards/)**

---

## Features

- **Spend Simulator** — Enter your monthly spend by category (dining, groceries, fuel, etc.) and see all 5 cards ranked by net annual cashback in real time
- **Compare Table** — Side-by-side sortable grid of all cards, rates, fees, and caps
- **Card Detail** — Full cashback rule breakdown and fee waiver conditions per card

## Cards Covered

| Card | Issuer | Annual Fee | Best Rate |
|------|--------|-----------|-----------|
| FAB Cashback Platinum | First Abu Dhabi Bank | AED 315 | 5% dining/groceries/online |
| ADCB 365 Cashback | ADCB | AED 384 | 6% dining |
| Emirates NBD GO4IT | Emirates NBD | AED 525 | 8% groceries & fuel |
| HSBC Live+ | HSBC UAE | AED 314 (waivable) | 6% dining |
| Mashreq Cashback | Mashreq Bank | Free | 5% online |

> Rates are based on publicly available information as of March 2026. Always verify with the issuer before applying.

---

## Development

**Stack:** React + TypeScript + Vite + Tailwind CSS v3

```bash
# Install
npm install

# Start dev server
npm run dev
# → http://localhost:5173/uae-cashback-cards/

# Type check
npx tsc --noEmit

# Production build
npm run build
```

## Project Structure

```
src/
├── types/index.ts          # Card, CashbackRule, SimulationResult types
├── data/cards/             # One JSON file per card
│   ├── fab-cashback.json
│   ├── adcb-365.json
│   ├── enbd-go4it.json
│   ├── hsbc-live-plus.json
│   └── mashreq-cashback.json
├── utils/simulate.ts       # Simulation engine
├── components/
│   ├── Simulator.tsx       # Spend inputs + ranked results
│   ├── CompareTable.tsx    # Sortable comparison grid
│   └── CardDetail.tsx      # Card detail + card list views
└── App.tsx                 # Hash-based routing (#simulator, #compare, #cards)
```

## Adding a New Card

1. Add a JSON file to `src/data/cards/` following the existing schema:

```jsonc
{
  "id": "my-bank-card",
  "name": "My Bank Cashback",
  "issuer": "My Bank",
  "network": "Visa",
  "annual_fee_aed": 0,
  "fee_waiver": null,         // or { "condition": "min_annual_spend_aed", "value": 12000 }
  "fx_fee_rate": 0.0299,
  "monthly_cashback_cap_aed": null,
  "cashback_rules": [
    { "category": "dining", "rate": 0.05, "monthly_cap_aed": 200, "min_monthly_spend_aed": 3000 },
    { "category": "other",  "rate": 0.01, "monthly_cap_aed": null, "min_monthly_spend_aed": 3000 }
  ]
}
```

2. Import and add it to the `CARDS` array in `src/App.tsx`.

**Supported categories:** `dining`, `groceries`, `fuel`, `utilities`, `telecom`, `online`, `travel`, `government`, `other`

## Simulation Logic

- Per category: `cashback = min(spend × rate, monthly_cap)`
- If a card has `min_monthly_spend_aed`, no cashback is earned that month if total spend falls below the threshold
- Overall monthly cap is applied after summing all categories
- Fee waiver: if `condition = "min_annual_spend_aed"`, the annual fee is zeroed out when `totalMonthlySpend × 12 ≥ value`
- Categories without a matching rule fall back to the card's `other` rate

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
