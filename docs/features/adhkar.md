# Adhkar

Hisnul Muslim adhkar (134 categories of supplications) with a persisted
counter and CDN-backed audio playback.

## Source files

| File                                   | Role                                   |
| -------------------------------------- | -------------------------------------- |
| `src/app/(app)/adhkar/page.tsx`        | Category browser                       |
| `src/app/(app)/adhkar/[slug]/page.tsx` | Per-category dhikr list                |
| `src/components/adhkar/`               | Browse UI, dhikr cards, audio controls |
| `src/data/adhkar.json`                 | Bundled Hisnul Muslim dataset          |
| `src/lib/adhkar-audio.ts`              | Audio coordinator and interlock        |
| `src/lib/adhkar-navigation.ts`         | Category routing helpers               |
| `src/stores/dhikr-counts-store.ts`     | Persisted per-dhikr counter            |

## Behaviour

- **Counter.** Each dhikr has a tap-to-increment counter; counts persist via
  `dhikr-counts-store.ts` (localStorage). Reach the target count to mark the
  dhikr complete.
- **Audio playback.** Each dhikr that has a CDN recording shows a play
  button. Audio plays inline on the dhikr card.
- **Play All.** Plays the dhikrs in a category in order.
- **Audio coordinator interlock.** The audio coordinator ensures only one
  dhikr is playing at a time across the page and gracefully handles load
  errors.
- **Arabic rendering.** Uses the Scheherazade New font for the Arabic body
  and the standard sans for translations.

## Data attribution

The bundled adhkar dataset is sourced from **Hisn al-Muslim ("Fortress
of the Muslim") by Sa'id ibn 'Ali ibn Wahf al-Qahtani** in its public
translation, mirrored from <https://hisnmuslim.com>. CDN audio recordings
played in the adhkar pages are likewise drawn from publicly available
HisnMuslim sources. Rights-holder contact for content concerns is in
[THIRD_PARTY_LICENSES.md](../../THIRD_PARTY_LICENSES.md#adhkar-content).

## Testing

- Unit tests under `src/__tests__/lib/adhkar-audio.test.ts` cover the audio
  coordinator's interlock.
- Component tests verify the counter increments and resets.

## Known limitations

- Not all dhikrs have recorded audio yet; the play button is hidden when no
  source is available.
- Audio downloads are not offline-cached on the web (mobile has offline
  downloads; web does not).
