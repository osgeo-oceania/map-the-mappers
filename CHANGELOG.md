# Changelog

Notable changes to the OSS Capabilities Map, following
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html); CONTRIBUTING.md
defines the versioned interface.

Entries before 2.2.0 describe the deployed OSGeo Oceania app. Its
submission and publishing services are not included in the public source.

## [Unreleased]

## [2.2.0] — 2026-10-20

### Added

- Three ways to supply listings, chosen by configuration: a JSON feed at a
  URL, a JSON file in the repository, or the built-in demo listings when
  neither is set.
- Every feed is checked against the documented format before use. One
  that fails the check is rejected and the previous good one stays live.
- Demo listings are shown with a notice, and demo pages are kept out of
  search engines and the sitemap.
- Search-engine support: `robots.txt`, `sitemap.xml`, structured data and an
  `llms.txt` file.
- Setup, adaptation and feed-format guides for running your own copy.

### Changed

- Framework and map library upgraded (Next.js 15, React 19, MapLibre GL JS
  6). Very old browsers that lack WebGL 2 no longer show the map.
- Demo listings cleaned up: fictional names, placeholder links only, and
  free for anyone to reuse.
- Basemap tiles come from the Protomaps API, with OpenStreetMap raster
  tiles as the fallback.
- If a hosted feed breaks, the site keeps showing the last good listings
  (or an empty directory on a freshly started server), never the demo data.

### Fixed

- Markers no longer vanish when zooming in on closely spaced listings.
- Profile links resolve to the right listing when one listing's id is the
  tail end of another's. An old link that could belong to two listings now
  returns 404 rather than guessing, and a feed where two listings would
  share the same URL is rejected.

### Security

- Security response headers and a vulnerability-reporting policy
  (`SECURITY.md`).
- Google Analytics only loads when a measurement ID is configured.
- Listing text in map popups is escaped; the `/test-data` page is removed.
- Dependencies updated to clear advisories, including GHSA-jrc7-96c5-q579
  in MapLibre.

## [2.1.0] — 2026-08-14

### Added

- Readable profile URLs, per-listing page titles and redirects for old links.
- Regional country labels and local-language place names.
- Submission alerts and validation in the deployed publishing workflow.

### Changed

- Updated map styling, typography and control contrast.
- Improved mobile cards, map controls and popup placement.
- Improved logo handling and publishing-error reporting.

## [2.0.0] — 2026-07-29

### Added

- Keyword search, location search, viewport filtering and clustered map pins.
- Expanded listing profiles, feedback and submission-guidance pages.
- Social sharing assets and fictional demo mode (`?mode=demo`).
- Moderated submissions, confirmation emails and automatic listing updates
  in the deployed app.

### Changed

- Moved the basemap to the Protomaps API for worldwide street-level coverage.

## [1.0.0] — 2025

Initial map and directory with an Oceania basemap, profile pages and an
expression-of-interest process.
