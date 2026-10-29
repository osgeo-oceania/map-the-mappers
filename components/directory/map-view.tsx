'use client'

import { useRef, useEffect, useMemo } from 'react'
import {
  MapContainer,
  type MapContainerRef,
} from '@/components/map/map-container'
import { calculateBoundsFromProviders } from '@/lib/map/utils'
import { OCEANIA_REGION_BOUNDS } from '@/lib/map/config'
import type { Profile } from '@/types/profile'

interface MapViewProps {
  providers: Profile[]
  onMapReady?: (mapRef: MapContainerRef) => void
  /** When true, don't auto-fit to providers (viewport is user/search driven). */
  disableAutoFit?: boolean
  onBoundsChange?: (
    bounds: [[number, number], [number, number]],
    userInitiated: boolean
  ) => void
  searchMarker?: [number, number] | null
  demo?: boolean
  /** Frame the region until the user narrows the listings. */
  hasActiveFilters?: boolean
}

export function MapView({
  providers,
  onMapReady,
  disableAutoFit = false,
  onBoundsChange,
  searchMarker,
  demo = false,
  hasActiveFilters = false,
}: MapViewProps) {
  const mapRef = useRef<MapContainerRef>(null)

  useEffect(() => {
    if (mapRef.current && onMapReady) {
      onMapReady(mapRef.current)
    }
  }, [onMapReady])

  const bounds = useMemo(() => {
    return calculateBoundsFromProviders(providers)
  }, [providers])

  // Omit centre/zoom props: changes recreate MapContainer and cancel camera flights.
  const shouldResetToDefault = providers.length === 0

  const frameRegion = !hasActiveFilters || shouldResetToDefault

  // initialBounds frames first load; fitBounds handles later updates.
  const fitBoundsValue = frameRegion
    ? OCEANIA_REGION_BOUNDS
    : bounds || OCEANIA_REGION_BOUNDS
  const initialBoundsValue = fitBoundsValue

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        providers={providers}
        fitBounds={fitBoundsValue}
        initialBounds={initialBoundsValue}
        showPopup={true}
        showControls={true}
        disableAutoFit={disableAutoFit}
        onBoundsChange={onBoundsChange}
        searchMarker={searchMarker}
        demo={demo}
        className="h-full w-full"
      />
    </div>
  )
}
