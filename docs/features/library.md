# Library

Bookmarks, favorites, playlists, notes, and highlights — all stored locally
in the browser. There is no sign-in and no server sync.

## Source files

| File                          | Role                                 |
| ----------------------------- | ------------------------------------ |
| `src/stores/library-store.ts` | Single Zustand store for the library |
| `src/hooks/use-favorites.ts`  | Favorites read/write hook            |
| `src/components/library/`     | UI for the collection routes         |
| `src/app/(app)/collection/`   | Collection pages                     |

## Data model

The library store holds five collections, all keyed by stable IDs:

| Collection        | Shape                                     | Notes                            |
| ----------------- | ----------------------------------------- | -------------------------------- |
| Favorite tracks   | `TrackFavorite[]`                         | Hearted recitations              |
| Favorite reciters | `FavoriteReciter[]`                       | Followed reciters                |
| Playlists         | `Playlist[]` of `PlaylistItem[]`          | User-created, named, reorderable |
| Bookmarks         | Per-ayah bookmarks                        | Optional note                    |
| Highlights        | Per-ayah highlights with `HighlightColor` | Renders an inline colour band    |
| Notes             | Per-ayah free-form notes                  | Markdown-stripped on render      |

See `src/stores/library-store.ts` for the exact TypeScript shape.

## Persistence

- All collections persist via Zustand's `persist` middleware to
  `localStorage` under a single namespaced key.
- Migrations run on rehydrate when the schema version changes.
- There is no server sync. Clearing browser data clears the library.
- The legacy `/api/bayaan/v1/user/*` server-backed endpoints return
  `410 Gone` with a message pointing callers to client storage.

## Behaviour

- **Atomic actions.** All mutations go through the store's actions; no
  component writes to `localStorage` directly.
- **Cross-device.** None. The library is local to the device.
- **Export / import.** Not yet implemented. See open issues for status.

## Testing

- `src/__tests__/stores/library-store.test.ts` covers the action surface.
- `src/__tests__/hooks/use-favorites.test.tsx` covers the favorites hook.

## Future work

- Optional cloud sync behind a setting (likely a future RFC).
- Export to JSON for backup and import on a new device.
