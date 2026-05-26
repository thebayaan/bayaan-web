# Third-Party Licenses

Bayaan Web is distributed under **AGPL-3.0-or-later**. This file lists the
third-party software, fonts, and content bundled with or consumed at runtime
by the production build, with attribution and licensing for each.

All software dependencies are either permissive or copyleft-compatible with
AGPL.

## Contents

- [License distribution (npm packages)](#license-distribution-npm-packages)
- [Direct production dependencies](#direct-production-dependencies)
- [Fonts](#fonts)
- [Quranic content](#quranic-content)
- [Adhkar content](#adhkar-content)
- [Regenerating this file](#regenerating-this-file)

---

## License distribution (npm packages)

Across **760 packages** (production + dev, all transitive depths):

| License                 | Count |
| ----------------------- | ----- |
| MIT                     | 649   |
| ISC                     | 39    |
| Apache-2.0              | 31    |
| BSD-2-Clause            | 13    |
| BSD-3-Clause            | 11    |
| BlueOak-1.0.0           | 4     |
| MPL-2.0                 | 3     |
| MIT-0                   | 2     |
| CC0-1.0                 | 2     |
| (MPL-2.0 OR Apache-2.0) | 1     |
| (MIT OR CC0-1.0)        | 1     |
| LGPL-3.0-or-later       | 1     |
| CC-BY-4.0               | 1     |
| Python-2.0              | 1     |
| Unlicense               | 1     |
| 0BSD                    | 1     |

---

## Direct production dependencies

| Package                    | License                 |
| -------------------------- | ----------------------- |
| `@base-ui/react`           | MIT                     |
| `@dnd-kit/core`            | MIT                     |
| `@dnd-kit/sortable`        | MIT                     |
| `@dnd-kit/utilities`       | MIT                     |
| `class-variance-authority` | Apache-2.0              |
| `clsx`                     | MIT                     |
| `dompurify`                | (MPL-2.0 OR Apache-2.0) |
| `fuse.js`                  | Apache-2.0              |
| `lucide-react`             | ISC                     |
| `next`                     | MIT                     |
| `react`                    | MIT                     |
| `react-dom`                | MIT                     |
| `shadcn`                   | MIT                     |
| `swr`                      | MIT                     |
| `tailwind-merge`           | MIT                     |
| `tw-animate-css`           | MIT                     |
| `zustand`                  | MIT                     |

---

## Fonts

### Bundled in `public/fonts/`

| Font          | License                                                                                                                  | Source                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Manrope       | SIL Open Font License 1.1 (see [`public/fonts/OFL.txt`](public/fonts/OFL.txt))                                           | <https://github.com/sharanda/manrope> |
| UthmanicHafs  | KFGQPC font, used with permission (see [`public/fonts/UthmanicHafs-LICENSE.txt`](public/fonts/UthmanicHafs-LICENSE.txt)) | KFGQPC (Madinah, Saudi Arabia)        |
| `surah_names` | KFGQPC SurahNames font (PUA-mapped Arabic surah glyphs), used with permission                                            | KFGQPC / Quran Foundation             |

### Fetched at runtime

| Font                      | License                                              | Source                                             |
| ------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Scheherazade New          | SIL Open Font License 1.1                            | Google Fonts (via `next/font/google`)              |
| QCF v1 (page-based glyph) | KFGQPC, served by the Quran Foundation               | `https://verses.quran.foundation/fonts/quran/hafs` |
| QCF v2 (page-based glyph) | KFGQPC, served by the Quran Foundation               | `https://verses.quran.foundation/fonts/quran/hafs` |
| QCF Tajweed v4            | KFGQPC + tajweed colour annotations                  | `https://verses.quran.foundation/fonts/quran/hafs` |
| IndoPak Nastaleeq         | Used with permission, served by the Quran Foundation | `https://verses.quran.foundation/fonts/quran/hafs` |

The Scheherazade New font is loaded via the Google Fonts CSS API by
`next/font/google` and is subject to the [SIL OFL 1.1](https://openfontlicense.org/).

The Quranic glyph fonts (QCF v1/v2/v4, IndoPak) are streamed from the public
[Quran.com](https://quran.com) / [Quran Foundation](https://quran.foundation)
CDN and are not redistributed by this repository.

---

## Quranic content

Verse text, translations, and tafsir are fetched from the public
[Quran.com API v4](https://api.quran.com/api/v4/) through the
`/api/quran-v4` proxy route. The proxy adds no authentication and serves
public, freely available content. Translations and tafsir are sourced from
the resources Quran.com lists in their data catalogue; each translation
carries its own copyright notice in the response payload.

Tajweed colour data bundled at `public/data/qpc-hafs-tajweed.json` is
derived from the publicly available QCF Hafs tajweed mapping used by
Quran.com.

Bundled transliteration data at `public/data/transliteration.json` is
derived from the QPC Hafs Latin transliteration distributed by
Quran.com / Quran Foundation.

---

## Adhkar content

The Arabic adhkar text and English translations bundled in
`src/data/adhkar.json` are sourced from **Hisn al-Muslim** ("Fortress of
the Muslim") by Sa'id bin Ali bin Wahf al-Qahtani. CDN audio recordings
played in the adhkar pages are likewise drawn from publicly available
HisnMuslim sources.

Bayaan redistributes this content for non-commercial Islamic use and
attributes the source here and in the app's Settings → About screen.

If you are the content owner and have concerns about redistribution, please
open an issue at <https://github.com/thebayaan/bayaan-web/issues> or contact
the maintainer privately per [SECURITY.md](SECURITY.md), and we will address
it promptly.

---

## Regenerating this file

The license distribution numbers above are produced by walking
`node_modules` and counting each package's declared `license` field. To
refresh after adding or removing dependencies:

```bash
node -e "
const fs = require('fs'), path = require('path');
function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const n of fs.readdirSync(dir)) {
    const f = path.join(dir, n);
    if (!fs.statSync(f).isDirectory()) continue;
    if (n.startsWith('@')) { walk(f, out); continue; }
    const p = path.join(f, 'package.json');
    if (fs.existsSync(p)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
        const l = typeof pkg.license === 'string' ? pkg.license : (pkg.license?.type || 'UNSPECIFIED');
        out.push(l);
      } catch {}
    }
    walk(path.join(f, 'node_modules'), out);
  }
}
const out = []; walk('node_modules', out);
const c = {};
for (const l of out) c[l] = (c[l]||0)+1;
for (const [l,n] of Object.entries(c).sort((a,b)=>b[1]-a[1])) console.log(n+'x '+l);
"
```

Run from the repo root after `npm install`.
