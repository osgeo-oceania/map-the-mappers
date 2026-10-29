import Link from 'next/link'

/** Shown on fictional listing pages; link to real data only when configured. */
export function SampleDataNotice({ liveMap }: { liveMap: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 bg-accentColors-lime px-4 py-2 text-center text-sm text-brand-secondary">
      <span aria-hidden>📌</span>
      {liveMap ? (
        <span>
          <strong>You&apos;re viewing sample data</strong> for demonstration.
          Real listings live at{' '}
          <Link href="/map" className="font-medium underline">
            the live map
          </Link>
          .
        </span>
      ) : (
        <span>
          <strong>You&apos;re viewing fictional sample listings.</strong>{' '}
          Configure a listings feed or bundled data to show real ones (see
          docs/FEED.md).
        </span>
      )}
    </div>
  )
}
