/** Canonical origin — keep in step with metadataBase in app/layout.tsx. */
export const SITE_URL = 'https://map.osgeo-oceania.org'

export const ADMIN_EMAIL = 'admin@osgeo-oceania.org'

export const FEEDBACK_SUBJECT = 'Capability Map Feedback'
export const FEEDBACK_MAILTO = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
  FEEDBACK_SUBJECT
)}`
