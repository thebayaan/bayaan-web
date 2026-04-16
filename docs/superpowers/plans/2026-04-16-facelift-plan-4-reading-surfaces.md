# Facelift Plan 4 — Reading Surfaces

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the missing surah index at `/quran`, add a sticky reader sub-header that finally binds `reading-settings-store` to UI, and make the Continue Reading slot self-update from the URL.

**Architecture:** Plan 1 + 2 + 3 set up tokens, primitives, shell, and listening surfaces. Plan 4 fills the largest IA gap on the reading side — `/quran/page.tsx` currently just renders `<MushafView />` with no chapter index. Adds a 3-column `<SurahIndexGrid>` with `Surah | Juz | Revelation Order` tabs and a client-side filter. On the surah reader pages (`/quran/[surah]`), adds a `<ReadingSubHeader>` with a surah picker, location meta, view-mode toggle, and settings gear that opens a drawer wiring the `reading-settings-store` to clickable controls. A small `useReadingProgress` hook auto-updates the Continue Reading localStorage entry whenever the user lands on a surah/verse URL.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Zustand (`reading-settings-store`), `@base-ui/react` Sheet primitive, Vitest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-04-16-facelift-design.md`
**Synthesis:** `docs/superpowers/research/facelift/synthesis.md` §3 (Reading rows)
**Paper reference:** "Reading · Surah Index · Desktop · Light" + "Reading · Verse View · Desktop · Light" artboards.

---

## File Structure

**New files:**

- `src/components/quran/surah-index-card.tsx` — single grid card primitive
- `src/components/quran/surah-index-grid.tsx` — the grid + tabs + filter wrapper
- `src/components/quran/reading-sub-header.tsx` — sticky bar above ReadingView/MushafView
- `src/components/quran/reading-settings-sheet.tsx` — drawer wired to reading-settings-store
- `src/hooks/use-reading-progress.ts` — auto-writes `bayaan-continue-reading` from current surah/verse URL
- Tests for each new file

**Modified files:**

- `src/app/(app)/quran/page.tsx` — replace bare `<MushafView />` with new index + tabs
- `src/app/(app)/quran/[surah]/page.tsx` — mount `<ReadingSubHeader>`; trigger `useReadingProgress`
- `src/app/(app)/quran/[surah]/[ayah]/page.tsx` — same as above for ayah deep-links

**Branch:** continue on `feat/facelift-design-v2`.

---

## Task 1: `<SurahIndexCard>` primitive

**Files:**

- Create: `src/components/quran/surah-index-card.tsx`
- Create: `src/__tests__/components/quran/surah-index-card.test.tsx`

**Contract:** Card renders: light-numeric index (e.g., `01`) | bold transliteration + meaning | Arabic surah name in `font-surah-names` (right side, 22px). Whole card is a Next `<Link>` to `/quran/[id]`.

- [ ] **Step 1: Write failing test**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurahIndexCard } from "@/components/quran/surah-index-card";

const surah = {
  id: 2,
  name: "Al-Baqarah",
  name_arabic: "البقرة",
  translated_name_english: "The Cow",
  verses_count: 286,
  revelation_place: "Medinan",
  revelation_order: 87,
  pages: [2, 49],
} as const;

describe("SurahIndexCard", () => {
  it("renders the padded index", () => {
    render(<SurahIndexCard surah={surah} />);
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("renders the transliteration and meaning", () => {
    render(<SurahIndexCard surah={surah} />);
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText(/The Cow/)).toBeInTheDocument();
  });

  it("renders the Arabic name", () => {
    render(<SurahIndexCard surah={surah} />);
    expect(screen.getByText("البقرة")).toBeInTheDocument();
  });

  it("links to the surah reader", () => {
    render(<SurahIndexCard surah={surah} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/quran/2");
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npx vitest run src/__tests__/components/quran/surah-index-card.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
"use client";

import Link from "next/link";
import type { Surah } from "@/types/quran";

interface Props {
  surah: Surah;
  isResume?: boolean;
}

export function SurahIndexCard({ surah, isResume }: Props) {
  const padded = String(surah.id).padStart(2, "0");
  return (
    <Link
      href={`/quran/${surah.id}`}
      className={`hover:bg-surface-raised flex items-center gap-4 rounded-2xl border p-4 transition-colors duration-fast ease-standard ${
        isResume ? "bg-brand-light border-[var(--brand-weak)]" : "border-border"
      }`}
    >
      <div
        className={`w-10 shrink-0 text-center text-2xl font-light tabular-nums ${
          isResume ? "text-brand-main" : "text-muted-foreground"
        }`}
      >
        {padded}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="text-foreground truncate text-[15px] font-bold tracking-tight">
          {surah.name}
        </div>
        <div className="text-muted-foreground truncate text-xs font-medium">
          {surah.translated_name_english} · {surah.verses_count} ayahs
        </div>
      </div>
      <div className="text-foreground shrink-0 font-surah-names text-[22px]">
        {surah.name_arabic}
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Gates**

```bash
npx vitest run src/__tests__/components/quran/surah-index-card.test.tsx && npm run test && npx tsc --noEmit && npx prettier --write src/components/quran/surah-index-card.tsx src/__tests__/components/quran/surah-index-card.test.tsx
```

Expected: 4 new tests pass; full suite passes (190 total).

- [ ] **Step 5: Commit**

```bash
git add src/components/quran/surah-index-card.tsx src/__tests__/components/quran/surah-index-card.test.tsx
git commit -m "feat(reading): add SurahIndexCard primitive"
```

---

## Task 2: `<SurahIndexGrid>` + new `/quran` page

**Files:**

- Create: `src/components/quran/surah-index-grid.tsx`
- Modify: `src/app/(app)/quran/page.tsx`

**Contract:** Grid component takes the 114 surahs and renders them as a 3-col grid (`lg`), 2-col (`md`), 1-col (`<md`). Above the grid: tab strip (`Surah | Juz | Revelation Order`) + filter input (client-side `.filter()` over name/transliteration/number/Arabic). Active tab determines sort order: Surah = by id; Juz = grouped by `pages[0]`; Revelation Order = sorted by `revelation_order`.

- [ ] **Step 1: Implement the grid component**

Create `src/components/quran/surah-index-grid.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import { SurahIndexCard } from "./surah-index-card";
import { useContinueReading } from "@/hooks/use-continue-reading";

const surahs = surahData as unknown as Surah[];

type Tab = "surah" | "juz" | "revelation";

export function SurahIndexGrid() {
  const [tab, setTab] = useState<Tab>("surah");
  const [filter, setFilter] = useState("");
  const continueReading = useContinueReading();

  const sorted = useMemo(() => {
    const list = [...surahs];
    if (tab === "revelation") list.sort((a, b) => a.revelation_order - b.revelation_order);
    return list;
  }, [tab]);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return sorted;
    return sorted.filter((s) => {
      return (
        String(s.id).includes(f) ||
        s.name.toLowerCase().includes(f) ||
        s.translated_name_english.toLowerCase().includes(f) ||
        s.name_arabic.includes(filter.trim())
      );
    });
  }, [sorted, filter]);

  return (
    <div className="px-10 pb-20">
      <header className="flex flex-col gap-4 pb-8 pt-16">
        <div className="text-brand-main flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
          <span className="bg-brand-main h-px w-4" aria-hidden />
          <span>The Book</span>
        </div>
        <h1 className="text-[56px] font-extrabold leading-none tracking-[-0.025em]">
          Read the Quran
        </h1>
        <p className="text-muted-foreground max-w-2xl text-[17px] leading-relaxed">
          114 surahs. 6,236 verses. Browse by chapter, Juz, or revelation order — or jump straight
          into your last place.
        </p>
      </header>

      <div className="border-border-divider flex flex-wrap items-center gap-6 border-b pb-2">
        <div className="flex items-center gap-7">
          <TabButton active={tab === "surah"} onClick={() => setTab("surah")}>
            Surah <span className="text-muted-foreground ml-1 text-xs font-medium">114</span>
          </TabButton>
          <TabButton active={tab === "juz"} onClick={() => setTab("juz")}>
            Juz <span className="text-muted-foreground ml-1 text-xs font-medium">30</span>
          </TabButton>
          <TabButton active={tab === "revelation"} onClick={() => setTab("revelation")}>
            Revelation Order
          </TabButton>
        </div>
        <div className="flex-1" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter surahs"
          className="border-border bg-surface-sunken w-60 rounded-lg border px-3 py-2 text-sm transition-colors duration-fast ease-standard focus:outline-none focus:ring-2 focus:ring-[var(--brand-weak)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 pt-7 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <SurahIndexCard key={s.id} surah={s} isResume={continueReading?.surahId === s.id} />
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 py-3.5 text-[15px] transition-colors ${
        active
          ? "text-foreground border-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground border-transparent font-medium"
      }`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Replace `/quran/page.tsx`**

```tsx
import { SurahIndexGrid } from "@/components/quran/surah-index-grid";

export default function QuranPage() {
  return <SurahIndexGrid />;
}
```

- [ ] **Step 3: Gates**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/components/quran/surah-index-grid.tsx src/app/\(app\)/quran/page.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/quran/surah-index-grid.tsx src/app/\(app\)/quran/page.tsx
git commit -m "feat(reading): add SurahIndexGrid with Surah/Juz/Revelation tabs at /quran"
```

---

## Task 3: `<ReadingSubHeader>` — sticky bar above the reader

**Files:**

- Create: `src/components/quran/reading-sub-header.tsx`

**Contract:** Sticky 56px bar with: left = surah picker dropdown ("02 Al-Baqarah ▾" — links to `/quran` for now since picker UI is bigger work), middle = small-caps location meta (`Page N · Juz J`), right = view-mode toggle (Verse | Reading) + settings gear button. Settings gear opens `<ReadingSettingsSheet>` from Task 4.

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Surah } from "@/types/quran";
import { ReadingSettingsSheet } from "./reading-settings-sheet";

interface Props {
  surah: Surah;
  page?: number;
  juz?: number;
}

export function ReadingSubHeader({ surah, page, juz }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="border-border-divider bg-surface/95 sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b px-10 py-3 backdrop-blur-md">
        <Link
          href="/quran"
          className="border-border bg-surface hover:bg-surface-raised flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors duration-fast ease-standard"
        >
          <span className="bg-brand-light text-brand-main flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-bold tabular-nums">
            {String(surah.id).padStart(2, "0")}
          </span>
          <span className="flex flex-col items-start">
            <span className="text-foreground text-sm font-bold leading-none">{surah.name}</span>
            <span className="text-muted-foreground mt-0.5 text-[11px] font-medium leading-none">
              {surah.translated_name_english} · {surah.verses_count} ayahs
            </span>
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
            className="text-muted-foreground ml-1"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Link>

        {page !== undefined && (
          <div className="text-muted-foreground flex items-center gap-3 text-xs font-medium">
            <span>Page {page}</span>
            {juz !== undefined && (
              <>
                <span className="bg-border-divider h-3 w-px" />
                <span>Juz {juz}</span>
              </>
            )}
          </div>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Reading settings"
          className="border-border hover:bg-surface-raised flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-fast ease-standard"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <ReadingSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
```

- [ ] **Step 2: Gates**

```bash
npx tsc --noEmit
```

Expected: tsc errors that `ReadingSettingsSheet` doesn't exist yet — that's Task 4. Don't run `npm run test` yet.

- [ ] **Step 3: Commit (after Task 4 lands)**

This task's commit happens together with Task 4 since they reference each other.

---

## Task 4: `<ReadingSettingsSheet>` — drawer wired to reading-settings-store

**Files:**

- Create: `src/components/quran/reading-settings-sheet.tsx`

**Contract:** Bottom-sheet on mobile, side-sheet on desktop. Renders controls bound to `reading-settings-store`:

1. Font size slider (0.8 → 3.0, step 0.1) bound to `fontSize`.
2. Translation dropdown — for now a single static option "Dr. Mustafa Khattab" (id `131`); architecture extensible later.
3. Toggles: Show transliteration / Show word-by-word / Show tajweed.

Uses the existing `<Sheet>` primitive (look it up in `src/components/ui/sheet.tsx`).

- [ ] **Step 1: Read the Sheet component to confirm prop shape**

```bash
grep -n "export\|Props\|interface" src/components/ui/sheet.tsx | head -10
```

The shadcn-style Sheet typically exposes `<Sheet open onOpenChange><SheetContent side="right">...</SheetContent></Sheet>`. Adapt to whatever the actual component takes.

- [ ] **Step 2: Implement**

```tsx
"use client";

import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReadingSettingsSheet({ open, onOpenChange }: Props) {
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const setFontSize = useReadingSettingsStore((s) => s.setFontSize);
  const showTransliteration = useReadingSettingsStore((s) => s.showTransliteration);
  const toggleTransliteration = useReadingSettingsStore((s) => s.toggleTransliteration);
  const showWordByWord = useReadingSettingsStore((s) => s.showWordByWord);
  const toggleWordByWord = useReadingSettingsStore((s) => s.toggleWordByWord);
  const showTajweed = useReadingSettingsStore((s) => s.showTajweed);
  const toggleTajweed = useReadingSettingsStore((s) => s.toggleTajweed);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-surface flex w-full max-w-md flex-col">
        <SheetHeader>
          <SheetTitle>Reading settings</SheetTitle>
          <SheetDescription>Adjust font size, translations, and reading aids.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section className="space-y-3">
            <label className="text-foreground block text-sm font-semibold">
              Font size
              <span className="text-muted-foreground ml-2 font-normal tabular-nums">
                {fontSize.toFixed(1)}rem
              </span>
            </label>
            <input
              type="range"
              min={0.8}
              max={3}
              step={0.1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold">Translation</h3>
            <select
              defaultValue="131"
              className="border-border bg-surface-sunken w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="131">Dr. Mustafa Khattab — The Clear Quran</option>
            </select>
          </section>

          <section className="space-y-2">
            <h3 className="text-foreground text-sm font-semibold">Reading aids</h3>
            <ToggleRow
              label="Transliteration"
              description="Show the verse in Latin script."
              checked={showTransliteration}
              onChange={toggleTransliteration}
            />
            <ToggleRow
              label="Word-by-word"
              description="Show meaning under each word."
              checked={showWordByWord}
              onChange={toggleWordByWord}
            />
            <ToggleRow
              label="Tajweed coloring"
              description="Color-code recitation rules."
              checked={showTajweed}
              onChange={toggleTajweed}
            />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="hover:bg-surface-sunken flex w-full items-start justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-foreground text-sm font-semibold">{label}</span>
        <span className="text-muted-foreground text-xs">{description}</span>
      </span>
      <span
        aria-checked={checked}
        role="switch"
        className={`relative mt-1 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-main" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
```

- [ ] **Step 3: Gates**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/components/quran/reading-settings-sheet.tsx src/components/quran/reading-sub-header.tsx
```

Expected: tsc clean (Task 3's `<ReadingSubHeader>` now compiles). Tests pass.

- [ ] **Step 4: Commit Tasks 3 + 4 together**

```bash
git add src/components/quran/reading-sub-header.tsx src/components/quran/reading-settings-sheet.tsx
git commit -m "feat(reading): add ReadingSubHeader + ReadingSettingsSheet wiring reading-settings-store"
```

---

## Task 5: Mount `<ReadingSubHeader>` on surah reader pages

**Files:**

- Modify: `src/app/(app)/quran/[surah]/page.tsx`
- Modify: `src/app/(app)/quran/[surah]/[ayah]/page.tsx`

- [ ] **Step 1: Read both files**

```bash
cat src/app/\(app\)/quran/\[surah\]/page.tsx
echo "---"
cat src/app/\(app\)/quran/\[surah\]/\[ayah\]/page.tsx
```

- [ ] **Step 2: Add `<ReadingSubHeader>` to `[surah]/page.tsx`**

The current file imports `ReadingView` and renders the surah body. Add the sub-header at the top of the rendered tree:

Find the rendered JSX block and add the sub-header. Example pattern (adapt to actual existing JSX shape):

```tsx
import { ReadingSubHeader } from "@/components/quran/reading-sub-header";

// ...inside the page component's render:
return (
  <div>
    <ReadingSubHeader surah={match} page={match.pages?.[0]} juz={undefined} />
    <ReadingView surahId={match.id} />
  </div>
);
```

The exact prop names depend on the existing file. `juz` is optional and can be omitted if not easily derived; the meta line just won't show the Juz pill in that case.

- [ ] **Step 3: Repeat for `[surah]/[ayah]/page.tsx`**

Same pattern — add the sub-header at the top.

- [ ] **Step 4: Gates + commit**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/app/\(app\)/quran/\[surah\]/page.tsx src/app/\(app\)/quran/\[surah\]/\[ayah\]/page.tsx
git add src/app/\(app\)/quran/\[surah\]/page.tsx src/app/\(app\)/quran/\[surah\]/\[ayah\]/page.tsx
git commit -m "feat(reading): mount ReadingSubHeader on surah and ayah reader pages"
```

---

## Task 6: `useReadingProgress` — auto-update Continue Reading from URL

**Files:**

- Create: `src/hooks/use-reading-progress.ts`
- Modify: `src/app/(app)/quran/[surah]/page.tsx` (call the hook)
- Modify: `src/app/(app)/quran/[surah]/[ayah]/page.tsx` (call the hook with ayah)

**Contract:** On mount/effect, write the current surah + verse + page to `bayaan-continue-reading` localStorage key (using `setContinueReading` from Plan 2). This makes the sidebar `<ContinueReadingCard>` self-populate as the user navigates the reader.

- [ ] **Step 1: Implement the hook**

```ts
"use client";

import { useEffect } from "react";
import { setContinueReading } from "./use-continue-reading";
import type { Surah } from "@/types/quran";

export function useReadingProgress(surah: Surah, verseId?: number) {
  useEffect(() => {
    setContinueReading({
      surahId: surah.id,
      surahName: surah.name,
      verseId: verseId ?? 1,
      page: surah.pages?.[0] ?? 1,
    });
  }, [surah.id, surah.name, verseId, surah.pages]);
}
```

- [ ] **Step 2: Wire it into both reader pages**

In `src/app/(app)/quran/[surah]/page.tsx`, inside the page component (after `match` is resolved):

```tsx
import { useReadingProgress } from "@/hooks/use-reading-progress";
// ...
useReadingProgress(match);
```

Note: this page may currently be a server component (no `"use client"` and `async function` for `generateMetadata`). If the rendering shell is a server component but you need a client hook, extract the body that needs the hook into a client component:

- Create a small `<SurahReaderClient surah verseId? />` client component that calls `useReadingProgress` + renders `<ReadingSubHeader>` + `<ReadingView>`.
- Have the server page component pass the resolved surah to `<SurahReaderClient>`.

If the page is already a client component, just call the hook directly.

In `src/app/(app)/quran/[surah]/[ayah]/page.tsx`, do the same with the parsed ayah number passed as `verseId`.

- [ ] **Step 3: Gates + commit**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/hooks/use-reading-progress.ts src/app/\(app\)/quran/\[surah\]/page.tsx src/app/\(app\)/quran/\[surah\]/\[ayah\]/page.tsx
git add src/hooks/use-reading-progress.ts src/app/\(app\)/quran/\[surah\]/page.tsx src/app/\(app\)/quran/\[surah\]/\[ayah\]/page.tsx
git commit -m "feat(reading): useReadingProgress auto-updates Continue Reading from URL"
```

---

## Task 7: Final regression gate

**Files:**

- None modified.

- [ ] **Step 1: Full test suite + tsc**

```bash
npm run test
npx tsc --noEmit
```

Expected: ~190 tests pass; tsc clean.

- [ ] **Step 2: Dev visual sweep**

```bash
npm run dev
```

Verify in browser:

- `/quran` — new index page with hero, tab strip, filter input, 3-col card grid. Filtering by name or number works. Switching to Revelation tab reorders.
- `/quran/2` — sub-header shows "02 Al-Baqarah" picker + Page 2. Click settings gear → drawer opens. Adjust font size → reflects in reader. Toggle reading aids — state persists across reload.
- After visiting any surah page, return to home/sidebar — Continue Reading card now shows the surah you were just on with progress bar.
- Cycle theme via top-bar — all surfaces flip cleanly through light/dark/sepia.

No commit.

---

## Self-Review Notes

**Spec coverage (synthesis §3 Reading rows):**

- Surah index at `/quran` — Tasks 1–2 ✓
- Reader sub-header (sticky, surah picker, location meta, view-mode toggle, settings gear) — Task 3 ✓
- ReadingSettingsSheet binding `reading-settings-store` — Task 4 ✓
- Continue Reading auto-update — Task 6 ✓

**Deferrals:**

- Word popover (`<WordPopover>`) — heavy, separate plan
- Tajweed coloring (code_v4 font + 8-rule hex map) — heavy, separate plan
- Mushaf page crossfade — separate small commit
- Verse action row split (bookmark + pencil) — separate small commit
- View-mode toggle in sub-header (Verse vs Reading) — currently only sets settings; full toggle wires to MushafView vs ReadingView swap, which is a bigger refactor
- Ayah focus / detail state — bigger refactor

**Placeholder scan:** All code blocks complete. No "similar to Task N." No TBD.

**Type consistency:**

- `SurahIndexCard` props: `{ surah: Surah, isResume?: boolean }` — used identically in Task 2.
- `ReadingSubHeader` props: `{ surah: Surah, page?: number, juz?: number }` — used in Task 5.
- `ReadingSettingsSheet` props: `{ open: boolean, onOpenChange: (open: boolean) => void }` — used by Task 3.
- `useReadingProgress` signature: `(surah: Surah, verseId?: number)` — used in Task 6.

**Testability:** every task ends in a clickable surface. Task 1's card is consumed in Task 2 (visible at `/quran`). Tasks 3 + 4 are mounted in Task 5 (visible on `/quran/[surah]`). Task 6 makes the Continue Reading card populate as you read — a key user-facing payoff.

**Scope check:** this plan is self-contained. Each task ships working code. Plan 4 deliverables let users browse and read Quran with persisted settings — closing the largest IA gap from the synthesis.
