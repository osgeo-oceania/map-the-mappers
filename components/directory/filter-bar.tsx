'use client'

import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { toggleStateClasses } from '@/lib/utils/control-state'
import { formatCountryWithFlag } from '@/lib/utils/country-flags'
import type { ProfileFilters } from '@/types/profile'

interface FilterBarProps {
  onFiltersChange: (filters: ProfileFilters) => void
  viewMode: 'map' | 'list'
  onViewModeChange: (mode: 'map' | 'list') => void
  profileTypes?: string[]
  capabilityAreas?: string[]
  countries?: string[]
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  currentFilters?: ProfileFilters
  /** Optional mobile-row control, used to clear an active viewport filter in list view. */
  mobileTrailing?: React.ReactNode
}

interface FilterChip {
  type: string
  label: string
  onRemove: () => void
}

/** Keep this component at module scope so filter updates do not remount its controls. */
function FilterControls({
  isMobile = false,
  profileTypes,
  capabilityAreas,
  countries,
  filters,
  onPatch,
  hasActiveFilters,
  onClear,
  chips,
}: {
  isMobile?: boolean
  profileTypes: string[]
  capabilityAreas: string[]
  countries: string[]
  filters: ProfileFilters
  onPatch: (patch: Partial<ProfileFilters>) => void
  hasActiveFilters: boolean
  onClear: () => void
  chips: FilterChip[]
}) {
  return (
    <div className={cn('flex flex-col gap-4', isMobile && 'pb-4')}>
      <div className="box-border flex w-full flex-col gap-4">
        <MultiSelect
          options={profileTypes}
          selected={filters.profileTypes ?? []}
          onSelectionChange={(v) => onPatch({ profileTypes: v })}
          placeholder="Profile type"
          onClear={() => onPatch({ profileTypes: [] })}
          className="w-full"
        />

        <MultiSelect
          options={capabilityAreas}
          selected={filters.capabilityAreas ?? []}
          onSelectionChange={(v) => onPatch({ capabilityAreas: v })}
          placeholder="Capability area"
          onClear={() => onPatch({ capabilityAreas: [] })}
          className="w-full"
        />

        <MultiSelect
          options={countries}
          selected={filters.countries ?? []}
          onSelectionChange={(v) => onPatch({ countries: v })}
          placeholder="Country"
          onClear={() => onPatch({ countries: [] })}
          className="w-full"
          formatOption={formatCountryWithFlag}
        />

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="self-end hover:translate-x-0 hover:translate-y-0 hover:!border-secondary"
          >
            <X className="mr-1 h-5 w-5" />
            Clear
          </Button>
        )}
      </div>

      <FilterChips chips={chips} />
    </div>
  )
}

function FilterChips({ chips }: { chips: FilterChip[] }) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2 duration-300 animate-in fade-in-50">
      {chips.map((chip, index) => (
        <div
          key={`${chip.type}-${chip.label}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground duration-200 animate-in fade-in-0 zoom-in-95"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-accentColors-lime [&_svg]:stroke-current hover:[&_svg]:stroke-brand-secondary"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

/** searchInput is a draft; only submission updates the parent’s filters. */
export function FilterBar({
  onFiltersChange,
  viewMode,
  onViewModeChange,
  profileTypes = [],
  capabilityAreas = [],
  countries = [],
  hasActiveFilters = false,
  onClearFilters,
  currentFilters,
  mobileTrailing,
}: FilterBarProps) {
  const filters = currentFilters ?? {}
  const committedQuery = filters.searchQuery ?? ''

  const [searchInput, setSearchInput] = useState(committedQuery)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // External filter changes must also reset the search draft.
  useEffect(() => {
    setSearchInput(committedQuery)
  }, [committedQuery])

  const patchFilters = (patch: Partial<ProfileFilters>) => {
    const next: ProfileFilters = { ...filters, ...patch }
    if (!next.searchQuery) delete next.searchQuery
    if (!next.profileTypes?.length) delete next.profileTypes
    if (!next.capabilityAreas?.length) delete next.capabilityAreas
    if (!next.countries?.length) delete next.countries
    onFiltersChange(next)
  }

  const handleSearchSubmit = () => {
    patchFilters({ searchQuery: searchInput })
  }

  const handleClearFilters = () => {
    setSearchInput('')
    onFiltersChange({})
    onClearFilters?.()
  }

  const chips: FilterChip[] = [
    ...(committedQuery
      ? [
          {
            type: 'search',
            label: `Search: "${committedQuery}"`,
            onRemove: () => patchFilters({ searchQuery: '' }),
          },
        ]
      : []),
    ...(filters.profileTypes ?? []).map((t) => ({
      type: 'profile-type',
      label: t,
      onRemove: () =>
        patchFilters({
          profileTypes: (filters.profileTypes ?? []).filter((x) => x !== t),
        }),
    })),
    ...(filters.capabilityAreas ?? []).map((c) => ({
      type: 'capability',
      label: c,
      onRemove: () =>
        patchFilters({
          capabilityAreas: (filters.capabilityAreas ?? []).filter(
            (x) => x !== c
          ),
        }),
    })),
    ...(filters.countries ?? []).map((country) => ({
      type: 'country',
      label: formatCountryWithFlag(country),
      onRemove: () =>
        patchFilters({
          countries: (filters.countries ?? []).filter((c) => c !== country),
        }),
    })),
  ]

  const controlsProps = {
    profileTypes,
    capabilityAreas,
    countries,
    filters,
    onPatch: patchFilters,
    hasActiveFilters,
    onClear: handleClearFilters,
    chips,
  }

  return (
    <div className="flex w-full flex-col gap-4 transition-all duration-300">
      <div className="relative w-full transition-all duration-300">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by keyword"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit()
          }}
          className={cn(
            'border-0 bg-osgeo-inputFieldGrey text-brand-secondary transition-all duration-300 hover:bg-osgeo-inputFieldGrey hover:text-brand-secondary focus-visible:ring-0 focus-visible:ring-offset-0',
            searchInput ? 'pl-10 pr-24' : 'pl-10 pr-20'
          )}
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              patchFilters({ searchQuery: '' })
            }}
            className="absolute right-16 top-1/2 flex h-7 w-7 -translate-y-1/2 transform items-center justify-center rounded-md border border-input bg-background shadow-sm transition-colors duration-200 animate-in fade-in-0 zoom-in-95 hover:border-secondary hover:bg-neutral-warmGrey/30"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSearchSubmit}
          className="search-go-button absolute right-1 top-1/2 h-7 -translate-y-1/2 transform transition-all duration-300 hover:bg-accentColors-lime hover:text-brand-secondary"
        >
          Go
        </Button>
      </div>

      <div className="hidden w-full md:block">
        <FilterControls {...controlsProps} />
      </div>

      <div className="md:hidden">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-2">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                aria-pressed={mobileFiltersOpen}
                className={toggleStateClasses(
                  mobileFiltersOpen,
                  'h-10 w-10 rounded-full p-0 hover:translate-x-0 hover:translate-y-0'
                )}
                aria-label={mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            {/* White separates the grey inputs from the sheet background. */}
            <SheetContent
              side="bottom"
              className="h-[80vh] overflow-y-auto bg-white"
            >
              <SheetHeader>
                <SheetTitle>Filter Options</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterControls {...controlsProps} isMobile />
              </div>
            </SheetContent>
          </Sheet>

          <div
            className="inline-flex rounded-md bg-osgeo-inputFieldGrey p-1"
            role="tablist"
          >
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              List
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                viewMode === 'map'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Map
            </button>
          </div>

          {mobileTrailing}
        </div>

        <div className={chips.length > 0 ? 'mt-2' : ''}>
          <FilterChips chips={chips} />
        </div>
      </div>
    </div>
  )
}
