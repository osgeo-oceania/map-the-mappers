import type { Profile } from '@/types/profile'
import { profilePath } from '@/lib/utils/profile-url'
import { SITE_URL } from '@/lib/constants'

/** Listing schemas use Organization and city/country text; pin coordinates are omitted for privacy. */

const SITE_NAME = 'OSGeo Oceania OSS Capabilities Map'

export function siteSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          'Interactive map and directory of open source geospatial contributors and providers across Oceania',
        publisher: { '@id': `${SITE_URL}/#publisher` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#publisher`,
        name: 'OSGeo Oceania',
        url: 'https://osgeo-oceania.org',
        logo: `${SITE_URL}/osgeo-oceania-logo-blue.png`,
      },
    ],
  }
}

export function organizationSchema(profile: Profile) {
  const pageUrl = `${SITE_URL}${profilePath(profile)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': pageUrl,
    mainEntityOfPage: pageUrl,
    name: profile.listing_name,
    description: profile.short_description,
    ...(profile.primary_url ? { url: profile.primary_url } : {}),
    ...(profile.contact_url ? { sameAs: [profile.contact_url] } : {}),
    ...(profile.logo_url
      ? {
          logo: profile.logo_url.startsWith('http')
            ? profile.logo_url
            : `${SITE_URL}${profile.logo_url}`,
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      ...(profile.city_region ? { addressLocality: profile.city_region } : {}),
      addressCountry: profile.country,
    },
    ...(profile.capability_areas.length
      ? { knowsAbout: profile.capability_areas }
      : {}),
  }
}

export function breadcrumbSchema(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Map',
        item: `${SITE_URL}/map`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile.listing_name,
        item: `${SITE_URL}${profilePath(profile)}`,
      },
    ],
  }
}

// Cap the directory schema to bound page size.
const ITEM_LIST_CAP = 100

/** Fictional listings emit no listing-specific schemas. */
export function listingSchemas(profile: Profile, sample: boolean) {
  return sample ? [] : [organizationSchema(profile), breadcrumbSchema(profile)]
}

export function itemListSchema(profiles: Profile[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: SITE_NAME,
    numberOfItems: profiles.length,
    itemListElement: profiles.slice(0, ITEM_LIST_CAP).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.listing_name,
      url: `${SITE_URL}${profilePath(p)}`,
    })),
  }
}
