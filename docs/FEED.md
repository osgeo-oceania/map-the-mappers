# The listings feed

The directory has one data shape: **a JSON array of listings**. This page
is the reference for it. If you can produce a file in this shape, you can
run the map. How you produce it is up to you: a CMS export, a spreadsheet
script, a database job, or a file you edit by hand.

## Data modes

Where the app takes that array from is decided by configuration alone, once
per server process:

| Configuration                          | Mode    | What the app serves                                                                                                     |
| -------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `PUBLISHED_SNAPSHOT_URL` set           | hosted  | The feed at that URL, fetched and validated at runtime ([below](#what-the-app-fetches)). Never the sample data.         |
| URL unset, `data/profiles.json` exists | bundled | Your listings from that file, validated at build and shipped with it. Indexed like a hosted feed.                       |
| URL unset, no `data/profiles.json`     | sample  | The fictional listings in `data/sample-profiles.json`, under a notice. Pages are `noindex` and absent from the sitemap. |
| `?mode=demo` on any deployment         | demo    | The same fictional listings, under a notice, `noindex`. Never reads the feed or `data/profiles.json`.                   |

Hosted and bundled are both production options; [SETUP.md](./SETUP.md)
walks through each. The fictional listings exist to show the map populated
before real data is configured. They never carry `Organization` or
`ItemList` structured data.

> [!IMPORTANT]
> **Remove private data before you host the feed or commit the file.** A
> feed URL is public, and so is a bundled file once deployed: anyone can
> download it. Publish only the fields listed below. Strip submitter names
> and emails, consent answers, moderation notes, review status and anything
> else that is not in the documented feed format **before** the file is uploaded or
> committed. The app drops unknown fields before rendering, but that cannot
> protect data that is already readable at a public URL.

## What the app fetches

In hosted mode:

- **One URL**, set as `PUBLISHED_SNAPSHOT_URL`. Use HTTPS. Any static host
  works (object storage, a CDN, GitHub Pages, your CMS); no API is needed.
- **One JSON array**, one object per listing. Order does not matter; the
  directory sorts and filters on its own.
- **Refresh:** the app re-fetches the URL at most every 60 seconds (Next.js
  data cache). Your host's own HTTP caching can add to that, so a change
  normally shows within about a minute.
- **Demo mode** (`?mode=demo`) never reads the feed; it shows the bundled
  fictional set in `data/sample-profiles.json`.

### When the feed fails

The whole feed is accepted or rejected as one unit. The app rejects it when
the request fails, the response is not HTTP 2xx, the body is not valid JSON,
or **any** listing fails validation. One bad listing rejects the whole
file, not just that listing.

On a rejection the server logs a line starting `[feed] rejected:` with the
reason (the first five validation errors are quoted), and then:

- if this server instance has accepted a feed since it started, it keeps
  serving that last accepted set (held in memory);
- if it has not (a freshly started instance), it serves an **empty
  directory**.

It never falls back to the bundled fictional listings once
`PUBLISHED_SNAPSHOT_URL` is set. The last-accepted set is per instance and
is lost on restart. On serverless hosts instances start often, so a feed
that stays broken will show some visitors an empty directory. Validate
before you publish (below), and replace the file in one step rather than
writing it in place.

### Empty feeds

`[]` is a valid feed. The app serves it as an empty directory.

## Example listing

A complete, valid, fictional listing, shown as a one-item feed:

```json
[
  {
    "id": "1",
    "listing_name": "Auckland Geospatial Solutions",
    "profile_type": [
      "Software vendor / maintainer",
      "Service provider / consultancy"
    ],
    "country": "New Zealand",
    "city_region": "Auckland",
    "lat": -36.8485,
    "lon": 174.7633,
    "contact_url": "mailto:hello@auckland-geospatial-solutions.example.org",
    "primary_url": "https://auckland-geospatial-solutions.example.org",
    "short_description": "Leading geospatial consulting firm providing comprehensive open source GIS solutions",
    "longer_about": "Leading geospatial consulting firm providing comprehensive open source GIS solutions for government and private sector clients in Auckland.",
    "oss_projects": [
      {
        "name": "Auckland Toolkit",
        "url": "https://example.com/auckland-geospatial-solutions"
      }
    ],
    "capability_areas": [
      "Web mapping & web applications",
      "Geospatial databases & infrastructure",
      "Custom development",
      "Consulting & advisory"
    ]
  }
]
```

`logo_url` is optional and absent here, so the card shows a letter avatar.

## Fields

The shape is defined in [`types/profile.ts`](../types/profile.ts) and
enforced by [`lib/data/contract.ts`](../lib/data/contract.ts). "Required"
means the key must be present with a value of the right type; "may be empty"
means an empty string or empty array is accepted.

| Field               | Type                         | Required          | Rules and notes                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ---------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | string                       | yes, non-empty    | Unique across the feed (duplicates reject the feed). **Keep it stable**: profile URLs embed it (`/map/<name-slug>-<id>`), so changing an id breaks every link to that listing. A listing's canonical URL (`<name-slug>-<id>`) must not equal another listing's canonical URL or id (the validator rejects either collision); hyphenated ids that are suffixes of other ids (`1` and `org-1`) are allowed. UUIDs are recommended. |
| `listing_name`      | string                       | yes, non-empty    | The person or organisation name. Renaming changes the slug. Old links redirect when they have a unique id suffix match; ambiguous old links return 404.                                                                                                                                                                                                                                                                          |
| `profile_type`      | array of strings             | yes, at least one | Every entry non-empty. Values become the "profile type" filter; use a fixed vocabulary.                                                                                                                                                                                                                                                                                                                                          |
| `country`           | string                       | yes, may be empty | Becomes the country filter.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `city_region`       | string                       | yes, may be empty | Shown next to the country.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `lat`               | number                       | yes               | JSON number from -90 to 90. A blank, `null`, a string or an out-of-range value rejects the feed.                                                                                                                                                                                                                                                                                                                                 |
| `lon`               | number                       | yes               | JSON number from -180 to 180. Same rules as `lat`.                                                                                                                                                                                                                                                                                                                                                                               |
| `contact_url`       | string                       | yes, may be empty | `https://…`, `mailto:` or `tel:`. A value without a scheme is linked as `https://`.                                                                                                                                                                                                                                                                                                                                              |
| `primary_url`       | string                       | yes, may be empty | The listing's main link. Same handling as `contact_url`.                                                                                                                                                                                                                                                                                                                                                                         |
| `short_description` | string                       | yes, may be empty | Card summary. Aim for 280 characters or fewer (not enforced).                                                                                                                                                                                                                                                                                                                                                                    |
| `longer_about`      | string                       | yes, may be empty | Profile-page body. Aim for 1000 characters or fewer (not enforced).                                                                                                                                                                                                                                                                                                                                                              |
| `oss_projects`      | array of `{ "name", "url" }` | yes, may be empty | Both keys must be strings. Entries where both are empty are dropped. The profile page shows them as links; up to three is the intended use.                                                                                                                                                                                                                                                                                      |
| `capability_areas`  | array of strings             | yes, may be empty | Becomes the "capability area" filter.                                                                                                                                                                                                                                                                                                                                                                                            |
| `logo_url`          | string                       | no                | An absolute `https://` URL to an image. Omit it, or leave it empty, for the letter-avatar fallback. The validator checks only that it is a string.                                                                                                                                                                                                                                                                               |

Any other key is ignored and dropped by the app. The validator below
reports a known set of private column names (`submitter_email`,
`moderation_notes`, `status` and similar; see `PRIVATE_FIELDS` in
`lib/data/contract.ts`) as errors, but it cannot recognise every private
field you might have. Removing them is the producer's responsibility.

## Profile URL resolution

The app resolves an exact id first, then an exact current canonical URL,
then a unique matching `-<id>` suffix for an old slug. If multiple ids match
that suffix, it returns 404 rather than guessing. For example, with ids
`1` and `org-1`, `old-org-1` is ambiguous unless it is a current canonical
URL. Bare ids and current canonical URLs remain usable.

Old names are not stored as aliases. A historical URL that becomes another
listing's current canonical URL or exact id resolves to that current owner;
preserving such historical links would require an explicit alias system.

## Validating a feed

Run the feed validator against your file before you publish it:

```bash
npx tsx scripts/validate-profiles.ts path/to/my-feed.json
# or: npm run validate-data -- path/to/my-feed.json
```

With no path, `npm run validate-data` checks the bundled files:
`data/sample-profiles.json`, and `data/profiles.json` when it exists. The
build runs that same check first, so an invalid bundled file stops the
build.

A valid file:

```
✅ Profile data valid — 2 record(s) across 1 source(s): path/to/my-feed.json.
```

A file with a blank latitude, an out-of-range longitude and a leaked
private field (real output; exit code 1):

```
❌ Profile data validation failed (3 issue(s)):

  • feed-check/my-feed.json[0] (15): "lat" must be a number, got ""
  • feed-check/my-feed.json[1] (1): private field "submitter_email" must not be published
  • feed-check/my-feed.json[1] (1): "lon" 274.76 is outside -180..180
```

Each line names the array index and the listing's `id`. The same rules run
inside the app, so a file that passes here will be accepted at runtime.
