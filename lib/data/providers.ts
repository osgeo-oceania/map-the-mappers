/** Listing sources and failure policy are documented in docs/FEED.md. */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Profile } from '@/types/profile'
import { parseProfiles } from '@/lib/data/contract'
import sampleData from '@/data/sample-profiles.json'

export type DataMode = 'hosted' | 'bundled' | 'sample'

/** Hosted responses revalidate after 60 seconds. Last-good data is per instance. */
const SNAPSHOT_REVALIDATE = 60

// The bundled file is optional; next.config.js includes it in serverless traces.
const BUNDLED_FILE = 'data/profiles.json'
const bundledPath = () => path.join(process.cwd(), BUNDLED_FILE)

const sampleProfiles = parseProfiles(sampleData).profiles

let dataMode: DataMode | null = null
let bundledProfiles: Profile[] | null = null
let lastGood: Profile[] | null = null

/** Resolve the data mode once per process. */
export function getDataMode(): DataMode {
  if (!dataMode) {
    dataMode = process.env.PUBLISHED_SNAPSHOT_URL
      ? 'hosted'
      : existsSync(bundledPath())
        ? 'bundled'
        : 'sample'
  }
  return dataMode
}

/** Demo and sample modes show fictional listings. */
export function isSampleData(demo: boolean): boolean {
  return demo || getDataMode() === 'sample'
}

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : String(err)

function summarise(errors: string[]): string {
  const shown = errors.slice(0, 5).join('; ')
  const more = errors.length > 5 ? ` (+${errors.length - 5} more)` : ''
  return `${errors.length} contract error(s): ${shown}${more}`
}

/** Reject invalid bundled data rather than serving a partial directory. */
function readBundled(): Profile[] {
  if (bundledProfiles) return bundledProfiles
  let data: unknown
  try {
    data = JSON.parse(readFileSync(bundledPath(), 'utf8'))
  } catch (err) {
    throw new Error(
      `${BUNDLED_FILE}: cannot read/parse JSON — ${messageOf(err)}`
    )
  }
  const { profiles, errors } = parseProfiles(data, {
    rejectPrivateFields: true,
  })
  if (errors.length > 0) {
    throw new Error(
      `${BUNDLED_FILE} is invalid (run npm run validate-data): ${summarise(errors)}`
    )
  }
  bundledProfiles = profiles
  return profiles
}

function rejectFeed(reason: string): Profile[] {
  console.error(`[feed] rejected: ${reason}`)
  return lastGood ?? []
}

async function fetchPublished(url: string): Promise<Profile[]> {
  let res: Response
  try {
    res = await fetch(url, { next: { revalidate: SNAPSHOT_REVALIDATE } })
  } catch (err) {
    return rejectFeed(`fetch failed: ${messageOf(err)}`)
  }
  if (!res.ok) return rejectFeed(`HTTP ${res.status}`)
  let body: unknown
  try {
    body = await res.json()
  } catch (err) {
    return rejectFeed(`body is not valid JSON: ${messageOf(err)}`)
  }
  const { profiles, errors } = parseProfiles(body)
  if (errors.length > 0) return rejectFeed(summarise(errors))
  lastGood = profiles
  return profiles
}

/** An empty array is a valid directory. */
export async function getProviders(demo = false): Promise<Profile[]> {
  if (demo) return sampleProfiles
  switch (getDataMode()) {
    case 'hosted':
      return fetchPublished(process.env.PUBLISHED_SNAPSHOT_URL as string)
    case 'bundled':
      return readBundled()
    case 'sample':
      return sampleProfiles
  }
}

function distinctSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  )
}

export async function getProfileTypes(demo = false): Promise<string[]> {
  const all = await getProviders(demo)
  return distinctSorted(all.flatMap((p) => p.profile_type))
}

export async function getCapabilityAreas(demo = false): Promise<string[]> {
  const all = await getProviders(demo)
  return distinctSorted(all.flatMap((p) => p.capability_areas))
}

export async function getCountries(demo = false): Promise<string[]> {
  const all = await getProviders(demo)
  return distinctSorted(all.map((p) => p.country))
}
