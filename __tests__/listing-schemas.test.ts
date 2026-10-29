import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { JsonLd } from '@/components/seo/json-ld'
import { listingSchemas } from '@/lib/seo/schema'
import type { Profile } from '@/types/profile'

const profile: Profile = {
  id: 'abc-123',
  listing_name: 'Example Geo',
  profile_type: ['Service provider / consultancy'],
  country: 'Australia',
  city_region: 'Hobart',
  lat: -42.9,
  lon: 147.3,
  contact_url: 'https://example-geo.example.org/contact',
  primary_url: 'https://example-geo.example.org',
  short_description: 'Fictional.',
  longer_about: 'Fictional.',
  oss_projects: [],
  capability_areas: ['Web mapping & web applications'],
}

function render(sample: boolean) {
  return listingSchemas(profile, sample)
    .map((data) => renderToStaticMarkup(createElement(JsonLd, { data })))
    .join('')
}

describe('profile page structured data', () => {
  it('emits an Organization and a BreadcrumbList for real listings', () => {
    const html = render(false)
    expect(html).toContain('"@type":"Organization"')
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html).toContain('"name":"Example Geo"')
  })

  it('emits no listing-specific structured data for fictional listings', () => {
    expect(render(true)).toBe('')
  })
})
