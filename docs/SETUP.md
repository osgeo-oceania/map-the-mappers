# Setup: deploying the map

This page takes a fork from your machine to a public deployment. Do the
rebranding in [ADAPTING.md](./ADAPTING.md) first or alongside it.

## Prerequisites

- **Node.js 22 or later.**
- Install dependencies from the lockfile:

  ```bash
  npm ci
  npm run dev
  ```

  With no environment variables and no `data/profiles.json`, the app runs
  in **sample mode**: <http://localhost:3000/map> shows fictional listings
  under a notice, and those pages are kept out of search indexes.
  `.env.example` documents every variable; copy it to `.env.local` to try
  real values locally.

## Choose a data path

The app reads one shape: a JSON array of listings, defined in
[FEED.md](./FEED.md). It takes that array from one of two places, and
which one is set by configuration alone (see
[FEED.md, data modes](./FEED.md#data-modes)).

|                  | Path A: bundled JSON                           | Path B: hosted JSON feed                       |
| ---------------- | ---------------------------------------------- | ---------------------------------------------- |
| Your listings    | `data/profiles.json`, committed to your fork   | A JSON file at an HTTPS URL you host           |
| Configuration    | None: the file's presence selects it           | `PUBLISHED_SNAPSHOT_URL`                       |
| A change goes up | With the next build and deploy                 | Within about a minute, no rebuild              |
| Suits            | Directories edited by a few people through git | Listings produced by a CMS, script or pipeline |
| Hosting          | Vercel or any Node.js host                     | Vercel or any Node.js host                     |

Both are supported for production. If `PUBLISHED_SNAPSHOT_URL` is set, the
feed wins and `data/profiles.json` is ignored.

OSGeo Oceania produces its own feed through a private moderation process;
that implementation is not part of this repository.

## Path A: bundled JSON

1. **Create `data/profiles.json`.** A JSON array in the shape in
   [FEED.md](./FEED.md); a record from `data/sample-profiles.json` is a
   working starting point. The file is public once deployed, so include
   only the documented public fields.
2. **Validate it.** `npm run validate-data` checks `data/profiles.json` and
   the sample file. `npm run build` runs the same check first and stops on
   any error, including a private field such as `submitter_email`.
3. **Commit and deploy.** Commit the file, then deploy (see
   [Deploying the app](#deploying-the-app)). Leave `PUBLISHED_SNAPSHOT_URL`
   unset.
4. **Check it works.** `/map` shows your listings with no sample-data
   notice, and `/sitemap.xml` lists each one.

To change a listing later: edit `data/profiles.json`, run
`npm run validate-data`, commit, then rebuild and deploy.

## Path B: hosted JSON feed

1. **Publish your feed.** Produce a JSON array that matches
   [FEED.md](./FEED.md), check it with
   `npm run validate-data -- my-feed.json`, and host it at an HTTPS URL.
   Strip private fields before you upload it.
2. **Deploy the app** (see [Deploying the app](#deploying-the-app)).
3. **Set `PUBLISHED_SNAPSHOT_URL`** to the feed URL, for build and runtime
   (the sitemap is generated from it).
4. **Check it works.** Open `/map` and confirm your listings appear. Change
   something in the feed and confirm the site shows it within about a
   minute. If listings disappear, check the server logs for
   `[feed] rejected:`; the line gives the reason, and
   [FEED.md](./FEED.md#when-the-feed-fails) explains what the app serves
   while the feed is broken.

## Deploying the app

The app needs a host that supports the Next.js Node.js runtime. Vercel is
optional; no Vercel account, Blob store or cron is required by the public
release. A static-file-only host is not supported by this deployment path.

### Generic Node.js host

1. Install Node.js 22 or later on the build and runtime environments.
2. Configure the environment variables below before building. For a hosted
   feed, provide `PUBLISHED_SNAPSHOT_URL` at both build and runtime; for
   bundled data, include `data/profiles.json` in the deployment.
3. From the repository root, install and build:

   ```bash
   npm ci
   npm run build
   ```

   The build validates local listing data first and stops on invalid data.
   It also downloads the fonts used by `next/font/google`, so the build
   environment needs outbound access to Google Fonts.

4. Run the production server from the same application directory:

   ```bash
   npm start
   ```

   The default port is 3000; set `PORT` through your host to change it.
   Keep the built `.next/` output, `public/`, `data/`, dependencies and
   application configuration available at runtime. This is the standard
   Next.js server path, not a standalone-output or static-export build.

5. Configure your host to keep the process running, restart it after a
   failure, and serve your domain over HTTPS (typically through a reverse
   proxy). Rebuild and restart when code, bundled listings or compiled
   environment values change.

Check `/map`, a listing detail page, `/sitemap.xml` and `/robots.txt` on the
published domain. Without your own listings, expect the sample-data notice
and no listing URLs in the sitemap.

### Vercel (optional)

Import the repository with the Next.js preset and set the environment
variables below in the project settings before deploying. `vercel.json`
supplies install/build commands and a function region; choose a region
appropriate for your users. This file applies only to Vercel and can be
removed when deploying elsewhere. The public release has no Vercel cron
or Vercel Analytics integration.

### Environment variables

| Variable                    | Needed      | Notes                                                                                                                                         |
| --------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLISHED_SNAPSHOT_URL`    | Path B only | Your feed URL. Set it for build and runtime. Unset on Path A.                                                                                 |
| `NEXT_PUBLIC_PROTOMAPS_KEY` | no          | Branded vector basemap. Without it the map uses plain OpenStreetMap raster tiles. Restrict the key to your domain in the Protomaps dashboard. |
| `NEXT_PUBLIC_GA_ID`         | no          | Google Analytics measurement id. Unset means no Google Analytics.                                                                             |

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so set them
before you build and rebuild after changing them. `.env.example` documents
each one.

Domain, site name and the canonical URL are code, not configuration: see
[ADAPTING.md](./ADAPTING.md). Google Analytics is optional and disabled
when its measurement ID is unset. Vercel Analytics is excluded from the
public release. Review the privacy page to match your chosen host and any
analytics you enable.

## Operational notes

- The fictional sample listings serve only when neither
  `PUBLISHED_SNAPSHOT_URL` nor `data/profiles.json` is configured, or
  behind `?mode=demo`. They always carry a notice, and those pages are
  `noindex` and absent from the sitemap.
- A broken feed never replaces the listings with the fictional sample. A
  server instance that has not yet loaded a good feed shows an empty
  directory; see [FEED.md](./FEED.md#when-the-feed-fails).
