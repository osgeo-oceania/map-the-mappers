import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface IconItem {
  icon: string | LucideIcon
  title: string
  description?: ReactNode
}

interface IconListProps {
  title: string
  items: IconItem[]
  className?: string
  iconStrokeWidth?: number
}

export function IconList({
  title,
  items,
  className,
  iconStrokeWidth = 2,
}: IconListProps) {
  const hasSecondaryBg =
    className?.includes('bg-secondary') ||
    className?.includes('bg-brand-secondary')
  const hasLilacCard = className?.includes('[&_.bg-card]:bg-accentColors-lilac')
  const hasLimeCard = className?.includes('[&_.bg-card]:bg-accentColors-lime')
  const hasTransparentCard = className?.includes('[&_.bg-card]:bg-transparent')

  return (
    <section
      className={cn(
        'px-4 py-20 md:flex md:min-h-[600px] md:items-center md:py-24',
        className
      )}
    >
      <div className="container mx-auto w-full max-w-container">
        <div className="mx-auto w-full max-w-5xl">
          <ScrollReveal direction="up" className="mb-20">
            <h2
              className={cn(
                'text-center text-3xl font-bold',
                hasSecondaryBg ? 'text-neutral-offWhite' : '[color:inherit]'
              )}
            >
              {title}
            </h2>
          </ScrollReveal>
          <div
            className={cn(
              'grid grid-cols-1 gap-6',
              // Match columns to the item count to avoid a 2+1 row.
              items.length >= 4
                ? 'md:grid-cols-2 lg:grid-cols-4'
                : 'md:grid-cols-3'
            )}
          >
            {items.map((item, index) => {
              const isStringIcon = typeof item.icon === 'string'
              return (
                <ScrollReveal key={index} direction="up" delay={index * 100}>
                  <div
                    className={cn(
                      'flex h-full flex-col rounded-standard p-6 text-center',
                      hasTransparentCard
                        ? 'border-0 bg-transparent'
                        : hasLimeCard
                          ? 'border-0 bg-accentColors-lime'
                          : hasLilacCard
                            ? 'border-0 bg-accentColors-lilac'
                            : 'border bg-card'
                    )}
                  >
                    {isStringIcon ? (
                      <div
                        className={cn(
                          'mb-4 text-4xl',
                          hasTransparentCard && hasSecondaryBg
                            ? 'text-neutral-offWhite'
                            : hasLimeCard
                              ? 'text-brand-secondary'
                              : ''
                        )}
                      >
                        {item.icon as string}
                      </div>
                    ) : (
                      <item.icon
                        className={cn(
                          'mx-auto mb-4 h-12 w-12',
                          hasTransparentCard && hasSecondaryBg
                            ? 'text-neutral-offWhite'
                            : hasLimeCard
                              ? 'text-brand-secondary'
                              : ''
                        )}
                        strokeWidth={iconStrokeWidth}
                      />
                    )}
                    <h3
                      className={cn(
                        'mb-2 text-lg font-semibold',
                        hasTransparentCard && hasSecondaryBg
                          ? 'text-neutral-offWhite'
                          : hasLimeCard
                            ? 'text-brand-secondary'
                            : 'text-brand-secondary'
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p
                        className={cn(
                          'text-sm',
                          hasTransparentCard && hasSecondaryBg
                            ? 'text-neutral-offWhite/90'
                            : hasLimeCard || hasLilacCard
                              ? 'text-brand-secondary'
                              : 'text-muted-foreground'
                        )}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
