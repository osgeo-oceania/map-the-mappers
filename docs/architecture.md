# Architecture

How the pieces fit, and the design decisions to understand before changing
them.

## Codebase map

This map describes the public release. Paths are relative to the repository
root; the app uses Next.js App Router, with a `page.tsx` file for each page.

| Path                                                           | Purpose and useful starting points                                                                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                                                         | Pages, shared layout, global styles and metadata routes. `map/page.tsx` loads the directory; `map/[id]/page.tsx` loads individual listings. `sitemap.ts` and `robots.ts` control discovery. |
| `components/directory/`                                        | Interactive directory: filters, location search, list/map views and sample-data notices. `directory-view.tsx` coordinates browser state.                                                    |
| `components/map/`, `components/profile/`                       | MapLibre map rendering, profile details and the profile mini-map.                                                                                                                           |
| `components/layout/`, `components/sections/`, `components/ui/` | Shared header/footer, content-page sections and reusable controls. `components/seo/` renders JSON-LD; `components/analytics/` integrates optional Google Analytics.                         |
| `lib/data/`                                                    | Feed validation, data-source selection and vocabulary used in submission guidance.                                                                                                          |
| `lib/map/`, `lib/geo/`                                         | Basemap styling and bounds, map helpers, gazetteer search and proximity calculations.                                                                                                       |
| `lib/seo/`, `lib/utils/`, `lib/constants.ts`                   | Indexing and structured data, profile URLs and other helpers, canonical site URL and contact details. `lib/utils.ts` contains shared class-name helpers.                                    |
| `types/`                                                       | Shared TypeScript shapes, including `Profile` and directory filters in `profile.ts`.                                                                                                        |
| `data/`                                                        | Fictional `sample-profiles.json` and optional production `profiles.json`.                                                                                                                   |
| `public/`                                                      | Assets served by path: images, icons, basemap fonts/sprites and regional geographic data in `data/`.                                                                                        |
| `scripts/`                                                     | Listing validation, a secrets check and geographic-data or map-asset generation instructions.                                                                                               |
| `__tests__/`                                                   | Vitest tests for feed validation, providers, URLs, indexing and other behaviour. Run with `npm test`.                                                                                       |
| `docs/`, `.github/`                                            | Setup, feed and adaptation guides; repository workflows and issue templates.                                                                                                                |

For specific edits, use the file-by-file [adaptation checklist](ADAPTING.md).
Environment settings are listed in `.env.example`; branding, region and
content are adapted in code rather than through those settings.

## The public architecture

```
Your publishing process ──▶ JSON listings ──────────────▶ directory app
(CMS, spreadsheet, script,   hosted at a URL, or bundled   (this repository)
 or a file edited by hand)   as data/profiles.json
                             (the format, docs/FEED.md)
```

The app knows one shape, defined in `types/profile.ts` and enforced by
`lib/data/contract.ts`, and resolves where to read it once per server
process (`getDataMode()` in `lib/data/providers.ts`):

| Configuration                          | Mode    | Source                                                           |
| -------------------------------------- | ------- | ---------------------------------------------------------------- |
| `PUBLISHED_SNAPSHOT_URL` set           | hosted  | The feed at that URL, re-fetched at most every 60 s (data cache) |
| URL unset, `data/profiles.json` exists | bundled | That file, read from disk and shipped with the build             |
| Neither                                | sample  | `data/sample-profiles.json`, a fictional set                     |

`?mode=demo` serves the fictional set on any deployment. How listings are
produced, moderated and hosted is outside the app. OSGeo Oceania produces
its own feed through a private moderation process; that implementation is
not part of this repository. These properties hold for any deployment:

- **The app holds no submission data.** It reads only the public listings,
  and projects every record onto the public `Profile` shape before it can
  reach the browser, so unknown fields are dropped. That projection cannot
  unpublish anything: whatever is in a feed is already public at its URL,
  and a bundled file is public in the deployment. The producer is
  responsible for removing private fields.
- **A bad hosted feed is rejected whole, and degrades to stale or empty
  data, never to malformed listings or the sample set.** The runtime loader
  rejects the feed on a network error, a non-2xx response, invalid JSON or
  any validation error, and logs `[feed] rejected: …`. The server instance
  then serves the last feed it accepted, held in memory, so per instance
  and lost on restart. An instance that has not accepted a feed since it
  started serves an empty directory. With a feed URL configured, the
  fictional sample set is never served.
- **A bad bundled file stops the build.** `prebuild` validates
  `data/profiles.json` (when present) and `data/sample-profiles.json`
  against the feed validation rules, with private fields as errors. The loader repeats
  the check and throws rather than serving part of the file.
- **Fictional data is always marked and never indexed.** Whenever a page
  shows the sample set (sample mode, or `?mode=demo`), `/map` and
  `/map/[id]` render a sample-data notice, set `noindex, nofollow`, and
  omit the `ItemList` and per-listing `Organization` structured data; the
  sitemap lists listing URLs only in hosted or bundled mode. Bundled data
  is treated exactly like a hosted feed for indexing, sitemap and
  structured data.
- **No secret reaches the browser.** The only client-exposed values are the
  Protomaps key (restrict it by origin upstream) and the Google Analytics
  measurement id, both public by design.

## Listing data flow

1. **Produce public JSON.** Maintain `data/profiles.json` directly or
   publish a hosted array matching [FEED.md](FEED.md). There is no database
   or listing editor in the public app. Submission and feedback pages start
   with unconfigured notices; connecting a form and processing its responses
   are part of your own publishing process.
2. **Load and validate on the server.** `getProviders()` in
   `lib/data/providers.ts` selects hosted, bundled or sample data and uses
   `parseProfiles()` in `lib/data/contract.ts` to produce public `Profile`
   records. `scripts/validate-profiles.ts` also validates local data before
   a build. Source precedence and failure behaviour are described above.
3. **Render the directory.** `app/map/page.tsx` loads listings and derives
   the profile-type, capability and country options from the data. It
   passes those values to `components/directory/directory-view.tsx`.
   Search, filters, location selection and optional viewport filtering run
   in the browser; the resulting listings feed the cards and map pins.
   Filter and view preferences are stored in browser session storage.
4. **Open a listing.** Cards and map links use
   `lib/utils/profile-url.ts` to build `/map/<slug>-<id>` URLs.
   `app/map/[id]/page.tsx` loads the selected dataset, resolves the record,
   redirects non-canonical URLs and renders the profile components and
   mini-map. Missing records return a 404.
5. **Apply indexing rules.** `lib/seo/` supplies listing metadata and
   structured data; `app/sitemap.ts` supplies discovery URLs. Sample and
   demo pages follow the fictional-data safeguards above. The gazetteer
   and basemap are separate geographic resources, not listing sources.

## Location search (`public/data/oceania-gazetteer.json`)

~6,200 places (ADM1/ADM2 regions, populated places ≥5,000, every capital and
admin seat regardless of size), fetched lazily on first search, fuzzy-matched
client-side. Built by `scripts/build-gazetteer.mjs` from GeoNames (CC BY 4.0,
credited on the map and the terms page). ~137 KB gzipped.

## Basemap

Styling lives in `lib/map/config.ts` — a transform pipeline over
`@protomaps/basemaps` layers, served from the **Protomaps API**
(`NEXT_PUBLIC_PROTOMAPS_KEY`; whole-world coverage, native z15). Glyphs and
sprites are self-hosted in `public/basemap/` (from
`protomaps/basemaps-assets`; `scripts/generate-map-glyphs.md` documents the
font pipeline).

Without a key the map uses OpenStreetMap raster tiles. With a key, the first
failed request to the Protomaps API switches that map to the same raster
tiles. The raster fallback uses the OpenStreetMap Foundation's tile
servers, which have a usage policy; treat it as a fallback, not a production
basemap. The map needs WebGL 2 (MapLibre GL JS); a browser without it shows
no map.

Attribution (`BASEMAP_ATTRIBUTION`) uses ODbL's required phrase.

## Country labels: two layers, one handoff

Country names come from two sources that hand over at zoom 5.

|            | `oceania_country_labels` (ours, <z5)                                 | `places_country` (Protomaps, z5+) |
| ---------- | -------------------------------------------------------------------- | --------------------------------- |
| Source     | `public/data/oceania-countries.geojson`, hand-placed anchors         | OSM `name` tag                    |
| Visibility | local anchors; collision enabled on phones and on desktop below z1.8 | competes for space, can drop      |

Our own layer exists because Protomaps doesn't ship the small Pacific
nations into tiles below ~z4, and never ships the dependent territories (New
Caledonia, French Polynesia, Guam, American Samoa, Wallis & Futuna, Norfolk,
the Marianas, Christmas, Cocos) at any zoom. Without this layer, several
chapter members are absent from the map.

The endonyms in the GeoJSON (`name_local`) have no upstream counterpart.
Names can change at the z5 handoff where OSM's `name` is the English form
("Papua Niugini" → "Papua New Guinea").

On phones (<768px) collision is enabled — thirty labels cannot fit — and
`symbol-sort-key` places sovereign states first. Desktop collision is also
enabled below zoom 1.8.

## Profile URLs

`/map/<slug>-<id>`; the slug derives from the listing name, the id is the
authority. Exact ids and current canonical URLs take precedence; an old
slug redirects with HTTP 307 only when its id suffix matches uniquely.
Ambiguous suffix matches return 404. The feed validator rejects duplicate
canonical URLs and canonical-versus-id collisions. Historical URL ownership
is not tracked; see [FEED.md](FEED.md#profile-url-resolution) for the limits.
Implementation: `lib/utils/profile-url.ts`.

## Known trade-offs

- **Duplicated mobile/desktop DOM** in
  `components/directory/directory-view.tsx` (`hidden md:flex` /
  `md:hidden`): every control exists twice in the DOM.
- **`ScrollReveal` wrappers are containing blocks** for absolute descendants
  (they animate with transforms). Position elements outside them — the
  component's doc comment has the details.
- **Admin borders sit below WCAG 3:1** against the ground: they are
  orientation, not content; the map's information (pins, labels)
  clears the stricter text thresholds. Measurements in `lib/map/config.ts`.
