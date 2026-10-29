import type { Metadata } from 'next'
import Link from 'next/link'
import { Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms & Privacy | OSGeo Oceania OSS Capabilities Map',
  description:
    'Terms of use and privacy notice for the OSGeo Oceania OSS Capabilities Map — what we collect, how we use it, and your rights.',
}

const ADMIN_EMAIL = 'admin@osgeo-oceania.org'

function Section({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="type-subheading mb-3 font-semibold text-brand-secondary">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function TermsAndPrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="px-2">›</span>
          <span className="text-brand-secondary">Terms &amp; Privacy</span>
        </nav>

        <h1 className="type-title mb-2 font-bold text-brand-secondary">
          Terms &amp; Privacy Notice
        </h1>

        <div className="mb-8 mt-4 flex gap-4 rounded-standard bg-accentColors-skyBlue p-6">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-secondary" />
          <p className="text-sm text-brand-secondary">
            This notice is under review. It reflects our current practices; any
            material changes from legal review will be communicated to listed
            contributors by email before they take effect.
          </p>
        </div>

        <div className="space-y-8 leading-relaxed text-brand-secondary">
          <p>
            This page explains what information the OSS Capabilities Map
            collects when you submit a listing, how we use it, and the rights
            you have over it. In short: we publish the profile information you
            choose to share, keep your contact details private for moderation,
            and never sell or allow bulk-scraping of the directory. You can
            remove your listing at any time with a single email.
          </p>

          <Section heading="1. Who we are">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                OSGeo Oceania is the regional chapter of the Open Source
                Geospatial Foundation covering Oceania.
              </li>
              <li>The OSS Capabilities Map is operated by OSGeo Oceania.</li>
              <li>
                Contact:{' '}
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="font-medium underline"
                >
                  {ADMIN_EMAIL}
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section heading="2. What information we collect">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Submitted profile information</strong> — the fields you
                complete in the submission form.
              </li>
              <li>
                <strong>Submission metadata</strong> — timestamp, browser
                user-agent (for spam detection), and submitter IP at time of
                submission (held briefly for moderation; never exposed
                publicly).
              </li>
              <li>
                <strong>Email contact</strong> — for verification,
                profile-update access, and (only if you separately opt in)
                event/community updates.
              </li>
              <li>
                <strong>Analytics</strong> — site-level analytics on the public
                site, not tied to submitter identities.
              </li>
            </ul>
          </Section>

          <Section heading="3. How we use it">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Public display</strong> of the profile information you
                submit on the directory.
              </li>
              <li>
                <strong>Internal moderation</strong> — to review submissions for
                spam, scope, and clear errors before publishing.
              </li>
              <li>
                <strong>Operational contact</strong> — to email you about your
                listing, verification, or directory operations.
              </li>
              <li>
                <strong>Community communications (only if opted in)</strong> —
                newsletter and event updates from OSGeo Oceania.
              </li>
            </ul>
            <p>Listing on the directory is free.</p>
          </Section>

          <Section heading="4. How long we keep it">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Active listings</strong> — kept while your profile is
                public and for 90 days after removal (in case of accidental
                delete / restoration request).
              </li>
              <li>
                <strong>Withdrawn submissions</strong> — anonymised within 30
                days of a withdrawal request.
              </li>
              <li>
                <strong>Email subscription</strong> — until you unsubscribe
                (one-click in every email).
              </li>
            </ul>
          </Section>

          <Section heading="5. Who we share it with">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>The public</strong>, via the directory (your declared
                profile information).
              </li>
              <li>
                <strong>
                  OSGeo Oceania board, committee, and authorised moderators
                </strong>{' '}
                for review and operation.
              </li>
              <li>
                <strong>No third parties</strong> for marketing, advertising, or
                commercial reuse.
              </li>
              <li>
                <strong>Service providers</strong> (e.g. hosting, form/data
                tooling) only insofar as they process the data on our behalf
                under their own privacy obligations.
              </li>
              <li>
                <strong>No bulk scraping or API access</strong> is offered
                publicly without explicit agreement.
              </li>
            </ul>
          </Section>

          <Section heading="6. Your rights">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Access</strong> — see what we hold about you (your
                profile is public; the rest is on request).
              </li>
              <li>
                <strong>Correction</strong> — email us to update your profile or
                correct any detail.
              </li>
              <li>
                <strong>Withdrawal / deletion</strong> — a one-line email to{' '}
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="font-medium underline"
                >
                  {ADMIN_EMAIL}
                </a>{' '}
                triggers removal.
              </li>
              <li>
                <strong>Withdrawal of community-update consent</strong> —
                one-click in every email.
              </li>
              <li>
                <strong>Complaint</strong> — escalation to the OSGeo Oceania
                board if a request isn&apos;t actioned promptly. Final external
                recourse is the privacy authority in your jurisdiction.
              </li>
            </ul>
          </Section>

          <Section heading="7. Cookies & tracking">
            <ul className="list-disc space-y-1 pl-6">
              <li>Site analytics as above. No advertising cookies.</li>
              <li>
                Functional cookies only for the submission flow&apos;s
                save-and-resume state.
              </li>
            </ul>
          </Section>

          <Section heading="8. Data location">
            <p>
              The application is hosted via Vercel. We do not guarantee a
              specific data-residency region at this stage; data may transit
              servers outside Oceania. We will document the data-residency
              posture clearly when the backend pipeline is finalised.
            </p>
          </Section>

          <Section heading="9. Changes to this notice">
            <p>
              Material changes will be communicated to listed contributors by
              email (the address used for profile verification) at least 14 days
              before they take effect. A version history will be linked at the
              bottom of this notice.
            </p>
          </Section>

          <Section heading="10. Children / under-18s">
            <p>
              The directory is intended for adult contributors. We do not
              knowingly accept submissions from people under 18. If a submission
              with a minor&apos;s identifying detail is flagged, it is removed
              and the email contact is notified.
            </p>
          </Section>

          <Section heading="11. Commercial reuse prohibition">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                The directory and its underlying data are made available for
                non-commercial discovery and community use.
              </li>
              <li>
                Bulk scraping, commercial database resale, lead-generation
                harvesting, and any reuse that materially undermines the consent
                of listed contributors is <strong>not permitted</strong>.
              </li>
              <li>
                Researchers and academics may request structured data access by
                emailing{' '}
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="font-medium underline"
                >
                  {ADMIN_EMAIL}
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section heading="12. Map data & attribution">
            <p>
              The map is built from open data. Full credits are shown on the map
              itself, under the information button; the licences are set out
              here in full.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Basemap tiles by{' '}
                <a
                  href="https://protomaps.com"
                  className="font-medium underline"
                >
                  Protomaps
                </a>
                , built from{' '}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  className="font-medium underline"
                >
                  OpenStreetMap
                </a>{' '}
                data. © OpenStreetMap contributors, available under the{' '}
                <a
                  href="https://opendatacommons.org/licenses/odbl/"
                  className="font-medium underline"
                >
                  Open Database License (ODbL)
                </a>
                .
              </li>
              <li>
                Place names for location search from{' '}
                <a
                  href="https://www.geonames.org"
                  className="font-medium underline"
                >
                  GeoNames
                </a>
                , licensed under{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  className="font-medium underline"
                >
                  Creative Commons Attribution 4.0 (CC BY 4.0)
                </a>
                .
              </li>
              <li>
                Map rendering by{' '}
                <a
                  href="https://maplibre.org/"
                  className="font-medium underline"
                >
                  MapLibre GL JS
                </a>
                , a 3-Clause BSD licensed open source library.
              </li>
            </ul>
          </Section>

          <p className="text-sm text-muted-foreground">
            Questions about this notice? Write to{' '}
            <a href={`mailto:${ADMIN_EMAIL}`} className="font-medium underline">
              {ADMIN_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
