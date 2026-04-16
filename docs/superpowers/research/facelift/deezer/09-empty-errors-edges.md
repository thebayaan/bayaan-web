# Brief 09 — Empty states, errors, edge cases

**Target:** https://www.deezer.com
**Date:** 2026-04-16

## 1. What the target does

Deezer handles edges with **calm, branded full-page states** rather than raw system errors. Invalid resource deep-links (e.g. `/us/album/999999999`) redirect to a soft-404 shell — a mascot illustration, a headline ("This page seems to have flown the coop"), and two CTAs: back to Home and open Search. The chrome (sidebar, player bar) stays mounted; only the main column swaps. Logged-out deep-links to `/library`, `/favorites`, or any saved-state route render an **auth gate card** inside the normal layout: title, one sentence of value, a primary "Log in" CTA, and a secondary "Sign up free" link — no modal, no redirect flash. Search no-match shows a centred "No results for X" with three micro-suggestions (check spelling, try a different spelling, try a broader term). Playback failures surface as a **non-blocking toast at the bottom** ("Playback failed. Try again.") while the player bar stays visible so the user doesn't lose queue context. Offline is detected at the network layer: a persistent orange banner pins above the content with "You're offline — showing cached items", and unplayable rows dim to 40% opacity with a small cloud-slash glyph instead of the play button. Rate-limited search degrades silently to cached results; there is no angry red error. Every empty state follows the same skeleton: centred illustration, 1-line headline, 1-line subhead, 1 primary CTA — never more.

## 2. Screenshots / selector evidence

- `screenshots/deezer/09-album-404.png` — invalid album deep-link soft-404 with illustration + Home CTA
- `screenshots/deezer/09-auth-login-gate.png` — logged-out library page gated by centred auth card
- `screenshots/deezer/09-logged-out-home.png` — home with persistent signup strip + empty personal rails
- `screenshots/deezer/09-search-no-results.png` — "No results" with spelling-hint microcopy
- Community threads confirm copy: "The page didn't load. This content is currently unavailable due to a technical error or poor internet connection" and "Your computer seems to be offline. We'll keep trying to reconnect."

## 3. Transferable patterns → Bayaan

**[shell]** Add a root `src/app/not-found.tsx` and `src/app/error.tsx` that render _inside_ the existing app shell (sidebar + mini-player stay mounted). Invalid surah slug (`/surah/999`) currently shows a bare `<h1>Surah not found</h1>` at `src/app/(app)/surah/[id]/page.tsx:29` — upgrade to icon + headline + "Back to Surahs" CTA. Same for `adhkar/[superId]/page.tsx:15` and `adhkar/[superId]/[dhikrId]/page.tsx:19`. Build one shared `<EmptyState icon headline sub cta />` primitive and reuse across queue-empty (`queue-panel.tsx:83`), search no-results (`search/page.tsx:85`), and any future "no bookmarks" screen.

**[listening]** Audio failures (`audio-service.ts` "error" state) should fire a non-blocking toast, not clear the now-playing bar. Keep track metadata visible so the user can retry or skip without re-navigating.

**[reading]** Detect `navigator.onLine`; when offline, dim non-cached reciter rows and show a one-line banner above content. Clerk auth-required routes should render an inline gate card (matching the empty-state primitive) instead of hard-redirecting — preserves URL for post-login return.

## 4. Do NOT copy

Deezer's generic "an error occurred" copy that conflates offline / licensing / server errors is widely criticised in their own community forums — be specific per cause. Skip the mascot illustrations (off-brand for Quran); use restrained Islamic geometric glyphs or simple lucide icons instead. Don't adopt their pushy signup strip on every logged-out page — feels nagging for a Quran app where guest reading is a first-class use case.

## 5. One-line verdict

Ship one `<EmptyState>` primitive + root `not-found.tsx`/`error.tsx` that live inside the shell — covers 404, auth-gate, offline, zero-library, and failed-audio with the same calm layout.
