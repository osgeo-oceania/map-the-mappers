/** Public listing shape. Validation rules and examples: docs/FEED.md. */

export interface OssProject {
  name: string
  url: string
}

export interface Profile {
  /** Stable identifier; changing it breaks profile links. */
  id: string
  listing_name: string
  /** At least one profile type. */
  profile_type: string[]
  country: string
  city_region: string
  /** Latitude in degrees, from -90 to 90. */
  lat: number
  /** Longitude in degrees, from -180 to 180. */
  lon: number
  contact_url: string
  primary_url: string
  /** Card summary; recommended maximum 280 characters. */
  short_description: string
  /** Profile body; recommended maximum 1000 characters. */
  longer_about: string
  /** Promoted projects; up to three recommended. */
  oss_projects: OssProject[]
  capability_areas: string[]
  /** Omit or leave empty for the letter-avatar fallback. */
  logo_url?: string
}

export interface ProfileFilters {
  searchQuery?: string
  /** Selected profile types (OR within the facet). */
  profileTypes?: string[]
  /** Selected capability areas (OR within the facet). */
  capabilityAreas?: string[]
  /** Selected countries (OR within the facet). */
  countries?: string[]
}
