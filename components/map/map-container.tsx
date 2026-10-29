'use client'

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map, Marker } from 'maplibre-gl'
import Supercluster from 'supercluster'
import {
  OCEANIA_CENTER,
  OCEANIA_ZOOM,
  PROVIDER_FOCUS_ZOOM,
  getMapStyle,
  FALLBACK_STYLE,
  MAP_PROJECTION,
  applyCountryLabelPlacement,
  countryLabelCollisionFor,
} from '@/lib/map/config'
import type { Profile } from '@/types/profile'
import { ZoomIn, ZoomOut, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MARKER_COLOR,
  TAG_BG,
  TAG_TEXT,
  TAG_BORDER,
} from '@/lib/utils/category-colors'
import {
  groupProvidersByLocation,
  groupProvidersByVisualProximity,
} from '@/lib/map/utils'
import { profilePath } from '@/lib/utils/profile-url'

// Let the bundler emit MapLibre’s worker as a hashed asset.
maplibregl.setWorkerUrl(
  new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString()
)

/** Escape listing content before interpolation into popup HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Cluster radius is in screen pixels.
const CLUSTER_RADIUS = 50
const CLUSTER_MAX_ZOOM = 14

interface MapContainerProps {
  providers: Profile[]
  center?: [number, number]
  zoom?: number
  fitBounds?: [[number, number], [number, number]]
  showPopup?: boolean
  onProviderClick?: (provider: Profile) => void
  className?: string
  showControls?: boolean
  initialBounds?: [[number, number], [number, number]]
  homeCenter?: [number, number]
  homeZoom?: number
  /** When true, don't auto-fit the map to provider changes (viewport is user/search driven). */
  disableAutoFit?: boolean
  /** Notified on moveend with the current viewport bounds and whether the move was user-initiated. */
  onBoundsChange?: (
    bounds: [[number, number], [number, number]],
    userInitiated: boolean
  ) => void
  /** A transient highlight marker for a searched location. */
  searchMarker?: [number, number] | null
  /** When true, popup "About" links keep the ?mode=demo flag. */
  demo?: boolean
}

export interface MapContainerRef {
  flyToProvider: (provider: Profile) => void
  showPopupForProvider: (provider: Profile) => void
  fitToBounds: (bounds: [[number, number], [number, number]]) => void
  flyToPlace: (center: [number, number], zoom: number) => void
}

export const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(
  function MapContainer(
    {
      providers,
      center = OCEANIA_CENTER,
      zoom = OCEANIA_ZOOM,
      fitBounds,
      showPopup = true,
      onProviderClick,
      className,
      showControls = true,
      initialBounds,
      homeCenter,
      homeZoom,
      disableAutoFit = false,
      onBoundsChange,
      searchMarker,
      demo = false,
    },
    ref
  ) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<Map | null>(null)
    const markersRef = useRef<Marker[]>([])
    const markerElementsRef = useRef<HTMLDivElement[]>([])
    const popupRef = useRef<maplibregl.Popup | null>(null)
    const clusterIndexRef = useRef<Supercluster<
      { providerIndex: number },
      Supercluster.AnyProps
    > | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const defaultBoundsRef = useRef<
      [[number, number], [number, number]] | null
    >(initialBounds || fitBounds || null)
    const defaultHomeCenterRef = useRef<[number, number] | null>(
      homeCenter || null
    )
    const defaultHomeZoomRef = useRef<number | null>(homeZoom || null)
    const initialBoundsSetRef = useRef(false)
    const currentPopupProvidersRef = useRef<Profile[]>([])
    const currentPopupIndexRef = useRef<number>(0)
    // Keep the popup anchor fixed during pagination.
    const popupAnchorLocationRef = useRef<[number, number] | null>(null)
    // Cache buffered bounds and integer zoom to skip redundant marker rebuilds.
    const lastRenderRef = useRef<{
      bbox: [number, number, number, number]
      clusterZoom: number
    } | null>(null)
    // Event listeners read the latest listings through this ref.
    const providersRef = useRef<Profile[]>(providers)
    useEffect(() => {
      providersRef.current = providers
    }, [providers])
    // The stable popup callback reads the current demo suffix through a ref.
    const demoSuffixRef = useRef(demo ? '?mode=demo' : '')
    useEffect(() => {
      demoSuffixRef.current = demo ? '?mode=demo' : ''
    }, [demo])

    const showPopupForProviderInternal = useCallback(
      (
        provider: Profile,
        providersAtLocation?: Profile[],
        index: number = 0
      ) => {
        if (!mapRef.current || !popupRef.current) return

        let providersAtSameLocation = providersAtLocation
        let locationKey = `${provider.lat},${provider.lon}`

        if (!providersAtSameLocation) {
          const currentProviders = providersRef.current
          const visualMap = groupProvidersByVisualProximity(
            currentProviders,
            mapRef.current,
            35
          )

          for (const [key, group] of visualMap.entries()) {
            if (group.some((p) => p.id === provider.id)) {
              providersAtSameLocation = group
              locationKey = key
              break
            }
          }

          if (!providersAtSameLocation) {
            locationKey = `${provider.lat},${provider.lon}`
            const locationMap = groupProvidersByLocation(currentProviders)
            providersAtSameLocation = locationMap.get(locationKey)
          }
        }

        if (!providersAtSameLocation) {
          providersAtSameLocation = [provider]
        }

        const hasMultipleProviders = providersAtSameLocation.length > 1

        currentPopupProvidersRef.current = providersAtSameLocation
        currentPopupIndexRef.current = index

        const anchorProvider = providersAtSameLocation[0]
        const anchorLocationKey = `${anchorProvider.lat},${anchorProvider.lon}`

        const currentAnchor = popupAnchorLocationRef.current
        const currentAnchorKey = currentAnchor
          ? `${currentAnchor[1]},${currentAnchor[0]}`
          : null

        if (currentAnchorKey !== anchorLocationKey) {
          popupAnchorLocationRef.current = [
            anchorProvider.lon,
            anchorProvider.lat,
          ]
        }

        const popupLngLat = popupAnchorLocationRef.current!
        const currentProvider = providersAtSameLocation[index]

        const textColor = '#183138'
        const tagBgColor = 'rgba(24, 49, 56, 0.12)'
        const buttonBorderColor = '#183138'
        const buttonHoverBg = '#183138'
        const buttonHoverText = '#ffffff'

        // Keep popup tag styling aligned with CategoryPill.
        const categoryPillsHtml = currentProvider.profile_type
          .map(
            (cat) =>
              `<span style="display:inline-flex;align-items:center;justify-content:center;text-align:center;text-wrap:balance;line-height:1.5;border-radius:9999px;padding:0.05rem 0.4rem;font-size:0.625rem;font-weight:500;background-color:${TAG_BG};color:${TAG_TEXT};border:1px solid ${TAG_BORDER};">${escapeHtml(cat)}</span>`
          )
          .join('')

        let paginationHtml = ''
        if (hasMultipleProviders) {
          const totalProviders = providersAtSameLocation.length
          const paginationColor = '#183138'
          const paginationActiveBg = '#183138'
          const paginationActiveText = '#fff'

          let paginationButtons = ''
          if (totalProviders <= 7) {
            paginationButtons = providersAtSameLocation
              .map((_, i) => {
                const isActive = i === index
                return `<button 
              data-provider-index="${i}" 
              class="popup-pagination-btn ${isActive ? 'active' : ''}"
              style="
                min-width: 1.5rem; 
                height: 1.5rem; 
                padding: 0 0.375rem; 
                margin: 0 0.125rem; 
                border: 1px solid ${isActive ? paginationActiveBg : paginationColor}; 
                background-color: ${isActive ? paginationActiveBg : 'transparent'}; 
                color: ${isActive ? paginationActiveText : textColor}; 
                border-radius: 0.25rem; 
                cursor: pointer; 
                font-size: 0.625rem; 
                font-weight: ${isActive ? '600' : '400'};
                transition: all 0.2s;
              "
              onmouseover="if(!${isActive}){this.style.backgroundColor='${tagBgColor}';}"
              onmouseout="if(!${isActive}){this.style.backgroundColor='transparent';}"
            >${i + 1}</button>`
              })
              .join('')
          } else {
            const current = index
            const showAround = 2
            const start = Math.max(0, current - showAround)
            const end = Math.min(totalProviders - 1, current + showAround)

            if (start > 0) {
              paginationButtons += `<button data-provider-index="0" class="popup-pagination-btn" style="min-width: 1.5rem; height: 1.5rem; padding: 0 0.375rem; margin: 0 0.125rem; border: 1px solid ${paginationColor}; background-color: transparent; color: ${textColor}; border-radius: 0.25rem; cursor: pointer; font-size: 0.625rem; transition: all 0.2s;" onmouseover="this.style.backgroundColor='${tagBgColor}';" onmouseout="this.style.backgroundColor='transparent';">1</button>`
              if (start > 1) {
                paginationButtons += `<span style="color: ${textColor}; font-size: 0.625rem; margin: 0 0.125rem;">...</span>`
              }
            }

            for (let i = start; i <= end; i++) {
              const isActive = i === index
              paginationButtons += `<button data-provider-index="${i}" class="popup-pagination-btn ${isActive ? 'active' : ''}" style="min-width: 1.5rem; height: 1.5rem; padding: 0 0.375rem; margin: 0 0.125rem; border: 1px solid ${isActive ? paginationActiveBg : paginationColor}; background-color: ${isActive ? paginationActiveBg : 'transparent'}; color: ${isActive ? paginationActiveText : textColor}; border-radius: 0.25rem; cursor: pointer; font-size: 0.625rem; font-weight: ${isActive ? '600' : '400'}; transition: all 0.2s;" onmouseover="if(!${isActive}){this.style.backgroundColor='${tagBgColor}';}" onmouseout="if(!${isActive}){this.style.backgroundColor='transparent';}">${i + 1}</button>`
            }

            if (end < totalProviders - 1) {
              if (end < totalProviders - 2) {
                paginationButtons += `<span style="color: ${textColor}; font-size: 0.625rem; margin: 0 0.125rem;">...</span>`
              }
              paginationButtons += `<button data-provider-index="${totalProviders - 1}" class="popup-pagination-btn" style="min-width: 1.5rem; height: 1.5rem; padding: 0 0.375rem; margin: 0 0.125rem; border: 1px solid ${paginationColor}; background-color: transparent; color: ${textColor}; border-radius: 0.25rem; cursor: pointer; font-size: 0.625rem; transition: all 0.2s;" onmouseover="this.style.backgroundColor='${tagBgColor}';" onmouseout="this.style.backgroundColor='transparent';">${totalProviders}</button>`
            }
          }

          paginationHtml = `<div style="display: flex; align-items: center; justify-content: flex-start; gap: 0.125rem; flex-wrap: wrap;">${paginationButtons}</div>`
        }

        const popupContainerId = `popup-${Date.now()}`

        popupRef.current
          .setLngLat(popupLngLat)
          .setHTML(
            `
          <div id="${popupContainerId}">
            <div style="margin-bottom: 0.375rem;">
              <h3 style="font-weight: 600; font-size: 0.875rem; color: ${textColor}; line-height: 1.2; margin: 0 0 0.25rem 0; padding-right: 1.25rem;">${escapeHtml(currentProvider.listing_name)}</h3>
              <p style="font-size: 0.75rem; color: ${textColor}; margin: 0 0 0.375rem 0; line-height: 1.3;">${escapeHtml(currentProvider.short_description)}</p>
              ${categoryPillsHtml ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem;">${categoryPillsHtml}</div>` : ''}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 0.5rem;">
              ${paginationHtml ? `<div style="flex: 1;">${paginationHtml}</div>` : '<div style="flex: 1;"></div>'}
              <a href="${escapeHtml(profilePath(currentProvider))}${demoSuffixRef.current}" target="_blank" rel="noopener noreferrer" style="
                display: inline-block;
                padding: 0.375rem 0.75rem; 
                font-size: 0.75rem; 
                color: ${textColor}; 
                text-decoration: none; 
                font-weight: 500;
                border: 1px solid ${buttonBorderColor};
                border-radius: 6px;
                background-color: transparent;
                transition: all 0.2s;
                white-space: nowrap;
                flex-shrink: 0;
              " 
              onmouseover="this.style.backgroundColor='${buttonHoverBg}'; this.style.color='${buttonHoverText}';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='${textColor}';"
              >About</a>
            </div>
          </div>
        `
          )
          .addTo(mapRef.current)

        setTimeout(() => {
          const popupElement = popupRef.current?.getElement()
          if (popupElement) {
            // Content padding leaves room for the close button.
            popupElement.style.backgroundColor = '#F1F1F1'
            popupElement.style.color = '#183138'
            popupElement.style.borderRadius = '12px'
            popupElement.style.width = '240px'
            popupElement.style.border = '1px solid rgba(24,49,56,0.10)'
            popupElement.style.boxShadow = '0 6px 20px rgba(24,49,56,0.15)'
          }
        }, 0)

        setTimeout(() => {
          const container = document.getElementById(popupContainerId)
          if (container) {
            const buttons = container.querySelectorAll('.popup-pagination-btn')
            buttons.forEach((btn) => {
              btn.addEventListener('click', (e) => {
                e.stopPropagation()
                const newIndex = parseInt(
                  (e.target as HTMLElement).getAttribute(
                    'data-provider-index'
                  ) || '0'
                )
                if (
                  newIndex !== index &&
                  newIndex < providersAtSameLocation.length
                ) {
                  showPopupForProviderInternal(
                    providersAtSameLocation[newIndex],
                    providersAtSameLocation,
                    newIndex
                  )
                }
              })
            })
          }
        }, 0)
      },
      []
    )

    useImperativeHandle(
      ref,
      () => ({
        flyToProvider: (provider: Profile) => {
          if (!mapRef.current) return

          if (popupRef.current && popupRef.current.isOpen()) {
            popupRef.current.remove()
          }

          mapRef.current.flyTo({
            center: [provider.lon, provider.lat],
            zoom: PROVIDER_FOCUS_ZOOM,
            duration: 800,
            essential: true,
          })

          // Compute overlap groups after the camera settles.
          setTimeout(() => {
            showPopupForProviderInternal(provider)
          }, 650)
        },
        showPopupForProvider: (provider: Profile) => {
          showPopupForProviderInternal(provider)
        },
        flyToPlace: (center: [number, number], zoom: number) => {
          if (!mapRef.current) return
          if (popupRef.current && popupRef.current.isOpen()) {
            popupRef.current.remove()
          }
          mapRef.current.flyTo({
            center,
            zoom,
            duration: 1600,
            curve: 1.42,
            essential: true,
          })
        },
        fitToBounds: (bounds: [[number, number], [number, number]]) => {
          if (!mapRef.current) return
          if (popupRef.current && popupRef.current.isOpen()) {
            popupRef.current.remove()
          }
          const padding = { top: 60, bottom: 60, left: 60, right: 60 }
          // Resolve bounds to a camera before flyTo for a continuous flight.
          const camera = mapRef.current.cameraForBounds(bounds, { padding })
          if (camera) {
            mapRef.current.flyTo({
              center: camera.center,
              zoom: camera.zoom,
              duration: 1600,
              curve: 1.42,
              essential: true,
            })
          } else {
            mapRef.current.fitBounds(bounds, {
              padding,
              duration: 1600,
              essential: true,
            })
          }
        },
      }),
      [showPopupForProviderInternal]
    )

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyle(),
        center: center,
        zoom: zoom,
        attributionControl: false,
      })

      mapRef.current = map

      map.addControl(new maplibregl.AttributionControl(), 'bottom-left')

      // MapLibre mounts compact attribution expanded; reset it to its collapsed state.
      const collapseAttribution = () => {
        const attrib = map
          .getContainer()
          .querySelector('.maplibregl-ctrl-attrib')
        if (!attrib) return
        attrib.classList.remove('maplibregl-compact-show')
        attrib.setAttribute('open', '')
      }
      collapseAttribution()
      // Source changes can re-render the attribution control.
      map.once('load', collapseAttribution)

      // Switch to raster once on tile API failure.
      let rasterFallbackApplied = false
      map.on('error', (e) => {
        const message = e?.error?.message ?? ''
        if (rasterFallbackApplied || !message.includes('api.protomaps.com'))
          return
        rasterFallbackApplied = true
        console.warn(
          'Protomaps API unavailable, falling back to OSM raster tiles:',
          message
        )
        map.setStyle(FALLBACK_STYLE)
      })

      // Reapply label placement after setStyle(), not just the initial load.
      map.on('styledata', () => applyCountryLabelPlacement(map))

      // Write placement settings only when the collision mode changes.
      let labelsColliding: boolean | null = null
      map.on('zoomend', () => {
        const next = countryLabelCollisionFor(map)
        if (next === labelsColliding) return
        labelsColliding = next
        applyCountryLabelPlacement(map, next)
      })

      map.on('load', () => {
        setMapLoaded(true)
        applyCountryLabelPlacement(map)

        map.setProjection({ type: MAP_PROJECTION })

        // Without bounds, preserve the point view requested by the profile mini-map.
        const boundsToUse = initialBounds || fitBounds
        if (boundsToUse) {
          map.fitBounds(boundsToUse, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 0,
          })
          defaultBoundsRef.current = boundsToUse
        }
        initialBoundsSetRef.current = true
      })

      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '280px',
        anchor: 'bottom',
        offset: [0, -54],
      })

      const onViewportResize = () => {
        const next = countryLabelCollisionFor(map)
        if (next === labelsColliding) return
        labelsColliding = next
        applyCountryLabelPlacement(map, next)
      }
      window.addEventListener('resize', onViewportResize)

      return () => {
        window.removeEventListener('resize', onViewportResize)
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      }
      // Only centre/zoom recreate the map; bounds changes use the separate camera effect.
      // initialBounds is read only during map initialization.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center, zoom])

    const onBoundsChangeRef = useRef(onBoundsChange)
    useEffect(() => {
      onBoundsChangeRef.current = onBoundsChange
    }, [onBoundsChange])

    useEffect(() => {
      if (!mapRef.current || !mapLoaded) return
      const map = mapRef.current
      const emit = (e?: { originalEvent?: unknown }) => {
        const cb = onBoundsChangeRef.current
        if (!cb) return
        const b = map.getBounds()
        cb(
          [
            [b.getWest(), b.getSouth()],
            [b.getEast(), b.getNorth()],
          ],
          Boolean(e?.originalEvent)
        )
      }
      map.on('moveend', emit)
      return () => {
        map.off('moveend', emit)
      }
    }, [mapLoaded])

    useEffect(() => {
      if (!mapRef.current || !mapLoaded) return
      if (disableAutoFit) return
      if (!initialBoundsSetRef.current) return

      // Use an epsilon when comparing calculated bounds.
      const currentBounds = defaultBoundsRef.current
      const boundsEqual =
        currentBounds &&
        fitBounds &&
        Math.abs(currentBounds[0][0] - fitBounds[0][0]) < 0.0001 &&
        Math.abs(currentBounds[0][1] - fitBounds[0][1]) < 0.0001 &&
        Math.abs(currentBounds[1][0] - fitBounds[1][0]) < 0.0001 &&
        Math.abs(currentBounds[1][1] - fitBounds[1][1]) < 0.0001

      if (boundsEqual) return

      if (!fitBounds) {
        mapRef.current.flyTo({
          center: center || OCEANIA_CENTER,
          zoom: zoom || OCEANIA_ZOOM,
          duration: 1000,
        })
        defaultBoundsRef.current = null
        return
      }

      mapRef.current.fitBounds(fitBounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
        essential: true,
      })

      defaultBoundsRef.current = fitBounds
    }, [fitBounds, mapLoaded, center, zoom, disableAutoFit])

    const getMarkerSize = (zoom: number) => {
      const minZoom = 2
      const maxZoom = 6
      const minSize = 20
      const maxSize = 32

      if (zoom <= minZoom) return minSize
      if (zoom >= maxZoom) return maxSize

      const ratio = (zoom - minZoom) / (maxZoom - minZoom)
      return minSize + (maxSize - minSize) * ratio
    }

    const updateMarkerSizes = useCallback(() => {
      if (!mapRef.current) return

      const zoom = mapRef.current.getZoom()
      const width = getMarkerSize(zoom)
      const height = (width / 32) * 46

      markerElementsRef.current.forEach((el) => {
        if (el) {
          el.style.width = `${width}px`
          el.style.height = `${height}px`
          const svg = el.querySelector('svg')
          if (svg) {
            svg.setAttribute('width', width.toString())
            svg.setAttribute('height', height.toString())
          }
        }
      })
    }, [])

    const openProviderPopup = useCallback(
      (provider: Profile, group?: Profile[]) => {
        if (!mapRef.current || !popupRef.current) return
        popupAnchorLocationRef.current = [provider.lon, provider.lat]

        let providersAtLocation = group
        if (!providersAtLocation) {
          const currentProviders = providersRef.current
          const visualMap = groupProvidersByVisualProximity(
            currentProviders,
            mapRef.current,
            35
          )
          for (const [, g] of visualMap.entries()) {
            if (g.some((p) => p.id === provider.id)) {
              providersAtLocation = g
              break
            }
          }
          if (!providersAtLocation) {
            const locationMap = groupProvidersByLocation(currentProviders)
            const locationKey = `${provider.lat},${provider.lon}`
            providersAtLocation = locationMap.get(locationKey)
          }
        }
        if (!providersAtLocation) providersAtLocation = [provider]

        setTimeout(() => {
          showPopupForProviderInternal(
            providersAtLocation![0],
            providersAtLocation,
            0
          )
        }, 250)
      },
      [showPopupForProviderInternal]
    )

    const renderMarkers = useCallback(() => {
      const map = mapRef.current
      const index = clusterIndexRef.current
      if (!map || !index || !mapLoaded) return

      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '280px',
          anchor: 'bottom',
          offset: [0, -54],
        })
      }

      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      markerElementsRef.current = []

      const zoom = map.getZoom()
      const b = map.getBounds()
      // Buffer by half a viewport per side to retain edge markers and reduce rebuilds.
      const lngPad = (b.getEast() - b.getWest()) / 2
      const latPad = (b.getNorth() - b.getSouth()) / 2
      const bbox: [number, number, number, number] = [
        b.getWest() - lngPad,
        Math.max(b.getSouth() - latPad, -90),
        b.getEast() + lngPad,
        Math.min(b.getNorth() + latPad, 90),
      ]
      const clusterZoom = Math.round(zoom)
      const clusters = index.getClusters(bbox, clusterZoom)
      lastRenderRef.current = { bbox, clusterZoom }
      const provs = providersRef.current

      const dropletWidth = getMarkerSize(zoom)
      const dropletHeight = (dropletWidth / 32) * 46

      for (const feature of clusters) {
        const [lng, lat] = feature.geometry.coordinates
        const props = feature.properties as {
          cluster?: boolean
          cluster_id?: number
          point_count?: number
          point_count_abbreviated?: string | number
          providerIndex?: number
        }

        if (props.cluster) {
          const count = props.point_count as number
          const clusterId = props.cluster_id as number
          const size = count < 10 ? 36 : count < 50 ? 44 : 52

          const el = document.createElement('div')
          el.className = 'cluster-marker'
          el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;`
          el.innerHTML = `
            <div style="
              width:100%;height:100%;display:flex;align-items:center;justify-content:center;
              border-radius:9999px;background:#183138;color:#fff;
              font-weight:600;font-size:${count < 100 ? 14 : 12}px;
              box-shadow:0 0 0 4px rgba(24,49,56,0.20);
              transition:transform 0.15s ease;">
              ${props.point_count_abbreviated}
            </div>`
          el.addEventListener('mouseenter', () => {
            const c = el.firstElementChild as HTMLElement
            if (c) c.style.transform = 'scale(1.08)'
          })
          el.addEventListener('mouseleave', () => {
            const c = el.firstElementChild as HTMLElement
            if (c) c.style.transform = 'scale(1)'
          })
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            const leaves = index.getLeaves(clusterId, Infinity)
            const leafProviders = leaves
              .map((l) => provs[l.properties.providerIndex])
              .filter(Boolean)
            // Co-located points can't be split by zooming — show the popup instead.
            const first = leafProviders[0]
            const allSameSpot =
              first &&
              leafProviders.every(
                (p) =>
                  Math.abs(p.lat - first.lat) < 1e-4 &&
                  Math.abs(p.lon - first.lon) < 1e-4
              )
            if (allSameSpot && showPopup) {
              map.flyTo({ center: [lng, lat], duration: 400, essential: true })
              openProviderPopup(first, leafProviders)
              return
            }
            const expansionZoom = Math.min(
              index.getClusterExpansionZoom(clusterId),
              CLUSTER_MAX_ZOOM + 3
            )
            map.flyTo({
              center: [lng, lat],
              zoom: Math.max(expansionZoom, zoom + 1),
              duration: 500,
              essential: true,
            })
          })

          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'center',
          })
            .setLngLat([lng, lat])
            .addTo(map)
          markersRef.current.push(marker)
        } else {
          const provider = provs[props.providerIndex as number]
          if (!provider) continue

          const el = document.createElement('div')
          el.className = 'marker'
          el.style.width = `${dropletWidth}px`
          el.style.height = `${dropletHeight}px`
          el.style.cursor = 'pointer'
          el.style.zIndex = '1'
          el.innerHTML = `
        <svg width="${dropletWidth}" height="${dropletHeight}" viewBox="0 0 100 145" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50C100 77.6142 68.5 110 50 144.5C34.5 110 0 77.6142 0 50C0 22.3858 22.3858 0 50 0C77.6142 0 100 22.3858 100 50Z" fill="${MARKER_COLOR}" stroke="white" stroke-width="2"/>
          <path d="M69 49C69 59.4934 60.4934 68 50 68C39.5066 68 31 59.4934 31 49C31 38.5066 39.5066 30 50 30C60.4934 30 69 38.5066 69 49Z" fill="white"/>
        </svg>
      `
          markerElementsRef.current.push(el)

          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'bottom',
          })
            .setLngLat([provider.lon, provider.lat])
            .addTo(map)

          el.addEventListener('click', (e) => {
            e.stopPropagation()
            const currentZoom = map.getZoom()
            map.flyTo({
              center: [provider.lon, provider.lat],
              zoom: currentZoom,
              duration: 500,
              essential: true,
            })
            if (onProviderClick) onProviderClick(provider)
            if (showPopup) openProviderPopup(provider)
          })
          el.addEventListener('pointerdown', (e) => e.stopPropagation())

          markersRef.current.push(marker)
        }
      }
    }, [mapLoaded, showPopup, onProviderClick, openProviderPopup])

    useEffect(() => {
      const index = new Supercluster<{ providerIndex: number }>({
        radius: CLUSTER_RADIUS,
        maxZoom: CLUSTER_MAX_ZOOM,
      })
      index.load(
        providers.map((p, i) => ({
          type: 'Feature',
          properties: { providerIndex: i },
          geometry: {
            type: 'Point',
            coordinates: [p.lon, p.lat],
          },
        }))
      )
      clusterIndexRef.current = index
      lastRenderRef.current = null
      renderMarkers()
    }, [providers, renderMarkers])

    // Skip rebuilds within the cached bounds and cluster-zoom bucket.
    useEffect(() => {
      const map = mapRef.current
      if (!map || !mapLoaded) return
      const handler = () => {
        const last = lastRenderRef.current
        if (last && Math.round(map.getZoom()) === last.clusterZoom) {
          const b = map.getBounds()
          const [w, s, e, n] = last.bbox
          if (
            b.getWest() >= w &&
            b.getEast() <= e &&
            b.getSouth() >= s &&
            b.getNorth() <= n
          ) {
            return
          }
        }
        renderMarkers()
      }
      map.on('moveend', handler)
      return () => {
        map.off('moveend', handler)
      }
    }, [mapLoaded, renderMarkers])

    const searchMarkerRef = useRef<Marker | null>(null)
    useEffect(() => {
      if (!mapRef.current || !mapLoaded) return

      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove()
        searchMarkerRef.current = null
      }
      if (!searchMarker) return

      const el = document.createElement('div')
      el.className = 'search-location-marker'
      el.style.width = '22px'
      el.style.height = '22px'
      el.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="7" fill="#183138" stroke="white" stroke-width="2.5"/>
          <circle cx="12" cy="12" r="2.5" fill="white"/>
        </svg>`
      searchMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(searchMarker)
        .addTo(mapRef.current)
    }, [searchMarker, mapLoaded])

    useEffect(() => {
      if (!mapRef.current || !mapLoaded) return

      const handleZoom = () => {
        updateMarkerSizes()
      }

      mapRef.current.on('zoom', handleZoom)
      mapRef.current.on('zoomend', handleZoom)

      return () => {
        if (mapRef.current) {
          mapRef.current.off('zoom', handleZoom)
          mapRef.current.off('zoomend', handleZoom)
        }
      }
    }, [mapLoaded, updateMarkerSizes])

    const handleZoomIn = () => {
      if (!mapRef.current) return
      mapRef.current.zoomIn({ duration: 200 })
    }

    const handleZoomOut = () => {
      if (!mapRef.current) return
      mapRef.current.zoomOut({ duration: 200 })
    }

    const handleHome = () => {
      if (!mapRef.current) return

      if (defaultHomeCenterRef.current && defaultHomeZoomRef.current !== null) {
        mapRef.current.flyTo({
          center: defaultHomeCenterRef.current,
          zoom: defaultHomeZoomRef.current,
          duration: 1000,
        })
      } else if (defaultBoundsRef.current) {
        mapRef.current.fitBounds(defaultBoundsRef.current, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000,
        })
      } else {
        mapRef.current.flyTo({
          center: OCEANIA_CENTER,
          zoom: OCEANIA_ZOOM,
          duration: 1000,
        })
      }
    }

    return (
      <div
        ref={mapContainerRef}
        className={cn('relative', className || 'h-full w-full')}
      >
        {showControls && mapLoaded && (
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <Button
              onClick={handleHome}
              variant="secondary"
              className="h-10 w-10 rounded-full p-0 shadow-lg hover:translate-x-0 hover:translate-y-0 hover:bg-accentColors-lime hover:text-brand-secondary"
              aria-label="Reset to default view"
            >
              <Home className="h-4 w-4" />
            </Button>
            <div className="flex flex-col gap-1">
              <Button
                onClick={handleZoomIn}
                variant="secondary"
                className="h-10 w-10 rounded-full p-0 shadow-lg hover:translate-x-0 hover:translate-y-0 hover:bg-accentColors-lime hover:text-brand-secondary"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleZoomOut}
                variant="secondary"
                className="h-10 w-10 rounded-full p-0 shadow-lg hover:translate-x-0 hover:translate-y-0 hover:bg-accentColors-lime hover:text-brand-secondary"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)
