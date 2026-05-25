# Architecture: current state

A snapshot of how the Bayaan web app is wired together. Keep this document
in sync with reality. When a section drifts from the code, the code wins and
this doc is wrong.

## Tech stack

| Layer        | Choice                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, React 19, Turbopack dev server)                 |
| Language     | TypeScript 5 with `strict` + `noUncheckedIndexedAccess`                 |
| Styling      | Tailwind CSS 4, `class-variance-authority`, shadcn primitives           |
| Client data  | SWR                                                                     |
| State        | Zustand stores (`src/stores/`)                                          |
| Server state | Next.js Server Components and Route Handlers                            |
| Tests        | Vitest + `@testing-library/react`, MSW for HTTP mocking, Playwright e2e |
| Pre-commit   | Husky + `lint-staged` (Prettier + ESLint on staged files)               |
| Persistence  | `localStorage` via Zustand `persist` middleware                         |
| Auth         | None. There is no user account system in the web app.                   |

## Routes

The App Router lives under `src/app/`. The user-facing app shell sits in the
`(app)` route group:

- `(app)/` — home, listening surface, sidebar shell.
- `(app)/quran/` — surah index and surah-level reader.
- `(app)/mushaf/` — page-by-page Uthmani Mushaf reader.
- `(app)/reciter/[slug]/` — reciter profile, surah list, playback.
- `(app)/reciter/[slug]/[surah]/` — single-surah deep link.
- `(app)/adhkar/` — Hisnul Muslim browser and category pages.
- `(app)/collection/` — library: favorites, bookmarks, playlists, notes.
- `(app)/search/` — global search with reciter and surah results.
- `(app)/settings/` — URL-addressable settings subpages (about, reading,
  player, accessibility, etc.).

Top-level API routes under `src/app/api/`:

- `api/bayaan/[...path]/route.ts` — proxy to the Bayaan backend. Adds
  `Authorization: Bearer ${BAYAAN_API_KEY}` and forwards requests. Legacy
  `/v1/user/*` paths return `410 Gone` since there is no auth.
- `api/quran-v4/[...path]/route.ts` — proxy to the public Quran.com API for
  reader text, translations, and tafsir.

`middleware.ts` is currently a pass-through. Static asset and
`.well-known` paths are excluded via the matcher so the
`apple-app-site-association` and `assetlinks.json` files serve correctly.

## Server vs client split

- **Server Components** by default. Reciter pages, surah pages, and metadata
  are server-rendered.
- **Client Components** opt in via `"use client"`. Anything that uses
  Zustand, browser APIs, audio, or interactivity.
- Server fetches use `fetch` directly; client fetches use SWR.
- OG image generation lives in `src/lib/og.tsx` and `src/app/opengraph-image.tsx`.

## State

The Zustand stores under `src/stores/` are the source of truth for client
state:

| Store                       | Responsibility                                                    |
| --------------------------- | ----------------------------------------------------------------- |
| `player-store.ts`           | Bottom audio player: queue, shuffle, repeat, Media Session glue   |
| `reader-player-store.ts`    | Reading-view play chip and last-played reciter context            |
| `library-store.ts`          | Favorites, bookmarks, playlists, notes, highlights                |
| `reading-settings-store.ts` | Font choice, size, translations toggled, tafsir provider          |
| `recently-played-store.ts`  | Resume-cards source on home                                       |
| `recent-searches-store.ts`  | Search empty-state chips                                          |
| `command-palette-store.ts`  | Cmd/Ctrl+K palette open state                                     |
| `theme-store.ts`            | Light/dark theme selection, system-preference fallback            |
| `tajweed-store.ts`          | Tajweed colour palette and toggle                                 |
| `verse-selection-store.ts`  | Current verse selection for the floating action bar in the reader |
| `ayah-tracker-store.ts`     | Auto-scroll-to-current-ayah during playback                       |
| `dhikr-counts-store.ts`     | Persisted dhikr counter for the adhkar pages                      |
| `word-audio-store.ts`       | Per-word audio playback toggle and cache                          |

Stores that hold user data use Zustand's `persist` middleware to write to
`localStorage`. There is no server sync. See
[features/library.md](../features/library.md) for the persistence contract.

## Data sources

| Source                              | Used for                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| Bayaan backend (via `/api/bayaan`)  | Reciters, audio URLs, ayah timestamps, OG reciter images |
| Quran.com (via `/api/quran-v4`)     | Verse text, translations, tafsir                         |
| `public/data/qpc-hafs-tajweed.json` | Bundled tajweed colour mapping                           |
| `public/data/transliteration.json`  | Bundled transliteration fallback                         |
| `src/data/adhkar.json`              | Bundled Hisnul Muslim adhkar (134 categories)            |
| `src/data/reciter-collections.ts`   | Curated featured reciter lists                           |

The app boots and runs fully without `BAYAAN_API_KEY`. Reader, mushaf, adhkar,
and library features depend only on bundled data and the public Quran.com
proxy.

## Audio playback

The player lives in `src/stores/player-store.ts`. On the client it:

1. Creates an `HTMLAudioElement` lazily (guarded against SSR).
2. Manages a queue, current index, shuffle order, repeat mode, and Favorite
   state.
3. Bridges to the browser Media Session API (lock-screen controls, position
   state, seek handlers, Wake Lock).
4. Exposes hooks (`usePlayerStore`) consumed by the bottom player UI in
   `src/components/player/`.

The reader has its own `reader-player-store.ts` that holds the last reciter
and rewayah used in the reading view so the play chip stays sticky across
verses.

## OG, SEO, and sharing

- `src/app/opengraph-image.tsx` is the root OG generator. Per-route OG images
  live alongside their pages (`src/app/(app)/.../opengraph-image.tsx`).
- Universal links are configured via
  `public/.well-known/apple-app-site-association` (iOS) and
  `public/.well-known/assetlinks.json` (Android, signed with
  `ANDROID_SHA256_CERT`).
- `sitemap.ts` and `robots.ts` at the app root produce the public SEO surfaces.

## Testing

- **Vitest** runs unit and component tests under `src/__tests__/` and
  co-located `*.test.tsx`. Tests use a `jsdom` environment configured in
  `vitest.config.ts` and a global setup in `vitest.setup.ts`.
- **MSW** mocks HTTP requests in tests. Handlers live with the fixtures.
- **Playwright** runs e2e tests under `e2e/` against `next start`. Config
  in `playwright.config.ts`. CI installs Chromium and uploads the report on
  failure.

## Deployment

- The Next.js production build is the deployment artifact. We test deploys on
  Railway and Vercel; both are Node 22.
- CI runs lint, typecheck, format check, Vitest with coverage, a Next.js
  production build, and Playwright smoke tests on every push to `main` and
  every PR.
- Versioning is git-tag based; see [CHANGELOG.md](../../CHANGELOG.md).

## Things this document deliberately does not cover

- Backend internals — see the Bayaan backend repository.
- Mobile app architecture — see <https://github.com/thebayaan/Bayaan>.
- Per-feature deep dives — each feature has its own doc under
  [docs/features/](../features/).
