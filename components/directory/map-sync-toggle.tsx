'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleStateClasses } from '@/lib/utils/control-state'

interface MapSyncToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
  /** Opaque white keeps the unselected control legible over map tiles. */
  floating?: boolean
}

const LABEL = 'Filter as map moves'

export function MapSyncToggle({
  enabled,
  onToggle,
  className,
  floating = false,
}: MapSyncToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onToggle(!enabled)}
      className={cn(
        toggleStateClasses(
          enabled,
          'inline-flex shrink-0 items-center gap-1.5 rounded-standard px-2.5 py-1.5 text-xs font-medium'
        ),
        floating && !enabled && 'bg-white hover:bg-white',
        floating && 'shadow-lg',
        className
      )}
    >
      {/* Tick/cross provides a non-colour state cue without changing control width. */}
      {enabled ? (
        <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <X aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      )}
      {LABEL}
    </button>
  )
}
