import { cn } from '@/lib/utils'

/**
 * Toggle state uses fill, outline and a separate non-colour cue.
 * Keep the border in both states to avoid layout shifts.
 */
export function toggleStateClasses(on: boolean, className?: string) {
  return cn(
    'border transition-colors',
    on
      ? 'border-brand-secondary bg-brand-secondary text-white hover:border-accentColors-lime hover:bg-accentColors-lime hover:text-brand-secondary'
      : 'border-brand-secondary/60 bg-transparent text-brand-secondary hover:border-brand-secondary hover:bg-brand-secondary/5',
    className
  )
}
