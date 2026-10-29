'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type Fuse from 'fuse.js'
import { MapPin, Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/profile'
import {
  loadGazetteer,
  placesFromProviders,
  mergePlaces,
  buildPlaceIndex,
  searchPlaces,
  type Place,
} from '@/lib/geo/gazetteer'

interface LocationSearchProps {
  providers: Profile[]
  activePlace: Place | null
  onSelect: (place: Place) => void
  onClear: () => void
  className?: string
}

function placeContext(place: Place): string {
  return [place.region, place.country].filter(Boolean).join(', ')
}

/** Lazy-load the gazetteer and merge listing locations into the search index. */
export function LocationSearch({
  providers,
  activePlace,
  onSelect,
  onClear,
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const indexRef = useRef<Fuse<Place> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (activePlace) setQuery(activePlace.name)
    else setQuery('')
  }, [activePlace])

  const providerPlaces = useMemo(
    () => placesFromProviders(providers),
    [providers]
  )

  async function ensureIndex() {
    if (indexRef.current) return
    setLoading(true)
    try {
      const gaz = await loadGazetteer()
      indexRef.current = buildPlaceIndex(mergePlaces(gaz, providerPlaces))
    } finally {
      setLoading(false)
    }
  }

  // Refresh an existing index when the listing locations change.
  useEffect(() => {
    if (indexRef.current) {
      loadGazetteer().then((gaz) => {
        indexRef.current = buildPlaceIndex(mergePlaces(gaz, providerPlaces))
      })
    }
  }, [providerPlaces])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function runSearch(q: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!indexRef.current || q.trim().length < 2) {
        setResults([])
        return
      }
      setResults(searchPlaces(indexRef.current, q))
      setActiveIndex(-1)
    }, 120)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    void ensureIndex().then(() => runSearch(q))
    runSearch(q)
  }

  function handleSelect(place: Place) {
    setQuery(place.name)
    setResults([])
    setOpen(false)
    onSelect(place)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setOpen(false)
    onClear()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = results[activeIndex] ?? results[0]
      if (pick) handleSelect(pick)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('w-[280px] max-w-[calc(100vw-2rem)]', className)}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setOpen(true)
            void ensureIndex()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search a place…"
          aria-label="Search for a location"
          className="h-10 w-full rounded-md border-0 bg-white pl-10 pr-9 text-sm text-brand-secondary shadow-lg placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/20"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 transform items-center justify-center rounded-md transition-colors duration-200 hover:bg-neutral-warmGrey/30"
          >
            <X className="h-5 w-5 text-muted-foreground transition-colors hover:text-brand-secondary" />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="mt-2 max-h-72 overflow-y-auto rounded-md border border-input bg-white py-1 shadow-lg"
        >
          {results.map((place, i) => (
            <li
              key={`${place.name}-${place.lat}-${place.lon}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => handleSelect(place)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-200',
                  i === activeIndex
                    ? 'bg-osgeo-inputFieldGrey'
                    : 'hover:bg-osgeo-inputFieldGrey'
                )}
              >
                <MapPin className="h-4 w-4 flex-shrink-0 text-brand-secondary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-brand-secondary">
                    {place.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {place.kind !== 'region' && place.kind !== 'provider'
                      ? `${place.kind} · `
                      : ''}
                    {placeContext(place)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
