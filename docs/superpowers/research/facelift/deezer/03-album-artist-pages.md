# Brief 03 — Album + Artist Pages

**Targets:** https://www.deezer.com/us/artist/27 (Daft Punk), https://www.deezer.com/us/album/302127 (Discovery)
**Date:** 2026-04-16
**Source:** Playwright crashed after first navigation; Firecrawl fallback, 1920×1080 viewport + full-page, `--wait-for 4000`.

## 1. What the target does

Left-aligned hero on flat near-black — no blurred-art backdrop, no gradient. Artwork is a hard-edged square (album) or circle (artist) at ~220px with subtle shadow. Title (~44px) sits beside it over one pipe-separated meta line: album `artist · 14 tracks | 1 h 01 minute | 03/07/2001 | 330,332 fans`; artist just `5,138,965 fans`. No genre chips, no hero bio. Action row sits **below** the art, not overlapping: magenta circular Play All (album) or `Mix` pill (artist), then ghost heart/share/kebab. Artist page adds an underlined tab strip (`Discography · Top tracks · Similar artists · Playlists · Bio`). Tracklist rows are airy — number, 40px cover, title, then right-side heart/kebab/duration/popularity-bar/checkbox; playing row turns magenta with a filled play glyph replacing the number. Related surfaces are plain horizontal rails. No sticky hero.

## 2. Screenshots / selector evidence

- `screenshots/deezer/03-artist-hero.png` — Daft Punk hero, tab bar, top tracks, Playlists rail.
- `screenshots/deezer/03-artist-page.png` — full artist scroll: Most popular release, Similar artists, Albums/EPs rails.
- `screenshots/deezer/03-album-hero.png` — Discovery hero, action row, tracklist start.
- `screenshots/deezer/03-album-tracklist-closeup.png` — numbered rows, playing-state on track 1.
- `screenshots/deezer/03-album-page.png` — full album scroll incl. Discography rail.

Bayaan refs: `src/app/(app)/reciter/[slug]/page.tsx`, `src/components/reciter-header.tsx`, `src/components/reciter-card.tsx`, `src/app/(app)/surah/[id]/page.tsx`, `src/components/surah-list-item.tsx`, `src/components/quran/surah-header.tsx`.

## 3. Transferable patterns → Bayaan

- `[listening]` Move Play All into an action row **under the artwork** with ghost heart/share/kebab — `reciter/[slug]/page.tsx:107-115` floats it in its own band.
- `[listening]` Collapse `reciter-header.tsx:36-47` meta into one pipe line: `{rewayat} rewayat · {surah_total} surahs · {style}`; drop the bio stack.
- `[listening]` Surah page (`surah/[id]/page.tsx:44-54`) has no artwork — reuse `SurahHeader` glyph at 192px left, title + inline meta right.
- `[listening]` Rewayat chips (`reciter/[slug]/page.tsx:89-105`) should render as an underlined tab strip, not filled pills — they're nav.
- `[listening]` `surah-list-item.tsx`: add an inline duration column and a subtle listened-state marker — right-side density is what signals "tracklist."
- `[listening]` Pipe accent color through to the current row's title alongside the equalizer bars (`surah-list-item.tsx:22-34`).
- `[listening]` Add "Similar reciters" + "Popular surahs" rails below the tracklist, reusing `reciter-card.tsx`.
- `[listening]` On surah page, trim the reciter row to single-line tracklist density with inline Play/kebab.
- `[shell]` Skip sticky hero-to-compact — Deezer doesn't do it and `app-shell` is enough.

## 4. Do NOT copy

- Blurred-artwork gradient backdrop (that's Spotify, not Deezer).
- Fan-count metric — no follower graph to back it.
- Bulk-select checkboxes per row — no flow needs them yet.
- Popularity bar — no play-count data.
- Keyboard-shortcut overlay; over-engineered here.
- "Most popular release" as a separate block — collapse into Discography rail.

## 5. One-line verdict

Adopt Deezer's left-hero + inline-meta + below-art action row, put artwork on the surah page, tighten the reciter row to tracklist density, and add related rails — skip fan counts, bulk-select, and sticky-hero.
