# Brief 05 — Search (verse / word / topic)

**Target:** https://quran.com/search
**Date:** 2026-04-16

## 1. What the target does

Quran.com exposes one unified text search at `/search?query=<q>` — no mode toggle. It routes four intents off the same input:

- **Free word / phrase** ("mercy" → 200, "prayer" → 200). Each hit shows the full Arabic verse + one English translation, matched token italicized inline. Reference appends as `(Al-Baqarah 2:157)` linking to `/2?startingVerse=157`.
- **Verse reference** ("2:255" → exactly 1 result, Ayat al-Kursi). Parser recognizes `surah:ayah` and collapses to a single-card deep link — a disambiguator, not a corpus search.
- **Arabic word** ("رحمة" → 142). Translation column drops; results show Arabic verse only with the matched Arabic token italicized; reference switches to transliteration.
- **Topic-as-keyword**: no facets, tags, or semantic re-ranking — purely lexical over translation + Arabic corpus.

Layout is one centered column: sticky input with `×` clear, count header, stacked cards with copy icon, numbered pagination (10/page), no filter rail. Header also carries an icon-only search popover reachable from every page.

## 2. Screenshots / selector evidence

- `screenshots/quran-com/05-search-home-header.png` — home hero search with `Navigate Quran` / `Popular` chips and header search icon.
- `screenshots/quran-com/05-search-mercy.png` — "mercy": Arabic + English pair, italicized match, surah:ayah tail.
- `screenshots/quran-com/05-search-prayer.png` — "prayer": same pattern, longer verses, no truncation.
- `screenshots/quran-com/05-search-ayat.png` — "2:255": single-result reference lookup, one card.
- `screenshots/quran-com/05-search-arabic.png` — "رحمة": Arabic-only results, italic Arabic match, paginated to 15 pages.

Bayaan refs: `src/app/(app)/search/page.tsx` (Fuse over reciters + surahs only), `src/components/search/search-input.tsx`, `src/components/layout/sidebar.tsx:17`, `src/components/layout/mobile-tab-bar.tsx:10`.

## 3. Transferable patterns → Bayaan

- `[reading]` Extend `search/page.tsx` to a third result class **Verse** — parse `^\d+:\d+$` client-side, deep-link to `/quran/[surah]?verse=[n]`. Zero backend cost, covers the biggest user intent.
- `[reading]` When a verse result is rendered, show Arabic + one translation and **italicize the matched token** inline; append `(Surah Name S:A)` tail — keep the whole row clickable.
- `[shell]` Keep one unified input (no tab toggles) — let the parser route. Matches QC's low-friction feel and fits Bayaan's current single `<SearchInput>`.
- `[shell]` Add a header search icon that opens a lightweight command-palette-style popover, mirroring QC's always-present entry point — complements the sidebar `/search` route already in `sidebar.tsx`.
- `[listening]` Keep Bayaan's reciter + surah hits at the top of the result list above any verse hits — preserves Bayaan's listening-first identity that QC lacks.

## 4. Do NOT copy

- No filter / facet rail is acceptable for QC's single-corpus scope but Bayaan will eventually need a **type chip row** (Reciters / Surahs / Verses) once verse results land.
- The English-query → Arabic-token-not-highlighted asymmetry is a UX bug, not a pattern — highlight both scripts.
- Pagination with 10/page is fine for verses but wrong for reciter grids — keep Bayaan's infinite scroll on reciter results.
- Topic pills on QC Home are editorial links, not a real topic index — don't fake a taxonomy Bayaan can't maintain.

## 5. One-line verdict

Adopt QC's unified-input + reference-parser + inline-italic-match-with-surah-tail pattern; keep Bayaan's reciter-first ranking and resist faking topic facets.
