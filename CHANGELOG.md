# Changelog

All notable changes to Bayaan Web are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries are written for users and contributors, not commit-by-commit. For the
full commit history, see [the GitHub log](https://github.com/thebayaan/bayaan-web/commits/main).

## [Unreleased]

### Added

- Adhkar audio playback on dhikr pages (CDN-backed, with Play All).
- Quran.com mushaf font options in the reader settings.
- Expanded settings page to match the Bayaan mobile app surface.

### Changed

- Timestamp assets now resolve through the R2 CDN, matching mobile and backend.
- In-place surah picker on the reading sub-header chip.
- Icon library aligned with the mobile app's `Icons.tsx`.

### Fixed

- Mushaf juz navigation now lands on the correct page when jumping by juz.
- Bottom player no longer collapses the reciter name when a rewayah is shown.
- Reader rehydrate now preloads the last-played track so the play button works on first click.
- Adhkar audio controls no longer trigger a set-state-in-effect lint warning.

## [0.2.0] - 2026-05-23

A polish pass that closes the dead-button gaps from the initial OSS audit and
brings the listening and discovery surfaces to a mature baseline.

### Added

- Home: hover-play overlay on reciter cards, Recently Played row, skeletons that
  match the real card grid.
- Player: sleep timer with auto-pause, loading spinner during track switch,
  now-playing overflow menu (Add to playlist, Share), persistent Favorite (heart)
  on the bottom player, queue empty-state CTA.
- Reader: inline reciter and play chip on the sub-header, cross-links from
  surah hero to the reader.
- Reciter: real popover menu (replacing the system alert), Add-to-Playlist wired
  into surah rows, dedicated Favorite Reciters page.
- Search: rich empty state with popular surahs and featured reciters, recent
  searches history.

### Changed

- Player favorite state persists via `useFavoriteReciters` and is gated by auth.
- Collection Loved count now reflects real favorites.

### Fixed

- Various dead buttons and unreachable states surfaced by the initial UX audit.

## [0.1.0] - 2026-05-23

First tagged release. The repository is prepared for open-source contribution
under AGPL-3.0-or-later with full governance, trademark, and security docs in
place. The app boots out of the box for forks with no API keys required.

### Added

- **OSS scaffolding:** AGPL-3.0 LICENSE, TRADEMARKS, GOVERNANCE, SECURITY,
  CODE_OF_CONDUCT, CONTRIBUTING, and THIRD_PARTY_LICENSES documents.
- **CI safety net:** GitHub Actions running lint, typecheck, format check,
  Vitest with coverage, Next.js build smoke test, and Playwright e2e smoke.
- **Tooling:** Husky + lint-staged pre-commit hooks, MSW for test mocking,
  Prettier with Tailwind plugin.
- **Quran reader:** full surah view with verse-level deep links, highlights,
  notes, copy, and share. Mushaf reader with click-to-select, floating action
  bar, word popover, and per-surah reading progress.
- **Listening:** queue with drag-to-reorder, shuffle, Media Session integration
  (position state, seek handlers, Wake Lock), deep-link recitation player.
- **Library:** playlists (create, rename, delete, add, remove), bookmarks at the
  verse level, last-read tracking, resume cards on home.
- **Adhkar:** full Hisnul Muslim dataset (134 categories) with persisted counter.
- **Navigation:** global Cmd/Ctrl+K command palette, split settings into
  URL-addressable subpages, sidebar across all screen sizes.
- **SEO and sharing:** branded OG images and icons, canonical URLs, sitemap,
  robots, Apple/Android universal links, theme-aware OG variants.
- **Accessibility (Phase 0):** Prev/Next bug fix, sr-only labels, reduced-motion
  support, aria-live announcements on the player.

### Changed

- Clerk auth is env-gated so forks can boot without a Clerk instance.
- Default site URL switched to `app.thebayaan.com`.
- Metadata adopts Spotify-style title formatting (pipes and hyphens, no em-dashes).

### Fixed

- Various mobile responsive issues and pure-black dark-mode regressions.
- SSR guard around the audio service to prevent "Audio not defined" errors.

[Unreleased]: https://github.com/thebayaan/bayaan-web/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/thebayaan/bayaan-web/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/thebayaan/bayaan-web/releases/tag/v0.1.0
