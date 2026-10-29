/** Submission-form options. Directory filters are derived from listing data. */

export const PROFILE_TYPES = [
  'Service provider / consultancy',
  'Software vendor / maintainer',
  'Government / public-sector organisation',
  'Academic / research institution',
  'Community organisation',
  'Other (specify)',
] as const

export const CAPABILITY_AREAS = [
  'AI / ML for geospatial',
  'Cloud & DevOps for geospatial',
  'Open data publishing & sharing',
  'Drone / UAV / Remote sensing',
  '3D / Digital twin / BIM',
  'Web mapping & web applications',
  'Mobile / field data collection',
  'Spatial analysis & modelling',
  'Geospatial databases & infrastructure',
  'Cartography & visualisation',
  'UI / UX for geospatial applications',
  'Training & capacity building',
  'Consulting & advisory',
  'Custom development',
  'Implementation & integration',
  'Enterprise migration',
  'Support & maintenance',
  'Data services',
  'Research & R&D',
  'Product strategy & roadmap',
  'Project & programme management',
  'Architecture & technical advisory',
  'Standards & interoperability advisory',
  'Other (specify)',
] as const

export type ProfileType = (typeof PROFILE_TYPES)[number]
export type CapabilityArea = (typeof CAPABILITY_AREAS)[number]
