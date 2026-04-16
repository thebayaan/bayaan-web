# Bayaan Web — Plan 7: Adhkar & Settings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Adhkar pages (bento grid, category detail, dhikr reader, tasbeeh counter) and the Settings page (theme toggle, reading preferences).

**Architecture:** Adhkar data is bundled from the mobile app's JSON files. The tasbeeh counter uses local state with a circular SVG progress ring. Settings page reads/writes to the Zustand theme and reading settings stores.

**Tech Stack:** shadcn/ui (Switch, Select), Zustand stores (theme, reading settings)

**Depends on:** Plans 1-4 completed

---

### Task 1: Adhkar Data + Pages

**Files:**

- Create: `src/data/adhkar-data.ts`
- Modify: `src/app/(app)/adhkar/page.tsx`, `src/app/(app)/adhkar/[superId]/page.tsx`, `src/app/(app)/adhkar/[superId]/[dhikrId]/page.tsx`

- [ ] **Step 1: Create adhkar placeholder data**

Since the mobile app's adhkar data is in SQLite, we'll create a simplified bundled version for the web. Create `src/data/adhkar-data.ts`:

```typescript
export interface AdhkarCategory {
  id: string;
  name: string;
  name_arabic: string;
  description: string;
  count: number;
  color: string;
}

export interface Dhikr {
  id: string;
  category_id: string;
  text_arabic: string;
  translation: string;
  repetitions: number;
  reference: string;
}

export const ADHKAR_CATEGORIES: AdhkarCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    name_arabic: "أذكار الصباح",
    description: "Remembrances for the morning",
    count: 12,
    color: "#f59e0b",
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    name_arabic: "أذكار المساء",
    description: "Remembrances for the evening",
    count: 12,
    color: "#6366f1",
  },
  {
    id: "after-prayer",
    name: "After Prayer",
    name_arabic: "أذكار بعد الصلاة",
    description: "Remembrances after salah",
    count: 8,
    color: "#10b981",
  },
  {
    id: "sleep",
    name: "Before Sleep",
    name_arabic: "أذكار النوم",
    description: "Remembrances before sleeping",
    count: 6,
    color: "#8b5cf6",
  },
  {
    id: "wakeup",
    name: "Upon Waking",
    name_arabic: "أذكار الاستيقاظ",
    description: "Remembrances upon waking",
    count: 4,
    color: "#f97316",
  },
  {
    id: "general",
    name: "General Adhkar",
    name_arabic: "أذكار عامة",
    description: "Everyday remembrances",
    count: 10,
    color: "#06b6d4",
  },
];

export const SAMPLE_DHIKR: Dhikr[] = [
  {
    id: "1",
    category_id: "morning",
    text_arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    translation:
      "We have reached the morning and at this very time all sovereignty belongs to Allah. Praise is for Allah. None has the right to be worshipped except Allah alone, without any partner.",
    repetitions: 1,
    reference: "Muslim",
  },
  {
    id: "2",
    category_id: "morning",
    text_arabic:
      "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    translation:
      "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
    repetitions: 1,
    reference: "Tirmidhi",
  },
  {
    id: "3",
    category_id: "morning",
    text_arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    translation: "Glory is to Allah and praise is to Him.",
    repetitions: 100,
    reference: "Muslim",
  },
];

export function getCategoryById(id: string): AdhkarCategory | undefined {
  return ADHKAR_CATEGORIES.find((c) => c.id === id);
}

export function getDhikrByCategory(categoryId: string): Dhikr[] {
  return SAMPLE_DHIKR.filter((d) => d.category_id === categoryId);
}
```

- [ ] **Step 2: Build adhkar home page**

Replace `src/app/(app)/adhkar/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ADHKAR_CATEGORIES } from "@/data/adhkar-data";

export default function AdhkarPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Adhkar</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {ADHKAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/adhkar/${cat.id}`}
            className="relative overflow-hidden rounded-xl p-5 transition-transform hover:scale-[1.02]"
            style={{
              backgroundColor: cat.color + "20",
              borderColor: cat.color + "40",
              borderWidth: 1,
            }}
          >
            <p className="font-[UthmanicHafs] text-xl font-bold" dir="rtl">
              {cat.name_arabic}
            </p>
            <p className="mt-1 text-sm font-medium">{cat.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">{cat.count} adhkar</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build category detail page**

Replace `src/app/(app)/adhkar/[superId]/page.tsx`:

```tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { getCategoryById, getDhikrByCategory } from "@/data/adhkar-data";

export default function AdhkarCategoryPage({ params }: { params: Promise<{ superId: string }> }) {
  const { superId } = use(params);
  const category = getCategoryById(superId);
  const dhikrList = getDhikrByCategory(superId);

  if (!category) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold">{category.name}</h1>
      <p className="mb-6 font-[UthmanicHafs] text-lg" dir="rtl">
        {category.name_arabic}
      </p>
      <div className="space-y-3">
        {dhikrList.map((dhikr, idx) => (
          <Link
            key={dhikr.id}
            href={`/adhkar/${superId}/${dhikr.id}`}
            className="block rounded-xl bg-[var(--text-alpha-04)] p-4 transition-colors hover:bg-[var(--text-alpha-06)]"
          >
            <p className="font-[UthmanicHafs] text-lg leading-relaxed" dir="rtl">
              {dhikr.text_arabic}
            </p>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{dhikr.translation}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[var(--text-alpha-06)] px-2 py-0.5 text-xs">
                {dhikr.repetitions}x
              </span>
              <span className="text-muted-foreground text-xs">{dhikr.reference}</span>
            </div>
          </Link>
        ))}
        {dhikrList.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">Full adhkar data coming soon</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build dhikr reader page with tasbeeh counter**

Replace `src/app/(app)/adhkar/[superId]/[dhikrId]/page.tsx`:

```tsx
"use client";

import { use, useState } from "react";
import { getDhikrByCategory } from "@/data/adhkar-data";

export default function DhikrPage({
  params,
}: {
  params: Promise<{ superId: string; dhikrId: string }>;
}) {
  const { superId, dhikrId } = use(params);
  const dhikrList = getDhikrByCategory(superId);
  const dhikr = dhikrList.find((d) => d.id === dhikrId);
  const [count, setCount] = useState(0);

  if (!dhikr) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dhikr not found</h1>
      </div>
    );
  }

  const target = dhikr.repetitions;
  const progress = Math.min(count / target, 1);
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
      <p
        className="mb-8 max-w-lg text-center font-[UthmanicHafs] text-2xl leading-relaxed"
        dir="rtl"
      >
        {dhikr.text_arabic}
      </p>
      <p className="text-muted-foreground mb-8 max-w-md text-center text-sm">{dhikr.translation}</p>

      {/* Tasbeeh Counter */}
      <button
        onClick={() => setCount((c) => c + 1)}
        className="relative flex h-40 w-40 items-center justify-center rounded-full transition-transform active:scale-95"
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="var(--text-alpha-06)"
            strokeWidth="4"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="text-center">
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-muted-foreground text-xs">/ {target}</p>
        </div>
      </button>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setCount(0)}
          className="rounded-lg bg-[var(--text-alpha-06)] px-4 py-2 text-sm transition-colors hover:bg-[var(--text-alpha-10)]"
        >
          Reset
        </button>
      </div>

      <p className="text-muted-foreground mt-4 text-xs">{dhikr.reference}</p>
    </div>
  );
}
```

- [ ] **Step 5: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build adhkar pages with bento grid and tasbeeh counter"
```

---

### Task 2: Settings Page

**Files:**

- Modify: `src/app/(app)/settings/page.tsx`

- [ ] **Step 1: Install shadcn Select and Switch**

```bash
npx shadcn@latest add select switch
```

- [ ] **Step 2: Build settings page**

Replace `src/app/(app)/settings/page.tsx`:

```tsx
"use client";

import { useThemeStore } from "@/stores/theme-store";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { LIGHT_READING_THEMES, DARK_READING_THEMES } from "@/data/reading-themes";
import { SettingsIcon } from "@/components/icons";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsPage() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const readingSettings = useReadingSettingsStore();

  return (
    <div className="max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      {/* Theme */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`rounded-lg px-4 py-2 text-sm capitalize transition-colors ${
                themeMode === mode
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground bg-[var(--text-alpha-06)]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      {/* Reading Settings */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Reading</h2>
        <div className="space-y-4">
          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Arabic Font Size</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  readingSettings.setFontSize(Math.max(1.2, readingSettings.fontSize - 0.2))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm"
              >
                A-
              </button>
              <span className="w-12 text-center text-sm">
                {readingSettings.fontSize.toFixed(1)}
              </span>
              <button
                onClick={() =>
                  readingSettings.setFontSize(Math.min(3.0, readingSettings.fontSize + 0.2))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-alpha-06)] text-sm"
              >
                A+
              </button>
            </div>
          </div>

          {/* Toggles */}
          <SettingToggle
            label="Show Transliteration"
            checked={readingSettings.showTransliteration}
            onChange={readingSettings.toggleTransliteration}
          />
          <SettingToggle
            label="Word-by-Word"
            checked={readingSettings.showWordByWord}
            onChange={readingSettings.toggleWordByWord}
          />
          <SettingToggle
            label="Tajweed Colors"
            checked={readingSettings.showTajweed}
            onChange={readingSettings.toggleTajweed}
          />
        </div>
      </section>

      {/* Reading Theme */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Reading Theme</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {LIGHT_READING_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => readingSettings.setLightTheme(theme.id)}
              className={`rounded-lg border p-3 transition-colors ${
                readingSettings.lightThemeId === theme.id
                  ? "border-foreground"
                  : "border-transparent hover:border-[var(--text-alpha-10)]"
              }`}
              style={{ backgroundColor: theme.colors.background }}
            >
              <div
                className="h-4 w-full rounded"
                style={{ backgroundColor: theme.colors.text, opacity: 0.2 }}
              />
              <p className="mt-1 text-[10px]" style={{ color: theme.colors.text }}>
                {theme.name}
              </p>
            </button>
          ))}
        </div>
        <p className="text-muted-foreground mt-2 text-xs">Dark themes</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {DARK_READING_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => readingSettings.setDarkTheme(theme.id)}
              className={`rounded-lg border p-3 transition-colors ${
                readingSettings.darkThemeId === theme.id
                  ? "border-foreground"
                  : "border-transparent hover:border-[var(--text-alpha-10)]"
              }`}
              style={{ backgroundColor: theme.colors.background }}
            >
              <div
                className="h-4 w-full rounded"
                style={{ backgroundColor: theme.colors.text, opacity: 0.2 }}
              />
              <p className="mt-1 text-[10px]" style={{ color: theme.colors.text }}>
                {theme.name}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm">{label}</label>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-10 rounded-full transition-colors ${
          checked ? "bg-foreground" : "bg-[var(--text-alpha-10)]"
        }`}
      >
        <div
          className={`bg-background absolute left-1 top-1 h-4 w-4 rounded-full transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
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
git commit -m "feat: build settings page with theme toggle and reading preferences"
```

---

## Completion Criteria

1. `/adhkar` shows bento grid of adhkar categories
2. `/adhkar/{id}` shows dhikr list for a category
3. `/adhkar/{id}/{dhikrId}` shows dhikr reader with tasbeeh counter
4. Tasbeeh counter increments on click with circular SVG progress
5. `/settings` shows theme toggle (light/dark/system)
6. Settings page shows reading font size controls
7. Settings page shows reading theme picker (12 themes)
8. All settings persist to localStorage via Zustand
9. `npx tsc --noEmit` clean, `npm test` all green
