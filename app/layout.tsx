import type { Metadata } from 'next'
import {
  Inter,
  IBM_Plex_Serif,
  Plus_Jakarta_Sans,
  Miriam_Libre,
} from 'next/font/google'
import './globals.css'
import { SiteLayout } from '@/components/layout/site-layout'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { JsonLd } from '@/components/seo/json-ld'
import { siteSchema } from '@/lib/seo/schema'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['500'],
  // latin-ext includes the macrons used in Pacific place names.
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ibm-plex-serif',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const miriamLibre = Miriam_Libre({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-miriam-libre',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OSGeo Oceania OSS Capabilities Map',
  description:
    'Interactive map and directory of open source geospatial contributors and providers across Oceania',
  // Icons are supplied by the app/ file conventions.
  keywords: [
    'OSGeo',
    'Oceania',
    'open source',
    'geospatial',
    'GIS',
    'map',
    'directory',
    'open source geospatial',
    'service providers',
    'contributors',
    'open source geospatial community',
    'foss4g',
  ],
  authors: [{ name: 'OSGeo Oceania' }],
  creator: 'OSGeo Oceania',
  publisher: 'OSGeo Oceania',
  metadataBase: new URL('https://map.osgeo-oceania.org'),
  openGraph: {
    title: 'OSGeo Oceania OSS Capabilities Map',
    description:
      'Interactive map and directory of open source geospatial contributors and providers across Oceania',
    url: 'https://map.osgeo-oceania.org',
    siteName: 'OSGeo Oceania OSS Capabilities Map',
    type: 'website',
    locale: 'en_AU',
    // Share images come from app/opengraph-image.png; do not add a separate images array.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSGeo Oceania OSS Capabilities Map',
    description:
      'Interactive map and directory of open source geospatial contributors and providers across Oceania',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {},
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexSerif.variable} ${plusJakartaSans.variable} ${miriamLibre.variable}`}
    >
      <body className={plusJakartaSans.className}>
        <JsonLd data={siteSchema()} />
        <GoogleAnalytics />
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  )
}
