'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  onClear?: () => void
  formatOption?: (option: string) => string
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = 'Select...',
  className,
  onClear,
  formatOption,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value]
    onSelectionChange(newSelected)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSelectionChange([])
    if (onClear) {
      onClear()
    }
  }

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? formatOption
          ? formatOption(selected[0])
          : selected[0]
        : `${selected.length} selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          title={displayText}
          className={cn(
            // Allow long selected labels to wrap.
            'h-auto min-h-9 w-[180px] justify-between bg-osgeo-inputFieldGrey py-1.5 text-brand-secondary hover:translate-x-0 hover:translate-y-0 hover:bg-osgeo-inputFieldGrey hover:text-brand-secondary',
            // A transparent border reserves the selected-state border width.
            selected.length > 0
              ? 'border border-brand-secondary'
              : 'border border-transparent',
            className
          )}
        >
          <span className="text-left text-sm leading-snug">{displayText}</span>
          <div className="flex shrink-0 items-center gap-1">
            {selected.length > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectionChange([])
                    if (onClear) {
                      onClear()
                    }
                  }
                }}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded p-0 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground" />
              </div>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[180px] bg-white p-0"
        align="start"
      >
        <div className="max-h-[300px] overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No options
            </div>
          ) : (
            <div className="p-1">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center space-x-3 rounded-sm px-2 py-2 hover:bg-neutral-warmGrey/30"
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => handleToggle(option)}
                    className="h-5 w-5"
                  />
                  <span className="flex-1 text-sm">
                    {formatOption ? formatOption(option) : option}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
