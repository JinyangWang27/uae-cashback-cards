export type Category =
  | 'dining'
  | 'groceries'
  | 'fuel'
  | 'utilities'
  | 'telecom'
  | 'online'
  | 'travel'
  | 'government'
  | 'lulu'
  | 'al-futtaim'
  | 'tax-free-stores'
  | 'costa-coffee'
  | 'other'

export interface CashbackRule {
  category: Category
  rate: number // e.g. 0.05 for 5%
  monthly_cap_aed?: number | null
  min_monthly_spend_aed?: number | null // card-level min spend to activate
  merchants?: string[] // specific brand/merchant names that qualify (display only)
}

export interface FeeWaiver {
  condition: 'min_annual_spend_aed'
  value: number
}

export interface Card {
  id: string
  name: string
  issuer: string
  network: 'Visa' | 'Mastercard'
  annual_fee_aed: number
  fee_waiver?: FeeWaiver | null
  fx_fee_rate: number // e.g. 0.0299
  cashback_rules: CashbackRule[]
  monthly_cashback_cap_aed?: number | null
  source_url: string   // official bank page for this card
  last_verified: string // ISO date e.g. "2026-03-11"
  notes?: string
}

export interface CategoryBreakdown {
  category: Category
  spend: number
  rate: number
  grossCashback: number
  cappedCashback: number
}

export interface SimulationResult {
  card: Card
  grossAnnualCashback: number
  annualFeeCharged: number
  netAnnualCashback: number
  effectiveRate: number // netAnnualCashback / totalAnnualSpend
  breakdown: CategoryBreakdown[]
  feeWaived: boolean
}

export type SpendMap = Partial<Record<Category, number>>
