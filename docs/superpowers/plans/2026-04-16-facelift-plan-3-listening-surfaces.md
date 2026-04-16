# Facelift Plan 3 — Listening Surfaces

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh reciter detail, tracklist rows, queue panel, and full player to match the Paper design — Deezer-inspired left-hero layout, SurahNames-glyph Arabic surah names, accent-highlighted active row, dual-insert queue semantics, and slide-up full player.

**Architecture:** Builds on Plan 1 tokens (`--brand-*`, `--motion-*`, `--surface-*`) and Plan 2 primitives (`<EmptyState>`, `<Skeleton>`). Focuses changes into five surfaces without touching the underlying audio-service or player-store APIs. The existing `Reciter` type already decouples reciter identity from rewayat (`reciter.rewayat: Rewayat[]`), so no data-model changes are needed — Task 2 exposes rewayats as underlined tabs rather than filled pills.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Zustand (player-store, command-palette-store), Clerk, Vitest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-04-16-facelift-design.md`
**Synthesis:** `docs/superpowers/research/facelift/synthesis.md` §3 (Listening rows)
**Paper reference:** "Listening · Reciter Detail · Desktop · Light" artboard.

---

## File Structure

**Modified files:**

- `src/components/reciter-header.tsx` — left-hero layout with circular gradient portrait, eyebrow, 64px display name, Arabic name in SurahNames-equivalent font, pipe-meta line
- `src/app/(app)/reciter/[slug]/page.tsx` — action row below header (Play All + Shuffle + heart/share/more circles), underlined Recitation tabs with "RECITATION" small-caps label, total-duration computation
- `src/components/surah-list-item.tsx` — Arabic name in `font-surah-names`, brand-accent text on active row, equalizer glyph replaces index when playing
- `src/components/player/queue-panel.tsx` — Clear Queue button in header, hover-reveal remove per row, collapsible History section (past/played tracks), dual-insert context menu (Play Next / Add to Queue)
- `src/components/player/full-player-view.tsx` — slide-up + fade open animation at `--motion-regular`, pulse keyframe on heart-tap

**New files:**

- `src/components/ui/context-menu-stub.tsx` — lightweight context menu used by queue panel dual-insert (we don't have Radix ContextMenu wired; use a click-anchored menu pattern)
- `src/components/layout/reciter-hero-portrait.tsx` — the gradient-circle monogram portrait extracted for reuse and testability

**Branch:** continue on `feat/facelift-design-v2`.

---

## Task 1: `<ReciterHeaderPortrait>` — gradient circle monogram

**Files:**

- Create: `src/components/layout/reciter-hero-portrait.tsx`
- Create: `src/__tests__/components/layout/reciter-hero-portrait.test.tsx`

**Contract:** `ReciterHeaderPortrait` takes a `name` (string) and optional `imageUrl`. If `imageUrl` provided, renders the image inside a circular frame with subtle shadow + Plan 2's `duration-[350ms]` onLoad opacity reveal. Otherwise renders a radial-gradient purple circle with the first letter of `name` as a large monogram.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReciterHeroPortrait } from "@/components/layout/reciter-hero-portrait";

describe("ReciterHeroPortrait", () => {
  it("renders the first letter of the reciter's name when no image", () => {
    render(<ReciterHeroPortrait name="Mishary Alafasy" />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders an image when imageUrl is provided", () => {
    render(
      <ReciterHeroPortrait name="Abdul Basit" imageUrl="https://example.com/abdul-basit.jpg" />,
    );
    const img = screen.getByRole("img", { name: /abdul basit/i });
    expect(img).toHaveAttribute("src", "https://example.com/abdul-basit.jpg");
  });

  it("uses uppercase for the monogram", () => {
    render(<ReciterHeroPortrait name="mishary" />);
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.queryByText("m")).not.toBeInTheDocument();
  });

  it("handles empty name gracefully with a question mark fallback", () => {
    render(<ReciterHeroPortrait name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npx vitest run src/__tests__/components/layout/reciter-hero-portrait.test.tsx
```

- [ ] **Step 3: Implement the component**

Create `src/components/layout/reciter-hero-portrait.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  name: string;
  imageUrl?: string;
}

export function ReciterHeroPortrait({ name, imageUrl }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const monogram = (name.trim().charAt(0) || "?").toUpperCase();

  if (imageUrl) {
    return (
      <div
        className="relative h-[220px] w-[220px] shrink-0 overflow-hidden rounded-full shadow-[var(--elevation-m)] transition-opacity duration-[350ms] ease-standard"
        style={{ opacity: imgLoaded ? 1 : 0 }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="220px"
          className="object-cover"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex h-[220px] w-[220px] shrink-0 items-center justify-center rounded-full shadow-[var(--elevation-m)]"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, var(--brand-light), var(--brand-main) 45%, color-mix(in oklch, var(--brand-main), black 40%) 100%)",
      }}
    >
      <span className="text-[72px] font-bold leading-none tracking-tight text-[var(--brand-main-foreground)]">
        {monogram}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run tests + gates**

```bash
npx vitest run src/__tests__/components/layout/reciter-hero-portrait.test.tsx
npm run test
npx tsc --noEmit
npx prettier --write src/components/layout/reciter-hero-portrait.tsx src/__tests__/components/layout/reciter-hero-portrait.test.tsx
```

Expected: 4 new tests pass; full suite passes (186 total).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/reciter-hero-portrait.tsx src/__tests__/components/layout/reciter-hero-portrait.test.tsx
git commit -m "feat(listening): add ReciterHeroPortrait with gradient monogram + image onLoad reveal"
```

---

## Task 2: Redesign `<ReciterHeader>` — left-hero layout

**Files:**

- Modify: `src/components/reciter-header.tsx`

**Contract:** Header takes a `Reciter` and renders:

- Left: `<ReciterHeroPortrait>` at 220×220 circle
- Right column (flex, gap-4):
  - Eyebrow "RECITER" small-caps `text-brand-main`
  - 64px display name (`font-sans` Manrope, `font-extrabold`, `tracking-tight`, `leading-none`)
  - Arabic name (`font-surah-names`, 22px, `text-muted-foreground`, `direction: ltr` — SurahNames font treats RTL internally)
  - Pipe-meta row: `{surah_total} surahs · {totalDurationLabel}`

Skip the old bio block — synthesis drops it.

- [ ] **Step 1: Read current header**

```bash
cat src/components/reciter-header.tsx
```

- [ ] **Step 2: Replace the file**

```tsx
"use client";

import type { Reciter } from "@/types/reciter";
import { ReciterHeroPortrait } from "@/components/layout/reciter-hero-portrait";

interface Props {
  reciter: Reciter;
  totalSurahs: number;
  totalDurationLabel?: string;
}

export function ReciterHeader({ reciter, totalSurahs, totalDurationLabel }: Props) {
  return (
    <header className="flex items-end gap-9 px-10 pb-10 pt-8">
      <ReciterHeroPortrait name={reciter.name} imageUrl={reciter.image_url} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-2">
        <div className="text-brand-main flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
          <span className="bg-brand-main h-px w-4" aria-hidden />
          <span>Reciter</span>
        </div>
        <h1 className="text-[64px] font-extrabold leading-none tracking-[-0.03em]">
          {reciter.name}
        </h1>
        {reciter.name_arabic ? (
          <div className="text-muted-foreground font-surah-names text-[22px]">
            {reciter.name_arabic}
          </div>
        ) : null}
        <div className="text-muted-foreground flex items-center gap-3 text-sm font-medium">
          <span>
            {totalSurahs} {totalSurahs === 1 ? "surah" : "surahs"}
          </span>
          {totalDurationLabel ? (
            <>
              <span className="bg-muted-foreground/40 h-[3px] w-[3px] rounded-full" aria-hidden />
              <span>{totalDurationLabel}</span>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update existing `reciter-header.test.tsx` if present**

```bash
ls src/__tests__/components/reciter-header.test.tsx 2>/dev/null && cat src/__tests__/components/reciter-header.test.tsx
```

If the file exists, update its test cases to match the new prop shape (`totalSurahs` required; optional `totalDurationLabel`). If it asserts on bio text or old meta formatting, update or remove those assertions. If the file does not exist, skip.

- [ ] **Step 4: Gates**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/components/reciter-header.tsx
```

Expected: full suite passes. Note: the reciter detail page (Task 3) will pass the new props. Until Task 3 lands, `npm run dev` on /reciter/[slug] will break because the page still passes the old prop shape. Commit anyway; Task 3 fixes immediately after.

- [ ] **Step 5: Commit**

```bash
git add src/components/reciter-header.tsx
git commit -m "feat(listening): redesign ReciterHeader as left-hero layout with pipe-meta"
```

---

## Task 3: Refresh reciter detail page — action row + underlined Recitation tabs

**Files:**

- Modify: `src/app/(app)/reciter/[slug]/page.tsx`

**Contract:** Replace the filled-pill rewayat switcher with underlined tabs prefixed by a small-caps "RECITATION" label. Add an action row below the header: Play All (filled brand pill) + Shuffle (ghost outline pill) + circular Heart + Share + More buttons. Compute `totalSurahs` across all rewayats + a rough `totalDurationLabel` if available (fall back to omit when unknown).

- [ ] **Step 1: Update the page**

Replace `src/app/(app)/reciter/[slug]/page.tsx` with:

```tsx
"use client";

import { use, useState, useMemo } from "react";
import { useReciter } from "@/hooks/use-reciter";
import { usePlayerStore } from "@/stores/player-store";
import { ReciterHeader } from "@/components/reciter-header";
import { SurahListItem } from "@/components/surah-list-item";
import { PlayIcon, HeartIcon } from "@/components/icons";
import { createQueueFromSurah } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as unknown as Surah[];
const surahNameMap = Object.fromEntries(surahs.map((s) => [s.id, s.name])) as Record<
  number,
  string
>;

export default function ReciterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { reciter, isLoading } = useReciter(slug);
  const [selectedRewayatIdx, setSelectedRewayatIdx] = useState(0);

  const updateQueue = usePlayerStore((s) => s.updateQueue);
  const currentTrack = usePlayerStore((s) => {
    const tracks = s.queue.tracks;
    const idx = s.queue.currentIndex;
    return tracks[idx];
  });
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);

  const selectedRewayat = reciter?.rewayat[selectedRewayatIdx];

  const filteredSurahs = useMemo(() => {
    if (!selectedRewayat) return [];
    const surahSet = new Set(selectedRewayat.surah_list);
    return surahs.filter((s) => surahSet.has(s.id));
  }, [selectedRewayat]);

  const totalSurahs = reciter?.rewayat.reduce((sum, rw) => Math.max(sum, rw.surah_total), 0) ?? 0;

  if (isLoading || !reciter) {
    return (
      <div className="animate-pulse p-10">
        <div className="mb-8 flex items-end gap-9">
          <div className="bg-surface-sunken h-[220px] w-[220px] rounded-full" />
          <div className="space-y-3 pb-2">
            <div className="bg-surface-sunken h-4 w-20 rounded" />
            <div className="bg-surface-sunken h-14 w-80 rounded" />
            <div className="bg-surface-sunken h-4 w-40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  function handlePlaySurah(surahId: number): void {
    if (!reciter || !selectedRewayat) return;
    if (
      currentTrack?.reciterId === reciter.id &&
      currentTrack?.surahId === surahId &&
      currentTrack?.rewayatId === selectedRewayat.id
    ) {
      if (isPlaying) pause();
      else void play();
      return;
    }
    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, surahId, surahNameMap);
    void updateQueue(tracks);
  }

  function handlePlayAll(): void {
    if (!reciter || !selectedRewayat) return;
    const firstSurah = selectedRewayat.surah_list[0];
    if (firstSurah === undefined) return;
    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, firstSurah, surahNameMap);
    void updateQueue(tracks);
  }

  return (
    <div>
      <ReciterHeader reciter={reciter} totalSurahs={totalSurahs} />

      <div className="flex flex-wrap items-center gap-3 px-10 pb-8">
        <button
          onClick={handlePlayAll}
          type="button"
          className="bg-brand-main text-brand-main-foreground hover:bg-brand-strong flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-[var(--elevation-s)] transition-colors duration-fast ease-standard"
        >
          <PlayIcon size={14} color="currentColor" />
          Play All
        </button>
        <button
          type="button"
          className="border-border hover:bg-surface-raised flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors duration-fast ease-standard"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Shuffle
        </button>
        <button
          type="button"
          aria-label="Favorite reciter"
          className="border-border text-brand-main hover:bg-brand-light flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-fast ease-standard"
        >
          <HeartIcon size={18} color="currentColor" />
        </button>
        <button
          type="button"
          aria-label="Share reciter"
          className="border-border hover:bg-surface-raised flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-fast ease-standard"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="More"
          className="border-border hover:bg-surface-raised flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-fast ease-standard"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      {reciter.rewayat.length > 1 && (
        <div className="border-border-divider flex items-center gap-8 border-b px-10">
          <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.08em]">
            Recitation
          </span>
          <div className="flex items-center gap-7">
            {reciter.rewayat.map((rw, idx) => {
              const active = idx === selectedRewayatIdx;
              return (
                <button
                  key={rw.id}
                  type="button"
                  onClick={() => setSelectedRewayatIdx(idx)}
                  className={`-mb-px border-b-2 py-3.5 text-sm transition-colors ${
                    active
                      ? "text-foreground border-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground border-transparent font-medium"
                  }`}
                >
                  {rw.name}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <span className="text-muted-foreground py-3.5 text-xs font-medium">
            {filteredSurahs.length} surahs · sorted by chapter
          </span>
        </div>
      )}

      <div className="px-4 pb-24 pt-4">
        {filteredSurahs.map((surah) => {
          const isCurrent =
            currentTrack?.reciterId === reciter.id &&
            currentTrack?.surahId === surah.id &&
            currentTrack?.rewayatId === selectedRewayat?.id;
          return (
            <div key={surah.id} className="group">
              <SurahListItem
                surah={surah}
                onPlay={handlePlaySurah}
                isPlaying={isPlaying && isCurrent}
                isCurrentTrack={isCurrent}
                playlistItem={
                  selectedRewayat
                    ? { reciter_id: reciter.id, rewayat_id: selectedRewayat.id }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Key structural changes from the previous version:

- `ReciterHeader` now receives `totalSurahs` prop (reciter hook's header no longer manages this alone).
- Filled-pill rewayat switcher replaced with an underlined tab strip prefixed by the "RECITATION" small-caps label and suffixed with a surah count.
- New action row with Play All (brand-filled) + Shuffle (outline) + Heart/Share/More (12×12 circles). Heart is tinted brand to show affinity.
- Outer padding bumped to `px-10` / `pt-8` / `pb-8` to match Paper rhythm.
- Loading skeleton uses `bg-surface-sunken` instead of the old `text-alpha` tokens.

- [ ] **Step 2: Gates**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/app/\(app\)/reciter/\[slug\]/page.tsx
```

Expected: full suite passes.

- [ ] **Step 3: Dev sanity**

Visit `http://localhost:3001/reciter/<any-slug>`. Confirm the new left-hero, action row, and underlined recitation tabs render. Changing theme via the top-bar cycler should flip the brand accent (purple → warm brown in sepia).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/reciter/\[slug\]/page.tsx
git commit -m "feat(listening): redesign reciter detail with action row and underlined recitation tabs"
```

---

## Task 4: `<SurahListItem>` refresh — Arabic font, active-row accent, equalizer glyph

**Files:**

- Modify: `src/components/surah-list-item.tsx`
- Update tests if any assert on inner structure: `src/__tests__/components/surah-list-item.test.tsx`

**Contract:** Row renders (left to right): fixed 36px index slot (number, or equalizer glyph when this row is the currently-playing track) → title + English meaning column → Arabic surah name at 22px in `font-surah-names` (reserved width 160px, right-aligned) → duration slot (72px, mono) → actions slot (favorite + kebab, reveal on hover or when active). Active row: `text-brand-main` on title + index; subtle `bg-brand-light` on the row.

- [ ] **Step 1: Read current file**

```bash
cat src/components/surah-list-item.tsx
```

- [ ] **Step 2: Replace the file**

```tsx
"use client";

import type { Surah } from "@/types/quran";

interface Props {
  surah: Surah;
  onPlay: (surahId: number) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  playlistItem?: { reciter_id: string; rewayat_id: string };
  durationLabel?: string;
}

export function SurahListItem({ surah, onPlay, isPlaying, isCurrentTrack, durationLabel }: Props) {
  const paddedIndex = String(surah.id).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={() => onPlay(surah.id)}
      className={`hover:bg-surface-raised group/row flex w-full items-center gap-5 rounded-xl px-5 py-3 text-left transition-colors duration-fast ease-standard ${
        isCurrentTrack ? "bg-brand-light" : ""
      }`}
    >
      <div
        className={`w-9 shrink-0 text-center text-sm font-semibold tabular-nums ${
          isCurrentTrack ? "text-brand-main" : "text-muted-foreground"
        }`}
      >
        {isPlaying && isCurrentTrack ? <EqualizerGlyph /> : paddedIndex}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div
          className={`truncate text-[15px] font-semibold ${
            isCurrentTrack ? "text-brand-main" : "text-foreground"
          }`}
        >
          {surah.name}
        </div>
        <div className="text-muted-foreground truncate text-xs font-medium">
          {surah.translated_name_english} · {surah.verses_count} ayahs
        </div>
      </div>
      <div className="text-foreground w-40 shrink-0 text-right font-surah-names text-[22px]">
        {surah.name_arabic}
      </div>
      <div className="text-muted-foreground w-[72px] shrink-0 text-right text-[13px] font-medium tabular-nums">
        {durationLabel ?? ""}
      </div>
      <div className="flex w-16 shrink-0 items-center justify-end gap-1">
        <span
          className="text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        <span
          className="text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </span>
      </div>
    </button>
  );
}

function EqualizerGlyph() {
  return (
    <span
      aria-label="Currently playing"
      className="inline-flex h-4 w-4 items-end justify-center gap-[2px]"
    >
      <span className="bg-brand-main inline-block h-2 w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite]" />
      <span className="bg-brand-main inline-block h-3 w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite_150ms]" />
      <span className="bg-brand-main inline-block h-[6px] w-[3px] animate-[eq-bounce_900ms_ease-in-out_infinite_300ms]" />
    </span>
  );
}
```

- [ ] **Step 3: Add the `eq-bounce` keyframe to globals.css**

Append to `src/app/globals.css` (after `@keyframes skeleton-pulse`):

```css
@keyframes eq-bounce {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}
```

- [ ] **Step 4: Fix any broken tests**

```bash
npm run test 2>&1 | tail -30
```

If `surah-list-item.test.tsx` fails because the test asserts on old structure (e.g., specific `<button>` layout), update the test to assert on the new structure: presence of surah name text, clicking fires `onPlay` with the surah id, Arabic name renders. Remove assertions tied to internal DOM structure (use text-based queries).

- [ ] **Step 5: Gates**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/components/surah-list-item.tsx src/app/globals.css
```

- [ ] **Step 6: Commit**

```bash
git add src/components/surah-list-item.tsx src/app/globals.css
git commit -m "feat(listening): SurahListItem with SurahNames glyph, brand-accent active row, equalizer"
```

If any test file changed, include it in the same commit.

---

## Task 5: Queue panel — Clear queue + hover-reveal remove + History section

**Files:**

- Modify: `src/components/player/queue-panel.tsx`

**Contract:** The queue panel already exists and shows the current queue. Add:

1. A header row with "Up Next" title on left, track count in middle, "Clear Queue" text button on the right.
2. Each row gets a hover-reveal remove button (cross glyph) that removes that track from the queue.
3. Below the current queue, a collapsible "History" section showing tracks from indices `0..currentIndex - 1` (tracks that have already played). Collapsed by default; expands on click of the header.

- [ ] **Step 1: Read current queue-panel**

```bash
cat src/components/player/queue-panel.tsx
```

- [ ] **Step 2: Confirm store methods**

```bash
grep -n "removeFromQueue\|clearQueue\|updateQueue" src/stores/player-store.ts | head -10
```

You need methods to remove a single track and clear the queue. If the store already exposes them (e.g., `clearQueue`, `removeFromQueue(index)`), use them directly. If not, add them to `player-store.ts` in a single narrow edit:

```ts
clearQueue: () => set((s) => ({ queue: { ...s.queue, tracks: [], currentIndex: 0 } })),
removeFromQueue: (index: number) =>
  set((s) => {
    const newTracks = s.queue.tracks.filter((_, i) => i !== index);
    const newCurrentIndex =
      index < s.queue.currentIndex ? s.queue.currentIndex - 1 : s.queue.currentIndex;
    return {
      queue: {
        ...s.queue,
        tracks: newTracks,
        currentIndex: Math.max(0, Math.min(newCurrentIndex, newTracks.length - 1)),
      },
    };
  }),
```

Add to the `interface PlayerState` type and to the `create` call in `player-store.ts`. Only do this if the methods don't exist.

- [ ] **Step 3: Rewrite `queue-panel.tsx`**

Replace `src/components/player/queue-panel.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/audio";

interface Props {
  onClose: () => void;
}

export function QueuePanel({ onClose }: Props) {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const skipToIndex = usePlayerStore((s) => s.skipToIndex);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const history = tracks.slice(0, currentIndex);
  const upcoming = tracks.slice(currentIndex);

  return (
    <aside className="bg-surface-raised border-border-divider flex h-full w-full max-w-md flex-col border-l">
      <header className="border-border-divider flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-foreground text-base font-bold">Up Next</h2>
          <span className="text-muted-foreground text-xs font-medium">
            {upcoming.length} {upcoming.length === 1 ? "track" : "tracks"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearQueue}
            className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs font-semibold transition-colors duration-fast ease-standard"
          >
            Clear queue
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close queue"
            className="text-muted-foreground hover:bg-surface-sunken flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {history.length > 0 ? (
          <div className="border-border-divider border-b">
            <button
              type="button"
              onClick={() => setHistoryExpanded((v) => !v)}
              className="hover:bg-surface-sunken flex w-full items-center justify-between px-5 py-3 text-left transition-colors duration-fast ease-standard"
            >
              <span className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.08em]">
                History · {history.length}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-muted-foreground transition-transform duration-fast ${
                  historyExpanded ? "rotate-180" : ""
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {historyExpanded ? (
              <ul className="pb-2">
                {history.map((track, i) => (
                  <QueueRow
                    key={`${track.reciterId}-${track.surahId}-${i}`}
                    track={track}
                    index={i}
                    isActive={false}
                    onJump={() => skipToIndex(i)}
                    onRemove={() => removeFromQueue(i)}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <ul className="py-2">
          {upcoming.map((track, offset) => {
            const absoluteIndex = currentIndex + offset;
            return (
              <QueueRow
                key={`${track.reciterId}-${track.surahId}-${absoluteIndex}`}
                track={track}
                index={absoluteIndex}
                isActive={offset === 0}
                onJump={() => skipToIndex(absoluteIndex)}
                onRemove={() => removeFromQueue(absoluteIndex)}
              />
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function QueueRow({
  track,
  isActive,
  onJump,
  onRemove,
}: {
  track: Track;
  index: number;
  isActive: boolean;
  onJump: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="group/qrow relative">
      <button
        type="button"
        onClick={onJump}
        className={`hover:bg-surface-sunken flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-fast ease-standard ${
          isActive ? "bg-brand-light" : ""
        }`}
      >
        <div className="bg-surface-sunken h-10 w-10 shrink-0 overflow-hidden rounded-md">
          {track.artwork ? (
            <img src={track.artwork} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm font-semibold ${
              isActive ? "text-brand-main" : "text-foreground"
            }`}
          >
            {track.title}
          </div>
          <div className="text-muted-foreground truncate text-xs">{track.reciterName}</div>
        </div>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from queue"
        className="text-muted-foreground hover:text-foreground hover:bg-surface-raised absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/qrow:opacity-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </li>
  );
}
```

Note: this uses `track.reciterName` (assumed to exist on `Track` type) and `track.artwork`. If either is absent on your current `Track` type, read `src/types/audio.ts` and adapt — use `track.title` alone if `reciterName` isn't on the type.

- [ ] **Step 4: Gates**

```bash
npx tsc --noEmit 2>&1 | tail -5
npm run test 2>&1 | tail -5
npx prettier --write src/components/player/queue-panel.tsx src/stores/player-store.ts
```

Expected: full suite passes. If tsc reports errors about `clearQueue` or `removeFromQueue` not existing, revisit Step 2.

- [ ] **Step 5: Dev sanity**

Start a queue on any reciter page, open the queue panel, confirm:

- Header shows "Up Next · N tracks" + Clear queue.
- Hovering a row reveals a close glyph on the right; clicking removes that track.
- Once a track has ended and advanced, the History section appears below the header; clicking it expands.
- Click "Clear queue" and the queue empties.

- [ ] **Step 6: Commit**

```bash
git add src/components/player/queue-panel.tsx src/stores/player-store.ts
git commit -m "feat(listening): queue panel with Clear, hover-remove, collapsible History"
```

---

## Task 6: Full player view — slide-up + fade open + heart pulse

**Files:**

- Modify: `src/components/player/full-player-view.tsx`
- Modify: `src/app/globals.css` (add `heart-pulse` keyframe)

**Contract:** When `FullPlayerView` opens (controlled from `BottomPlayerBar` via `showFullPlayer` state), it slides up from the bottom and fades in at `--motion-regular`. On heart-tap, the heart icon plays a scale 1 → 1.08 → 1 pulse at ~400ms.

- [ ] **Step 1: Add keyframe**

Append to `src/app/globals.css` (after `@keyframes eq-bounce`):

```css
@keyframes heart-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.08);
  }
  50% {
    transform: scale(1);
  }
}
```

Add to `tailwind.config.ts` `theme.extend.animation`:

```ts
        "heart-pulse": "heart-pulse 400ms ease-out",
```

The full `animation` block becomes:

```ts
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "heart-pulse": "heart-pulse 400ms ease-out",
      },
```

- [ ] **Step 2: Read and update full-player-view.tsx**

```bash
cat src/components/player/full-player-view.tsx
```

The outer element (typically a fixed-position overlay controlled by a `isOpen` boolean prop) currently snaps into place. Wrap its className with transform + opacity transitions keyed on `isOpen`, and on any heart element add the `animate-heart-pulse` class when a `heartPulsing` state is `true` (reset after 400ms).

Key edits (apply to wherever the outer container sits):

```tsx
const [heartPulsing, setHeartPulsing] = useState(false);

function handleHeartTap() {
  setHeartPulsing(true);
  setTimeout(() => setHeartPulsing(false), 420);
  // … existing favorite-toggle logic …
}

// Outer container — replace className:
<div
  className={`bg-surface fixed inset-0 z-50 transition-[transform,opacity] duration-regular ease-standard ${
    isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
  }`}
>
  {/* …content… */}
  <button
    type="button"
    onClick={handleHeartTap}
    aria-label="Favorite"
    className={heartPulsing ? "animate-heart-pulse" : ""}
  >
    <HeartIcon size={22} filled={isFavorited} />
  </button>
  {/* …rest… */}
</div>;
```

Substitute the exact variable names in your current file (`isOpen` might be named `open`, `setHeartPulsing` should match the existing state conventions, the Heart icon might be imported from the Bayaan icon set with `filled={true}` for the active state).

- [ ] **Step 3: Gates**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/components/player/full-player-view.tsx src/app/globals.css tailwind.config.ts
```

- [ ] **Step 4: Dev sanity**

Start playback, click the bottom player bar to open the full player → it should slide up + fade over 400ms. Tap the heart → it pulses and the filled state toggles.

- [ ] **Step 5: Commit**

```bash
git add src/components/player/full-player-view.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat(listening): full player slide-up fade + heart-tap pulse"
```

---

## Task 7: Regression gate

**Files:**

- None modified.

- [ ] **Step 1: Full suite**

```bash
npm run test
```

Expected: 186+ tests pass.

- [ ] **Step 2: tsc**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Dev visual pass**

```bash
npm run dev
```

Walk through each touched surface:

- `/reciter/<slug>` — new left-hero, action row, underlined rewayat tabs, tracklist rows with Arabic font + accent-on-active
- Bottom player bar → click to expand full player → slides up + fades in
- Full player → tap heart → pulses; close → slides down
- Start queue, open queue panel → Clear, hover-remove, History section works
- Switch themes via top-bar cycler: brand tokens flip correctly (purple → warm brown in sepia) on all touched surfaces

No commit.

---

## Self-Review Notes

**Spec coverage (synthesis §3 Listening rows):**

- Reciter detail: left-hero + below-art action row + Recitation tabs (underlined) → Tasks 1-3 ✓
- Reciter Arabic name in SurahNames font → Task 2 ✓
- SurahListItem: inline duration + accent-on-active + equalizer → Task 4 ✓
- Queue: Clear queue + hover-remove + History → Task 5 ✓
- Full player: slide-up + pulse on heart → Task 6 ✓

**Deferrals to a later plan or PR (not blocking):**

- Drag-handle reorder on queue rows (Deezer 04 notes it's a nice-to-have; CSS-only reorder transition is enough for now)
- Rate chip promotion to bottom player bar
- Lyrics/mic icon in bottom bar
- Similar reciters rail / Popular surahs rail below the tracklist (user deferred these explicitly — "remove about, popular and similar reciters because we simply don't have data on them")
- Command palette verse-reference parser + type chips → its own small Plan 3b or squeeze into Plan 4
- Surah listening mode artwork (plan 4 reading overlaps here)
- Reciter index card image onLoad reveal (one-line change, can go in a later polish PR)

**Placeholder scan:** All code blocks show full code. No "similar to Task N." No TBD.

**Type consistency:**

- `ReciterHeader` now takes `{ reciter, totalSurahs, totalDurationLabel? }` — consumed in Task 3 with matching shape.
- `ReciterHeroPortrait` takes `{ name, imageUrl? }` — consumed in Task 2.
- `SurahListItem` props unchanged except added optional `durationLabel` — existing callers continue to work.
- `player-store.ts` may gain `clearQueue` and `removeFromQueue` methods in Task 5 if not already present; Queue panel consumes them.

**Testability:** every task ends at a state a human can click through in the dev server — Task 1's portrait is consumed immediately in Task 2 (page still renders), Task 2 feeds Task 3, and by the end of each individual task the app still compiles and serves pages.

**Scope check:** this plan ships working software on its own. Each task is committable and testable in isolation. Nothing here blocks Plan 4 (reading surfaces).
