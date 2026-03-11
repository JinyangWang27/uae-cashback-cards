/**
 * Validates a card JSON file against the schema and checks source_url reachability.
 *
 * Usage:
 *   npm run validate-card -- src/data/cards/my-card.json
 *   npx tsx scripts/validate-card.ts src/data/cards/my-card.json
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const STALE_DAYS = 90

function fail(msg: string): never {
  console.error(`\n❌ ${msg}`)
  process.exit(1)
}

// ── Parse args ────────────────────────────────────────────────────────────────

const [, , ...args] = process.argv
if (args.length === 0) {
  fail('Usage: npm run validate-card -- <path-to-card.json>\n       npx tsx scripts/validate-card.ts <path-to-card.json>')
}

const files = args.map((p) => resolve(process.cwd(), p))

// ── Load schema ───────────────────────────────────────────────────────────────

const schemaPath = resolve(__dirname, '../src/data/cards/schema.json')
const schema: unknown = JSON.parse(readFileSync(schemaPath, 'utf-8'))

const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(schema as object)

// ── Process each file ─────────────────────────────────────────────────────────

let anyFailed = false

for (const filePath of files) {
  console.log(`\n── ${filePath} ──────────────────────────────────────`)

  let card: Record<string, unknown>
  try {
    card = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
  } catch (err) {
    console.error(`  ❌ Could not parse JSON: ${err instanceof Error ? err.message : String(err)}`)
    anyFailed = true
    continue
  }

  // Schema validation
  const valid = validate(card)
  if (!valid) {
    console.error('  ❌ Schema validation failed:')
    for (const error of validate.errors ?? []) {
      const path = error.instancePath || '(root)'
      console.error(`     ${path}: ${error.message ?? ''}`)
    }
    anyFailed = true
    continue
  }
  console.log(`  ✓ Schema valid`)

  // Source URL reachability
  const sourceUrl = card['source_url'] as string
  process.stdout.write(`  ⟳ Checking source_url … `)
  try {
    const res = await fetch(sourceUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; uae-cashback-validator/1.0)' },
      signal: AbortSignal.timeout(10_000),
      redirect: 'follow',
    })
    if (res.ok || res.status === 405 /* HEAD not allowed, but server responded */) {
      console.log(`✓ reachable (HTTP ${res.status})`)
    } else {
      console.log(`⚠ HTTP ${res.status} — confirm the URL is correct`)
    }
  } catch (err) {
    console.log(`⚠ unreachable: ${err instanceof Error ? err.message : String(err)}`)
    console.log(`     (URL may still be valid — many UAE bank sites block bots)`)
  }

  // Staleness check
  const lastVerified = card['last_verified'] as string
  const daysSince = Math.floor((Date.now() - new Date(lastVerified).getTime()) / 86_400_000)
  const staleWarning = daysSince > STALE_DAYS ? ` ⚠ STALE (${daysSince} days ago)` : ` (${daysSince} days ago)`

  // Summary
  const rules = card['cashback_rules'] as Array<Record<string, unknown>>
  console.log(`\n  Card:          ${card['name'] as string} (${card['id'] as string})`)
  console.log(`  Issuer:        ${card['issuer'] as string} · ${card['network'] as string}`)
  console.log(`  Annual fee:    AED ${card['annual_fee_aed'] as number}`)
  console.log(`  FX fee:        ${((card['fx_fee_rate'] as number) * 100).toFixed(2)}%`)
  console.log(`  Last verified: ${lastVerified}${staleWarning}`)
  console.log(`  Rules (${rules.length}):`)
  for (const rule of rules) {
    const rate = (rule['rate'] as number) * 100
    const cap = rule['monthly_cap_aed'] != null ? `, cap AED ${rule['monthly_cap_aed'] as number}/mo` : ''
    const min = rule['min_monthly_spend_aed'] != null ? ` [min AED ${rule['min_monthly_spend_aed'] as number}/mo]` : ''
    console.log(`    ${String(rule['category']).padEnd(12)} ${rate.toFixed(2)}%${cap}${min}`)
  }

  console.log(`\n  ✅ Passed`)
}

if (anyFailed) {
  process.exit(1)
}
