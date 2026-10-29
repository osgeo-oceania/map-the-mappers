/**
 * Validate sample and optional bundled data before build.
 * Usage: npm run validate-data [-- path/to/feed.json ...]
 */

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { parseProfiles } from '../lib/data/contract'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const FILES = args.length
  ? args.map((f) => resolve(f))
  : [
      join(root, 'data/sample-profiles.json'),
      ...[join(root, 'data/profiles.json')].filter(existsSync),
    ]

const displayName = (file: string) =>
  file.startsWith(root) ? file.slice(root.length + 1) : file

let total = 0
const errors: string[] = []
for (const file of FILES) {
  const name = displayName(file)
  let data: unknown
  try {
    data = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(
      `${name}: cannot read/parse JSON — ${e instanceof Error ? e.message : String(e)}`
    )
    continue
  }
  const result = parseProfiles(data, {
    rejectPrivateFields: true,
    itemLabel: (i) => `${name}[${i}]`,
  })
  errors.push(
    ...result.errors.map((e) => (e.startsWith(name) ? e : `${name}: ${e}`))
  )
  total += result.profiles.length
}

if (errors.length) {
  console.error(
    `\n❌ Profile data validation failed (${errors.length} issue(s)):\n`
  )
  for (const e of errors) console.error(`  • ${e}`)
  console.error('')
  process.exit(1)
}
console.log(
  `✅ Profile data valid — ${total} record(s) across ${FILES.length} source(s): ${FILES.map(displayName).join(', ')}.`
)
