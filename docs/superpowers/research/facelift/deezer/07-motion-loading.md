# Brief 07 — Motion, Transitions, Loading States

**Targets:** https://www.deezer.com/en/channels/explore, /en/album/302127, /en/artist/27, /en/playlist/1313621735
**Date:** 2026-04-16
**Source:** Playwright blocked — Deezer 302'd every nav to quran.com and then force-closed the WS (anti-bot). Firecrawl full-page screenshots + direct `curl` of the real CSS bundle `https://cdn-files.dzcdn.net/cache/css/sass_c/app-web.27c54a69b5fac7194857.css` (201 KB, parsed offline). No live hover-state capture; durations/easings read from compiled CSS rules, not DevTools.

## 1. What the target does

Deezer's motion vocabulary is deliberately modest — nothing framer-grade, it's all CSS transitions and a handful of `@keyframes`. There are effectively **three durations** and **two easings**:

- `transition-duration: .15s` — the house default for hover color/opacity/border changes (btn, navbar-link, dropdown-item, thumbnail action buttons, slide CTAs, icon-stack-hover). Applied to `background-color, border-color, color, opacity, box-shadow` — **not** transform.
- `transition-duration: .35s` — slower opacity crossfade on `.thumbnail-animated .picture .picture-img` (album-art loaded reveal).
- `transition-duration: .5s / .6s / .8s` — carousel scrub (`.6s transform`), slide covers (`.8s background-color,border-color`), hero slide opacity (`.5s`).

Easings are just `ease-in-out` (carousel) and `linear` (logo, slide-cut). **Zero `cubic-bezier()` declarations in the whole bundle** — Deezer doesn't run a bespoke spring curve; this is bootstrap-era web-app motion. `transition-delay: .1s` shows up once for hover intent on cards.

Hover microinteractions: `.thumbnail:hover` raises `box-shadow: 0 1px 6px #1919223d` + fades in action buttons (opacity 0→1), no Y-lift, no scale on the card itself. Only the inner play-circle scales: `.thumbnail .action-item-btn:hover { transform: scale3d(1.2,1.2,1.2) }` at the default .15s. Press feedback is a color flip on `:active` (e.g. `.btn-primary:active { background-color: #9333e8 }`) — no scale-down.

Keyframes library: `pulse` (scale 1→1.08→1, the favorite-heart tap), `bounce-scale` (1→1.2→1), `shake .7s`, `wobble .3s` + horizontal variants, `spin` (linear infinite rotate), `chromecast 1.5s steps(1) infinite`, and a `thumbnail-preview-1/2/3` trio (scaleX reveal + .75s linear infinite spin). Skeleton loaders are **not** shimmer bars — Deezer ships a static `.placeholders-img` 56px illustration + title + link; no animated gradient sweep in the CSS.

Page transitions: none. Deezer is SPA-routed but renders without crossfade — new routes just replace content.

Queue reorder: off-screen without auth; no drag-drop transform tokens present in the bundle to infer from.

Audio-load progress: the big magenta play button doesn't show a spinner in CSS tokens; the equalizer-bars "playing" state on tracklist rows is the load indicator. The `thumbnail-preview` keyframes (spin + scale reveal) appear to be the audio-buffer UI.

## 2. Screenshots / selector evidence

- `screenshots/deezer/07-explore-fullpage.png` — channels grid; base state (hover not capturable via scrape).
- `screenshots/deezer/07-album-page.png` — album hero, magenta play button, track row playing state.
- `screenshots/deezer/07-artist-page.png` — artist hero, Mix pill, tab underline, heart buttons.
- `screenshots/deezer/07-playlist-page.png` — playlist tracklist density.
- `screenshots/deezer/07-landing-initial.png` — 404 "Oops did it again" (bot wall) — kept as evidence of blocked state.

Raw selector evidence (`/tmp/deezer-fc/app-web.css`):

- `.btn { transition-duration: .15s; transition-property: background-color, border-color, color, opacity }`
- `.thumbnail .action-item-btn:hover { transform: scale3d(1.2,1.2,1.2) }`
- `.thumbnail:hover { box-shadow: 0 1px 6px #1919223d }`
- `.carousel-inner { transition-property: transform; transition-duration: .6s; transition-timing-function: ease-in-out }`
- `@keyframes pulse { 0%,30%{scale(1)} 40%{scale(1.08)} 50%{scale(1)} }`
- `@keyframes thumbnail-preview-1 { 0%{opacity:0;transform:scale3d(0,0,1)} to{opacity:1;transform:scaleX(1)} }`

Bayaan refs: `src/components/player/bottom-player-bar.tsx`, `src/components/player/full-player-view.tsx`, `src/components/player/queue-panel.tsx`, `src/components/player/progress-bar.tsx`, `src/components/collection/collection-hub.tsx`, `src/components/reciter-card.tsx`, `src/components/surah-list-item.tsx`, `src/components/quran/reading-view.tsx`, `src/components/quran/mushaf-view.tsx`.

## 3. Transferable patterns → Bayaan

- `[shell]` Adopt a **three-token ladder**: `--motion-fast: 150ms` (hover color/opacity), `--motion-medium: 350ms` (art reveal, sheet), `--motion-slow: 600ms` (carousel, hero crossfade). Single easing `ease-in-out`; no custom cubic-bezier. `framer-motion` is installed (`package.json:29`) but **zero imports** in `src/components/` — don't pull it in for Deezer-class motion, Tailwind `transition-*` suffices.
- `[shell]` Standardize hover on interactive surfaces to `.15s` on color/opacity/shadow only — `reciter-card.tsx:20` already does this; keep `transition-transform group-hover:scale-105` at `.15s` and drop any longer defaults.
- `[shell]` Replace `animate-pulse` placeholder stripes in `quran/reading-view.tsx:26` with Deezer-style static empty illustration + title/link (no shimmer) — matches their `.placeholders-img` pattern; cheaper and calmer.
- `[listening]` Album-art-loaded reveal: wrap `<Image>` in `reciter-card.tsx:30` with `opacity-0` + `transition-opacity duration-[350ms]` + `onLoad` → `opacity-100`. Mirrors `.thumbnail-animated .picture .picture-img`.
- `[listening]` Card press feedback: `:active` should color-flip not scale-down — apply to `reciter-card.tsx:20` and `collection-hub.tsx:54` via `active:bg-[var(--text-alpha-08)]`, no `active:scale-95`. Deezer never scales on press.
- `[listening]` Favorite heart: adopt `@keyframes pulse` (scale 1→1.08→1 @ ~400ms) on heart-tap success inside `full-player-view.tsx`; current toggle has no feedback.
- `[listening]` Play-on-card-hover: only the **inner play circle** scales (1→1.2 @ .15s), not the card — so add `group-hover:scale-110 transition-transform duration-150` to the play glyph inside `surah-list-item.tsx:22-34` and remove any card-level transform.
- `[listening]` Audio-load state: the big play button in `player-controls.tsx` should show a `@keyframes spin` ring (linear infinite) during buffer — mirrors Deezer's `thumbnail-preview-3` trick. `progress-bar.tsx` needs a separate "indeterminate" mode before `duration` resolves.
- `[listening]` `queue-panel.tsx` currently has no enter/exit or reorder animation. For reorder, use CSS `transition: transform .2s ease-out` on the list items — framer-motion `Reorder` is overkill; Deezer doesn't have animated reorder either.
- `[listening]` Now-playing row in `surah-list-item.tsx` should crossfade the row-number → equalizer icon on `.15s opacity` — Deezer's track-1 playing state does exactly this.
- `[reading]` Mushaf page-turn in `mushaf-view.tsx` / `reading-view.tsx` has no transition; a `.6s ease-in-out` opacity crossfade (matching `.slide.slide-cut .slide-img`, duration `.5s`) between pages is the Deezer-consistent move — skip slide-in/out, skip spring.
- `[reading]` Word highlight in `quran-word.tsx` on playback should use `transition: background-color .15s ease-in-out` (Deezer navbar-link cadence) — fast, no easing drama.

## 4. Do NOT copy

- `shake` / `wobble` keyframes — error-state gimmicks, Bayaan tone is calm.
- `konami` easter-egg animation (`wobble_1 5s infinite`).
- `@keyframes chromecast` cast-button specific, no analog here.
- Don't introduce custom `cubic-bezier()` curves — Deezer ships zero and the app still feels snappy. Resist the spring/overshoot urge.
- Don't add shimmer-gradient skeletons; Deezer doesn't and Bayaan's existing `animate-pulse` solid-rect is already closer to the mark than a fancier one would be.
- Don't animate page transitions between routes — Deezer does none; `framer-motion` `AnimatePresence` in the app router is bundle weight for no UX win.
- No scale-on-press; it reads as iOS, not Deezer-desktop.

## 5. One-line verdict

Ship a three-token CSS ladder (150/350/600ms, ease-in-out only), wire it onto existing Tailwind `transition-*` classes, add `onLoad` opacity reveal for art, a spin-ring for audio-buffer, and a pulse on heart-tap — then delete the unused `framer-motion` dependency.
