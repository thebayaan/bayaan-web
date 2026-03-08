# CLAUDE.md — Bayaan Web

## Overview

Bayaan Web is the web version of the Bayaan Quran app, built with Next.js 15 (App Router), Tailwind CSS, and Zustand. It shares the same Supabase backend as the mobile app.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Styling:** Tailwind CSS with alpha-based design tokens
- **State:** Zustand (client-side)
- **Storage:** IndexedDB (Dexie.js) for translations/tafaseer, localStorage for preferences
- **Audio:** HTML5 Audio API
- **Backend:** Supabase (shared with mobile app, read-only)
- **Font:** Manrope (SemiBold, Medium, Regular)

## Design System

Use the alpha-based color system. NEVER use accent/primary colors for UI chrome.

| Token | CSS Variable | Usage |
|---|---|---|
| Card bg | `--color-card` | `rgb(var(--text) / 0.04)` |
| Card border | `--color-card-border` | `rgb(var(--text) / 0.06)` |
| Divider | `--color-divider` | `rgb(var(--text) / 0.06)` |
| Hover | `--color-hover` | `rgb(var(--text) / 0.06)` |
| Icon | `--color-icon` | `rgb(var(--text) / 0.7)` |
| Label | `--color-label` | `rgb(var(--text) / 0.85)` |
| Section header | `--color-section` | `rgb(var(--text-secondary) / 0.5)` |
| Hint | `--color-hint` | `rgb(var(--text-secondary) / 0.45)` |

## Code Conventions

- Use `'use client'` only when components need interactivity
- Prefer Server Components for data fetching
- Use Zustand for client state, not React Context
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Components: PascalCase files, named exports
- Utilities: camelCase files
- NO enums — use const maps
- TypeScript strict mode, no `any`

## Project Structure

```
src/
├── app/           # Next.js routes
├── components/
│   ├── ui/        # Base components (Card, Button, etc.)
│   ├── layout/    # Sidebar, TopBar, PlayerBar, AppShell
│   ├── mushaf/    # Quran text rendering
│   ├── player/    # Audio player
│   ├── reciters/  # Reciter browsing
│   ├── surahs/    # Surah browsing
│   ├── adhkar/    # Adhkar features
│   ├── collection/# Bookmarks, playlists, etc.
│   ├── search/    # Search functionality
│   └── settings/  # Settings UI
├── lib/           # Utilities (supabase, cn, etc.)
├── stores/        # Zustand stores
├── types/         # TypeScript interfaces
├── data/          # Static JSON data (surahs, reciters, quran text)
├── hooks/         # Custom React hooks
└── styles/        # Global styles
```

## Git Workflow

- Branch from `main` for features: `feature/description`
- Commit frequently with descriptive messages
- Run `npx tsc --noEmit` before committing
- Run `npm run lint` before committing

## Supabase

- Project: `tncrklrswaounqmirayh`
- Read-only access via anon key
- Audio files: `quran-audio/reciters/{folder}/{001-114}.mp3`
- Tables: `reciters`, `rewayat`

## Current Phase

Phase 7: Polish - All core features implemented. App includes:
- Phase 1: Foundation ✅ - scaffold, design system, layout shell, base components
- Phase 2: Mushaf ✅ - Quran text rendering, surah navigation, verse actions
- Phase 3: Audio ✅ - player service, player UI, reciter browsing
- Phase 4: Translations & Tafseer ✅ - translation display, tafseer support
- Phase 5: Collection ✅ - bookmarks, playlists, verse annotations
- Phase 6: Adhkar ✅ - morning/evening adhkar, categories
- Phase 7: Polish ✅ - PWA features, SEO optimization, ambient audio

Current work: Enhancing user experience and fixing navigation issues
