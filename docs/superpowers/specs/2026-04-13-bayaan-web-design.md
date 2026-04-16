# Bayaan Web — Design Specification

## Overview

Web version of the Bayaan Quran listening and reading app. Spotify-like listening experience with quran.com-level reading. Built as a new Next.js frontend that connects to the existing Bayaan backend (Hono + Bun on Railway) and the QuranCDN API for Quran text data.

## Decisions Log

| Decision                | Choice                                                         | Rationale                                                                                                        |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| User accounts           | Required (Spotify-style)                                       | Cloud sync for bookmarks, playlists, history across devices                                                      |
| Auth provider           | Clerk (all methods: email, Google, Apple, passkeys, etc.)      | Fast to ship, pre-built UI, webhook sync to backend                                                              |
| Design direction        | Hybrid — Bayaan brand DNA + Spotify navigation patterns        | Dark-first for listening, clean reading themes for Quran                                                         |
| Quran rendering         | QCF V2 fonts + QuranCDN API (reference: quran.com open source) | Page-accurate Mushaf display, proven approach                                                                    |
| Framework               | Next.js 15 (App Router)                                        | SSR for SEO on Quran pages, API route proxying                                                                   |
| Styling                 | Tailwind + CSS Modules + shadcn/ui (New York / Luma style)     | Modern, clean component base with full customization                                                             |
| State management        | Zustand                                                        | Matches mobile app patterns, persists to localStorage                                                            |
| Audio source            | All audio from cdn.thebayaan.com via Bayaan API                | No direct calls to mp3quran.net or qurancdn for audio                                                            |
| Timestamps              | Bayaan API `/v1/timestamps` (proxies mp3quran/qurancdn)        | Backend handles caching and source resolution                                                                    |
| Quran text data         | QuranCDN API (proxied through Next.js API routes)              | Verses, glyph codes, translations, word-by-word                                                                  |
| Scope                   | Full feature parity with mobile app                            | Listening, reading, follow-along, translations, tafseer, bookmarks, highlights, notes, playlists, adhkar, search |
| No ScheherazadeNew      | Explicit exclusion                                             | User preference — use KFGQPC Uthmani Hafs for text rendering                                                     |
| No primary color picker | Dropped                                                        | Not actively used in the mobile app                                                                              |
| Custom icons            | Port all 66 SVGs from mobile app's Icons.tsx                   | Core visual identity of the app                                                                                  |

---

## 1. Tech Stack

### Frontend

- **Next.js 15** — App Router with React Server Components, SSR for reading pages
- **React 19** — UI framework
- **TypeScript** — strict mode, no `any`, no `as` casts
- **Zustand** — state management (player, UI, settings), persisted to localStorage
- **SWR** — data fetching with stale-while-revalidate caching
- **Tailwind CSS** — utilities and layout
- **CSS Modules** — complex components (Mushaf reader, audio player)
- **shadcn/ui** — New York style (Luma aesthetic), base component library
- **Clerk** (`@clerk/nextjs`) — authentication with all sign-in methods
- **Framer Motion** — layout animations
- **Fuse.js** — client-side fuzzy search
- **dnd-kit** — drag-and-drop for queue and playlist reordering

### Backend (additions to existing Hono + Bun API on Railway)

- New user data tables in PostgreSQL
- New authenticated endpoints for user data (bookmarks, playlists, etc.)
- Clerk webhook endpoint for user sync
- Existing endpoints unchanged: reciters, rewayat, audio-url, timestamps, surahs

### Data Sources

- **Bayaan API** (`api.thebayaan.com`) — reciters, rewayat, audio URL resolution, timestamps, user data
- **QuranCDN API** (`api.qurancdn.com`) — verses with QCF glyph codes, translations, word-by-word data (proxied through Next.js API routes)
- **Bayaan CDN** (`cdn.thebayaan.com`) — all audio streaming, reciter images

### Hosting

- **Vercel** — Next.js frontend
- **Railway** — existing backend + PostgreSQL

---

## 2. Page Structure & Navigation

### Layout

Spotify-style three-zone layout:

1. **Left sidebar** (fixed, ~240px) — Bayaan logo, main nav links, user playlists
2. **Main content area** (scrollable) — changes based on route
3. **Bottom player bar** (fixed, ~80px) — persistent audio controls, always visible when a track is loaded

### Routes

| Route                         | Description                                                   | Rendering |
| ----------------------------- | ------------------------------------------------------------- | --------- |
| `/`                           | Home — featured reciters, continue listening, recently played | Client    |
| `/search`                     | Search reciters and surahs                                    | Client    |
| `/reciter/[slug]`             | Reciter profile — surah list, rewayat tabs, play all          | SSR       |
| `/surah/[id]`                 | Surah page — all available reciters for this surah            | SSR       |
| `/quran`                      | Quran reader — Mushaf view (page-accurate QCF)                | Client    |
| `/quran/[surah]`              | Reading view — verse-by-verse with translations               | SSR       |
| `/quran/[surah]/[ayah]`       | Deep link to specific verse                                   | SSR       |
| `/collection`                 | User library — playlists, favorites, bookmarks, notes         | Client    |
| `/collection/playlists`       | User playlists                                                | Client    |
| `/collection/playlists/[id]`  | Playlist detail                                               | Client    |
| `/collection/favorites`       | Favorited tracks                                              | Client    |
| `/collection/bookmarks`       | Verse bookmarks                                               | Client    |
| `/collection/notes`           | Verse notes                                                   | Client    |
| `/adhkar`                     | Adhkar home — bento grid of categories                        | Client    |
| `/adhkar/[superId]`           | Super-category detail                                         | Client    |
| `/adhkar/[superId]/[dhikrId]` | Individual dhikr reader                                       | Client    |
| `/settings`                   | User preferences                                              | Client    |
| `/sign-in`                    | Clerk sign-in                                                 | Client    |
| `/sign-up`                    | Clerk sign-up                                                 | Client    |

### Responsive Behavior

- **Desktop (1024px+):** Full sidebar + content + player bar
- **Tablet (768–1023px):** Collapsed sidebar (icons only) + content + player bar
- **Mobile (<768px):** Bottom tab bar (like the mobile app), no sidebar, mini player above tabs

---

## 3. Audio Player

Three-layer architecture mirroring the mobile app:

### 3.1 AudioService (singleton)

- Wraps HTML5 `Audio` element (web equivalent of `expo-audio`)
- Methods: `load(url)`, `play()`, `pause()`, `seek(ms)`, `setRate(rate)`, `setVolume(vol)`
- Emits events: `timeupdate`, `ended`, `error`, `loadedmetadata`
- Integrates with Media Session API for OS-level controls (browser tab, macOS Now Playing)

### 3.2 playerStore (Zustand)

- Same state shape as mobile: `queue`, `playback`, `loading`, `error`, `settings`
- Actions: `playTrack`, `addToQueue`, `removeFromQueue`, `moveInQueue`, `nextTrack`, `prevTrack`, `toggleShuffle`, `cycleRepeat`, `setRate`, `setSleepTimer`
- Persisted to localStorage — restores queue and position on page reload
- Stale-URL guard (discard persisted tracks with non-cdn.thebayaan.com URLs)

### 3.3 AudioCoordinator

- Mutual exclusion between main player and mushaf player (same as mobile)

### Player UI Components

| Component           | Description                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **BottomPlayerBar** | Fixed bottom bar. Track info + artwork left, transport controls + progress center, volume + queue toggle right |
| **FullPlayerView**  | Expands on click — large artwork, full controls, queue list, follow-along Quran view with ayah highlighting    |
| **QueuePanel**      | Slide-out right panel, drag-to-reorder via dnd-kit                                                             |
| **MiniPlayer**      | Mobile-only compact player above bottom tab bar                                                                |

### Playback Features

- Repeat modes: none / queue / track
- Shuffle
- Playback rate: 0.5x–2.0x
- Sleep timer (configurable minutes)
- Volume control (web-only)
- Follow-along: ayah highlighting synced to timestamps from Bayaan API (`/v1/timestamps`)
- Keyboard shortcuts (see Section 7)

### Audio Data Flow

1. User clicks play on a surah for a reciter/rewayat
2. Frontend calls Bayaan API `GET /v1/audio-url?rewayat_id={id}&surah={n}` → returns MP3 URL on cdn.thebayaan.com
3. AudioService loads the URL into HTML5 Audio element
4. For follow-along: frontend calls `GET /v1/timestamps/{rewayat_id}/{surah}` → returns per-ayah timing data
5. `timeupdate` events compared against timestamp ranges to highlight current ayah

---

## 4. Quran Reading Experience

Reference implementation: [quran/quran.com-frontend-next](https://github.com/quran/quran.com-frontend-next) on GitHub.

### 4.1 Mushaf View (`/quran`)

- Page-accurate display using QCF V2 fonts from qurancdn (604 per-page font files)
- Dynamic font loading via `FontFace` API — each page loads its own font file
- Each word rendered as a glyph using the `codeV2` field from QuranCDN API
- Lines laid out with `justify-content: space-between` to match physical Mushaf spacing
- Horizontal page navigation (arrows or swipe) — RTL like a physical Quran
- Surah headers rendered using the surah name glyph font (`surah_names.ttf`)
- KFGQPC Uthmani Hafs as fallback font while QCF fonts load
- Verse tap → action menu (bookmark, highlight, note, copy, share, tafseer)
- Page number display in footer

### 4.2 Reading View (`/quran/[surah]`)

- Verse-by-verse flowing layout using KFGQPC Uthmani Hafs font
- Arabic text with optional translation below each verse (default: Saheeh International)
- Optional transliteration
- Optional word-by-word translation (inline or tooltip, data from QuranCDN API)
- Tajweed color highlighting (switches to QCF Tajweed V4 color font when enabled, replacing Uthmani Hafs)
- Infinite scroll with virtualization
- Verse actions: bookmark, highlight (5 colors), note, copy, share, tafseer

### 4.3 Shared Features

- Translation picker — multi-language, multiple simultaneous (from QuranCDN API)
- Tafseer panel — Ibn Kathir bundled (from mobile app's `ibn-kathir-tafseer-compact.json`), plus downloadable tafaseer from QuranCDN
- Dedicated reading theme — separate from app dark/light mode
- Mushaf audio integration — play current page/surah with ayah highlighting
- Juz / Hizb / Rub navigation
- Last-read position saved per-user

### 4.4 Reading Settings

- Font size adjustment
- Reading theme (12 themes: 6 light + 6 dark)
- Translation language selection
- Transliteration toggle
- Word-by-word toggle
- Tajweed toggle

---

## 5. User Data & Backend Additions

### New Database Tables

**`users`** — synced from Clerk via webhooks
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `clerk_id` | text UNIQUE | Clerk's user ID |
| `email` | text | |
| `name` | text | nullable |
| `avatar_url` | text | nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**`bookmarks`** — verse bookmarks
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `verse_key` | text | e.g., "2:255" |
| `surah_number` | integer | |
| `ayah_number` | integer | |
| `note` | text | nullable |
| `created_at` | timestamptz | |

**`highlights`** — verse highlights with color
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `verse_key` | text | |
| `color` | text | One of: yellow, green, blue, pink, purple |
| `created_at` | timestamptz | |

**`notes`** — verse notes
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `verse_key` | text | |
| `content` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**`playlists`** — user playlists
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `name` | text | |
| `description` | text | nullable |
| `is_public` | boolean | default false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**`playlist_items`** — tracks in a playlist
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `playlist_id` | UUID FK → playlists CASCADE | |
| `reciter_id` | UUID | |
| `rewayat_id` | UUID | |
| `surah_id` | integer | |
| `position` | integer | ordering |
| `created_at` | timestamptz | |

**`favorites`** — favorited tracks
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `reciter_id` | UUID | |
| `rewayat_id` | UUID | |
| `surah_id` | integer | |
| `created_at` | timestamptz | |

**`favorite_reciters`** — favorited reciters
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `reciter_id` | UUID | |
| `created_at` | timestamptz | |

**`listening_history`** — recently played
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `reciter_id` | UUID | |
| `rewayat_id` | UUID | |
| `surah_id` | integer | |
| `last_position_ms` | integer | resume position |
| `completed` | boolean | |
| `listened_at` | timestamptz | |

**`reading_progress`** — last-read position
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `verse_key` | text | |
| `page_number` | integer | |
| `scroll_position` | float | nullable |
| `updated_at` | timestamptz | |

### New API Endpoints (require Clerk JWT)

| Method              | Path                           | Purpose                     |
| ------------------- | ------------------------------ | --------------------------- |
| GET/POST/DELETE     | `/v1/user/bookmarks`           | CRUD bookmarks              |
| GET/POST/DELETE     | `/v1/user/highlights`          | CRUD highlights             |
| GET/POST/PUT/DELETE | `/v1/user/notes`               | CRUD notes                  |
| GET/POST/PUT/DELETE | `/v1/user/playlists`           | CRUD playlists              |
| POST/DELETE         | `/v1/user/playlists/:id/items` | Manage playlist items       |
| GET/POST/DELETE     | `/v1/user/favorites`           | CRUD favorite tracks        |
| GET/POST/DELETE     | `/v1/user/favorite-reciters`   | CRUD favorite reciters      |
| GET/POST            | `/v1/user/history`             | Listening history           |
| GET/PUT             | `/v1/user/reading-progress`    | Last-read position          |
| POST                | `/v1/webhooks/clerk`           | Clerk webhook for user sync |

---

## 6. Visual Design System

### Color System

Two base palettes. The dominant pattern: derive UI colors from `text` at varying opacities.

**Light mode:**
| Token | Value |
|-------|-------|
| background | `#f4f3ec` |
| backgroundSecondary | `#edebe3` |
| text | `#06151C` |
| textSecondary | `#052c39` |
| card | `#dcdeda` |
| border | `#a4a4a4` |
| secondary | `#f0f0f0` |
| light | `#f4f4f4` |
| error | `#DC2626` |

**Dark mode:**
| Token | Value |
|-------|-------|
| background | `#050b10` |
| backgroundSecondary | `#06151C` |
| text | `#ffffff` |
| textSecondary | `#B0B0B0` |
| card | `#050b10` |
| border | `#332f38` |
| secondary | `#1c1a1e` |
| light | `#242326` |
| error | `#EF4444` |

**Alpha pattern (how most UI color is derived):**

```
text @ 0.04  →  surface backgrounds
text @ 0.06  →  borders, dividers
text @ 0.10  →  hover/active fills
text @ 0.35  →  inactive icons, disabled
text @ 0.50  →  secondary text
text @ 0.85  →  primary text (softened)
```

Mapped to shadcn's CSS variable system (`--background`, `--foreground`, `--card`, `--border`, etc.) with Bayaan values.

### Reading Themes (Mushaf only, separate from app theme)

| Light                 | Dark                   |
| --------------------- | ---------------------- |
| Cream (`#f4f3ec`)     | Dark Navy (`#050b10`)  |
| Parchment (`#f5e6c8`) | Dark Sepia (`#140f0a`) |
| White (`#ffffff`)     | True Black (`#000000`) |
| Sage (`#e8ebe4`)      | Dark Sage (`#141a16`)  |
| Rose (`#f5ece8`)      | Charcoal (`#1a1a1a`)   |
| Cool Gray (`#eef0f2`) | Indigo (`#0e0c18`)     |

Auto-pairs light↔dark by positional index when mode changes.

### Typography

- **UI:** Manrope (loaded from mobile app font files via `next/font/local`)
- **Mushaf view:** QCF V2 per-page fonts (dynamic `FontFace` loading)
- **Reading view:** KFGQPC Uthmani Hafs
- **Surah headers:** `surah_names.ttf` glyph font

### Icons

66 custom SVGs ported from the mobile app's `components/Icons.tsx`, converted from `react-native-svg` to standard `<svg>` React components. All accept `color`, `size`, `filled?` props. Key icons: HomeIcon, SearchIcon, CollectionIcon, PlayIcon, PauseIcon, NextIcon, PreviousIcon, SeekForward15Icon, SeekBackward15Icon, ShuffleIcon, RepeatIcon, RepeatOneIcon, RepeatAllIcon, HeartIcon, QueueIcon, QuranIcon, MushafiIcon, TafseerIcon, TimerIcon, LogoIcon, MakkahIcon, MadinahIcon, HighlightIcon, TasbihIcon, AmbientIcon, SettingsIcon, DiscoverIcon, RewayatIcon, PlaylistIcon, plus 19 decorative hero icons.

### Component Patterns

- **shadcn/ui** New York style (Luma aesthetic) — modern, refined, clean
- Rounded corners: 14px default, 8px small, pill
- Glassmorphism: `backdrop-filter: blur(16px)` on player bar
- Dominant color extraction from reciter artwork (canvas-based)
- Hover states with subtle brightness shifts
- Framer Motion for layout animations

---

## 7. Additional Features

### Adhkar

- Bento grid layout for super-categories (matching mobile app)
- Category detail with dhikr list
- Individual dhikr reader with swipe/click navigation
- Tasbeeh counter with circular progress ring
- Saved adhkar section
- Data from mobile app's bundled adhkar JSON files

### Search

- Fuse.js fuzzy search across reciters and surahs
- Explore/browse view when empty
- Reciter results: avatar, name, style badges
- Surah results: number, Arabic name, English name, verse count

### Collection

- Hub page: Playlists, Favorite Reciters, Favorites, Bookmarks, Notes
- Cloud-synced via Bayaan API user endpoints
- Drag-to-reorder playlists via dnd-kit

### Settings

- Theme toggle (Light / Dark / System)
- Reading theme picker (12 themes with preview)
- Default reciter selection
- Translation language picker
- Transliteration, word-by-word, tajweed toggles
- Account management via Clerk user profile

### Keyboard Shortcuts

| Key       | Action                |
| --------- | --------------------- |
| `Space`   | Play/pause            |
| `←` / `→` | Seek backward/forward |
| `↑` / `↓` | Volume up/down        |
| `M`       | Mute/unmute           |
| `N`       | Next track            |
| `P`       | Previous track        |
| `R`       | Cycle repeat mode     |
| `S`       | Toggle shuffle        |
| `Q`       | Toggle queue panel    |
| `/`       | Focus search          |

---

## 8. Assets to Port from Mobile App

### Data Files

- `data/surahData.json` — all 114 surahs
- `data/clear-quran-translation.json` — bundled English translation
- `data/ibn-kathir-tafseer-compact.json` — bundled tafseer
- `data/reciters-fallback.json` — fallback reciter list
- `data/rewayat.ts` — rewayah metadata and display names
- Adhkar JSON data files
- `data/mushaf/digitalkhatt/shouba-diff.json` — Hafs vs Shu'bah diffs (if supporting Shu'bah)

### Fonts

- Manrope (ExtraLight through ExtraBold) — UI font
- KFGQPC Uthmani Hafs — reading view font
- `surah_names.ttf` / `surah_names_2.ttf` — surah header glyphs
- `surahGlyphMap.ts` — mapping from surah number to glyph character
- QCF V2 fonts loaded from qurancdn CDN (not bundled)

### Icons

- All 66 icons from `components/Icons.tsx` → converted to web SVG components
- 19 decorative icons from `components/hero/random-recitation/icons.tsx`

### Images

- Reciter images from `cdn.thebayaan.com/assets/reciter-images/`
- Logo assets from `LogoIcon` SVG component
