/** Basemap styles, label placement and raster fallback. */

import type * as maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import { layers, namedFlavor, type Flavor } from '@protomaps/basemaps'

// Fallback framing only; these bounds do not restrict panning.
export const OCEANIA_BOUNDS: [[number, number], [number, number]] = [
  [110, -48],
  [180, -8],
]

// Unwrapped east longitudes include the region across the antimeridian.
export const OCEANIA_REGION_BOUNDS: [[number, number], [number, number]] = [
  [92, -48],
  [236, 22],
]

export const OCEANIA_CENTER: [number, number] = [166.458, -22.2758]

export const OCEANIA_ZOOM = 4

export const PROVIDER_FOCUS_ZOOM = 13

export const MAP_PROJECTION: 'mercator' | 'globe' = 'mercator'

// Self-hosted assets from protomaps/basemaps-assets.

const BASEMAP_GLYPHS_PATH = '/basemap/fonts/{fontstack}/{range}.pbf'
const BASEMAP_SPRITE_PATH = '/basemap/sprites/light'

// Keep brand tokens in sync with tailwind.config.ts.
const BRAND = {
  green: '#60A955',
  teal: '#183138',
  fern: '#3E7E54',
  mint: '#8CDCB5',
  lime: '#D6F599',
  skyBlue: '#9CD5DD',
  lilac: '#E7E2F3',
  charcoal: '#1B1B1B',
  offWhite: '#F9F8F6',
}

const EARTH = '#F2EFF9'

const WATER = '#A6D3D9'

// Vegetation darkens with density.
const GREEN_PALEST = '#E3F4EA'
const GREEN_PALE = '#DCF1E6'
const GREEN_LIGHT = '#CBEBD9'
const GREEN_URBAN = '#BCE9D3'
const GREEN_COVER = '#C2E9D3'
const GREEN_PARK = '#A9E2C6'
const GREEN_WOOD = '#7FD3AC'
const EARTH_SHADE = '#EAE4F2'
const EARTH_SHADE_DEEP = '#E1D9EC'

// Keep administrative boundaries and coastlines subdued so listing pins and labels remain prominent.
// Administrative boundary contrast against land: 2.64:1.
const BOUNDARY = '#87989D'

// Coastline contrast against land: 2.59:1.
const COASTLINE = '#7C9CA1'

function getBrandFlavor(): Flavor {
  const light = namedFlavor('light')
  return {
    ...light,
    background: WATER,
    earth: EARTH,
    water: WATER,
    park_a: GREEN_PARK,
    park_b: GREEN_PARK,
    wood_a: GREEN_WOOD,
    wood_b: GREEN_WOOD,
    scrub_a: GREEN_LIGHT,
    scrub_b: GREEN_LIGHT,
    // Keep built land use neutral so listing pins remain prominent.
    hospital: EARTH,
    industrial: EARTH,
    school: EARTH,
    pedestrian: EARTH,
    military: EARTH,
    zoo: EARTH,
    aerodrome: EARTH_SHADE,
    buildings: EARTH_SHADE_DEEP,
    landcover: {
      ...(light.landcover ?? {
        barren: EARTH,
        farmland: EARTH,
        forest: GREEN_COVER,
        glacier: '#FFFFFF',
        grassland: GREEN_PALE,
        scrub: GREEN_PALEST,
        urban_area: '#E5E3EC',
      }),
      forest: GREEN_COVER,
      grassland: GREEN_PALE,
      scrub: GREEN_PALEST,
    },
    boundaries: BOUNDARY,
    city_label: BRAND.teal,
    state_label: BRAND.teal,
    country_label: BRAND.teal,
    subplace_label: BRAND.teal,
    ocean_label: BRAND.fern,
  }
}

// Font stacks must match public/basemap/fonts; regenerate via scripts/generate-map-glyphs.md.
const MAP_FONTS = {
  body: 'Plus Jakarta Sans Regular',
  bodyMedium: 'Plus Jakarta Sans Medium',
  heading: 'IBM Plex Serif SemiBold',
} as const

const FONT_SWAP: Record<string, string> = {
  'Noto Sans Regular': MAP_FONTS.body,
  'Noto Sans Medium': MAP_FONTS.bodyMedium,
  'Noto Sans Italic': MAP_FONTS.body,
}

// Layers set one weight heavier than the body default.
const MEDIUM_WEIGHT_LABELS = new Set(['places_subplace'])

// Match road-label halos to their underlying road colours.
const ROAD_LABEL_HALO: Record<string, unknown> = {
  roads_labels_major: '#FFFFFF',
  roads_shields: '#FFFFFF',
  roads_labels_minor: [
    'interpolate',
    ['exponential', 1.6],
    ['zoom'],
    11,
    '#EBEBEB',
    16,
    '#FFFFFF',
  ],
}

// text-font may be a nested expression; replace names without changing its structure.
function swapFontNames<T>(value: T): T {
  if (typeof value === 'string') return (FONT_SWAP[value] ?? value) as T
  if (Array.isArray(value)) return value.map(swapFontNames) as T
  return value
}

function applyBrandTypography(
  styleLayers: ReturnType<typeof layers>
): ReturnType<typeof layers> {
  return styleLayers.map((layer) => {
    if (layer.type !== 'symbol') return layer
    const currentFont = layer.layout?.['text-font']
    if (!currentFont) return layer
    const isCountry = layer.id === 'places_country'
    return {
      ...layer,
      layout: {
        ...layer.layout,
        'text-font':
          isCountry || MEDIUM_WEIGHT_LABELS.has(layer.id)
            ? [MAP_FONTS.bodyMedium]
            : swapFontNames(currentFont),
      },
      paint: {
        ...layer.paint,
        'text-color': BRAND.teal,
        // Road labels need halos in the road colour.
        ...(ROAD_LABEL_HALO[layer.id]
          ? {
              'text-halo-color': ROAD_LABEL_HALO[layer.id],
              'text-halo-width': 1.5,
            }
          : // Explicit zero overrides halos already set by upstream layers.
            { 'text-halo-width': 0 }),
      },
    } as unknown as ReturnType<typeof layers>[number]
  })
}

// Remove road casings, retaining each road fill.
const isRoadCasing = (id: string) => /_casing(_early|_late)?$/.test(id)

const DROPPED_LAYERS = new Set(['roads_shields', 'roads_other'])

// Retain geographic landmarks; hide retail and street-furniture POIs.
const POI_KINDS_KEPT = ['beach', 'forest']

// Replace only the kind allowlist; retain upstream visibility filters.
function slimPois(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'pois' || !('filter' in layer)) return layer
  const filter = layer.filter
  if (!Array.isArray(filter) || filter[0] !== 'all') return layer
  const layout = { ...((layer.layout ?? {}) as Record<string, unknown>) }
  delete layout['icon-image']
  return {
    ...layer,
    layout,
    filter: [
      ...filter.map((clause) =>
        Array.isArray(clause) && clause[0] === 'in'
          ? ['in', ['get', 'kind'], ['literal', POI_KINDS_KEPT]]
          : clause
      ),
    ],
  } as unknown as typeof layer
}

// Urban green needs a direct override because the flavour has no separate key.
const URBAN_GREEN = GREEN_URBAN

function lightenUrbanGreen(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'landuse_urban_green' || !('paint' in layer)) return layer
  return {
    ...layer,
    paint: { ...layer.paint, 'fill-color': URBAN_GREEN },
  } as typeof layer
}

/** Match service-road fills to the other roads. */
function whitenServiceRoads(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'roads_minor_service' || !('paint' in layer)) return layer
  return {
    ...layer,
    paint: { ...layer.paint, 'line-color': '#FFFFFF' },
  } as typeof layer
}

/** Outline marine water only; insert above the water fill and below land features. */
const MARINE_KINDS = ['ocean', 'sea', 'bay', 'strait', 'fjord']

function coastlineLayer(): ReturnType<typeof layers>[number] {
  return {
    id: 'water_coastline',
    type: 'line',
    source: 'protomaps',
    'source-layer': 'water',
    filter: [
      'all',
      ['==', '$type', 'Polygon'],
      ['in', 'kind', ...MARINE_KINDS],
    ],
    paint: {
      'line-color': COASTLINE,
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        2,
        0.3,
        8,
        0.6,
        14,
        1.0,
      ],
    },
  } as unknown as ReturnType<typeof layers>[number]
}

/** Exclude pools and fountains using legacy filter syntax; do not mix filter syntaxes. */
function hidePoolsAndFountains(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'water' || !('filter' in layer)) return layer
  return {
    ...layer,
    filter: ['all', layer.filter, ['!in', 'kind', 'swimming_pool', 'fountain']],
  } as unknown as typeof layer
}

// Local anchors label small countries absent from low-zoom tiles.
// GeoJSON points are hand-placed label anchors, not country centroids.
// Keep country coverage aligned with scripts/build-gazetteer.mjs.
const COUNTRY_LABELS_PATH = '/data/oceania-countries.geojson'

// Upstream country labels take over at this zoom.
const COUNTRY_LABEL_HANDOFF_ZOOM = 5

const LOCAL_ONLY = ['coalesce', ['get', 'name_local'], ['get', 'name']]

// Keep the dual name consistent across local and upstream labels.
const NZ_DUAL_NAME = ['concat', ['get', 'name'], ' / ', ['get', 'name_local']]

const COUNTRY_LABEL_TEXT = [
  'case',
  ['==', ['get', 'name'], 'New Zealand'],
  NZ_DUAL_NAME,
  LOCAL_ONLY,
]

export const COUNTRY_LABEL_LAYER_ID = 'oceania_country_labels'

/** Below Tailwind md, enable collisions so labels fit the viewport. */
export const COUNTRY_LABEL_COLLIDE_BELOW = 768

/** Placement settings for overlapping and colliding labels. */
export function countryLabelPlacement(collide: boolean) {
  return {
    'text-allow-overlap': !collide,
    'text-ignore-placement': !collide,
    'text-padding': collide ? 4 : 2,
  }
}

export function shouldCollideCountryLabels(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < COUNTRY_LABEL_COLLIDE_BELOW
}

/** Enable collisions at far zoom even on desktop. */
export const DESKTOP_LABEL_COLLIDE_BELOW_ZOOM = 1.8

export function countryLabelCollisionFor(map: maplibregl.Map): boolean {
  return (
    shouldCollideCountryLabels() ||
    map.getZoom() < DESKTOP_LABEL_COLLIDE_BELOW_ZOOM
  )
}

/** Apply after load or setStyle(); a missing layer is a no-op. */
export function applyCountryLabelPlacement(
  map: maplibregl.Map,
  collide = countryLabelCollisionFor(map)
) {
  if (!map.getLayer(COUNTRY_LABEL_LAYER_ID)) return
  const placement = countryLabelPlacement(collide)
  map.setLayoutProperty(
    COUNTRY_LABEL_LAYER_ID,
    'text-allow-overlap',
    placement['text-allow-overlap']
  )
  map.setLayoutProperty(
    COUNTRY_LABEL_LAYER_ID,
    'text-ignore-placement',
    placement['text-ignore-placement']
  )
  map.setLayoutProperty(
    COUNTRY_LABEL_LAYER_ID,
    'text-padding',
    placement['text-padding']
  )
}

function countryLabelLayer(): ReturnType<typeof layers>[number] {
  // Desktop defaults are adjusted for the live viewport after load.
  // Feature offsets are in ems; move text without moving its geographic anchor.
  const shared = {
    'text-field': COUNTRY_LABEL_TEXT,
    'text-offset': ['coalesce', ['get', 'offset'], ['literal', [0, 0]]],
    // When colliding, place upstream-supported countries before territories.
    'symbol-sort-key': ['case', ['coalesce', ['get', 'upstream'], false], 0, 1],
    ...countryLabelPlacement(false),
  }

  const layout = {
    ...shared,
    // Plus Jakarta Sans includes the required Marshallese glyphs.
    'text-font': [MAP_FONTS.bodyMedium],
    'text-transform': 'uppercase',
    'text-letter-spacing': 0.02,
    // Match label size at the upstream handoff.
    'text-size': ['interpolate', ['linear'], ['zoom'], 1, 10, 3, 12, 5, 16],
    'text-line-height': 1.05,
    'text-max-width': 9,
  }

  return {
    id: COUNTRY_LABEL_LAYER_ID,
    type: 'symbol',
    source: 'oceania_countries',
    // Above the handoff, retain territories missing from upstream country labels.
    filter: [
      'any',
      ['<', ['zoom'], COUNTRY_LABEL_HANDOFF_ZOOM],
      ['!', ['coalesce', ['get', 'upstream'], false]],
    ],
    layout,
    paint: {
      'text-color': BRAND.teal,
      'text-halo-width': 0,
    },
  } as unknown as ReturnType<typeof layers>[number]
}

// Use the street-name zoom as the POI threshold so they stay aligned.
function streetLabelZoom(styleLayers: ReturnType<typeof layers>): number {
  const streets = styleLayers.find((l) => l.id === 'roads_labels_minor')
  return streets?.minzoom ?? 15
}

function deferLabelLayers(
  layer: ReturnType<typeof layers>[number],
  streetZoom: number
) {
  const minzoom: Record<string, number> = {
    roads_labels_major: 13,
    pois: streetZoom,
  }
  const value = minzoom[layer.id]
  return value === undefined
    ? layer
    : ({ ...layer, minzoom: value } as typeof layer)
}

/** Filter kind_detail to omit unpopulated locality names, which share city population/zoom values. */
function dropUnpopulatedLocalities(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'places_locality' || !('filter' in layer)) return layer
  // Keep legacy syntax to match the existing filter.
  return {
    ...layer,
    filter: ['all', layer.filter, ['!=', 'kind_detail', 'locality']],
  } as unknown as typeof layer
}

// Delay subnational borders until country-level detail is visible.
const STATE_BOUNDARY_MINZOOM = 5

const LOCALISED_LABEL_LAYERS = new Set([
  'places_country',
  'places_region',
  'places_locality',
  'places_subplace',
  'water_label_ocean',
  'water_label_lakes',
  'water_waterway_label',
  'earth_label_islands',
])

/** Prefer local name, then English. Revisit script detection for non-Latin regions. */
function useLocalNames(layer: ReturnType<typeof layers>[number]) {
  if (!LOCALISED_LABEL_LAYERS.has(layer.id) || !('layout' in layer))
    return layer
  return {
    ...layer,
    layout: {
      ...layer.layout,
      'text-field': ['coalesce', ['get', 'name'], ['get', 'name:en']],
    },
  } as unknown as typeof layer
}

function deferStateBoundaries(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'boundaries') return layer
  return { ...layer, minzoom: STATE_BOUNDARY_MINZOOM } as typeof layer
}

/** Delay city and regional labels until country-label handoff. */
function deferPlaceLabels(layer: ReturnType<typeof layers>[number]) {
  const DEFERRED = ['places_locality', 'places_region', 'places_subplace']
  if (!DEFERRED.includes(layer.id)) return layer
  return { ...layer, minzoom: COUNTRY_LABEL_HANDOFF_ZOOM } as typeof layer
}

/** Hide town dots while retaining capital markers. */
function capitalDotsOnly(layer: ReturnType<typeof layers>[number]) {
  if (layer.id !== 'places_locality' || !('layout' in layer)) return layer
  return {
    ...layer,
    layout: {
      ...layer.layout,
      'icon-image': [
        'step',
        ['zoom'],
        ['case', ['==', ['get', 'capital'], 'yes'], 'capital', ''],
        8,
        '',
      ],
    },
  } as typeof layer
}

function brandLayers(): ReturnType<typeof layers> {
  const upstream = layers('protomaps', getBrandFlavor(), { lang: 'en' })
  const streetZoom = streetLabelZoom(upstream)
  const styled = applyBrandTypography(
    upstream
      .filter(
        (layer) => !isRoadCasing(layer.id) && !DROPPED_LAYERS.has(layer.id)
      )
      .map(slimPois)
      .map(capitalDotsOnly)
      .map(deferPlaceLabels)
      .map(deferStateBoundaries)
      .map(useLocalNames)
      .map(dropUnpopulatedLocalities)
      .map((layer) => deferLabelLayers(layer, streetZoom))
      .map(hidePoolsAndFountains)
      .map(lightenUrbanGreen)
      .map(whitenServiceRoads)
  ).map((layer) =>
    // Avoid overlapping the upstream and local country-label layers.
    layer.id === 'places_country'
      ? { ...layer, minzoom: COUNTRY_LABEL_HANDOFF_ZOOM }
      : layer
  )

  const waterIndex = styled.findIndex((l) => l.id === 'water')
  const withCoastline =
    waterIndex === -1
      ? styled
      : [
          ...styled.slice(0, waterIndex + 1),
          coastlineLayer(),
          ...styled.slice(waterIndex + 1),
        ]

  return [...withCoastline, countryLabelLayer()]
}

// Raster fallback for a missing key or tile API failure.
export const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | <a href="https://www.geonames.org">GeoNames</a>',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm',
    },
  ],
}

// Retain OpenStreetMap and GeoNames attribution when adapting the map.
const BASEMAP_ATTRIBUTION =
  '<a href="https://protomaps.com">Protomaps</a> | © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | <a href="https://www.geonames.org">GeoNames</a>'

// The browser exposes this key; restrict its allowed origins upstream.
const PROTOMAPS_API_KEY = process.env.NEXT_PUBLIC_PROTOMAPS_KEY ?? ''

export function getMapStyle(): StyleSpecification {
  if (!PROTOMAPS_API_KEY) return FALLBACK_STYLE

  // Resolve sprite and glyph paths against the browser origin.
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    version: 8,
    glyphs: `${origin}${BASEMAP_GLYPHS_PATH}`,
    sprite: `${origin}${BASEMAP_SPRITE_PATH}`,
    sources: {
      protomaps: {
        type: 'vector',
        tiles: [
          `https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=${PROTOMAPS_API_KEY}`,
        ],
        maxzoom: 15,
        attribution: BASEMAP_ATTRIBUTION,
      },
      oceania_countries: {
        type: 'geojson',
        data: `${origin}${COUNTRY_LABELS_PATH}`,
      },
    },
    layers: brandLayers(),
  }
}
