/** Profile URLs combine a readable name slug with a stable listing ID. */

/** Strip combining marks so names with macrons retain their base letters. */
export function slugifyListingName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Canonical path for a listing. Bare id when the name has no ASCII at all. */
export function profilePath(provider: {
  id: string
  listing_name: string
}): string {
  const slug = slugifyListingName(provider.listing_name)
  return slug ? `/map/${slug}-${provider.id}` : `/map/${provider.id}`
}

export function profileRouteParam(provider: {
  id: string
  listing_name: string
}): string {
  return profilePath(provider).slice('/map/'.length)
}

/**
 * Resolve bare ids and slug-id URLs against known listings; ids need not be UUIDs.
 * Order: exact id, exact canonical param, then a unique `-<id>` suffix match.
 * Ambiguous suffixes return null rather than redirecting to a guessed listing.
 * The caller redirects stale slugs to the canonical URL.
 */
export function resolveProfileParam<
  T extends { id: string; listing_name: string },
>(param: string, providers: T[]): T | null {
  const decoded = decodeURIComponent(param)
  const exact =
    providers.find((p) => p.id === decoded) ??
    providers.find((p) => profileRouteParam(p) === decoded)
  if (exact) return exact
  const lower = decoded.toLowerCase()
  let match: T | null = null
  for (const p of providers) {
    if (!lower.endsWith(`-${p.id.toLowerCase()}`)) continue
    if (match) return null
    match = p
  }
  return match
}

/** Redirect target for a resolved listing, or null when `param` is already canonical. */
export function canonicalRedirectTarget(
  param: string,
  provider: { id: string; listing_name: string },
  demo: boolean
): string | null {
  const canonical = profileRouteParam(provider)
  if (param === canonical) return null
  return `/map/${canonical}${demo ? '?mode=demo' : ''}`
}
