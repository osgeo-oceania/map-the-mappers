import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OSGeo Oceania OSS Capabilities Map',
    short_name: 'OSS Capabilities Map',
    description:
      'Interactive map and directory of open source geospatial contributors and providers across Oceania',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9F8F6',
    theme_color: '#183138',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
