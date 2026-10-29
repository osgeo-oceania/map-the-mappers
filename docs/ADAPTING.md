# Adapting this map for your region

This project is published so other OSGeo chapters, and similar communities,
can run their own capability map. It is **a template to fork, not a
platform to configure**: you take the code and make it yours. This page
lists everything specific to OSGeo Oceania, as a checklist, and ends with a
search that confirms nothing is left.

Deployment is covered in [SETUP.md](./SETUP.md). The data feed is covered in
[FEED.md](./FEED.md).

## 1. Branding and identity (required)

The OSGeo Oceania name, logo and compass mark are trademarks and are **not**
covered by the code licence ([TRADEMARKS.md](../TRADEMARKS.md)). The FOSS4G
photographs and the product render are © OSGeo Oceania. The line-art
illustrations are CC BY 4.0 and may stay with attribution
([ASSETS.md](../ASSETS.md)).

| File                                                                                                  | What to replace                                                                                                                                            | How to verify                                                               |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `public/osgeo-oceania-logo*`, `public/osgeo-logo*.svg`                                                | Your logos. Update the paths and alt text where they are used (header, footer, `lib/seo/schema.ts`).                                                       | Header and footer show your logo; final sweep is clean.                     |
| `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png` | Your icons, same sizes.                                                                                                                                    | Browser tab icon; icons listed in `/manifest.webmanifest`.                  |
| `app/opengraph-image.png`                                                                             | Your 1200 × 630 share image ([public/OG_IMAGE_README.md](../public/OG_IMAGE_README.md)).                                                                   | `og:image` in the page source; a platform's share debugger.                 |
| `public/*foss4g*.png`, `public/product-promo.png`                                                     | Your own images, or remove the sections that use them (`app/page.tsx`, `components/sections/hero-section.tsx`).                                            | `git grep -n -e foss4g -e product-promo -- app components` returns nothing. |
| `components/layout/header.tsx`, `components/layout/footer.tsx`                                        | Logo, chapter link, copyright line.                                                                                                                        | Every page's header and footer.                                             |
| `app/layout.tsx` (`metadata`)                                                                         | `title`, `description`, `keywords`, `authors`, `creator`, `publisher`, `metadataBase` (your domain), `openGraph` (`url`, `siteName`, `locale`), `twitter`. | Page source: `<title>`, `og:url`, `og:site_name`.                           |
| `NEXT_PUBLIC_GA_ID` (environment)                                                                     | Your Google Analytics id, or leave unset for none. Mention it in your privacy page if set.                                                                 | Network tab: no `googletagmanager.com` requests when unset.                 |
| `lib/constants.ts`                                                                                    | `SITE_URL` (canonical origin, keep it equal to `metadataBase`), `ADMIN_EMAIL`, `FEEDBACK_SUBJECT`.                                                         | `/robots.txt` and `/sitemap.xml` show your domain; the feedback email link. |
| `lib/seo/schema.ts`                                                                                   | `SITE_NAME`; the publisher `Organization` (`name`, `url`, `logo`); the `WebSite` description.                                                              | JSON-LD in the home page source.                                            |
| `app/map/[id]/page.tsx`                                                                               | `SITE_NAME`, used in profile page titles.                                                                                                                  | A profile page's `<title>`.                                                 |
| `app/manifest.ts`                                                                                     | `name`, `short_name`, `description`, `background_color`, `theme_color`.                                                                                    | `/manifest.webmanifest`.                                                    |
| `public/llms.txt`                                                                                     | Rewrite for your site: name, region, page URLs, contact.                                                                                                   | `/llms.txt`.                                                                |
| `public/google2d8bbf9182b212ea.html`                                                                  | Delete it: it verifies OSGeo Oceania's Google Search Console. Add your own if you need one.                                                                | The file is gone.                                                           |
| `SECURITY.md`, `CONTRIBUTING.md`                                                                      | Your security contact and contribution policy.                                                                                                             | Final sweep is clean.                                                       |
| `tailwind.config.ts`, `lib/map/config.ts` (`BRAND` and the palette constants)                         | Brand colours and type. The basemap reads `lib/map/config.ts`, so change both.                                                                             | Pages and map in your colours.                                              |

## 2. Region geometry

| File                                      | What to replace                                                                                                                                                                                                                                                                   | How to verify                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `lib/map/config.ts` (bounds)              | `OCEANIA_REGION_BOUNDS`, `OCEANIA_BOUNDS`, `OCEANIA_CENTER`, `OCEANIA_ZOOM`. Read the antimeridian comment first: east-of-180 handling only matters if your region crosses it.                                                                                                    | `/map` opens framed on your region, on desktop and phone.  |
| `public/data/oceania-countries.geojson`   | Country label anchors for your region (anchors, not centroids; `name_local` endonyms; optional `offset` nudges). Or delete the layer (`countryLabelLayer` in `lib/map/config.ts`) and rely on the default Protomaps labels. If you rename the file, update `COUNTRY_LABELS_PATH`. | Zoomed out below z5, every country you expect is labelled. |
| `public/data/oceania-gazetteer.json`      | Regenerate with `scripts/build-gazetteer.mjs` for your countries (edit `COUNTRY` and the download list in its header). GeoNames data: keep the CC BY 4.0 credit. If you rename the file, update `GAZETTEER_URL` in `lib/geo/gazetteer.ts`.                                        | Location search finds a town in your region.               |
| `NEXT_PUBLIC_PROTOMAPS_KEY` (environment) | Your Protomaps key, restricted to your domain. Without one the map uses plain OpenStreetMap raster tiles.                                                                                                                                                                         | The branded basemap loads on your domain.                  |
| `vercel.json`                             | Optional Vercel-only configuration. If using Vercel, choose a `regions` value near your users (currently Sydney, `syd1`). Other hosts do not use this file.                                                                                                                       | Vercel project → Functions region.                         |

## 3. Content, forms and sample data

| File                                                                                                          | What to replace                                                                                                                                                      | How to verify                                                                   |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/page.tsx`, `app/about/page.tsx`, `app/listing-criteria/page.tsx`, `app/submission-requirements/page.tsx` | Copy and page metadata for your chapter.                                                                                                                             | Read each page.                                                                 |
| `app/submit/page.tsx`                                                                                         | The public release starts with an unconfigured notice. Add your own form embed or link, and update the page copy and metadata.                                       | `/submit` shows your form, or keep the unconfigured notice.                     |
| `app/feedback/page.tsx`                                                                                       | The public release starts with an unconfigured notice. Add your own feedback form or contact method, and update the page copy and metadata.                          | `/feedback` shows your form or contact method, or keep the unconfigured notice. |
| `app/terms-and-privacy/page.tsx`                                                                              | Operator, contact, what you collect, and the analytics you actually run. Keep the data-licence section (OpenStreetMap ODbL, GeoNames): it applies to every fork.     | `/terms-and-privacy`.                                                           |
| `lib/data/vocabularies.ts`                                                                                    | Your profile types and capability areas, as offered on your submission form. Listed on the submission-requirements page. The directory's filters come from the feed. | `/submission-requirements`.                                                     |
| `data/sample-profiles.json`                                                                                   | Fictional sample listings, with Oceania places and example-domain links. Demo mode (`?mode=demo`) is public, so replace or reword them.                              | `npx tsx scripts/validate-profiles.ts` passes; `/map?mode=demo`.                |
| `app/layout.tsx` (fonts)                                                                                      | Fonts load the `latin` and `latin-ext` subsets (covers Pacific macrons). Extend the subsets if your languages need other ranges, and check the map fonts cover them. | Place names in your languages render in the brand font.                         |

## 4. Your data feed

The app reads exactly one thing: **a JSON array of listings**, either
bundled as `data/profiles.json` or hosted at `PUBLISHED_SNAPSHOT_URL` and
re-fetched roughly every minute. [FEED.md](./FEED.md) is the full
reference: the data modes, every field, an example listing, failure
behaviour and the validation command.

Ways to produce it:

1. **A bundled file.** Commit `data/profiles.json` and rebuild to publish
   ([SETUP.md](./SETUP.md), Path A).
2. **Your own CMS or process.** Wire whatever you already use (a headless
   CMS, Airtable, a spreadsheet export) to emit a hosted feed
   ([SETUP.md](./SETUP.md), Path B).

OSGeo Oceania produces its own feed through a private moderation process;
that implementation is not part of this repository.

## 5. Final sweep

Run this from the repository root. Repeat until it prints nothing:

```bash
git grep -n -I -i -E 'osgeo-oceania|osgeo oceania' \
  -- . ':!NOTICE' ':!ASSETS.md' ':!TRADEMARKS.md' ':!README.md' ':!CHANGELOG.md' ':!docs/'
```

- `osgeo-oceania` catches the domain (`map.osgeo-oceania.org`), the contact
  address (`admin@osgeo-oceania.org`) and the logo file names.
- `osgeo oceania` catches the organisation name.
- Some hits are code comments; reword them too. A name split across two
  lines of prose will not match, so read your rewritten pages as well.
- The excluded files are the attribution you must keep (`NOTICE`, and the
  credits in `ASSETS.md` and `TRADEMARKS.md`) and this upstream
  documentation. Rewrite `README.md` and `docs/` for your fork as you see
  fit.

`git grep` searches tracked files only, so commit (or `git add`) new files
before the last run.

## Questions

Open an issue. Pull requests are not accepted (see
[CONTRIBUTING.md](../CONTRIBUTING.md)), but setup and adaptation questions
are welcome.
