/**
 * Build the Oceania place-name gazetteer for location search.
 *
 * Input:  GeoNames per-country dumps (CC-BY 4.0) for Oceania + SE Asia, plus
 *         admin1CodesASCII.txt, all downloaded into the working directory:
 *
 *   codes="AU NZ PG FJ NC VU SB WS TO PF CK KI FM PW MH NR TV NU WF AS GU MP PN TK ID PH TL"
 *   for c in $codes; do curl -sLO "https://download.geonames.org/export/dump/$c.zip"; unzip -o "$c.zip"; done
 *   curl -sLO "https://download.geonames.org/export/dump/admin1CodesASCII.txt"
 *
 * Filter: class A (ADM1/ADM2 regions) + class P populated places with
 *         population >= POP_MIN, always keeping national/regional seats
 *         (PPLC/PPLA/PPLA2). Output sorted by population desc.
 *
 * Output: oceania-gazetteer.json -> public/data/oceania-gazetteer.json
 * Run:    node scripts/build-gazetteer.mjs   (from the dump directory)
 */
import fs from 'fs'

const COUNTRY = {
  AU: 'Australia',
  NZ: 'New Zealand',
  PG: 'Papua New Guinea',
  FJ: 'Fiji',
  NC: 'New Caledonia',
  VU: 'Vanuatu',
  SB: 'Solomon Islands',
  WS: 'Samoa',
  TO: 'Tonga',
  PF: 'French Polynesia',
  CK: 'Cook Islands',
  KI: 'Kiribati',
  FM: 'Micronesia',
  PW: 'Palau',
  MH: 'Marshall Islands',
  NR: 'Nauru',
  TV: 'Tuvalu',
  NU: 'Niue',
  WF: 'Wallis & Futuna',
  AS: 'American Samoa',
  GU: 'Guam',
  MP: 'Northern Mariana Islands',
  PN: 'Pitcairn',
  TK: 'Tokelau',
  ID: 'Indonesia',
  PH: 'Philippines',
  TL: 'Timor-Leste',
}

const admin1 = new Map()
for (const line of fs
  .readFileSync('admin1CodesASCII.txt', 'utf8')
  .split('\n')) {
  const [code, name] = line.split('\t')
  if (code) admin1.set(code, name)
}

const SEATS = new Set(['PPLC', 'PPLA', 'PPLA2'])
const ADMIN = new Set(['ADM1', 'ADM2'])
const POP_MIN = 5000

function kindFor(cls, code, pop) {
  if (cls === 'A') return 'region'
  if (code === 'PPLC') return 'capital'
  if (pop >= 100000) return 'city'
  if (pop >= 10000) return 'town'
  if (pop >= 1000) return 'village'
  return 'locality'
}

let out = []
const seen = new Set()
for (const cc of Object.keys(COUNTRY)) {
  const path = `${cc}.txt`
  if (!fs.existsSync(path)) continue
  for (const line of fs.readFileSync(path, 'utf8').split('\n')) {
    if (!line) continue
    const f = line.split('\t')
    const [, name, ascii, , lat, lon, cls, code, country, , a1] = f
    const pop = parseInt(f[14] || '0', 10) || 0
    let keep = false
    if (cls === 'P' && (pop >= POP_MIN || SEATS.has(code))) keep = true
    if (cls === 'A' && ADMIN.has(code)) keep = true
    if (!keep) continue
    const region = admin1.get(`${country}.${a1}`) || ''
    out.push({
      name,
      kind: kindFor(cls, code, pop),
      region,
      country: COUNTRY[country] || country,
      lat: +(+lat).toFixed(5),
      lon: +(+lon).toFixed(5),
      pop,
    })
  }
}

// Deduplicate by name/country, preferring populated places, then higher population.
const KIND_PRIORITY = {
  capital: 0,
  city: 1,
  town: 2,
  village: 3,
  locality: 4,
  region: 5,
}
const normName = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʻ‘’'`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const best = new Map()
for (const e of out) {
  const key = `${normName(e.name)}|${e.country}`
  const cur = best.get(key)
  if (
    !cur ||
    KIND_PRIORITY[e.kind] < KIND_PRIORITY[cur.kind] ||
    (KIND_PRIORITY[e.kind] === KIND_PRIORITY[cur.kind] && e.pop > cur.pop)
  ) {
    best.set(key, e)
  }
}
out = [...best.values()]
out.sort((a, b) => b.pop - a.pop)
fs.writeFileSync('oceania-gazetteer.json', JSON.stringify(out))
console.log('entries:', out.length)
console.log(
  'by kind:',
  out.reduce((m, e) => ((m[e.kind] = (m[e.kind] || 0) + 1), m), {})
)
console.log(
  'sample top 8:',
  out.slice(0, 8).map((e) => `${e.name} (${e.country}) pop=${e.pop}`)
)
console.log(
  'file KB:',
  Math.round(fs.statSync('oceania-gazetteer.json').size / 1024)
)
