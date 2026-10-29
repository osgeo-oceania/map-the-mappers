import { cn } from '@/lib/utils'

interface InfoSectionProps {
  title?: string
  content: React.ReactNode
  image?: {
    src?: string
    alt: string
    position?: 'left' | 'right'
  }
  quote?: {
    text: string
    author?: string
  }
  className?: string
}

export function InfoSection({
  title,
  content,
  image,
  quote,
  className,
}: InfoSectionProps) {
  const imagePosition = image?.position || 'left'

  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        {title && (
          <h2 className="type-heading mb-8 text-center font-bold text-brand-secondary">
            {title}
          </h2>
        )}

        <div
          className={cn(
            'grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12',
            imagePosition === 'right' && 'md:grid-flow-dense'
          )}
        >
          {image && (
            <div
              className={cn(
                'order-1',
                imagePosition === 'right' && 'md:order-2'
              )}
            >
              {image.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-auto w-full rounded-standard"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-standard bg-muted">
                  <span className="text-muted-foreground">
                    Image placeholder
                  </span>
                </div>
              )}
            </div>
          )}

          <div
            className={cn(
              'order-2',
              imagePosition === 'right' && 'md:order-1',
              'space-y-6'
            )}
          >
            {content && (
              <div className="prose prose-slate dark:prose-invert max-w-none text-brand-secondary [&_*]:text-brand-secondary">
                {content}
              </div>
            )}
            {quote && (
              <div className="rounded-standard border bg-card p-8">
                <blockquote className="mb-4 text-xl italic text-muted-foreground">
                  &quot;{quote.text}&quot;
                </blockquote>
                {quote.author && (
                  <cite className="text-sm font-medium not-italic">
                    — {quote.author}
                  </cite>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
