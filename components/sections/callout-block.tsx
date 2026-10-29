import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalloutBlockProps {
  title: string
  content: string | React.ReactNode
  cta?: {
    label: string
    href: string
  }
  className?: string
}

export function CalloutBlock({
  title,
  content,
  cta,
  className,
}: CalloutBlockProps) {
  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="type-heading mb-4 font-bold text-brand-secondary">
            {title}
          </h2>
          <div className="prose prose-slate dark:prose-invert mb-6 max-w-none text-brand-secondary [&_*]:text-brand-secondary">
            {typeof content === 'string' ? (
              <p className="text-lg text-brand-secondary">{content}</p>
            ) : (
              <div className="text-brand-secondary">{content}</div>
            )}
          </div>
          <div className="mb-6 flex justify-center">
            <div className="flex h-48 w-full max-w-md items-center justify-center rounded-standard bg-white/20">
              <span className="text-sm text-brand-secondary/60">
                Illustration placeholder
              </span>
            </div>
          </div>
          {cta && (
            <Button asChild variant="outline" size="lg">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
