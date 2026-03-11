import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

interface CardJson {
  id: string
  name: string
  issuer: string
  annual_fee_aed: number
  source_url: string
  notes?: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://jinyangwang27.github.io/uae-cashback-cards/'

function buildJsonLd(): string {
  const cardsDir = resolve(__dirname, 'src/data/cards')
  const cards = readdirSync(cardsDir)
    .filter((f) => f.endsWith('.json') && f !== 'schema.json')
    .map((f) => JSON.parse(readFileSync(resolve(cardsDir, f), 'utf-8')) as CardJson)

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'UAE Cashback Card Comparator',
        description: 'Compare UAE cashback credit cards based on your real monthly spending.',
        url: BASE_URL,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
      },
      {
        '@type': 'ItemList',
        name: 'UAE Cashback Credit Cards 2026',
        url: BASE_URL,
        numberOfItems: cards.length,
        itemListElement: cards.map((card, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'FinancialProduct',
            name: card.name,
            description: card.notes ?? '',
            provider: { '@type': 'BankOrCreditUnion', name: card.issuer },
            url: card.source_url,
            feesAndCommissionsSpecification: `Annual fee AED ${card.annual_fee_aed}`,
          },
        })),
      },
    ],
  })
}

const injectJsonLd: Plugin = {
  name: 'inject-json-ld',
  transformIndexHtml(html) {
    return html.replace(
      '</head>',
      `  <script type="application/ld+json">${buildJsonLd()}</script>\n  </head>`,
    )
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), injectJsonLd],
  base: '/uae-cashback-cards/',
})
