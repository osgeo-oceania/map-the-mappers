/** Shared feed validation and public-field projection. See docs/FEED.md. */

import type { OssProject, Profile } from '@/types/profile'
import { profileRouteParam } from '@/lib/utils/profile-url'

export const PRIVATE_FIELDS = [
  'osm_permalink',
  'logo_source_url',
  'logo_drive_ref',
  'submitter_name',
  'submitter_role',
  'submitter_email',
  'support_declarations',
  'consent_criteria_attested',
  'consent_listing_and_contact',
  'moderation_notes',
  'moderator_id',
  'status',
  'last_modified_at',
  'last_verified_at',
] as const

export const PROFILE_KEYS = [
  'id',
  'listing_name',
  'profile_type',
  'country',
  'city_region',
  'lat',
  'lon',
  'contact_url',
  'primary_url',
  'short_description',
  'longer_about',
  'oss_projects',
  'capability_areas',
  'logo_url',
] as const satisfies readonly (keyof Profile)[]

/** String fields that must be present; empty is allowed. */
const OPTIONAL_TEXT_FIELDS = [
  'country',
  'city_region',
  'contact_url',
  'primary_url',
  'short_description',
  'longer_about',
] as const

const COORDINATE_RANGES = {
  lat: [-90, 90],
  lon: [-180, 180],
} as const

export interface ParseOptions {
  /** How an item is named in error messages. Default: `[index]`. */
  itemLabel?: (index: number) => string
  /** Reject known private fields instead of silently dropping them. */
  rejectPrivateFields?: boolean
}

export interface ParseResult {
  /** Items that passed, projected onto the public shape. */
  profiles: Profile[]
  /** One line per problem; empty means the whole input is valid. */
  errors: string[]
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== ''

const describe = (v: unknown): string =>
  v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v

/** Blank cells stay undefined, not zero. Non-numeric text is retained for errors. */
export function numericCell(
  cell: string | undefined
): number | string | undefined {
  const s = String(cell ?? '').trim()
  if (s === '') return undefined
  return /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s) ? Number(s) : s
}

function checkCoordinate(
  key: keyof typeof COORDINATE_RANGES,
  v: unknown,
  problems: string[]
): number {
  const [min, max] = COORDINATE_RANGES[key]
  if (v === undefined || v === null)
    problems.push(`"${key}" is missing or blank`)
  else if (typeof v !== 'number')
    problems.push(`"${key}" must be a number, got ${JSON.stringify(v)}`)
  else if (!Number.isFinite(v)) problems.push(`"${key}" must be finite`)
  else if (v < min || v > max)
    problems.push(`"${key}" ${v} is outside ${min}..${max}`)
  return v as number
}

function parseItem(
  rec: Record<string, unknown>,
  problems: string[],
  rejectPrivateFields: boolean
): Profile {
  if (!isNonEmptyString(rec.id))
    problems.push('"id" must be a non-empty string')
  if (!isNonEmptyString(rec.listing_name))
    problems.push('"listing_name" must be a non-empty string')

  for (const k of OPTIONAL_TEXT_FIELDS) {
    if (typeof rec[k] !== 'string') problems.push(`"${k}" must be a string`)
  }

  const profileType = rec.profile_type
  if (
    !Array.isArray(profileType) ||
    profileType.length === 0 ||
    !profileType.every(isNonEmptyString)
  )
    problems.push(
      '"profile_type" must be a non-empty array of non-empty strings'
    )

  const capabilityAreas = rec.capability_areas
  if (
    !Array.isArray(capabilityAreas) ||
    !capabilityAreas.every((c) => typeof c === 'string')
  )
    problems.push('"capability_areas" must be an array of strings')

  const ossProjects: OssProject[] = []
  if (!Array.isArray(rec.oss_projects)) {
    problems.push('"oss_projects" must be an array')
  } else {
    rec.oss_projects.forEach((p: unknown, i) => {
      if (
        !isRecord(p) ||
        typeof p.name !== 'string' ||
        typeof p.url !== 'string'
      )
        problems.push(
          `oss_projects[${i}] must be { name: string, url: string }`
        )
      else if (p.name || p.url) ossProjects.push({ name: p.name, url: p.url })
    })
  }

  if (rec.logo_url !== undefined && typeof rec.logo_url !== 'string')
    problems.push('"logo_url" must be a string when present')

  if (rejectPrivateFields) {
    for (const k of PRIVATE_FIELDS) {
      if (k in rec) problems.push(`private field "${k}" must not be published`)
    }
  }

  const lat = checkCoordinate('lat', rec.lat, problems)
  const lon = checkCoordinate('lon', rec.lon, problems)

  return {
    id: rec.id as string,
    listing_name: rec.listing_name as string,
    profile_type: profileType as string[],
    country: rec.country as string,
    city_region: rec.city_region as string,
    lat,
    lon,
    contact_url: rec.contact_url as string,
    primary_url: rec.primary_url as string,
    short_description: rec.short_description as string,
    longer_about: rec.longer_about as string,
    oss_projects: ossProjects,
    capability_areas: capabilityAreas as string[],
    ...(typeof rec.logo_url === 'string' && rec.logo_url
      ? { logo_url: rec.logo_url }
      : {}),
  }
}

/** Return valid public records and errors; callers reject the whole input on any error. */
export function parseProfiles(
  input: unknown,
  opts: ParseOptions = {}
): ParseResult {
  if (!Array.isArray(input)) {
    return {
      profiles: [],
      errors: [`expected an array of profiles, got ${describe(input)}`],
    }
  }
  const label = opts.itemLabel ?? ((i: number) => `[${i}]`)
  const profiles: Profile[] = []
  const errors: string[] = []
  const seen = new Set<string>()

  input.forEach((item: unknown, i) => {
    if (!isRecord(item)) {
      errors.push(`${label(i)}: expected an object, got ${describe(item)}`)
      return
    }
    const problems: string[] = []
    const profile = parseItem(item, problems, !!opts.rejectPrivateFields)
    if (typeof item.id === 'string' && item.id) {
      if (seen.has(item.id)) problems.push(`duplicate id "${item.id}"`)
      seen.add(item.id)
    }
    if (problems.length === 0) {
      profiles.push(profile)
      return
    }
    const name = isNonEmptyString(item.id)
      ? ` (${item.id})`
      : isNonEmptyString(item.listing_name)
        ? ` (${item.listing_name})`
        : ''
    for (const p of problems) errors.push(`${label(i)}${name}: ${p}`)
  })

  // Canonical params must be unique and must not shadow another listing's bare ID.
  const byId = new Map(profiles.map((p) => [p.id, p]))
  const byCanonicalParam = new Map<string, Profile>()
  for (const a of profiles) {
    const param = profileRouteParam(a)
    const canonicalOwner = byCanonicalParam.get(param)
    if (canonicalOwner)
      errors.push(
        `listing "${a.listing_name}" (${a.id}): canonical URL /map/${param} is also the canonical URL of listing "${canonicalOwner.listing_name}" (${canonicalOwner.id})`
      )
    else byCanonicalParam.set(param, a)
    const b = byId.get(param)
    if (b && b !== a)
      errors.push(
        `listing "${a.listing_name}" (${a.id}): canonical URL /map/${param} is also the id of listing "${b.listing_name}" (${b.id})`
      )
  }

  return { profiles, errors }
}
