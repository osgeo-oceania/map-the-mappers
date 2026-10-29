# Social share (OpenGraph) image

The share image does not live in this folder. It uses the Next.js file
convention:

```
app/opengraph-image.png
```

Drop a **1200 × 630 PNG** at that exact path and Next automatically emits the
`og:image` and `twitter:image` tags with absolute URLs (built from
`metadataBase` in `app/layout.tsx`). Nothing else needs editing — there is no
`images:` array to maintain, and the Twitter card inherits the same file.

## Requirements

|                |                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Format**     | **PNG** (or JPG). **Never SVG.** LinkedIn, Facebook, Slack, WhatsApp, X and iMessage all ignore SVG OG images and render **no preview at all**. |
| **Dimensions** | 1200 × 630 (1.91:1). Other ratios get cropped unpredictably, differently per platform.                                                          |
| **File size**  | Under ~1 MB — some scrapers give up on large files.                                                                                             |
| **Safe area**  | Keep text clear of the outer ~60 px; some surfaces crop to a square thumbnail.                                                                  |
| **Legibility** | Often rendered ~400 px wide in a feed. Check the headline is readable at that size.                                                             |

## Content guidance

This is the **site-level** card, so it should say what the map _is_ — not
submitter voice. Suggested: your organisation's lockup, the site name, and a
one-line proposition on a brand-colour field.

Brand colours are defined in `tailwind.config.ts`.

## Verifying it works

Scrapers cache aggressively, so use each platform's debugger to force a
refresh after deploying:

- LinkedIn — <https://www.linkedin.com/post-inspector/>
- Facebook — <https://developers.facebook.com/tools/debug/>

Or confirm the tag exists and is absolute:

```bash
curl -s https://<your-domain> | grep -o '<meta property="og:image[^>]*>'
```

## Related icons (already in place)

| File                 | Used by                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `app/icon.svg`       | Modern browsers (crisp at any size)                                                |
| `app/favicon.ico`    | Safari, older Edge, crawlers and feed readers that can't read SVG                  |
| `app/apple-icon.png` | iOS home screen (180 × 180, flattened onto brand cream — iOS ignores transparency) |
