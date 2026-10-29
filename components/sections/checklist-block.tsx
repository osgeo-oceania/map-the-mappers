import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface ChecklistItem {
  text: string
}

interface ChecklistBlockProps {
  title: string
  items: ChecklistItem[]
  intro?: string
  className?: string
  cardClassName?: string
  useBulletPoints?: boolean
  asChild?: boolean
}

export function ChecklistBlock({
  title,
  items,
  intro,
  className,
  cardClassName,
  useBulletPoints = false,
  asChild = false,
}: ChecklistBlockProps) {
  const cardContent = (
    <div
      className={cn(
        'rounded-standard border bg-card p-6 md:p-8',
        cardClassName
      )}
    >
      {intro && <p className="mb-4 [color:inherit]">{intro}</p>}
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            {useBulletPoints ? (
              <span className="leading-relaxed [color:inherit]">
                • {item.text}
              </span>
            ) : (
              <>
                <span className="mt-0 flex-shrink-0 text-lg font-bold text-brand-primary">
                  ✓
                </span>
                <span className="ml-3 leading-relaxed [color:inherit]">
                  {item.text}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )

  if (asChild) {
    return cardContent
  }

  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-3xl">
          {title && (
            <ScrollReveal direction="up">
              <h2 className="type-heading mb-6 text-center font-bold [color:inherit]">
                {title}
              </h2>
            </ScrollReveal>
          )}
          <ScrollReveal direction="up" delay={100}>
            {cardContent}
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
