/** Lazy-loaded GeoNames gazetteer merged with listing locations for fuzzy search. */

import Fuse from 'fuse.js'
import type { Profile } from '@/types/profile'

export type PlaceKind =
  | 'capital'
  | 'city'
  | 'town'
  | 'village'
  | 'locality'
  | 'region'
  | 'provider'

export interface Place {
  name: string
  kind: PlaceKind
  region: string
  country: string
  lat: number
  lon: number
  /** Population — 0 if unknown. Used for prominence ranking. */
  pop: number
}

const GAZETTEER_URL = '/data/oceania-gazetteer.json'

let loadPromise: Promise<Place[]> | null = null

export async function loadGazetteer(): Promise<Place[]> {
  if (!loadPromise) {
    loadPromise = fetch(GAZETTEER_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`gazetteer fetch failed: ${res.status}`)
        return res.json() as Promise<Place[]>
      })
      .catch((err) => {
        // Allow a later retry if the download fails.
        loadPromise = null
        console.warn('Location gazetteer unavailable:', err)
        return [] as Place[]
      })
  }
  return loadPromise
}

/** Normalize for de-duplication: strip diacritics, apostrophe variants, punctuation. */
function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʻ‘’'`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function placesFromProviders(providers: Profile[]): Place[] {
  const seen = new Set<string>()
  const places: Place[] = []
  for (const p of providers) {
    const name = p.city_region
    if (!name) continue
    const key = `${normalize(name)}|${normalize(p.country)}`
    if (seen.has(key)) continue
    seen.add(key)
    places.push({
      name,
      kind: 'provider',
      region: '',
      country: p.country,
      lat: p.lat,
      lon: p.lon,
      pop: 0,
    })
  }
  return places
}

/** Prefer gazetteer metadata when a listing location already exists. */
export function mergePlaces(
  gazetteer: Place[],
  providerPlaces: Place[]
): Place[] {
  const gazKeys = new Set(
    gazetteer.map((p) => `${normalize(p.name)}|${normalize(p.country)}`)
  )
  const extras = providerPlaces.filter(
    (p) => !gazKeys.has(`${normalize(p.name)}|${normalize(p.country)}`)
  )
  return [...gazetteer, ...extras]
}

export function buildPlaceIndex(places: Place[]): Fuse<Place> {
  return new Fuse(places, {
    keys: [
      { name: 'name', weight: 0.85 },
      { name: 'region', weight: 0.1 },
      { name: 'country', weight: 0.05 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  })
}

/** Combine fuzzy relevance with population so larger places rank ahead of similar names. */
export function searchPlaces(
  index: Fuse<Place>,
  query: string,
  limit = 8
): Place[] {
  const q = query.trim()
  if (q.length < 2) return []
  const results = index.search(q, { limit: limit * 3 })

  const scored = results.map((r) => {
    const fuzzy = r.score ?? 1
    const prominence = r.item.pop > 0 ? Math.log10(r.item.pop) / 8 : 0
    return { place: r.item, rank: fuzzy - prominence * 0.15 }
  })

  scored.sort((a, b) => a.rank - b.rank)
  return scored.slice(0, limit).map((s) => s.place)
}
