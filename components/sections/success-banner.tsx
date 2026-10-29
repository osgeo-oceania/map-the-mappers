import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

interface SuccessBannerProps {
  title: string
  content: string | React.ReactNode
  className?: string
}

export function SuccessBanner({
  title,
  content,
  className,
}: SuccessBannerProps) {
  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-standard border-2 border-brand-primary/20 bg-brand-primary/10 p-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-brand-primary" />
            </div>
            <h2 className="type-subheading mb-4 font-bold text-brand-secondary">
              {title}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
              {typeof content === 'string' ? <p>{content}</p> : content}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
