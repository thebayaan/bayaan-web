# Brief 02 — Top nav / reader chrome

**Target:** https://quran.com, https://quran.com/1, https://quran.com/2/255
**Date:** 2026-04-16

## 1. What the target does

One **persistent top bar** (~56px, under a teal promo ribbon): wordmark left; `Sign in` / globe / search / hamburger right. Shared home+reader, **sticky, non-collapsing** on scroll.

Reader chrome at `/1` sits below as a second strip:

- Left: **surah picker** dropdown ("1. Al-Fatihah ▾") — breadcrumb + jump.
- Center: `▶ Listen` + `Translation: Dr. Mustaf…` dropdown; `🔖 Page 1 · Juz 1 / Hizb 1` (display-only).
- Right: **view-mode toggle** `Verse by Verse | Reading` + gear (drawer: reciter, translations, tajweed, word-by-word, transliteration, Arabic font size).

On `/2/255` chrome is identical; body swaps to a single-ayah card with `Reset full surah` / `Continue`. Prev/next ayah nav is **not in the chrome** — per-verse icons (play, bookmark, share, copy, edit, more) live on each ayah; Reading mode pages by mushaf spread.

## 2. Screenshots / selector evidence

- `02-home-topbar.png`, `02-surah-1-reader.png`, `02-surah-1-reading-mode.png`, `02-surah-2-reader.png`, `02-ayah-255-deeplink.png` in `screenshots/quran-com/`.

Bayaan refs: `src/components/layout/app-shell.tsx` (no top bar), `sidebar.tsx`, `mobile-tab-bar.tsx`, `src/app/(app)/surah/[id]/page.tsx` (reciter picker, not a reader), `src/components/quran/reading-view.tsx`, `mushaf-view.tsx`, `surah-header.tsx` (glyph + bismillah, no controls), `src/stores/reading-settings-store.ts` (fontSize/translationIds/showTajweed/showWordByWord/showTransliteration/mushafPage — state exists, no UI binds it).

## 3. Transferable patterns → Bayaan

- `[reading]` Add a **sticky reader sub-header** above `ReadingView`/`MushafView`: left = surah dropdown, right = view-mode toggle (ReadingView ↔ MushafView, both exist, no toggle yet) + settings gear.
- `[reading]` Wire the gear to a drawer that binds `reading-settings-store` (fontSize, translationIds, showTajweed, showWordByWord, showTransliteration) — store built, UI missing.
- `[reading]` Display Page / Juz as a read-only location row using `word.page_number` already fetched.
- `[reading]` Keep per-verse actions inline on the verse row, not in chrome.
- `[shell]` Skip a global top bar — sidebar + mobile tab bar cover nav. Keep reader sub-header sticky, non-collapsing.

## 4. Do NOT copy

- Top-level promo ribbon — no editorial pipeline.
- Globe/language switcher — English-only today.
- Full-width search overlay — `/search` route already exists.
- Per-ayah Tafsirs / Lessons / Reflections / Answers / Hadith bar — out of scope.

## 5. One-line verdict

Skip a global top bar; add a sticky reader sub-header with surah picker, view-mode toggle, and a settings gear that finally binds `reading-settings-store`.
