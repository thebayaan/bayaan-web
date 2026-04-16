# Brief 07 — Motion, transitions, loading states

**Target:** https://quran.com/1, https://quran.com/2/255, https://quran.com/settings
**Date:** 2026-04-16

## 1. What the target does

Quran.com runs an **explicit four-tier duration token system** declared as CSS vars on `:root`:

- `--transition-fast: 0.16s`, `--transition-moderate: 0.2s`, `--transition-regular: 0.4s`, `--transition-slow: 0.6s`.

Two curves only: `cubic-bezier(.4, 0, .2, 1)` (Material "standard") for overlays / modal / popover, and `cubic-bezier(.215, .61, .355, 1)` (easeOutCubic) for incidental moves. Everywhere else uses bare `ease`, `ease-in-out`, or `linear`.

**Surfaces observed:**

- **Audio player bar** (`AudioPlayer_container`): fixed-bottom, `block-size: 3.5rem` (3rem mobile), `transition: var(--transition-regular)` on `transform` + `will-change: transform`. Hides by translating off-screen; `.containerHidden` uses `display:none`. No spring, no bounce.
- **Word sync highlight**: `PlainVerseTextWord_highlighted` swaps `color` to `--color-success-medium` (#2ca4ab teal); ayah row uses `VerseText_highlighted` tinted via `--color-background-alternative-faded`. Tajweed mode uses `text-shadow` instead of fill. No fade on the highlight swap — instant color flip to stay tight to the audio timestamp.
- **Scroll coupling**: `scroll-behavior-y: contain` on the reader; word-to-word scroll is programmatic (smooth), not CSS-only.
- **Settings drawer** (`Drawer_right`): slides `inset-inline-end` from `-24rem` → `0`; open state switches `transition-timing-function: ease-out`; a `.noTransition` escape hatch kills motion for immediate jumps.
- **Popover menu / modal**: `animation-duration: .35s` with `cubic-bezier(.4,0,.2,1)`, paired slide+fade keyframes per side (`slideUpAndFade` translateY 2px→0 + opacity 0→1, mirrored for down/left/right).
- **Skeleton loader**: `@keyframes Skeleton_loading` pulses opacity 1→.4→1 at `1.5s ease-in-out .5s infinite`. Spinner: `1.2s linear infinite` opacity pulse.
- **Tooltip / onboarding popover**: reuses popover timing (.35s / standard bezier); no lag-in delay.
- **Stagger tokens** for mobile nav chrome: `--mobile-stagger-delay-navbar: 0ms`, `-content: 40ms`, `-context-menu: 20ms` — cascading entrance across groups.

## 2. Screenshots / selector evidence

- `07-motion-home-viewport.png`, `07-motion-surah1-viewport.png`, `07-motion-ayah255.png`, `07-motion-settings-viewport.png`, `07-motion-reciters-viewport.png` in `screenshots/quran-com/`.
- CSS tokens: `/_next/static/css/fd757b78ecd4e5e3.css` (transition-fast/moderate/regular/slow, AudioPlayer, Drawer, Skeleton, PopoverMenu keyframes), `5d63b12c361f8567.css` (VerseText_highlighted, GlyphWord_tajweedTextHighlighted), `cfe984de537e3ea2.css` (PlainVerseTextWord_highlighted).
- **Bayaan refs:** `package.json` declares `framer-motion ^12.38.0` but **zero imports** in `src/` (no `from "framer-motion"`, no `AnimatePresence`, no `motion.*`). Motion today is Tailwind `transition-colors` only in `src/components/player/bottom-player-bar.tsx:118`, `src/components/quran/quran-word.tsx:16`, `src/components/player/full-player-view.tsx:119`, plus Radix built-ins inside `src/components/ui/{sheet,dialog,scroll-area,slider}.tsx`. No skeleton component, no shared duration tokens, no highlighted-word/ayah states in `quran-word.tsx` / `mushaf-view.tsx`.

## 3. Transferable patterns → Bayaan

- `[tokens]` Add four CSS vars in `src/app/globals.css`: `--motion-fast: 160ms`, `--motion-moderate: 200ms`, `--motion-regular: 400ms`, `--motion-slow: 600ms`, plus `--ease-standard: cubic-bezier(.4,0,.2,1)`. Mirror in `tailwind.config` duration/easing extend so Tailwind classes and framer-motion share them.
- `[listening]` `bottom-player-bar.tsx`: animate show/hide with `transition: transform var(--motion-regular) var(--ease-standard)` + `will-change: transform` — translate from `translateY(100%)` off-screen, not `display:none`.
- `[listening]` `quran-word.tsx`: on active-word state, flip `color` to an accent token **with no transition** (tight audio sync); wrap the ayah in `VerseText_highlighted`-style `bg-accent/10` that fades at `var(--motion-fast) ease` as focus moves to the next verse. Scroll the active word into view with programmatic `scrollIntoView({ behavior: 'smooth', block: 'center' })`, not CSS scroll-snap.
- `[reading]` Page-to-page / ayah-to-ayah: keep native browser scroll for long lists; use framer-motion `AnimatePresence` only on the `mushaf-view` spread swap (fade 160ms). No layout slide between surahs — it fights RTL readers.
- `[listening]` Settings drawer (`ui/sheet.tsx`): standardise on `var(--motion-regular)` open with `ease-standard`; expose a `noTransition` prop for reduced-motion / instant snaps.
- `[loading]` Ship a `Skeleton` primitive: opacity pulse 1→.4→1 at `1.5s ease-in-out` infinite; use on surah list, player queue, and reciter grid where spinners live today.
- `[listening]` `full-player-view.tsx` open: slide-up + fade via framer-motion `motion.div` at `.35s` standard bezier — matches Quran.com's Modal timing and feels native on mobile.

## 4. Do NOT copy

- Toastify's bounce / flip / zoom keyframes — excessive for prayer context; pick one slide variant.
- `5000s` Chrome autofill transition hack (`f92d1be2dc4b00db.css`) — unrelated artefact, not motion design.
- Quran.com's `VoiceSearch` pulse-scale keyframe — no voice search surface in scope.
- Onboarding coach-mark stagger system — premature; revisit post-launch.
- `scroll-behavior-y: contain !important` blanket — scoped to their reader, breaks Radix popovers if applied globally.

## 5. One-line verdict

Publish four motion tokens (160 / 200 / 400 / 600ms + Material standard bezier), wire them to Tailwind and framer-motion, then spend the animation budget on player slide-in, word highlight color flip, and a skeleton pulse — skip page transitions entirely.
