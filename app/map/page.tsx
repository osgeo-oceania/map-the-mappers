import type { Metadata } from 'next'
import { DirectoryView } from '@/components/directory/directory-view'
import { JsonLd } from '@/components/seo/json-ld'
import { itemListSchema } from '@/lib/seo/schema'
import { SampleDataNotice } from '@/components/directory/sample-data-notice'
import { listingRobots } from '@/lib/seo/indexing'
import {
  getDataMode,
  getProviders,
  getProfileTypes,
  getCapabilityAreas,
  getCountries,
  isSampleData,
} from '@/lib/data/providers'

interface MapPageProps {
  searchParams: Promise<{ mode?: string }>
}

export async function generateMetadata({
  searchParams,
}: MapPageProps): Promise<Metadata> {
  return listingRobots((await searchParams)?.mode === 'demo')
}

export default async function DirectoryPage({ searchParams }: MapPageProps) {
  const demo = (await searchParams)?.mode === 'demo'
  const sample = isSampleData(demo)
  const [providers, profileTypes, capabilityAreas, countries] =
    await Promise.all([
      getProviders(demo),
      getProfileTypes(demo),
      getCapabilityAreas(demo),
      getCountries(demo),
    ])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {!sample && <JsonLd data={itemListSchema(providers)} />}
      {sample && <SampleDataNotice liveMap={getDataMode() !== 'sample'} />}
      <div className="min-h-0 flex-1">
        <DirectoryView
          initialProviders={providers}
          profileTypes={profileTypes}
          capabilityAreas={capabilityAreas}
          countries={countries}
          demo={demo}
        />
      </div>
    </div>
  )
}
