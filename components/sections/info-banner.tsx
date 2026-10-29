import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface InfoBannerProps {
  content: string | React.ReactNode
  className?: string
  cardClassName?: string
  iconClassName?: string
}

export function InfoBanner({
  content,
  className,
  cardClassName,
  iconClassName,
}: InfoBannerProps) {
  return (
    <section className={cn('px-4 py-8', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up">
            <div
              className={cn(
                'flex gap-4 rounded-standard bg-accentColors-skyBlue p-6',
                cardClassName
              )}
            >
              <Info
                className={cn(
                  'mt-0.5 h-5 w-5 flex-shrink-0 text-brand-secondary',
                  iconClassName
                )}
              />
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm [&_*]:[color:inherit]">
                {typeof content === 'string' ? (
                  <p className="text-brand-secondary">{content}</p>
                ) : (
                  content
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
