# Brief 08 — Color system, serifs, dark mode

**Target:** https://quran.com (bundle `/_next/static/css/fd757b78ecd4e5e3.css`)
**Date:** 2026-04-16

## 1. What the target does

Quran.com ships three modes — `light`, `dark`, `sepia` — composed via `[data-theme=…]` attribute overrides on `<html>`, with `@media(prefers-color-scheme:…)` as the fallback before JS hydrates. Every semantic token is a CSS custom property; components read `var(--color-…)` and never hardcode hex. A neutral `--shade-0..9` scale (`#f8f9fa → #212529`) underlies all three modes; each mode rebinds semantic tokens onto that scale plus mode-specific warm/cool tints. `body` sets `background:var(--color-background-default); color:var(--color-text-default); font-family:Figtree,Helvetica Neue,Helvetica,Arial` — mode swap is pure CSS, no re-render.

Typography is two-track: Latin body uses **Figtree** (variable 100–900, local fallback `Open Sans`), display/calligraphic accents use **PlayfairDisplay** (serif). Arabic has two families — `Kitab` for translations/headings in Arabic UI, and four Quran-script fonts (`UthmanicHafs` = KFGQPC Hafs Ver18, `IndoPak` Nastaleeq, plus per-page QCF fonts `p1-v2 … p604-v2` lazy-loaded from `static.qurancdn.com/fonts/quran/hafs/v2/woff2`). Surah-name glyphs are a dedicated `surahnames` icon font. No serif Arabic — they use a modern naskh (`Kitab`) for prose and an Uthmanic script for mushaf. Latin pairing is sans (Figtree) + serif display (Playfair) — the "mushaf parchment" feel is delivered entirely through palette (sepia `#f8ebd5` bg + `#72603f` accent), not through a serif body face.

| Token                                     | Light                                    | Dark              | Sepia                             |
| ----------------------------------------- | ---------------------------------------- | ----------------- | --------------------------------- |
| `--color-background-default`              | `#fff`                                   | `#1f2125`         | `#f8ebd5`                         |
| `--color-background-elevated`             | `#fff`                                   | `#1f2125`         | `#fff7ea`                         |
| `--color-background-alternative-faint`    | `#f4f5f6`                                | `#343a40`         | `#f0e2cc`                         |
| `--color-background-alternative-deep`     | `shade-6 #868e96`                        | `shade-5 #adb5bd` | `#ccb996`                         |
| `--color-text-default`                    | `#272727`                                | `#e7e9ea`         | `#010101`                         |
| `--color-text-faded`                      | `#666`                                   | `#777`            | `#666`                            |
| `--color-text-link`                       | `#2ca4ab`                                | `#2ca4ab`         | `#2ca4ab` (but `--new`=`#72603f`) |
| `--color-borders-hairline`                | `#ebeef0`                                | `#464b50`         | `#dbccb3`                         |
| `--color-separators`                      | `#f8f9fa`                                | `#1e2225`         | `#f8ebd5`                         |
| `--color-highlight`                       | `#79ffe1`                                | `#2ca4ab`         | `#50e3c2`                         |
| `--color-blue-buttons-and-icons` (accent) | `#2ca4ab`                                | `#2ca4ab`         | `#72603f` (warm!)                 |
| `--color-calligraphy`                     | `#e2e7eb`                                | `#060606`         | `#ccb996`                         |
| `--color-background-backdrop`             | `rgba(0,0,0,.6)`                         | `rgba(0,0,0,.8)`  | `rgba(0,0,0,.25)`                 |
| `font-palette`                            | `--Light`                                | `--Dark`          | `--Sepia`                         |
| body font                                 | `Figtree,Helvetica Neue,Helvetica,Arial` | same              | same                              |
| display serif                             | `PlayfairDisplay`                        | same              | same                              |
| Arabic prose                              | `Kitab,UthmanicHafs,Figtree`             | same              | same                              |
| Arabic mushaf                             | `UthmanicHafs` + per-page `pN-v2`        | same              | same                              |

Key observations: (1) Sepia rebinds the accent — teal `#2ca4ab` becomes warm brown `#72603f` via `--color-text-link-new` / `--color-blue-buttons-and-icons` — so "mushaf mode" isn't just a bg swap, the chromatic accent flips cool→warm. (2) Dark `#1f2125` background + `#e7e9ea` body text = ~14.5:1 contrast, well above WCAG AAA. (3) Shadows scale with mode: light uses `rgba(0,0,0,.12)`, dark uses `var(--shade-9) #212529` (near-black on near-black = effectively no shadow), sepia keeps `.12` alpha. (4) `font-palette:--Light/--Dark/--Sepia` hints a CSS color-font (COLRv1) Arabic glyph — colored Quran marks tuned per mode.

## 2. Screenshots / selector evidence

- `screenshots/quran-com/08-home-light-full.png` — full-page light: `#fff` bg, `#272727` text, teal `#2ca4ab` accents, `Figtree` sans throughout, `PlayfairDisplay` on the "Read the Quran" hero headline.
- `screenshots/quran-com/08-home-light.png` — viewport: nav hairline `#ebeef0`, CTA pill fill `#2ca4ab`.
- `screenshots/quran-com/08-reader-light.png` — reader chrome on `#fff`, separators `#f8f9fa`, ayah number badge `#e9ecef`.
- `screenshots/quran-com/08-reader-fatihah-light.png` — Fatihah mushaf-style page: `UthmanicHafs` / per-page QCF, calligraphy color `#e2e7eb` behind glyph.
- `screenshots/quran-com/08-reader-ayatulkursi-light.png` — 2:255 close-up showing Arabic size scale + translation in Figtree.
- `screenshots/quran-com/08-reader-dark.png` — dark reader: `#1f2125` bg, `#e7e9ea` Arabic, teal accent persists, hairline `#464b50`.

Bayaan refs: `src/app/globals.css:41-73` light-mode OKLCH-only palette (no hex), `src/app/globals.css:75-105` dark mode, `src/app/globals.css:108-124` `--text-alpha-*` ladder (good pattern, keep), `src/app/globals.css:126-130` single `UthmanicHafs` face only, `src/data/reading-themes.ts:3-76` six light reading themes (`default`/`parchment`/`white`/`sage`/`rose`/`cool`) and `:78-151` six dark themes — these are reader-only and don't drive app chrome, `src/hooks/use-qcf-font.ts:4,26-29` per-page QCF `p{N}-v2` from `static.qurancdn.com` (same CDN/path as QC), `tailwind.config.ts:4,8-11` `darkMode:"class"` with Manrope-only family. No Playfair/Kitab faces loaded, no `[data-theme]` attribute wiring, no sepia mode, no `font-palette`.

## 3. Transferable patterns → Bayaan

- `[shell]` Rename `.dark` → `[data-theme="dark"]` in `globals.css:75` and add a `[data-theme="sepia"]` block; store choice on `<html>` via `theme-provider.tsx` so the mode survives SSR + the `@media(prefers-color-scheme)` fallback works before hydration. QC pattern — one attribute, three blocks, zero runtime cost.
- `[shell]` Promote the `ReadingTheme` concept out of reader-only into app-wide semantic tokens (`--background`, `--foreground`, `--card`, etc. rebind per theme). Today `reading-themes.ts` only paints the reading pane; QC proves the whole chrome can ride the same token layer.
- `[shell]` Adopt QC's neutral `--shade-0..9` scale (`#f8f9fa … #212529`) as a Bayaan primitive under the OKLCH layer — lets `sage`/`rose`/`indigo` themes share one scale instead of each theme inventing its own greys in `reading-themes.ts:13,49,69,121,132`.
- `[shell]` Swap chromatic accent per mode, don't just darken. QC's sepia flips teal→warm brown `#72603f`; Bayaan's current dark mode keeps the same OKLCH accent — adding a `parchment` app theme that warms the accent will feel mushaf-correct instead of "light mode, beige."
- `[reading]` Load **Kitab** (woff2, 400+700) alongside `UthmanicHafs` and a Latin serif display face (Playfair or similar) via `next/font/local`. Current `globals.css:126-130` has only UthmanicHafs — Arabic translations and surah headings fall back to Manrope sans, which is wrong for tafsir/translation prose. Pair: Manrope (body) + Playfair/Fraunces (display) + Kitab (Arabic body) + UthmanicHafs/QCF (mushaf).
- `[reading]` Keep `use-qcf-font.ts` — it already mirrors QC's CDN + per-page strategy exactly. Only gap: no `font-palette` hook for colored tajweed marks; add a `--font-palette` token per mode if Bayaan ever ships tajweed colors.
- `[shell]` Add an alpha ladder for surfaces (`--bg-alpha-*`) mirroring the existing `--text-alpha-*` (`globals.css:108-124`) so overlays and backdrops scale with mode like QC's `--color-background-backdrop` `.6 / .8 / .25`.

## 4. Do NOT copy

- Don't inherit QC's teal `#2ca4ab` as Bayaan's accent — it's a denominational marker on their brand. Keep Bayaan's current hue and only borrow the warm-flip-in-sepia mechanic.
- Skip QC's `--color-text-faded:#666` in sepia — `#666` on `#f8ebd5` is 4.7:1, barely AA; Bayaan's sepia should darken faded text to ~`#5a3a28` (already present in `reading-themes.ts:24` `parchment.textSecondary`). QC under-contrasts here.
- Don't adopt `PlayfairDisplay` wholesale — it's high-contrast display-only; using it for body (as some QC cards do) hurts long-form readability. Pick a serif with a text-grade (Fraunces, Source Serif) if Bayaan wants serif body.
- Avoid QC's `--color-highlight:#79ffe1` (electric mint) — it reads as "selection stub" from an older Vercel template and clashes with reverent palette. Bayaan's selection should use `accent` at 20% alpha.
- Don't copy QC's shadow collapse in dark mode (`--shade-9` on `--shade-9` = invisible). Keep a subtle inner-glow or 1px border instead so elevation survives dark mode — Bayaan's current OKLCH `--border:oklch(0.25 0.02 310)` already does this.

## 5. One-line verdict

Mirror QC's three-mode `[data-theme]` + shade-scale + per-mode accent-flip architecture; keep Bayaan's OKLCH palette and load Kitab + a text-grade serif so translations and headings stop falling back to sans.
