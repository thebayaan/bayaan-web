# Brief 06 — Bookmarks + reading plans (analysis-only; plans are NOT a Bayaan feature)

**Target:** https://quran.com/1, /my-quran, /reading-goal, /calendar
**Date:** 2026-04-16

## 1. What the target does

Three save concepts (only two map to Bayaan): **Ayah bookmark** — icon in verse row `verse_key · ▶ · 🔖 … 📋 · share · ✎ · ⋯`, one-tap toggle, no dialog, no color picker, notes live on a separate pencil icon, signed-out taps silently no-op. **"My Reading Bookmark"** at `/my-quran` — single pinned slot auto-capturing last-read position (resume primitive, not a list). **Collections** at `/my-quran` under tabs `Saved / Recent / Notes & Reflections` — notes get their own tab.

Reading plans: `/reading-goal` = preset cards (10 min/day, 30 days, 1 year, Custom) with one "Recommended" pill. `/calendar` = "Quran in a Year" serif hero + big `Week 4` sidebar card + flat ayah list + Subscribe/WhatsApp/Telegram CTAs. No rings, streaks, or confetti. `/reading-plans` 404s.

## 2. Screenshots / selector evidence

- `screenshots/quran-com/06-surah-reader.png` — verse action row, outlined bookmark icon.
- `screenshots/quran-com/06-my-quran-bookmarks.png` — Saved / Recent / Notes & Reflections tabs + empty "My Reading Bookmark".
- `screenshots/quran-com/06-my-quran-collections.png` — home "Continue Reading" card with `My Quran` bookmark-icon link.
- `screenshots/quran-com/06-reading-goal.png` — preset goal cards.
- `screenshots/quran-com/06-calendar-plan.png` — Quran-in-a-Year hero + Week-N card.
- `screenshots/quran-com/06-calendar-week-verses.png` — reader fallback.

Bayaan refs: `src/app/(app)/collection/bookmarks/page.tsx:38` (already shows `bm.note` under verse_key), `src/app/(app)/collection/notes/page.tsx:29`, `src/hooks/use-bookmarks.ts:10`, `src/hooks/use-notes.ts:10`, `src/components/collection/collection-hub.tsx:32`, `src/types/quran.ts:23`.

## 3. Transferable patterns → Bayaan

- `[reading]` **One-tap toggle** bookmark icon — outlined vs filled. `VerseBookmark.note` is already optional, so this shape fits.
- `[reading]` In the ayah action row, **split** `🔖 bookmark` (toggle) from `✎ pencil` (opens note sheet). Don't bundle.
- `[reading]` Add `Saved / Recent / Notes` **tab row** to `/collection/bookmarks`; wire `useNotes()` into the third tab so notes-without-bookmarks stay reachable.
- `[reading]` Pin a **"Continue Reading"** slot at the top of `/collection/bookmarks` (QC's "My Reading Bookmark"). Store last verse in `localStorage`; deep-link `/quran/[surah]?verse=[n]` — zero backend.
- `[reading]` Keep Bayaan's `bm.note` line-clamp preview (`bookmarks/page.tsx:38`) — QC hides notes on a separate tab; Bayaan's is better.

## 4. Do NOT copy

- **Reading plans feature is OUT OF SCOPE.** Bayaan does not ship `/calendar`, `/reading-goal`, preset pickers, weekly schedules, or Subscribe/WhatsApp/Telegram CTAs. Listening + light reading is the product; yearlong plans are a different one. Don't name a route `/reading-plans`.
- Three overlapping save surfaces confuse QC users — keep Bayaan's single `VerseBookmark`. "Continue Reading" is UI state, not a new entity.
- Silent no-op on signed-out bookmark tap is a bug — Bayaan has Clerk; show a real sign-in prompt.
- Drop "Notes & Reflections" (QuranReflect branding) — keep clean `Notes`.

## 5. One-line verdict

Adopt QC's one-tap toggle + separate pencil-for-notes + `Saved / Recent / Notes` tabs + pinned "Continue Reading" slot at `/collection/bookmarks`; reject reading plans entirely.
