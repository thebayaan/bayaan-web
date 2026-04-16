# Bayaan Facelift — Synthesis

**Date:** 2026-04-16
**Spec:** `../../specs/2026-04-16-facelift-design.md`
**Plan:** `../../plans/2026-04-16-facelift-analysis-and-paper-design.md`
**Findings:** `./deezer/` (10), `./quran-com/` (10)

## 1. Direction statement

Bayaan's facelift is **hybrid-contemporary devotional**: Quran.com's reading discipline (per-page QCF glyph fonts, stacked-translation layout, `[data-theme]` token architecture, three modes) drives the reading domain; Deezer's listening ergonomics (left-hero reciter pages, cloud-synced queue with dual-insert semantics, pulse-on-heart-tap, below-art action row) drive the listening domain. Both domains share one token layer, one motion ladder, one empty-state primitive, and one shell. The product reads as a Quran app with a real audio player built in, not two products bolted together. Reverence wins any tie against flashiness.

## 2. Tokens

### Palette architecture

Move from `.dark` class-toggle to **`[data-theme="light|dark|sepia"]` attribute on `<html>`**. Every semantic token reads from CSS custom properties. Existing OKLCH values stay as the source of truth; hex equivalents get emitted alongside for CSS-var compatibility. The sepia mode **flips the chromatic accent from cool to warm** (same mechanic as Quran.com `#2ca4ab → #72603f`) — this is what makes "parchment mode" feel mushaf-correct instead of "light mode, beige."

Three surface tiers replace the flat `background`/`card` shadcn overloads:

| Token                                       | Purpose                         | Light (proposed)                  | Dark (proposed)             | Sepia (proposed)                  |
| ------------------------------------------- | ------------------------------- | --------------------------------- | --------------------------- | --------------------------------- |
| `--surface`                                 | page bg                         | current `--background` light      | current `--background` dark | warm parchment (`#f8ebd5` family) |
| `--surface-raised`                          | cards, panels, sheets           | step-up from surface              | step-up from surface        | `#fff7ea` family                  |
| `--surface-sunken`                          | input wells, code blocks        | step-down from surface            | step-down from surface      | `#f0e2cc` family                  |
| `--text-primary`                            | body                            | current `--foreground` light      | current `--foreground` dark | near-black warm                   |
| `--text-secondary`                          | meta, captions                  | muted                             | muted                       | warm grey, `>=`5:1 contrast       |
| `--accent-main`                             | primary CTA, active-state, link | `#a238ff` (Deezer purple)         | `#a238ff`                   | `#72603f` (warm brown flip)       |
| `--accent-strong`                           | pressed/hover                   | `#9333e8`                         | `#9333e8`                   | `#5a4a30`                         |
| `--accent-weak`                             | selection, hover-bg             | `#c17aff`                         | `#c17aff`                   | `#72603f` @ 20% alpha             |
| `--accent-light`                            | ambient, rails                  | `#d09aff`                         | `#d09aff`                   | `#72603f` @ 8% alpha              |
| `--border`                                  | hairline                        | near-surface                      | near-surface                | warm beige `#dbccb3`              |
| `--border-divider`                          | section separators              | near-background                   | near-background             | warm pale                         |
| `--success` / `--warning` / `--destructive` | intents                         | green / amber / red               | green / amber / red         | same                              |
| `--overlay`                                 | scrim                           | `rgba(0,0,0,.6)`                  | `rgba(0,0,0,.8)`            | `rgba(0,0,0,.25)`                 |

Keep the existing `--text-alpha-04…85` ladder (`globals.css:108-124`) — it's a strong pattern. Add a parallel `--bg-alpha-*` ladder for mode-aware overlays (matches QC's `--color-background-backdrop` .6/.8/.25 spread).

### Typography

Keep the current font stack — no new Latin or Arabic prose families added in this pass. **One targeted addition:** wire up the existing `surah_names.ttf` (already at `public/fonts/surah_names.ttf`, currently not wired) via `@font-face` and use it for surah-name glyphs to match the mobile app's `SurahNames` font role.

| Role               | Family                                                                          | Fallback           | Where                                                      |
| ------------------ | ------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------- |
| Latin body         | **Manrope** (already loaded)                                                    | system sans        | UI chrome, translation, general prose, hero H1s            |
| Arabic mushaf      | **UthmanicHafs + per-page `p{1..604}-v2`** (already wired in `use-qcf-font.ts`) | UthmanicHafs only  | reading-view, mushaf-view, verse-text, adhkar, headings    |
| Arabic surah-names | **SurahNames** (`public/fonts/surah_names.ttf` — on disk, needs `@font-face`)   | Amiri Quran, serif | surah index cards, surah picker, reciter tracklist, hero surah-name glyphs |

Paper mockups use **Amiri Quran** (Google Fonts) as a visual stand-in for `SurahNames` since the proprietary ligature font isn't installed on macOS. Implementation ships the real `SurahNames` font.

Trade-off acknowledged: Arabic translations and adhkar prose will continue falling back to Manrope (Latin) until a dedicated Arabic text face (e.g., Kitab) is added in a follow-up. This is a conscious deferral, not an oversight.

Type scale (unitless multipliers on `1rem = 16px`):

| Step | Size     | Line-height | Use              |
| ---- | -------- | ----------- | ---------------- |
| xs   | 0.75rem  | 1.4         | meta, timestamps |
| sm   | 0.875rem | 1.45        | captions         |
| base | 1rem     | 1.55        | body             |
| lg   | 1.125rem | 1.5         | lead             |
| xl   | 1.25rem  | 1.4         | section titles   |
| 2xl  | 1.5rem   | 1.3         | page titles      |
| 3xl  | 2rem     | 1.2         | hero             |
| 4xl  | 2.75rem  | 1.1         | landing hero     |

**Arabic line-height: `1.7` everywhere** (not Tailwind's `leading-loose` at 2, which over-airs Mushaf feel). The translation pair below uses `line-height: 1.5`, `letter-spacing: 0`, **NOT** `text-sm leading-relaxed`.

Arabic size scale stays in `rem` + `clamp()` — **reject QC's `vw/vh` viewport-unit ramp** (breaks on short windows, blank line-height bugs at extremes). Bayaan's `${fontSize}rem` instinct in `reading-view.tsx:56` is correct.

### Spacing, radius, elevation

Spacing scale: `0 / 2 / 4 / 6 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` (px, Tailwind defaults — keep).

Radius scale: `--radius-sm: 4px / --radius-md: 8px / --radius-lg: 12px / --radius-xl: 16px / --radius-pill: 9999px`. Cards standardize on `md`, sheets/drawers on `lg`, pills/chips on `pill`.

Elevation tokens (replace ad-hoc Tailwind shadows):

| Token           | Value                                                  |
| --------------- | ------------------------------------------------------ |
| `--elevation-0` | none                                                   |
| `--elevation-s` | `0 1px 20px rgba(31,31,31,.35)` (Deezer-style, softer) |
| `--elevation-m` | `0 6px 30px rgba(31,31,31,.35)`                        |
| `--elevation-l` | `0 12px 48px rgba(31,31,31,.4)` — full-player, modals  |

Dark mode: swap shadow RGB to `rgba(0,0,0,.5)` **and** add a 1px inner border via `box-shadow: inset 0 0 0 1px var(--border)` so elevation survives a near-black-on-near-black stack (Bayaan's existing `--border:oklch(0.25 0.02 310)` already hints this — keep it).

### Motion

Four duration tokens + one standard easing:

| Token               | Value                        | Use                                                          |
| ------------------- | ---------------------------- | ------------------------------------------------------------ |
| `--motion-fast`     | `160ms`                      | hover color/opacity swap, active-state, word-sync color flip |
| `--motion-moderate` | `200ms`                      | chip active, row highlight, popover enter                    |
| `--motion-regular`  | `400ms`                      | player bar show/hide, sheet/drawer open, card enter          |
| `--motion-slow`     | `600ms`                      | hero crossfade, mushaf page turn                             |
| `--ease-standard`   | `cubic-bezier(.4, 0, .2, 1)` | everything                                                   |

Secondary easing `ease-out` allowed for drawer-opens (matches QC pattern). Everything else uses `--ease-standard`. **No bespoke spring curves, no `overshoot`, no `bounce-scale` except one use-case (pulse on heart-tap, Deezer pattern: `scale 1→1.08→1 @ ~400ms`).**

Skeleton loading: `@keyframes skeleton-pulse { opacity 1→.4→1 }` at `1.5s ease-in-out infinite` (QC pattern). Reject shimmer gradients; reject Deezer's static placeholder illustrations — pulse is the middle ground that doesn't bloat and stays calm.

Word-sync highlight on playback is **instant color flip** (no fade) — keeps tight to audio timestamp. Ayah-level highlight fades at `--motion-fast`.

### Framer-motion

**Delete the dependency.** Both Deezer 07 and Quran.com 07 confirm: `package.json:29` declares `framer-motion ^12.38.0` but `src/components/` has **zero imports**. Motion today is Tailwind `transition-colors` + Radix built-ins, which is sufficient for the ladder above. Reintroducing it for Deezer-class motion would be bundle weight for no UX win. Only surfaces that benefit: `full-player-view` open slide-up and `mushaf-view` page crossfade — both achievable with CSS transitions + Radix primitives, no framer needed.

## 3. Per-domain moves

Table: each row = one surface in the Paper scope (spec §7). Cites the driving finding(s). All paths are repo-relative.

| Surface                                         | Current state                                                                                                                                                                    | Proposed change                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Citations                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Shell: Sidebar (desktop)**                    | 3-stage `md:w-16 → lg:w-60` (`sidebar.tsx:27`). Active state = text-alpha pill + filled glyph (`sidebar-nav-item.tsx:27-31`).                                                    | Keep almost as-is. Promote **Search** out of sidebar into a sticky top-bar pill at `lg:`. Add identity zone to sidebar footer (avatar + Clerk user menu + "Continue Reading" teaser card above it).                                                                                                                                                                                                                                                               | Deezer 02                              |
| **Shell: Mobile tab bar**                       | 5-item `fixed bottom-0 md:hidden` with `backdrop-blur-2xl` (`mobile-tab-bar.tsx:20`). Already stronger than Deezer-web.                                                          | Add `pb-[env(safe-area-inset-bottom)]` padding. Stack a sticky mini-player ABOVE the tab bar at `<md` (currently `BottomPlayerBar` is `hidden md:block` — swap to show mini-variant on mobile).                                                                                                                                                                                                                                                                   | Deezer 10, Quran.com 10                |
| **Shell: Bottom player bar (desktop)**          | `components/player/bottom-player-bar.tsx` — 3-section layout.                                                                                                                    | Keep layout. Add cloud-sync affordance (sync icon). Promote the **rate chip** (`full-player-view.tsx:117-122`) next to volume for one-tap access. Animate show/hide via `transition: transform var(--motion-regular)` translating from `translateY(100%)`, not `display:none`. Crossfade row-number → equalizer glyph on `--motion-fast` opacity.                                                                                                                 | Deezer 04, Deezer 07, Quran.com 07     |
| **Shell: Top-right user area**                  | Clerk `<UserButton>` already in sidebar footer.                                                                                                                                  | Add a **sticky top-bar pill** at `lg:` containing search + Clerk `<UserButton>` right-aligned; sidebar keeps identity footer. On mobile, Clerk avatar moves into the mobile tab bar's "profile" slot.                                                                                                                                                                                                                                                             | Deezer 02                              |
| **Reading: Surah index (`/quran`)**             | Renders `<MushafView />` directly — **no index surface exists**. `SurahListItem` is reciter-scoped.                                                                              | **New surface.** 3-column grid (`lg`), 2-col (`md`), 1-col (`<md`). Card = `{chapter#}`                                                                                                                                                                                                                                                                                                                                                                           | bold transliteration + English meaning | Arabic glyph + `{verses_count} ayahs`. Tabs: `Surah                                                                                                                                                                                                                                                         | Juz                     | Revelation Order`. Client-side search input above grid (filter over 114 rows in `surah-data.json`). Don't reuse `SurahListItem`. | Quran.com 01, Quran.com 03 |
| **Reading: Mushaf page view**                   | `components/quran/mushaf-view.tsx` — line-based layout, `justify-between`. No transition between pages. `<input type="number">` for page jump (pops numeric keyboard over page). | Keep layout. Wrap page swap in CSS opacity crossfade at `--motion-fast` (160ms, `--ease-standard`) — matches Quran.com's spread-fade without the framer-motion dep. Replace numeric input with `inputMode="numeric"` inside a bottom-sheet page-jump OR a swipable page strip. Add `env(safe-area-inset-bottom)` on mobile.                                                                                                                                                                                                                                              | Deezer 07, Quran.com 10                |
| **Reading: Reading view — verse + translation** | `reading-view.tsx` + `reading-verse.tsx`. Translation uses `text-sm leading-relaxed`. `gap-x-1` on word flex. `leading-loose` on Arabic.                                         | Arabic line-height → `1.7`. Word gap via `word-spacing:4px; margin-inline-end:-5px` on `<span>`, remove parent `gap-x-1` flex gap (prevents QCF ligature stretching). Translation → `line-height:1.5; letter-spacing:0` at base size.                                                                                                                                                                                                                             | Quran.com 04                           |
| **Reading: Ayah focus / detail**                | Per-verse actions inline (`reading-verse.tsx`) but reader chrome has no surah picker, view-mode toggle, or settings binding.                                                     | **Build the sticky reader sub-header**: left = surah dropdown, right = view-mode toggle (ReadingView ↔ MushafView) + settings gear. Gear opens a drawer that **finally binds `reading-settings-store`** (fontSize, translationIds, showTajweed, showWordByWord, showTransliteration — store built, UI missing). Split ayah action row: `🔖` = one-tap bookmark toggle (outline/fill), `✎` = open note sheet (separate).                                           | Quran.com 02, Quran.com 06             |
| **Reading: Word interaction**                   | `quran-word.tsx:14-26` — hover swaps color to `blue-400/80`. No popover.                                                                                                         | Lazy-mount Radix popover on first hover showing word-by-word translation + transliteration + audio-play trigger. Color swap stays on hover. Wrap final glyph with `aria-label="verse {n}"` for a11y.                                                                                                                                                                                                                                                              | Quran.com 04                           |
| **Reading: Tajweed**                            | Not implemented. `reading-themes.ts` has 12 palettes but no tajweed sub-palette.                                                                                                 | Add `code_v4` font variant + `colorBlindMode` flag. Extend `reading-themes.ts` with a `tajweed` sub-palette per theme. Use QC's **exact 8-rule hex map** (Quran.com 04 §1 table) for default `light/dark/sepia`. Reject QC's `color:transparent; text-shadow` hack — use colored SVG glyph runs or per-letter `<span class="tajweed-{rule}">`.                                                                                                                    | Quran.com 04                           |
| **Listening: Reciter index (`/reciter`)**       | Flat grid of `reciter-card.tsx` (no change needed — card grid is fine).                                                                                                          | Keep as-is. Add opacity reveal on image `onLoad` (`duration-[350ms]`). Keep `transition-transform group-hover:scale-105` at `--motion-fast`.                                                                                                                                                                                                                                                                                                                      | Deezer 01, Deezer 07                   |
| **Listening: Reciter detail**                   | `reciter/[slug]/page.tsx`. `reciter-header.tsx:36-47` has stacked meta + bio. Rewayat chips as filled pills. Play All floats in its own band.                                    | Left-hero layout: 220px circular artwork + title + `{name_arabic}` (in `SurahNames`/Amiri stand-in face, not Manrope) + single pipe-meta line `{surah_total} surahs · {total_duration}` (drop bio, drop rewayat, drop style — **decouple reciter identity from recitation variant**). **Action row BELOW artwork**: Play All + ghost heart/share/kebab. Below action row, a **Recitation bar**: small-caps "RECITATION" label + active variant pill (e.g. `Hafs · Murattal`) + alternate variant chips (e.g. `Warsh · Murattal`, `Hafs · Mujawwad`) — selecting a chip swaps the tracklist audio source. **No Popular / Similar reciters / About tabs** — we don't have data to back them. Tracklist density: separate component (not `surah-list-item.tsx` which is reciter-scoped) with index + transliteration + meaning + Arabic surah-name glyph + duration + heart + kebab; accent-color the active playing row.

**Data-model implication:** `Reciter` decouples from `rewayat` + `style`. A reciter has multiple `RecitationSet`s (e.g. `{reciter_id, rewayat: "Hafs", style: "Murattal", audio_base_url}`). Fixture + types updates needed. | Deezer 03                              |
| **Listening: Surah detail (listening mode)**    | `surah/[id]/page.tsx:44-54`. **No artwork.** Trim to single-line tracklist density.                                                                                              | Add 192px `SurahHeader` glyph on left of hero; title + inline meta right. Action row below. Single-line per-reciter tracklist density with inline Play/kebab.                                                                                                                                                                                                                                                                                                     | Deezer 03                              |
| **Listening: Full player view**                 | `full-player-view.tsx`. No open animation. Heart toggle has no feedback.                                                                                                         | Open via slide-up + fade at `--motion-regular` (CSS transition, no framer-motion). On heart-tap success, `@keyframes pulse` scale 1→1.08→1 at `--motion-regular`. Promote rate chip to bottom bar. Add lyrics/mic icon beside volume that routes to translation/tafsir mode (scrolling-translation layout).                                                                                                                                                       | Deezer 04, Deezer 07                   |
| **Listening: Queue panel**                      | `queue-panel.tsx:66` — only jumps. No history, no drag-reorder, no hover-remove, no clear-queue.                                                                                 | Add **dual insert semantics**: "Play next" (insert at `currentIndex+1`) vs "Add to queue" (append) via track context menus. Collapsible "History" section above "Now Playing". Hover-reveal delete icon + drag handle to reorder. **Expose "Clear queue" button in panel header** (Deezer hid theirs and got flamed for it). CSS `transition: transform .2s ease-out` on reorder — framer `Reorder` is overkill.                                                  | Deezer 04                              |
| **Supporting: Search results**                  | `search/page.tsx:1-163` — Fuse over reciters + surahs, flat merged list. `search-input.tsx:13-28` — no debounce, no dropdown, no recent.                                         | Group results as `Reciters                                                                                                                                                                                                                                                                                                                                                                                                                                        | Surahs                                 | Verses`. Add **verse reference parser** (`^\d+:\d+$`→ deep-link to`/quran/[surah]?verse=[n]`). On-focus dropdown with recents via `localStorage`. Debounce Fuse ~120ms with skeletons. Highlight matched token inline. Keep reciter+surah ranked above verse hits. Promote search to top-bar pill at `lg:`. | Deezer 05, Quran.com 05 |
| **Supporting: Collection hub**                  | Flat 4-card grid in `collection-hub.tsx:32`. Playlist detail is a stub. Favorites shows raw `Surah {id}` + truncated `reciter_id`.                                               | Collapse hub into **tabbed Library**: `Playlists / Favorites / Bookmarks / Notes` with persistent sort + search. Favorites row = reciter avatar + surah name + reciter name + duration + inline Play + kebab. Playlist detail: hero + Play/Shuffle + track list with kebab. Pin a **"Continue Reading" slot** at top of `/collection/bookmarks` (localStorage-backed).                                                                                            | Deezer 06, Quran.com 06                |
| **Supporting: Empty state example**             | Ad-hoc: `No X yet` copy in each collection route. Queue empty, search no-results, all bespoke.                                                                                   | Build one `<EmptyState icon title subtitle cta? />` primitive. Reuse across queue-empty, search-no-results, all collection zero-states, no-bookmarks-yet.                                                                                                                                                                                                                                                                                                         | Deezer 09, Quran.com 09                |
| **Supporting: Loading skeleton example**        | `animate-pulse` solid rects in `reading-view.tsx:26`. No shared `Skeleton` component.                                                                                            | Ship `<Skeleton />` primitive: opacity pulse 1→.4→1 at `1.5s ease-in-out infinite`. Use on surah list, queue, reciter grid. Keep existing `animate-pulse` rectangle shape — don't ship shimmer gradients.                                                                                                                                                                                                                                                         | Deezer 07, Quran.com 07                |

## 4. Component inventory delta

### New primitives needed

- `<EmptyState icon title subtitle cta? />` — four collection empty screens, queue-empty, search-no-results, invalid-surah/ayah error states
- `<Skeleton />` — opacity-pulse loader, variants for text-line / avatar / card
- `<ReaderSubHeader />` — sticky sub-header for surah routes with surah picker + view-mode toggle + settings gear
- `<ReadingSettingsSheet />` — drawer wired to `reading-settings-store`
- `<WordPopover />` — lazy-mounted Radix popover triggered by word hover (word translation + transliteration + audio)
- `<SurahIndexGrid />` — 3-col grid with `Surah | Juz | Revelation Order` tabs + search filter
- `<SurahIndexCard />` — grid card: index + transliteration + meaning + Arabic glyph + ayah count (distinct from `SurahListItem`, which stays reciter-scoped)
- `<ContinueReadingCard />` — localStorage-backed pinned slot (home + collection/bookmarks)
- `<TopSearchPill />` — sticky top-bar variant of search at `lg:` with focus dropdown
- `<BookmarkToggleIcon />` — one-tap outline/fill toggle for ayah action row
- `<SimilarReciters />` + `<PopularSurahs />` — rails for reciter detail page
- `<ReciterHeroLeft />` — left-hero layout block (artwork + meta + below-art action row) for reciter + surah pages
- `<QueueItemContextMenu />` — "Play next" / "Add to queue" / "Remove" Radix context menu
- `<Toast />` — non-blocking audio-failure + offline-banner (or install `sonner` / Radix Toast)

### Existing components reskinned

- `src/app/globals.css` — add three surface tiers, `[data-theme]` selectors, motion tokens, elevation tokens, full hex-sibling palette alongside OKLCH
- `src/components/theme-provider.tsx` — write `data-theme` attribute on `<html>` alongside `.dark` class (maintain class for Tailwind `dark:` variant compatibility)
- `tailwind.config.ts` — extend theme with duration/easing tokens matching CSS vars
- `src/app/layout.tsx` — no font changes in this pass (Manrope + UthmanicHafs + per-page QCF already loaded)
- `src/components/quran/verse-text.tsx` — Arabic line-height → 1.7, drop `gap-x-1` in favor of `word-spacing`
- `src/components/quran/quran-word.tsx` — add lazy-mount `<WordPopover>`; keep hover color swap
- `src/components/quran/reading-verse.tsx` — translation line-height → 1.5, letter-spacing 0, base size
- `src/components/quran/mushaf-view.tsx` — page crossfade, bottom-sheet page-jump
- `src/components/player/bottom-player-bar.tsx` — translate-show/hide, rate chip, cloud-sync icon
- `src/components/player/full-player-view.tsx` — slide-up-fade on open, pulse on heart-tap, lyrics/mic icon
- `src/components/player/queue-panel.tsx` — history section, drag-reorder, hover-remove, clear-queue, context menu
- `src/components/reciter-header.tsx` — left-hero layout, pipe-meta, below-art action row, rewayat as underlined tabs
- `src/components/reciter-card.tsx` — `onLoad` opacity reveal on image
- `src/components/surah-list-item.tsx` — inline duration, accent on active row, equalizer glyph crossfade
- `src/components/collection/collection-hub.tsx` — tabbed Library with sort + search
- `src/components/layout/sidebar.tsx` — identity footer zone, Continue Reading teaser
- `src/components/layout/mobile-tab-bar.tsx` — safe-area-inset-bottom, sticky mini-player above
- `src/app/(app)/quran/page.tsx` — renders `<SurahIndexGrid />` instead of `<MushafView />`
- `src/app/(app)/surah/[id]/page.tsx` — sticky `<ReaderSubHeader />` + artwork hero
- `src/app/(app)/search/page.tsx` — Verse parser, grouped results, debounce, dropdown
- `src/app/(app)/collection/playlists/[id]/page.tsx` — hero + Play/Shuffle + tracklist

### Components to add at app root

- `src/app/(app)/not-found.tsx` — uses `<EmptyState>` inside app shell
- `src/app/(app)/error.tsx` — uses `<EmptyState>` inside app shell
- `src/app/(app)/quran/[surah]/not-found.tsx` — specific "Surah {n} doesn't exist" copy

### Components to delete

- `framer-motion` dependency in `package.json` (unused, confirmed by Deezer 07 + Quran.com 07)

## 5. Explicit non-goals

Ideas the findings surfaced that we considered and rejected:

- **Reading plans** (Quran.com 06) — Bayaan is a Quran reader + reciter player, not a scheduling/calendar product. No `/reading-plans`, no `/reading-goal`, no "Quran in a Year." Bookmarks + notes + one "Continue Reading" slot is the surface area. Reason: feature scope creep that would require editorial/pipeline infrastructure Bayaan doesn't have.
- **Mood-based / editorial reciter suggestions** (Deezer 01) — no editorial pipeline, no ML recommendation backend. Reason: can't maintain faking it.
- **Topic pill taxonomy on search or home** (Quran.com 05) — QC's "Explore Topics" is editorial links, not a real taxonomy. Reason: same as above.
- **Fan counts / follower graphs on reciter pages** (Deezer 03) — no social signal to back it. Reason: fake metric.
- **Bulk-select checkboxes on tracklists** (Deezer 03) — no flow needs them yet. Reason: premature.
- **Sticky hero-to-compact transition on scroll** (Deezer 03 explicitly rejects) — Deezer doesn't do it and the app-shell is enough. Reason: complexity without payoff.
- **Animated page transitions between routes** (Deezer 07) — Deezer ships zero crossfades, app still feels snappy. Reason: bundle weight for no UX win.
- **Bespoke spring curves / `cubic-bezier` zoo / scale-on-press** — both sources converge on a tiny motion ladder. Reason: scale-on-press reads iOS-y, springs read flashy.
- **Shimmer-gradient skeleton loaders** (Deezer 07) — opacity pulse is calmer and cheaper. Reason: reverent tone.
- **Mascot illustrations on empty / error states** (Deezer 09) — off-brand for devotional. Reason: tone.
- **Command palette (`ctrl+K`)** (Quran.com 03) — Bayaan sidebar + search pill covers 95% of the value; a palette would collide. Reason: redundant.
- **Global top-bar on mobile / ribbon promo system** (Quran.com 02) — sidebar + mobile tab bar cover nav; no editorial ribbon pipeline. Reason: IA clutter.
- **QC's `color:transparent; text-shadow` tajweed hack** (Quran.com 04) — breaks text selection, fights dark theme. Reason: correctness.
- **QC's `vw/vh` viewport-unit font ramp** (Quran.com 04) — breaks on short windows. Reason: correctness.
- **Deezer's cookie wall / anti-bot hostility** (Deezer 09) — Bayaan guest reading is a first-class use case. Reason: tone.

## 6. Decisions (locked 2026-04-16)

Answers to the pre-Paper open questions, captured for downstream plans:

1. **Accent color.** Deezer's purple ladder `#a238ff / #9333e8 / #c17aff / #d09aff` for light + dark. Sepia flips to warm brown `#72603f` family (accent main `#72603f`, strong `#5a4a30`, weak/light as alpha). Devotional identity is carried by typography, layout, and reverence — not by the accent hue.
2. **Display serif.** Deferred. Keep Manrope as the sole Latin face in this pass; no Fraunces, no Playfair. Hero H1s and surah names use Manrope at display size + weight.
3. **Sepia as a third mode.** Ship in initial release, alongside light and dark.
4. **Mushaf page crossfade.** Ship — CSS opacity crossfade at `--motion-fast` (160ms, `--ease-standard`), matching Quran.com's spread fade. No framer-motion needed.
5. **Word popover on hover.** Ship `<WordPopover>` — Radix popover lazy-mounted on first hover, shows word translation + transliteration + audio-play trigger.
6. **Tajweed coloring.** Ship — Quran.com's exact 8-rule hex map (verbatim from Quran.com brief 04) across light/dark/sepia modes. Uses per-letter `<span class="tajweed-{rule}">`, not QC's `color:transparent; text-shadow` hack.
7. **Cloud-synced queue.** Deferred. Keep Zustand local persistence for this pass; server-authoritative sync is a backend-focused follow-up.
8. **Delete `framer-motion`.** Confirmed. Remove the dep; motion runs on Tailwind `transition-*` + Radix primitives + CSS `@keyframes` only.

Deferrals (Q2 and Q7) are conscious scope-cuts, not oversights — they move to the follow-up backlog.
