# Brief 04 — Now-playing + queue UX

**Target:** https://www.deezer.com
**Date:** 2026-04-16

## 1. What the target does

Deezer's player is auth-gated; marketing redirects unauth visitors to `/offers` behind a cookie modal. Per Support + third-party guides + community threads: persistent bottom bar + Queue side panel + fullscreen now-playing route.

Bar layout: artwork/title/artist (L); play-pause + prev/next + progress (C); shuffle, repeat, queue, lyrics/mic, volume, audio-quality selector Std/Better/HiFi (R). Artwork click → fullscreen view with cover, scrolling lyrics, up-next.

Queue is **cloud-synced cross-device**. "Add to queue" appends; "Play next" inserts after current. Drag-handle reorder; swipe-left mobile / hover-reveal delete desktop. Shuffle + repeat sync with queue. Desktop has opt-in auto-recommendations.

## 2. Screenshots / selector evidence

- `screenshots/deezer/04-deezer-home.png` — homepage under cookie wall.
- `screenshots/deezer/04-features-page.png` — Features marketing.
- `screenshots/deezer/04-player-guide.png` — third-party guide with playback-control callout.
- `screenshots/deezer/04-queue-article.png` — Support: "Cloud-Based Queue List."
- `screenshots/deezer/04-newsroom-customization.png` — Nov-2025 theming/layout.

Community quotes: now-playing square "replaced by a miniscule icon at the bottom right"; queue icon "only shows previous and soon-to-be-played songs"; "cannot clear the queue with one button."

## 3. Transferable patterns → Bayaan

- `[listening]` Cloud-synced queue that survives device switches — graduate `player-store` from Zustand persistence to server-authoritative.
- `[listening]` Dual insert semantics: "Play next" (insert at `currentIndex+1`) vs "Add to queue" (append). `queue-panel.tsx:66` only jumps; add both to track context menus.
- `[listening]` Add a collapsible "History" section above "Now Playing" in `queue-panel.tsx`.
- `[listening]` Hover-reveal remove icon and drag handle to reorder — both missing from `queue-panel.tsx`.
- `[listening]` Lyrics/mic icon routing to a translation/tafsir mode — new button beside `volume-control.tsx` that expands `full-player-view.tsx` into a scrolling-translation layout.
- `[listening]` Promote the rate chip (`full-player-view.tsx:117-122`) into the bottom bar next to volume for one-tap access.
- `[shell]` Confirm `bottom-player-bar.tsx:71` footer stays pinned under long scrolling pages (Deezer regressed here per webcompat #112994).
- `[listening]` Repeat-one glyph with overlaid "1" — Bayaan already matches at `player-controls.tsx:109-113`; keep.

## 4. Do NOT copy

- Shrinking the now-playing tile to a tiny icon.
- Hiding "clear queue" — expose it in `queue-panel.tsx` header.
- Free-tier queue restrictions — irrelevant for recitation.
- Cookie-wall + redirect hostility on unauth visits.

## 5. One-line verdict

Adopt Deezer's cloud queue + dual-insert semantics and hover-remove affordances; reject the shrunken now-playing tile and missing clear-queue button.
