# Security

## Reporting a vulnerability

Email **admin@osgeo-oceania.org** with "Security" in the subject line.
Please do not open a public issue for a security problem.

If private vulnerability reporting is enabled on this GitHub repository,
you can use that instead.

This repository is maintained by OSGeo Oceania. We aim to acknowledge
reports within a week and to fix confirmed issues in the next release, but
there is no service-level commitment to users of the published source.

## Supported versions

Only the latest tagged release receives fixes. Forks are responsible for
their own deployments (see [docs/ADAPTING.md](docs/ADAPTING.md)).

## Scope

The application in this repository, as deployed from a tagged release. Any
process that produces the data feed, including OSGeo Oceania's Google
Workspace moderation pipeline, is not part of this repository.

## Design notes for reviewers

- No secret reaches the browser. The only client-exposed values are the
  Protomaps key (origin-restricted upstream) and the analytics id.
- The app reads only the public feed and drops any field outside the
  documented feed format. Listing text is HTML-escaped wherever it is
  interpolated into markup.
- Keeping private submission data out of the feed is the producer's
  responsibility; see [docs/FEED.md](docs/FEED.md).
