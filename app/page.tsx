import Link from 'next/link'
import { HeroSection } from '@/components/sections/hero-section'
import { FeatureList } from '@/components/sections/feature-list'
import { ImageBlock } from '@/components/sections/image-block'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection
        title="Mapping open source geospatial capability across Oceania"
        subtitle="A public directory of the people, projects, and organisations contributing to and building with OSGeo tools in our region."
        primaryCta={{ label: 'Submit a listing', href: '/submit' }}
        secondaryCta={{ label: 'Explore the map', href: '/map' }}
      />

      <section className="bg-neutral-offWhite px-4 pb-20 pt-0">
        <div className="container mx-auto max-w-container">
          <div className="flex flex-col items-center">
            <div className="max-w-4xl space-y-6 text-center">
              <ScrollReveal direction="up" delay={100}>
                <div className="space-y-4 leading-relaxed text-brand-secondary">
                  <p className="text-xl md:text-2xl">
                    The OSS Capabilities Map is a community‑driven project by{' '}
                    <span className="font-medium text-brand-secondary">
                      OSGeo Oceania
                    </span>
                    .
                  </p>
                  <p className="text-base md:text-lg">
                    Our goal is simple: to recognise and connect the people and
                    organisations contributing to open source geospatial work
                    across Oceania.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={200}>
                <div className="flex justify-center">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/about">About Project</Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <div>
        <FeatureList
          title="What's on the map"
          features={[
            {
              image: '/business-illustration.png',
              title: 'Contributors & organisations',
              description:
                'People and teams contributing to and building with open source geospatial in Oceania.',
            },
            {
              image: '/profile-illustration.png',
              title: 'Capabilities you can find',
              description:
                'Search and filter by location, profile type, and capability area to find the skills you need.',
            },
            {
              image: '/map-ui-illustration.png',
              title: 'One view of the region',
              description:
                "The region's open source geospatial capability, together in one place.",
            },
          ]}
          className="bg-brand-secondary"
          equalHeightCards={true}
        />
      </div>

      <div className="bg-brand-secondary">
        <ImageBlock
          images={[
            { src: '/2024-foss4g-cropped.png', alt: 'OSS Capabilities Map' },
          ]}
          className="bg-brand-secondary"
        />
      </div>

      <section className="flex bg-accentColors-lime px-4 py-20 md:min-h-[600px] md:items-center md:py-24">
        <div className="container mx-auto w-full max-w-container">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-12">
            <div className="max-w-3xl flex-1 text-center">
              <ScrollReveal direction="up">
                <h2 className="type-section mb-4 font-bold text-brand-secondary">
                  Are you on the map?
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <div className="prose prose-slate dark:prose-invert mb-6 max-w-none text-brand-secondary [&_*]:text-brand-secondary">
                  <div className="space-y-4 text-brand-secondary">
                    <p className="text-lg text-brand-secondary">
                      If you (or your organisation) are actively working with
                      open source geospatial in Oceania — contributing to it,
                      providing services around it, or using it in your projects
                      — you belong here.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <div className="flex flex-col items-center md:block">
                <ScrollReveal direction="up" delay={200}>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="mb-6 md:mb-0"
                  >
                    <Link href="/submit">Submit a listing</Link>
                  </Button>
                </ScrollReveal>
              </div>
            </div>
            <ScrollReveal direction="up" delay={300} className="shrink-0">
              <div className="h-auto w-[200px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/get-involved.png"
                  alt="Add yourself to the map"
                  className="h-auto w-full rounded-standard"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="py-16 md:py-20">
        <ImageBlock
          images={[
            { src: '/2019-foss4g.png', alt: 'OSS Capabilities Map 2019' },
            { src: '/2022-foss4g.png', alt: 'OSS Capabilities Map 2022' },
          ]}
          className="bg-background"
        />
      </div>

      <section className="flex overflow-hidden bg-accentColors-skyBlue px-4 py-20 md:min-h-[500px] md:items-center md:py-24">
        <div className="container mx-auto w-full max-w-container">
          <div className="flex flex-col items-center gap-8 xl:flex-row xl:items-end xl:gap-12">
            <div className="max-w-3xl flex-1 text-center">
              <ScrollReveal direction="up">
                <h2 className="type-section mb-4 font-bold text-brand-secondary">
                  New to open source geospatial?
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <p className="mb-6 text-lg text-brand-secondary">
                  Want to get involved? OSGeo Oceania — the regional chapter —
                  runs events, projects, and volunteering across the region.
                  Everyone&apos;s welcome, wherever you&apos;re starting from.
                </p>
              </ScrollReveal>
              <div className="flex flex-col items-center md:block">
                <ScrollReveal direction="up" delay={200}>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="mb-6 md:mb-0"
                  >
                    <a
                      href="https://osgeo-oceania.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get involved
                    </a>
                  </Button>
                </ScrollReveal>
              </div>
            </div>
            <ScrollReveal
              direction="up"
              delay={300}
              className="shrink-0 xl:order-first"
            >
              <div className="h-auto w-[220px] xl:-mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/trailor-illustration.png"
                  alt="A person in a wheelchair towing a map trailer"
                  className="h-auto w-full xl:-scale-x-100"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}
