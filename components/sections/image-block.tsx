import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface ImageBlockProps {
  images: Array<{
    src: string
    alt: string
  }>
  className?: string
}

export function ImageBlock({ images, className }: ImageBlockProps) {
  const isDouble = images.length === 2
  // Join consecutive sections with the same background.
  const hasSecondaryBg =
    className?.includes('bg-secondary') ||
    className?.includes('bg-brand-secondary')

  return (
    <section
      className={cn(
        'px-4',
        hasSecondaryBg ? 'pb-24 pt-16 md:pb-32' : 'pb-24 pt-16 md:pb-32',
        className
      )}
    >
      <div className="container mx-auto max-w-container">
        {isDouble ? (
          <ScrollReveal direction="up">
            <div
              className={cn(
                'grid gap-6 md:gap-8',
                'grid-cols-1 md:h-96 md:grid-cols-2'
              )}
            >
              {images.map((image, index) => (
                <div key={index} className={cn('h-64 w-full md:h-full')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full rounded-standard object-cover"
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>
        ) : (
          <div className={cn('grid gap-8', 'grid-cols-1')}>
            {images.map((image, index) => (
              <ScrollReveal key={index} direction="up">
                <div
                  className={cn(
                    'flex h-64 w-full items-center justify-center overflow-hidden rounded-standard bg-transparent md:h-[600px]'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="max-h-full max-w-full rounded-standard object-contain"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
