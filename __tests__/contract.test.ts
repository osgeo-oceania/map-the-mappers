import { describe, expect, it } from 'vitest'
import { numericCell, parseProfiles, PRIVATE_FIELDS } from '@/lib/data/contract'
import sampleData from '@/data/sample-profiles.json'
import { validRecord } from './helpers'

describe('parseProfiles', () => {
  it('accepts a valid set and the bundled sample data', () => {
    const set = [validRecord(), validRecord({ id: 'id-2' })]
    expect(parseProfiles(set)).toEqual({ profiles: set, errors: [] })

    const result = parseProfiles(sampleData, { rejectPrivateFields: true })
    expect(result.errors).toEqual([])
    expect(result.profiles).toHaveLength(sampleData.length)
  })

  it('accepts an empty array (an empty directory is a valid feed)', () => {
    expect(parseProfiles([])).toEqual({ profiles: [], errors: [] })
  })

  it.each([
    [{}, 'object'],
    [null, 'null'],
    ['[]', 'string'],
    [42, 'number'],
  ])('rejects a non-array body (%j)', (input, kind) => {
    expect(parseProfiles(input)).toEqual({
      profiles: [],
      errors: [`expected an array of profiles, got ${kind}`],
    })
  })

  it('reports [null] instead of throwing', () => {
    expect(parseProfiles([null])).toEqual({
      profiles: [],
      errors: ['[0]: expected an object, got null'],
    })
  })

  it('rejects missing coordinates', () => {
    const rec: Record<string, unknown> = validRecord()
    delete rec.lat
    delete rec.lon
    const { profiles, errors } = parseProfiles([rec])
    expect(profiles).toEqual([])
    expect(errors).toEqual([
      '[0] (id-1): "lat" is missing or blank',
      '[0] (id-1): "lon" is missing or blank',
    ])
  })

  it('rejects coordinates that are strings, non-finite or out of range', () => {
    const { errors } = parseProfiles([
      validRecord({ id: 'a', lat: '-41.2' }),
      validRecord({ id: 'b', lat: 999 }),
      validRecord({ id: 'c', lon: -180.5 }),
      validRecord({ id: 'd', lat: Number.NaN }),
    ])
    expect(errors).toEqual([
      '[0] (a): "lat" must be a number, got "-41.2"',
      '[1] (b): "lat" 999 is outside -90..90',
      '[2] (c): "lon" -180.5 is outside -180..180',
      '[3] (d): "lat" must be finite',
    ])
  })

  it('accepts the coordinate range boundaries', () => {
    const set = [
      validRecord({ id: 'a', lat: 90, lon: 180 }),
      validRecord({ id: 'b', lat: -90, lon: -180 }),
    ]
    expect(parseProfiles(set).errors).toEqual([])
  })

  it('rejects duplicate ids', () => {
    const { profiles, errors } = parseProfiles([
      validRecord({ id: 'same' }),
      validRecord({ id: 'same', listing_name: 'Other' }),
    ])
    expect(profiles).toHaveLength(1)
    expect(errors).toEqual(['[1] (same): duplicate id "same"'])
  })

  it.each([
    ['canonical owner first', [0, 1]],
    ['id owner first', [1, 0]],
  ])(
    'rejects a canonical URL that equals another listing id (%s)',
    (_, order) => {
      const pair = [
        validRecord({ id: '1', listing_name: 'Org' }),
        validRecord({ id: 'org-1', listing_name: 'Other' }),
      ]
      const { errors } = parseProfiles(order.map((i) => pair[i]))
      expect(errors).toEqual([
        'listing "Org" (1): canonical URL /map/org-1 is also the id of listing "Other" (org-1)',
      ])
    }
  )

  it.each([
    ['short id first', [0, 1]],
    ['long id first', [1, 0]],
  ])('rejects duplicate canonical URLs (%s)', (_, order) => {
    const pair = [
      validRecord({ id: '1', listing_name: 'Example Org' }),
      validRecord({ id: 'org-1', listing_name: 'Example' }),
    ]
    const { errors } = parseProfiles(order.map((i) => pair[i]))
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain(
      'canonical URL /map/example-org-1 is also the canonical URL'
    )
  })

  it('accepts overlapping ids that still resolve uniquely', () => {
    const { errors } = parseProfiles([
      validRecord({ id: '1', listing_name: 'First Listing' }),
      validRecord({ id: 'org-1', listing_name: 'Second Listing' }),
    ])
    expect(errors).toEqual([])
  })

  it('requires id, listing_name and a non-empty profile_type', () => {
    const { errors } = parseProfiles([
      validRecord({ id: '  ', listing_name: '', profile_type: [] }),
      validRecord({ id: 'b', profile_type: ['ok', ''] }),
    ])
    expect(errors).toEqual([
      '[0]: "id" must be a non-empty string',
      '[0]: "listing_name" must be a non-empty string',
      '[0]: "profile_type" must be a non-empty array of non-empty strings',
      '[1] (b): "profile_type" must be a non-empty array of non-empty strings',
    ])
  })

  it('checks array and string field shapes', () => {
    const { errors } = parseProfiles([
      validRecord({
        capability_areas: 'Web mapping',
        oss_projects: [{ name: 'QGIS' }],
        logo_url: 7,
        country: undefined,
      }),
    ])
    expect(errors).toEqual([
      '[0] (id-1): "country" must be a string',
      '[0] (id-1): "capability_areas" must be an array of strings',
      '[0] (id-1): oss_projects[0] must be { name: string, url: string }',
      '[0] (id-1): "logo_url" must be a string when present',
    ])
  })

  it('allows empty optional strings and drops all-empty OSS projects', () => {
    const { profiles, errors } = parseProfiles([
      validRecord({
        contact_url: '',
        longer_about: '',
        oss_projects: [{ name: '', url: '' }],
        logo_url: '',
      }),
    ])
    expect(errors).toEqual([])
    expect(profiles[0].oss_projects).toEqual([])
    expect(profiles[0]).not.toHaveProperty('logo_url')
  })

  it('strips unknown and private keys from the output', () => {
    const leaked = Object.fromEntries(PRIVATE_FIELDS.map((k) => [k, 'x']))
    const { profiles, errors } = parseProfiles([
      validRecord({ ...leaked, extra_column: 1, logo_url: '/logos/a.png' }),
    ])
    expect(errors).toEqual([])
    expect(Object.keys(profiles[0]).sort()).toEqual(
      Object.keys(validRecord({ logo_url: '/logos/a.png' })).sort()
    )
  })

  it('reports private keys as errors when asked to', () => {
    const { errors } = parseProfiles(
      [validRecord({ submitter_email: 'a@b.c', osm_permalink: 'x' })],
      { rejectPrivateFields: true }
    )
    expect(errors).toEqual([
      '[0] (id-1): private field "osm_permalink" must not be published',
      '[0] (id-1): private field "submitter_email" must not be published',
    ])
  })

  it('uses the caller-supplied item label', () => {
    const { errors } = parseProfiles([null], {
      itemLabel: (i) => `sheet row ${i + 2}`,
    })
    expect(errors).toEqual(['sheet row 2: expected an object, got null'])
  })
})

describe('sample data', () => {
  // Sample links use reserved example domains, never real organisations.
  const RESERVED_HOST = /(^|\.)example\.(org|com|net)$/

  const linksOf = (p: (typeof sampleData)[number]) => [
    p.primary_url,
    p.contact_url,
    ...p.oss_projects.map((o) => o.url),
  ]

  it('links only to reserved example domains', () => {
    const links = sampleData.flatMap(linksOf).filter(Boolean)
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      const host = link.startsWith('mailto:')
        ? link.slice(link.indexOf('@') + 1)
        : new URL(link).hostname
      expect(host, link).toMatch(RESERVED_HOST)
    }
  })
})

describe('numericCell', () => {
  it.each([
    ['', undefined],
    ['   ', undefined],
    [undefined, undefined],
    ['-41.2865', -41.2865],
    [' 174.7 ', 174.7],
    ['0', 0],
    ['1e2', 100],
    ['174,7', '174,7'],
    ['0x10', '0x10'],
    ['Infinity', 'Infinity'],
    ['abc', 'abc'],
  ])('%j -> %j', (cell, expected) => {
    expect(numericCell(cell)).toEqual(expected)
  })
})
