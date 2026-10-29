import { CategoryPill } from '@/components/ui/category-pill'
import { Button } from '@/components/ui/button'
import { Globe, ExternalLink, MapPin } from 'lucide-react'
import type { Profile } from '@/types/profile'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { getCountryFlag } from '@/lib/utils/country-flags'
import { externalHref } from '@/lib/utils/url'

interface ProfileHeaderProps {
  provider: Profile
}

export function ProfileHeader({ provider }: ProfileHeaderProps) {
  const countryFlag = getCountryFlag(provider.country)
  const locationParts = [provider.city_region, provider.country].filter(Boolean)

  const locationText = locationParts
    .map((part) => {
      if (part === provider.country && countryFlag) {
        return `${part} ${countryFlag}`
      }
      return part
    })
    .join(', ')

  return (
    <div className="space-y-6">
      {provider.logo_url && (
        <ScrollReveal direction="up">
          {/* Inset varied logo shapes within a consistent container. */}
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-brand-secondary/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={provider.logo_url}
              alt={`${provider.listing_name} logo`}
              className="h-full w-full object-contain p-4"
            />
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal direction="up" delay={100}>
        <h1 className="type-title font-bold text-brand-secondary">
          {provider.listing_name}
        </h1>
      </ScrollReveal>

      {locationText && (
        <ScrollReveal direction="up" delay={100}>
          <div className="flex items-center gap-2 text-brand-secondary/80">
            <MapPin className="h-4 w-4" />
            <span>{locationText}</span>
          </div>
        </ScrollReveal>
      )}

      {provider.profile_type.length > 0 && (
        <ScrollReveal direction="up" delay={200}>
          <div className="flex flex-wrap gap-2">
            {provider.profile_type.map((type) => (
              <CategoryPill key={type} label={type} />
            ))}
          </div>
        </ScrollReveal>
      )}

      {provider.short_description && (
        <ScrollReveal direction="up" delay={200}>
          <p className="type-lead text-brand-secondary">
            {provider.short_description}
          </p>
        </ScrollReveal>
      )}

      {provider.longer_about && (
        <ScrollReveal direction="up" delay={300}>
          <div>
            <h2 className="type-subheading mb-4 font-semibold text-brand-secondary">
              About
            </h2>
            <p className="whitespace-pre-line text-brand-secondary">
              {provider.longer_about}
            </p>
          </div>
        </ScrollReveal>
      )}

      {(provider.primary_url || provider.contact_url) && (
        <ScrollReveal direction="up" delay={300}>
          <div className="flex flex-wrap gap-3 pt-2">
            {provider.primary_url && (
              <Button
                asChild
                variant="secondary"
                size="default"
                className="hover:bg-accentColors-lime hover:text-brand-secondary"
              >
                <a
                  href={externalHref(provider.primary_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Visit website
                </a>
              </Button>
            )}
            {provider.contact_url && (
              <Button
                asChild
                variant="secondary"
                size="default"
                className="hover:bg-accentColors-lime hover:text-brand-secondary"
              >
                <a
                  href={externalHref(provider.contact_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Contact
                </a>
              </Button>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  )
}
