import type { Profile } from '@/types/profile'
import type { Map as MapLibreMap } from 'maplibre-gl'

/** Group exact coordinate matches by "lat,lon". */
export function groupProvidersByLocation(
  providers: Profile[]
): Map<string, Profile[]> {
  const locationMap = new Map<string, Profile[]>()

  providers.forEach((provider) => {
    const key = `${provider.lat},${provider.lon}`
    if (!locationMap.has(key)) {
      locationMap.set(key, [])
    }
    locationMap.get(key)!.push(provider)
  })

  return locationMap
}

/**
 * Group overlapping markers by screen distance; omit singletons.
 * Reference: https://stackoverflow.com/questions/50294242/mapbox-gl-js-overlapping-layers-and-mouse-event-handling
 */
export function groupProvidersByVisualProximity(
  providers: Profile[],
  map: MapLibreMap,
  pixelThreshold: number = 80
): Map<string, Profile[]> {
  const groups = new Map<string, Profile[]>()
  const processed = new Set<string>()

  providers.forEach((provider) => {
    const providerId = provider.id
    if (processed.has(providerId)) return

    const providerPoint = map.project([provider.lon, provider.lat])

    const nearbyProviders: Profile[] = [provider]

    providers.forEach((otherProvider) => {
      if (otherProvider.id === providerId || processed.has(otherProvider.id))
        return

      const otherPoint = map.project([otherProvider.lon, otherProvider.lat])
      const pixelDistance = Math.sqrt(
        Math.pow(providerPoint.x - otherPoint.x, 2) +
          Math.pow(providerPoint.y - otherPoint.y, 2)
      )

      if (pixelDistance <= pixelThreshold) {
        nearbyProviders.push(otherProvider)
        processed.add(otherProvider.id)
      }
    })

    if (nearbyProviders.length > 1) {
      const key = `${nearbyProviders[0].lat},${nearbyProviders[0].lon}`
      groups.set(key, nearbyProviders)
      processed.add(providerId)
    }
  })

  return groups
}

/** Return padded [[west, south], [east, north]] bounds, or undefined for no listings. */
export function calculateBoundsFromProviders(
  providers: Profile[]
): [[number, number], [number, number]] | undefined {
  if (providers.length === 0) {
    return undefined
  }

  const coordinates = providers.map((p) => ({
    lon: p.lon,
    lat: p.lat,
  }))

  const rawMinLon = Math.min(...coordinates.map((c) => c.lon))
  const rawMaxLon = Math.max(...coordinates.map((c) => c.lon))
  const rawSpan = rawMaxLon - rawMinLon

  // Use the shorter longitude span when listings cross the antimeridian.
  const crossesDateLine = rawSpan > 180

  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  if (crossesDateLine) {
    // Normalize longitudes to 0–360 before finding the centre.
    const normalizedCoords = coordinates.map((coord) => ({
      lon: coord.lon < 0 ? coord.lon + 360 : coord.lon,
      lat: coord.lat,
    }))

    const centerLonNormalized =
      normalizedCoords.reduce((sum, c) => sum + c.lon, 0) /
      normalizedCoords.length
    const centerLat =
      normalizedCoords.reduce((sum, c) => sum + c.lat, 0) /
      normalizedCoords.length

    let maxLonDistance = 0
    let maxLatDistance = 0

    normalizedCoords.forEach((coord) => {
      const lonDist = Math.abs(coord.lon - centerLonNormalized)
      const wrappedLonDist = Math.min(lonDist, 360 - lonDist)
      if (wrappedLonDist > maxLonDistance) maxLonDistance = wrappedLonDist

      const latDist = Math.abs(coord.lat - centerLat)
      if (latDist > maxLatDistance) maxLatDistance = latDist
    })

    const centerLon =
      centerLonNormalized > 180
        ? centerLonNormalized - 360
        : centerLonNormalized

    const lonPadding = Math.max(maxLonDistance * 1.1, 0.02)
    const latPadding = Math.max(maxLatDistance * 1.1, 0.02)

    minLon = centerLon - lonPadding
    maxLon = centerLon + lonPadding
    minLat = centerLat - latPadding
    maxLat = centerLat + latPadding

    if (minLon < -180) minLon = -180
    if (maxLon > 180) maxLon = 180
  } else {
    coordinates.forEach((coord) => {
      if (coord.lon < minLon) minLon = coord.lon
      if (coord.lon > maxLon) maxLon = coord.lon
      if (coord.lat < minLat) minLat = coord.lat
      if (coord.lat > maxLat) maxLat = coord.lat
    })
  }

  if (!crossesDateLine) {
    let lonPadding = (maxLon - minLon) * 0.03
    let latPadding = (maxLat - minLat) * 0.03

    // Keep very tight clusters from zooming in excessively.
    const minPadding = 0.02
    if (lonPadding < minPadding) lonPadding = minPadding
    if (latPadding < minPadding) latPadding = minPadding

    minLon = minLon - lonPadding
    maxLon = maxLon + lonPadding
    minLat = minLat - latPadding
    maxLat = maxLat + latPadding
  }

  const clampedMinLon = Math.max(minLon, -180)
  const clampedMaxLon = Math.min(maxLon, 180)
  const clampedMinLat = Math.max(minLat, -90)
  const clampedMaxLat = Math.min(maxLat, 90)

  return [
    [clampedMinLon, clampedMinLat],
    [clampedMaxLon, clampedMaxLat],
  ]
}
