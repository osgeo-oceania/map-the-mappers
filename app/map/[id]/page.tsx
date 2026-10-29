import type { Metadata } from 'next'
import Link from 'next/link'
import { getDataMode, getProviders, isSampleData } from '@/lib/data/providers'
import { notFound, redirect } from 'next/navigation'
import {
  canonicalRedirectTarget,
  profilePath,
  resolveProfileParam,
} from '@/lib/utils/profile-url'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileDetails } from '@/components/profile/profile-details'
import { MiniMap } from '@/components/profile/mini-map'
import { SampleDataNotice } from '@/components/directory/sample-data-notice'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { JsonLd } from '@/components/seo/json-ld'
import { listingSchemas } from '@/lib/seo/schema'
import { listingRobots } from '@/lib/seo/indexing'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mode?: string }>
}

const SITE_NAME = 'OSGeo Oceania OSS Capabilities Map'

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const demo = (await searchParams)?.mode === 'demo'
  const provider = resolveProfileParam(id, await getProviders(demo))

  const robots = listingRobots(demo)
  if (!provider) return robots

  const location = [provider.city_region, provider.country]
    .filter(Boolean)
    .join(', ')
  const title = [provider.listing_name, location, SITE_NAME]
    .filter(Boolean)
    .join(' — ')

  return {
    ...robots,
    title,
    description: provider.short_description || undefined,
    alternates: { canonical: profilePath(provider) },
  }
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const demo = (await searchParams)?.mode === 'demo'
  const sample = isSampleData(demo)
  const allProviders = await getProviders(demo)
  const provider = resolveProfileParam(id, allProviders)

  if (!provider) {
    notFound()
  }

  // Use a temporary redirect because the canonical slug can change after a rename.
  const target = canonicalRedirectTarget(id, provider, demo)
  if (target) {
    redirect(target)
  }

  return (
    <>
      {listingSchemas(provider, sample).map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      {sample && <SampleDataNotice liveMap={getDataMode() !== 'sample'} />}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ScrollReveal direction="up" className="order-2 lg:order-1">
            <div className="h-full min-h-[400px] overflow-hidden rounded-standard border">
              <MiniMap
                latitude={provider.lat}
                longitude={provider.lon}
                name={provider.listing_name}
                allProviders={allProviders}
                demo={demo}
              />
            </div>
          </ScrollReveal>

          <div className="order-1 lg:order-2">
            <ProfileHeader provider={provider} />
          </div>
        </div>

        <ProfileDetails provider={provider} />
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
                  <div className="space-y-2 text-brand-secondary">
                    <p className="text-lg text-brand-secondary">
                      If you (or your organisation) are contributing to or
                      building with open source geospatial in Oceania, you
                      belong here.
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
    </>
  )
}
