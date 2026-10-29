import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a listing',
}

export default function SubmitPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="type-title mb-3 font-bold text-brand-secondary">
          Submit a listing
        </h1>
        <p className="text-lg text-brand-secondary">
          Submissions are not configured for this directory.
        </p>
      </div>
    </div>
  )
}
