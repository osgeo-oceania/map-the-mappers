import type { Profile } from '@/types/profile'
import type { Place } from './gazetteer'

const EARTH_RADIUS_KM = 6371

const toRad = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance between two lng/lat points, in kilometres. */
export function haversineKm(
  aLon: number,
  aLat: number,
  bLon: number,
  bLat: number
): number {
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLon - aLon)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function distanceToProvider(place: Place, provider: Profile): number {
  return haversineKm(place.lon, place.lat, provider.lon, provider.lat)
}

/** Sort nearest first without mutating the input. */
export function sortByProximity(providers: Profile[], place: Place): Profile[] {
  return [...providers].sort(
    (a, b) => distanceToProvider(place, a) - distanceToProvider(place, b)
  )
}

/** Camera zoom is independent of the wider area used to filter listings. */
export function zoomForPlace(place: Place): number {
  switch (place.kind) {
    case 'region':
      return 8
    case 'capital':
    case 'city':
      return 11
    case 'town':
      return 12
    default:
      return 13
  }
}

/** Filter bounds as [[west, south], [east, north]]; does not frame the camera. */
export function bufferedBounds(
  place: Place
): [[number, number], [number, number]] {
  // One degree of latitude is approximately 111 km.
  let radiusKm: number
  switch (place.kind) {
    case 'region':
      radiusKm = 120
      break
    case 'capital':
    case 'city':
      radiusKm = 40
      break
    case 'town':
      radiusKm = 20
      break
    default:
      radiusKm = 12
  }
  if (place.pop >= 500000) radiusKm = Math.max(radiusKm, 60)

  const latDeg = radiusKm / 111
  // Guard the longitude conversion near the poles.
  const lonDeg = radiusKm / (111 * Math.max(0.2, Math.cos(toRad(place.lat))))

  return [
    [place.lon - lonDeg, place.lat - latDeg],
    [place.lon + lonDeg, place.lat + latDeg],
  ]
}

/** Accept wrapped (west > east) and unwrapped (east > 180) bounds across the antimeridian. */
function lonInRange(lon: number, west: number, east: number): boolean {
  if (west <= east) {
    return (
      (lon >= west && lon <= east) ||
      (lon + 360 >= west && lon + 360 <= east) ||
      (lon - 360 >= west && lon - 360 <= east)
    )
  }
  return lon >= west || lon <= east
}

export function providerInBounds(
  provider: Profile,
  bounds: [[number, number], [number, number]]
): boolean {
  const { lon, lat } = provider
  const [[w, s], [e, n]] = bounds
  return lat >= s && lat <= n && lonInRange(lon, w, e)
}
