import { useState, useMemo, useCallback } from 'react'
import type { Card, Category, SimulationResult, SpendMap } from '../types'
import { simulate, formatAED, formatRate, CATEGORIES } from '../utils/simulate'

interface Props {
  cards: Card[]
}

const CATEGORY_LABELS: Record<Category, string> = {
  dining: 'Dining & Restaurants',
  groceries: 'Groceries & Supermarkets',
  fuel: 'Fuel',
  utilities: 'Utilities',
  telecom: 'Telecom',
  online: 'Online Shopping',
  travel: 'Travel (International)',
  government: 'Government Services',
  other: 'Everything Else',
}

const CATEGORY_ICONS: Record<Category, string> = {
  dining: '🍽',
  groceries: '🛒',
  fuel: '⛽',
  utilities: '💡',
  telecom: '📱',
  online: '🛍',
  travel: '✈',
  government: '🏛',
  other: '💳',
}

const DEFAULT_SPEND: SpendMap = {
  dining: 1500,
  groceries: 2000,
  fuel: 500,
  utilities: 400,
  telecom: 300,
  online: 800,
  travel: 0,
  government: 0,
  other: 500,
}

const MAX_SPEND: Record<Category, number> = {
  dining: 10000,
  groceries: 10000,
  fuel: 5000,
  utilities: 3000,
  telecom: 2000,
  online: 10000,
  travel: 20000,
  government: 5000,
  other: 10000,
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono font-medium tracking-widest text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-sm">
          BEST FOR YOU
        </span>
      </div>
    )
  }
  return (
    <span className="text-xs font-mono text-muted">
      #{rank}
    </span>
  )
}

function ResultCard({
  result,
  rank,
  totalMonthlySpend,
  animDelay,
}: {
  result: SimulationResult
  rank: number
  totalMonthlySpend: number
  animDelay: number
}) {
  const isTop = rank === 1
  const isNegative = result.netAnnualCashback < 0

  return (
    <div
      className="opacity-0 animate-fade-slide-in"
      style={{ animationDelay: `${animDelay}ms`, animationFillMode: 'forwards' }}
    >
      <div
        className={`relative rounded-lg p-5 border transition-all ${isTop
            ? 'bg-surface border-gold/40 shadow-[0_0_24px_rgba(200,164,90,0.12)]'
            : 'bg-surface border-border hover:border-muted/30'
          }`}
      >
        {/* Gold shimmer strip on top card */}
        {isTop && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <RankBadge rank={rank} />
            </div>
            <h3 className="font-sans font-semibold text-warm text-sm leading-snug truncate">
              {result.card.name}
            </h3>
            <p className="text-xs text-muted mt-0.5">{result.card.issuer}</p>
          </div>

          <div className="text-right shrink-0">
            <div
              className={`font-mono text-xl font-medium ${isNegative ? 'text-danger' : isTop ? 'text-gold' : 'text-emerald'
                }`}
            >
              {formatAED(result.netAnnualCashback)}
            </div>
            <div className="text-xs text-muted font-mono mt-0.5">net/year</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-muted mb-1">Gross Cashback</div>
            <div className="font-mono text-sm text-warm">
              {formatAED(result.grossAnnualCashback)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Annual Fee</div>
            <div className={`font-mono text-sm ${result.annualFeeCharged > 0 ? 'text-danger' : 'text-emerald'}`}>
              {result.annualFeeCharged > 0 ? `−${formatAED(result.annualFeeCharged)}` : 'Waived'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">Effective Rate</div>
            <div className={`font-mono text-sm ${result.effectiveRate < 0 ? 'text-danger' : 'text-warm'}`}>
              {totalMonthlySpend > 0 ? formatRate(result.effectiveRate) : '—'}
            </div>
          </div>
        </div>

        {result.feeWaived && (
          <div className="mt-2 text-xs text-emerald font-mono">
            ✓ Annual fee waived (spend threshold met)
          </div>
        )}
      </div>
    </div>
  )
}

export function Simulator({ cards }: Props) {
  const [spend, setSpend] = useState<SpendMap>(DEFAULT_SPEND)
  const [resultKey, setResultKey] = useState(0)

  const updateSpend = useCallback((category: Category, value: number) => {
    setSpend((prev) => ({ ...prev, [category]: value }))
    setResultKey((k) => k + 1)
  }, [])

  const results: SimulationResult[] = useMemo(() => simulate(cards, spend), [cards, spend])

  const totalMonthlySpend = useMemo(
    () => Object.values(spend).reduce((s, v) => s + (v ?? 0), 0),
    [spend]
  )

  return (
    <div className="min-h-screen bg-grid-texture bg-grid">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-warm mb-2">Simulate Your Cashback</h2>
          <p className="text-muted text-sm">
            Enter your typical monthly spending. Results update in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Spend Inputs */}
          <div className="space-y-1">
            <div className="bg-surface border border-border rounded-lg p-5 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted uppercase tracking-widest font-sans">
                  Total Monthly Spend
                </span>
                <span className="font-mono text-gold text-lg font-medium">
                  {formatAED(totalMonthlySpend)}
                </span>
              </div>
              <div className="text-xs text-muted">
                Annual: <span className="font-mono text-warm">{formatAED(totalMonthlySpend * 12)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const value = spend[cat] ?? 0
                const max = MAX_SPEND[cat]
                return (
                  <div key={cat} className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-sans text-warm">
                        <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                        {CATEGORY_LABELS[cat]}
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted font-mono">AED</span>
                        <input
                          type="number"
                          min={0}
                          max={max}
                          value={value}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(max, Number(e.target.value) || 0))
                            updateSpend(cat, v)
                          }}
                          className="w-20 text-right font-mono text-sm bg-base border border-border rounded px-2 py-1 text-warm focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={max}
                      step={50}
                      value={value}
                      onChange={(e) => updateSpend(cat, Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted font-mono">0</span>
                      <span className="text-xs text-muted font-mono">{formatAED(max)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-sans text-sm text-muted uppercase tracking-widest">
                Ranked Results
              </h3>
              <span className="text-xs text-muted font-mono">5 cards</span>
            </div>

            <div key={resultKey} className="space-y-3">
              {results.map((result, i) => (
                <ResultCard
                  key={result.card.id}
                  result={result}
                  rank={i + 1}
                  totalMonthlySpend={totalMonthlySpend}
                  animDelay={i * 60}
                />
              ))}
            </div>

            <p className="text-xs text-muted pt-2 leading-relaxed">
              * Net cashback = gross cashback − annual fee. Spend thresholds apply (FAB: AED 3k/mo, ADCB: AED 5k/mo, HSBC: AED 3k/mo). Rates are indicative; verify with issuer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
