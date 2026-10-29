import { cn } from '@/lib/utils'

interface CategoryPillProps {
  label: string
  className?: string
}

/** Keep tag colours aligned with the HTML popup constants in lib/utils/category-colors.ts. */
export function CategoryPill({ label, className }: CategoryPillProps) {
  return (
    <span
      className={cn(
        // Centre wrapped labels within the pill’s constrained width.
        'inline-flex items-center justify-center rounded-full border border-brand-secondary/[0.14] bg-brand-secondary/10 px-3 py-1 text-center text-sm font-medium text-brand-secondary [text-wrap:balance]',
        className
      )}
    >
      {label}
    </span>
  )
}
