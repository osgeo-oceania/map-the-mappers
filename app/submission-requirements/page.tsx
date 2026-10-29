import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PROFILE_TYPES, CAPABILITY_AREAS } from '@/lib/data/vocabularies'

export const metadata: Metadata = {
  title: 'Submission requirements | OSGeo Oceania OSS Capabilities Map',
  description:
    'Everything the submission form asks for — field by field — so you can prepare your OSS Capabilities Map listing before you start.',
}

interface FieldSpec {
  name: string
  detail: React.ReactNode
  optional?: boolean
}

function SectionHeading({
  number,
  title,
  note,
}: {
  number: number
  title: string
  note?: string
}) {
  return (
    <h2 className="type-subheading mb-4 flex items-center gap-3 font-semibold text-brand-secondary">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accentColors-lime text-base font-semibold text-brand-secondary"
      >
        {number}
      </span>
      <span>
        {title}
        {note && (
          <span className="ml-2 text-base font-normal text-muted-foreground">
            — {note}
          </span>
        )}
      </span>
    </h2>
  )
}

function FieldList({ fields }: { fields: FieldSpec[] }) {
  return (
    <ul className="space-y-3">
      {fields.map((f) => (
        <li key={f.name} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accentColors-lime"
          >
            <Check
              className="h-3.5 w-3.5 text-brand-secondary"
              strokeWidth={3}
            />
          </span>
          <div>
            <span className="font-semibold text-brand-secondary">{f.name}</span>
            {f.optional && (
              <span className="ml-2 text-sm text-muted-foreground">
                optional
              </span>
            )}
            <div className="text-brand-secondary/90">{f.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function SubmissionRequirementsPage() {
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
          <Link href="/submit" className="hover:underline">
            Submit a listing
          </Link>
          <span className="px-2">›</span>
          <span className="text-brand-secondary">Submission requirements</span>
        </nav>

        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="type-title mb-2 font-bold text-brand-secondary">
              Submission requirements
            </h1>
            <p className="text-lg text-brand-secondary">
              Everything the submission form asks for, so you can prepare before
              you start. The form takes about 5 minutes once you have these
              ready.
            </p>
          </div>
          <Image
            src="/profile-illustration.png"
            alt=""
            width={140}
            height={140}
            className="hidden h-32 w-32 flex-shrink-0 object-contain md:block"
          />
        </div>

        <div className="space-y-10 leading-relaxed">
          <section>
            <SectionHeading
              number={1}
              title="Your contact details"
              note="never published"
            />
            <p className="mb-4 text-brand-secondary/90">
              Used only for moderation and updates about your listing.
            </p>
            <FieldList
              fields={[
                {
                  name: 'Your name and role',
                  detail: (
                    <>
                      e.g. &ldquo;GIS Lead&rdquo;, &ldquo;Maintainer&rdquo;, or
                      &ldquo;Individual contributor&rdquo;.
                    </>
                  ),
                },
                {
                  name: 'A contact email',
                  detail: (
                    <>Where we send the confirmation and review outcome.</>
                  ),
                },
              ]}
            />
          </section>

          <section>
            <SectionHeading number={2} title="Your public listing" />
            <p className="mb-4 text-brand-secondary/90">
              These fields appear on your public profile.
            </p>
            <FieldList
              fields={[
                {
                  name: 'Listing name',
                  detail: (
                    <>
                      Your name (as an individual) or your organisation&apos;s
                      name.
                    </>
                  ),
                },
                {
                  name: 'Profile type',
                  detail: (
                    <>Choose all that apply: {PROFILE_TYPES.join(' · ')}.</>
                  ),
                },
                {
                  name: 'Location',
                  detail: (
                    <>
                      Country and city/region, plus an{' '}
                      <strong>OpenStreetMap permalink</strong> for your map pin:
                      go to{' '}
                      <a
                        href="https://www.openstreetmap.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                      >
                        openstreetmap.org
                      </a>
                      , zoom to where you want your pin, click <em>Share</em>{' '}
                      and copy the link.
                    </>
                  ),
                },
                {
                  name: 'Primary URL',
                  detail: (
                    <>
                      Your website, GitHub profile, or main professional link —
                      the headline link on your profile, and what we use to
                      verify your submission.
                    </>
                  ),
                },
                {
                  name: 'Contact link',
                  detail: (
                    <>
                      Where people should reach you — a contact page, LinkedIn,
                      or similar.
                    </>
                  ),
                },
                {
                  name: 'Logo',
                  optional: true,
                  detail: (
                    <>
                      A public URL to your logo — square or near-square, ideally
                      512×512 or larger (PNG, JPG, or SVG). No URL handy? Skip
                      it and email the file to admin@osgeo-oceania.org after
                      submitting.
                    </>
                  ),
                },
              ]}
            />
          </section>

          <section>
            <SectionHeading number={3} title="About your work" />
            <p className="mb-4 text-brand-secondary/90">
              The two pieces worth drafting in advance:
            </p>
            <FieldList
              fields={[
                {
                  name: 'Short description',
                  detail: (
                    <>
                      What you do, in one sentence — up to 280 characters. This
                      is the summary shown on your card in the map listing.
                    </>
                  ),
                },
                {
                  name: 'Longer about',
                  detail: (
                    <>
                      Around 1,000 characters: what you focus on, who you work
                      with, areas of expertise, notable projects. Shown on your
                      full profile page.
                    </>
                  ),
                },
              ]}
            />
          </section>

          <section>
            <SectionHeading
              number={4}
              title="OSS projects"
              note="optional, up to 3"
            />
            <p className="text-brand-secondary/90">
              Showcase up to three open source projects you contribute to or
              maintain — a name and a link (project site or repository) for
              each.
            </p>
          </section>

          <section>
            <SectionHeading number={5} title="Capability areas" />
            <p className="mb-4 text-brand-secondary/90">
              You&apos;ll tick the areas you work in — worth a scan now so you
              know which apply:
            </p>
            <ul className="grid list-inside list-disc grid-cols-1 gap-x-6 gap-y-1 text-brand-secondary/90 sm:grid-cols-2">
              {CAPABILITY_AREAS.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading number={6} title="Declarations" />
            <p className="text-brand-secondary/90">
              The form also asks you to confirm you meet the{' '}
              <Link href="/listing-criteria" className="font-medium underline">
                listing criteria
              </Link>{' '}
              and consent to your public fields being listed — no preparation
              needed, just worth knowing they&apos;re there.
            </p>
          </section>

          <div className="rounded-standard bg-accentColors-lime p-8 text-center">
            <p className="mb-4 text-lg font-semibold text-brand-secondary">
              Got everything? The form is on the submit page.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link href="/submit">Go to the submission form</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
