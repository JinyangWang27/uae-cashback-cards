# Contributing a Card

Thank you for helping keep UAE cashback rates accurate! The app's card data lives in
`src/data/cards/` as simple JSON files — anyone can add a new card or update an existing one
via a pull request.

---

## Adding a new card

### 1. Copy an existing card as a template

```bash
cp src/data/cards/hsbc-live-plus.json src/data/cards/your-bank-card.json
```

Use a kebab-case filename that matches the card's `id` field (e.g. `citibank-cashback.json`).

### 2. Fill in all fields

Open the file and update every field. Here is the full schema with descriptions:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Kebab-case, matches filename without `.json` |
| `name` | string | Full marketing name of the card |
| `issuer` | string | Bank name |
| `network` | `"Visa"` \| `"Mastercard"` \| `"Amex"` | Card network |
| `annual_fee_aed` | number | Annual fee in AED (VAT-inclusive) |
| `fee_waiver` | object \| null | `{ "condition": "min_annual_spend_aed", "value": 12000 }` or `null` |
| `fx_fee_rate` | number | Foreign exchange fee as a decimal (e.g. `0.0299` for 2.99%) |
| `monthly_cashback_cap_aed` | number \| null | Overall monthly cashback cap across all categories |
| `cashback_rules` | array | One object per spend category (see below) |
| `source_url` | string | The bank's official page for this card |
| `last_verified` | string | ISO date when you verified the rates (e.g. `"2026-03-11"`) |
| `notes` | string | Optional human-readable summary |

**Each cashback rule:**

```json
{
  "category": "dining",
  "rate": 0.06,
  "monthly_cap_aed": 200,
  "min_monthly_spend_aed": 3000
}
```

Valid categories: `dining`, `groceries`, `fuel`, `utilities`, `telecom`, `online`, `travel`, `government`, `other`.

Always include an `"other"` rule as the fallback catch-all rate.

### 3. Find `source_url`

Go to the bank's website and navigate to the card's product page. Copy that URL into `source_url`.
This URL is used by CI to verify that claimed rates appear on the official page.

### 4. Run local validation

```bash
npm run validate-card -- src/data/cards/your-bank-card.json
```

This checks:
- All required fields are present and correctly typed
- Rate values are between 0 and 1
- Categories use only valid enum values
- `source_url` is reachable (warning only — UAE bank sites often block bots)

Fix any reported errors before opening a PR.

### 5. Test in the app

```bash
npm run dev
```

Open `http://localhost:5173/uae-cashback-cards/` and verify your card appears in:
- The **Simulator** (Simulator tab)
- The **Compare** table
- The **Cards** list and detail view

### 6. Open a pull request

Push your branch and open a PR. The CI workflow will automatically:
1. Detect which card files changed
2. Run `validate-card` on each changed file
3. Report any schema errors as a failed check

Once CI passes and a maintainer reviews, your card will be merged and deployed.

---

## Updating an existing card

1. Edit the relevant `src/data/cards/*.json` file
2. Update `last_verified` to today's date
3. Run `npm run validate-card -- <path>` and fix any errors
4. Open a PR — CI validates automatically

---

## Staleness policy

Cards whose `last_verified` date is more than 90 days old are flagged:
- A warning banner appears in the app footer
- A monthly CI job opens a GitHub Issue requesting verification

If you verify a card's rates are unchanged, simply update `last_verified` to today and open a PR.

---

## JSON Schema

The full schema is at [`src/data/cards/schema.json`](src/data/cards/schema.json).
You can use it in any JSON Schema-aware editor (VS Code, IntelliJ, etc.) by adding:

```json
{ "$schema": "../schema.json" }
```

at the top of your card file for inline validation and autocomplete.
