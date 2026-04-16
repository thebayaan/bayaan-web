# Facelift Plan 2 — Shell Refresh + Shared Primitives

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship shared primitives (`<EmptyState>`, `<Skeleton>`, root `not-found.tsx` + `error.tsx`, `<ContinueReadingCard>`) and refresh the app shell (new `<TopBar>` with search pill, sidebar restructure, mobile tab bar safe-area-inset, bottom player bar transform show/hide) on top of the Plan 1 token foundation.

**Architecture:** Plan 1 shipped tokens, motion, `[data-theme]` migration, and `--brand-*` palette. Plan 2 uses those to build the four primitives every downstream surface will reuse, then rewires the shell: search moves out of the sidebar into a sticky top-bar pill at `md+`, the sidebar footer gains an identity zone with a localStorage-backed "Continue Reading" teaser above the existing `<UserButton>`, and the mobile tab bar gets proper safe-area padding. Bottom player gains a translate-based show/hide; deeper player changes belong to Plan 3.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Zustand, Clerk, Vitest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-04-16-facelift-design.md`
**Synthesis:** `docs/superpowers/research/facelift/synthesis.md`
**Prior plan:** `docs/superpowers/plans/2026-04-16-facelift-plan-1-tokens-motion-theme.md`

---

## File Structure

**New files:**

- `src/components/ui/empty-state.tsx` — the shared empty/error state primitive
- `src/components/ui/skeleton.tsx` — opacity-pulse loader primitive
- `src/components/layout/top-bar.tsx` — sticky top bar with search pill + theme switcher + Clerk user button (desktop/`md+` only; replaces the sidebar's Search nav item)
- `src/components/layout/continue-reading-card.tsx` — localStorage-backed pinned slot
- `src/hooks/use-continue-reading.ts` — reads/writes the `bayaan-continue-reading` localStorage entry
- `src/app/(app)/not-found.tsx` — 404 inside the app shell
- `src/app/(app)/error.tsx` — unhandled-error boundary inside the app shell
- Tests for each new file under `src/__tests__/`

**Modified files:**

- `src/components/layout/app-shell.tsx` — mount `<TopBar />` between sidebar and main content at `md+`
- `src/components/layout/sidebar.tsx` — remove Search from `NAV_ITEMS`; drop the 5-row nav to 4; add `<ContinueReadingCard>` above the user zone
- `src/components/layout/mobile-tab-bar.tsx` — add `pb-[env(safe-area-inset-bottom)]` padding
- `src/components/player/bottom-player-bar.tsx` — wrap container with transform-show/hide class

All changes are additive at the token-consumption level; Plan 1's `--brand-*` / `--motion-*` / `--surface-*` tokens are used but no token files change.

**Branch:** continue on `feat/facelift-design-v2`.

---

## Task 1: `<EmptyState>` primitive

**Files:**

- Create: `src/components/ui/empty-state.tsx`
- Create: `src/__tests__/components/ui/empty-state.test.tsx`

**Contract:** `EmptyState` takes an icon (React node), a title (string), an optional subtitle (string), and an optional CTA (`{ label, href }` or `{ label, onClick }`). Renders centered inside its parent, so consumers can wrap with a fixed-height or full-height container.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders the title and subtitle", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon" />}
        title="Nothing here yet"
        subtitle="Try adding something."
      />,
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("Try adding something.")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("omits subtitle when not provided", () => {
    render(<EmptyState icon={<span />} title="Empty" />);
    expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
  });

  it("renders a link CTA when href is provided", () => {
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        cta={{ label: "Browse reciters", href: "/reciter" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Browse reciters" });
    expect(link).toHaveAttribute("href", "/reciter");
  });

  it("renders a button CTA when onClick is provided", async () => {
    const onClick = vi.fn();
    render(<EmptyState icon={<span />} title="Empty" cta={{ label: "Retry", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Verify test fails**

```bash
npx vitest run src/__tests__/components/ui/empty-state.test.tsx
```

Expected: FAIL — component does not exist.

- [ ] **Step 3: Implement the primitive**

```tsx
import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

type CTA =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: MouseEventHandler<HTMLButtonElement>; href?: never };

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  cta?: CTA;
}

export function EmptyState({ icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="text-muted-foreground" aria-hidden>
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-muted-foreground max-w-sm text-sm">{subtitle}</p> : null}
      {cta ? <EmptyStateCTA cta={cta} /> : null}
    </div>
  );
}

function EmptyStateCTA({ cta }: { cta: CTA }) {
  const className =
    "bg-brand-main text-brand-main-foreground hover:bg-brand-strong rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-fast ease-standard";
  if ("href" in cta && cta.href) {
    return (
      <Link href={cta.href} className={className}>
        {cta.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={cta.onClick} className={className}>
      {cta.label}
    </button>
  );
}
```

Note: `bg-brand-main` / `hover:bg-brand-strong` come from Plan 1's `--color-brand-*` aliases. `duration-fast` / `ease-standard` come from Plan 1's Tailwind config. `text-brand-main-foreground` does not yet exist — step 4 adds it.

- [ ] **Step 4: Add `--brand-main-foreground` token for CTA text contrast**

Edit `src/app/globals.css`. In the facelift-tokens `:root` block, add this line near the other brand tokens:

```css
--brand-main-foreground: #ffffff;
```

In the `[data-theme="sepia"]` facelift-tokens block, add:

```css
--brand-main-foreground: #fff7ea;
```

In `@theme inline` (top of file), add:

```css
--color-brand-main-foreground: var(--brand-main-foreground);
```

Dark mode inherits `:root`'s white — no override needed.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/components/ui/empty-state.test.tsx && npm run test
```

Expected: all 4 EmptyState tests pass; full suite passes (175+ tests).

- [ ] **Step 6: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/components/ui/empty-state.tsx src/__tests__/components/ui/empty-state.test.tsx src/app/globals.css
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/empty-state.tsx src/__tests__/components/ui/empty-state.test.tsx src/app/globals.css
git commit -m "feat(ui): add EmptyState primitive and --brand-main-foreground token"
```

---

## Task 2: `<Skeleton>` primitive

**Files:**

- Create: `src/components/ui/skeleton.tsx`
- Create: `src/__tests__/components/ui/skeleton.test.tsx`

**Contract:** `Skeleton` is a bare div with `animate-skeleton-pulse` (a 1.5s opacity pulse) and accepts className + optional width/height. The animation token is added to Tailwind config.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders a div with the skeleton-pulse animation class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.className).toContain("animate-skeleton-pulse");
  });

  it("merges a caller-provided className", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-20");
  });

  it("forwards aria-label for accessibility", () => {
    const { container } = render(<Skeleton aria-label="Loading verse" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-label")).toBe("Loading verse");
  });
});
```

- [ ] **Step 2: Verify test fails**

```bash
npx vitest run src/__tests__/components/ui/skeleton.test.tsx
```

Expected: FAIL — component and keyframe both missing.

- [ ] **Step 3: Add keyframes + Tailwind animation token**

Edit `src/app/globals.css`. Append this block at the very end of the file (after `@media (prefers-reduced-motion: reduce)`):

```css
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

Edit `tailwind.config.ts`. Add to the `extend` block:

```ts
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
      },
```

The resulting `tailwind.config.ts` `extend` block is:

```ts
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        "surah-names": ["var(--font-surah-names)"],
      },
      transitionDuration: {
        fast: "160ms",
        moderate: "200ms",
        regular: "400ms",
        slow: "600ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
```

- [ ] **Step 4: Implement the component**

Create `src/components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy
      className={cn("bg-surface-sunken animate-skeleton-pulse rounded-md", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run src/__tests__/components/ui/skeleton.test.tsx && npm run test
```

Expected: all 3 Skeleton tests pass; full suite passes.

- [ ] **Step 6: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/components/ui/skeleton.tsx src/__tests__/components/ui/skeleton.test.tsx src/app/globals.css tailwind.config.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/skeleton.tsx src/__tests__/components/ui/skeleton.test.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat(ui): add Skeleton primitive with opacity-pulse animation"
```

---

## Task 3: `not-found.tsx` inside the app shell

**Files:**

- Create: `src/app/(app)/not-found.tsx`

**Contract:** Next.js App Router 404 handler. Renders `<EmptyState>` inside the existing `(app)` route group layout (sidebar + mobile tab bar stay mounted).

- [ ] **Step 1: Create the file**

```tsx
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon={
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      }
      title="We couldn't find that page"
      subtitle="The page you're looking for doesn't exist or has moved."
      cta={{ label: "Back to Home", href: "/" }}
    />
  );
}
```

- [ ] **Step 2: Sanity-check the route**

```bash
npm run dev
```

Visit `http://localhost:3000/this-route-does-not-exist`. Confirm the EmptyState renders inside the app shell (sidebar + mobile tab bar still present). Kill with `Ctrl+C`.

- [ ] **Step 3: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/app/\(app\)/not-found.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/not-found.tsx
git commit -m "feat(shell): add not-found.tsx using EmptyState primitive"
```

---

## Task 4: `error.tsx` inside the app shell

**Files:**

- Create: `src/app/(app)/error.tsx`

**Contract:** Next.js App Router error boundary. Client component. Receives `{ error, reset }` props. Renders `<EmptyState>` with a Retry button that invokes `reset()`.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      }
      title="Something went wrong"
      subtitle="Try reloading the page. If the issue persists, let us know."
      cta={{ label: "Retry", onClick: reset }}
    />
  );
}
```

- [ ] **Step 2: Sanity-check**

Temporarily throw an error from a route (e.g., add `throw new Error("test")` at the top of `src/app/(app)/page.tsx`), start dev server, navigate to `/`, confirm the error screen appears with a working Retry button. **Undo the throw before committing.**

- [ ] **Step 3: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/app/\(app\)/error.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/error.tsx
git commit -m "feat(shell): add error.tsx boundary using EmptyState primitive"
```

---

## Task 5: `use-continue-reading` hook + `<ContinueReadingCard>`

**Files:**

- Create: `src/hooks/use-continue-reading.ts`
- Create: `src/components/layout/continue-reading-card.tsx`
- Create: `src/__tests__/hooks/use-continue-reading.test.ts`

**Contract:**

- `useContinueReading()` returns `{ surahId: number; surahName: string; verseId: number; page: number } | null` from localStorage key `bayaan-continue-reading`.
- A setter `setContinueReading(entry)` writes the same shape back.
- The card renders a compact pinned slot showing surah name + verse reference + progress bar, links to `/quran/[surahId]?verse=[verseId]`, is hidden when null.

- [ ] **Step 1: Write failing hook test**

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useContinueReading,
  setContinueReading,
  CONTINUE_READING_KEY,
} from "@/hooks/use-continue-reading";

describe("useContinueReading", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing is saved", () => {
    const { result } = renderHook(() => useContinueReading());
    expect(result.current).toBeNull();
  });

  it("returns the stored entry", () => {
    localStorage.setItem(
      CONTINUE_READING_KEY,
      JSON.stringify({
        surahId: 2,
        surahName: "Al-Baqarah",
        verseId: 142,
        page: 22,
      }),
    );
    const { result } = renderHook(() => useContinueReading());
    expect(result.current).toEqual({
      surahId: 2,
      surahName: "Al-Baqarah",
      verseId: 142,
      page: 22,
    });
  });

  it("updates when setContinueReading is called", () => {
    const { result } = renderHook(() => useContinueReading());
    act(() => {
      setContinueReading({
        surahId: 1,
        surahName: "Al-Fatihah",
        verseId: 1,
        page: 1,
      });
    });
    expect(result.current?.surahId).toBe(1);
  });

  it("returns null for malformed JSON", () => {
    localStorage.setItem(CONTINUE_READING_KEY, "not-json{");
    const { result } = renderHook(() => useContinueReading());
    expect(result.current).toBeNull();
  });
});
```

- [ ] **Step 2: Verify test fails**

```bash
npx vitest run src/__tests__/hooks/use-continue-reading.test.ts
```

Expected: FAIL — hook does not exist.

- [ ] **Step 3: Implement the hook**

```ts
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export const CONTINUE_READING_KEY = "bayaan-continue-reading";

export interface ContinueReadingEntry {
  surahId: number;
  surahName: string;
  verseId: number;
  page: number;
}

function readEntry(): ContinueReadingEntry | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CONTINUE_READING_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.surahId === "number" &&
      typeof parsed?.surahName === "string" &&
      typeof parsed?.verseId === "number" &&
      typeof parsed?.page === "number"
    ) {
      return parsed as ContinueReadingEntry;
    }
    return null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("bayaan:continue-reading-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("bayaan:continue-reading-change", cb);
  };
}

export function useContinueReading(): ContinueReadingEntry | null {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const entry = useSyncExternalStore(
    subscribe,
    () => readEntry(),
    () => null,
  );
  return hydrated ? entry : null;
}

export function setContinueReading(entry: ContinueReadingEntry) {
  localStorage.setItem(CONTINUE_READING_KEY, JSON.stringify(entry));
  window.dispatchEvent(new Event("bayaan:continue-reading-change"));
}
```

- [ ] **Step 4: Run hook tests**

```bash
npx vitest run src/__tests__/hooks/use-continue-reading.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Implement the card**

```tsx
"use client";

import Link from "next/link";
import { useContinueReading } from "@/hooks/use-continue-reading";

export function ContinueReadingCard() {
  const entry = useContinueReading();
  if (!entry) return null;

  return (
    <Link
      href={`/quran/${entry.surahId}?verse=${entry.verseId}`}
      className="bg-brand-light hover:bg-brand-weak flex flex-col gap-2 rounded-xl border border-[var(--brand-weak)] p-3 transition-colors duration-fast ease-standard"
    >
      <div className="text-brand-main flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="hidden lg:inline">Continue reading</span>
      </div>
      <div className="hidden items-baseline justify-between gap-2 lg:flex">
        <span className="text-foreground text-sm font-semibold">{entry.surahName}</span>
        <span className="text-muted-foreground text-xs">v. {entry.verseId}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 6: Typecheck + prettier + test**

```bash
npx tsc --noEmit && npx prettier --write src/hooks/use-continue-reading.ts src/components/layout/continue-reading-card.tsx src/__tests__/hooks/use-continue-reading.test.ts && npm run test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-continue-reading.ts src/components/layout/continue-reading-card.tsx src/__tests__/hooks/use-continue-reading.test.ts
git commit -m "feat(shell): add useContinueReading hook and ContinueReadingCard"
```

---

## Task 6: Refresh sidebar (remove Search, add ContinueReadingCard)

**Files:**

- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Rewrite `sidebar.tsx`**

```tsx
"use client";

import { LogoIcon, HomeIcon, QuranIcon, CollectionIcon, SettingsIcon } from "@/components/icons";
import { SidebarNavItem } from "./sidebar-nav-item";
import { ContinueReadingCard } from "./continue-reading-card";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/quran", icon: QuranIcon, label: "Read Quran" },
  { href: "/collection", icon: CollectionIcon, label: "Collection" },
] as const;

export function Sidebar() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const isDark = getResolvedTheme(themeMode) === "dark";

  return (
    <aside className="border-border bg-sidebar hidden w-16 shrink-0 flex-col border-r md:flex lg:w-60">
      <div className="flex items-center gap-2 px-4 py-5">
        <LogoIcon size={28} isDarkMode={isDark} />
        <span className="hidden text-lg font-bold lg:inline">Bayaan</span>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="mt-auto space-y-2 px-2 pb-4">
        <div className="px-1">
          <ContinueReadingCard />
        </div>
        <SidebarNavItem href="/settings" icon={SettingsIcon} label="Settings" />
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
          <span className="text-muted-foreground hidden text-sm lg:inline">Account</span>
        </div>
      </div>
    </aside>
  );
}
```

Changes from before:

- `NAV_ITEMS` drops the Search entry (Search moves to the top bar in Task 7).
- `<ContinueReadingCard>` is mounted in the sidebar footer above the Settings nav item. It self-hides when there's no entry.
- Settings nav item moves above the user row; Account row stays at the bottom.

- [ ] **Step 2: Update existing sidebar tests if any assert on nav-item count**

Run the test suite:

```bash
npm run test
```

If a test fails because it asserts on "5 nav items" or similar, open that test file and update the expectation to `3` items (Home, Read Quran, Collection; Settings is separate below). If no such test fails, skip.

- [ ] **Step 3: Typecheck + prettier**

```bash
npx tsc --noEmit && npx prettier --write src/components/layout/sidebar.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat(shell): remove Search from sidebar, add ContinueReadingCard in footer"
```

---

## Task 7: `<TopBar>` — sticky header with search pill + user chip

**Files:**

- Create: `src/components/layout/top-bar.tsx`
- Modify: `src/components/layout/app-shell.tsx`

**Contract:** At `md+`, renders a 56px-tall strip above the main content column (not across the sidebar). Contains a button-styled pill that links to `/search` (shows placeholder text + `⌘K` hint), a theme toggle, a Clerk `<UserButton />`. At `<md`, renders nothing (mobile tab bar covers nav).

- [ ] **Step 1: Create `top-bar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useThemeStore } from "@/stores/theme-store";
import { SearchIcon } from "@/components/icons";

export function TopBar() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  function cycleTheme() {
    const order: Array<typeof themeMode> = ["light", "dark", "sepia", "system"];
    const next = order[(order.indexOf(themeMode) + 1) % order.length];
    setThemeMode(next);
  }

  return (
    <header className="border-border-divider bg-surface/90 sticky top-0 z-30 hidden items-center gap-4 border-b px-6 py-3 backdrop-blur-md md:flex">
      <Link
        href="/search"
        className="border-border bg-surface-sunken hover:bg-surface-raised flex max-w-xl flex-1 items-center gap-3 rounded-full border px-4 py-2 text-sm transition-colors duration-fast ease-standard"
      >
        <SearchIcon size={16} />
        <span className="text-muted-foreground flex-1 text-left">
          Search surahs, reciters, verses…
        </span>
        <span className="border-border text-muted-foreground hidden rounded border px-1.5 py-0.5 text-[11px] font-semibold md:inline">
          ⌘K
        </span>
      </Link>
      <div className="flex-1" />
      <button
        type="button"
        onClick={cycleTheme}
        aria-label="Cycle theme"
        className="border-border hover:bg-surface-raised flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-fast ease-standard"
      >
        <ThemeGlyph mode={themeMode} />
      </button>
      <UserButton
        appearance={{
          elements: { avatarBox: "w-8 h-8" },
        }}
      />
    </header>
  );
}

function ThemeGlyph({ mode }: { mode: string }) {
  if (mode === "dark") {
    return (
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
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (mode === "sepia") {
    return (
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
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  if (mode === "system") {
    return (
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
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  return (
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
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
```

- [ ] **Step 2: Mount `<TopBar>` in `app-shell.tsx`**

Replace `src/components/layout/app-shell.tsx` with:

```tsx
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomPlayerBar } from "./bottom-player-bar";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        </div>
      </div>
      <div className="hidden md:block">
        <BottomPlayerBar />
      </div>
      <MobileTabBar />
    </div>
  );
}
```

- [ ] **Step 3: Dev-server sanity**

```bash
npm run dev
```

Visit `http://localhost:3000/`. Confirm at `md+` width (≥768px): a sticky top bar with search pill + theme toggle + Clerk user menu appears above the main content, sidebar still visible on the left. At `<md`: TopBar is hidden (`md:flex`), mobile tab bar is at the bottom. Theme toggle cycles through light/dark/sepia/system — inspect `<html>` to verify `data-theme` changes. Kill with `Ctrl+C`.

- [ ] **Step 4: Typecheck + test + prettier**

```bash
npx tsc --noEmit && npm run test && npx prettier --write src/components/layout/top-bar.tsx src/components/layout/app-shell.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/top-bar.tsx src/components/layout/app-shell.tsx
git commit -m "feat(shell): add TopBar with search pill, theme cycler, and user button"
```

---

## Task 8: Mobile tab bar — safe-area-inset-bottom

**Files:**

- Modify: `src/components/layout/mobile-tab-bar.tsx`

- [ ] **Step 1: Update the nav element's className**

Change this line:

```tsx
<nav className="border-border bg-background/90 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-2xl md:hidden">
  <div className="flex items-center justify-around py-2">
```

to:

```tsx
<nav className="border-border bg-background/90 fixed right-0 bottom-0 left-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
  <div className="flex items-center justify-around py-2">
```

Single-token change: `pb-[env(safe-area-inset-bottom)]` on the outer `<nav>`. On devices with a bottom safe-area inset (notched iOS, Android gesture bar), the tab bar now reserves space below its content so the tap targets don't collide with the system UI.

- [ ] **Step 2: Typecheck + prettier + test**

```bash
npx tsc --noEmit && npx prettier --write src/components/layout/mobile-tab-bar.tsx && npm run test
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/mobile-tab-bar.tsx
git commit -m "feat(shell): add safe-area-inset-bottom padding to mobile tab bar"
```

---

## Task 9: Bottom player bar — transform-based show/hide

**Files:**

- Modify: `src/components/player/bottom-player-bar.tsx`

**Contract:** Synthesis §3 says the player bar should "animate show/hide via `transition: transform var(--motion-regular)` translating from `translateY(100%)` off-screen, not `display:none`." The `hidden md:block` wrapper in `app-shell.tsx` currently uses `display:none` at `<md`. Keep the wrapper for layout, but add a CSS class inside the player bar that enables the transform animation for future show/hide state (when a feature later needs to auto-hide the player — e.g., during full-player open). This task establishes the transform infrastructure; Plan 3 will add the actual trigger.

Rather than over-engineering now, add a single `data-player-hidden` attribute consumers can flip. The component always renders; the attribute controls transform.

- [ ] **Step 1: Read the current file head**

```bash
sed -n '1,60p' src/components/player/bottom-player-bar.tsx
```

Identify the outermost JSX element returned. It's a `<div>` with classes like `border-border bg-background fixed bottom-0 left-0 right-0 z-40 border-t` or similar. Keep the existing classes; add transform + data attribute.

- [ ] **Step 2: Make the outer element data-driven**

Locate the outer `<div>` that wraps the player bar. Edit only its `className` (append transform classes) and add a `data-player-hidden={false}` attribute (always false for now — placeholder for future trigger).

Example: if the outer element currently reads:

```tsx
<div className="bg-background border-border border-t ...">
```

change to:

```tsx
<div
  data-player-hidden={false}
  className="bg-background border-border border-t transition-transform duration-regular ease-standard data-[player-hidden=true]:translate-y-full ..."
>
```

The `data-[...]:` Tailwind arbitrary variant reads the attribute. Setting `data-player-hidden="true"` from future consumers (via a Zustand selector on `playback.fullView` or a dedicated `player-visibility` store) will animate the bar off-screen.

If the outer `<div>` has a complex conditional className (e.g., uses `cn(...)`), splice the new classes inside the `cn()` call rather than replacing the whole string.

- [ ] **Step 3: Dev-server sanity**

```bash
npm run dev
```

Visit any page, open DevTools, inspect the bottom player bar element. Set `data-player-hidden="true"` on the element via DevTools. The player bar should slide off-screen over 400ms. Change back to `false` — it slides back. Kill with `Ctrl+C`.

- [ ] **Step 4: Typecheck + prettier + test**

```bash
npx tsc --noEmit && npx prettier --write src/components/player/bottom-player-bar.tsx && npm run test
```

- [ ] **Step 5: Commit**

```bash
git add src/components/player/bottom-player-bar.tsx
git commit -m "feat(player): transform-based show/hide infrastructure on bottom player bar"
```

---

## Task 10: Final regression gate

**Files:**

- None modified.

- [ ] **Step 1: Run the full test suite**

```bash
npm run test
```

Expected: all tests pass (target ~178+ with new Task-1, Task-2, Task-5 tests added).

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Dev-server visual sanity across all routes**

```bash
npm run dev
```

Walk through each top-level route and verify:

- `/` — home renders with TopBar above content, sidebar on left
- `/quran` — Quran reader, sidebar active state on "Read Quran"
- `/reciter` — reciters grid
- `/collection` — collection hub, all sub-tabs work
- `/adhkar` — adhkar list
- `/settings` — settings page; theme cycler in TopBar works across light/dark/sepia/system
- `/does-not-exist` — 404 page uses `<EmptyState>` and stays inside the shell

On mobile viewport (DevTools device emulation at 390×844): verify TopBar is hidden, mobile tab bar has bottom safe-area inset padding, only 5 tabs (Home, Search, Read, Collection, Settings) — **note:** Search stays in the mobile tab bar (distinct from the sidebar). At `md+`, Search moves to the top bar.

Kill with `Ctrl+C`.

- [ ] **Step 4: No commit.** This task is a gate.

---

## Self-Review Notes

**Spec coverage (synthesis §3 Supporting rows + §3 Shell rows):**

- `<EmptyState>` primitive → Task 1 ✓
- `<Skeleton>` primitive → Task 2 ✓
- Root `not-found.tsx` inside shell → Task 3 ✓
- Root `error.tsx` inside shell → Task 4 ✓
- `<ContinueReadingCard>` with localStorage → Task 5 ✓
- Sidebar: remove Search, keep 3-stage collapse, add Continue Reading in footer → Task 6 ✓
- Top-bar pill at `lg:` with search + Clerk UserButton → Task 7 (promoted to `md:` since mobile tab bar covers `<md`) ✓
- Mobile tab bar safe-area-inset-bottom → Task 8 ✓
- Bottom player bar translate-show/hide (infrastructure; trigger in Plan 3) → Task 9 ✓

**Deferrals:**

- Cloud-sync queue (Q7 deferred in synthesis §6).
- Extend command palette with verse parser + type chips → Plan 3 (reading plan), since the verse-parser ties to reading deep-links.
- Lyrics/mic icon on bottom player → Plan 3 (full player refresh).
- Rate chip promotion on bottom player → Plan 3.

**Placeholder scan:** no "TBD", "similar to Task N", "appropriate error handling," or bare "add tests" without code.

**Type consistency:**

- `ContinueReadingEntry` shape is `{ surahId: number; surahName: string; verseId: number; page: number }` — used identically in the hook, its test, and the card component.
- `CONTINUE_READING_KEY` constant exported from hook, used in test.
- `EmptyState` props — icon / title / subtitle / cta with discriminated CTA union — used identically in not-found.tsx, error.tsx, and test.
- Tailwind tokens referenced (`bg-brand-main`, `bg-brand-light`, `bg-brand-weak`, `bg-surface-sunken`, `border-border-divider`, `duration-fast`, `ease-standard`, `animate-skeleton-pulse`) all exist after Plan 1 + Task 2 of this plan.
- New `--brand-main-foreground` token is added in Task 1 Step 4 and consumed by Task 1 Step 3's CTA styling.

**Scope check:** this plan ships working software on its own. The TopBar + sidebar refresh + primitives + error pages cover the entire shell refresh scope of synthesis §3. Deeper listening/reading changes depend on this foundation but don't block shipping Plan 2.
