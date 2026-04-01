import { useState } from 'react'
import type { Card, Category } from '../types'
import { formatAED, formatRate } from '../utils/simulate'

interface Props {
  cards: Card[]
}

type SortKey = 'name' | 'annual_fee_aed' | 'fx_fee_rate' | Category
type SortDir = 'asc' | 'desc'

const CASHBACK_CATEGORIES: Category[] = [
  'dining',
  'groceries',
  'fuel',
  'utilities',
  'telecom',
  'online',
  'travel',
  'government',
  'lulu',
  'al-futtaim',
  'tax-free-stores',
  'costa-coffee',
  'other',
]

const CAT_LABELS: Record<Category, string> = {
  dining: 'Dining',
  groceries: 'Groceries',
  fuel: 'Fuel',
  utilities: 'Utilities',
  telecom: 'Telecom',
  online: 'Online',
  travel: 'Travel',
  government: 'Govt',
  lulu: 'Lulu',
  'al-futtaim': 'Al Futtaim',
  'tax-free-stores': 'Tax-Free',
  'costa-coffee': 'Costa',
  other: 'Other',
}

function getCategoryRate(card: Card, category: Category): number | null {
  const rule = card.cashback_rules.find((r) => r.category === category)
  if (!rule) {
    const other = card.cashback_rules.find((r) => r.category === 'other')
    return other?.rate ?? null
  }
  return rule.rate
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-muted/40 ml-1">↕</span>
  return <span className="text-gold ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function CompareTable({ cards }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('annual_fee_aed')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...cards].sort((a, b) => {
    let av: number | string = 0
    let bv: number | string = 0
    if (sortKey === 'name') {
      av = a.name
      bv = b.name
    } else if (sortKey === 'annual_fee_aed') {
      av = a.annual_fee_aed
      bv = b.annual_fee_aed
    } else if (sortKey === 'fx_fee_rate') {
      av = a.fx_fee_rate
      bv = b.fx_fee_rate
    } else {
      av = getCategoryRate(a, sortKey) ?? -1
      bv = getCategoryRate(b, sortKey) ?? -1
    }
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  // Find highest rate per category for green highlighting
  const maxRates: Record<Category, number> = {} as Record<Category, number>
  for (const cat of CASHBACK_CATEGORIES) {
    const rates = cards.map((c) => getCategoryRate(c, cat) ?? 0)
    maxRates[cat] = Math.max(...rates)
  }

  function ThCell({
    label,
    sortable,
    sk,
  }: {
    label: string
    sortable?: SortKey
    sk?: SortKey
  }) {
    const active = sk === sortKey
    return (
      <th
        className={`px-3 py-3 text-left text-xs font-sans font-medium tracking-wider whitespace-nowrap ${
          sortable ? 'cursor-pointer hover:text-warm select-none' : ''
        } ${active ? 'text-gold' : 'text-muted'}`}
        onClick={sortable ? () => handleSort(sortable) : undefined}
      >
        {label}
        {sortable && <SortIcon active={active} dir={sortDir} />}
      </th>
    )
  }

  return (
    <div className="min-h-screen bg-grid-texture bg-grid">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-warm mb-2">Compare All Cards</h2>
          <p className="text-muted text-sm">Click column headers to sort. Green = highest rate in category.</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface sticky top-0 z-10">
              <tr className="border-b border-border">
                <ThCell label="Card" sortable="name" sk="name" />
                <ThCell label="Annual Fee" sortable="annual_fee_aed" sk="annual_fee_aed" />
                <ThCell label="FX Fee" sortable="fx_fee_rate" sk="fx_fee_rate" />
                {CASHBACK_CATEGORIES.map((cat) => (
                  <ThCell key={cat} label={CAT_LABELS[cat]} sortable={cat} sk={cat} />
                ))}
                <ThCell label="Min Spend/mo" />
                <ThCell label="Monthly Cap" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((card, idx) => {
                const minSpend = card.cashback_rules[0]?.min_monthly_spend_aed ?? null
                return (
                  <tr
                    key={card.id}
                    className={`border-b border-border/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-base' : 'bg-surface/30'
                    } hover:bg-surface`}
                  >
                    <td className="px-3 py-3">
                      <div className="font-sans font-medium text-warm text-xs leading-snug">
                        {card.name}
                      </div>
                      <div className="text-xs text-muted">{card.issuer}</div>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`font-mono text-xs ${
                          card.annual_fee_aed === 0 ? 'text-emerald' : 'text-danger'
                        }`}
                      >
                        {card.annual_fee_aed === 0 ? 'Free' : formatAED(card.annual_fee_aed)}
                      </span>
                      {card.fee_waiver && (
                        <div className="text-xs text-muted/70 mt-0.5">
                          waivable
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-warm">
                        {formatRate(card.fx_fee_rate)}
                      </span>
                    </td>

                    {CASHBACK_CATEGORIES.map((cat) => {
                      const rate = getCategoryRate(card, cat)
                      const isMax = rate !== null && rate === maxRates[cat] && rate > 0
                      const rule = card.cashback_rules.find((r) => r.category === cat)
                      const hasCap = rule?.monthly_cap_aed

                      return (
                        <td key={cat} className="px-3 py-3">
                          {rate !== null && rate > 0 ? (
                            <div>
                              <span
                                className={`font-mono text-xs font-medium ${
                                  isMax ? 'text-emerald' : 'text-warm'
                                }`}
                              >
                                {formatRate(rate)}
                              </span>
                              {hasCap && (
                                <div className="text-xs text-muted/70 font-mono mt-0.5">
                                  cap {formatAED(hasCap)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted/40 text-xs font-mono">—</span>
                          )}
                        </td>
                      )
                    })}

                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-warm">
                        {minSpend ? formatAED(minSpend) : <span className="text-emerald">None</span>}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-warm">
                        {card.monthly_cashback_cap_aed
                          ? formatAED(card.monthly_cashback_cap_aed)
                          : <span className="text-muted/60">None</span>}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted mt-4">
          Rates shown are cashback percentages. FX fee applies on foreign currency transactions.
          Min monthly spend must be met to earn any cashback (where applicable).
        </p>
      </div>
    </div>
  )
}
