# Bayaan Web — Plan 4: Quran Reader

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a quran.com-reference Quran reading experience with page-accurate Mushaf display (QCF V2 fonts), verse-by-verse reading view with translations, and reading settings/themes.

**Architecture:** Two reading modes: Mushaf view renders page-accurate Quran using QCF V2 per-page fonts loaded dynamically via FontFace API, with words positioned line-by-line using CSS flexbox (`justify-content: space-between`). Reading view renders verse-by-verse flowing text using KFGQPC Uthmani Hafs with translations below (sanitized with DOMPurify). Both modes fetch verse data from QuranCDN API (via our `/api/quran` proxy) which returns word-level glyph codes. A dedicated reading settings store manages theme, font size, translation preferences.

**Tech Stack:** FontFace API, QuranCDN API, KFGQPC Uthmani Hafs font, QCF V2 fonts from `static.qurancdn.com`, DOMPurify (HTML sanitization), Zustand, SWR, shadcn/ui

**Testing:** Font loading hook tests, verse rendering tests, API hook tests, reading settings store tests.

**Reference:** [quran/quran.com-frontend-next](https://github.com/quran/quran.com-frontend-next) — our primary reference for rendering patterns.

**Spec:** `docs/superpowers/specs/2026-04-13-bayaan-web-design.md` (Section 4)

**Depends on:** Plans 1-3 — all completed. DOMPurify already installed (`npm install dompurify @types/dompurify`).

---

## File Structure (Plan 4)

```
src/
├── types/
│   └── quran-api.ts                    # QuranCDN API response types
├── hooks/
│   ├── use-qcf-font.ts                # Dynamic QCF font loading via FontFace
│   ├── use-verses-by-page.ts          # Fetch verses for a mushaf page
│   └── use-verses-by-chapter.ts       # Fetch verses for a chapter
├── stores/
│   └── reading-settings-store.ts      # Font size, theme, translation prefs
├── lib/
│   └── sanitize.ts                    # DOMPurify wrapper for translation HTML
├── components/
│   └── quran/
│       ├── quran-word.tsx             # Single word — QCF glyph or fallback
│       ├── verse-text.tsx             # Row of words
│       ├── mushaf-page.tsx            # Single mushaf page (15 lines)
│       ├── mushaf-view.tsx            # Paginated mushaf with navigation
│       ├── reading-verse.tsx          # Single verse with translation
│       ├── reading-view.tsx           # Scrollable verse-by-verse view
│       └── surah-header.tsx           # Surah name header + bismillah
├── data/
│   └── reading-themes.ts             # 12 reading themes from mobile app
├── app/(app)/
│   ├── quran/page.tsx                 # Mushaf view (REPLACE)
│   └── quran/[surah]/page.tsx         # Reading view (REPLACE)
├── public/fonts/
│   └── UthmanicHafs1Ver18.woff2      # KFGQPC fallback font
└── __tests__/
    ├── hooks/
    │   └── use-qcf-font.test.ts
    ├── stores/
    │   └── reading-settings-store.test.ts
    └── components/quran/
        ├── quran-word.test.tsx
        └── verse-text.test.tsx
```

---

### Task 1: QuranCDN API Types + Verse Data Hooks

**Files:**

- Create: `src/types/quran-api.ts`, `src/hooks/use-verses-by-page.ts`, `src/hooks/use-verses-by-chapter.ts`

- [ ] **Step 1: Create QuranCDN API response types**

Create `src/types/quran-api.ts`:

```typescript
export interface QcfWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: "word" | "end" | "pause";
  code_v2: string;
  page_number: number;
  line_number: number;
  text_uthmani: string;
  text_imlaei_simple: string;
  qpc_uthmani_hafs: string;
  verse_key: string;
  verse_id: number;
  location: string;
  translation?: { text: string; language_name: string };
  transliteration?: { text: string; language_name: string };
}

export interface QcfVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  page_number: number;
  juz_number: number;
  words: QcfWord[];
  text_uthmani: string;
  chapter_id: number;
  translations?: Array<{
    id: number;
    resource_id: number;
    resource_name: string;
    language_id: number;
    text: string;
  }>;
}

export interface VersesResponse {
  verses: QcfVerse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}
```

- [ ] **Step 2: Create verse-by-page hook**

Create `src/hooks/use-verses-by-page.ts`:

```typescript
import useSWR from "swr";
import { fetchQuran } from "@/lib/api";
import type { VersesResponse } from "@/types/quran-api";

const WORD_FIELDS =
  "verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs,line_number";

export function useVersesByPage(pageNumber: number) {
  const { data, error, isLoading } = useSWR<VersesResponse>(
    pageNumber > 0
      ? `verses/by_page/${pageNumber}?words=true&per_page=all&filter_page_words=true&word_fields=${WORD_FIELDS}&mushaf=1`
      : null,
    fetchQuran,
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );
  return { verses: data?.verses ?? [], isLoading, error };
}
```

- [ ] **Step 3: Create verse-by-chapter hook**

Create `src/hooks/use-verses-by-chapter.ts`:

```typescript
import useSWR from "swr";
import { fetchQuran } from "@/lib/api";
import type { VersesResponse } from "@/types/quran-api";

const WORD_FIELDS =
  "verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs";

export function useVersesByChapter(
  chapterId: number,
  page: number = 1,
  translationIds: string = "131",
) {
  const params = new URLSearchParams({
    words: "true",
    per_page: "50",
    fields: "text_uthmani,chapter_id,hizb_number",
    translations: translationIds,
    word_fields: WORD_FIELDS,
    mushaf: "1",
    page: page.toString(),
  });
  const { data, error, isLoading } = useSWR<VersesResponse>(
    chapterId > 0 ? `verses/by_chapter/${chapterId}?${params.toString()}` : null,
    fetchQuran,
    { revalidateOnFocus: false, dedupingInterval: 300000 },
  );
  return { verses: data?.verses ?? [], pagination: data?.pagination ?? null, isLoading, error };
}
```

- [ ] **Step 4: Create DOMPurify sanitizer**

Create `src/lib/sanitize.ts`:

```typescript
import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "sup", "sub", "br", "span", "p"],
    ALLOWED_ATTR: ["class"],
  });
}
```

- [ ] **Step 5: Run type check and tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add QuranCDN API types, verse hooks, and HTML sanitizer"
```

---

### Task 2: QCF Font Loading Hook

**Files:**

- Create: `src/hooks/use-qcf-font.ts`
- Test: `src/__tests__/hooks/use-qcf-font.test.ts`

- [ ] **Step 1: Write tests**

Create `src/__tests__/hooks/use-qcf-font.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockFontsSet = new Set<unknown>();
vi.stubGlobal(
  "FontFace",
  vi.fn(function (family: string) {
    return { family, load: vi.fn().mockResolvedValue(undefined), status: "loaded" };
  }),
);
Object.defineProperty(document, "fonts", {
  value: {
    add: vi.fn((ff: unknown) => mockFontsSet.add(ff)),
    has: vi.fn(() => false),
    check: vi.fn(() => false),
  },
  writable: true,
});

import { useQcfFont } from "@/hooks/use-qcf-font";

describe("useQcfFont", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFontsSet.clear();
  });

  it("loads font for a page number", async () => {
    renderHook(() => useQcfFont([1]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledWith("p1-v2", expect.stringContaining("p1.woff2"));
  });

  it("returns loaded status", async () => {
    const { result } = renderHook(() => useQcfFont([1]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(result.current.isPageFontLoaded(1)).toBe(true);
  });

  it("loads multiple pages", async () => {
    renderHook(() => useQcfFont([1, 2, 3]));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(FontFace).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: Implement hook**

Create `src/hooks/use-qcf-font.ts`:

```typescript
"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const QCF_FONT_CDN = "https://static.qurancdn.com/fonts/quran/hafs/v2/woff2";
const loadedFonts = new Set<number>();

export function useQcfFont(pageNumbers: number[]) {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(() => new Set(loadedFonts));
  const loadingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const toLoad = pageNumbers.filter((p) => !loadedFonts.has(p) && !loadingRef.current.has(p));
    if (toLoad.length === 0) return;

    toLoad.forEach((pageNum) => {
      loadingRef.current.add(pageNum);
      const fontName = `p${pageNum}-v2`;
      const fontUrl = `url('${QCF_FONT_CDN}/p${pageNum}.woff2') format('woff2')`;
      const fontFace = new FontFace(fontName, fontUrl);
      document.fonts.add(fontFace);
      fontFace
        .load()
        .then(() => {
          loadedFonts.add(pageNum);
          loadingRef.current.delete(pageNum);
          setLoadedPages((prev) => new Set([...prev, pageNum]));
        })
        .catch((err) => {
          console.error(`Failed to load QCF font for page ${pageNum}:`, err);
          loadingRef.current.delete(pageNum);
        });
    });
  }, [pageNumbers]);

  const isPageFontLoaded = useCallback(
    (pageNum: number) => loadedPages.has(pageNum),
    [loadedPages],
  );
  const getFontFamily = useCallback(
    (pageNum: number) => (loadedPages.has(pageNum) ? `p${pageNum}-v2` : "UthmanicHafs"),
    [loadedPages],
  );
  return { isPageFontLoaded, getFontFamily, loadedPages };
}
```

- [ ] **Step 3: Download KFGQPC font and add @font-face**

```bash
curl -o public/fonts/UthmanicHafs1Ver18.woff2 "https://static.qurancdn.com/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2"
```

Add to `src/app/globals.css` (before `@layer base`):

```css
@font-face {
  font-family: "UthmanicHafs";
  src: url("/fonts/UthmanicHafs1Ver18.woff2") format("woff2");
  font-display: swap;
}
```

- [ ] **Step 4: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add QCF font loading hook with dynamic FontFace API"
```

---

### Task 3: QuranWord + VerseText Components

**Files:**

- Create: `src/components/quran/quran-word.tsx`, `src/components/quran/verse-text.tsx`
- Test: `src/__tests__/components/quran/quran-word.test.tsx`, `src/__tests__/components/quran/verse-text.test.tsx`

- [ ] **Step 1: Write QuranWord tests**

Create `src/__tests__/components/quran/quran-word.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { QuranWord } from "@/components/quran/quran-word";
import type { QcfWord } from "@/types/quran-api";

const mockWord: QcfWord = {
  id: 1,
  position: 1,
  audio_url: null,
  char_type_name: "word",
  code_v2: "\ufc41",
  page_number: 1,
  line_number: 1,
  text_uthmani: "بِسْمِ",
  text_imlaei_simple: "bism",
  qpc_uthmani_hafs: "بِسْمِ",
  verse_key: "1:1",
  verse_id: 1,
  location: "1:1:1",
};

describe("QuranWord", () => {
  it("renders fallback text when font not loaded", () => {
    const { container } = render(
      <QuranWord word={mockWord} isFontLoaded={false} fontFamily="UthmanicHafs" />,
    );
    expect(container.querySelector("span")?.textContent).toBe("بِسْمِ");
  });

  it("renders glyph code when font loaded", () => {
    const { container } = render(
      <QuranWord word={mockWord} isFontLoaded={true} fontFamily="p1-v2" />,
    );
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("\ufc41");
    expect(span?.style.fontFamily).toBe("p1-v2");
  });
});
```

- [ ] **Step 2: Implement QuranWord**

Create `src/components/quran/quran-word.tsx`:

```tsx
import type { QcfWord } from "@/types/quran-api";
import { cn } from "@/lib/utils";

interface QuranWordProps {
  word: QcfWord;
  isFontLoaded: boolean;
  fontFamily: string;
  className?: string;
}

export function QuranWord({ word, isFontLoaded, fontFamily, className }: QuranWordProps) {
  const text = isFontLoaded ? word.code_v2 : word.qpc_uthmani_hafs;
  return (
    <span
      className={cn(
        "inline-block cursor-pointer transition-colors hover:text-blue-400/80",
        !isFontLoaded && "font-[UthmanicHafs]",
        className,
      )}
      style={isFontLoaded ? { fontFamily } : undefined}
      data-verse-key={word.verse_key}
      data-word-position={word.position}
    >
      {text}
    </span>
  );
}
```

- [ ] **Step 3: Write VerseText tests and implement**

Create `src/__tests__/components/quran/verse-text.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VerseText } from "@/components/quran/verse-text";
import type { QcfWord } from "@/types/quran-api";

const mockWords: QcfWord[] = [
  {
    id: 1,
    position: 1,
    audio_url: null,
    char_type_name: "word",
    code_v2: "\ufc41",
    page_number: 1,
    line_number: 1,
    text_uthmani: "بِسْمِ",
    text_imlaei_simple: "bism",
    qpc_uthmani_hafs: "بِسْمِ",
    verse_key: "1:1",
    verse_id: 1,
    location: "1:1:1",
  },
  {
    id: 2,
    position: 2,
    audio_url: null,
    char_type_name: "word",
    code_v2: "\ufc42",
    page_number: 1,
    line_number: 1,
    text_uthmani: "ٱللَّهِ",
    text_imlaei_simple: "allah",
    qpc_uthmani_hafs: "ٱللَّهِ",
    verse_key: "1:1",
    verse_id: 1,
    location: "1:1:2",
  },
];

describe("VerseText", () => {
  it("renders all words", () => {
    const { container } = render(
      <VerseText words={mockWords} isFontLoaded={false} fontFamily="UthmanicHafs" />,
    );
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });
  it("applies RTL direction", () => {
    const { container } = render(
      <VerseText words={mockWords} isFontLoaded={false} fontFamily="UthmanicHafs" />,
    );
    expect(container.firstElementChild?.getAttribute("dir")).toBe("rtl");
  });
  it("applies space-between for mushaf mode", () => {
    const { container } = render(
      <VerseText words={mockWords} isFontLoaded={false} fontFamily="UthmanicHafs" mushafMode />,
    );
    expect(container.firstElementChild?.className).toContain("justify-between");
  });
});
```

Create `src/components/quran/verse-text.tsx`:

```tsx
import type { QcfWord } from "@/types/quran-api";
import { QuranWord } from "./quran-word";
import { cn } from "@/lib/utils";

interface VerseTextProps {
  words: QcfWord[];
  isFontLoaded: boolean;
  fontFamily: string;
  mushafMode?: boolean;
  fontSize?: string;
  className?: string;
}

export function VerseText({
  words,
  isFontLoaded,
  fontFamily,
  mushafMode,
  fontSize = "1.8rem",
  className,
}: VerseTextProps) {
  return (
    <div
      dir="rtl"
      className={cn(
        "flex flex-wrap leading-loose",
        mushafMode ? "justify-between" : "justify-start gap-x-1",
        className,
      )}
      style={{ fontSize }}
    >
      {words.map((word) => (
        <QuranWord
          key={`${word.verse_key}-${word.position}`}
          word={word}
          isFontLoaded={isFontLoaded}
          fontFamily={fontFamily}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add QuranWord and VerseText components for Quran rendering"
```

---

### Task 4: Reading Settings Store + Themes

**Files:**

- Create: `src/stores/reading-settings-store.ts`, `src/data/reading-themes.ts`
- Test: `src/__tests__/stores/reading-settings-store.test.ts`

- [ ] **Step 1: Create reading themes**

Create `src/data/reading-themes.ts`:

```typescript
import type { ReadingTheme } from "@/types/quran";

export const LIGHT_READING_THEMES: ReadingTheme[] = [
  {
    id: "default",
    name: "Cream",
    mode: "light",
    colors: {
      background: "#f4f3ec",
      backgroundSecondary: "#edebe3",
      text: "#06151C",
      textSecondary: "#052c39",
      card: "#dcdeda",
    },
  },
  {
    id: "parchment",
    name: "Parchment",
    mode: "light",
    colors: {
      background: "#f5e6c8",
      backgroundSecondary: "#eddcba",
      text: "#2c1810",
      textSecondary: "#5a3a28",
      card: "#e5d4b2",
    },
  },
  {
    id: "white",
    name: "White",
    mode: "light",
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#f5f5f5",
      text: "#1a1a1a",
      textSecondary: "#666666",
      card: "#eeeeee",
    },
  },
  {
    id: "sage",
    name: "Sage",
    mode: "light",
    colors: {
      background: "#e8ebe4",
      backgroundSecondary: "#dfe3db",
      text: "#1c2b1e",
      textSecondary: "#4a5c4e",
      card: "#d5d9d0",
    },
  },
  {
    id: "rose",
    name: "Rose",
    mode: "light",
    colors: {
      background: "#f5ece8",
      backgroundSecondary: "#ede2dd",
      text: "#241a18",
      textSecondary: "#6b4f47",
      card: "#e3d8d3",
    },
  },
  {
    id: "cool",
    name: "Cool Gray",
    mode: "light",
    colors: {
      background: "#eef0f2",
      backgroundSecondary: "#e4e7ea",
      text: "#1a1d21",
      textSecondary: "#5a5f66",
      card: "#d9dce0",
    },
  },
];

export const DARK_READING_THEMES: ReadingTheme[] = [
  {
    id: "dark-default",
    name: "Dark Navy",
    mode: "dark",
    colors: {
      background: "#050b10",
      backgroundSecondary: "#06151C",
      text: "#ffffff",
      textSecondary: "#B0B0B0",
      card: "#050b10",
    },
  },
  {
    id: "dark-sepia",
    name: "Dark Sepia",
    mode: "dark",
    colors: {
      background: "#140f0a",
      backgroundSecondary: "#1c1610",
      text: "#d4c4a8",
      textSecondary: "#8a7a60",
      card: "#140f0a",
    },
  },
  {
    id: "oled",
    name: "True Black",
    mode: "dark",
    colors: {
      background: "#000000",
      backgroundSecondary: "#0a0a0a",
      text: "#e8e8e8",
      textSecondary: "#808080",
      card: "#000000",
    },
  },
  {
    id: "dark-sage",
    name: "Dark Sage",
    mode: "dark",
    colors: {
      background: "#141a16",
      backgroundSecondary: "#1a221c",
      text: "#c0ccc2",
      textSecondary: "#6e7e70",
      card: "#141a16",
    },
  },
  {
    id: "charcoal",
    name: "Charcoal",
    mode: "dark",
    colors: {
      background: "#1a1a1a",
      backgroundSecondary: "#222222",
      text: "#e0e0e0",
      textSecondary: "#888888",
      card: "#1a1a1a",
    },
  },
  {
    id: "indigo",
    name: "Indigo",
    mode: "dark",
    colors: {
      background: "#0e0c18",
      backgroundSecondary: "#141120",
      text: "#d8d4e8",
      textSecondary: "#7a74a0",
      card: "#0e0c18",
    },
  },
];

export const ALL_READING_THEMES = [...LIGHT_READING_THEMES, ...DARK_READING_THEMES];

export function getReadingThemeById(id: string): ReadingTheme | undefined {
  return ALL_READING_THEMES.find((t) => t.id === id);
}
```

- [ ] **Step 2: Write store tests**

Create `src/__tests__/stores/reading-settings-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";

describe("reading-settings-store", () => {
  beforeEach(() => {
    useReadingSettingsStore.setState(useReadingSettingsStore.getInitialState());
  });

  it("defaults to cream light theme", () => {
    expect(useReadingSettingsStore.getState().lightThemeId).toBe("default");
  });
  it("defaults to dark navy", () => {
    expect(useReadingSettingsStore.getState().darkThemeId).toBe("dark-default");
  });
  it("defaults to Saheeh International", () => {
    expect(useReadingSettingsStore.getState().translationIds).toContain("131");
  });
  it("sets font size", () => {
    useReadingSettingsStore.getState().setFontSize(2.4);
    expect(useReadingSettingsStore.getState().fontSize).toBe(2.4);
  });
  it("toggles transliteration", () => {
    useReadingSettingsStore.getState().toggleTransliteration();
    expect(useReadingSettingsStore.getState().showTransliteration).toBe(true);
  });
  it("toggles word-by-word", () => {
    useReadingSettingsStore.getState().toggleWordByWord();
    expect(useReadingSettingsStore.getState().showWordByWord).toBe(true);
  });
  it("sets themes", () => {
    useReadingSettingsStore.getState().setLightTheme("parchment");
    expect(useReadingSettingsStore.getState().lightThemeId).toBe("parchment");
  });
});
```

- [ ] **Step 3: Implement store**

Create `src/stores/reading-settings-store.ts`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReadingSettingsState {
  fontSize: number;
  lightThemeId: string;
  darkThemeId: string;
  translationIds: string;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showTajweed: boolean;
  mushafPage: number;
  setFontSize: (size: number) => void;
  setLightTheme: (id: string) => void;
  setDarkTheme: (id: string) => void;
  setTranslationIds: (ids: string) => void;
  toggleTransliteration: () => void;
  toggleWordByWord: () => void;
  toggleTajweed: () => void;
  setMushafPage: (page: number) => void;
}

export const useReadingSettingsStore = create<ReadingSettingsState>()(
  persist(
    (set) => ({
      fontSize: 1.8,
      lightThemeId: "default",
      darkThemeId: "dark-default",
      translationIds: "131",
      showTransliteration: false,
      showWordByWord: false,
      showTajweed: false,
      mushafPage: 1,
      setFontSize: (size) => set({ fontSize: size }),
      setLightTheme: (id) => set({ lightThemeId: id }),
      setDarkTheme: (id) => set({ darkThemeId: id }),
      setTranslationIds: (ids) => set({ translationIds: ids }),
      toggleTransliteration: () => set((s) => ({ showTransliteration: !s.showTransliteration })),
      toggleWordByWord: () => set((s) => ({ showWordByWord: !s.showWordByWord })),
      toggleTajweed: () => set((s) => ({ showTajweed: !s.showTajweed })),
      setMushafPage: (page) => set({ mushafPage: page }),
    }),
    { name: "bayaan-reading-settings", storage: createJSONStorage(() => localStorage) },
  ),
);
```

- [ ] **Step 4: Run tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add reading settings store with themes and preferences"
```

---

### Task 5: Mushaf View (Page-Accurate Display)

**Files:**

- Create: `src/components/quran/surah-header.tsx`, `src/components/quran/mushaf-page.tsx`, `src/components/quran/mushaf-view.tsx`
- Modify: `src/app/(app)/quran/page.tsx`

- [ ] **Step 1: Create SurahHeader**

Create `src/components/quran/surah-header.tsx`:

```tsx
import { surahGlyphMap } from "@/data/surah-glyph-map";

interface SurahHeaderProps {
  surahNumber: number;
  surahName: string;
  showBismillah: boolean;
}

export function SurahHeader({ surahNumber, surahName, showBismillah }: SurahHeaderProps) {
  const glyph = surahGlyphMap[surahNumber];
  return (
    <div className="py-4 text-center">
      <div className="inline-flex items-center justify-center rounded-xl border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] px-8 py-2">
        {glyph ? (
          <span className="font-surah-names text-3xl">{glyph}</span>
        ) : (
          <span className="text-lg font-semibold">{surahName}</span>
        )}
      </div>
      {showBismillah && surahNumber !== 9 && surahNumber !== 1 && (
        <p className="mt-4 font-[UthmanicHafs] text-2xl" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create MushafPage**

Create `src/components/quran/mushaf-page.tsx`:

```tsx
"use client";
import { useMemo } from "react";
import type { QcfVerse, QcfWord } from "@/types/quran-api";
import { VerseText } from "./verse-text";

interface MushafPageProps {
  verses: QcfVerse[];
  pageNumber: number;
  isFontLoaded: boolean;
  fontFamily: string;
  fontSize: string;
}

export function MushafPage({
  verses,
  pageNumber,
  isFontLoaded,
  fontFamily,
  fontSize,
}: MushafPageProps) {
  const lines = useMemo(() => {
    const lineMap = new Map<number, QcfWord[]>();
    for (const verse of verses) {
      for (const word of verse.words) {
        if (word.page_number !== pageNumber) continue;
        const existing = lineMap.get(word.line_number) ?? [];
        existing.push(word);
        lineMap.set(word.line_number, existing);
      }
    }
    return [...lineMap.entries()].sort(([a], [b]) => a - b);
  }, [verses, pageNumber]);

  return (
    <div className="flex min-h-[600px] flex-col items-center px-4 py-6">
      {lines.map(([lineNumber, words]) => (
        <VerseText
          key={`line-${lineNumber}`}
          words={words}
          isFontLoaded={isFontLoaded}
          fontFamily={fontFamily}
          mushafMode
          fontSize={fontSize}
          className="w-full max-w-[640px]"
        />
      ))}
      <p className="text-muted-foreground mt-4 text-xs">{pageNumber}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create MushafView**

Create `src/components/quran/mushaf-view.tsx`:

```tsx
"use client";
import { useState, useCallback } from "react";
import { useVersesByPage } from "@/hooks/use-verses-by-page";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { MushafPage } from "./mushaf-page";

const TOTAL_PAGES = 604;

export function MushafView() {
  const mushafPage = useReadingSettingsStore((s) => s.mushafPage);
  const setMushafPage = useReadingSettingsStore((s) => s.setMushafPage);
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const [currentPage, setCurrentPage] = useState(mushafPage);

  const pagesToLoad = [currentPage - 1, currentPage, currentPage + 1].filter(
    (p) => p >= 1 && p <= TOTAL_PAGES,
  );
  const { verses, isLoading } = useVersesByPage(currentPage);
  const { isPageFontLoaded, getFontFamily } = useQcfFont(pagesToLoad);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_PAGES, page));
      setCurrentPage(clamped);
      setMushafPage(clamped);
    },
    [setMushafPage],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center justify-between border-b px-4 py-2">
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= TOTAL_PAGES}
          className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)] disabled:opacity-30"
        >
          &#8594; Previous
        </button>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Page</span>
          <input
            type="number"
            min={1}
            max={TOTAL_PAGES}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            className="w-16 rounded border border-[var(--text-alpha-06)] bg-[var(--text-alpha-04)] px-2 py-1 text-center text-sm"
          />
          <span className="text-muted-foreground text-sm">/ {TOTAL_PAGES}</span>
        </div>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg bg-[var(--text-alpha-06)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--text-alpha-10)] disabled:opacity-30"
        >
          Next &#8592;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex min-h-[600px] items-center justify-center">
            <div className="w-full max-w-[640px] animate-pulse space-y-4 px-8">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 rounded bg-[var(--text-alpha-06)]"
                  style={{ width: `${70 + Math.random() * 30}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <MushafPage
            verses={verses}
            pageNumber={currentPage}
            isFontLoaded={isPageFontLoaded(currentPage)}
            fontFamily={getFontFamily(currentPage)}
            fontSize={`${fontSize}rem`}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace quran page**

Replace `src/app/(app)/quran/page.tsx`:

```tsx
import { MushafView } from "@/components/quran/mushaf-view";
export default function QuranPage() {
  return <MushafView />;
}
```

- [ ] **Step 5: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build Mushaf view with QCF font rendering and page navigation"
```

---

### Task 6: Reading View (Verse-by-Verse with Translations)

**Files:**

- Create: `src/components/quran/reading-verse.tsx`, `src/components/quran/reading-view.tsx`
- Modify: `src/app/(app)/quran/[surah]/page.tsx`

- [ ] **Step 1: Create ReadingVerse**

Create `src/components/quran/reading-verse.tsx`:

```tsx
"use client";
import type { QcfVerse } from "@/types/quran-api";
import { VerseText } from "./verse-text";
import { sanitizeHtml } from "@/lib/sanitize";

interface ReadingVerseProps {
  verse: QcfVerse;
  isFontLoaded: boolean;
  fontFamily: string;
  fontSize: string;
  showTranslation: boolean;
}

export function ReadingVerse({
  verse,
  isFontLoaded,
  fontFamily,
  fontSize,
  showTranslation,
}: ReadingVerseProps) {
  return (
    <div className="border-b border-[var(--text-alpha-06)] py-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">{verse.verse_key}</span>
      </div>
      <div className="mb-3">
        <VerseText
          words={verse.words}
          isFontLoaded={isFontLoaded}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      </div>
      {showTranslation &&
        verse.translations?.map((translation) => (
          <div key={translation.id} className="text-muted-foreground mt-3 text-sm leading-relaxed">
            <p className="text-muted-foreground/60 mb-1 text-xs font-medium">
              {translation.resource_name}
            </p>
            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(translation.text) }} />
          </div>
        ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ReadingView**

Create `src/components/quran/reading-view.tsx`:

```tsx
"use client";
import { useMemo } from "react";
import { useVersesByChapter } from "@/hooks/use-verses-by-chapter";
import { useQcfFont } from "@/hooks/use-qcf-font";
import { useReadingSettingsStore } from "@/stores/reading-settings-store";
import { ReadingVerse } from "./reading-verse";
import { SurahHeader } from "./surah-header";
import surahData from "@/data/surah-data.json";
import type { Surah } from "@/types/quran";

const surahs = surahData as Surah[];

export function ReadingView({ surahId }: { surahId: number }) {
  const fontSize = useReadingSettingsStore((s) => s.fontSize);
  const translationIds = useReadingSettingsStore((s) => s.translationIds);
  const { verses, isLoading } = useVersesByChapter(surahId, 1, translationIds);
  const pageNumbers = useMemo(
    () => [...new Set(verses.flatMap((v) => v.words.map((w) => w.page_number)))],
    [verses],
  );
  const { isPageFontLoaded, getFontFamily } = useQcfFont(pageNumbers);
  const surah = surahs.find((s) => s.id === surahId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-6 py-8">
        <div className="mx-auto mb-8 h-12 w-48 rounded bg-[var(--text-alpha-06)]" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="mb-6 space-y-3">
            <div className="h-8 w-full rounded bg-[var(--text-alpha-06)]" />
            <div className="h-4 w-3/4 rounded bg-[var(--text-alpha-04)]" />
          </div>
        ))}
      </div>
    );
  }

  const primaryPage = verses[0]?.words[0]?.page_number ?? 1;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {surah && (
        <SurahHeader
          surahNumber={surah.id}
          surahName={surah.name}
          showBismillah={surah.bismillah_pre}
        />
      )}
      <div className="mt-6">
        {verses.map((verse) => (
          <ReadingVerse
            key={verse.verse_key}
            verse={verse}
            isFontLoaded={isPageFontLoaded(primaryPage)}
            fontFamily={getFontFamily(primaryPage)}
            fontSize={`${fontSize}rem`}
            showTranslation={true}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Replace reading view page**

Replace `src/app/(app)/quran/[surah]/page.tsx`:

```tsx
"use client";
import { use } from "react";
import { ReadingView } from "@/components/quran/reading-view";

export default function QuranSurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = use(params);
  const surahId = parseInt(surah, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Invalid surah number</h1>
      </div>
    );
  }
  return <ReadingView surahId={surahId} />;
}
```

- [ ] **Step 4: Run tests and type check**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build reading view with verse-by-verse translation display"
```

---

## Completion Criteria

After completing all 6 tasks:

1. `/quran` shows Mushaf view with page-accurate QCF font rendering
2. QCF fonts load dynamically per-page from qurancdn, KFGQPC Uthmani Hafs fallback
3. Mushaf page navigation works (prev/next, page input) — RTL (right=next)
4. `/quran/{surahId}` shows verse-by-verse reading with sanitized translations
5. Surah headers with glyph font and bismillah
6. Reading settings stored in localStorage
7. 12 reading themes ported from mobile app
8. Translation HTML sanitized via DOMPurify
9. `npx tsc --noEmit` zero errors, `npm test` all green
