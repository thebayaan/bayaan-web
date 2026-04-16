# Brief 01 — Home / landing / IA

**Target:** https://www.deezer.com
**Date:** 2026-04-16

## 1. What the target does

Anon `deezer.com` is a pure marketing landing page, not the product. Top nav collapses to **Plans / Features / Music** plus **Log in / Sign up**. Hero is a single sentence ("Where music comes to life") with one "Sign up for free" CTA. Below: Free-vs-Premium plan cards, an "Explore our catalog" teaser, a three-up feature grid (SongCatcher, Music Quiz, Lyrics), geo-reach social proof, a "Transfer your music" hook, FAQ, and a dense footer carrying most real IA.

The authed product at `/channels/explore` uses only two top-level tabs — **Home** and **Explore** — and a flat grid of image-first **Channels** tiles: Podcasts, Concerts, New releases, Charts, For you, Chill, Workout, Party, Lofi, decade (2000s, 1980s), mood (Sleep, At home). No genre hierarchy; everything is a peer tile.

## 2. Screenshots / selector evidence

- `screenshots/deezer/01-landing-hero.png` — anon: slim top bar, centered hero + single primary CTA.
- `screenshots/deezer/01-explore-channels-full.png` — authed IA: Home/Explore tabs, flat channel grid.
- `screenshots/deezer/02-desktop-explore.png` — desktop widths of the same surface.
- `screenshots/deezer/02-mobile-explore.png` — mobile IA: tighter column count, same tiles.

Bayaan code cited:

- `src/app/(app)/page.tsx:21-55` — home uses "Good evening" H1 + stacked `ReciterSection` rails (Featured / All / Murattal / Mojawwad).
- `src/components/layout/app-shell.tsx:5-18` — Sidebar + scrollable main + `BottomPlayerBar` (md+) + `MobileTabBar`.

## 3. Transferable patterns → Bayaan

- `[shell]` Keep a two-tab mental model (Home vs Explore). Deezer proves a huge catalog can live under two labels — sidebar stays flat, no deep trees (`app-shell.tsx:9`).
- `[shell]` Anon landing and authed home are **different surfaces**. A future `/` marketing page can follow Deezer's one-promise, one-CTA, plan, FAQ, footer spine without touching `(app)` chrome.
- `[reading]` Greeting H1 anchors the eye; "Good evening" already fits. Keep the H1 short, one sentence — resist stacking secondary headings above the first rail.
- `[reading]` Flat, image-first tiles beat text-heavy cards. Bayaan's `ReciterCard` grid (`page.tsx:12`) aligns — guard against tile metadata creep.
- `[listening]` Persistent bottom player + mobile tab bar is the constant shell; Deezer hides it pre-login. `BottomPlayerBar` + `MobileTabBar` split (`app-shell.tsx:12-15`) already mirrors this.
- `[listening]` Rails named by **intent**, not taxonomy ("For you", "Chill"). Bayaan's "Murattal / Mojawwad" are taxonomy — keep, but let the intent rail ("Featured") lead.

## 4. Do NOT copy

- Marketing chrome on the app (Plans/Features top bar, FAQ accordion, geo stats). Off-brand for devotional.
- The "Channels" branding noun; users want reciters and surahs.
- Footer-as-sitemap dump; Bayaan's IA is narrow enough that it would signal bloat.
- Auto-rotating hero carousels — not present, not worth adding.

## 5. One-line verdict

Adopt Deezer's flat two-tab IA and intent-named rails; reject its marketing chrome and "Channels" framing.
