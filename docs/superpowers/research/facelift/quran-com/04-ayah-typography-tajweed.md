# Brief 04 — Ayah page: typography, layout, tajweed

**Target:** https://quran.com/2/255, https://quran.com/1
**Date:** 2026-04-16

## 1. What the target does

Quran.com renders Arabic with the **QCF v2 glyph-based font family** — per-page WOFF2 files named `p{1..604}-v2` loaded from `/fonts/quran/hafs/v2/woff2/p{N}.woff2`. Each word is a Private Use Area glyph, not Unicode; `UthmanicHafs` (KFGQPC HAFS Uthmanic Script, `UthmanicHafs1Ver18.woff2`) is the fallback until the page-specific font loads. Tajweed uses a parallel `VerseText_tajweed_v4-font-size-N` track where coloured glyphs are baked into the page fonts themselves — the text is set to `color:transparent; text-shadow:0 0 var(--color-success-medium)` and the font paints every rule hue directly.

The DOM is `.VerseText_verseTextContainer__l2hfY` (flex column, `direction:rtl`, `text-align:center`, `gap:var(--spacing-medium)`) → `.VerseText_verseText__2VPlA.VerseText_verseTextWrap__Rb0hr` (inline flex, `flex-wrap:wrap`, `line-height:var(--line-height)`) → one `.QuranWord_container__cdVm_` per word (`display:inline-block; white-space:nowrap`) with `data-word-location="2:255:1"` → `<span class="GlyphWord_styledWord__GfRAO" style="font-family: p42-v2;">ﲓ</span>`. Word gap is `var(--spacing-xxsmall)` (`additionalWordGap`) or `var(--spacing-small)` around stop-signs (`additionalStopSignGap`). The verse-end circle is **not** a separate element — it is the last glyph in the word sequence (the QCF font draws the ornate end-of-ayah medallion containing the verse number in-font).

Font-size ramp (code_v2 at desktop min-width, extracted from `css-5d63b12c361f8567.css`):

| scale           | --font-size | --line-height (mobile vh) |
| --------------- | ----------- | ------------------------- |
| 1               | 3.8vw       | 6.1vh                     |
| 2               | 4.55vw      | 6.1vh                     |
| 3               | 5.3vw       | 6.1vh                     |
| **4 (default)** | **6.05vw**  | **6.1vh**                 |
| 5               | 7.33vw      | 6.1vh                     |
| 6               | 8.61vw      | 9.28vh                    |
| 10              | 13.72vw     | 22vh                      |

Translation pairs **stacked below** Arabic (`.TranslationViewCell_arabicVerseContainer__pHrjC` → `.TranslationViewCell_verseTranslationsContainer__CKJms`). Translation body uses `TranslationText_text__E_qTb { line-height:1.5; letter-spacing:0 }` with a ten-step ramp `0.85rem → 3rem` (default ~`1.05rem`). Per-word hover highlight swaps colour to `var(--color-success-medium)`. A popover + tooltip wraps every word (`Popover_trigger__4xWHn` + `Tooltip_trigger__dGNcT`) exposing word-by-word translation, transliteration, and audio.

**Tajweed rule → colour** (from `.TajweedBar_{light|dark|sepia}-{rule}__hash`, `css-b20a30dd6a13bfba.css`):

| Rule                             | light     | dark      | sepia     |
| -------------------------------- | --------- | --------- | --------- |
| edgham (idgham)                  | `#a5a5a5` | `#999999` | `#ababab` |
| mad-2 (madd 2-harakah)           | `#ce9e00` | `#ffc1e0` | `#c09725` |
| mad-2-4-6 (madd permissible)     | `#ff7b00` | `#ff8e3b` | `#e67b00` |
| mad-4-5 (madd muttasil/munfasil) | `#f40000` | `#ff5e8e` | `#ff0000` |
| mad-6 (madd lazim)               | `#b50000` | `#e30000` | `#b7001c` |
| ekhfa (ikhfa)                    | `#09b000` | `#26b55d` | `#09b000` |
| qalqala                          | `#2fadff` | `#00deff` | `#00b4e0` |
| tafkhim                          | `#3f48e6` | `#3c84d5` | `#134fe1` |

Eight rules, three theme palettes. Ghunnah is folded into idgham/ikhfa (not a standalone swatch).

## 2. Screenshots / selector evidence

- `screenshots/quran-com/04-ayat-al-kursi-desktop.png` — verse card: centered h1, stacked translation, action row.
- `screenshots/quran-com/04-ayat-al-kursi-viewport.png` — viewport crop showing word-spacing and ayah-end medallion glyph.
- `screenshots/quran-com/04-ayat-al-kursi-screenshot.png` — updated full-page with reading/translation toggle chrome.
- `screenshots/quran-com/04-fatihah-screenshot.png` — Surah 1, smaller verses, same verseTextContainer pattern.
- `screenshots/quran-com/04-reading-mushaf.png` — reading-mode mushaf justification (space-between lines).
- `screenshots/quran-com/04-translation-paired.png` — Dr. Khattab translation stacked, 1.5 line-height, reference link trailing.

Bayaan refs: `src/components/quran/verse-text.tsx:22-31` (`flex flex-wrap leading-loose`, `fontSize="1.8rem"` default), `src/components/quran/quran-word.tsx:14-26` (`code_v2` → `qpc_uthmani_hafs` fallback, `hover:text-blue-400/80`), `src/components/quran/reading-verse.tsx:22-47` (stacked translation, `text-muted-foreground text-sm leading-relaxed`), `src/components/quran/mushaf-page.tsx:34-49` (line-based layout, `justify-between`), `src/components/quran/surah-header.tsx:13-23` (bordered glyph pill + hardcoded bismillah), `src/hooks/use-qcf-font.ts:4` (QCF CDN `static.qurancdn.com/fonts/quran/hafs/v2/woff2`), `src/hooks/use-qcf-font.ts:26-27` (same `p{N}-v2` naming), `src/data/reading-themes.ts:3-151` (12 palettes, no per-word tajweed colours defined).

## 3. Transferable patterns → Bayaan

- `[reading]` Adopt QC's **verse-end-in-glyph** approach: the QCF v2 font already draws the ayah medallion as the final word glyph. `quran-word.tsx:14` already renders whatever `code_v2` contains — verify the verses API returns the end marker as a trailing word so no separate circle component is needed.
- `[reading]` Replace Bayaan's `leading-loose` with the CSS-variable `--line-height` pattern (`verse-text.tsx:26`). At font-size 4 QC uses `line-height:6.1vh` (≈ `1.7`) not Tailwind's `2`. Over-leading hurts mushaf feel — drop Bayaan to `line-height: 1.7` or expose a `--line-height` var per scale.
- `[reading]` Wire `word-spacing:4px; margin-inline-end:-5px; white-space:pre` (GlyphWord_wordSpacing) into `quran-word.tsx:14-26` so QCF ligatures don't get stretched by the parent flex gap; today `gap-x-1` (`verse-text.tsx:27`) forces an ink gap that doesn't belong in Mushaf mode.
- `[reading]` Land tajweed v4 support: add `colorBlindMode` flag + theme-aware swatches using the exact QC hex table above, render via an additional `code_v4` font variant. Extend `reading-themes.ts:1` with a `tajweed` sub-palette per theme so Cream/Dark Navy/Sepia get correct contrast.
- `[reading]` Attach a **hover + popover** per word mirroring `QuranWord_container__cdVm_` + `QuranWord_tooltipContent__eiKNZ`: on hover, colour swaps to brand accent (`hover:text-blue-400/80` at `quran-word.tsx:16` is close) and a tooltip shows translation + transliteration + audio play trigger. Use Radix Popover to match QC's `Popover_trigger__4xWHn`.
- `[reading]` Pair translation **stacked below** (QC confirmed), not side-by-side. Bayaan already does this in `reading-verse.tsx:34-46` — keep it. Tighten translation scale: `0.85rem → 3rem` ramp with `line-height:1.5`, `letter-spacing:0` beats Bayaan's `text-sm leading-relaxed`.
- `[shell]` Add a **Reading vs Translation** view toggle (URL param) so the same route serves mushaf-justified pages and verse cards — Bayaan's `mushaf-page.tsx` and `reading-verse.tsx` already model both; expose the switch.

## 4. Do NOT copy

- Don't replicate QC's **vh/vw viewport-unit font-size ramp** — it breaks on short browser windows and in embedded contexts (see the `--line-height:22vh` extreme). Use `rem` + `clamp()` instead; Bayaan's `${fontSize}rem` (`reading-view.tsx:56`) is the right instinct.
- Don't ship QC's translation scale 10 (`3rem`/`4rem`) — it's a power-user escape hatch that shouldn't be default and is missing a real line-height on some steps (blank `--line-height: ;`).
- Don't copy the `color:transparent; text-shadow:0 0 var(--color)` tajweed hack (`GlyphWord_tajweedTextHighlighted`). It breaks selection/copy and fights dark-theme contrast. Prefer coloured SVG glyph runs or per-letter `<span class="tajweed-{rule}">`.
- Don't inline every word as its own `<div role="button">` with nested Popover + Tooltip wrappers as QC does — that's 5 layers of DOM per word, ~200KB of hydration on Ayat al-Kursi alone. Keep Bayaan's single `<span>` in `quran-word.tsx:14` and lazy-mount the popover on first hover.
- Don't fold the ayah number into the font without a DOM escape — expose `aria-label="verse 255"` on the final glyph so screen readers and search don't see Private Use Area codepoints.

## 5. One-line verdict

Keep Bayaan's per-page QCF v2 loader (already identical to QC); adopt QC's stacked-translation + word-popover + tajweed-v4 colour map; reject its viewport-unit ramp and transparent-text tajweed hack.
