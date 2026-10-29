'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'

interface SiteLayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

export function SiteLayout({ children, showFooter }: SiteLayoutProps) {
  const pathname = usePathname()

  const shouldShowFooter =
    showFooter !== undefined ? showFooter : pathname !== '/map'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {shouldShowFooter && <Footer />}
    </div>
  )
}
