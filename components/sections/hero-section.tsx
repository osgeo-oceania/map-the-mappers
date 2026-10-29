import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface HeroSectionProps {
  title: string
  subtitle: string
  primaryCta?: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
}

export function HeroSection({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  return (
    <section className="relative bg-neutral-offWhite px-4 pb-8 pt-24 md:pb-16 md:pt-24">
      <div className="container relative mx-auto max-w-container">
        {/* Keep the positioner outside ScrollReveal; transforms change the containing block. */}
        <div className="flex flex-col items-center gap-8 xl:relative xl:block xl:gap-0">
          <div className="mx-auto max-w-4xl text-center">
            <ScrollReveal direction="up">
              <h1 className="type-display mb-6 font-heading font-medium text-brand-secondary">
                {title}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <p className="mb-8 text-xl leading-relaxed text-brand-secondary md:text-2xl">
                {subtitle}
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                {primaryCta && (
                  <Button asChild variant="outline" size="lg">
                    <Link href={primaryCta.href}>{primaryCta.label}</Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="bg-accentColors-lime text-brand-secondary hover:bg-accentColors-lime"
                  >
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            </ScrollReveal>
          </div>
          <div className="hidden xl:absolute xl:right-4 xl:top-full xl:block xl:-translate-y-1/2">
            <ScrollReveal direction="left" delay={300}>
              <Image
                src="/hero-illustration.png"
                alt="Three people in a boat with a map sail"
                width={250}
                height={250}
                className="h-auto w-[250px] object-contain"
                priority
              />
            </ScrollReveal>
          </div>
          <ScrollReveal direction="up" delay={300} className="xl:hidden">
            <Image
              src="/hero-illustration.png"
              alt="Three people in a boat with a map sail"
              width={250}
              height={250}
              className="h-auto w-[250px] object-contain"
              priority
            />
          </ScrollReveal>
        </div>
        <div className="mb-0 mt-16 md:mt-[200px]">
          <ScrollReveal direction="up" delay={400}>
            <div className="mx-auto flex max-h-[600px] w-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/product-promo.png"
                alt="The OSS Capabilities Map: a directory of listings beside an interactive map of Oceania"
                className="h-full max-h-[600px] w-auto rounded-standard object-contain shadow-[0_4px_4px_rgba(24,49,56,0.1)]"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
