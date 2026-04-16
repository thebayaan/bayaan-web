# Bayaan Web — Plan 6: Collection & User Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Collection hub page with playlists, favorites, bookmarks, and notes — all calling the Bayaan API user endpoints built in Plan 5.

**Architecture:** SWR hooks call the Bayaan API proxy (`/api/bayaan/user/*`) for user data. Each collection section is its own page under `/collection/*`. Playlists support create/edit/delete with drag-to-reorder via dnd-kit. All pages show empty states when no data. Auth is not yet integrated (Plan 8) — these pages will work once Clerk is wired in; for now they render the UI structure.

**Tech Stack:** SWR, shadcn/ui (Dialog, DropdownMenu), dnd-kit

**Depends on:** Plans 1-5 completed

---

## File Structure (Plan 6)

```
src/
├── hooks/
│   ├── use-bookmarks.ts
│   ├── use-favorites.ts
│   ├── use-playlists.ts
│   └── use-notes.ts
├── components/
│   └── collection/
│       ├── collection-hub.tsx         # Hub page with section links
│       ├── playlist-card.tsx          # Playlist card for the grid
│       ├── bookmark-list.tsx          # Bookmark list with verse keys
│       ├── note-list.tsx              # Notes with content preview
│       └── create-playlist-dialog.tsx # Create/edit playlist dialog
├── app/(app)/
│   ├── collection/page.tsx            # Hub (REPLACE)
│   ├── collection/playlists/page.tsx  # (REPLACE)
│   ├── collection/playlists/[id]/page.tsx # (REPLACE)
│   ├── collection/favorites/page.tsx  # (REPLACE)
│   ├── collection/bookmarks/page.tsx  # (REPLACE)
│   └── collection/notes/page.tsx      # (REPLACE)
└── __tests__/
    └── components/collection/
        └── collection-hub.test.tsx
```

---

### Task 1: Collection Data Hooks

**Files:**

- Create: `src/hooks/use-bookmarks.ts`, `src/hooks/use-favorites.ts`, `src/hooks/use-playlists.ts`, `src/hooks/use-notes.ts`

- [ ] **Step 1: Create all 4 hooks**

Create `src/hooks/use-bookmarks.ts`:

```typescript
import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { VerseBookmark } from "@/types/quran";

interface BookmarksResponse {
  data: VerseBookmark[];
}

export function useBookmarks() {
  const { data, error, isLoading, mutate } = useSWR<BookmarksResponse>(
    "user/bookmarks",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { bookmarks: data?.data ?? [], isLoading, error, mutate };
}
```

Create `src/hooks/use-favorites.ts`:

```typescript
import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";

interface Favorite {
  id: string;
  reciter_id: string;
  rewayat_id: string;
  surah_id: number;
  created_at: string;
}
interface FavoritesResponse {
  data: Favorite[];
}

interface FavoriteReciter {
  id: string;
  reciter_id: string;
  created_at: string;
}
interface FavoriteRecitersResponse {
  data: FavoriteReciter[];
}

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(
    "user/favorites",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { favorites: data?.data ?? [], isLoading, error, mutate };
}

export function useFavoriteReciters() {
  const { data, error, isLoading, mutate } = useSWR<FavoriteRecitersResponse>(
    "user/favorite-reciters",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { favoriteReciters: data?.data ?? [], isLoading, error, mutate };
}
```

Create `src/hooks/use-playlists.ts`:

```typescript
import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
interface PlaylistsResponse {
  data: Playlist[];
}

export function usePlaylists() {
  const { data, error, isLoading, mutate } = useSWR<PlaylistsResponse>(
    "user/playlists",
    fetchBayaan,
    { revalidateOnFocus: false },
  );
  return { playlists: data?.data ?? [], isLoading, error, mutate };
}
```

Create `src/hooks/use-notes.ts`:

```typescript
import useSWR from "swr";
import { fetchBayaan } from "@/lib/api";
import type { VerseNote } from "@/types/quran";

interface NotesResponse {
  data: VerseNote[];
}

export function useNotes() {
  const { data, error, isLoading, mutate } = useSWR<NotesResponse>("user/notes", fetchBayaan, {
    revalidateOnFocus: false,
  });
  return { notes: data?.data ?? [], isLoading, error, mutate };
}
```

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add collection data hooks for bookmarks, favorites, playlists, notes"
```

---

### Task 2: Collection Hub Page

**Files:**

- Create: `src/components/collection/collection-hub.tsx`
- Modify: `src/app/(app)/collection/page.tsx`
- Test: `src/__tests__/components/collection/collection-hub.test.tsx`

- [ ] **Step 1: Create CollectionHub component**

Create `src/components/collection/collection-hub.tsx`:

```tsx
"use client";

import Link from "next/link";
import { HeartIcon, QuranIcon, PlayIcon } from "@/components/icons";

const SECTIONS = [
  {
    href: "/collection/playlists",
    label: "Playlists",
    description: "Your custom playlists",
    icon: PlayIcon,
  },
  {
    href: "/collection/favorites",
    label: "Favorites",
    description: "Favorited tracks",
    icon: HeartIcon,
  },
  {
    href: "/collection/bookmarks",
    label: "Bookmarks",
    description: "Saved verses",
    icon: QuranIcon,
  },
  { href: "/collection/notes", label: "Notes", description: "Verse annotations", icon: QuranIcon },
] as const;

export function CollectionHub() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Collection</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--text-alpha-06)]">
              <Icon size={24} />
            </div>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write test**

Create `src/__tests__/components/collection/collection-hub.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CollectionHub } from "@/components/collection/collection-hub";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("CollectionHub", () => {
  it("renders all 4 collection sections", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Playlists")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("links to correct paths", () => {
    render(<CollectionHub />);
    expect(screen.getByText("Playlists").closest("a")).toHaveAttribute(
      "href",
      "/collection/playlists",
    );
    expect(screen.getByText("Bookmarks").closest("a")).toHaveAttribute(
      "href",
      "/collection/bookmarks",
    );
  });
});
```

- [ ] **Step 3: Replace collection page**

Replace `src/app/(app)/collection/page.tsx`:

```tsx
import { CollectionHub } from "@/components/collection/collection-hub";
export default function CollectionPage() {
  return <CollectionHub />;
}
```

- [ ] **Step 4: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build collection hub page with section links"
```

---

### Task 3: Collection Sub-Pages (Playlists, Favorites, Bookmarks, Notes)

**Files:**

- Modify: `src/app/(app)/collection/playlists/page.tsx`
- Modify: `src/app/(app)/collection/playlists/[id]/page.tsx`
- Modify: `src/app/(app)/collection/favorites/page.tsx`
- Modify: `src/app/(app)/collection/bookmarks/page.tsx`
- Modify: `src/app/(app)/collection/notes/page.tsx`

- [ ] **Step 1: Build playlists page**

Replace `src/app/(app)/collection/playlists/page.tsx`:

```tsx
"use client";

import { usePlaylists } from "@/hooks/use-playlists";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";

export default function PlaylistsPage() {
  const { playlists, isLoading } = usePlaylists();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Playlists</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-12 text-center">
          <PlayIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No playlists yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a playlist to organize your favorite recitations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/collection/playlists/${playlist.id}`}
              className="rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <p className="font-semibold">{playlist.name}</p>
              {playlist.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {playlist.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build playlist detail page**

Replace `src/app/(app)/collection/playlists/[id]/page.tsx`:

```tsx
"use client";

import { use } from "react";

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Playlist</h1>
      <p className="text-muted-foreground">
        Playlist {id} — tracks will load once authentication is connected.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Build favorites page**

Replace `src/app/(app)/collection/favorites/page.tsx`:

```tsx
"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { HeartIcon } from "@/components/icons";

export default function FavoritesPage() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Favorites</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-12 text-center">
          <HeartIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No favorites yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Heart a track while listening to add it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center gap-3 rounded-lg bg-[var(--text-alpha-04)] p-3"
            >
              <p className="text-sm">Surah {fav.surah_id}</p>
              <p className="text-muted-foreground text-xs">
                Reciter {fav.reciter_id.slice(0, 8)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Build bookmarks page**

Replace `src/app/(app)/collection/bookmarks/page.tsx`:

```tsx
"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { QuranIcon } from "@/components/icons";
import Link from "next/link";

export default function BookmarksPage() {
  const { bookmarks, isLoading } = useBookmarks();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Bookmarks</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-12 text-center">
          <QuranIcon size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bookmarks yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Bookmark verses while reading the Quran
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bm) => (
            <Link
              key={bm.id}
              href={`/quran/${bm.surah_number}`}
              className="flex items-center justify-between rounded-lg bg-[var(--text-alpha-04)] p-3 transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <div>
                <p className="text-sm font-medium">{bm.verse_key}</p>
                {bm.note && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{bm.note}</p>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {new Date(bm.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Build notes page**

Replace `src/app/(app)/collection/notes/page.tsx`:

```tsx
"use client";

import { useNotes } from "@/hooks/use-notes";
import Link from "next/link";

export default function NotesPage() {
  const { notes, isLoading } = useNotes();

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Notes</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--text-alpha-06)]" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No notes yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add notes to verses while reading the Quran
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/quran/${note.verse_key.split(":")[0]}`}
              className="block rounded-lg bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium">{note.verse_key}</p>
                <span className="text-muted-foreground text-xs">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 text-sm">{note.content}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build collection sub-pages — playlists, favorites, bookmarks, notes"
```

---

## Completion Criteria

1. `/collection` shows hub with 4 section cards
2. Each sub-page shows loading skeleton, empty state, or data list
3. Bookmarks and notes link to the corresponding surah reading view
4. All tests pass, TypeScript clean
