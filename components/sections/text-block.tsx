import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface TextBlockProps {
  content: string | React.ReactNode
  title?: string
  subtitle?: string
  cta?: {
    label: string
    href: string
    variant?: 'outline' | 'secondary'
  }
  className?: string
  titleAlign?: 'left' | 'center'
  ctaAlign?: 'left' | 'center'
  children?: React.ReactNode
  illustration?: string
  illustrationAlt?: string
}

export function TextBlock({
  content,
  title,
  subtitle,
  cta,
  className,
  titleAlign = 'center',
  ctaAlign = 'center',
  children,
  illustration,
  illustrationAlt,
}: TextBlockProps) {
  const isExternalLink = cta?.href?.startsWith('http')
  const ctaVariant = cta?.variant || 'outline'

  // Join the coloured section to the preceding hero.
  const hasSkyBlueBg = className?.includes('bg-accentColors-skyBlue')
  const hasLimeBg = className?.includes('bg-accentColors-lime')
  const hasHeroBg = hasSkyBlueBg || hasLimeBg
  const hasIllustration = !!illustration

  return (
    <section
      className={cn(
        'relative px-4',
        hasHeroBg
          ? hasIllustration
            ? 'py-32 md:min-h-[400px] md:py-40'
            : 'pb-20 pt-32 md:pt-40'
          : 'py-20 md:py-24',
        className
      )}
    >
      <div className="container relative mx-auto max-w-container">
        <div
          className={cn(
            'relative z-10 mx-auto',
            titleAlign === 'left'
              ? hasIllustration
                ? 'max-w-5xl md:pr-[240px]'
                : 'max-w-5xl'
              : 'max-w-3xl'
          )}
        >
          {title && (
            <ScrollReveal direction="up">
              <h1
                className={cn(
                  'mb-8 font-heading text-4xl font-medium [color:inherit] md:text-6xl',
                  titleAlign === 'left' ? 'text-left' : 'text-center'
                )}
              >
                {title}
              </h1>
            </ScrollReveal>
          )}
          <div className="prose prose-slate dark:prose-invert max-w-none text-brand-secondary [&_*]:text-brand-secondary">
            {typeof content === 'string' ? (
              <ScrollReveal direction="up" delay={100}>
                <p className="text-xl leading-relaxed text-brand-secondary md:text-2xl">
                  {content}
                </p>
              </ScrollReveal>
            ) : (
              <ScrollReveal direction="up" delay={100}>
                <div className="text-xl leading-relaxed md:text-2xl [&_p]:text-xl [&_p]:leading-relaxed [&_p]:md:text-2xl">
                  {content}
                </div>
              </ScrollReveal>
            )}
          </div>
          {subtitle && (
            <ScrollReveal direction="up" delay={150}>
              <h2
                className={cn(
                  'mb-4 mt-8 text-2xl font-bold [color:inherit] md:text-3xl',
                  titleAlign === 'left' ? 'text-left' : 'text-center'
                )}
              >
                {subtitle}
              </h2>
            </ScrollReveal>
          )}
          {children && (
            <ScrollReveal direction="up" delay={200}>
              {children}
            </ScrollReveal>
          )}
          {cta && (
            <ScrollReveal direction="up" delay={200}>
              <div
                className={cn(
                  'mt-6',
                  ctaAlign === 'left' ? 'text-left' : 'text-center'
                )}
              >
                {isExternalLink ? (
                  <Button asChild variant={ctaVariant} size="lg">
                    <a
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      {cta.label}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant={ctaVariant} size="lg">
                    <Link href={cta.href}>{cta.label}</Link>
                  </Button>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
        {illustration && (
          <ScrollReveal direction="left" delay={300}>
            <div className="hidden h-auto md:absolute md:bottom-0 md:right-4 md:block md:w-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illustration}
                alt={illustrationAlt || 'Illustration'}
                className="h-auto w-full scale-x-[-1] object-contain"
              />
            </div>
            <div className="mx-auto mt-6 h-auto w-[200px] md:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={illustration}
                alt={illustrationAlt || 'Illustration'}
                className="h-auto w-full scale-x-[-1] object-contain"
              />
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
