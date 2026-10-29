import { cn } from '@/lib/utils'
import { Globe, Compass, FileText, Info } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface Feature {
  icon?: string
  image?: string
  title: string
  subtitle?: string
  description?: string
}

interface FeatureListProps {
  title: string
  features: Feature[]
  note?: string
  className?: string
  equalHeightCards?: boolean
}

export function FeatureList({
  title,
  features,
  note,
  className,
  equalHeightCards = false,
}: FeatureListProps) {
  const hasSecondaryBg =
    className?.includes('bg-secondary') ||
    className?.includes('bg-brand-secondary')

  return (
    <section className={cn('px-4 py-24 md:py-32', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up" className="mb-20">
            <h2
              className={cn(
                'text-center text-3xl font-bold',
                hasSecondaryBg ? 'text-neutral-offWhite' : '!text-white'
              )}
            >
              {title}
            </h2>
          </ScrollReveal>
          <div
            className={cn(
              'mx-auto mb-12 grid max-w-5xl gap-8',
              // Match columns to the card count to avoid an empty column.
              features.length >= 4
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-3'
            )}
          >
            {features.map((feature, index) => {
              const getIcon = (icon?: string) => {
                if (!icon) return null
                switch (icon) {
                  case '🌍':
                    return (
                      <Globe className="h-8 w-8 stroke-[1] text-brand-secondary" />
                    )
                  case '🧭':
                    return (
                      <Compass className="h-8 w-8 stroke-[1] text-brand-secondary" />
                    )
                  case '📑':
                    return (
                      <FileText className="h-8 w-8 stroke-[1] text-brand-secondary" />
                    )
                  default:
                    return <span className="text-3xl">{icon}</span>
                }
              }

              return (
                <ScrollReveal
                  key={index}
                  direction="up"
                  delay={index * 100}
                  className={equalHeightCards ? 'h-full' : ''}
                >
                  <div
                    className={cn(
                      'flex flex-col rounded-standard bg-accentColors-mint p-6 text-left',
                      equalHeightCards ? 'h-full' : 'min-h-[300px]'
                    )}
                  >
                    {feature.image ? (
                      <div className="mb-4 flex h-[200px] w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-standard bg-transparent">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : feature.icon ? (
                      <div className="mb-4 flex flex-shrink-0 justify-start">
                        {getIcon(feature.icon)}
                      </div>
                    ) : null}
                    <h3 className="mb-2 break-words text-lg font-semibold leading-tight text-brand-secondary">
                      {feature.title}
                    </h3>
                    {feature.subtitle && (
                      <p className="mb-2 text-sm font-medium text-brand-secondary">
                        {feature.subtitle}
                      </p>
                    )}
                    {feature.description && (
                      <p className="mb-4 text-sm text-brand-secondary">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
          {note && (
            <ScrollReveal direction="up" delay={300}>
              <div className="mx-auto flex max-w-[600px] gap-4 rounded-standard border-2 border-accentColors-skyBlue p-6">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accentColors-skyBlue" />
                <p className="text-sm text-accentColors-skyBlue">{note}</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}
