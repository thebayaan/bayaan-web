---
brief: 05
title: Search + discovery
source: deezer.com
captured: 2026-04-16
tool: firecrawl (playwright crashed)
---

# Brief 05 — Search + discovery

## 1. Input placement + typeahead feel

Deezer anchors one global search input in the top app chrome, centered above the content column, persistent on every content route. Placeholder `Artists, tracks, podcasts...` doubles as scope hint. ~36px pill-rounded, leading magnifier, translucent grey on near-black — low contrast at rest. No submit button; Enter commits.

## 2. Live suggestions + recent-search persistence

Logged-out Deezer gates execution: Enter redirects to `/en/offers`, so the live dropdown was not directly observable. The documented pattern renders an on-focus dropdown grouping recents + trending before typing, then grouped suggestions (top result, artists, tracks, albums, playlists) as the query grows. No recent chips survive logout — personalization is auth-only.

## 3. Bayaan comparison `[shell]`

- `[shell]` `src/app/(app)/search/page.tsx:1-163` — page-level search: `useState` query, Fuse.js over reciters + surahs, flat list under input; no dropdown, no sticky chrome.
- `[shell]` `src/app/(app)/search/page.tsx:57-73` — merges reciter + surah Fuse results and sorts by score; loses entity grouping (no Reciters / Surahs headings).
- `[shell]` `src/app/(app)/search/page.tsx:82-138` — empty state is only `No results for X`; pre-query renders a `Browse` grid of 24 reciters.
- `[shell]` `src/components/search/search-input.tsx:13-28` — presentational: leading icon + controlled `<Input>`, placeholder `Search reciters and surahs...`; no focus dropdown, no debounce, no recent-query memory.
- `[shell]` grep `recent|history|localStorage|debounce|suggestion` in both files returns zero matches — no persistence or typeahead layer.

## 4. Results page grouping (tabs vs. sections)

The Deezer artist page (proxy for grouped-results structure) uses an inline tab rail — `Discography · Top tracks · Similar artists · Playlists · On tour · Bio` — active tab marked by a purple underline. Each tab renders labelled section rows with a `View all` affordance. Tab-over-sections is Deezer's signature. Bayaan's merged list has no equivalent: reciters and surahs interleave by Fuse score, no facet switch.

## 5. Empty / zero-state + takeaways for Bayaan

Closest empty state is the 404 (`/us/search` 404s unauthenticated): search field under `Oops... it did it again` with a `Go home` link — reassuring, not dead-ended. Actions for Bayaan: (a) promote search into app chrome; (b) group results into `Reciters` and `Surahs` with counts; (c) on-focus dropdown with recents via `localStorage`; (d) debounce Fuse ~120ms with skeletons; (e) replace bare "No results" with suggestions plus the Browse grid.
