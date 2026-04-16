# Brief 10 — Mobile / responsive behavior

**Target:** https://quran.com/1 (captured at 1440, 1024, 768, 430, 375, 812 landscape)
**Date:** 2026-04-16

## 1. What the target does

Breakpoints in compiled CSS: `max:374 / 424 / 480 / 767`, `min:768 / 1024 / 1280`, plus landscape override `min:768 and orientation:landscape and max-height:500 and pointer:coarse` that switches Arabic glyphs to `vmin` units.

At `/1`: 1440/1024 show full chrome (brand + search + globe + hamburger + Sign-in, inline verse actions). 768 drops Sign-in text, collapses actions into `...`. 430 hides the Page/Juz/Hizb meta row. 375 shows only hamburger + globe + magnifier; Tafsirs/Lessons/Reflections chips horizontal-scroll rather than wrap. 812 landscape re-expands meta + actions.

Patterns: **scroll-away header** via `.Navbar_container__dbR3C {position:fixed;transition:transform}` + `.Navbar_hiddenNav__l17mi {transform:translate3d(0,calc(-1*var(--navbar-container-height)),0)}`. **Settings as full-screen modal** on mobile (captured): segmented Arabic/Translation/Word-By-Word tabs, preview, Uthmani/IndoPak/Tajweed pills, font stepper, sticky Reset/Done footer — though CSS exposes a `.ContentModal_isBottomSheetOnMobile__7ZUkF` variant QC chose not to apply. **Touch targets** ~40px per ayah icon; secondary chip row is `overflow-x` scroll. **No swipe-to-next-ayah** — vertical scroll only; Mushaf uses arrow buttons. **Search keyboard:** overlay input auto-focuses; no `visualViewport` handling, so keyboard can overlap results.

## 2. Screenshots / selector evidence

- `screenshots/quran-com/10-surah-1440.png`, `10-surah-1024.png`, `10-surah-768.png`, `10-surah-430.png`, `10-surah-375.png` — breakpoint progression.
- `screenshots/quran-com/10-surah-375-settings.png` — mobile settings full-screen modal, sticky Reset/Done.
- `screenshots/quran-com/10-surah-812-landscape.png` — landscape re-expands chrome.
- Selectors: `.Navbar_container__dbR3C`, `.Navbar_hiddenNav__l17mi`, `.ContentModal_fullScreen__DMWbH`, `.ContentModal_isBottomSheetOnMobile__7ZUkF`, `.GlyphWord_fallback_qpc_uthmani_hafs-font-size-*` (landscape `vmin`).

Bayaan refs: `src/components/layout/app-shell.tsx:7-17` (binary `md:hidden` / `md:block` swap); `src/components/layout/mobile-tab-bar.tsx:20`; `src/components/layout/sidebar.tsx:27` (`hidden w-16 … md:flex lg:w-60`); `src/components/quran/reading-view.tsx:41` (`max-w-3xl px-6 py-8` — 24px sides even at 375); `src/components/quran/mushaf-view.tsx:43-50` (`<input type="number">` pops numeric keyboard over page); `tailwind.config.ts:3-15` (default Tailwind breakpoints only, no 375/425 gate).

## 3. Transferable patterns → Bayaan

- `[shell]` Adopt scroll-away header on mobile (`translate3d` down on scroll-down, restore on scroll-up) for future surah/progress chrome — ~56px vertical back on dense ayah lists.
- `[reading]` Build Settings as a mobile bottom-sheet (QC's `isBottomSheetOnMobile`, not their full-screen fallback) with drag-dismiss; extract `src/app/(app)/settings/page.tsx` into a `<SettingsSheet>` so scroll position survives.
- `[reading]` Make per-ayah secondary chip row `overflow-x-auto` + `snap-x` instead of wrapping — mirrors QC 375.
- `[reading]` Add `@media (orientation:landscape) and (max-height:500px)` rule so `reading-verse.tsx` switches Arabic `fontSize` from `rem` to a clamped `vmin`.
- `[shell]` `mushaf-view.tsx:43-50` swap `<input type="number">` for `inputMode="numeric"` inside a page-jump sheet, or a swipable page strip — numeric keyboard currently obscures the page being edited.
- `[shell]` Add sub-`md` tier: drop `reading-view.tsx:41` `px-6`→`px-4` under 425px; extend Tailwind with `xs:425`.

## 4. Do NOT copy

- Don't ship QC's settings-as-full-screen-modal on mobile — use the bottom-sheet variant their own CSS supports.
- Don't silently omit swipe-to-next — either implement horizontal swipe between pages/surahs or document the decision; users expect it.
- Skip QC's 10-step `vmin` glyph scale verbatim — over-amplifies on tall-aspect landscape tablets; clamp it.
- Don't import QC's 6-breakpoint stack (374/424/480/767/1024/1279); Tailwind's defaults + one `xs:425` is enough.

## 5. One-line verdict

Borrow QC's scroll-away header, horizontal-scroll chip row, and `isBottomSheetOnMobile` settings surface; reject their full-screen-modal-on-mobile fallback and add a genuine sub-425 tier + landscape-short-phone glyph rule.
