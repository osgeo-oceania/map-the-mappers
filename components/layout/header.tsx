'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems: Array<{ label: string; href: string; external?: boolean }> = [
    { label: 'Home', href: '/' },
    { label: 'Map', href: '/map' },
    { label: 'About', href: '/about' },
    {
      label: 'OSGeo Oceania',
      href: 'https://osgeo-oceania.org',
      external: true,
    },
  ]

  return (
    <header className="relative sticky top-0 z-50 w-full bg-brand-secondary">
      <div className="relative flex h-auto min-h-16 items-center py-3">
        <div className="container pl-4 pr-0">
          <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/osgeo-oceania-logo-white.png"
                alt="OSGeo Oceania Logo"
                className="h-10 w-auto flex-shrink-0"
              />
            </Link>
          </div>
        </div>

        <nav className="absolute right-0 hidden flex-shrink-0 items-center gap-4 pr-4 md:flex">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 whitespace-nowrap text-sm font-normal text-white transition-colors hover:underline"
              >
                {item.label}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap text-sm font-normal text-white transition-colors hover:underline ${
                  pathname === item.href ? 'underline' : ''
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Button
            asChild
            variant="outline"
            className="whitespace-nowrap border-white text-white hover:border-transparent hover:bg-white hover:text-brand-secondary hover:no-underline"
          >
            <Link href="/feedback" className="hover:no-underline">
              Feedback
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="whitespace-nowrap border-0 hover:no-underline"
          >
            <Link href="/submit" className="hover:no-underline">
              Submit a listing
            </Link>
          </Button>
        </nav>

        <div className="absolute right-0 pr-4 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="h-12 w-12 p-0 text-white hover:bg-accentColors-lime"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-brand-secondary bg-brand-secondary sm:w-[400px] [&>button>svg]:h-6 [&>button>svg]:w-6 [&>button]:h-12 [&>button]:w-12 [&>button]:p-0 [&>button]:text-white [&>button]:hover:bg-accentColors-lime [&>button]:hover:text-brand-secondary"
            >
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block flex items-center gap-2 rounded-md px-4 py-3 text-base font-normal text-white transition-colors hover:underline"
                    >
                      {item.label}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded-md px-4 py-3 text-base font-normal text-white transition-colors hover:underline ${
                        pathname === item.href ? 'underline' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
                <div className="mt-4 flex flex-col gap-3 border-t border-white/20 pt-4">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 w-full border-white text-base text-white hover:border-transparent hover:bg-white hover:text-brand-secondary hover:no-underline [&_svg]:!size-6 [&_svg]:shrink-0"
                  >
                    <Link
                      href="/feedback"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:no-underline"
                    >
                      Feedback
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="default"
                    className="h-12 w-full border-0 text-base hover:no-underline [&_svg]:!size-6 [&_svg]:shrink-0"
                  >
                    <Link
                      href="/submit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:no-underline"
                    >
                      Submit a listing
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
