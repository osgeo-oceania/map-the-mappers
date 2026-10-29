import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface TimelinePhase {
  phase: string
  description: string
  status: string
  statusIcon?: string
}

interface TimelineBlockProps {
  title: string
  phases: TimelinePhase[]
  className?: string
  footer?: React.ReactNode
}

export function TimelineBlock({
  title,
  phases,
  className,
  footer,
}: TimelineBlockProps) {
  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="container mx-auto max-w-container">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal direction="up" className="mb-20">
            <h2 className="type-heading text-center font-bold [color:inherit]">
              {title}
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-[inherit]">
                <thead>
                  <tr className="border-b border-[inherit]">
                    <th className="border-[inherit] px-4 py-3 text-left font-semibold">
                      Phase
                    </th>
                    <th className="border-[inherit] px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                    <th className="border-[inherit] px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase, index) => (
                    <tr key={index} className="border-b border-[inherit]">
                      <td className="px-4 py-4 font-medium">{phase.phase}</td>
                      <td className="px-4 py-4">{phase.description}</td>
                      <td className="px-4 py-4">
                        <span>{phase.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
          {footer && (
            <ScrollReveal direction="up" delay={200}>
              {footer}
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}
