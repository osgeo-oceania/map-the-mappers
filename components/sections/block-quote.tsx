import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface BlockQuoteProps {
  content: string | React.ReactNode
  className?: string
}

export function BlockQuote({ content, className }: BlockQuoteProps) {
  return (
    <section
      className={cn('bg-brand-secondary px-4 py-20 md:py-24', className)}
    >
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up">
            <div className="rounded-standard border-2 border-accentColors-skyBlue bg-brand-secondary p-8 md:p-12">
              <blockquote className="text-xl italic leading-relaxed text-accentColors-skyBlue md:text-2xl">
                {typeof content === 'string' ? (
                  <p>&quot;{content}&quot;</p>
                ) : (
                  <div className="[&_p]:text-xl [&_p]:italic [&_p]:leading-relaxed [&_p]:text-accentColors-skyBlue [&_p]:md:text-2xl">
                    {content}
                  </div>
                )}
              </blockquote>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
