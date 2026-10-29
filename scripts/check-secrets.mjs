/**
 * Scan tracked text files for credential-shaped content.
 * Fails the build on any hit; values in diagnostics are masked.
 */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const BINARY =
  /\.(png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|pbf|pmtiles|pdf|zip)$/i
const SKIP = new Set(['package-lock.json', 'scripts/check-secrets.mjs'])

const SECRET_NAME = '(TOKEN|SECRET|PASSWORD|PASSWD|PRIVATE_KEY|API_KEY)'

const PATTERNS = [
  { re: /github_pat_[A-Za-z0-9_]{20,}/, why: 'GitHub fine-grained token' },
  { re: /\bgh[pousr]_[A-Za-z0-9]{20,}/, why: 'GitHub token' },
  { re: /hooks\.slack\.com\/(services|triggers)\/\S+/, why: 'Slack webhook' },
  { re: /\bxox[abp]-[A-Za-z0-9-]{10,}/, why: 'Slack token' },
  { re: /AIza[0-9A-Za-z_-]{30,}/, why: 'Google API key' },
  { re: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/, why: 'private key' },
  { re: /"private_key_id"\s*:/, why: 'service-account JSON' },
  { re: /\bsk-[A-Za-z0-9_-]{20,}/, why: 'API secret key' },
  {
    // A dotenv line with a value, such as a committed .env file.
    re: new RegExp(`^\\s*[A-Z][A-Z0-9_]*${SECRET_NAME}=\\S{6,}`),
    why: 'env file assigns a secret a value',
  },
  {
    // A quoted literal assigned to a secret-looking identifier in code.
    re: new RegExp(
      `\\b[A-Z][A-Z0-9_]*${SECRET_NAME}\\b\\s*[:=]\\s*["'\`][A-Za-z0-9_\\-./+=]{16,}["'\`]`
    ),
    why: 'secret-looking identifier assigned a literal',
  },
]

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && !SKIP.has(f) && !BINARY.test(f))

const mask = (line) =>
  line.replace(/[A-Za-z0-9_\/-]{12,}/g, (m) => m.slice(0, 4) + '…')

const hits = []
for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  text.split('\n').forEach((line, i) => {
    for (const { re, why } of PATTERNS) {
      if (re.test(line))
        hits.push(
          `${file}:${i + 1}: ${why}: ${mask(line.trim()).slice(0, 100)}`
        )
    }
  })
}

if (hits.length) {
  console.error(`Credential-shaped content found (${hits.length}):\n`)
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log(`check-secrets: ${files.length} files clean`)
