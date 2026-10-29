import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface TwoColumnTextProps {
  title: string
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
  leftSubtitle?: string
  rightSubtitle?: string
  className?: string
  titleColor?: string
  useCards?: boolean
}

export function TwoColumnText({
  title,
  leftColumn,
  rightColumn,
  leftSubtitle,
  rightSubtitle,
  className,
  titleColor,
  useCards = false,
}: TwoColumnTextProps) {
  return (
    <section
      className={cn(
        'px-4 py-16 md:flex md:min-h-[600px] md:items-center',
        className
      )}
    >
      <div className="container mx-auto w-full max-w-container">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up" className="mb-20">
            <h2
              className={cn(
                'text-center text-3xl font-bold',
                className?.includes('text-neutral-offWhite')
                  ? 'text-neutral-offWhite'
                  : titleColor === 'accentColors-skyBlue'
                    ? 'text-accentColors-skyBlue'
                    : '[color:inherit]'
              )}
            >
              {title}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <ScrollReveal direction="up" delay={100}>
              {useCards ? (
                <div className="flex h-full flex-col rounded-standard bg-neutral-offWhite p-6">
                  <div
                    className={cn(
                      'prose prose-slate dark:prose-invert max-w-none text-brand-secondary [&_*]:text-brand-secondary'
                    )}
                  >
                    {leftSubtitle && (
                      <h3 className="mb-3 text-lg font-semibold text-brand-secondary">
                        {leftSubtitle}
                      </h3>
                    )}
                    {leftColumn}
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'prose prose-slate dark:prose-invert max-w-none',
                    className?.includes('text-neutral-offWhite')
                      ? 'text-neutral-offWhite [&_*]:text-neutral-offWhite'
                      : 'text-brand-secondary [&_*]:text-brand-secondary'
                  )}
                >
                  {leftSubtitle && (
                    <h3
                      className={cn(
                        'mb-3 font-semibold',
                        className?.includes('text-neutral-offWhite')
                          ? 'text-neutral-offWhite'
                          : '!text-accentColors-skyBlue'
                      )}
                    >
                      {leftSubtitle}
                    </h3>
                  )}
                  {leftColumn}
                </div>
              )}
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              {useCards ? (
                <div className="flex h-full flex-col rounded-standard bg-neutral-offWhite p-6">
                  <div
                    className={cn(
                      'prose prose-slate dark:prose-invert max-w-none text-brand-secondary [&_*]:text-brand-secondary'
                    )}
                  >
                    {rightSubtitle && (
                      <h3 className="mb-3 text-lg font-semibold text-brand-secondary">
                        {rightSubtitle}
                      </h3>
                    )}
                    {rightColumn}
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'prose prose-slate dark:prose-invert max-w-none',
                    className?.includes('text-neutral-offWhite')
                      ? 'text-neutral-offWhite [&_*]:text-neutral-offWhite'
                      : 'text-brand-secondary [&_*]:text-brand-secondary'
                  )}
                >
                  {rightSubtitle && (
                    <h3
                      className={cn(
                        'mb-3 font-semibold',
                        className?.includes('text-neutral-offWhite')
                          ? 'text-neutral-offWhite'
                          : '!text-accentColors-skyBlue'
                      )}
                    >
                      {rightSubtitle}
                    </h3>
                  )}
                  {rightColumn}
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
