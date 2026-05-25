# Player

The audio player engine that powers the bottom-of-screen mini-player, the
queue panel, and reciter pages.

## Source files

| File                                               | Role                                                       |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `src/stores/player-store.ts`                       | Zustand store: queue, playback state, Media Session bridge |
| `src/stores/reader-player-store.ts`                | Sticky reciter context for the reading view's play chip    |
| `src/stores/recently-played-store.ts`              | Resume-cards source on home                                |
| `src/components/player/`                           | Bottom player UI                                           |
| `src/lib/audio-utils.ts`                           | Track-URL resolution, format helpers                       |
| `src/lib/timestamp-fetch.ts`, `timestamp-utils.ts` | Per-ayah timestamp loading and lookup                      |

## Behaviour

- **Queue management.** Tracks are added one or many at a time. Shuffle uses
  `shuffleIndices()` (with `pinFirst` so the current track stays put). Repeat
  modes: off, all, one.
- **Persisted favorite.** The current reciter's heart state is persisted via
  `useFavoriteReciters` (in `src/stores/library-store.ts`).
- **Media Session integration.** Lock-screen controls, position state, seek
  handlers, and Wake Lock are wired against `navigator.mediaSession`. Position
  state updates on every `timeupdate`.
- **Sleep timer.** Auto-pause after a chosen interval. Implemented in the
  player UI; the store exposes the pause action.
- **Rehydrate-on-load.** When the store rehydrates from localStorage, it
  preloads the last-played track so the user's first play click works.

## Testing

- Unit tests live under `src/__tests__/stores/player-store.test.ts` and
  cover queue mutations, shuffle, repeat, and persistence behaviour.
- Hook tests under `src/__tests__/hooks/` exercise `useFavoriteReciters`,
  `usePlayFromAyah`, and timestamp loading.

## Known limitations

- No background playback when the tab is unfocused for an extended period.
  The Wake Lock helps but is not a substitute for a native player.
- Cross-fade between tracks is not implemented on the web app (mobile has
  this; web does not yet).
