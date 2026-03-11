import type { Card, Category, CategoryBreakdown, SimulationResult, SpendMap } from '../types'

const CATEGORIES: Category[] = [
  'dining',
  'groceries',
  'fuel',
  'utilities',
  'telecom',
  'online',
  'travel',
  'government',
  'other',
]

function findRule(card: Card, category: Category) {
  // Exact category match first, then fall back to 'other'
  return (
    card.cashback_rules.find((r) => r.category === category) ??
    card.cashback_rules.find((r) => r.category === 'other')
  )
}

export function simulate(cards: Card[], monthlySpend: SpendMap): SimulationResult[] {
  const totalMonthlySpend = Object.values(monthlySpend).reduce((s, v) => s + (v ?? 0), 0)
  const totalAnnualSpend = totalMonthlySpend * 12

  const results: SimulationResult[] = cards.map((card) => {
    const breakdown: CategoryBreakdown[] = []

    // Calculate gross monthly cashback
    let grossMonthlyCashback = 0

    for (const category of CATEGORIES) {
      const spend = monthlySpend[category] ?? 0
      if (spend <= 0) continue

      const rule = findRule(card, category)
      if (!rule) continue

      // Check per-rule / card-level minimum monthly spend
      const minSpend = rule.min_monthly_spend_aed ?? null
      if (minSpend !== null && totalMonthlySpend < minSpend) {
        breakdown.push({
          category,
          spend,
          rate: rule.rate,
          grossCashback: 0,
          cappedCashback: 0,
        })
        continue
      }

      const grossCashback = spend * rule.rate
      const cap = rule.monthly_cap_aed ?? Infinity
      const cappedCashback = Math.min(grossCashback, cap)

      breakdown.push({ category, spend, rate: rule.rate, grossCashback, cappedCashback })
      grossMonthlyCashback += cappedCashback
    }

    // Apply overall monthly cap if present
    const overallMonthlyCapAed = card.monthly_cashback_cap_aed ?? Infinity
    const effectiveMonthlyCashback = Math.min(grossMonthlyCashback, overallMonthlyCapAed)
    const grossAnnualCashback = effectiveMonthlyCashback * 12

    // Fee waiver check
    let feeWaived = false
    if (card.fee_waiver) {
      if (
        card.fee_waiver.condition === 'min_annual_spend_aed' &&
        totalAnnualSpend >= card.fee_waiver.value
      ) {
        feeWaived = true
      }
    }

    const annualFeeCharged = feeWaived ? 0 : card.annual_fee_aed
    const netAnnualCashback = grossAnnualCashback - annualFeeCharged
    const effectiveRate = totalAnnualSpend > 0 ? netAnnualCashback / totalAnnualSpend : 0

    return {
      card,
      grossAnnualCashback,
      annualFeeCharged,
      netAnnualCashback,
      effectiveRate,
      breakdown,
      feeWaived,
    }
  })

  return results.sort((a, b) => b.netAnnualCashback - a.netAnnualCashback)
}

export function formatAED(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}AED ${Math.abs(amount).toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`
}

export { CATEGORIES }
