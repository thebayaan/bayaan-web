# Changelog

All notable changes to Bayaan Web are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries are written for users and contributors, not commit-by-commit. For the
full commit history, see [the GitHub log](https://github.com/thebayaan/bayaan-web/commits/main).

## [0.3.0](https://github.com/thebayaan/bayaan-web/compare/v0.2.0...v0.3.0) (2026-05-26)


### Added

* **adhkar:** add CDN audio playback on dhikr pages ([365de89](https://github.com/thebayaan/bayaan-web/commit/365de89ad3acfa724d8c5618d0b08836f85aacd2))
* **adhkar:** add CDN audio playback on dhikr pages ([4dabb58](https://github.com/thebayaan/bayaan-web/commit/4dabb587b0c309207e4681b7dd26475b0c76f9b1))
* **adhkar:** add Play All and remove redundant collections list ([2eafc32](https://github.com/thebayaan/bayaan-web/commit/2eafc323e73ca4a2667c66ac9383549dc4736814))
* **adhkar:** polish browse UI, navigation, and Arabic rendering ([da26791](https://github.com/thebayaan/bayaan-web/commit/da26791dae19977070f7d945b527fb47880fc7a8))
* **adhkar:** wire audio coordinator interlock and load errors ([d1a82f7](https://github.com/thebayaan/bayaan-web/commit/d1a82f729716f5cde07cf75c661665067aa31d39))
* **icons:** align web icon library with the mobile app's Icons.tsx ([#70](https://github.com/thebayaan/bayaan-web/issues/70)) ([c239595](https://github.com/thebayaan/bayaan-web/commit/c23959566fe236d4b195fdb278f4c3b5e2232325))
* **quran:** add quran.com mushaf font options ([#72](https://github.com/thebayaan/bayaan-web/issues/72)) ([1e73301](https://github.com/thebayaan/bayaan-web/commit/1e733010d50b67961ee19950a7a154c7fa1f6904))
* **quran:** in-place surah picker on the reading sub-header chip ([#69](https://github.com/thebayaan/bayaan-web/issues/69)) ([82e79d7](https://github.com/thebayaan/bayaan-web/commit/82e79d76af5d6281dd2e17d82998e65f715e757a))
* **quran:** open reciter picker from play-from-ayah when none selected. ([4bd652d](https://github.com/thebayaan/bayaan-web/commit/4bd652d7b192ad18a9674d269ff282b657afc5e3))
* **reciter:** redesign surah list with column layout and per-row actions ([#81](https://github.com/thebayaan/bayaan-web/issues/81)) ([128a6cb](https://github.com/thebayaan/bayaan-web/commit/128a6cbdad88515f66eeb7309cde74989971ce0b))


### Fixed

* **a11y:** skip-link, dialog titles, menu keyboard nav, drop invalid ARIA nesting ([#101](https://github.com/thebayaan/bayaan-web/issues/101)) ([43fc10c](https://github.com/thebayaan/bayaan-web/commit/43fc10c3a85ef738ffd57fa15b185d2010d06b80))
* **adhkar:** resolve set-state-in-effect lint in audio controls ([4329d22](https://github.com/thebayaan/bayaan-web/commit/4329d22ee98585cab5540e65655fdb62a159e8f9))
* **indopak:** drop forced justify, use natural RTL right-alignment ([2f81ffd](https://github.com/thebayaan/bayaan-web/commit/2f81ffd431db389d856384489ff2a9aea73fbbea))
* **indopak:** dynamic page width that scales with font size + justify ([c53fb6d](https://github.com/thebayaan/bayaan-web/commit/c53fb6d3e522bcaac70adcfee639bf414f64c209))
* **indopak:** justify lines to full width instead of centering ([e4d7204](https://github.com/thebayaan/bayaan-web/commit/e4d72042f83278e8215bda101cdadd283e25b274))
* **indopak:** justify mushaf lines with flexbox space-between ([65c9b5f](https://github.com/thebayaan/bayaan-web/commit/65c9b5f7a0d1b3f8b1738a32fc1fcbd789268952))
* **indopak:** tighten page width scale from 20 to 18 ([ee803ad](https://github.com/thebayaan/bayaan-web/commit/ee803ada6eb90cda7c900f38378bc2ed1ef2009c))
* **indopak:** use flexbox space-between for line justification ([8828c3a](https://github.com/thebayaan/bayaan-web/commit/8828c3a336189113d4e8fb3fcef7e00f3c31996c))
* **indopak:** use measured word-spacing instead of CSS justify ([bf921b9](https://github.com/thebayaan/bayaan-web/commit/bf921b94da887449b1d61864e3120d62994acfcd))
* **indopak:** widen page container to 700px for better line balance ([5c51e3d](https://github.com/thebayaan/bayaan-web/commit/5c51e3daeee4b38a3988a6cf795a229168de79f2))
* **player:** bottom-left reciter name was being squashed to 0 by rewayah ([#76](https://github.com/thebayaan/bayaan-web/issues/76)) ([0d0666a](https://github.com/thebayaan/bayaan-web/commit/0d0666a00573571784594bc1104d2707da0aa68f))
* **player:** preload last-played track on rehydrate so play actually works ([#66](https://github.com/thebayaan/bayaan-web/issues/66)) ([aac52ea](https://github.com/thebayaan/bayaan-web/commit/aac52ea8445e72ace91cf84328d51acf02c8d39e))
* **quran:** scale QCF mushaf pages instead of resizing glyph font-size ([#82](https://github.com/thebayaan/bayaan-web/issues/82)) ([583d938](https://github.com/thebayaan/bayaan-web/commit/583d93855cb453ffce1a907c59dd8dd323a1de05))
* **reciter/player/reader:** share feedback, bottom-player layout, reading-settings popover ([#73](https://github.com/thebayaan/bayaan-web/issues/73)) ([a6eb2ce](https://github.com/thebayaan/bayaan-web/commit/a6eb2ce8b22e483dad5308b3bcfb1b8457193b5b))
* remove dead lineAlignment center check in flex justify path ([104306e](https://github.com/thebayaan/bayaan-web/commit/104306e49708f691859e957012d49a7f23c71721))
* **timestamps:** point web at the R2 CDN, matching mobile + backend ([#78](https://github.com/thebayaan/bayaan-web/issues/78)) ([b4f398d](https://github.com/thebayaan/bayaan-web/commit/b4f398d83d5bab4489400815ab0c9a25069fe2e6))


### Changed

* **branding:** central config + stop forks from advertising upstream ([#98](https://github.com/thebayaan/bayaan-web/issues/98)) ([51ebd8c](https://github.com/thebayaan/bayaan-web/commit/51ebd8cb5d64ec0e6c4401e258ab0fc2ff6c2d43))


### Documentation

* add changelog, github templates, and expand contributor docs ([5a05d95](https://github.com/thebayaan/bayaan-web/commit/5a05d952cafffcc8aab38c883226c7b141f6e402))
* align OSS docs with Clerk removal and localStorage library ([2ba9700](https://github.com/thebayaan/bayaan-web/commit/2ba97003eae3b6997b2565b1eab480e943317422))
* align OSS docs with Clerk removal and localStorage library ([109a2e8](https://github.com/thebayaan/bayaan-web/commit/109a2e8124c1f8b5f4bacb41054e09c4b18ef999))
* correct AASA/assetlinks paths and refresh attribution ([#97](https://github.com/thebayaan/bayaan-web/issues/97)) ([6f9a7ad](https://github.com/thebayaan/bayaan-web/commit/6f9a7ad83bb2bba133ac51481168e773f913cb8a))
* **license:** name the project copyright holder and correct font notices ([#96](https://github.com/thebayaan/bayaan-web/issues/96)) ([39b31f7](https://github.com/thebayaan/bayaan-web/commit/39b31f7ea516dd30605e3f1f08000bc6b60db4af))

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
