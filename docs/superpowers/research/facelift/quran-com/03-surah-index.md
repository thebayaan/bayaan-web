# Brief 03 — Surah index

**Target:** https://quran.com/ (surah grid, Navigate-Quran command palette)
**Date:** 2026-04-16

## 1. What the target does

No `/surahs` route (404). The index lives on `/` in two surfaces:

- **Primary: 3-column grid** mid-page with tabs `Surah | Juz | Revelation Order` and a `SORT BY: ASCENDING ▾` control. Revelation Order adds a Tanzil.net disclaimer panel.
- **Secondary: left-docked "Navigate Quran" palette** (home CTA or `ctrl K`) with tabs `Surah | Verse | Juz | Page` and a `Search Surah` input; rows are compact `{id} {name}`.

Each grid card is one row, four metadata slots: left `{chapter#} | {bold transliteration}\n{English meaning}`; right `{Arabic glyph}\n{verses_count} Ayahs` on Surah tab, or `{glyph}\nMeccan|Medinan` on Revelation Order. Juz view swaps the grid to 30 Juz cards — **no grouped-header list**. No sticky header, minimal hover (border darken), no per-row actions. Card click → `/{surah}`.

## 2. Screenshots / selector evidence

`03-surah-grid-tabs.png`, `03-surah-grid-mid.png`, `03-rev-order-grid.png`, `03-navigate-surah-tab.png`, `03-navigate-juz-tab.png` in `screenshots/quran-com/`.

Bayaan refs: `src/app/(app)/quran/page.tsx` (renders `<MushafView />` only — **no index**); `src/components/surah-list-item.tsx` (reciter-only row: index | name + `{translated_name_english} · {verses_count} verses` | play button; no Arabic glyph, no revelation place); `src/data/surah-data.json` (114 surahs with `id`, `name`, `name_arabic`, `revelation_place`, `revelation_order`, `verses_count`, `pages`, `translated_name_english`); `src/app/(app)/reciter/[slug]/page.tsx:117-134` (only `SurahListItem` consumer).

## 3. Transferable patterns → Bayaan

- `[reading]` Replace `/quran/page.tsx`'s direct `<MushafView />` with a **surah-index landing** grid; keep Mushaf behind a view-toggle or deep-link. Bayaan has zero browse surface for chapters today.
- `[reading]` Use `surah-data.json` as-is — all 6 metadata slots Quran.com renders are already there; no backend work.
- `[reading]` **3-col grid** (≥lg), 2-col md, 1-col sm. Card = index | bold transliteration + meaning | Arabic glyph + `{verses_count} ayahs`. Don't reuse `SurahListItem` — it's reciter-scoped.
- `[reading]` Tab bar `Surah | Juz | Revelation Order` using `revelation_order`. Skip asc/desc sort unless cheap.
- `[reading]` Client-side **search input** above grid (name/meaning/number `.filter()` over 114 rows).
- `[shell]` Skip the command palette — grid + search covers 95% of the value.

## 4. Do NOT copy

- Tanzil.net chronology disclaimer panel — no editorial copy pipeline.
- Left-docked command palette — Bayaan sidebar owns that rail; a drawer would collide.
- `Verse` / `Page` palette tabs — verse jumping belongs in `/search`, not the index.
- Relabeling "Makkah → Meccan" for parity — ship JSON values verbatim.

## 5. One-line verdict

Ship a 3-column surah grid at `/quran` with `Surah | Juz | Revelation Order` tabs and a search filter — all metadata is already in `surah-data.json`; `SurahListItem` is reciter-specific and should not be reused.
