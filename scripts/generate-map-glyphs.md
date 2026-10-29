# Regenerating basemap font glyphs

MapLibre can't use a webfont — it needs pre-rendered **SDF glyph ranges** (`.pbf`).
The style names a font stack, and MapLibre fetches
`public/basemap/fonts/<stack name>/<range>.pbf`.

> ⚠️ **If the style names a font with no matching glyph folder, labels disappear
> silently** — no console error, no fallback. Always generate the glyphs first,
> then change the style.

Currently installed stacks:

| Stack                             | Source                                             | Used for                         |
| --------------------------------- | -------------------------------------------------- | -------------------------------- |
| `Plus Jakarta Sans Regular`       | Google Fonts (OFL), variable font default instance | all labels                       |
| `Plus Jakarta Sans Medium`        | same variable font, instantiated at `wght=500`     | labels the style sets in Medium  |
| `IBM Plex Serif SemiBold`         | Google Fonts (OFL)                                 | country labels                   |
| `Noto Sans Regular/Medium/Italic` | protomaps/basemaps-assets                          | retained as the upstream default |

## Steps

```bash
mkdir -p /tmp/glyphs && cd /tmp/glyphs
npm install fontnik --no-save          # native build; needs a working toolchain

# 1. Get the TTF (Google Fonts repo, OFL licensed)
curl -sL "https://github.com/google/fonts/raw/main/ofl/<family>/<File>.ttf" -o font.ttf

# 2. Variable fonts only — pin a weight to get a static instance.
#    Without this you only ever get the default instance.
python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
f = TTFont("font.ttf")
inst = instantiateVariableFont(f, {"wght": 500}, inplace=False, updateFontNames=True)
inst.save("font-medium.ttf")
PY
```

Then generate all 256 ranges:

```js
// gen.js — node gen.js <font.ttf> "<output dir>"
const fontnik = require('fontnik'),
  fs = require('fs')
const [, , src, outdir] = process.argv
const buf = fs.readFileSync(src)
fontnik.load(buf, (err, faces) => {
  if (err) throw err
  // The stack name MUST equal "<family_name> <style_name>" exactly —
  // that string is what the style references and what MapLibre requests.
  console.log('stack name:', faces[0].family_name + ' ' + faces[0].style_name)
  fs.mkdirSync(outdir, { recursive: true })
  for (let s = 0; s < 65536; s += 256) {
    fontnik.range({ font: buf, start: s, end: s + 255 }, (e, r) => {
      if (!e) fs.writeFileSync(`${outdir}/${s}-${s + 255}.pbf`, r)
    })
  }
})
```

Output goes to `public/basemap/fonts/<stack name>/`. Each family is ~1.3 MB
across 256 files — they're served individually and only the ranges actually
used get fetched (Latin text needs `0-255`, occasionally `256-511`).

## After generating

1. Reference the stack in `MAP_FONTS` in `lib/map/config.ts`.
2. Load the map and check the network panel: requests to
   `/basemap/fonts/<stack>/0-255.pbf` should return **~80 KB**, not 404.
   A 404 means the folder name doesn't match the stack name exactly.
3. Confirm labels still render — that's the real test.

## Licensing

Plus Jakarta Sans and IBM Plex Serif are both **SIL Open Font License**, which
permits embedding and redistribution. Keep `public/basemap/fonts/OFL.txt`
alongside them.
