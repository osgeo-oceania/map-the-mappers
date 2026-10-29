import { describe, expect, it } from 'vitest'
import {
  canonicalRedirectTarget,
  profilePath,
  profileRouteParam,
  resolveProfileParam,
  slugifyListingName,
} from '@/lib/utils/profile-url'
import sampleData from '@/data/sample-profiles.json'

const ID = '24475184-362d-4fcd-9220-ecd72c1e0dd3'
const providers = [
  { id: ID, listing_name: 'Ngā Taonga Sound & Vision' },
  { id: 'abc', listing_name: 'Auspatious' },
]

describe('slugifyListingName', () => {
  it.each([
    ['Ngā Taonga Sound & Vision', 'nga-taonga-sound-vision'],
    ['Māori  GIS — Ōtautahi', 'maori-gis-otautahi'],
    ['  --Café Géo!  ', 'cafe-geo'],
    ['日本', ''],
  ])('%j -> %j', (name, slug) => {
    expect(slugifyListingName(name)).toBe(slug)
  })
})

describe('profilePath', () => {
  it('puts the slug before the id', () => {
    expect(profilePath(providers[0])).toBe(`/map/nga-taonga-sound-vision-${ID}`)
    expect(profileRouteParam(providers[0])).toBe(
      `nga-taonga-sound-vision-${ID}`
    )
  })

  it('falls back to the bare id when the name has no ASCII', () => {
    expect(profilePath({ id: 'x1', listing_name: '日本' })).toBe('/map/x1')
  })
})

describe('resolveProfileParam', () => {
  it('resolves the bare-id form', () => {
    expect(resolveProfileParam(ID, providers)).toBe(providers[0])
  })

  it('resolves the canonical slug-id form', () => {
    expect(
      resolveProfileParam(profileRouteParam(providers[0]), providers)
    ).toBe(providers[0])
  })

  it('resolves a stale or mismatched slug by id', () => {
    expect(resolveProfileParam(`old-name-${ID}`, providers)).toBe(providers[0])
    expect(resolveProfileParam('wrong-slug-abc', providers)).toBe(providers[1])
  })

  it('decodes the segment and matches case-insensitively on the id', () => {
    expect(
      resolveProfileParam(
        encodeURIComponent(`ngā-${ID.toUpperCase()}`),
        providers
      )
    ).toBe(providers[0])
  })

  it('returns null for unknown ids', () => {
    expect(resolveProfileParam('nobody', providers)).toBeNull()
    expect(resolveProfileParam('auspatious', providers)).toBeNull()
  })
})

describe('overlapping ids', () => {
  const one = { id: '1', listing_name: 'First Listing' }
  const org1 = { id: 'org-1', listing_name: 'Second Listing' }
  // Canonical param of `one2` is a stale-slug form of `listing2`.
  const one2 = { id: '2', listing_name: 'Third Listing' }
  const listing2 = { id: 'listing-2', listing_name: 'Fourth' }

  it.each([
    ['id 1 first', [one, org1]],
    ['org-1 first', [org1, one]],
  ])('resolves each listing regardless of feed order (%s)', (_, feed) => {
    expect(resolveProfileParam('second-listing-org-1', feed)).toBe(org1)
    expect(resolveProfileParam('first-listing-1', feed)).toBe(one)
    expect(resolveProfileParam('1', feed)).toBe(one)
    expect(resolveProfileParam('org-1', feed)).toBe(org1)
    expect(resolveProfileParam('old-name-1', feed)).toBe(one)
    expect(resolveProfileParam('old-name-org-1', feed)).toBeNull()
  })

  it('prefers an exact canonical match over a longer id suffix', () => {
    for (const feed of [
      [one2, listing2],
      [listing2, one2],
    ]) {
      expect(resolveProfileParam('third-listing-2', feed)).toBe(one2)
      expect(resolveProfileParam('fourth-listing-2', feed)).toBe(listing2)
      expect(resolveProfileParam('stale-listing-2', feed)).toBeNull()
    }
  })

  it.each([
    ['short id first', false],
    ['long id first', true],
  ])('rejects ambiguous old URLs after a rename (%s)', (_, reverse) => {
    const renamed = { id: '1', listing_name: 'New Name' }
    const other = { id: 'org-1', listing_name: 'Other' }
    const oldParam = profileRouteParam({ ...renamed, listing_name: 'Old Org' })
    const feed = reverse ? [other, renamed] : [renamed, other]
    expect(resolveProfileParam(oldParam, feed)).toBeNull()
    expect(resolveProfileParam('new-name-1', feed)).toBe(renamed)
    expect(resolveProfileParam('other-org-1', feed)).toBe(other)
    expect(resolveProfileParam('1', feed)).toBe(renamed)
    expect(resolveProfileParam('org-1', feed)).toBe(other)
  })

  it.each([
    ['the sample fixture', sampleData],
    ['an overlapping-ids fixture', [one, org1, one2, listing2]],
    ['the overlapping-ids fixture reversed', [listing2, one2, org1, one]],
  ])('every canonical URL resolves to its own listing (%s)', (_, feed) => {
    for (const p of feed) {
      expect(resolveProfileParam(profileRouteParam(p), feed), p.id).toBe(p)
    }
  })
})

describe('canonicalRedirectTarget', () => {
  const p = { id: 'org-1', listing_name: 'Second Listing' }

  it('returns null for the canonical param', () => {
    expect(canonicalRedirectTarget('second-listing-org-1', p, false)).toBeNull()
    expect(canonicalRedirectTarget('second-listing-org-1', p, true)).toBeNull()
  })

  it('redirects stale slugs and bare ids to the canonical URL', () => {
    expect(canonicalRedirectTarget('old-name-org-1', p, false)).toBe(
      '/map/second-listing-org-1'
    )
    expect(canonicalRedirectTarget('org-1', p, false)).toBe(
      '/map/second-listing-org-1'
    )
  })

  it('preserves demo mode', () => {
    expect(canonicalRedirectTarget('old-name-org-1', p, true)).toBe(
      '/map/second-listing-org-1?mode=demo'
    )
  })
})
