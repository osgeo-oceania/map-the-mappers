'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { FilterBar } from './filter-bar'
import { MapView } from './map-view'
import { ListViewClient } from './list-view-client'
import { LocationSearch } from './location-search'
import { MapSyncToggle } from './map-sync-toggle'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toggleStateClasses } from '@/lib/utils/control-state'
import type { Profile, ProfileFilters } from '@/types/profile'
import type { MapContainerRef } from '@/components/map/map-container'
import type { Place } from '@/lib/geo/gazetteer'
import {
  bufferedBounds,
  providerInBounds,
  sortByProximity,
  zoomForPlace,
} from '@/lib/geo/proximity'

type Bounds = [[number, number], [number, number]]

interface DirectoryViewProps {
  initialProviders: Profile[]
  profileTypes: string[]
  capabilityAreas: string[]
  countries: string[]
  demo?: boolean
}

export function DirectoryView({
  initialProviders,
  profileTypes,
  capabilityAreas,
  countries,
  demo = false,
}: DirectoryViewProps) {
  // Restore session state after mount to keep SSR and hydration consistent.
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const [filters, setFilters] = useState<ProfileFilters>({})
  const [isMounted, setIsMounted] = useState(false)
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      const savedViewMode = sessionStorage.getItem('directory-viewMode')
      if (savedViewMode === 'map' || savedViewMode === 'list') {
        setViewMode(savedViewMode)
      }

      const savedFilters = sessionStorage.getItem('directory-filters')
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters)
          setFilters(parsed)
        } catch {}
      }
    }
  }, [])

  const prevFiltersRef = useRef<string>('')
  const prevViewModeRef = useRef<string>('')

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return
    const filtersKey = JSON.stringify(filters)
    if (filtersKey !== prevFiltersRef.current) {
      prevFiltersRef.current = filtersKey
      sessionStorage.setItem('directory-filters', filtersKey)
    }
  }, [filters, isMounted])

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return
    if (viewMode !== prevViewModeRef.current) {
      prevViewModeRef.current = viewMode
      sessionStorage.setItem('directory-viewMode', viewMode)
    }
  }, [viewMode, isMounted])
  const mapRef = useRef<MapContainerRef | null>(null)

  // Viewport changes filter listings only while sync is enabled.
  const [activePlace, setActivePlace] = useState<Place | null>(null)
  const [appliedBounds, setAppliedBounds] = useState<Bounds | null>(null)
  const [liveBounds, setLiveBounds] = useState<Bounds | null>(null)
  const [syncEnabled, setSyncEnabled] = useState(false)

  const handleCardClick = (provider: Profile) => {
    if (mapRef.current) {
      mapRef.current.flyToProvider(provider)
    }
  }

  const handleMapReady = (ref: MapContainerRef) => {
    mapRef.current = ref
  }

  const handleBoundsChange = useCallback((bounds: Bounds) => {
    setLiveBounds(bounds)
    setSyncEnabled((sync) => {
      if (sync) setAppliedBounds(bounds)
      return sync
    })
  }, [])

  const handleLocationSelect = useCallback((place: Place) => {
    // Filter bounds cover the surrounding area; camera zoom focuses the selected place.
    setActivePlace(place)
    setSyncEnabled(true)
    setAppliedBounds(bufferedBounds(place))
    mapRef.current?.flyToPlace([place.lon, place.lat], zoomForPlace(place))
  }, [])

  const handleLocationClear = useCallback(() => {
    // Clearing the location filter leaves the camera in place.
    setActivePlace(null)
    setSyncEnabled(false)
    setAppliedBounds(null)
  }, [])

  const handleToggleSync = useCallback(
    (enabled: boolean) => {
      setSyncEnabled(enabled)
      if (enabled) {
        setAppliedBounds(liveBounds)
      } else {
        setAppliedBounds(null)
        setActivePlace(null)
      }
    },
    [liveBounds]
  )

  const disableAutoFit = syncEnabled
  const searchMarker: [number, number] | null = activePlace
    ? [activePlace.lon, activePlace.lat]
    : null

  const filteredProviders = useMemo(() => {
    let filtered = initialProviders.filter((provider) => {
      if (
        filters.profileTypes &&
        filters.profileTypes.length > 0 &&
        !filters.profileTypes.some((t) => provider.profile_type.includes(t))
      ) {
        return false
      }

      if (
        filters.capabilityAreas &&
        filters.capabilityAreas.length > 0 &&
        !filters.capabilityAreas.some((c) =>
          provider.capability_areas.includes(c)
        )
      ) {
        return false
      }

      if (
        filters.countries &&
        filters.countries.length > 0 &&
        !filters.countries.includes(provider.country)
      ) {
        return false
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const haystack = [
          provider.listing_name,
          provider.short_description,
          provider.longer_about,
          provider.city_region,
          provider.country,
          ...provider.profile_type,
          ...provider.capability_areas,
          ...provider.oss_projects.map((p) => p.name),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }

      if (appliedBounds && !providerInBounds(provider, appliedBounds)) {
        return false
      }

      return true
    })

    if (activePlace) {
      filtered = sortByProximity(filtered, activePlace)
    } else {
      filtered = [...filtered].sort((a, b) =>
        a.listing_name.localeCompare(b.listing_name)
      )
    }

    return filtered
  }, [initialProviders, filters, appliedBounds, activePlace])

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
      (filters.profileTypes && filters.profileTypes.length > 0) ||
      (filters.capabilityAreas && filters.capabilityAreas.length > 0) ||
      (filters.countries && filters.countries.length > 0) ||
      appliedBounds ||
      activePlace
  )

  const handleClearFilters = () => {
    setFilters({})
    handleLocationClear()
    setSyncEnabled(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="hidden h-full md:flex">
        <div className="w-[450px] flex-shrink-0 overflow-y-auto border-r bg-white lg:w-[560px]">
          <div className="p-6">
            <div className="mb-4">
              <h1 className="type-subheading mb-2 font-sans font-bold text-brand-secondary">
                Explore Oceania&apos;s open source geospatial ecosystem
              </h1>
              <Button
                onClick={() => setDesktopFiltersOpen(!desktopFiltersOpen)}
                variant="ghost"
                aria-pressed={desktopFiltersOpen}
                className={toggleStateClasses(
                  desktopFiltersOpen,
                  'h-10 w-10 rounded-full p-0 hover:translate-x-0 hover:translate-y-0'
                )}
                aria-label={
                  desktopFiltersOpen ? 'Hide filters' : 'Show filters'
                }
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div
              className={cn(
                'ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden transition-all duration-500',
                desktopFiltersOpen
                  ? 'max-h-[2000px] translate-y-0 opacity-100'
                  : 'max-h-0 -translate-y-2 opacity-0'
              )}
            >
              <div className={cn(desktopFiltersOpen ? 'mb-4' : '')}>
                <FilterBar
                  onFiltersChange={setFilters}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  profileTypes={profileTypes}
                  capabilityAreas={capabilityAreas}
                  countries={countries}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                  currentFilters={filters}
                />
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm text-brand-secondary">
                Showing {filteredProviders.length} of {initialProviders.length}{' '}
                provider
                {initialProviders.length !== 1 ? 's' : ''}
              </div>
              <MapSyncToggle
                enabled={syncEnabled}
                onToggle={handleToggleSync}
              />
            </div>
            <div>
              <ListViewClient
                providers={filteredProviders}
                onCardClick={handleCardClick}
                totalCount={initialProviders.length}
                onClearFilters={
                  hasActiveFilters ? handleClearFilters : undefined
                }
                hideResultsCount={true}
                noPadding={true}
                demo={demo}
              />
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <MapView
            providers={filteredProviders}
            onMapReady={handleMapReady}
            disableAutoFit={disableAutoFit}
            onBoundsChange={handleBoundsChange}
            searchMarker={searchMarker}
            demo={demo}
            hasActiveFilters={hasActiveFilters}
          />
          <div className="absolute left-4 top-4 z-20">
            <LocationSearch
              providers={initialProviders}
              activePlace={activePlace}
              onSelect={handleLocationSelect}
              onClear={handleLocationClear}
            />
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col md:hidden">
        <div className="border-b bg-white p-4">
          <div className="mb-4">
            <h1 className="type-subheading mb-2 font-sans font-bold text-brand-secondary">
              Explore Oceania&apos;s open source geospatial ecosystem
            </h1>
          </div>
          <FilterBar
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            profileTypes={profileTypes}
            capabilityAreas={capabilityAreas}
            countries={countries}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            currentFilters={filters}
            /* In list view, show an active viewport filter so it can be cleared without the map. */
            mobileTrailing={
              viewMode === 'list' && syncEnabled ? (
                <MapSyncToggle
                  enabled={syncEnabled}
                  onToggle={handleToggleSync}
                />
              ) : null
            }
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' ? (
            <ListViewClient
              providers={filteredProviders}
              onCardClick={handleCardClick}
              totalCount={initialProviders.length}
              onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
              demo={demo}
            />
          ) : (
            <div className="relative h-full w-full">
              <MapView
                providers={filteredProviders}
                onMapReady={handleMapReady}
                disableAutoFit={disableAutoFit}
                onBoundsChange={handleBoundsChange}
                searchMarker={searchMarker}
                demo={demo}
                hasActiveFilters={hasActiveFilters}
              />
              <div className="absolute left-3 right-3 top-3 z-20 flex flex-col items-start gap-2">
                <LocationSearch
                  providers={initialProviders}
                  activePlace={activePlace}
                  onSelect={handleLocationSelect}
                  onClear={handleLocationClear}
                  className="w-full"
                />
                <MapSyncToggle
                  enabled={syncEnabled}
                  onToggle={handleToggleSync}
                  floating
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
