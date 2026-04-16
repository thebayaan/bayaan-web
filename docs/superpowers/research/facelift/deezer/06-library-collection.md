# Deezer — 06 Library / Collection Management

**Date:** 2026-04-16
**Source:** Playwright crashed; Firecrawl fallback on marketing + feature pages (library behind login).
**Screenshots:** `/Users/osmansaeday/theBayaan/bayaan-web/screenshots/deezer/06-*.png`

## 1. What Deezer Does

Deezer brands its library "Favorites" with parallel tabs — Playlists, Albums, Artists, Tracks, Podcasts. Capped at **10,000 favorite tracks** and **2,000 playlists** (transfer FAQ). The heart is primary ingestion and doubles as algo signal: Flow "analyzes what you like (based on what you add to favorites) and what you don't."

- **View modes:** Playlists/Albums as cover-art **grids**; Tracks/Artists as dense **lists**.
- **Sort + filter:** Top tabs are primary filter chips. Sort (date added / alphabetical / most-played) via dropdown.
- **Empty state:** First-run funnels to "Transfer your entire music library in just a few clicks" — import CTA, not illustration. Flow requires **16 likes** to unlock.
- **Quick-actions:** Row-level kebab — Add to playlist, Add to queue, Go to artist, Share, Remove. Persistent heart toggle.
- **Playlist detail:** Hero (cover, title, count, duration) + Play/Shuffle + Download toggle + scrollable track list with per-row kebab.

## 2. Screenshots

- `06-landing-marketing.png` — homepage hero
- `06-offers-pricing.png` — Free vs Premium tiers
- `06-features-overview.png` — feature grid
- `06-flow-feature.png` — likes feeding recs
- `06-transfer-library.png` — import onboarding

## 3. Bayaan Collection — Current State

- `[listening]` Hub is a flat 4-card grid with zero counts; peers Playlists, Favorites, Bookmarks, Notes with no hierarchy — `/Users/osmansaeday/theBayaan/bayaan-web/src/components/collection/collection-hub.tsx`
- `[listening]` Favorites list shows raw `Surah {id}` + truncated `reciter_id`; no cover, reciter name, or play action — `/Users/osmansaeday/theBayaan/bayaan-web/src/app/(app)/collection/favorites/page.tsx:27-40`
- `[listening]` Playlists grid lacks cover art, track count, sort/filter, and New Playlist CTA — `/Users/osmansaeday/theBayaan/bayaan-web/src/app/(app)/collection/playlists/page.tsx:28-44`
- `[listening]` Playlist detail is a stub — no hero, no track list, no Play/Shuffle — `/Users/osmansaeday/theBayaan/bayaan-web/src/app/(app)/collection/playlists/[id]/page.tsx`
- `[shell]` Empty states are generic ("No X yet") with no onboarding hook — `/Users/osmansaeday/theBayaan/bayaan-web/src/app/(app)/collection/bookmarks/page.tsx:19-26`, `/Users/osmansaeday/theBayaan/bayaan-web/src/app/(app)/collection/notes/page.tsx:19-24`
- `[shell]` No row-level kebab / quick-actions; rows aren't playable in place

## 4. Recommendations

1. Collapse hub into a **tabbed Library** (Playlists / Favorites / Bookmarks / Notes) with persistent sort + search.
2. Favorites row = reciter avatar + surah name + reciter name + duration + inline Play + kebab.
3. Playlist detail: hero + Play/Shuffle + track list with kebab.
4. Empty states should CTA next action ("Browse reciters", "Open Quran reader") — mirror Deezer's transfer-led onboarding.
5. Soft cap messaging only near threshold, not up-front.
