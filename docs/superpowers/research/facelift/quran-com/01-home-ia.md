# Brief 01 — Home / IA

**Target:** https://quran.com
**Date:** 2026-04-16

## 1. What the target does

Quran.com is a reading-first devotional site. The landing surface is a single scroll: thin promo ribbon, centered wordmark, large search bar with chips **Navigate Quran** and **Popular**. Below sits the primary `Start Reading` card — Al-Fatihah Arabic preview + **Begin** button, with a `My Quran` link for the authed continue-reading surface. A side column stacks `Beyond Ramadan` and `Achieve Your Quran Goals` (streaks, custom goals). Then `Explore Topics` (pill links), a `Start Learning` 6-card rail, `Quran in a Year` (weekly verse, word-by-word), `Community`, `Quran Apps`. Page ends with the full **Surah / Juz / Revelation Order** chapter index as tabbed tables. Top nav is minimal: logo, search icon, language, theme, burger, `Sign in`. Footer exposes the real IA: Home, Quran Radio, Reciters, About, Developers.

## 2. Screenshots / selector evidence

- `screenshots/quran-com/01-home-viewport.png` — above-the-fold: search, Start Reading, goals card.
- `screenshots/quran-com/01-home-full.png` — full scroll: learning plans → weekly verse → chapter index.
- `screenshots/quran-com/01-surah-reader.png` — `/1` reader destination of the Begin CTA.
- `screenshots/quran-com/01-reading-goal.png` — `/reading-goal` preset/custom goal picker.
- `screenshots/quran-com/01-footer-nav.png` — Navigate / Our Projects / Popular Links footer IA.

Bayaan refs: `src/app/(app)/page.tsx` (reciter grid), `src/app/(app)/layout.tsx`, `src/components/layout/app-shell.tsx`, `src/components/layout/sidebar.tsx` (Home / Search / Read Quran / Collection / Settings).

## 3. Transferable patterns → Bayaan

- `[shell]` Promote Bayaan's Search into a **hero search bar** on Home with inline chips (Surahs, Reciters) — matches the "where do I go?" first-visit intent.
- `[shell]` Keep promos to a **thin top ribbon**, not a hero card — Home viewport belongs to content.
- `[reading]` Add a **"Start Reading" card** on Home: one surah preview + big primary button linking into Bayaan's existing `/quran` route.
- `[reading]` Tab the `/quran` index as **Surah / Juz** (QC also adds Revelation Order) — low-cost IA structure on a route that already exists.
- `[shell]` Mirror the **section rhythm** (hero → shortcuts → rail → index) to pace Bayaan Home instead of stacking reciter grids flat.

## 4. Do NOT copy

- Long chapter table dumped on the landing — it would bury Bayaan's reciter catalog.
- Multi-banner top stack (promo + wordmark + search + chips) — too dense.
- Reading goals / streaks gamification — not in Bayaan scope.
- Learning-plans editorial surface — no pipeline for it.

## 5. One-line verdict

Adopt QC's hero-search + Start-Reading card and tabbed Surah/Juz index; skip the editorial, gamification, and chapter-dump moves.
