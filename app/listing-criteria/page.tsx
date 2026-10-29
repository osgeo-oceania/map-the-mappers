import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Listing Criteria | OSGeo Oceania OSS Capabilities Map',
  description:
    'Who can be listed on the OSGeo Oceania OSS Capabilities Map, what we ask you to declare, and how we review submissions.',
}

const EVALUATION_CRITERIA = [
  'Used open source geospatial tools in commercial, research, government, or community projects (with public evidence such as case studies, clients, or deployments)',
  'Contributed code, documentation, or other content to OSS geospatial projects',
  'Maintained or co-maintained an OSS geospatial project',
  'Provided services to others using OSS geospatial tools (training, development, consulting, support)',
  'Published work in public repositories with clear open licensing',
  'Attended OSGeo, FOSS4G, or OpenStreetMap events',
  'Sponsored OSGeo, FOSS4G, or OpenStreetMap events or community activities',
  'Been a member of OSGeo Oceania or another OSGeo chapter',
  'Contributed to OSS geospatial mailing lists, forums, or working groups',
  'Spoken at or organised OSS geospatial events',
]

function CriteriaSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-brand-secondary/10"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-xl font-semibold text-brand-secondary transition-colors hover:text-brand-primary [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 flex-shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="space-y-3 pb-6 leading-relaxed text-brand-secondary">
        {children}
      </div>
    </details>
  )
}

export default function ListingCriteriaPage() {
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
          <span className="text-brand-secondary">Listing Criteria</span>
        </nav>

        <h1 className="type-title mb-2 font-bold text-brand-secondary">
          Listing Criteria
        </h1>
        <p className="mb-8 text-lg text-brand-secondary">
          Who can be listed on the OSGeo Oceania OSS Capabilities Map.
        </p>

        <div className="mb-8 space-y-4 leading-relaxed text-brand-secondary">
          <p>
            The OSS Capabilities Map is a public directory of{' '}
            <strong>organisations and active practitioners</strong> delivering
            open source geospatial work in or with Oceania. It exists to make
            the region&apos;s OSGeo ecosystem easier to find — for procurement
            teams, researchers, partners, government bodies, and the community
            itself.
          </p>
          <p>
            This page outlines who can be listed, what we&apos;ll ask you to
            declare, how we review submissions, and what happens with your
            information.
          </p>
        </div>

        <div className="border-t border-brand-secondary/10">
          <CriteriaSection title="Who can be listed" defaultOpen>
            <p>
              To be listed, you (or your organisation) must meet{' '}
              <strong>all three</strong> of the following baseline criteria:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                <strong>Geographic location.</strong> You must be based in or
                have significant operations in the Oceania region.
              </li>
              <li>
                <strong>Open source alignment.</strong> You must use, contribute
                to, or provide services or products built upon open source
                geospatial technologies (e.g. QGIS, PostGIS, GDAL, MapServer,
                GeoServer, Cesium, OpenStreetMap).
              </li>
              <li>
                <strong>Activity status.</strong> You must be active — having
                delivered a project, contributed code, provided training, or
                similar in the past 24 months.
              </li>
            </ol>
            <p>If all three apply, you&apos;re eligible.</p>
          </CriteriaSection>

          <CriteriaSection title="Evaluation criteria">
            <p>
              In addition to the baseline criteria above, we look at how you
              actually participate in the open source geospatial ecosystem. When
              you submit, we&apos;ll ask you to tick the criteria that apply to
              you (at least one is required). These appear on your public
              profile and help our moderator verify your involvement during
              review.
            </p>
            <ul className="space-y-2">
              {EVALUATION_CRITERIA.map((c) => (
                <li key={c} className="flex gap-2">
                  <span aria-hidden className="text-brand-secondary/50">
                    ☐
                  </span>
                  <span>
                    I/We have {c.charAt(0).toLowerCase() + c.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          </CriteriaSection>

          <CriteriaSection title="Who shouldn't apply">
            <p>
              This directory isn&apos;t the right fit for everyone. A few common
              cases:
            </p>
            <p>
              <strong>
                General community members, hobbyists, or newcomers.
              </strong>{' '}
              If you&apos;re exploring open source geospatial, learning, or want
              to get involved without yet doing professional or active project
              work — the OSGeo Oceania community is your home.{' '}
              <a
                href="https://osgeo-oceania.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                Get involved with OSGeo Oceania
              </a>
            </p>
            <p>
              <strong>
                Organisations or individuals who only use proprietary software
              </strong>{' '}
              without demonstrable open source engagement. The directory&apos;s
              purpose is showcasing open source capability; we ask that what you
              list reflects real OSS involvement.
            </p>
            <p>
              <strong>Entities whose work conflicts with OSGeo values</strong> —
              such as unclear licensing on contributed software, unethical data
              practices, or proprietary products presented as open source. We
              exclude these on review.
            </p>
          </CriteriaSection>

          <CriteriaSection title="How we review your submission">
            <p>
              After you submit, an OSGeo Oceania moderator reviews within{' '}
              <strong>5 business days</strong>. They check:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>That your submission is complete and within scope.</li>
              <li>
                That the URLs you&apos;ve linked (your website, GitHub, project
                pages, contact) support what you&apos;ve declared.
              </li>
              <li>
                That nothing in your submission falls within the exclusions
                above.
              </li>
            </ul>
            <p>
              If something&apos;s unclear or missing, we&apos;ll email you with
              a request for clarification — your submission stays in the queue
              until resolved. If we can&apos;t approve your listing, we&apos;ll
              let you know why and how to appeal (see below).
            </p>
            <p>
              When you&apos;re approved, you&apos;ll get an email with a link to
              your live profile and a graphic you can share to let others know
              you&apos;re on the map.
            </p>
          </CriteriaSection>

          <CriteriaSection title="What appears publicly vs. privately">
            <h3 className="text-lg font-semibold text-brand-secondary">
              On your public profile
            </h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>Your name (or organisation name)</li>
              <li>Profile type</li>
              <li>Country and city or region</li>
              <li>
                Map pin (you control the precision — pin at office or general
                location)
              </li>
              <li>Your logo — if you provide one (optional; see below)</li>
              <li>
                The best way for the public to contact you (you choose —
                LinkedIn URL, website contact page, social profile)
              </li>
              <li>Your primary website or portfolio URL</li>
              <li>A short description of what you do</li>
              <li>
                The contributions and capability areas you&apos;ve declared
              </li>
              <li>Any OSS projects, links, or images you&apos;ve added</li>
            </ul>
            <h3 className="pt-2 text-lg font-semibold text-brand-secondary">
              Note on logos
            </h3>
            <p>
              You can optionally provide a logo — either as a URL on the form,
              or by emailing us after you submit. We rehost the image on the map
              site&apos;s own domain (not hotlinked to your server) — that means
              it stays working even if you later move or redesign your site. The
              URL you originally provide is used only by our moderator to source
              the image; it isn&apos;t published.
            </p>
            <h3 className="pt-2 text-lg font-semibold text-brand-secondary">
              Kept private — used only by OSGeo Oceania
            </h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>Your personal name (if submitting for an organisation)</li>
              <li>Your role</li>
              <li>Your contact email</li>
              <li>The referee or verification contact you provide</li>
            </ul>
            <p>
              We never display any of these publicly. They&apos;re used only for
              moderation and any future contact about your profile.
            </p>
          </CriteriaSection>

          <CriteriaSection title="Updating or removing your profile">
            <p>
              Profile updates go through email. Write to{' '}
              <a
                href="mailto:admin@osgeo-oceania.org"
                className="font-medium underline"
              >
                admin@osgeo-oceania.org
              </a>{' '}
              with what you&apos;d like changed and we&apos;ll update your
              listing. (Self-service profile editing is on our roadmap for a
              later release.)
            </p>
            <p>
              You can request removal at any time by emailing the same address —
              your listing will be archived within 7 days.
            </p>
          </CriteriaSection>

          <CriteriaSection title="Appeals">
            <p>
              If we&apos;re unable to approve your submission and you believe
              we&apos;ve got it wrong, email{' '}
              <a
                href="mailto:admin@osgeo-oceania.org?subject=Appeal"
                className="font-medium underline"
              >
                admin@osgeo-oceania.org
              </a>{' '}
              with the subject &ldquo;Appeal&rdquo; and your reasoning. Two
              board members will review your case and respond within 14 business
              days.
            </p>
          </CriteriaSection>

          <CriteriaSection title="Contact">
            <p>
              For anything not covered here, write to{' '}
              <a
                href="mailto:admin@osgeo-oceania.org"
                className="font-medium underline"
              >
                admin@osgeo-oceania.org
              </a>
              .
            </p>
          </CriteriaSection>
        </div>

        <div className="mt-12 rounded-standard bg-accentColors-lime p-8 text-center">
          <p className="mb-4 text-lg font-semibold text-brand-secondary">
            Ready to submit? If you (or your organisation) meet the criteria
            above, submit a listing.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/submit">Submit a listing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
