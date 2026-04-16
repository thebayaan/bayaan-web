# Facelift Plan 1 — Tokens, Motion, and Theme Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the design-token and theme foundation for the facelift: migrate `.dark` class-toggle to `[data-theme="light|dark|sepia"]` attribute, ship three surface tiers + accent ladder + motion tokens + elevation tokens, add sepia mode, and delete the unused framer-motion dependency.

**Architecture:** The current theme layer (`src/app/globals.css` + `src/components/theme-provider.tsx` + `src/stores/theme-store.ts`) uses OKLCH custom properties toggled via a `.dark` class. This plan migrates the selector to `[data-theme]` (three values), extends `ThemeMode` with `"sepia"`, adds a new layer of semantic tokens on top of the existing shadcn aliases (without removing them), and updates Tailwind's `dark:` custom variant to read the new attribute so no existing `dark:` utility class breaks.

**Tech Stack:** Tailwind 4, Next.js 16, React 19, Zustand, Vitest + `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-04-16-facelift-design.md`
**Synthesis:** `docs/superpowers/research/facelift/synthesis.md`

---

## File Structure

Files this plan touches (all under `src/`):

- **Modify** `src/stores/theme-store.ts` — extend `ThemeMode` with `"sepia"`; update `getResolvedTheme` return type.
- **Modify** `src/components/theme-provider.tsx` — write `data-theme` attribute instead of `.dark` class; support sepia.
- **Modify** `src/app/globals.css` — replace `.dark {}` block with `[data-theme="dark"] {}`; add `[data-theme="sepia"] {}` block; add new semantic tokens (surface tiers, accent ladder, motion, elevation); update `@custom-variant dark` to read the attribute.
- **Modify** `tailwind.config.ts` — `darkMode: ["selector", '[data-theme="dark"]']`; extend `theme.transitionDuration` and `theme.transitionTimingFunction` with motion tokens.
- **Modify** `package.json` — remove `framer-motion` dependency.
- **Modify** `src/__tests__/stores/theme-store.test.ts` if present (create if absent) — cover sepia.
- **Create** `src/__tests__/components/theme-provider.test.tsx` — verify `data-theme` attribute is written.

No new runtime components are added in this plan; it is purely token and theme plumbing. Later plans (2–4) build on this foundation.

**Branch:** Work on `feat/facelift-design-v2` (already set up) or a topic branch off it.

---

## Task 1: Extend `ThemeMode` with "sepia"

**Files:**

- Modify: `src/stores/theme-store.ts`
- Modify or Create test: `src/__tests__/stores/theme-store.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/stores/theme-store.test.ts` with:

```ts
import { describe, expect, it, beforeEach } from "vitest";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

describe("theme-store", () => {
  beforeEach(() => {
    useThemeStore.setState({ themeMode: "dark" });
  });

  it("accepts sepia as a theme mode", () => {
    useThemeStore.getState().setThemeMode("sepia");
    expect(useThemeStore.getState().themeMode).toBe("sepia");
  });

  it("resolves sepia to sepia (not collapsed to light/dark)", () => {
    expect(getResolvedTheme("sepia")).toBe("sepia");
  });

  it("resolves light and dark unchanged", () => {
    expect(getResolvedTheme("light")).toBe("light");
    expect(getResolvedTheme("dark")).toBe("dark");
  });

  it("resolves system to either light or dark (never sepia)", () => {
    const resolved = getResolvedTheme("system");
    expect(["light", "dark"]).toContain(resolved);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/stores/theme-store.test.ts
```

Expected: FAIL — `sepia` is not assignable to `ThemeMode`, and `getResolvedTheme("sepia")` either returns `"dark"` or a type error.

- [ ] **Step 3: Update `src/stores/theme-store.ts`**

Replace the file contents with:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "sepia" | "system";
export type ResolvedTheme = "light" | "dark" | "sepia";

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: "dark",
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    { name: "bayaan-theme" },
  ),
);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getResolvedTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return getSystemTheme();
  return mode;
}
```

Key changes: `ThemeMode` gains `"sepia"`; new exported `ResolvedTheme` type; `getResolvedTheme` returns `ResolvedTheme` and passes through `"sepia"` unchanged.

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/stores/theme-store.test.ts
```

Expected: PASS — all four `it` blocks.

- [ ] **Step 5: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/stores/theme-store.ts src/__tests__/stores/theme-store.test.ts
```

Expected: no TypeScript errors; prettier either reformats or reports unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/stores/theme-store.ts src/__tests__/stores/theme-store.test.ts
git commit -m "feat(theme): extend ThemeMode with sepia"
```

---

## Task 2: Migrate `theme-provider` to write `data-theme` attribute

**Files:**

- Modify: `src/components/theme-provider.tsx`
- Create test: `src/__tests__/components/theme-provider.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/components/theme-provider.test.tsx` with:

```tsx
import { describe, expect, it, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import { useThemeStore } from "@/stores/theme-store";

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    useThemeStore.setState({ themeMode: "dark" });
  });

  it("writes data-theme='dark' when theme is dark", () => {
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("writes data-theme='light' when theme is light", () => {
    useThemeStore.setState({ themeMode: "light" });
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("writes data-theme='sepia' when theme is sepia", () => {
    useThemeStore.setState({ themeMode: "sepia" });
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("sepia");
  });

  it("does not leave a .dark class on <html>", () => {
    useThemeStore.setState({ themeMode: "dark" });
    render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("updates the attribute when themeMode changes", () => {
    const { rerender } = render(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    act(() => {
      useThemeStore.setState({ themeMode: "sepia" });
    });
    rerender(<ThemeProvider>child</ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("sepia");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/components/theme-provider.test.tsx
```

Expected: FAIL — provider currently toggles `.dark` class and does not set `data-theme`.

- [ ] **Step 3: Replace `src/components/theme-provider.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", getResolvedTheme(themeMode));
    root.classList.remove("dark");

    if (themeMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      function handleChange() {
        root.setAttribute("data-theme", mq.matches ? "dark" : "light");
      }
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  return <>{children}</>;
}
```

Key changes: write `data-theme` attribute on `<html>` via `setAttribute`; explicitly remove any stale `.dark` class so an SSR-rendered page that lands with the class still transitions cleanly; same `(prefers-color-scheme)` listener but now updates the attribute instead of the class.

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/components/theme-provider.test.tsx
```

Expected: PASS — all five `it` blocks.

- [ ] **Step 5: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/components/theme-provider.tsx src/__tests__/components/theme-provider.test.tsx
```

Expected: no TypeScript errors; prettier reformats or reports unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/components/theme-provider.tsx src/__tests__/components/theme-provider.test.tsx
git commit -m "feat(theme): write data-theme attribute instead of .dark class"
```

---

## Task 3: Update `@custom-variant dark` and add `[data-theme="dark"]` / `[data-theme="sepia"]` blocks in globals.css

**Files:**

- Modify: `src/app/globals.css`

This task is the largest single change in the plan. It migrates the existing `.dark {}` block to `[data-theme="dark"] {}`, adds a new `[data-theme="sepia"] {}` block, and updates the `@custom-variant dark` declaration so existing `dark:` utility classes keep working.

- [ ] **Step 1: Update the `@custom-variant dark` declaration at the top of the file**

Replace:

```css
@custom-variant dark (&:is(.dark *));
```

with:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

This tells Tailwind 4 to apply `dark:` utilities when an element has `[data-theme="dark"]` on itself or any ancestor.

- [ ] **Step 2: Replace the `.dark { ... }` selector with `[data-theme="dark"]`**

Find the block currently starting `.dark {` at line 75 (containing `--background: oklch(0.1 0.02 250);` etc.) and change its selector to `[data-theme="dark"]`. Leave all the properties inside unchanged for this step:

```css
[data-theme="dark"] {
  /* Bayaan Dark Mode */
  --background: oklch(0.1 0.02 250);
  --foreground: oklch(1 0 0);
  /* ...rest unchanged... */
  --sidebar-ring: oklch(1 0 0);
}
```

Do the same for the second `.dark {` block (currently line 117 in the alpha-utilities section):

```css
[data-theme="dark"] {
  --text-alpha-04: rgba(255, 255, 255, 0.04);
  --text-alpha-06: rgba(255, 255, 255, 0.06);
  --text-alpha-10: rgba(255, 255, 255, 0.1);
  --text-alpha-35: rgba(255, 255, 255, 0.35);
  --text-alpha-50: rgba(255, 255, 255, 0.5);
  --text-alpha-85: rgba(255, 255, 255, 0.85);
}
```

- [ ] **Step 3: Add a `[data-theme="sepia"] { ... }` block after the dark block**

Insert this block immediately after the second `[data-theme="dark"]` block:

```css
[data-theme="sepia"] {
  /* Bayaan Sepia Mode — warm parchment, accent flips cool → warm brown */
  --background: oklch(0.93 0.04 78);
  --foreground: oklch(0.18 0.03 60);
  --card: oklch(0.96 0.03 78);
  --card-foreground: oklch(0.18 0.03 60);
  --popover: oklch(0.96 0.03 78);
  --popover-foreground: oklch(0.18 0.03 60);
  --primary: oklch(0.18 0.03 60);
  --primary-foreground: oklch(0.96 0.03 78);
  --secondary: oklch(0.9 0.04 78);
  --secondary-foreground: oklch(0.18 0.03 60);
  --muted: oklch(0.9 0.04 78);
  --muted-foreground: oklch(0.38 0.03 60);
  --accent: oklch(0.9 0.04 78);
  --accent-foreground: oklch(0.18 0.03 60);
  --destructive: oklch(0.55 0.22 25);
  --border: oklch(0.78 0.04 78);
  --input: oklch(0.78 0.04 78);
  --ring: oklch(0.18 0.03 60);

  --sidebar: oklch(0.9 0.04 78);
  --sidebar-foreground: oklch(0.18 0.03 60);
  --sidebar-primary: oklch(0.18 0.03 60);
  --sidebar-primary-foreground: oklch(0.96 0.03 78);
  --sidebar-accent: oklch(0.88 0.04 78);
  --sidebar-accent-foreground: oklch(0.18 0.03 60);
  --sidebar-border: oklch(0.82 0.04 78);
  --sidebar-ring: oklch(0.18 0.03 60);

  --text-alpha-04: rgba(6, 21, 28, 0.04);
  --text-alpha-06: rgba(6, 21, 28, 0.06);
  --text-alpha-10: rgba(6, 21, 28, 0.1);
  --text-alpha-35: rgba(6, 21, 28, 0.35);
  --text-alpha-50: rgba(6, 21, 28, 0.5);
  --text-alpha-85: rgba(6, 21, 28, 0.85);
}
```

The sepia palette is tuned as a warm parchment: backgrounds in the `#f8ebd5`-family hue translated to OKLCH, foreground text a near-black warm brown, borders slightly darker warm beige. The accent token stays on the shadcn layer for now; the accent ladder (next task) adds the cool→warm flip.

- [ ] **Step 4: Add a new `@layer` block of semantic facelift tokens at the bottom of the file (before `@layer base`)**

Insert this block between the `@font-face` block (around line 126–130) and `@layer base`:

```css
/* Facelift semantic tokens — layered on top of shadcn aliases. */
:root {
  /* Surfaces */
  --surface: var(--background);
  --surface-raised: var(--card);
  --surface-sunken: oklch(0.92 0.01 90);

  /* Accent ladder — Deezer purple */
  --accent-main: #a238ff;
  --accent-strong: #9333e8;
  --accent-weak: rgba(162, 56, 255, 0.2);
  --accent-light: rgba(162, 56, 255, 0.08);

  /* Border and divider */
  --border-divider: oklch(0.92 0.01 90);

  /* Overlay scrim */
  --overlay: rgba(0, 0, 0, 0.6);

  /* Motion */
  --motion-fast: 160ms;
  --motion-moderate: 200ms;
  --motion-regular: 400ms;
  --motion-slow: 600ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

  /* Elevation */
  --elevation-0: none;
  --elevation-s: 0 1px 20px rgba(31, 31, 31, 0.12);
  --elevation-m: 0 6px 30px rgba(31, 31, 31, 0.16);
  --elevation-l: 0 12px 48px rgba(31, 31, 31, 0.2);
}

[data-theme="dark"] {
  --surface-sunken: oklch(0.14 0.02 250);
  --border-divider: oklch(0.2 0.02 250);
  --overlay: rgba(0, 0, 0, 0.8);
  --elevation-s: 0 1px 20px rgba(0, 0, 0, 0.5);
  --elevation-m: 0 6px 30px rgba(0, 0, 0, 0.5);
  --elevation-l: 0 12px 48px rgba(0, 0, 0, 0.6);
}

[data-theme="sepia"] {
  --surface-sunken: oklch(0.88 0.04 78);
  --accent-main: #72603f;
  --accent-strong: #5a4a30;
  --accent-weak: rgba(114, 96, 63, 0.2);
  --accent-light: rgba(114, 96, 63, 0.08);
  --border-divider: oklch(0.85 0.04 78);
  --overlay: rgba(0, 0, 0, 0.25);
  --elevation-s: 0 1px 20px rgba(54, 42, 20, 0.12);
  --elevation-m: 0 6px 30px rgba(54, 42, 20, 0.16);
  --elevation-l: 0 12px 48px rgba(54, 42, 20, 0.2);
}
```

The cool→warm accent flip for sepia is the key architectural move: `--accent-main` changes from purple `#a238ff` to warm brown `#72603f` when `[data-theme="sepia"]` is active. Every downstream component that consumes `var(--accent-main)` flips automatically.

- [ ] **Step 5: Expose the new tokens to Tailwind via `@theme inline`**

Inside the existing `@theme inline { ... }` block at the top of `globals.css` (ends around line 39), append these lines **before the closing brace**:

```css
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-sunken: var(--surface-sunken);
  --color-accent-main: var(--accent-main);
  --color-accent-strong: var(--accent-strong);
  --color-accent-weak: var(--accent-weak);
  --color-accent-light: var(--accent-light);
  --color-border-divider: var(--border-divider);
  --color-overlay: var(--overlay);
```

Tailwind 4 reads `--color-*` aliases from `@theme inline` and generates `bg-*`, `text-*`, `border-*` utilities automatically. After this change, classes like `bg-surface-raised`, `text-accent-main`, and `border-border-divider` work in any component.

- [ ] **Step 6: Verify the dev server builds and renders all three modes**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000`, no console errors about unresolved CSS custom properties.

Manually verify in three passes:

1. Open `http://localhost:3000` with DevTools → Elements. Select `<html>`. Confirm `data-theme="dark"` (default state after hydration, matching `themeMode: "dark"` default).
2. In DevTools, on `<html>`, change the attribute to `data-theme="light"` and confirm the page renders light palette.
3. Change to `data-theme="sepia"` and confirm the page renders warm parchment palette.

Kill dev server with `Ctrl+C`.

- [ ] **Step 7: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write src/app/globals.css
```

Expected: no TypeScript errors; prettier reformats or reports unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): migrate to [data-theme] selector, add sepia mode and facelift tokens"
```

---

## Task 4: Update Tailwind config for `[data-theme="dark"]` + motion tokens

**Files:**

- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update `darkMode` and extend theme with motion tokens**

Replace the file with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
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
    },
  },
  plugins: [],
};

export default config;
```

Key changes:

- `darkMode` uses Tailwind 4 `selector` strategy targeting `[data-theme="dark"]` — so the JS/config side matches the `@custom-variant dark` declaration in `globals.css`.
- `transitionDuration` gains four named values (`duration-fast`, `duration-moderate`, `duration-regular`, `duration-slow`).
- `transitionTimingFunction` gains `ease-standard` (usable as `ease-standard` class).

- [ ] **Step 2: Typecheck and prettier**

```bash
npx tsc --noEmit && npx prettier --write tailwind.config.ts
```

Expected: no TypeScript errors.

- [ ] **Step 3: Verify motion tokens compile**

Run a quick smoke test — add a temporary utility use and verify the generated CSS has the token.

```bash
npm run dev
```

Open any page, inspect a DOM element, and in DevTools Console run:

```js
document.documentElement.style.setProperty("--test-duration", "var(--motion-fast)");
getComputedStyle(document.documentElement).getPropertyValue("--test-duration");
```

Expected: `160ms`. This confirms the CSS variable is resolvable. Kill dev server with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(theme): wire Tailwind darkMode to [data-theme=dark]; add motion duration/easing tokens"
```

---

## Task 5: Run full test suite and validate no regressions

**Files:**

- None modified in this task.

- [ ] **Step 1: Run the full vitest suite**

```bash
npm run test
```

Expected: all tests pass. The existing 111+ tests should be green.

If any test fails referencing `.dark` class directly: inspect the test, update it to check `data-theme` attribute instead. These should be few — the theme-store and theme-provider tests from Tasks 1–2 already cover the migration, and most component tests don't directly assert on theme class state.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual regression sanity check against existing pages**

```bash
npm run dev
```

Visit each top-level route and verify no regressions:

- `/` — Home. Should render same as before.
- `/quran` — Quran reader. Arabic text still renders in UthmanicHafs.
- `/reciter` — Reciters grid. Cards still render.
- `/collection` — Collection hub. All four sub-tabs render.
- `/adhkar` — Adhkar. List renders.
- `/settings` — Settings. Theme switcher still works.

Use the theme switcher on `/settings` (or toggle `<html data-theme="...">` via DevTools) to confirm all three modes — light, dark, sepia — render without console errors. Sepia should look like warm parchment.

Kill dev server with `Ctrl+C`.

- [ ] **Step 4: Commit nothing (this task has no file changes)**

No commit. This task is a gate — if regressions are found, fix them in a follow-up task within this plan before proceeding.

---

## Task 6: Remove `framer-motion` dependency

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Confirm no imports exist in `src/`**

```bash
grep -rn "from [\"']framer-motion[\"']" src/
```

Expected: zero results. (Synthesis §4 and the 20-agent research wave confirmed this. Re-verify at implementation time in case of drift.)

If any results appear: STOP. Do not proceed with this task. Open an issue, pause this plan, and design a migration for that usage first. (As of the synthesis date, zero imports exist.)

- [ ] **Step 2: Uninstall the package**

```bash
npm uninstall framer-motion
```

Expected: `package.json` shows no `framer-motion` entry in `dependencies`; `package-lock.json` is updated.

- [ ] **Step 3: Verify build still succeeds**

```bash
npx tsc --noEmit && npm run test
```

Expected: no TypeScript errors; all tests pass.

- [ ] **Step 4: Verify dev server still starts cleanly**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000`, no console errors referencing missing framer-motion. Kill with `Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): remove unused framer-motion dependency"
```

---

## Task 7: Document the token system in an inline README

**Files:**

- Create: `src/app/globals.css.README.md`

This is a small but important task — downstream plans (2, 3, 4) reference these tokens, and new contributors will touch `globals.css` without context unless a map exists next to it.

- [ ] **Step 1: Create the README**

Write `src/app/globals.css.README.md` with:

```markdown
# Bayaan Design Tokens

All runtime tokens live in `globals.css` and are exposed to Tailwind via `@theme inline`.

## Mode switching

- Attribute: `[data-theme="light" | "dark" | "sepia"]` on `<html>`.
- Written by: `src/components/theme-provider.tsx`.
- Source of truth: `useThemeStore` in `src/stores/theme-store.ts`.

## Layers (outer → inner)

1. **Raw values** — OKLCH, hex, rgba. Scoped to `:root` or `[data-theme="X"]`.
2. **Semantic tokens** — `--surface`, `--accent-main`, `--motion-fast`, etc.
3. **Shadcn aliases** — `--background`, `--foreground`, `--card`, etc. (for library compatibility).
4. **Tailwind utilities** — `bg-surface`, `text-accent-main`, `duration-fast`, `ease-standard`.

## Token groups

### Surfaces

- `--surface` — page background
- `--surface-raised` — cards, panels, sheets
- `--surface-sunken` — input wells, code blocks

### Accent ladder

- `--accent-main` — primary CTA, active-state, link
- `--accent-strong` — pressed / hover
- `--accent-weak` — selection, hover-bg (20% alpha)
- `--accent-light` — ambient, rails (8% alpha)

Sepia flips accent cool → warm: purple `#a238ff` → warm brown `#72603f`.

### Motion

- `--motion-fast: 160ms` — hover color/opacity swap, word-sync color flip
- `--motion-moderate: 200ms` — chip active, row highlight, popover enter
- `--motion-regular: 400ms` — player bar show/hide, sheet/drawer open
- `--motion-slow: 600ms` — hero crossfade, mushaf page turn
- `--ease-standard` — `cubic-bezier(0.4, 0, 0.2, 1)`

Tailwind utilities: `duration-fast`, `duration-moderate`, `duration-regular`, `duration-slow`, `ease-standard`.

### Elevation

- `--elevation-0: none`
- `--elevation-s: 0 1px 20px rgba(...)`
- `--elevation-m: 0 6px 30px rgba(...)`
- `--elevation-l: 0 12px 48px rgba(...)`

Shadow RGB tuned per mode so elevation survives dark backgrounds.

### Alpha ladders

- `--text-alpha-04 … --text-alpha-85` — text-tinted fills. Already in use for hover backgrounds and muted surfaces.

## Contributing

When adding a new semantic token:

1. Add the raw value in `:root` and every `[data-theme="..."]` block (light, dark, sepia).
2. Expose it via `@theme inline` as a `--color-*` alias if you want a Tailwind utility class for it.
3. Document it in this README under the appropriate group.
4. Avoid hex literals in components — always go through a token.

Synthesis reference: `docs/superpowers/research/facelift/synthesis.md` §2.
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css.README.md
git commit -m "docs(theme): add token-system README next to globals.css"
```

---

## Self-Review Notes

**Spec coverage (synthesis §2 Tokens):**

- Palette architecture / `[data-theme]` migration → Tasks 2, 3.
- Three surface tiers → Task 3 Step 4.
- Accent ladder (purple light/dark, warm brown sepia) → Task 3 Step 4.
- Motion tokens (4 durations + standard easing) → Tasks 3 Step 4, 4 Step 1.
- Elevation tokens → Task 3 Step 4.
- Alpha ladder (kept) → Task 3 Step 2 leaves existing `--text-alpha-*` in place.
- Tailwind config alignment → Task 4.
- Typography — SurahNames font → **already wired** (verified in `src/lib/fonts.ts` and `src/app/layout.tsx`); no task needed here. Will be consumed by later plans.
- Sepia as third mode → Tasks 1, 3.

**Spec coverage (synthesis §2 Framer-motion deletion):**

- Task 6.

**Placeholder scan:** no "TBD", no "appropriate error handling", no "similar to Task N", no bare "add tests." Every code step has a complete block.

**Type consistency:** `ThemeMode` → `"light" | "dark" | "sepia" | "system"` is used identically in Tasks 1, 2. `ResolvedTheme` is `"light" | "dark" | "sepia"`. Provider calls `getResolvedTheme(themeMode)` — matches signature. CSS token names (`--surface`, `--surface-raised`, `--surface-sunken`, `--accent-main`, `--accent-strong`, `--accent-weak`, `--accent-light`, `--motion-fast`, `--motion-moderate`, `--motion-regular`, `--motion-slow`, `--ease-standard`, `--elevation-0…l`, `--border-divider`, `--overlay`) are used consistently across Task 3 Step 4 and Task 4 Step 1.

**Scope check:** this plan produces working, testable software on its own — the foundation is complete after Task 7. No downstream plan is required for this code to ship and run.
