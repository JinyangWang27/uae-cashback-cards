import { useState, useEffect } from 'react'
import type { Card } from './types'
import { Simulator } from './components/Simulator'
import { CompareTable } from './components/CompareTable'
import { CardDetail, CardList } from './components/CardDetail'

import fabData from './data/cards/fab-cashback.json'
import adcbData from './data/cards/adcb-365.json'
import enbdData from './data/cards/enbd-go4it.json'
import hsbcData from './data/cards/hsbc-live-plus.json'
import mashreqData from './data/cards/mashreq-cashback.json'

const CARDS: Card[] = [fabData, adcbData, enbdData, hsbcData, mashreqData] as Card[]

type Route =
  | { view: 'simulator' }
  | { view: 'compare' }
  | { view: 'cards' }
  | { view: 'card-detail'; cardId: string }

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '')
  if (h.startsWith('cards/')) {
    const cardId = h.slice('cards/'.length)
    return { view: 'card-detail', cardId }
  }
  if (h === 'compare') return { view: 'compare' }
  if (h === 'cards') return { view: 'cards' }
  return { view: 'simulator' }
}

function navigate(hash: string) {
  window.location.hash = hash
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    function onHashChange() {
      setRoute(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navItems: { label: string; hash: string; view: string }[] = [
    { label: 'Simulator', hash: '#simulator', view: 'simulator' },
    { label: 'Compare', hash: '#compare', view: 'compare' },
    { label: 'Cards', hash: '#cards', view: 'cards' },
  ]

  const activeView = route.view === 'card-detail' ? 'cards' : route.view

  return (
    <div className="min-h-screen bg-base font-sans">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('#simulator')}
            className="font-serif text-xl text-gold tracking-tight hover:text-gold-light transition-colors"
          >
            UAE Cashback
          </button>

          <nav className="flex items-center gap-1">
            {navItems.map(({ label, hash, view }) => (
              <a
                key={view}
                href={hash}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(hash)
                }}
                className={`px-4 py-1.5 rounded text-sm font-sans font-medium transition-colors relative ${
                  activeView === view
                    ? 'text-gold'
                    : 'text-muted hover:text-warm'
                }`}
              >
                {label}
                {activeView === view && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full" />
                )}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {route.view === 'simulator' && <Simulator cards={CARDS} />}
        {route.view === 'compare' && <CompareTable cards={CARDS} />}
        {route.view === 'cards' && (
          <CardList cards={CARDS} onSelect={(id) => navigate(`#cards/${id}`)} />
        )}
        {route.view === 'card-detail' && (() => {
          const card = CARDS.find((c) => c.id === route.cardId)
          if (!card) {
            return (
              <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <p className="text-muted text-sm">Card not found.</p>
                <button
                  onClick={() => navigate('#cards')}
                  className="mt-4 text-gold text-sm hover:underline"
                >
                  ← Back to all cards
                </button>
              </div>
            )
          }
          return (
            <CardDetail
              card={card}
              onBack={() => navigate('#cards')}
              onSimulate={() => navigate('#simulator')}
            />
          )
        })()}
      </main>

      <footer className="border-t border-border mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted">
            UAE Cashback Comparator — for informational purposes only. Verify rates with issuers.
          </p>
          <p className="text-xs text-muted font-mono">March 2026</p>
        </div>
      </footer>
    </div>
  )
}
