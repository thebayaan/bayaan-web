# Bayaan Web — Plan 1: Foundation & Layout

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite scaffold with a fully configured Next.js 15 app with Bayaan theme system, custom icons, Spotify-style responsive layout shell, API proxy routes, and comprehensive tests.

**Architecture:** Next.js 15 App Router with Zustand stores for theme and settings, persisted to localStorage. Tailwind + shadcn/ui (New York style) with Bayaan's exact color tokens mapped to CSS variables. Responsive three-zone layout (sidebar + content + player bar) on desktop, collapsed sidebar on tablet, bottom tab bar on mobile. Auth deferred to a dedicated plan — all routes are open for now.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS, shadcn/ui, Zustand, SWR, Vitest, React Testing Library

**Testing:** Every task includes unit/component tests. Vitest for test runner (fast, Vite-compatible), React Testing Library for component tests, MSW for API mocking where needed.

**Spec:** `docs/superpowers/specs/2026-04-13-bayaan-web-design.md`

**Roadmap — All Plans:**
1. **Foundation & Layout** ← this plan
2. **Audio Player** — AudioService, playerStore, AudioCoordinator, player UI components
3. **Listening Pages** — Home, reciter profiles, surah pages, search
4. **Quran Reader** — Mushaf view (QCF), reading view (Uthmani Hafs), verse actions, translations, tafseer
5. **Backend User Data** — New tables, user CRUD endpoints
6. **Collection & User Features** — Playlists, favorites, bookmarks, notes, history, reading progress
7. **Adhkar & Settings** — Adhkar pages, tasbeeh counter, settings page
8. **Authentication** — Clerk setup, protected routes, webhook sync, sign-in/sign-up pages

---

## File Structure (Plan 1)

```
bayaan-web/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── vitest.config.ts                # Vitest configuration
├── vitest.setup.ts                 # Test setup (RTL matchers)
├── components.json                 # shadcn config
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind + Bayaan theme CSS vars
│   │   ├── layout.tsx              # Root layout (fonts, theme)
│   │   ├── (app)/                  # App route group
│   │   │   ├── layout.tsx          # App shell (sidebar + content + player bar)
│   │   │   ├── page.tsx            # Home (placeholder)
│   │   │   ├── search/page.tsx
│   │   │   ├── reciter/[slug]/page.tsx
│   │   │   ├── surah/[id]/page.tsx
│   │   │   ├── quran/page.tsx
│   │   │   ├── quran/[surah]/page.tsx
│   │   │   ├── quran/[surah]/[ayah]/page.tsx
│   │   │   ├── collection/page.tsx
│   │   │   ├── collection/playlists/page.tsx
│   │   │   ├── collection/playlists/[id]/page.tsx
│   │   │   ├── collection/favorites/page.tsx
│   │   │   ├── collection/bookmarks/page.tsx
│   │   │   ├── collection/notes/page.tsx
│   │   │   ├── adhkar/page.tsx
│   │   │   ├── adhkar/[superId]/page.tsx
│   │   │   ├── adhkar/[superId]/[dhikrId]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── bayaan/[...path]/route.ts
│   │       └── quran/[...path]/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-nav-item.tsx
│   │   │   ├── bottom-player-bar.tsx
│   │   │   ├── mobile-tab-bar.tsx
│   │   │   └── app-shell.tsx
│   │   ├── icons/
│   │   │   └── index.tsx
│   │   └── ui/                     # shadcn components (auto-generated)
│   ├── lib/
│   │   ├── utils.ts                # shadcn cn() utility
│   │   ├── api.ts                  # API client helpers
│   │   └── fonts.ts                # Font configuration
│   ├── stores/
│   │   └── theme-store.ts
│   ├── types/
│   │   ├── quran.ts
│   │   ├── audio.ts
│   │   └── reciter.ts
│   ├── data/
│   │   ├── surah-data.json         # Copied from mobile app
│   │   └── surah-glyph-map.ts
│   └── __tests__/
│       ├── stores/
│       │   └── theme-store.test.ts
│       ├── components/
│       │   ├── icons.test.tsx
│       │   └── layout/
│       │       ├── sidebar.test.tsx
│       │       ├── mobile-tab-bar.test.tsx
│       │       └── app-shell.test.tsx
│       ├── lib/
│       │   └── api.test.ts
│       └── types/
│           └── reciter.test.ts
├── public/
│   └── fonts/
│       ├── Manrope-Regular.ttf
│       ├── Manrope-Medium.ttf
│       ├── Manrope-SemiBold.ttf
│       ├── Manrope-Bold.ttf
│       ├── Manrope-ExtraBold.ttf
│       ├── Manrope-Light.ttf
│       ├── Manrope-ExtraLight.ttf
│       ├── surah_names.ttf
│       └── UthmanicHafs1Ver18.woff2
└── docs/
    └── superpowers/
```

---

### Task 1: Initialize Next.js 15 Project

**Files:**
- Remove: `src/App.tsx`, `src/main.tsx`, `src/vite-env.d.ts`, `vite.config.ts`, `index.html`
- Create: `next.config.ts`, `tsconfig.json` (replace), `package.json` (replace), `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/(app)/page.tsx`

- [ ] **Step 1: Remove Vite scaffold files**

```bash
rm -f vite.config.ts index.html src/App.tsx src/main.tsx src/vite-env.d.ts
```

- [ ] **Step 2: Initialize Next.js and install dependencies**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
```

Note: This will detect existing files and merge. If it fails due to existing `package.json`, remove it first (`rm package.json package-lock.json`) and re-run. After creation, install additional dependencies:

```bash
npm install zustand swr framer-motion fuse.js @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @types/node vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

- [ ] **Step 3: Configure TypeScript strict mode**

Replace `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] },
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Configure Next.js**

Create `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.thebayaan.com",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create minimal root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bayaan — Quran Listening & Reading",
  description: "Listen to and read the Holy Quran with beautiful recitations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/(app)/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Bayaan</h1>
    </div>
  );
}
```

- [ ] **Step 6: Verify the app runs**

```bash
npm run dev
```

Expected: App starts on `http://localhost:3000`, shows "Bayaan" centered on page. No errors in terminal.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project, replace Vite scaffold"
```

---

### Task 2: Set Up shadcn/ui with Bayaan Theme

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/app/globals.css` (replace)
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

When prompted, select:
- Style: **New York**
- Base color: **Neutral**
- CSS variables: **Yes**

This creates `components.json`, `src/lib/utils.ts`, and updates `globals.css`.

- [ ] **Step 2: Replace globals.css with Bayaan theme tokens**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.75rem;

  /* Bayaan Light Mode */
  --background: oklch(0.96 0.01 90);       /* #f4f3ec */
  --foreground: oklch(0.15 0.03 220);      /* #06151C */
  --card: oklch(0.89 0.01 100);            /* #dcdeda */
  --card-foreground: oklch(0.15 0.03 220);
  --popover: oklch(0.96 0.01 90);
  --popover-foreground: oklch(0.15 0.03 220);
  --primary: oklch(0.15 0.03 220);
  --primary-foreground: oklch(0.96 0.01 90);
  --secondary: oklch(0.95 0.00 0);         /* #f0f0f0 */
  --secondary-foreground: oklch(0.15 0.03 220);
  --muted: oklch(0.94 0.01 90);            /* #edebe3 */
  --muted-foreground: oklch(0.40 0.02 220); /* text @ ~0.5 */
  --accent: oklch(0.94 0.01 90);
  --accent-foreground: oklch(0.15 0.03 220);
  --destructive: oklch(0.55 0.22 25);      /* #DC2626 */
  --border: oklch(0.72 0.00 0);            /* #a4a4a4 */
  --input: oklch(0.72 0.00 0);
  --ring: oklch(0.15 0.03 220);

  /* Sidebar */
  --sidebar: oklch(0.94 0.01 90);
  --sidebar-foreground: oklch(0.15 0.03 220);
  --sidebar-primary: oklch(0.15 0.03 220);
  --sidebar-primary-foreground: oklch(0.96 0.01 90);
  --sidebar-accent: oklch(0.92 0.01 90);
  --sidebar-accent-foreground: oklch(0.15 0.03 220);
  --sidebar-border: oklch(0.90 0.01 90);
  --sidebar-ring: oklch(0.15 0.03 220);
}

.dark {
  /* Bayaan Dark Mode */
  --background: oklch(0.10 0.02 250);      /* #050b10 */
  --foreground: oklch(1.00 0.00 0);        /* #ffffff */
  --card: oklch(0.10 0.02 250);
  --card-foreground: oklch(1.00 0.00 0);
  --popover: oklch(0.13 0.03 240);         /* #06151C */
  --popover-foreground: oklch(1.00 0.00 0);
  --primary: oklch(1.00 0.00 0);
  --primary-foreground: oklch(0.10 0.02 250);
  --secondary: oklch(0.16 0.01 300);       /* #1c1a1e */
  --secondary-foreground: oklch(1.00 0.00 0);
  --muted: oklch(0.13 0.03 240);
  --muted-foreground: oklch(0.73 0.00 0);  /* #B0B0B0 */
  --accent: oklch(0.16 0.01 300);
  --accent-foreground: oklch(1.00 0.00 0);
  --destructive: oklch(0.58 0.22 25);      /* #EF4444 */
  --border: oklch(0.25 0.02 310);          /* #332f38 */
  --input: oklch(0.25 0.02 310);
  --ring: oklch(1.00 0.00 0);

  /* Sidebar */
  --sidebar: oklch(0.13 0.03 240);
  --sidebar-foreground: oklch(1.00 0.00 0);
  --sidebar-primary: oklch(1.00 0.00 0);
  --sidebar-primary-foreground: oklch(0.10 0.02 250);
  --sidebar-accent: oklch(0.16 0.02 250);
  --sidebar-accent-foreground: oklch(1.00 0.00 0);
  --sidebar-border: oklch(0.25 0.02 310);
  --sidebar-ring: oklch(1.00 0.00 0);
}

/* Bayaan alpha utilities — replicates Color(text).alpha(N) pattern from mobile app */
:root {
  --text-alpha-04: rgba(6, 21, 28, 0.04);
  --text-alpha-06: rgba(6, 21, 28, 0.06);
  --text-alpha-10: rgba(6, 21, 28, 0.10);
  --text-alpha-35: rgba(6, 21, 28, 0.35);
  --text-alpha-50: rgba(6, 21, 28, 0.50);
  --text-alpha-85: rgba(6, 21, 28, 0.85);
}

.dark {
  --text-alpha-04: rgba(255, 255, 255, 0.04);
  --text-alpha-06: rgba(255, 255, 255, 0.06);
  --text-alpha-10: rgba(255, 255, 255, 0.10);
  --text-alpha-35: rgba(255, 255, 255, 0.35);
  --text-alpha-50: rgba(255, 255, 255, 0.50);
  --text-alpha-85: rgba(255, 255, 255, 0.85);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 3: Add shadcn Button component to verify setup**

```bash
npx shadcn@latest add button
```

- [ ] **Step 4: Verify theme renders**

Update `src/app/(app)/page.tsx`:

```tsx
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Bayaan</h1>
      <Button>Test Button</Button>
    </div>
  );
}
```

Run `npm run dev`. Expected: Button renders with the Bayaan theme colors (dark navy text on warm cream background in light mode).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: set up shadcn/ui with Bayaan theme tokens"
```

---

### Task 3: Set Up Manrope Font

**Files:**
- Create: `src/lib/fonts.ts`, font files in `public/fonts/`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Copy font files from mobile app**

```bash
mkdir -p public/fonts
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-Regular.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-Medium.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-SemiBold.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-Bold.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-ExtraBold.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-Light.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/Manrope-ExtraLight.ttf public/fonts/
cp ~/theBayaan/Bayaan/assets/fonts/surah_names.ttf public/fonts/
```

Note: If the font file names differ in the mobile app's `assets/fonts/` directory, find them with `ls ~/theBayaan/Bayaan/assets/fonts/ | grep -i manrope` and adjust the copy commands.

- [ ] **Step 2: Create font configuration**

Create `src/lib/fonts.ts`:

```typescript
import localFont from "next/font/local";

export const manrope = localFont({
  src: [
    { path: "../../public/fonts/Manrope-ExtraLight.ttf", weight: "200" },
    { path: "../../public/fonts/Manrope-Light.ttf", weight: "300" },
    { path: "../../public/fonts/Manrope-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Manrope-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Manrope-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/Manrope-Bold.ttf", weight: "700" },
    { path: "../../public/fonts/Manrope-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const surahNames = localFont({
  src: "../../public/fonts/surah_names.ttf",
  variable: "--font-surah-names",
  display: "swap",
});
```

- [ ] **Step 3: Wire fonts into root layout**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { manrope, surahNames } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bayaan — Quran Listening & Reading",
  description: "Listen to and read the Holy Quran with beautiful recitations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Add Manrope to Tailwind config**

Update `tailwind.config.ts` — add the font family:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        "surah-names": ["var(--font-surah-names)"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Verify font renders**

Run `npm run dev`. Inspect the page — text should render in Manrope (check DevTools Computed → font-family). The "Bayaan" heading should be a clean geometric sans-serif, not the system default.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Manrope and surah names fonts"
```

---

### Task 4: Set Up Testing Infrastructure

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `src/__tests__/setup-smoke.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `.env.local` with API config**

Create `.env.local`:

```env
NEXT_PUBLIC_BAYAAN_API_URL=https://api.thebayaan.com
NEXT_PUBLIC_BAYAAN_CDN_URL=https://cdn.thebayaan.com
BAYAAN_API_KEY=byn_YOUR_API_KEY_HERE
```

Note: The `BAYAAN_API_KEY` is the existing API key for your backend — create a `web` platform key via your admin API if one doesn't exist.

- [ ] **Step 2: Create Vitest configuration**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create test setup file**

Create `vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to package.json**

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 5: Write smoke test to verify setup**

Create `src/__tests__/setup-smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("test setup", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("has access to jsdom", () => {
    const div = document.createElement("div");
    div.textContent = "Bayaan";
    expect(div.textContent).toBe("Bayaan");
  });
});
```

- [ ] **Step 6: Run tests to verify setup**

```bash
npm test
```

Expected: 2 tests pass. Output shows `✓ src/__tests__/setup-smoke.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: set up Vitest with React Testing Library"
```

---

### Task 5: Create Theme Store

**Files:**
- Create: `src/stores/theme-store.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Zustand theme store**

Create `src/stores/theme-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "system";

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
    { name: "bayaan-theme" }
  )
);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getResolvedTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemTheme();
  return mode;
}
```

- [ ] **Step 2: Create theme provider component**

Create `src/components/theme-provider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    const resolved = getResolvedTheme(themeMode);
    document.documentElement.classList.toggle("dark", resolved === "dark");

    if (themeMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      function handleChange() {
        const systemTheme = mq.matches ? "dark" : "light";
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark"
        );
      }
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Wire theme provider into root layout**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { manrope, surahNames } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bayaan — Quran Listening & Reading",
  description: "Listen to and read the Holy Quran with beautiful recitations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${surahNames.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Write theme store tests**

Create `src/__tests__/stores/theme-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

describe("theme-store", () => {
  beforeEach(() => {
    useThemeStore.setState({ themeMode: "dark" });
  });

  it("defaults to dark mode", () => {
    expect(useThemeStore.getState().themeMode).toBe("dark");
  });

  it("switches to light mode", () => {
    useThemeStore.getState().setThemeMode("light");
    expect(useThemeStore.getState().themeMode).toBe("light");
  });

  it("switches to system mode", () => {
    useThemeStore.getState().setThemeMode("system");
    expect(useThemeStore.getState().themeMode).toBe("system");
  });
});

describe("getResolvedTheme", () => {
  it("resolves light mode", () => {
    expect(getResolvedTheme("light")).toBe("light");
  });

  it("resolves dark mode", () => {
    expect(getResolvedTheme("dark")).toBe("dark");
  });

  it("resolves system mode to dark or light", () => {
    const result = getResolvedTheme("system");
    expect(["light", "dark"]).toContain(result);
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: All theme store tests pass.

- [ ] **Step 6: Verify dark mode visually**

Run `npm run dev`. The app should default to dark mode (`#050b10` background). Inspect the `<html>` element — it should have class `dark`. The body should have the deep navy background.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Zustand theme store with dark/light/system modes"
```

---

### Task 6: Port Core Custom Icons

**Files:**
- Create: `src/components/icons/index.tsx`

- [ ] **Step 1: Create icon components file**

Create `src/components/icons/index.tsx`. This ports the mobile app's `react-native-svg` icons to standard web `<svg>`. Below are the most critical icons — the remaining icons follow the same pattern and should be ported in subsequent passes.

```tsx
import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

export function HomeIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.9931 3.43368C12.8564 2.42331 11.1436 2.42331 10.0069 3.43368L2.33565 10.2526C1.92286 10.6195 1.88568 11.2516 2.2526 11.6644C2.61952 12.0771 3.25159 12.1143 3.66437 11.7474L4.00001 11.4491L4.00001 17.0658C3.99996 17.9523 3.99992 18.7161 4.08215 19.3278C4.17028 19.9833 4.36903 20.6117 4.87869 21.1213C5.38835 21.631 6.0167 21.8297 6.67222 21.9179C7.28388 22.0001 8.04769 22 8.93418 22H15.0658C15.9523 22 16.7161 22.0001 17.3278 21.9179C17.9833 21.8297 18.6117 21.631 19.1213 21.1213C19.631 20.6117 19.8297 19.9833 19.9179 19.3278C20.0001 18.7161 20.0001 17.9523 20 17.0659L20 11.4491L20.3356 11.7474C20.7484 12.1143 21.3805 12.0771 21.7474 11.6644C22.1143 11.2516 22.0772 10.6195 21.6644 10.2526L13.9931 3.43368ZM12 16C11.4477 16 11 16.4477 11 17V19C11 19.5523 10.5523 20 10 20C9.44772 20 9 19.5523 9 19V17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17V19C15 19.5523 14.5523 20 14 20C13.4477 20 13 19.5523 13 19V17C13 16.4477 12.5523 16 12 16Z"
          fill={color}
        />
      ) : (
        <>
          <path
            d="M19 9L19 17C19 18.8856 19 19.8284 18.4142 20.4142C17.8284 21 16.8856 21 15 21L14 21L10 21L9 21C7.11438 21 6.17157 21 5.58579 20.4142C5 19.8284 5 18.8856 5 17L5 9"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M3 11L7.5 7L10.6713 4.18109C11.429 3.50752 12.571 3.50752 13.3287 4.18109L16.5 7L21 11"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 21V17C10 15.8954 10.8954 15 12 15V15C13.1046 15 14 15.8954 14 17V21"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

export function SearchIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <g fill={color}>
        {filled ? (
          <path d="M2,10.5 C2,5.80558 5.80558,2 10.5,2 C15.1944,2 19,5.80558 19,10.5 C19,12.4869 18.3183,14.3145 17.176,15.7618 L20.8284,19.4142 C21.2189,19.8047 21.2189,20.4379 20.8284,20.8284 C20.4379,21.2189 19.8047,21.2189 19.4142,20.8284 L15.7618,17.176 C14.3145,18.3183 12.4869,19 10.5,19 C5.80558,19 2,15.1944 2,10.5 Z M10.5,6 C9.94772,6 9.5,6.44772 9.5,7 C9.5,7.55228 9.94772,8 10.5,8 C11.8807,8 13,9.11929 13,10.5 C13,11.0523 13.4477,11.5 14,11.5 C14.5523,11.5 15,11.0523 15,10.5 C15,8.01472 12.9853,6 10.5,6 Z" />
        ) : (
          <path d="M10.5,4 C6.91015,4 4,6.91015 4,10.5 C4,14.0899 6.91015,17 10.5,17 C14.0899,17 17,14.0899 17,10.5 C17,6.91015 14.0899,4 10.5,4 Z M2,10.5 C2,5.80558 5.80558,2 10.5,2 C15.1944,2 19,5.80558 19,10.5 C19,12.4869 18.3183,14.3145 17.176,15.7618 L20.8284,19.4142 C21.2189,19.8047 21.2189,20.4379 20.8284,20.8284 C20.4379,21.2189 19.8047,21.2189 19.4142,20.8284 L15.7618,17.176 C14.3145,18.3183 12.4869,19 10.5,19 C5.80558,19 2,15.1944 2,10.5 Z M9.5,7 C9.5,6.44772 9.94772,6 10.5,6 C12.9853,6 15,8.01472 15,10.5 C15,11.0523 14.5523,11.5 14,11.5 C13.4477,11.5 13,11.0523 13,10.5 C13,9.11929 11.8807,8 10.5,8 C9.94772,8 9.5,7.55228 9.5,7 Z" />
        )}
      </g>
    </svg>
  );
}

export function CollectionIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <g fill={color}>
          <path fillRule="evenodd" clipRule="evenodd" d="M8.67239 7.54199H15.3276C18.7024 7.54199 20.3898 7.54199 21.3377 8.52882C22.2855 9.51565 22.0625 11.0403 21.6165 14.0895L21.1935 16.9811C20.8437 19.3723 20.6689 20.5679 19.7717 21.2839C18.8745 21.9999 17.5512 21.9999 14.9046 21.9999H9.09536C6.44881 21.9999 5.12553 21.9999 4.22834 21.2839C3.33115 20.5679 3.15626 19.3723 2.80648 16.9811L2.38351 14.0895C1.93748 11.0403 1.71447 9.51565 2.66232 8.52882C3.61017 7.54199 5.29758 7.54199 8.67239 7.54199ZM8 18.0001C8 17.5859 8.3731 17.2501 8.83333 17.2501H15.1667C15.6269 17.2501 16 17.5859 16 18.0001C16 18.4143 15.6269 18.7501 15.1667 18.7501H8.83333C8.3731 18.7501 8 18.4143 8 18.0001Z" />
          <path opacity="0.4" d="M8.51005 2.00001H15.4901C15.7226 1.99995 15.9009 1.99991 16.0567 2.01515C17.1645 2.12352 18.0712 2.78958 18.4558 3.68678H5.54443C5.92895 2.78958 6.8357 2.12352 7.94352 2.01515C8.09933 1.99991 8.27757 1.99995 8.51005 2.00001Z" />
          <path opacity="0.7" d="M6.31069 4.72266C4.92007 4.72266 3.7798 5.56241 3.39927 6.67645C3.39134 6.69967 3.38374 6.72302 3.37646 6.74647C3.77461 6.6259 4.18898 6.54713 4.60845 6.49336C5.68882 6.35485 7.05416 6.35492 8.64019 6.35501L8.75863 6.35501L15.5323 6.35501C17.1183 6.35492 18.4837 6.35485 19.564 6.49336C19.9835 6.54713 20.3979 6.6259 20.796 6.74647C20.7887 6.72302 20.7811 6.69967 20.7732 6.67645C20.3927 5.56241 19.2524 4.72266 17.8618 4.72266H6.31069Z" />
        </g>
      ) : (
        <g stroke={color} strokeWidth="1.5">
          <path opacity="0.5" d="M19.5617 7C19.7904 5.69523 18.7863 4.5 17.4617 4.5H6.53788C5.21323 4.5 4.20922 5.69523 4.43784 7M17.4999 4.5C17.5283 4.24092 17.5425 4.11135 17.5427 4.00435C17.545 2.98072 16.7739 2.12064 15.7561 2.01142C15.6497 2 15.5194 2 15.2588 2H8.74099C8.48035 2 8.35002 2 8.24362 2.01142C7.22584 2.12064 6.45481 2.98072 6.45704 4.00434C6.45727 4.11135 6.47146 4.2409 6.49983 4.5" />
          <path d="M15 18H9" strokeLinecap="round" />
          <path d="M2.38351 13.793C1.93748 10.6294 1.71447 9.04765 2.66232 8.02383C3.61017 7 5.29758 7 8.67239 7H15.3276C18.7024 7 20.3898 7 21.3377 8.02383C22.2855 9.04765 22.0625 10.6294 21.6165 13.793L21.1935 16.793C20.8437 19.2739 20.6689 20.5143 19.7717 21.2572C18.8745 22 17.5512 22 14.9046 22H9.09536C6.44881 22 5.12553 22 4.22834 21.2572C3.33115 20.5143 3.15626 19.2739 2.80648 16.793L2.38351 13.793Z" />
        </g>
      )}
    </svg>
  );
}

export function PlayIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="60 35 85 95" fill="none" {...props}>
      <path
        d="M107.15 59.10Q127.37 70.78 141.57 80.96Q142.96 81.95 142.96 84.00Q142.96 86.06 141.57 87.05Q127.37 97.22 107.14 108.90Q86.91 120.58 71.00 127.79Q69.45 128.49 67.67 127.46Q65.89 126.44 65.73 124.74Q64.01 107.36 64.02 84.00Q64.02 60.64 65.73 43.25Q65.90 41.56 67.68 40.53Q69.45 39.51 71.01 40.21Q86.92 47.42 107.15 59.10Z"
        fill={color}
      />
    </svg>
  );
}

export function PauseIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="45 65 75 85" fill="none" {...props}>
      <path d="M77.95 109.01Q77.91 145.29 77.87 148.51A0.47 0.47 0.0 0177.40 148.97Q65.96 149.08 52.57 148.91Q49.83 148.88 49.21 145.69Q45.94 128.98 45.96 108.98Q45.98 88.98 49.28 72.27Q49.91 69.09 52.65 69.06Q66.04 68.92 77.48 69.05A0.47 0.47 0.0 0177.94 69.51Q77.98 72.73 77.95 109.01Z" fill={color} />
      <path d="M118.00 108.98Q118.02 128.97 114.75 145.69Q114.12 148.87 111.38 148.90Q97.99 149.07 86.55 148.96A0.47 0.47 0.0 0186.09 148.51Q86.04 145.28 86.01 109.01Q85.97 72.73 86.01 69.51A0.47 0.47 0.0 0186.48 69.05Q97.92 68.92 111.31 69.06Q114.05 69.09 114.68 72.27Q117.98 88.98 118.00 108.98Z" fill={color} />
    </svg>
  );
}

export function NextIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="220 80 55 55" fill="none" {...props}>
      <path d="M270.02 108.99Q269.97 119.56 269.99 132.05Q270.00 132.99 269.06 132.99L267.03 132.99Q266.06 132.99 266.06 132.02L266.06 112.27A0.32 0.32 0.0 00265.56 112.01Q262.59 114.07 260.45 115.39Q245.43 124.66 227.58 132.30C224.74 133.52 223.07 133.07 222.84 129.72Q222.02 118.13 222.02 109.00Q222.02 99.88 222.82 88.29C223.05 84.94 224.72 84.49 227.56 85.70Q245.42 93.33 260.45 102.59Q262.59 103.91 265.56 105.96A0.32 0.32 0.0 00266.06 105.70L266.04 85.95Q266.04 84.98 267.01 84.98L269.04 84.98Q269.98 84.98 269.98 85.92Q269.96 98.41 270.02 108.99Z" fill={color} />
    </svg>
  );
}

export function PreviousIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="220 80 55 55" fill="none" {...props}>
      <g transform="translate(492, 0) scale(-1, 1)">
        <path d="M270.02 108.99Q269.97 119.56 269.99 132.05Q270.00 132.99 269.06 132.99L267.03 132.99Q266.06 132.99 266.06 132.02L266.06 112.27A0.32 0.32 0.0 00265.56 112.01Q262.59 114.07 260.45 115.39Q245.43 124.66 227.58 132.30C224.74 133.52 223.07 133.07 222.84 129.72Q222.02 118.13 222.02 109.00Q222.02 99.88 222.82 88.29C223.05 84.94 224.72 84.49 227.56 85.70Q245.42 93.33 260.45 102.59Q262.59 103.91 265.56 105.96A0.32 0.32 0.0 00266.06 105.70L266.04 85.95Q266.04 84.98 267.01 84.98L269.04 84.98Q269.98 84.98 269.98 85.92Q269.96 98.41 270.02 108.99Z" fill={color} />
      </g>
    </svg>
  );
}

export function HeartIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} />
      ) : (
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth={1.5} fill="none" />
      )}
    </svg>
  );
}

export function QuranIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <path d="M6.5 2A2.5 2.5 0 004 4.5v15A2.5 2.5 0 006.5 22h11a.5.5 0 00.5-.5V19h1.5a.5.5 0 00.5-.5v-16a.5.5 0 00-.5-.5H6.5zm0 18a.5.5 0 010-1H17v1H6.5zM12 6a.5.5 0 01.5.5v4.793l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L11.5 11.293V6.5A.5.5 0 0112 6z" fill={color} />
      ) : (
        <path d="M6.5 2A2.5 2.5 0 004 4.5v15A2.5 2.5 0 006.5 22h11a.5.5 0 00.5-.5V19h1.5a.5.5 0 00.5-.5v-16a.5.5 0 00-.5-.5H6.5zm0 18a.5.5 0 010-1H17v1H6.5zm11-3H6.5A2.5 2.5 0 004 19.5V4.5A1.5 1.5 0 015.5 3H18v14z" stroke={color} strokeWidth={1.2} fill="none" />
      )}
    </svg>
  );
}

export function SettingsIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={1.5} />
      <path d="M19.622 10.395l-.104-.323a2.5 2.5 0 00-3.066-1.593l-.23.074c-.95.307-1.96-.312-2.127-1.3l-.04-.238a2.5 2.5 0 00-4.11 0l-.04.238c-.167.988-1.177 1.607-2.127 1.3l-.23-.074A2.5 2.5 0 004.482 10.072l.104.323c.312.967-.21 2.005-1.153 2.355l-.218.081a2.5 2.5 0 000 4.338l.218.081c.943.35 1.465 1.388 1.153 2.355l-.104.323a2.5 2.5 0 003.066 1.593l.23-.074c.95-.307 1.96.312 2.127 1.3l.04.238a2.5 2.5 0 004.11 0l.04-.238c.167-.988 1.177-1.607 2.127-1.3l.23.074a2.5 2.5 0 003.066-1.593l-.104-.323c-.312-.967.21-2.005 1.153-2.355l.218-.081a2.5 2.5 0 000-4.338l-.218-.081c-.943-.35-1.465-1.388-1.153-2.355z" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

export function LogoIcon({ size = 24, isDarkMode = true, ...props }: IconProps) {
  const fill = isDarkMode ? "#FFFFFF" : "#101820";
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" fill="none" {...props}>
      <path
        d="M436.69 266.09L308.26 266.09L427.06 217.31L418.32 196.03L297.58 245.61L389.13 152.58L372.75 136.46L284.03 226.61L333.27 110.1L312.1 101.15L261.5 220.87L261.5 220.87L261.5 90.9L238.5 90.9L238.5 219.33L189.72 100.53L168.44 109.26L218.02 230.01L124.99 138.45L108.87 154.84L199.02 243.56L82.51 194.32L73.56 215.49L193.28 266.09L193.28 266.09L63.31 266.09L63.31 289.09L222.57 289.09L202.42 309.57L150.2 363.9L166.58 380.02L215.97 328.57L215.98 328.56L238.5 305.66L238.5 334.31L238.5 334.31L238.5 409.1L261.5 409.1L261.5 305.02L281.98 325.17L336.31 377.39L352.43 361.01L300.98 311.62L300.97 311.61L278.07 289.09L306.72 289.09L306.72 289.09L436.69 289.09L436.69 266.09"
        fill={fill}
      />
    </svg>
  );
}
```

Note: This covers the 11 most critical navigation and player icons. The remaining ~55 icons from the mobile app's `Icons.tsx` follow the exact same conversion pattern (`Svg` → `svg`, `Path` → `path`, remove `react-native-svg` import, use `SVGProps`). They should be ported in a batch pass by reading the source file and doing the mechanical conversion.

- [ ] **Step 2: Write icon tests**

Create `src/__tests__/components/icons.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  HomeIcon,
  SearchIcon,
  PlayIcon,
  PauseIcon,
  LogoIcon,
  HeartIcon,
} from "@/components/icons";

describe("icons", () => {
  it("renders HomeIcon with default size", () => {
    const { container } = render(<HomeIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("renders HomeIcon with custom size", () => {
    const { container } = render(<HomeIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
  });

  it("renders HomeIcon outline by default", () => {
    const { container } = render(<HomeIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(1); // outline has multiple paths
  });

  it("renders HomeIcon filled variant", () => {
    const { container } = render(<HomeIcon filled />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill");
  });

  it("renders SearchIcon", () => {
    const { container } = render(<SearchIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PlayIcon", () => {
    const { container } = render(<PlayIcon />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders PauseIcon", () => {
    const { container } = render(<PauseIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2); // two bars
  });

  it("renders HeartIcon outline and filled", () => {
    const { container: outline } = render(<HeartIcon />);
    const { container: filled } = render(<HeartIcon filled />);
    const outlinePath = outline.querySelector("path");
    const filledPath = filled.querySelector("path");
    expect(outlinePath).toHaveAttribute("fill", "none");
    expect(filledPath).not.toHaveAttribute("fill", "none");
  });

  it("renders LogoIcon with dark mode colors", () => {
    const { container } = render(<LogoIcon isDarkMode />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill", "#FFFFFF");
  });

  it("renders LogoIcon with light mode colors", () => {
    const { container } = render(<LogoIcon isDarkMode={false} />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill", "#101820");
  });
});
```

- [ ] **Step 3: Run type check and tests**

```bash
npx tsc --noEmit && npm test
```

Expected: No type errors. All icon tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: port core custom SVG icons from mobile app"
```

---

### Task 7: Build Layout Shell

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/sidebar-nav-item.tsx`, `src/components/layout/bottom-player-bar.tsx`, `src/components/layout/mobile-tab-bar.tsx`, `src/components/layout/app-shell.tsx`
- Create: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Create sidebar nav item component**

Create `src/components/layout/sidebar-nav-item.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; filled?: boolean }>;
  label: string;
}

export function SidebarNavItem({ href, icon: Icon, label }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-[var(--text-alpha-10)] font-semibold"
          : "text-muted-foreground hover:bg-[var(--text-alpha-06)]"
      )}
    >
      <Icon size={20} filled={isActive} />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
```

- [ ] **Step 2: Create sidebar**

Create `src/components/layout/sidebar.tsx`:

```tsx
"use client";

import { LogoIcon, HomeIcon, SearchIcon, QuranIcon, CollectionIcon } from "@/components/icons";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useThemeStore, getResolvedTheme } from "@/stores/theme-store";

const NAV_ITEMS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/search", icon: SearchIcon, label: "Search" },
  { href: "/quran", icon: QuranIcon, label: "Read Quran" },
  { href: "/collection", icon: CollectionIcon, label: "Collection" },
] as const;

export function Sidebar() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const isDark = getResolvedTheme(themeMode) === "dark";

  return (
    <aside className="hidden md:flex flex-col w-16 lg:w-60 border-r border-border bg-sidebar shrink-0">
      <div className="flex items-center gap-2 px-4 py-5">
        <LogoIcon size={28} isDarkMode={isDark} />
        <span className="hidden lg:inline text-lg font-bold">Bayaan</span>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="mt-auto px-2 pb-4">
        <SidebarNavItem href="/settings" icon={SettingsIcon} label="Settings" />
      </div>
    </aside>
  );
}

import { SettingsIcon } from "@/components/icons";
```

- [ ] **Step 3: Create bottom player bar placeholder**

Create `src/components/layout/bottom-player-bar.tsx`:

```tsx
export function BottomPlayerBar() {
  return (
    <footer className="h-20 border-t border-border bg-background/80 backdrop-blur-2xl flex items-center px-4">
      <p className="text-sm text-muted-foreground">Player — built in Plan 2</p>
    </footer>
  );
}
```

- [ ] **Step 4: Create mobile tab bar**

Create `src/components/layout/mobile-tab-bar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, QuranIcon, CollectionIcon, SettingsIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/search", icon: SearchIcon, label: "Search" },
  { href: "/quran", icon: QuranIcon, label: "Read" },
  { href: "/collection", icon: CollectionIcon, label: "Collection" },
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-2xl">
      <div className="flex items-center justify-around py-2">
        {TABS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon size={20} filled={isActive} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create app shell**

Create `src/components/layout/app-shell.tsx`:

```tsx
import { Sidebar } from "./sidebar";
import { BottomPlayerBar } from "./bottom-player-bar";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <div className="hidden md:block">
        <BottomPlayerBar />
      </div>
      <MobileTabBar />
    </div>
  );
}
```

- [ ] **Step 6: Create app group layout**

Create `src/app/(app)/layout.tsx`:

```tsx
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 7: Write layout tests**

Create `src/__tests__/components/layout/sidebar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SidebarNavItem", () => {
  const MockIcon = ({ size, filled }: { size?: number; filled?: boolean }) => (
    <svg data-testid="icon" data-filled={filled} width={size} height={size} />
  );

  it("renders label and icon", () => {
    render(<SidebarNavItem href="/" icon={MockIcon} label="Home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("marks active route with filled icon", () => {
    render(<SidebarNavItem href="/" icon={MockIcon} label="Home" />);
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-filled", "true");
  });

  it("renders inactive for non-matching route", () => {
    render(<SidebarNavItem href="/search" icon={MockIcon} label="Search" />);
    const icon = screen.getByTestId("icon");
    expect(icon).toHaveAttribute("data-filled", "false");
  });
});
```

Create `src/__tests__/components/layout/mobile-tab-bar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("MobileTabBar", () => {
  it("renders all 5 tab items", () => {
    render(<MobileTabBar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Collection")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders tab links with correct hrefs", () => {
    render(<MobileTabBar />);
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
    const searchLink = screen.getByText("Search").closest("a");
    expect(searchLink).toHaveAttribute("href", "/search");
  });
});
```

- [ ] **Step 8: Run tests**

```bash
npm test
```

Expected: All layout tests pass.

- [ ] **Step 9: Verify layout renders visually**

Run `npm run dev`. The home page should show:
- Left sidebar with Bayaan logo and nav items (on desktop)
- Bottom player bar placeholder (on desktop)
- Bottom tab bar (resize browser to mobile width)
- Sidebar collapses to icons only at tablet width

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: build responsive Spotify-style layout shell"
```

---

### Task 8: Create API Proxy Routes

**Files:**
- Create: `src/app/api/bayaan/[...path]/route.ts`, `src/app/api/quran/[...path]/route.ts`, `src/lib/api.ts`

- [ ] **Step 1: Create Bayaan API proxy**

Create `src/app/api/bayaan/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const BAYAAN_API_URL = process.env.NEXT_PUBLIC_BAYAAN_API_URL ?? "https://api.thebayaan.com";
const BAYAAN_API_KEY = process.env.BAYAAN_API_KEY ?? "";

async function proxyToBayaan(request: NextRequest, params: { path: string[] }): Promise<NextResponse> {
  const path = params.path.join("/");
  const url = new URL(`/v1/${path}`, BAYAAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {
    Authorization: `Bearer ${BAYAAN_API_KEY}`,
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyToBayaan(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyToBayaan(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyToBayaan(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyToBayaan(request, await params);
}
```

- [ ] **Step 2: Create QuranCDN API proxy**

Create `src/app/api/quran/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const QURAN_API_URL = "https://api.qurancdn.com/api/qdc";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const apiPath = path.join("/");
  const url = new URL(`/api/qdc/${apiPath}`, QURAN_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
```

- [ ] **Step 3: Create API client helper**

Create `src/lib/api.ts`:

```typescript
const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

export async function fetchBayaan<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}/api/bayaan/${path}`, init);
  if (!response.ok) {
    throw new Error(`Bayaan API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchQuran<T>(path: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const url = `${BASE_URL}/api/quran/${path}?${searchParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Quran API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
```

- [ ] **Step 4: Write API client tests**

Create `src/__tests__/lib/api.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBayaan, fetchQuran } from "@/lib/api";

describe("fetchBayaan", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct proxy URL", async () => {
    const mockResponse = { data: "test" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchBayaan("reciters");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bayaan/reciters"),
      undefined
    );
    expect(result).toEqual(mockResponse);
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchBayaan("reciters")).rejects.toThrow("Bayaan API error: 500");
  });
});

describe("fetchQuran", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the correct proxy URL with params", async () => {
    const mockResponse = { verses: [] };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await fetchQuran("verses/by_chapter/1", { per_page: "10" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/quran/verses/by_chapter/1?per_page=10"),
    );
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchQuran("verses/by_chapter/999")).rejects.toThrow("Quran API error: 404");
  });
});
```

- [ ] **Step 5: Run type check and tests**

```bash
npx tsc --noEmit && npm test
```

Expected: No type errors. All API tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add API proxy routes for Bayaan and QuranCDN"
```

---

### Task 9: Create Shared Data Types

**Files:**
- Create: `src/types/quran.ts`, `src/types/audio.ts`, `src/types/reciter.ts`
- Create: `src/data/surah-glyph-map.ts`
- Copy: `data/surahData.json` from mobile app

- [ ] **Step 1: Create Quran types**

Create `src/types/quran.ts`:

```typescript
export interface Surah {
  id: number;
  name: string;
  name_arabic: string;
  name_simple: string;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  verses_count: number;
  translated_name_english: string;
}

export interface Verse {
  id: number;
  surah_number: number;
  ayah_number: number;
  verse_key: string;
  text: string;
  translation?: string;
  transliteration?: string;
}

export interface VerseBookmark {
  id: string;
  user_id: string;
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  note?: string;
  created_at: string;
}

export interface VerseHighlight {
  id: string;
  user_id: string;
  verse_key: string;
  color: "yellow" | "green" | "blue" | "pink" | "purple";
  created_at: string;
}

export interface VerseNote {
  id: string;
  user_id: string;
  verse_key: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AyahTimestamp {
  surah_number: number;
  ayah_number: number;
  timestamp_from: number;
  timestamp_to: number;
  duration_ms: number;
}

export interface ReadingThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  card: string;
}

export interface ReadingTheme {
  id: string;
  name: string;
  mode: "light" | "dark";
  colors: ReadingThemeColors;
}
```

- [ ] **Step 2: Create audio types**

Create `src/types/audio.ts`:

```typescript
export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  reciterId: string;
  reciterName: string;
  surahId: number;
  rewayatId: string;
}

export type RepeatMode = "none" | "queue" | "track";

export interface PlaybackState {
  isPlaying: boolean;
  currentTrackIndex: number;
  positionMs: number;
  durationMs: number;
  rate: number;
  volume: number;
  isMuted: boolean;
}

export interface PlayerSettings {
  repeatMode: RepeatMode;
  shuffle: boolean;
  rate: number;
  sleepTimerMinutes: number | null;
}
```

- [ ] **Step 3: Create reciter types**

Create `src/types/reciter.ts`:

```typescript
export type RecitationStyle = "murattal" | "mojawwad" | "molim";

export interface Rewayat {
  id: string;
  reciter_id: string;
  name: string;
  style: RecitationStyle;
  server: string;
  source_type: string;
  surah_total: number;
  surah_list: number[];
  mp3quran_read_id: number | null;
  qdc_reciter_id: number | null;
}

export interface Reciter {
  id: string;
  name: string;
  name_arabic?: string;
  slug: string;
  date?: string;
  image_url?: string;
  bio?: string;
  is_featured: boolean;
  rewayat: Rewayat[];
}
```

- [ ] **Step 4: Copy surah data and create glyph map**

```bash
cp ~/theBayaan/Bayaan/data/surahData.json src/data/surah-data.json
```

Create `src/data/surah-glyph-map.ts`:

```typescript
export const surahGlyphMap: Record<number, string> = {
  1: "\uE904", 2: "\uE905", 3: "\uE906", 4: "\uE907", 5: "\uE908",
  6: "\uE90B", 7: "\uE90C", 8: "\uE90D", 9: "\uE90E", 10: "\uE90F",
  11: "\uE910", 12: "\uE911", 13: "\uE912", 14: "\uE913", 15: "\uE914",
  16: "\uE915", 17: "\uE916", 18: "\uE917", 19: "\uE918", 20: "\uE919",
  21: "\uE91A", 22: "\uE91B", 23: "\uE91C", 24: "\uE91D", 25: "\uE91E",
  26: "\uE91F", 27: "\uE920", 28: "\uE921", 29: "\uE922", 30: "\uE923",
  31: "\uE924", 32: "\uE925", 33: "\uE926", 34: "\uE92E", 35: "\uE92F",
  36: "\uE930", 37: "\uE931", 38: "\uE909", 39: "\uE90A", 40: "\uE927",
  41: "\uE928", 42: "\uE929", 43: "\uE92A", 44: "\uE92B", 45: "\uE92C",
  46: "\uE92D", 47: "\uE932", 48: "\uE902", 49: "\uE933", 50: "\uE934",
  51: "\uE935", 52: "\uE936", 53: "\uE937", 54: "\uE938", 55: "\uE939",
  56: "\uE93A", 57: "\uE93B", 58: "\uE93C", 59: "\uE900", 60: "\uE901",
  61: "\uE941", 62: "\uE942", 63: "\uE943", 64: "\uE944", 65: "\uE945",
  66: "\uE946", 67: "\uE947", 68: "\uE948", 69: "\uE949", 70: "\uE94A",
  71: "\uE94B", 72: "\uE94C", 73: "\uE94D", 74: "\uE94E", 75: "\uE94F",
  76: "\uE950", 77: "\uE951", 78: "\uE952", 79: "\uE93D", 80: "\uE93E",
  81: "\uE93F", 82: "\uE940", 83: "\uE953", 84: "\uE954", 85: "\uE955",
  86: "\uE956", 87: "\uE957", 88: "\uE958", 89: "\uE959", 90: "\uE95A",
  91: "\uE95B", 92: "\uE95C", 93: "\uE95D", 94: "\uE95E", 95: "\uE95F",
  96: "\uE960", 97: "\uE961", 98: "\uE962", 99: "\uE963", 100: "\uE964",
  101: "\uE965", 102: "\uE966", 103: "\uE967", 104: "\uE968", 105: "\uE969",
  106: "\uE96A", 107: "\uE96B", 108: "\uE96C", 109: "\uE96D", 110: "\uE96E",
  111: "\uE96F", 112: "\uE970", 113: "\uE971", 114: "\uE972",
};
```

- [ ] **Step 5: Write type validation tests**

Create `src/__tests__/types/reciter.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import type { Reciter, Rewayat } from "@/types/reciter";
import type { Track } from "@/types/audio";
import type { Surah, AyahTimestamp } from "@/types/quran";

describe("type contracts", () => {
  it("Reciter has required fields", () => {
    const reciter: Reciter = {
      id: "abc-123",
      name: "Mishary Alafasy",
      slug: "mishary-alafasy",
      is_featured: true,
      rewayat: [],
    };
    expect(reciter.id).toBe("abc-123");
    expect(reciter.rewayat).toHaveLength(0);
  });

  it("Rewayat has required fields", () => {
    const rewayat: Rewayat = {
      id: "rw-1",
      reciter_id: "abc-123",
      name: "Hafs A'n Assem",
      style: "murattal",
      server: "https://cdn.thebayaan.com/quran/recitations/mishary-alafasy/hafs/murattal/default",
      source_type: "bayaan",
      surah_total: 114,
      surah_list: [1, 2, 3],
      mp3quran_read_id: 12,
      qdc_reciter_id: null,
    };
    expect(rewayat.style).toBe("murattal");
    expect(rewayat.surah_list).toContain(1);
  });

  it("Track has all audio metadata", () => {
    const track: Track = {
      id: "t-1",
      url: "https://cdn.thebayaan.com/quran/recitations/test/001.mp3",
      title: "Al-Fatiha",
      artist: "Mishary Alafasy",
      artwork: "https://cdn.thebayaan.com/assets/reciter-images/mishary.jpg",
      duration: 60000,
      reciterId: "abc-123",
      reciterName: "Mishary Alafasy",
      surahId: 1,
      rewayatId: "rw-1",
    };
    expect(track.url).toContain("cdn.thebayaan.com");
  });

  it("AyahTimestamp has timing data", () => {
    const ts: AyahTimestamp = {
      surah_number: 1,
      ayah_number: 1,
      timestamp_from: 0,
      timestamp_to: 5000,
      duration_ms: 5000,
    };
    expect(ts.duration_ms).toBe(ts.timestamp_to - ts.timestamp_from);
  });
});
```

- [ ] **Step 6: Run type check and tests**

```bash
npx tsc --noEmit && npm test
```

Expected: No type errors. All type tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add shared types and data files ported from mobile app"
```

---

### Task 10: Create Placeholder Pages

**Files:**
- Create all remaining page files under `src/app/(app)/`

- [ ] **Step 1: Create placeholder page component**

Each placeholder page follows this pattern. Create all files below:

`src/app/(app)/search/page.tsx`:
```tsx
export default function SearchPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Search</h1></div>;
}
```

`src/app/(app)/reciter/[slug]/page.tsx`:
```tsx
export default function ReciterPage({ params }: { params: Promise<{ slug: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Reciter Profile</h1></div>;
}
```

`src/app/(app)/surah/[id]/page.tsx`:
```tsx
export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Surah</h1></div>;
}
```

`src/app/(app)/quran/page.tsx`:
```tsx
export default function QuranPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Quran — Mushaf View</h1></div>;
}
```

`src/app/(app)/quran/[surah]/page.tsx`:
```tsx
export default function QuranSurahPage({ params }: { params: Promise<{ surah: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Quran — Reading View</h1></div>;
}
```

`src/app/(app)/quran/[surah]/[ayah]/page.tsx`:
```tsx
export default function QuranAyahPage({ params }: { params: Promise<{ surah: string; ayah: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Quran — Verse</h1></div>;
}
```

`src/app/(app)/collection/page.tsx`:
```tsx
export default function CollectionPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Collection</h1></div>;
}
```

`src/app/(app)/collection/playlists/page.tsx`:
```tsx
export default function PlaylistsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Playlists</h1></div>;
}
```

`src/app/(app)/collection/playlists/[id]/page.tsx`:
```tsx
export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Playlist</h1></div>;
}
```

`src/app/(app)/collection/favorites/page.tsx`:
```tsx
export default function FavoritesPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Favorites</h1></div>;
}
```

`src/app/(app)/collection/bookmarks/page.tsx`:
```tsx
export default function BookmarksPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Bookmarks</h1></div>;
}
```

`src/app/(app)/collection/notes/page.tsx`:
```tsx
export default function NotesPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Notes</h1></div>;
}
```

`src/app/(app)/adhkar/page.tsx`:
```tsx
export default function AdhkarPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Adhkar</h1></div>;
}
```

`src/app/(app)/adhkar/[superId]/page.tsx`:
```tsx
export default function AdhkarCategoryPage({ params }: { params: Promise<{ superId: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Adhkar Category</h1></div>;
}
```

`src/app/(app)/adhkar/[superId]/[dhikrId]/page.tsx`:
```tsx
export default function DhikrPage({ params }: { params: Promise<{ superId: string; dhikrId: string }> }) {
  return <div className="p-6"><h1 className="text-2xl font-bold">Dhikr</h1></div>;
}
```

`src/app/(app)/settings/page.tsx`:
```tsx
export default function SettingsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>;
}
```

- [ ] **Step 2: Run type check and verify navigation**

```bash
npx tsc --noEmit
```

Run `npm run dev` and click through sidebar links. Each page should render its heading. Navigation should work between all routes.

- [ ] **Step 3: Format all files**

```bash
npx prettier --write "src/**/*.{ts,tsx,css}"
```

- [ ] **Step 4: Final type check**

```bash
npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add placeholder pages for all routes"
```

---

## Completion Criteria

After completing all 10 tasks, the app should:
1. Start with `npm run dev` without errors
2. Show the Spotify-style layout: sidebar + content + player bar
3. Dark mode by default with Bayaan's exact color palette
4. Manrope font renders across all text
5. Custom Bayaan icons display in sidebar and mobile tab bar
6. All routes navigable from sidebar/tab bar
7. API proxy routes respond at `/api/bayaan/*` and `/api/quran/*`
8. `npx tsc --noEmit` passes with zero errors
9. `npm test` passes with all tests green
10. `npx prettier --write` produces no changes
