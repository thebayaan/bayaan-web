# Bayaan Web — Plan 3: Listening Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the listening experience — home page with featured reciters, reciter profile with surah list and playback, surah page with all reciters, search with Fuse.js, and full player view with queue panel.

**Architecture:** SWR hooks fetch reciters from the Bayaan API proxy (`/api/bayaan/reciters`). Reciter and surah cards trigger playback via the playerStore from Plan 2. Home page shows featured reciters and browse sections. Reciter profile shows surah list with rewayat tabs. Search uses Fuse.js for fuzzy matching across reciters and surahs. Full player view expands from the bottom bar. Queue panel slides out from the right.

**Tech Stack:** SWR, Fuse.js, shadcn/ui (Sheet, Tabs, ScrollArea), next/image, dnd-kit (queue reorder)

**Testing:** Component tests with mocked SWR data, search logic tests, playback integration tests.

**Spec:** `docs/superpowers/specs/2026-04-13-bayaan-web-design.md`

**Depends on:** Plan 1 (Foundation) + Plan 2 (Audio Player) — both completed

---

## File Structure (Plan 3)

```
src/
├── hooks/
│   ├── use-reciters.ts              # SWR hook for reciter list
│   └── use-reciter.ts               # SWR hook for single reciter
├── lib/
│   └── audio-utils.ts               # Audio URL generation + track creation
├── components/
│   ├── reciter-card.tsx              # Reusable reciter card/tile
│   ├── surah-list-item.tsx           # Surah row in reciter profile
│   ├── play-button.tsx               # Play/shuffle action buttons
│   ├── reciter-header.tsx            # Reciter image + name + info
│   ├── rewayat-tabs.tsx              # Rewayat selector tabs
│   ├── search/
│   │   ├── search-input.tsx          # Search bar with icon
│   │   ├── search-results.tsx        # Combined results list
│   │   └── explore-view.tsx          # Browse view when search empty
│   └── player/
│       ├── full-player-view.tsx      # Expanded sheet player
│       └── queue-panel.tsx           # Slide-out queue list
├── app/(app)/
│   ├── page.tsx                      # Home (REPLACE placeholder)
│   ├── search/page.tsx               # Search (REPLACE placeholder)
│   ├── reciter/[slug]/page.tsx       # Reciter profile (REPLACE)
│   └── surah/[id]/page.tsx           # Surah page (REPLACE)
└── __tests__/
    ├── hooks/
    │   └── use-reciters.test.ts
    ├── lib/
    │   └── audio-utils.test.ts
    └── components/
        ├── reciter-card.test.tsx
        ├── surah-list-item.test.tsx
        └── search/
            └── search-results.test.tsx
```

---

### Task 1: SWR Data Hooks

**Files:**

- Create: `src/hooks/use-reciters.ts`, `src/hooks/use-reciter.ts`
- Test: `src/__tests__/hooks/use-reciters.test.ts`

- [ ] **Step 1: Write useReciters test**

Create `src/__tests__/hooks/use-reciters.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReciters } from "@/hooks/use-reciters";

vi.mock("@/lib/api", () => ({
  fetchBayaan: vi.fn().mockResolvedValue({
    data: [
      {
        id: "r-1",
        name: "Mishary Alafasy",
        slug: "mishary-alafasy",
        image_url: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
        is_featured: true,
        rewayat: [
          {
            id: "rw-1",
            reciter_id: "r-1",
            name: "Hafs A'n Assem",
            style: "murattal",
            server:
              "https://cdn.thebayaan.com/quran/recitations/mishary-alafasy/hafs/murattal/default",
            source_type: "bayaan",
            surah_total: 114,
            surah_list: Array.from({ length: 114 }, (_, i) => i + 1),
            mp3quran_read_id: 12,
            qdc_reciter_id: null,
          },
        ],
      },
    ],
    pagination: { page: 1, limit: 200, total: 1 },
  }),
}));

describe("useReciters", () => {
  it("fetches and returns reciters", async () => {
    const { result } = renderHook(() => useReciters());

    await waitFor(() => {
      expect(result.current.reciters).toHaveLength(1);
    });

    expect(result.current.reciters[0]?.name).toBe("Mishary Alafasy");
    expect(result.current.isLoading).toBe(false);
  });

  it("returns featured reciters", async () => {
    const { result } = renderHook(() => useReciters());

    await waitFor(() => {
      expect(result.current.featured).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: Implement useReciters**

Create `src/hooks/use-reciters.ts`:

```typescript
import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { Reciter } from "@/types/reciter";

interface RecitersResponse {
  data: Reciter[];
  pagination: { page: number; limit: number; total: number };
}

export function useReciters() {
  const { data, error, isLoading } = useSWR<RecitersResponse>(
    "reciters?page=1&limit=200",
    fetchBayaan,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const reciters = data?.data ?? [];
  const featured = reciters.filter((r) => r.is_featured);

  return {
    reciters,
    featured,
    isLoading,
    error,
  };
}
```

- [ ] **Step 3: Implement useReciter**

Create `src/hooks/use-reciter.ts`:

```typescript
import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { Reciter } from "@/types/reciter";

interface ReciterResponse {
  data: Reciter;
}

export function useReciter(slug: string) {
  const { data, error, isLoading } = useSWR<ReciterResponse>(
    slug ? `reciters/${slug}` : null,
    fetchBayaan,
    {
      revalidateOnFocus: false,
    },
  );

  return {
    reciter: data?.data ?? null,
    isLoading,
    error,
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SWR data hooks for reciters"
```

---

### Task 2: Audio Utilities — Track Creation

**Files:**

- Create: `src/lib/audio-utils.ts`
- Test: `src/__tests__/lib/audio-utils.test.ts`

- [ ] **Step 1: Write audio utils tests**

Create `src/__tests__/lib/audio-utils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildAudioUrl, createTrack, createQueueFromSurah } from "@/lib/audio-utils";
import type { Reciter, Rewayat } from "@/types/reciter";

const mockRewayat: Rewayat = {
  id: "rw-1",
  reciter_id: "r-1",
  name: "Hafs A'n Assem",
  style: "murattal",
  server: "https://cdn.thebayaan.com/quran/recitations/mishary/hafs/murattal/default",
  source_type: "bayaan",
  surah_total: 114,
  surah_list: [1, 2, 3, 4, 5],
  mp3quran_read_id: 12,
  qdc_reciter_id: null,
};

const mockReciter: Reciter = {
  id: "r-1",
  name: "Mishary Alafasy",
  slug: "mishary-alafasy",
  image_url: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
  is_featured: true,
  rewayat: [mockRewayat],
};

describe("buildAudioUrl", () => {
  it("builds correct URL with zero-padded surah number", () => {
    const url = buildAudioUrl(mockRewayat.server, 1);
    expect(url).toBe(
      "https://cdn.thebayaan.com/quran/recitations/mishary/hafs/murattal/default/001.mp3",
    );
  });

  it("pads single-digit surah to 3 digits", () => {
    expect(buildAudioUrl(mockRewayat.server, 9)).toContain("/009.mp3");
  });

  it("pads double-digit surah to 3 digits", () => {
    expect(buildAudioUrl(mockRewayat.server, 36)).toContain("/036.mp3");
  });

  it("handles triple-digit surah", () => {
    expect(buildAudioUrl(mockRewayat.server, 114)).toContain("/114.mp3");
  });
});

describe("createTrack", () => {
  it("creates a track with correct metadata", () => {
    const track = createTrack(mockReciter, mockRewayat, 1, "Al-Fatiha");
    expect(track.id).toBe("r-1:rw-1:1");
    expect(track.url).toContain("/001.mp3");
    expect(track.title).toBe("Al-Fatiha");
    expect(track.artist).toBe("Mishary Alafasy");
    expect(track.reciterId).toBe("r-1");
    expect(track.surahId).toBe(1);
    expect(track.rewayatId).toBe("rw-1");
  });
});

describe("createQueueFromSurah", () => {
  it("creates queue starting from selected surah, wrapping around", () => {
    const surahNames: Record<number, string> = {
      1: "Al-Fatiha",
      2: "Al-Baqarah",
      3: "Aal-E-Imran",
      4: "An-Nisa",
      5: "Al-Maidah",
    };
    const { tracks, startIndex } = createQueueFromSurah(mockReciter, mockRewayat, 3, surahNames);
    expect(tracks).toHaveLength(5);
    expect(startIndex).toBe(0);
    expect(tracks[0]?.title).toBe("Aal-E-Imran");
    expect(tracks[1]?.title).toBe("An-Nisa");
    expect(tracks[4]?.title).toBe("Al-Baqarah");
  });
});
```

- [ ] **Step 2: Implement audio utils**

Create `src/lib/audio-utils.ts`:

```typescript
import type { Track } from "@/types/audio";
import type { Reciter, Rewayat } from "@/types/reciter";

export function buildAudioUrl(server: string, surahNumber: number): string {
  const padded = surahNumber.toString().padStart(3, "0");
  return `${server}/${padded}.mp3`;
}

export function createTrack(
  reciter: Reciter,
  rewayat: Rewayat,
  surahId: number,
  surahName: string,
): Track {
  return {
    id: `${reciter.id}:${rewayat.id}:${surahId}`,
    url: buildAudioUrl(rewayat.server, surahId),
    title: surahName,
    artist: reciter.name,
    artwork: reciter.image_url ?? "",
    duration: 0,
    reciterId: reciter.id,
    reciterName: reciter.name,
    surahId,
    rewayatId: rewayat.id,
  };
}

export function createQueueFromSurah(
  reciter: Reciter,
  rewayat: Rewayat,
  startSurahId: number,
  surahNames: Record<number, string>,
): { tracks: Track[]; startIndex: number } {
  const surahList = rewayat.surah_list;
  const startIdx = surahList.indexOf(startSurahId);
  if (startIdx === -1) {
    return { tracks: [], startIndex: 0 };
  }

  // Reorder: selected surah first, then rest wrapping around
  const reordered = [...surahList.slice(startIdx), ...surahList.slice(0, startIdx)];

  const tracks = reordered.map((surahId) =>
    createTrack(reciter, rewayat, surahId, surahNames[surahId] ?? `Surah ${surahId}`),
  );

  return { tracks, startIndex: 0 };
}
```

- [ ] **Step 3: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add audio URL generation and track creation utilities"
```

---

### Task 3: Reciter Card Component

**Files:**

- Create: `src/components/reciter-card.tsx`
- Test: `src/__tests__/components/reciter-card.test.tsx`

- [ ] **Step 1: Write reciter card test**

Create `src/__tests__/components/reciter-card.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReciterCard } from "@/components/reciter-card";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ReciterCard", () => {
  const mockReciter = {
    id: "r-1",
    name: "Mishary Alafasy",
    slug: "mishary-alafasy",
    image_url: "https://cdn.thebayaan.com/test.jpg",
    is_featured: true,
    rewayat: [
      {
        id: "rw-1",
        reciter_id: "r-1",
        name: "Hafs A'n Assem",
        style: "murattal" as const,
        server: "https://cdn.thebayaan.com/test",
        source_type: "bayaan",
        surah_total: 114,
        surah_list: [],
        mp3quran_read_id: null,
        qdc_reciter_id: null,
      },
    ],
  };

  it("renders reciter name", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByText("Mishary Alafasy")).toBeInTheDocument();
  });

  it("renders reciter image", () => {
    render(<ReciterCard reciter={mockReciter} />);
    const img = screen.getByAltText("Mishary Alafasy");
    expect(img).toBeInTheDocument();
  });

  it("shows rewayat style badge", () => {
    render(<ReciterCard reciter={mockReciter} />);
    expect(screen.getByText(/murattal/i)).toBeInTheDocument();
  });

  it("links to reciter profile", () => {
    render(<ReciterCard reciter={mockReciter} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/reciter/mishary-alafasy");
  });
});
```

- [ ] **Step 2: Implement ReciterCard**

Create `src/components/reciter-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Reciter } from "@/types/reciter";
import { cn } from "@/lib/utils";

interface ReciterCardProps {
  reciter: Reciter;
  className?: string;
}

export function ReciterCard({ reciter, className }: ReciterCardProps) {
  const primaryRewayat = reciter.rewayat[0];
  const surahCount = primaryRewayat?.surah_total ?? 0;
  const style = primaryRewayat?.style ?? "murattal";

  return (
    <Link
      href={`/reciter/${reciter.slug}`}
      className={cn(
        "group block rounded-xl bg-[var(--text-alpha-04)] p-3 transition-colors hover:bg-[var(--text-alpha-06)]",
        className,
      )}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={48}
              height={48}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
          </div>
        )}
      </div>
      <p className="truncate text-sm font-semibold">{reciter.name}</p>
      <p className="text-muted-foreground mt-0.5 text-xs capitalize">
        {style} &middot; {surahCount} Surahs
      </p>
    </Link>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add ReciterCard component"
```

---

### Task 4: Surah List Item Component

**Files:**

- Create: `src/components/surah-list-item.tsx`
- Test: `src/__tests__/components/surah-list-item.test.tsx`

- [ ] **Step 1: Write surah list item test**

Create `src/__tests__/components/surah-list-item.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SurahListItem } from "@/components/surah-list-item";

describe("SurahListItem", () => {
  const mockSurah = {
    id: 1,
    name: "Al-Faatiha",
    name_arabic: "الفاتحة",
    name_simple: "Al-Fatihah",
    revelation_place: "makkah" as const,
    revelation_order: 5,
    bismillah_pre: false,
    verses_count: 7,
    translated_name_english: "The Opening",
  };

  it("renders surah number, name, and translation", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Al-Faatiha")).toBeInTheDocument();
    expect(screen.getByText("The Opening")).toBeInTheDocument();
  });

  it("shows verse count", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} />);
    expect(screen.getByText(/7 verses/i)).toBeInTheDocument();
  });

  it("calls onPlay when play button clicked", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    render(<SurahListItem surah={mockSurah} onPlay={onPlay} />);
    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onPlay).toHaveBeenCalledWith(1);
  });

  it("shows currently playing indicator", () => {
    render(<SurahListItem surah={mockSurah} onPlay={vi.fn()} isPlaying />);
    // When playing, the item should have visual distinction
    const item = screen.getByText("Al-Faatiha").closest("div");
    expect(item?.className).toContain("text-foreground");
  });
});
```

- [ ] **Step 2: Implement SurahListItem**

Create `src/components/surah-list-item.tsx`:

```tsx
"use client";

import { PlayIcon, PauseIcon } from "@/components/icons";
import type { Surah } from "@/types/quran";
import { cn } from "@/lib/utils";

interface SurahListItemProps {
  surah: Surah;
  onPlay: (surahId: number) => void;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
}

export function SurahListItem({ surah, onPlay, isPlaying, isCurrentTrack }: SurahListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--text-alpha-04)]",
        isCurrentTrack && "bg-[var(--text-alpha-06)]",
      )}
    >
      <div className="w-8 shrink-0 text-center">
        {isCurrentTrack && isPlaying ? (
          <div className="flex items-center justify-center gap-0.5">
            <span className="bg-foreground h-3 w-0.5 animate-pulse rounded-full" />
            <span className="bg-foreground h-4 w-0.5 animate-pulse rounded-full delay-75" />
            <span className="bg-foreground h-2 w-0.5 animate-pulse rounded-full delay-150" />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{surah.id}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", isCurrentTrack ? "text-foreground" : "")}>
          {surah.name}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {surah.translated_name_english} &middot; {surah.verses_count} verses
        </p>
      </div>

      <button
        onClick={() => onPlay(surah.id)}
        className="text-muted-foreground hover:text-foreground rounded-full p-2 opacity-0 transition-colors hover:bg-[var(--text-alpha-06)] focus:opacity-100 group-hover:opacity-100"
        aria-label={isPlaying && isCurrentTrack ? "Pause" : `Play ${surah.name}`}
      >
        {isPlaying && isCurrentTrack ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add SurahListItem component with play button"
```

---

### Task 5: Home Page — Featured Reciters

**Files:**

- Modify: `src/app/(app)/page.tsx` (replace placeholder)

- [ ] **Step 1: Install shadcn ScrollArea**

```bash
npx shadcn@latest add scroll-area
```

- [ ] **Step 2: Implement Home page**

Replace `src/app/(app)/page.tsx`:

```tsx
"use client";

import { useReciters } from "@/hooks/use-reciters";
import { ReciterCard } from "@/components/reciter-card";
import type { Reciter } from "@/types/reciter";

function ReciterSection({ title, reciters }: { title: string; reciters: Reciter[] }) {
  if (reciters.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {reciters.map((reciter) => (
          <ReciterCard key={reciter.id} reciter={reciter} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { reciters, featured, isLoading } = useReciters();

  const murattal = reciters.filter((r) => r.rewayat.some((rw) => rw.style === "murattal"));
  const mojawwad = reciters.filter((r) => r.rewayat.some((rw) => rw.style === "mojawwad"));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 rounded bg-[var(--text-alpha-06)]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-lg bg-[var(--text-alpha-06)]" />
                <div className="h-4 w-3/4 rounded bg-[var(--text-alpha-06)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--text-alpha-04)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Good evening</h1>

      <ReciterSection title="Featured Reciters" reciters={featured} />
      <ReciterSection title="All Reciters" reciters={reciters.slice(0, 18)} />
      <ReciterSection title="Murattal" reciters={murattal.slice(0, 12)} />
      {mojawwad.length > 0 && <ReciterSection title="Mojawwad" reciters={mojawwad.slice(0, 12)} />}
    </div>
  );
}
```

- [ ] **Step 3: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build home page with featured reciters grid"
```

---

### Task 6: Reciter Profile Page

**Files:**

- Modify: `src/app/(app)/reciter/[slug]/page.tsx` (replace placeholder)
- Create: `src/components/reciter-header.tsx`

- [ ] **Step 1: Create ReciterHeader**

Create `src/components/reciter-header.tsx`:

```tsx
import Image from "next/image";
import type { Reciter } from "@/types/reciter";

interface ReciterHeaderProps {
  reciter: Reciter;
}

export function ReciterHeader({ reciter }: ReciterHeaderProps) {
  return (
    <div className="flex items-end gap-6 p-6 pb-4">
      <div className="h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-[var(--text-alpha-06)] shadow-lg">
        {reciter.image_url ? (
          <Image
            src={reciter.image_url}
            alt={reciter.name}
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <svg
              width={64}
              height={64}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
          </div>
        )}
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
          Reciter
        </p>
        <h1 className="mb-2 text-4xl font-bold">{reciter.name}</h1>
        {reciter.bio && (
          <p className="text-muted-foreground line-clamp-2 max-w-lg text-sm">{reciter.bio}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {reciter.rewayat.length} rewayat &middot; {reciter.rewayat[0]?.surah_total ?? 0} surahs
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement Reciter Profile page**

Replace `src/app/(app)/reciter/[slug]/page.tsx`:

```tsx
"use client";

import { use, useState, useMemo } from "react";
import { useReciter } from "@/hooks/use-reciter";
import { usePlayerStore } from "@/stores/player-store";
import { ReciterHeader } from "@/components/reciter-header";
import { SurahListItem } from "@/components/surah-list-item";
import { PlayIcon } from "@/components/icons";
import { createQueueFromSurah, createTrack } from "@/lib/audio-utils";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as Surah[];
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

  if (isLoading || !reciter) {
    return (
      <div className="animate-pulse p-6">
        <div className="mb-8 flex items-end gap-6">
          <div className="h-48 w-48 rounded-xl bg-[var(--text-alpha-06)]" />
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-[var(--text-alpha-06)]" />
            <div className="h-10 w-64 rounded bg-[var(--text-alpha-06)]" />
            <div className="h-4 w-40 rounded bg-[var(--text-alpha-04)]" />
          </div>
        </div>
      </div>
    );
  }

  function handlePlaySurah(surahId: number) {
    if (!reciter || !selectedRewayat) return;

    // If tapping the currently playing track, toggle play/pause
    if (
      currentTrack?.reciterId === reciter.id &&
      currentTrack?.surahId === surahId &&
      currentTrack?.rewayatId === selectedRewayat.id
    ) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
      return;
    }

    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, surahId, surahNameMap);
    updateQueue(tracks);
  }

  function handlePlayAll() {
    if (!reciter || !selectedRewayat) return;
    const firstSurah = selectedRewayat.surah_list[0];
    if (firstSurah === undefined) return;
    const { tracks } = createQueueFromSurah(reciter, selectedRewayat, firstSurah, surahNameMap);
    updateQueue(tracks);
  }

  return (
    <div>
      <ReciterHeader reciter={reciter} />

      {/* Rewayat tabs */}
      {reciter.rewayat.length > 1 && (
        <div className="mb-4 flex gap-2 px-6">
          {reciter.rewayat.map((rw, idx) => (
            <button
              key={rw.id}
              onClick={() => setSelectedRewayatIdx(idx)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                idx === selectedRewayatIdx
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground bg-[var(--text-alpha-06)]"
              }`}
            >
              {rw.name}
            </button>
          ))}
        </div>
      )}

      {/* Play All button */}
      <div className="mb-4 flex items-center gap-3 px-6">
        <button
          onClick={handlePlayAll}
          className="bg-foreground text-background flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-transform hover:scale-105"
        >
          <PlayIcon size={16} color="currentColor" />
          Play All
        </button>
      </div>

      {/* Surah list */}
      <div className="px-2">
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build reciter profile page with surah list and playback"
```

---

### Task 7: Search Page

**Files:**

- Modify: `src/app/(app)/search/page.tsx` (replace placeholder)
- Create: `src/components/search/search-input.tsx`

- [ ] **Step 1: Install shadcn Input**

```bash
npx shadcn@latest add input
```

- [ ] **Step 2: Create SearchInput component**

Create `src/components/search/search-input.tsx`:

```tsx
"use client";

import { SearchIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({ value, onChange, className }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        size={18}
        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
      />
      <Input
        type="search"
        placeholder="Search reciters and surahs..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] pl-10"
      />
    </div>
  );
}
```

- [ ] **Step 3: Implement Search page**

Replace `src/app/(app)/search/page.tsx`:

```tsx
"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useReciters } from "@/hooks/use-reciters";
import { SearchInput } from "@/components/search/search-input";
import { ReciterCard } from "@/components/reciter-card";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import type { Reciter } from "@/types/reciter";
import Link from "next/link";

const surahs = surahData as Surah[];

interface SearchResult {
  type: "reciter" | "surah";
  reciter?: Reciter;
  surah?: Surah;
  score: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { reciters, isLoading } = useReciters();

  const reciterFuse = useMemo(
    () =>
      new Fuse(reciters, {
        keys: [
          { name: "name", weight: 2 },
          { name: "name_arabic", weight: 2 },
        ],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [reciters],
  );

  const surahFuse = useMemo(
    () =>
      new Fuse(surahs, {
        keys: [
          { name: "name", weight: 2 },
          { name: "name_arabic", weight: 2 },
          { name: "translated_name_english", weight: 1.5 },
        ],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [],
  );

  const results = useMemo<SearchResult[]>(() => {
    if (query.length < 2) return [];

    const reciterResults = reciterFuse.search(query).map((r) => ({
      type: "reciter" as const,
      reciter: r.item,
      score: r.score ?? 1,
    }));

    const surahResults = surahFuse.search(query).map((r) => ({
      type: "surah" as const,
      surah: r.item,
      score: r.score ?? 1,
    }));

    return [...reciterResults, ...surahResults].sort((a, b) => a.score - b.score);
  }, [query, reciterFuse, surahFuse]);

  const hasQuery = query.length >= 2;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>
      <SearchInput value={query} onChange={setQuery} className="mb-6 max-w-lg" />

      {hasQuery ? (
        <div>
          {results.length === 0 ? (
            <p className="text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <div className="space-y-2">
              {results.map((result) => {
                if (result.type === "reciter" && result.reciter) {
                  return (
                    <Link
                      key={`reciter-${result.reciter.id}`}
                      href={`/reciter/${result.reciter.slug}`}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
                        {result.reciter.image_url && (
                          <img
                            src={result.reciter.image_url}
                            alt={result.reciter.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.reciter.name}</p>
                        <p className="text-muted-foreground text-xs capitalize">
                          Reciter &middot; {result.reciter.rewayat[0]?.style ?? ""}
                        </p>
                      </div>
                    </Link>
                  );
                }
                if (result.type === "surah" && result.surah) {
                  return (
                    <Link
                      key={`surah-${result.surah.id}`}
                      href={`/quran/${result.surah.id}`}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm font-medium">
                        {result.surah.id}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.surah.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {result.surah.translated_name_english} &middot;{" "}
                          {result.surah.verses_count} verses
                        </p>
                      </div>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      ) : (
        /* Explore view when search is empty */
        <div>
          <h2 className="mb-4 text-lg font-bold">Browse</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-[var(--text-alpha-06)]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {reciters.slice(0, 24).map((reciter) => (
                <ReciterCard key={reciter.id} reciter={reciter} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build search page with Fuse.js fuzzy search"
```

---

### Task 8: Surah Page — All Reciters

**Files:**

- Modify: `src/app/(app)/surah/[id]/page.tsx` (replace placeholder)

- [ ] **Step 1: Implement Surah page**

Replace `src/app/(app)/surah/[id]/page.tsx`:

```tsx
"use client";

import { use, useMemo } from "react";
import { useReciters } from "@/hooks/use-reciters";
import { usePlayerStore } from "@/stores/player-store";
import { createTrack } from "@/lib/audio-utils";
import { PlayIcon } from "@/components/icons";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";
import Link from "next/link";

const surahs = surahData as Surah[];

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const surahId = parseInt(id, 10);
  const surah = surahs.find((s) => s.id === surahId);
  const { reciters, isLoading } = useReciters();
  const updateQueue = usePlayerStore((s) => s.updateQueue);

  const availableReciters = useMemo(
    () => reciters.filter((r) => r.rewayat.some((rw) => rw.surah_list.includes(surahId))),
    [reciters, surahId],
  );

  if (!surah) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Surah not found</h1>
      </div>
    );
  }

  function handlePlayReciter(reciterId: string) {
    const reciter = reciters.find((r) => r.id === reciterId);
    if (!reciter || !surah) return;
    const rewayat = reciter.rewayat.find((rw) => rw.surah_list.includes(surahId));
    if (!rewayat) return;
    const track = createTrack(reciter, rewayat, surahId, surah.name);
    updateQueue([track]);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
          Surah {surah.id}
        </p>
        <h1 className="text-4xl font-bold">{surah.name}</h1>
        <p className="text-muted-foreground mt-1">
          {surah.translated_name_english} &middot; {surah.verses_count} verses &middot;{" "}
          {surah.revelation_place}
        </p>
      </div>

      <h2 className="mb-3 text-lg font-bold">Available Reciters ({availableReciters.length})</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {availableReciters.map((reciter) => {
            const rewayat = reciter.rewayat.find((rw) => rw.surah_list.includes(surahId));
            return (
              <div
                key={reciter.id}
                className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--text-alpha-04)]"
              >
                <Link
                  href={`/reciter/${reciter.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--text-alpha-06)]">
                    {reciter.image_url && (
                      <img
                        src={reciter.image_url}
                        alt={reciter.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{reciter.name}</p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {rewayat?.style} &middot; {rewayat?.name}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handlePlayReciter(reciter.id)}
                  className="text-muted-foreground hover:text-foreground rounded-full p-2 opacity-0 transition-colors hover:bg-[var(--text-alpha-06)] focus:opacity-100 group-hover:opacity-100"
                  aria-label={`Play ${reciter.name}`}
                >
                  <PlayIcon size={16} color="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: build surah page showing all available reciters"
```

---

### Task 9: Full Player View + Queue Panel

**Files:**

- Create: `src/components/player/full-player-view.tsx`, `src/components/player/queue-panel.tsx`
- Modify: `src/components/player/bottom-player-bar.tsx` (add expand click)

- [ ] **Step 1: Install shadcn Sheet**

```bash
npx shadcn@latest add sheet dialog
```

- [ ] **Step 2: Create FullPlayerView**

Create `src/components/player/full-player-view.tsx`:

```tsx
"use client";

import Image from "next/image";
import { usePlayerStore } from "@/stores/player-store";
import { PlayerControls } from "./player-controls";
import { ProgressBar } from "./progress-bar";
import { audioService } from "@/services/audio/audio-service";
import type { RepeatMode } from "@/types/audio";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface FullPlayerViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullPlayerView({ open, onOpenChange }: FullPlayerViewProps) {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const playback = usePlayerStore((s) => s.playback);
  const settings = usePlayerStore((s) => s.settings);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const skipToNext = usePlayerStore((s) => s.skipToNext);
  const skipToPrevious = usePlayerStore((s) => s.skipToPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const setRate = usePlayerStore((s) => s.setRate);

  const currentTrack = tracks[currentIndex];

  if (!currentTrack) return null;

  const handlePlayPause = () => {
    if (playback.isPlaying) pause();
    else play();
  };

  const cycleRepeat = () => {
    const modes: RepeatMode[] = ["none", "queue", "track"];
    const idx = modes.indexOf(settings.repeatMode);
    setRepeatMode(modes[(idx + 1) % modes.length]!);
  };

  const cycleRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const idx = rates.indexOf(settings.rate);
    const nextRate = rates[(idx + 1) % rates.length]!;
    setRate(nextRate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-md overflow-hidden p-0">
        <DialogTitle className="sr-only">Now Playing</DialogTitle>
        <div className="flex flex-col items-center gap-6 p-8">
          {/* Artwork */}
          <div className="h-64 w-64 overflow-hidden rounded-2xl bg-[var(--text-alpha-06)] shadow-2xl">
            {currentTrack.artwork ? (
              <Image
                src={currentTrack.artwork}
                alt={currentTrack.title}
                width={256}
                height={256}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                <svg
                  width={64}
                  height={64}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 10-16 0" />
                </svg>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="w-full text-center">
            <h2 className="truncate text-xl font-bold">{currentTrack.title}</h2>
            <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>

          {/* Progress */}
          <div className="w-full">
            <ProgressBar
              positionMs={playback.positionMs}
              durationMs={playback.durationMs}
              onSeek={seekTo}
            />
          </div>

          {/* Controls */}
          <PlayerControls
            isPlaying={playback.isPlaying}
            onPlayPause={handlePlayPause}
            onNext={skipToNext}
            onPrevious={skipToPrevious}
            repeatMode={settings.repeatMode}
            onRepeatChange={cycleRepeat}
            shuffle={settings.shuffle}
            onShuffleToggle={toggleShuffle}
          />

          {/* Rate control */}
          <button
            onClick={cycleRate}
            className="text-muted-foreground hover:text-foreground rounded-full bg-[var(--text-alpha-06)] px-3 py-1 text-xs transition-colors"
          >
            {settings.rate}x
          </button>

          {/* Queue info */}
          <p className="text-muted-foreground text-xs">
            Track {currentIndex + 1} of {tracks.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create QueuePanel**

Create `src/components/player/queue-panel.tsx`:

```tsx
"use client";

import { usePlayerStore } from "@/stores/player-store";
import { PlayIcon } from "@/components/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface QueuePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueuePanel({ open, onOpenChange }: QueuePanelProps) {
  const tracks = usePlayerStore((s) => s.queue.tracks);
  const currentIndex = usePlayerStore((s) => s.queue.currentIndex);
  const isPlaying = usePlayerStore((s) => s.playback.isPlaying);
  const updateQueue = usePlayerStore((s) => s.updateQueue);

  const upcomingTracks = tracks.slice(currentIndex + 1);
  const currentTrack = tracks[currentIndex];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background border-border w-[380px] p-0">
        <SheetHeader className="border-border border-b p-4">
          <SheetTitle>Queue</SheetTitle>
        </SheetHeader>

        <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Now Playing */}
          {currentTrack && (
            <div className="p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                Now Playing
              </p>
              <div className="flex items-center gap-3 rounded-lg bg-[var(--text-alpha-06)] p-2">
                <div className="flex w-6 items-center justify-center gap-0.5">
                  {isPlaying ? (
                    <>
                      <span className="bg-foreground h-3 w-0.5 animate-pulse rounded-full" />
                      <span className="bg-foreground h-4 w-0.5 animate-pulse rounded-full" />
                      <span className="bg-foreground h-2 w-0.5 animate-pulse rounded-full" />
                    </>
                  ) : (
                    <PlayIcon size={12} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{currentTrack.title}</p>
                  <p className="text-muted-foreground truncate text-xs">{currentTrack.artist}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingTracks.length > 0 && (
            <div className="p-4 pt-0">
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                Next Up ({upcomingTracks.length})
              </p>
              <div className="space-y-1">
                {upcomingTracks.map((track, idx) => (
                  <button
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      updateQueue(tracks, currentIndex + 1 + idx);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-[var(--text-alpha-04)]"
                  >
                    <span className="text-muted-foreground w-6 text-center text-xs">{idx + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm">{track.title}</p>
                      <p className="text-muted-foreground truncate text-xs">{track.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tracks.length === 0 && (
            <div className="text-muted-foreground p-8 text-center">
              <p>Queue is empty</p>
              <p className="mt-1 text-xs">Select a reciter and surah to start listening</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Add expand click and queue toggle to BottomPlayerBar**

Update `src/components/player/bottom-player-bar.tsx` to add state for full player and queue panel:

Add these imports at the top:

```tsx
import { useState } from "react";
import { FullPlayerView } from "./full-player-view";
import { QueuePanel } from "./queue-panel";
```

Add state inside the component (after the store selectors):

```tsx
const [showFullPlayer, setShowFullPlayer] = useState(false);
const [showQueue, setShowQueue] = useState(false);
```

Wrap the track info section (left part) with a click handler:

```tsx
<button
  onClick={() => setShowFullPlayer(true)}
  className="flex w-[240px] min-w-0 items-center gap-3 text-left"
>
  {/* existing track info content */}
</button>
```

Add a queue toggle button in the right section (before VolumeControl):

```tsx
<button
  onClick={() => setShowQueue(!showQueue)}
  className="text-muted-foreground hover:text-foreground p-2 transition-colors"
  aria-label="Toggle queue"
>
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
</button>
```

Render the dialogs at the end of the component (before closing `</footer>`):

```tsx
<FullPlayerView open={showFullPlayer} onOpenChange={setShowFullPlayer} />
<QueuePanel open={showQueue} onOpenChange={setShowQueue} />
```

- [ ] **Step 5: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add full player view and queue panel"
```

---

## Completion Criteria

After completing all 9 tasks:

1. `npm run dev` starts without errors
2. Home page shows featured reciters in a responsive grid, fetched from Bayaan API
3. Clicking a reciter card navigates to the reciter profile
4. Reciter profile shows header, rewayat tabs, surah list with play buttons
5. Clicking a surah starts playback — audio plays through the bottom bar
6. Search page finds reciters and surahs via Fuse.js fuzzy search
7. Surah page shows all available reciters with play buttons
8. Clicking track info in bottom bar opens full player view
9. Queue panel shows current track and upcoming tracks
10. `npx tsc --noEmit` passes with zero errors
11. `npm test` passes with all tests green
