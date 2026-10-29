import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CtaBannerProps {
  title: string
  subtitle?: string
  primaryCta?: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  className?: string
}

export function CtaBanner({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  className,
}: CtaBannerProps) {
  return (
    <section className={`bg-muted/50 px-4 py-16 ${className || ''}`}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="type-heading mb-4 font-bold text-brand-secondary">
            {title}
          </h2>
          {subtitle && (
            <p className="mb-8 text-lg text-muted-foreground">{subtitle}</p>
          )}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {primaryCta && (
              <Button
                asChild
                size="lg"
                className="border-0 bg-accentColors-lime text-brand-secondary hover:bg-accentColors-lime/90"
              >
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
            )}
            {secondaryCta && (
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="border border-brand-secondary text-brand-secondary"
              >
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="flex h-64 w-full max-w-2xl items-center justify-center rounded-standard bg-muted">
            <span className="text-muted-foreground">
              Illustration placeholder
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
