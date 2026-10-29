import { describe, expect, it } from 'vitest'
import { bufferedBounds, providerInBounds } from '@/lib/geo/proximity'
import type { Place } from '@/lib/geo/gazetteer'
import { validRecord } from './helpers'

const at = (lon: number, lat: number) => validRecord({ lon, lat })

describe('providerInBounds across the antimeridian', () => {
  // Fiji's Lau group sits east of 180°, i.e. at negative longitudes.
  const lau = at(-178.8, -17.8)
  const suva = at(178.44, -18.14)
  const auckland = at(174.76, -36.85)

  it('includes a provider east of 180° when bounds are unwrapped (east > 180)', () => {
    const bounds: [[number, number], [number, number]] = [
      [175, -20],
      [185, -15],
    ]
    expect(providerInBounds(lau, bounds)).toBe(true)
    expect(providerInBounds(suva, bounds)).toBe(true)
    expect(providerInBounds(auckland, bounds)).toBe(false)
  })

  it('includes a provider east of 180° when bounds are wrapped (west > east)', () => {
    const bounds: [[number, number], [number, number]] = [
      [175, -20],
      [-175, -15],
    ]
    expect(providerInBounds(lau, bounds)).toBe(true)
    expect(providerInBounds(suva, bounds)).toBe(true)
    expect(providerInBounds(at(0, -17), bounds)).toBe(false)
  })

  it('handles a west edge below -180', () => {
    const bounds: [[number, number], [number, number]] = [
      [-185, -20],
      [-175, -15],
    ]
    expect(providerInBounds(suva, bounds)).toBe(true)
    expect(providerInBounds(lau, bounds)).toBe(true)
  })

  it('still applies the latitude range', () => {
    const bounds: [[number, number], [number, number]] = [
      [175, -18],
      [185, -15],
    ]
    expect(providerInBounds(at(-178.8, -18.5), bounds)).toBe(false)
  })

  it('a buffered box around a place near 180° reaches across it', () => {
    const taveuni: Place = {
      name: 'Taveuni',
      kind: 'region',
      region: 'Northern',
      country: 'Fiji',
      lat: -16.85,
      lon: 179.95,
      pop: 0,
    }
    const bounds = bufferedBounds(taveuni)
    expect(bounds[1][0]).toBeGreaterThan(180)
    expect(providerInBounds(at(-179.7, -16.9), bounds)).toBe(true)
    expect(providerInBounds(at(170, -16.9), bounds)).toBe(false)
  })
})
