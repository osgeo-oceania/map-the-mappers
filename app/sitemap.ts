import type { MetadataRoute } from 'next'
import { getProviders, isSampleData } from '@/lib/data/providers'
import { profilePath } from '@/lib/utils/profile-url'
import { SITE_URL } from '@/lib/constants'

// Revalidate so hosted listings are not frozen at build time.
export const revalidate = 3600

const STATIC_PATHS = [
  '/',
  '/map',
  '/about',
  '/submit',
  '/listing-criteria',
  '/submission-requirements',
  '/feedback',
  '/terms-and-privacy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sample = isSampleData(false)
  const staticPaths = sample
    ? STATIC_PATHS.filter((path) => path !== '/map')
    : STATIC_PATHS
  const providers = sample ? [] : await getProviders(false)
  return [
    ...staticPaths.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...providers.map((p) => ({ url: `${SITE_URL}${profilePath(p)}` })),
  ]
}
