import type { Card } from '../types'
import { formatAED, formatRate } from '../utils/simulate'

interface Props {
  card: Card
  onBack: () => void
  onSimulate: () => void
}

const CAT_LABELS: Record<string, string> = {
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

export function CardDetail({ card, onBack, onSimulate }: Props) {
  const minSpend = card.cashback_rules[0]?.min_monthly_spend_aed ?? null

  return (
    <div className="min-h-screen bg-grid-texture bg-grid">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted text-sm hover:text-warm transition-colors mb-6"
        >
          ← All Cards
        </button>

        {/* Header */}
        <div className="bg-surface border border-gold/30 rounded-lg p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-warm mb-1">{card.name}</h2>
              <p className="text-muted text-sm">{card.issuer} · {card.network}</p>
              {card.notes && (
                <p className="text-muted text-xs mt-2 leading-relaxed max-w-md">{card.notes}</p>
              )}
            </div>
            <button
              onClick={onSimulate}
              className="shrink-0 bg-gold/10 border border-gold/30 text-gold text-xs font-sans font-medium px-4 py-2 rounded hover:bg-gold/20 transition-colors"
            >
              Simulate →
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-muted mb-1">Annual Fee</div>
            <div className={`font-mono text-lg font-medium ${card.annual_fee_aed === 0 ? 'text-emerald' : 'text-danger'}`}>
              {card.annual_fee_aed === 0 ? 'Free' : formatAED(card.annual_fee_aed)}
            </div>
            {card.fee_waiver && (
              <div className="text-xs text-emerald mt-1">Waivable</div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-muted mb-1">Network</div>
            <div className="font-mono text-lg font-medium text-warm">{card.network}</div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-muted mb-1">FX Fee</div>
            <div className="font-mono text-lg font-medium text-warm">{formatRate(card.fx_fee_rate)}</div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-muted mb-1">Min Monthly</div>
            <div className={`font-mono text-lg font-medium ${minSpend ? 'text-warm' : 'text-emerald'}`}>
              {minSpend ? formatAED(minSpend) : 'None'}
            </div>
          </div>
        </div>

        {/* Fee Waiver */}
        {card.fee_waiver && (
          <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-4 mb-6">
            <div className="text-xs text-emerald font-mono font-medium mb-1">FEE WAIVER CONDITION</div>
            <p className="text-sm text-warm">
              Annual fee of {formatAED(card.annual_fee_aed)} is waived if annual spend reaches{' '}
              <span className="font-mono text-emerald">{formatAED(card.fee_waiver.value)}</span>{' '}
              (≥ {formatAED(card.fee_waiver.value / 12)}/month average)
            </p>
          </div>
        )}

        {/* Monthly Cap */}
        {card.monthly_cashback_cap_aed && (
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6">
            <div className="text-xs text-gold font-mono font-medium mb-1">MONTHLY CASHBACK CAP</div>
            <p className="text-sm text-warm">
              Maximum cashback capped at{' '}
              <span className="font-mono text-gold">{formatAED(card.monthly_cashback_cap_aed)}</span>{' '}
              per month ({formatAED(card.monthly_cashback_cap_aed * 12)}/year)
            </p>
          </div>
        )}

        {/* Cashback Rules Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-sans font-medium text-warm text-sm">Cashback Rates</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-5 py-2.5 text-left text-xs text-muted font-medium">Category</th>
                <th className="px-5 py-2.5 text-right text-xs text-muted font-medium">Rate</th>
                <th className="px-5 py-2.5 text-right text-xs text-muted font-medium">Monthly Cap</th>
              </tr>
            </thead>
            <tbody>
              {card.cashback_rules.map((rule) => (
                <tr key={rule.category} className="border-b border-border/30 hover:bg-base/50 transition-colors">
                  <td className="px-5 py-3 text-warm text-xs">
                    {CAT_LABELS[rule.category] ?? rule.category}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-mono text-xs font-medium ${rule.rate >= 0.05 ? 'text-gold' : rule.rate >= 0.02 ? 'text-emerald' : 'text-muted'}`}>
                      {formatRate(rule.rate)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-mono text-xs text-muted">
                      {rule.monthly_cap_aed ? formatAED(rule.monthly_cap_aed) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onSimulate}
            className="bg-gold text-base font-sans font-semibold text-sm px-8 py-3 rounded hover:bg-gold-light transition-colors"
          >
            Simulate with this card →
          </button>
        </div>
      </div>
    </div>
  )
}

interface CardListProps {
  cards: Card[]
  onSelect: (cardId: string) => void
}

export function CardList({ cards, onSelect }: CardListProps) {
  return (
    <div className="min-h-screen bg-grid-texture bg-grid">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-warm mb-2">All Cards</h2>
          <p className="text-muted text-sm">Select a card for a detailed breakdown of its cashback rules.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const topRate = Math.max(...card.cashback_rules.map((r) => r.rate))
            const minSpend = card.cashback_rules[0]?.min_monthly_spend_aed ?? null
            return (
              <button
                key={card.id}
                onClick={() => onSelect(card.id)}
                className="text-left bg-surface border border-border rounded-lg p-5 hover:border-gold/30 hover:shadow-[0_0_16px_rgba(200,164,90,0.08)] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-sans font-semibold text-warm text-sm">{card.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{card.issuer}</p>
                  </div>
                  <span className="font-mono text-gold text-sm font-medium">
                    up to {formatRate(topRate)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted font-mono">
                  <span className={card.annual_fee_aed === 0 ? 'text-emerald' : 'text-danger'}>
                    {card.annual_fee_aed === 0 ? 'No fee' : formatAED(card.annual_fee_aed) + '/yr'}
                  </span>
                  <span>·</span>
                  <span>
                    {minSpend ? `Min ${formatAED(minSpend)}/mo` : 'No min spend'}
                  </span>
                  <span>·</span>
                  <span>{card.network}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
