# Brief 09 — Empty states, errors, edge cases

**Target:** https://quran.com (edge surfaces)
**Date:** 2026-04-16

## 1. What the target does

Quran.com collapses every edge into one of four canonical treatments:

- **Invalid deep link** (`/300`, `/2/500`, `/2/300`) → HTTP 404 from Next.js, renders a single centered screen: black-serif `Sorry, something went wrong` title, black pill `Go Back` primary CTA, secondary line `If the issue persists, please report a bug` (teal link to `feedback.quran.com`). Full footer stays mounted. No illustration, no surah suggestion, no auto-redirect. Verse-out-of-range within a valid surah is the same screen — there is no soft "closest verse" fallback.
- **First-time reader / anon** → Home renders a `Continue Reading` card seeded with `1. Al-Fatihah (The Opener) — Verse 1` (the calligraphic `الفاتحة` glyph as art). The card is never empty; the product's answer to "no history" is "start at Fatihah."
- **Search no-results** → Centered magnifier icon, `No results found` H2, subtitle `We could not find any matching search results for "<query>". try searching for a different keyword.` (sic, lowercase "try") — no suggestions, no "did you mean", no topic chips. Input stays filled with an `×` clear. Full footer mounted below the empty state.
- **Missing translation / tafsir / audio** (i18n telemetry, not shown): inline toast/placeholder strings `no-translation-selected`, `no-tafsir-selected`, `no-text: "{tafsirName} is not available for the current verse."`, `no-audio: "No Audio"`, `no-verses-available`, `verse-metadata-failed: "Failed to load verse metadata"`. Generic network: `offline: "Looks like you lost your connection. Please check it and try again."` and `general: "Something went wrong. Please try again."` with a `Retry` button. Reading page never crashes on missing translation — it shows the Arabic alone.

Pattern: one global error screen, graceful inline degradation everywhere else, toast + retry for transient failures.

## 2. Screenshots / selector evidence

- `screenshots/quran-com/09-invalid-ayah-2-500-error.png` — canonical 404 screen (`_error_container__b3YeW`, `_error_title__l0DhM`, `_error_goBack__5_IBV`, `_error_reportBug__n_KMH`).
- `screenshots/quran-com/09-search-no-results.png` — `zzxxqqww...` → magnifier + `No results found` + hint line.
- `screenshots/quran-com/09-home-first-time-continue-reading.png` — anon Home seeded with Al-Fatihah + "Achieve Your Quran Goals" + "Beyond Ramadan" upsell.
- `screenshots/quran-com/09-home-default-fatihah-anon.png` — same card, full-width showing footer + Explore Topics continuation.

Bayaan refs: `src/app/(app)/quran/[surah]/page.tsx:8-14` (bare `<h1>Invalid surah number</h1>`, no CTA), `src/app/(app)/collection/bookmarks/page.tsx:19-26`, `src/app/(app)/collection/favorites/page.tsx:21`, `src/app/(app)/collection/playlists/page.tsx:22`, `src/app/(app)/collection/notes/page.tsx:20`, `src/app/(app)/search/page.tsx:85` (`No results for "{query}"` — one line, no icon), `src/components/player/queue-panel.tsx:81-86`, `src/services/audio/audio-service.ts` (no `onerror` handler, no 404 toast). No `error.tsx`, `not-found.tsx`, or `loading.tsx` anywhere under `src/app/` — Next.js default error screen will ship to production.

## 3. Transferable patterns → Bayaan

- `[shell]` Add root `src/app/(app)/not-found.tsx` and `src/app/(app)/error.tsx` with the QC triad: title (`We couldn't find that verse`), primary CTA (`Back to Home` / `Back to Surah 1`), secondary report link. Deletes the default Next.js screen.
- `[reading]` Replace `quran/[surah]/page.tsx:8-14` invalid-surah `<h1>` with a real empty state: icon + `Surah {n} doesn't exist` + `There are 114 surahs — go to Al-Fatihah` button. Same for verse-out-of-range inside `ReadingView` — clamp + toast `Verse {n} doesn't exist in this surah (has {count})`.
- `[shell]` Standardize all four collection empty states (`bookmarks`, `favorites`, `playlists`, `notes`) on one `<EmptyState icon title subtitle cta?>` component — they already share the pattern, just consolidate.
- `[listening]` Wire `audio-service.ts` `audio.onerror` → toast `No audio available for this reciter/surah` with Retry, mirroring QC's `no-audio` + `general` + `Retry` vocabulary. Without it, a 404 MP3 is silent-fail today.
- `[reading]` On missing translation, degrade inline to Arabic-only + subtle `Translation unavailable for this verse` caption — don't blank the row. QC's `no-text` copy is the template.

## 4. Do NOT copy

- QC's `Sorry, something went wrong` is generic — for Bayaan's invalid-surah/ayah specifically, name the problem (`Surah 300 doesn't exist`) so users self-correct.
- Don't copy QC's `try searching for a different keyword.` (lowercase t, period after quote) — obvious i18n concat bug.
- Don't auto-seed bookmarks/favorites with Al-Fatihah the way QC seeds Home's Continue Reading — collection views should read as empty-but-inviting, not pre-populated.
- Skip QC's `report a bug → feedback.quran.com` link on every error until Bayaan has a real feedback channel — dead links erode trust.

## 5. One-line verdict

Adopt QC's one-global-error-screen + inline-graceful-degradation pattern; name the specific failure (surah/ayah/audio) instead of copying the generic "something went wrong" and keep collection empties genuinely empty.
