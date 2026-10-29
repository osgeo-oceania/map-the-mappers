import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface BulletItem {
  icon: string | LucideIcon
  text: string
}

interface BulletListProps {
  title: string
  items: BulletItem[]
  className?: string
  iconStrokeWidth?: number
  verticalLayout?: boolean
}

export function BulletList({
  title,
  items,
  className,
  iconStrokeWidth = 2,
  verticalLayout = false,
}: BulletListProps) {
  const hasSecondaryBg =
    className?.includes('bg-secondary') ||
    className?.includes('bg-brand-secondary')
  const hasOffWhiteCard = className?.includes(
    '[&_.bg-card]:bg-neutral-offWhite'
  )
  const hasLilacCard = className?.includes('[&_.bg-card]:bg-accentColors-lilac')

  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up">
            <h2
              className={cn(
                'mb-8 text-center text-3xl font-bold',
                hasSecondaryBg ? 'text-neutral-offWhite' : '[color:inherit]'
              )}
            >
              {title}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item, index) => {
              const isStringIcon = typeof item.icon === 'string'
              return (
                <ScrollReveal key={index} direction="up" delay={index * 100}>
                  {verticalLayout ? (
                    <div
                      className={cn(
                        'flex flex-col items-center rounded-standard p-6 text-center',
                        hasLilacCard
                          ? 'border-0 bg-accentColors-lilac'
                          : hasOffWhiteCard
                            ? 'border-0 bg-neutral-offWhite'
                            : 'border-0 bg-card'
                      )}
                    >
                      {isStringIcon ? (
                        <span className="mb-4 text-4xl">
                          {item.icon as string}
                        </span>
                      ) : (
                        <item.icon
                          className="mb-4 h-16 w-16"
                          strokeWidth={iconStrokeWidth}
                        />
                      )}
                      <p className="text-brand-secondary">{item.text}</p>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex items-start gap-3 rounded-standard p-4',
                        hasLilacCard
                          ? 'border-0 bg-accentColors-lilac'
                          : hasOffWhiteCard
                            ? 'border-0 bg-neutral-offWhite'
                            : 'border-0 bg-card'
                      )}
                    >
                      {isStringIcon ? (
                        <span className="flex-shrink-0 text-2xl">
                          {item.icon as string}
                        </span>
                      ) : (
                        <item.icon
                          className="mt-0.5 h-6 w-6 flex-shrink-0"
                          strokeWidth={iconStrokeWidth}
                        />
                      )}
                      <p className="text-secondary">{item.text}</p>
                    </div>
                  )}
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
