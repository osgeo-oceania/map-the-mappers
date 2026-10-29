import type { Metadata } from 'next'
import { TextBlock } from '@/components/sections/text-block'
import { TwoColumnText } from '@/components/sections/two-column-text'
import { FeatureList } from '@/components/sections/feature-list'
import { IconList } from '@/components/sections/icon-list'
import { TimelineBlock } from '@/components/sections/timeline-block'
import { FileText, Handshake, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { ADMIN_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About | OSGeo Oceania OSS Capabilities Map',
  description:
    'Why OSGeo Oceania built the OSS Capabilities Map: recognising and connecting the people and organisations behind open source geospatial across Australia, New Zealand and the Pacific.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <TextBlock
        title="About"
        content={
          <div className="space-y-4 leading-relaxed">
            <p>
              The OSS Capabilities Map is an open, community‑owned directory. It
              helps you discover the people, organisations, and projects driving
              open source geospatial work across Oceania.
            </p>
            <p>
              It&apos;s built by and for the community, with support from OSGeo
              Oceania — the regional chapter of the global Open Source
              Geospatial Foundation (OSGeo).
            </p>
          </div>
        }
        cta={{
          label: 'Project Background',
          href: 'https://osgeo-oceania.org/oss-capabilities-in-oceania-project/',
          variant: 'outline',
        }}
        className="bg-accentColors-skyBlue text-secondary"
        titleAlign="left"
        ctaAlign="left"
        illustration="/cycle-illustration.png"
        illustrationAlt="Cycle illustration"
      />

      <FeatureList
        title="Who It's For"
        features={[
          {
            image: '/contributor-illustration.png',
            title: 'Contributors & Maintainers',
          },
          {
            image: '/service-illustration.png',
            title: 'Service Providers',
          },
          {
            image: '/business-illustration.png',
            title: 'Decision-Makers & Project Leads',
          },
          {
            image: '/trailor-illustration.png',
            title: 'Newcomers and Supporters',
          },
        ]}
        className="bg-brand-secondary"
        equalHeightCards={true}
      />

      <TwoColumnText
        title="Why We're Building It"
        leftSubtitle="Challenges"
        rightSubtitle="Benefits"
        leftColumn={
          <div className="space-y-4">
            <ul className="list-inside list-disc space-y-2">
              <li>Open source contributors are hard to find</li>
              <li>OSS project visibility is scattered across sectors</li>
              <li>
                No shared public platform exists to support collaboration or
                discovery
              </li>
            </ul>
          </div>
        }
        rightColumn={
          <div className="space-y-4">
            <ul className="list-inside list-disc space-y-2">
              <li>Easier collaboration and community member discovery</li>
              <li>Easier procurement and partnership development</li>
              <li>Recognition for OSS contributors</li>
            </ul>
          </div>
        }
        className="bg-brand-secondary text-neutral-offWhite"
        useCards={true}
      />

      <TimelineBlock
        title="Our Roadmap"
        phases={[
          {
            phase: 'Release 1 – Beta Preview',
            description: 'MVP demo launch at FOSS4G Oceania 2025',
            status: 'Completed in 2025',
          },
          {
            phase: 'EOI + Feedback Phase',
            description: 'Gathered input from ~40 volunteers and beta survey',
            status: 'Completed in 2025',
          },
          {
            phase: 'Release 2 – Public Launch',
            description:
              'Live submission pipeline, custom basemap, search, feedback',
            status: 'Completed in August 2026',
          },
          {
            phase: 'Open source release',
            description:
              'Releasing the platform as open source, so the community and other OSGeo regions can leverage it for their own capability maps',
            status: 'September 2026',
          },
          {
            phase: 'Community & knowledge hub',
            description: 'Expanded resources, tutorials, events',
            status: '2027',
          },
        ]}
        className="bg-brand-secondary text-neutral-offWhite [&_table]:border-neutral-offWhite [&_td]:border-neutral-offWhite [&_th]:border-neutral-offWhite"
        footer={
          <div className="mt-10 space-y-2 text-center">
            <p className="text-neutral-offWhite">
              Got a suggestion for what the roadmap should consider next?{' '}
              <Link
                href="/feedback"
                className="font-medium underline [color:inherit]"
              >
                Share your feedback
              </Link>
              .
            </p>
            <p className="text-neutral-offWhite">
              Want to get involved in where the map goes from here? Email{' '}
              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="font-medium underline [color:inherit]"
              >
                {ADMIN_EMAIL}
              </a>
              .
            </p>
          </div>
        }
      />

      <IconList
        title="How you can help"
        items={[
          {
            icon: FileText,
            title: 'Submit a listing',
            description: (
              <>
                If you (or your organisation) are contributing to or building
                with open source geospatial in Oceania, this is the fastest way
                to help. Takes about 5 minutes.{' '}
                <Link href="/submit" className="font-medium underline">
                  Submit a listing
                </Link>
              </>
            ),
          },
          {
            icon: Megaphone,
            title: 'Share the map',
            description:
              "Share the map with your network — help others discover Oceania's open source geospatial community.",
          },
          {
            icon: Handshake,
            title: 'Get involved with OSGeo Oceania',
            description: (
              <>
                Beyond the map,{' '}
                <a
                  href="https://osgeo-oceania.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  OSGeo Oceania
                </a>{' '}
                has events and volunteer opportunities.
              </>
            ),
          },
        ]}
        className="bg-brand-secondary text-secondary [&_.bg-card]:bg-accentColors-lime [&_.bg-card]:text-secondary"
        iconStrokeWidth={1}
      />
    </div>
  )
}
