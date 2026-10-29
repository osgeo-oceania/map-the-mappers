'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types/profile'
import { SearchX } from 'lucide-react'

interface ListViewClientProps {
  providers: Profile[]
  onCardClick?: (provider: Profile) => void
  totalCount?: number
  onClearFilters?: () => void
  hideResultsCount?: boolean
  noPadding?: boolean
  demo?: boolean
}

export function ListViewClient({
  providers,
  onCardClick,
  totalCount,
  onClearFilters,
  hideResultsCount = false,
  noPadding = false,
  demo = false,
}: ListViewClientProps) {
  if (providers.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="py-12 text-center">
            {onClearFilters ? (
              <>
                <SearchX className="mx-auto mb-4 h-12 w-12 text-brand-secondary" />
                <p className="mb-2 text-lg text-brand-secondary">
                  No listings match your filters.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={onClearFilters}
                    variant="outline"
                    className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
                  >
                    Clear all filters
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-brand-secondary">No listings yet</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    // Set overflow-x explicitly; overflow-y alone permits horizontal scrolling.
    <div
      className={
        noPadding
          ? 'h-full overflow-y-auto overflow-x-hidden bg-white'
          : 'h-full overflow-y-auto overflow-x-hidden bg-white p-4'
      }
    >
      <div className={noPadding ? '' : 'container mx-auto'}>
        {!hideResultsCount && totalCount !== undefined && (
          <div className="mb-6 text-sm text-brand-secondary">
            Showing {providers.length} of {totalCount} provider
            {totalCount !== 1 ? 's' : ''}
          </div>
        )}

        <div className="space-y-4 pl-1 pt-1">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              provider={provider}
              onCardClick={onCardClick}
              demo={demo}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
