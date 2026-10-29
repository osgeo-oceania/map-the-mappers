import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type MockInstance,
} from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PRIVATE_FIELDS } from '@/lib/data/contract'
import sampleData from '@/data/sample-profiles.json'
import { validRecord } from './helpers'

const FEED_URL = 'https://feed.test/published.json'

/** Reload the module to reset its per-instance caches. */
async function loadProviders() {
  vi.resetModules()
  return import('@/lib/data/providers')
}

// Isolate each test from any bundled data in the checkout.
let projectDir: string

function writeBundled(body: unknown) {
  mkdirSync(join(projectDir, 'data'), { recursive: true })
  writeFileSync(
    join(projectDir, 'data', 'profiles.json'),
    typeof body === 'string' ? body : JSON.stringify(body)
  )
}

const respond = (body: string, status = 200) =>
  Promise.resolve(new Response(body, { status }))

let fetchMock: Mock<typeof fetch>
let errorLog: MockInstance<typeof console.error>

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
  projectDir = mkdtempSync(join(tmpdir(), 'osgeo-map-'))
  vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
  vi.stubEnv('PUBLISHED_SNAPSHOT_URL', '')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  rmSync(projectDir, { recursive: true, force: true })
})

type Mode = 'hosted' | 'bundled' | 'sample'

function configure(mode: Mode) {
  if (mode === 'hosted') {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
    fetchMock.mockImplementation(() =>
      respond(JSON.stringify([validRecord({ id: 'feed-1' })]))
    )
  }
  if (mode === 'bundled') writeBundled([validRecord({ id: 'bundled-1' })])
}

describe('data mode', () => {
  it('is hosted when a feed URL is set, even with a bundled file', async () => {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
    writeBundled([validRecord()])
    const { getDataMode } = await loadProviders()
    expect(getDataMode()).toBe('hosted')
  })

  it('is bundled when no URL is set and data/profiles.json exists', async () => {
    writeBundled([validRecord()])
    const { getDataMode } = await loadProviders()
    expect(getDataMode()).toBe('bundled')
  })

  it('is sample when neither is configured', async () => {
    const { getDataMode } = await loadProviders()
    expect(getDataMode()).toBe('sample')
  })

  it('is resolved once per process', async () => {
    const { getDataMode } = await loadProviders()
    expect(getDataMode()).toBe('sample')
    writeBundled([validRecord()])
    expect(getDataMode()).toBe('sample')
  })

  it.each([
    ['hosted', false, false],
    ['bundled', false, false],
    ['sample', false, true],
    ['hosted', true, true],
    ['bundled', true, true],
    ['sample', true, true],
  ] as const)(
    'isSampleData in %s mode with demo=%s is %s',
    async (mode, demo, expected) => {
      configure(mode)
      const { isSampleData } = await loadProviders()
      expect(isSampleData(demo)).toBe(expected)
    }
  )
})

describe('bundled mode', () => {
  it('serves data/profiles.json through the contract, without fetching', async () => {
    const record = validRecord({ id: 'bundled-1', moderation_flag: 'x' })
    writeBundled([record])
    const { getProviders } = await loadProviders()
    expect(await getProviders()).toEqual([validRecord({ id: 'bundled-1' })])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('still serves the sample set in demo mode', async () => {
    writeBundled([validRecord()])
    const { getProviders } = await loadProviders()
    expect((await getProviders(true)).map((p) => p.id)).toEqual(
      sampleData.map((p) => p.id)
    )
  })

  it('fails loudly on an invalid file instead of serving part of it', async () => {
    writeBundled([validRecord(), validRecord({ id: 'id-2', lat: 999 })])
    const { getProviders } = await loadProviders()
    await expect(getProviders()).rejects.toThrow(
      'data/profiles.json is invalid (run npm run validate-data): 1 contract error(s): [1] (id-2): "lat" 999 is outside -90..90'
    )
  })

  it('fails loudly on a private field, as the prebuild check does', async () => {
    writeBundled([validRecord({ submitter_email: 'a@example.org' })])
    const { getProviders } = await loadProviders()
    await expect(getProviders()).rejects.toThrow('submitter_email')
  })

  it('fails loudly on a file that is not JSON', async () => {
    writeBundled('[{')
    const { getProviders } = await loadProviders()
    await expect(getProviders()).rejects.toThrow(
      /^data\/profiles\.json: cannot read\/parse JSON/
    )
  })
})

describe('indexing of fictional data', () => {
  it.each([
    ['hosted', false, true],
    ['bundled', false, true],
    ['sample', false, false],
    ['hosted', true, false],
    ['bundled', true, false],
    ['sample', true, false],
  ] as const)(
    'listing pages in %s mode with demo=%s are indexable: %s',
    async (mode, demo, indexable) => {
      configure(mode)
      vi.resetModules()
      const { listingRobots } = await import('@/lib/seo/indexing')
      expect(listingRobots(demo)).toEqual(
        indexable ? {} : { robots: { index: false, follow: false } }
      )
    }
  )

  it.each([
    ['hosted', ['feed-1']],
    ['bundled', ['bundled-1']],
    ['sample', []],
  ] as const)('the sitemap in %s mode lists %j', async (mode, ids) => {
    configure(mode)
    vi.resetModules()
    const { default: sitemap } = await import('@/app/sitemap')
    const urls = (await sitemap()).map((e) => e.url)
    if (mode === 'sample') {
      expect(urls).not.toContain('https://map.osgeo-oceania.org/map')
    } else {
      expect(urls).toContain('https://map.osgeo-oceania.org/map')
    }
    expect(urls).toContain('https://map.osgeo-oceania.org/about')
    const listings = urls.filter((u) => /\/map\/./.test(u))
    expect(listings).toEqual(
      ids.map((id) => `https://map.osgeo-oceania.org/map/example-geo-${id}`)
    )
  })
})

describe('runtime loader: private-field strip', () => {
  it('never lets private or unknown columns through', async () => {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
    const leaked = Object.fromEntries(PRIVATE_FIELDS.map((k) => [k, 'secret']))
    fetchMock.mockReturnValue(
      respond(
        JSON.stringify([
          validRecord({
            ...leaked,
            submitter_phone: '021 000 000',
            moderation_flag: 'x',
          }),
        ])
      )
    )
    const { getProviders } = await loadProviders()
    const [profile] = await getProviders()

    for (const key of [
      ...PRIVATE_FIELDS,
      'submitter_phone',
      'moderation_flag',
    ]) {
      expect(profile).not.toHaveProperty(key)
    }
    expect(JSON.stringify(profile)).not.toContain('secret')
    expect(profile).toEqual(validRecord())
  })

  it('strips the demo set too', async () => {
    const { getProviders } = await loadProviders()
    const demo = await getProviders(true)
    expect(demo.length).toBeGreaterThan(0)
    for (const p of demo) {
      expect(Object.keys(p)).not.toContain('osm_permalink')
      expect(Object.keys(p).some((k) => k.startsWith('submitter_'))).toBe(false)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('runtime loader: failure policy', () => {
  it('serves the sample set only when no feed URL is configured', async () => {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', '')
    const { getProviders } = await loadProviders()
    expect((await getProviders()).map((p) => p.id)).toEqual(
      sampleData.map((p) => p.id)
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps the revalidate option on the feed fetch', async () => {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
    fetchMock.mockReturnValue(respond('[]'))
    const { getProviders } = await loadProviders()
    await getProviders()
    expect(fetchMock).toHaveBeenCalledWith(FEED_URL, {
      next: { revalidate: 60 },
    })
  })

  it.each([
    ['a non-OK response', () => respond('[]', 500), 'HTTP 500'],
    ['a non-JSON body', () => respond('<html>'), 'body is not valid JSON'],
    ['a non-array body', () => respond('{}'), 'expected an array'],
    ['[null]', () => respond('[null]'), 'expected an object, got null'],
    [
      'a listing without coordinates',
      () => respond(JSON.stringify([{ ...validRecord(), lat: undefined }])),
      '"lat" is missing or blank',
    ],
    [
      'a network failure',
      () => Promise.reject(new Error('ECONNRESET')),
      'fetch failed: ECONNRESET',
    ],
  ])(
    'rejects %s with no last-good: empty, never the sample set',
    async (_, reply, reason) => {
      vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
      fetchMock.mockImplementation(reply)
      const { getProviders } = await loadProviders()
      expect(await getProviders()).toEqual([])
      expect(errorLog).toHaveBeenCalledWith(
        expect.stringMatching(/^\[feed\] rejected: /)
      )
      expect(errorLog.mock.calls[0][0]).toContain(reason)
    }
  )

  it('falls back to the last good set after a rejected feed', async () => {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
    const good = [validRecord({ id: 'good-1' })]
    fetchMock
      .mockImplementationOnce(() => respond(JSON.stringify(good)))
      .mockImplementationOnce(() =>
        respond(JSON.stringify([validRecord({ lat: 999 })]))
      )
      .mockImplementationOnce(() => respond('', 404))
    const { getProviders } = await loadProviders()

    expect(await getProviders()).toEqual(good)
    expect(await getProviders()).toEqual(good)
    expect(await getProviders()).toEqual(good)
    expect(errorLog.mock.calls.map((c) => c[0])).toEqual([
      '[feed] rejected: 1 contract error(s): [0] (id-1): "lat" 999 is outside -90..90',
      '[feed] rejected: HTTP 404',
    ])
  })

  it('rejects the whole feed when any one listing is invalid', async () => {
    vi.stubEnv('PUBLISHED_SNAPSHOT_URL', FEED_URL)
    fetchMock.mockReturnValue(
      respond(JSON.stringify([validRecord(), validRecord()]))
    )
    const { getProviders } = await loadProviders()
    expect(await getProviders()).toEqual([])
    expect(errorLog.mock.calls[0][0]).toContain('duplicate id "id-1"')
  })
})
