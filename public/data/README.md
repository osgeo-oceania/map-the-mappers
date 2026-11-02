# Geographic data

These files support map labels and location search. Listing records live
separately in `data/`; the basemap's roads, coastlines and boundaries are
loaded from the configured tile service, not from these files.

## Country label positions: `oceania-countries.geojson`

- **Origin:** created for this app by Cartisan for OSGeo Oceania. The 30
  countries and territories follow OSGeo Oceania's scope definition (the UN
  geoscheme for Oceania plus Indonesia, the Philippines and Timor-Leste).
  Coordinates were selected by hand to position specific country and
  territory labels legibly on this map. They are cartographic label anchors,
  not measured locations or calculated country centres. Local-language
  names are sourced from [Wikidata](https://www.wikidata.org); that credit
  applies to the names, not the label coordinates.
- **Licence:** [Apache License 2.0](../../LICENSE); retain the project's
  [NOTICE](../../NOTICE) when redistributing it.
- **Contents:** GeoJSON point features positioned for readable labels at
  small map scales. They are not boundary polygons, official centroids or
  authoritative statements about territorial boundaries.
- **Where they appear:** below zoom 5, these points supply country and
  territory labels missing from the low-zoom basemap. From zoom 5, the
  basemap's own country labels take over where available (Protomaps tiles,
  built from OpenStreetMap data); local labels remain for territories marked
  `upstream: false`.
- **Reuse:** adapt the points for label placement, checking their positions
  and offsets against your own map. Do not use them as representative
  country locations for distance, area, boundary or other geographic analysis.
- **Properties:** `name` and optional `name_local` label text; `offset` for
  label-placement adjustments; `upstream` indicates whether the label can
  hand over to the basemap's country labels at higher zoom.

The coordinates are chosen label anchors, not calculated centres. Edit
these points and labels when adapting the region. The rendering and zoom
handoff are defined in [`lib/map/config.ts`](../../lib/map/config.ts), with
an overview in [the architecture guide](../../docs/architecture.md#country-labels-two-layers-one-handoff).

## Place search: `oceania-gazetteer.json`

- **Source:** [GeoNames](https://www.geonames.org/), using its
  [downloadable country extracts and administrative-code file](https://download.geonames.org/export/dump/).
- **Licence and credit:** GeoNames, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Changes:** filtered to the configured region, selected administrative
  areas and populated places; reshaped into the app's search format and
  sorted by population. Capitals and administrative seats are retained
  regardless of population.
- **Generation:** [`scripts/build-gazetteer.mjs`](../../scripts/build-gazetteer.mjs)
  documents the input downloads, country selection and build command.

To regenerate it, follow the script's instructions in a separate working
folder, then copy the output to `public/data/oceania-gazetteer.json`.
Retain the GeoNames credit when distributing or adapting the file.

## Basemap attribution

The vector basemap uses OpenStreetMap data via Protomaps; the raster
fallback uses OpenStreetMap tiles. Credit is displayed in the map and on
the terms page. See [ASSETS.md](../../ASSETS.md#data-shown-on-the-map) for
source and licence links, including the fictional listing dataset.
