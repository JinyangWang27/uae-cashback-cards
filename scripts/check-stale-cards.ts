/**
 * Exits with code 0 and prints a JSON array of stale card IDs/names.
 * Called by the stale-cards CI workflow.
 *
 * Usage: tsx scripts/check-stale-cards.ts [--days=90]
 * Outputs one line per stale card: "id|name|last_verified|days|source_url"
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CARDS_DIR = resolve(__dirname, '../src/data/cards')

const daysArg = process.argv.find((a) => a.startsWith('--days='))
const STALE_DAYS = daysArg ? parseInt(daysArg.slice('--days='.length), 10) : 90

const now = Date.now()

const files = readdirSync(CARDS_DIR).filter(
  (f) => f.endsWith('.json') && f !== 'schema.json',
)

for (const file of files) {
  const card = JSON.parse(
    readFileSync(resolve(CARDS_DIR, file), 'utf-8'),
  ) as Record<string, unknown>

  const verifiedDate = new Date(card['last_verified'] as string)
  const daysSince = Math.floor((now - verifiedDate.getTime()) / 86_400_000)

  if (daysSince > STALE_DAYS) {
    // Output pipe-delimited for easy parsing in shell
    console.log(
      [
        card['id'],
        card['name'],
        card['last_verified'],
        daysSince,
        card['source_url'],
      ].join('|'),
    )
  }
}
