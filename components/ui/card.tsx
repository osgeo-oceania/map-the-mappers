'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CategoryPill } from '@/components/ui/category-pill'
import type { Profile } from '@/types/profile'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { profilePath } from '@/lib/utils/profile-url'

interface CardProps {
  provider: Profile
  className?: string
  onCardClick?: (provider: Profile) => void
  disableCardClick?: boolean
  demo?: boolean
}

/** Use a plain image so uploaded SVG logos also render. */
function LogoCircle({
  provider,
  className,
  inset,
  letterClassName,
}: {
  provider: Profile
  className?: string
  inset: string
  letterClassName?: string
}) {
  return (
    <div
      className={cn(
        'relative aspect-square flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-secondary/10 bg-white',
        className
      )}
    >
      {provider.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={provider.logo_url}
          alt={`${provider.listing_name} logo`}
          className={cn('h-full w-full object-contain', inset)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'flex h-full w-full select-none items-center justify-center text-xl font-semibold text-brand-secondary',
            letterClassName
          )}
        >
          {provider.listing_name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

export function Card({
  provider,
  className,
  onCardClick,
  disableCardClick = false,
  demo = false,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  // Start non-interactive for consistent SSR; update clickability after mount and resize.
  const [isMobile, setIsMobile] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const isInteractive = !disableCardClick && !isMobile

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('a, button')) {
      return
    }

    if (!isInteractive) {
      return
    }

    if (onCardClick) {
      onCardClick(provider)
    }
  }

  const location = [provider.city_region, provider.country]
    .filter(Boolean)
    .join(', ')

  return (
    <div
      ref={cardRef}
      onClick={isInteractive ? handleCardClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              // Nested controls handle their own keys; do not activate the card.
              if ((e.target as HTMLElement).closest('a, button')) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onCardClick?.(provider)
              }
            }
          : undefined
      }
      className={cn(
        'relative rounded-standard border border-brand-secondary/10 bg-neutral-cardSurface p-4 shadow-[0_4px_4px_rgba(24,49,56,0.1)] transition-all sm:flex sm:gap-4 sm:p-6',
        isInteractive
          ? 'cursor-pointer hover:-translate-x-1 hover:-translate-y-1'
          : '',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-3 sm:hidden">
        <LogoCircle provider={provider} className="h-14 w-14" inset="p-2" />
        <h3 className="min-w-0 text-lg font-semibold leading-snug text-brand-secondary">
          {provider.listing_name}
        </h3>
      </div>

      {/* Percentage padding preserves the logo ratio as the circle resizes. */}
      <LogoCircle
        provider={provider}
        className="hidden w-1/3 self-center sm:flex"
        inset="p-[18%]"
        letterClassName="text-4xl"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="mb-2 hidden text-lg font-semibold text-brand-secondary sm:block">
          {provider.listing_name}
        </h3>

        <p className="mb-2 line-clamp-2 text-sm text-brand-secondary">
          {provider.short_description}
        </p>

        <div className="mb-2 flex flex-wrap gap-2">
          {provider.profile_type.map((type) => (
            <CategoryPill key={type} label={type} className="text-xs" />
          ))}
        </div>

        {/* Allow long place names to wrap; flex children must be allowed to shrink. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2">
          {location && (
            <div
              className="flex min-w-0 items-start text-sm text-brand-secondary"
              title={location}
            >
              <MapPin className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="break-words">{location}</span>
            </div>
          )}

          <Button
            asChild
            variant="ghost"
            className="ml-auto flex-shrink-0 border border-brand-secondary text-brand-secondary hover:translate-x-0 hover:translate-y-0 hover:bg-secondary hover:text-white hover:no-underline"
          >
            <Link
              href={`${profilePath(provider)}${demo ? '?mode=demo' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:no-underline"
            >
              About
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
