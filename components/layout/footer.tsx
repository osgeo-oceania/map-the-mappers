import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const PAGES: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Map', href: '/map' },
  { label: 'About', href: '/about' },
  { label: 'Terms & Privacy', href: '/terms-and-privacy' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'OSGeo Oceania', href: 'https://osgeo-oceania.org', external: true },
]

const LISTING_PAGES: FooterLink[] = [
  { label: 'Submit a listing', href: '/submit' },
  { label: 'Listing Criteria', href: '/listing-criteria' },
  { label: 'Submission Requirements', href: '/submission-requirements' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-brand-primary">
      <div className="w-full px-4 py-8 md:py-12">
        <div className="mx-auto grid max-w-container grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/osgeo-oceania-logo-blue.png"
                alt="OSGeo Oceania Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-xs text-brand-secondary">
              © {currentYear} OSGeo Oceania. Open source geospatial community
              across Oceania. Made by{' '}
              <a
                href="https://www.cartisan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-secondary underline hover:text-brand-secondary"
              >
                Cartisan
              </a>
              .
            </p>
            <div className="mt-4 hidden h-64 w-64 items-center justify-center md:flex">
              <Image
                src="/hero-illustration.png"
                alt="Three people riding a tandem bicycle"
                width={256}
                height={256}
                className="h-full w-full object-contain"
                quality={100}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex flex-col gap-4 md:items-end">
              <h3 className="font-semibold text-brand-secondary">Site Map</h3>
              <ul className="flex flex-col gap-2 text-sm md:items-end">
                {PAGES.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand-secondary transition-colors hover:underline"
                      >
                        {item.label}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-brand-secondary transition-colors hover:underline"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <h4 className="mt-2 font-semibold text-brand-secondary">
                Listing
              </h4>
              <ul className="flex flex-col gap-2 text-sm md:items-end">
                {LISTING_PAGES.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-brand-secondary transition-colors hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex h-64 w-64 items-center justify-center md:hidden">
              <Image
                src="/hero-illustration.png"
                alt="Three people riding a tandem bicycle"
                width={256}
                height={256}
                className="h-full w-full object-contain"
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
