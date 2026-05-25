# Mushaf

The page-by-page Uthmani Mushaf reader. Renders Quranic text on a continuous
vertical scroll using the King Fahd Glorious Quran Printing Complex (KFGQPC)
Hafs font set.

## Source files

| File                                   | Role                                           |
| -------------------------------------- | ---------------------------------------------- |
| `src/app/(app)/mushaf/page.tsx`        | Mushaf entry route                             |
| `src/app/(app)/mushaf/[page]/page.tsx` | Per-page mushaf view                           |
| `src/components/mushaf/`               | Page renderer, action bar, juz navigation      |
| `src/lib/mushaf-fonts.ts`              | Font registry (KFGQPC, Quran.com options)      |
| `src/lib/mushaf-navigation.ts`         | Page <-> surah/juz/hizb mapping                |
| `src/lib/surah-pages.ts`               | Page metadata (surah boundaries, verse ranges) |
| `src/lib/tajweed-loader.ts`            | Tajweed colour data loader                     |
| `src/lib/tajweed-v4-palettes.ts`       | Tajweed colour palettes                        |
| `public/data/qpc-hafs-tajweed.json`    | Bundled tajweed data                           |
| `public/fonts/`                        | KFGQPC fonts                                   |

## Behaviour

- **Continuous vertical scroll.** Pages flow naturally without page-flip
  transitions.
- **Click to select.** Tap a word to surface a floating action bar
  (Copy, Bookmark, Play from here).
- **Juz navigation.** A juz strip jumps to the start page of any juz; uses
  Next.js `Link` for fast prefetched navigation.
- **Surah picker.** Pages 1 and 2 (al-Fatihah, start of al-Baqarah) have
  decorative frames and surah headers.
- **Font choice.** Users can switch between KFGQPC and Quran.com mushaf fonts
  in the reading settings. Both are bundled.
- **Tajweed.** Optional colour-coding of tajweed rules. Palette and toggle
  state live in `tajweed-store.ts`.

## Rendering pipeline

1. The page route resolves the page number to a list of verses via
   `surah-pages.ts`.
2. The renderer iterates verses, looking up the per-word glyph data from the
   selected font and applying tajweed colours if enabled.
3. Verses are laid out with `text-align: justify` and the mushaf font sized
   per the user's setting.

## Performance

- Tajweed JSON is split-loaded so it only ships when the user has tajweed
  enabled.
- Fonts are subset and served from `public/fonts/`.
- Pages are server-rendered for fast first paint; the action bar and hover
  states are client-side.

## Testing

- Unit tests cover `mushaf-navigation` page-mapping logic and
  `surah-pages` boundary lookups.
- E2E smoke tests verify the mushaf route renders.

## Related docs

- [Reader (surah view)](reader.md)
