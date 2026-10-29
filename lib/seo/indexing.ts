import type { Metadata } from 'next'
import { isSampleData } from '@/lib/data/providers'

/** Fictional listing pages are noindex; real listings inherit the site defaults. */
export function listingRobots(demo: boolean): Pick<Metadata, 'robots'> {
  return isSampleData(demo) ? { robots: { index: false, follow: false } } : {}
}
