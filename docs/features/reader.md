# Reader

The Quran reading view (surah-by-surah). For the page-by-page Uthmani Mushaf,
see [mushaf.md](mushaf.md).

## Source files

| File                                          | Role                                                 |
| --------------------------------------------- | ---------------------------------------------------- |
| `src/app/(app)/quran/[surah]/page.tsx`        | Surah-level server component                         |
| `src/app/(app)/quran/[surah]/[ayah]/page.tsx` | Deep-linkable single-ayah view                       |
| `src/components/reader/`                      | Reader UI: verses, settings popover, play chip       |
| `src/stores/reading-settings-store.ts`        | Font, size, translation, tafsir provider             |
| `src/stores/verse-selection-store.ts`         | Currently selected verse for the floating action bar |
| `src/stores/reader-player-store.ts`           | Sticky reciter context for the inline play chip      |
| `src/lib/sanitize.ts`                         | DOMPurify wrapper for translation HTML               |
| `src/app/api/quran-v4/[...path]/route.ts`     | Proxy to the public Quran.com API                    |

## Behaviour

- **Verse-level deep links.** `/quran/{surah}/{ayah}` resolves to the surah
  page with the target ayah scrolled into view and selected.
- **Verse interactions.** Click a verse to surface a floating action bar with
  Copy, Share, Bookmark, Highlight, and Note actions.
- **Highlights and notes.** Persisted in `library-store.ts`. Colours are
  defined by the `HighlightColor` type.
- **Inline play chip.** The reading sub-header shows the current reciter and
  a play button that plays the surah from the selected ayah. The reciter is
  sticky across navigations within the reader.
- **In-place surah picker.** Clicking the surah name in the sub-header opens
  a dialog to switch surahs without leaving the reader.
- **Translation + tafsir.** Toggled via the reading settings popover. The
  user's choices persist across sessions.

## Quranic text

Verse text and translations come from the public Quran.com API via the
`/api/quran-v4` proxy. Tafsir is fetched on demand. No API key is required;
the proxy passes requests through and caches responses at the edge.

## Testing

- Coverage tests live under `src/__tests__/components/reader/`.
- E2E smoke tests check that `/quran` renders and a surah page mounts.

## Related docs

- [Mushaf reader](mushaf.md)
- [Library persistence](library.md)
