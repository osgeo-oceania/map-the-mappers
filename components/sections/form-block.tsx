import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface FormBlockProps {
  title?: string
  embedUrl?: string
  placeholder?: string
  className?: string
}

export function FormBlock({
  title,
  embedUrl,
  placeholder = 'Form embed placeholder - Google Form will be embedded here',
  className,
}: FormBlockProps) {
  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-5xl">
          {title && (
            <ScrollReveal direction="up">
              <h2 className="type-heading mb-8 text-center font-bold text-brand-secondary">
                {title}
              </h2>
            </ScrollReveal>
          )}
          <ScrollReveal direction="up" delay={100}>
            <div className="rounded-standard border bg-card p-4 md:p-6 lg:p-8">
              {embedUrl ? (
                <div className="w-full overflow-hidden rounded-standard">
                  <div className="relative w-full" style={{ height: '800px' }}>
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      marginHeight={0}
                      marginWidth={0}
                      title={title || 'Registration form'}
                      className="h-full w-full"
                      loading="lazy"
                      style={{ border: 'none' }}
                    >
                      Loading…
                    </iframe>
                  </div>
                </div>
              ) : (
                <div className="rounded-standard border-2 border-dashed bg-muted/50 p-12 text-center">
                  <p className="text-lg text-muted-foreground">{placeholder}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Google Form will be embedded here
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
