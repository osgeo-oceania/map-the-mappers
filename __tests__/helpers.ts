import type { Profile } from '@/types/profile'

/** A minimal record that satisfies the contract; override fields per test. */
export function validRecord(overrides: Record<string, unknown> = {}) {
  const base: Profile = {
    id: 'id-1',
    listing_name: 'Example Geo',
    profile_type: ['Organisation'],
    country: 'New Zealand',
    city_region: 'Wellington',
    lat: -41.2865,
    lon: 174.7762,
    contact_url: 'https://example.org/contact',
    primary_url: 'https://example.org',
    short_description: 'Short.',
    longer_about: 'Longer.',
    oss_projects: [{ name: 'QGIS', url: 'https://qgis.org' }],
    capability_areas: ['Web mapping'],
  }
  return { ...base, ...overrides }
}
