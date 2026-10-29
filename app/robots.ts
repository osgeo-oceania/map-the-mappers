import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

/** Allow crawlers to fetch retired routes so their 404/noindex responses can remove them from indexes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
