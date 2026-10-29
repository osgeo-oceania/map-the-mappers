'use client'

import { MapContainer } from '@/components/map/map-container'
import type { Profile } from '@/types/profile'

interface MiniMapProps {
  latitude: number
  longitude: number
  name: string
  allProviders: Profile[]
  demo?: boolean
}

export function MiniMap({
  latitude,
  longitude,
  allProviders,
  demo = false,
}: MiniMapProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-standard">
      <MapContainer
        providers={allProviders}
        center={[longitude, latitude]}
        zoom={14.5}
        showPopup={true}
        showControls={true}
        homeCenter={[longitude, latitude]}
        homeZoom={14.5}
        demo={demo}
        className="h-full w-full"
      />
    </div>
  )
}
