import { ExternalLink } from 'lucide-react'
import type { Profile } from '@/types/profile'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { externalHref } from '@/lib/utils/url'

interface ProfileDetailsProps {
  provider: Profile
}

export function ProfileDetails({ provider }: ProfileDetailsProps) {
  const hasCapabilities = provider.capability_areas.length > 0
  const hasProjects = provider.oss_projects.length > 0

  if (!hasCapabilities && !hasProjects) return null

  return (
    <div className="mb-8 space-y-10">
      {hasCapabilities && (
        <section>
          <ScrollReveal direction="up">
            <h2 className="type-subheading mb-6 font-semibold text-brand-secondary">
              Capability areas
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            {/* CSS columns balance the sorted capability list. */}
            <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3 xl:columns-4">
              {[...provider.capability_areas]
                .sort((a, b) => a.localeCompare(b))
                .map((area) => (
                  <li
                    key={area}
                    className="mb-2 break-inside-avoid text-brand-secondary"
                  >
                    <span className="mr-2 text-accentColors-fern">•</span>
                    {area}
                  </li>
                ))}
            </ul>
          </ScrollReveal>
        </section>
      )}

      {hasProjects && (
        <section>
          <ScrollReveal direction="up">
            <h2 className="type-subheading mb-6 font-semibold text-brand-secondary">
              Open source projects
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <ul className="space-y-3">
              {provider.oss_projects.map((project, index) => (
                <li key={index}>
                  {project.url ? (
                    <a
                      href={externalHref(project.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-brand-secondary underline decoration-brand-secondary/30 underline-offset-4 transition-colors hover:decoration-brand-secondary"
                    >
                      {project.name || project.url}
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium text-brand-secondary">
                      {project.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>
      )}
    </div>
  )
}
