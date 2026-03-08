# Phase 4: Translations & Tafseer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add translation toggle and display functionality to Bayaan Web's Mushaf viewer with bundled English translations.

**Architecture:** Extend existing VerseDisplay component with translation toggle, create Zustand store for translation preferences, integrate with existing JSON translation data for offline-first experience.

**Tech Stack:** Next.js 15, Zustand, TypeScript, Tailwind CSS, existing alpha-based design system

---

## Task 1: Translation Types Definition

**Files:**
- Create: `src/types/translation.ts`

**Step 1: Write the translation type definitions**

```typescript
export interface Translation {
  id: string;
  name: string;
  author: string;
  language: string;
  direction: 'ltr' | 'rtl';
}

export interface TranslationVerse {
  verse_key: string;
  text: string;
  resource_id?: number;
}

export interface TranslationData {
  id: string;
  name: string;
  author: string;
  language: string;
  direction: 'ltr' | 'rtl';
  verses: TranslationVerse[];
}

export type TranslationPosition = 'below' | 'side';
export type FontSize = 'small' | 'medium' | 'large';
```

**Step 2: Commit types**

```bash
git add src/types/translation.ts
git commit -m "feat: add translation type definitions"
```

## Task 2: Translation Store Setup

**Files:**
- Create: `src/stores/useTranslationStore.ts`

**Step 1: Write the failing test**

```bash
# Create test directory if it doesn't exist
mkdir -p __tests__/stores
```

Create: `__tests__/stores/useTranslationStore.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTranslationStore } from '@/stores/useTranslationStore';

describe('useTranslationStore', () => {
  beforeEach(() => {
    useTranslationStore.setState({
      selectedTranslation: null,
      showTranslations: false,
      translationPosition: 'below',
      fontSize: 'medium',
    });
  });

  test('should toggle translations on and off', () => {
    const { result } = renderHook(() => useTranslationStore());

    expect(result.current.showTranslations).toBe(false);

    act(() => {
      result.current.toggleTranslations();
    });

    expect(result.current.showTranslations).toBe(true);
  });

  test('should set selected translation', () => {
    const { result } = renderHook(() => useTranslationStore());

    act(() => {
      result.current.setSelectedTranslation('saheeh');
    });

    expect(result.current.selectedTranslation).toBe('saheeh');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test __tests__/stores/useTranslationStore.test.ts`
Expected: FAIL with "Cannot resolve module"

**Step 3: Write minimal store implementation**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSize, TranslationPosition } from '@/types/translation';

interface TranslationStore {
  // State
  selectedTranslation: string | null;
  showTranslations: boolean;
  translationPosition: TranslationPosition;
  fontSize: FontSize;

  // Actions
  setSelectedTranslation: (id: string) => void;
  toggleTranslations: () => void;
  setTranslationPosition: (position: TranslationPosition) => void;
  setFontSize: (size: FontSize) => void;
}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedTranslation: 'saheeh', // Default to Saheeh International
      showTranslations: false,
      translationPosition: 'below',
      fontSize: 'medium',

      // Actions
      setSelectedTranslation: (id) => set({ selectedTranslation: id }),
      toggleTranslations: () => set((state) => ({ showTranslations: !state.showTranslations })),
      setTranslationPosition: (position) => set({ translationPosition: position }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: 'bayaan-translation-settings',
    }
  )
);
```

**Step 4: Run test to verify it passes**

Run: `npm test __tests__/stores/useTranslationStore.test.ts`
Expected: PASS

**Step 5: Commit store**

```bash
git add src/stores/useTranslationStore.ts __tests__/stores/useTranslationStore.test.ts
git commit -m "feat: add translation store with persistence"
```

## Task 3: Translation Data Service

**Files:**
- Create: `src/lib/translationService.ts`

**Step 1: Write the failing test**

Create: `__tests__/lib/translationService.test.ts`

```typescript
import { getTranslationForVerse, getAvailableTranslations } from '@/lib/translationService';

describe('translationService', () => {
  test('should get translation for verse', () => {
    const translation = getTranslationForVerse('1:1', 'saheeh');
    expect(translation).toBeDefined();
    expect(translation?.verse_key).toBe('1:1');
    expect(translation?.text).toContain('Allah');
  });

  test('should return null for invalid verse', () => {
    const translation = getTranslationForVerse('999:999', 'saheeh');
    expect(translation).toBeNull();
  });

  test('should get available translations', () => {
    const translations = getAvailableTranslations();
    expect(translations.length).toBeGreaterThan(0);
    expect(translations[0]).toHaveProperty('id');
    expect(translations[0]).toHaveProperty('name');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test __tests__/lib/translationService.test.ts`
Expected: FAIL with "Cannot resolve module"

**Step 3: Write minimal service implementation**

```typescript
import type { Translation, TranslationVerse } from '@/types/translation';

// Import existing translation data
import translationData from '@/data/quran-translation.json';

// Available translations (based on mobile app structure)
const AVAILABLE_TRANSLATIONS: Translation[] = [
  {
    id: 'saheeh',
    name: 'Saheeh International',
    author: 'Saheeh International',
    language: 'English',
    direction: 'ltr',
  },
];

export function getAvailableTranslations(): Translation[] {
  return AVAILABLE_TRANSLATIONS;
}

export function getTranslationForVerse(verseKey: string, translationId: string): TranslationVerse | null {
  // Find verse in translation data
  const verse = translationData.find((v) => v.verse_key === verseKey);

  if (!verse || !verse.translations || verse.translations.length === 0) {
    return null;
  }

  // For now, return the first translation (Saheeh International)
  const translation = verse.translations[0];

  return {
    verse_key: verseKey,
    text: translation.text,
    resource_id: translation.resource_id,
  };
}

export function getAllTranslationsForVerse(verseKey: string): Record<string, TranslationVerse | null> {
  const translations: Record<string, TranslationVerse | null> = {};

  for (const translation of AVAILABLE_TRANSLATIONS) {
    translations[translation.id] = getTranslationForVerse(verseKey, translation.id);
  }

  return translations;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test __tests__/lib/translationService.test.ts`
Expected: PASS

**Step 5: Commit service**

```bash
git add src/lib/translationService.ts __tests__/lib/translationService.test.ts
git commit -m "feat: add translation data service"
```

## Task 4: Translation Toggle Component

**Files:**
- Create: `src/components/translations/TranslationToggle.tsx`

**Step 1: Write the failing test**

Create: `__tests__/components/translations/TranslationToggle.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationToggle } from '@/components/translations/TranslationToggle';

// Mock the store
const mockToggleTranslations = jest.fn();
jest.mock('@/stores/useTranslationStore', () => ({
  useTranslationStore: () => ({
    showTranslations: false,
    toggleTranslations: mockToggleTranslations,
  }),
}));

describe('TranslationToggle', () => {
  beforeEach(() => {
    mockToggleTranslations.mockClear();
  });

  test('should render toggle button', () => {
    render(<TranslationToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should call toggle function when clicked', () => {
    render(<TranslationToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleTranslations).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test __tests__/components/translations/TranslationToggle.test.tsx`
Expected: FAIL with "Cannot resolve module"

**Step 3: Write minimal component implementation**

```typescript
'use client';

import { useTranslationStore } from '@/stores/useTranslationStore';
import { IconButton } from '@/components/ui/IconButton';

interface TranslationToggleProps {
  className?: string;
}

export function TranslationToggle({ className }: TranslationToggleProps) {
  const { showTranslations, toggleTranslations } = useTranslationStore();

  return (
    <IconButton
      onClick={toggleTranslations}
      className={className}
      title={showTranslations ? 'Hide Translation' : 'Show Translation'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    </IconButton>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test __tests__/components/translations/TranslationToggle.test.tsx`
Expected: PASS

**Step 5: Commit component**

```bash
git add src/components/translations/TranslationToggle.tsx __tests__/components/translations/TranslationToggle.test.tsx
git commit -m "feat: add translation toggle component"
```

## Task 5: Translation Display Component

**Files:**
- Create: `src/components/translations/TranslationDisplay.tsx`

**Step 1: Write the failing test**

Create: `__tests__/components/translations/TranslationDisplay.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { TranslationDisplay } from '@/components/translations/TranslationDisplay';

describe('TranslationDisplay', () => {
  test('should render translation text', () => {
    const mockTranslation = {
      verse_key: '1:1',
      text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    };

    render(<TranslationDisplay translation={mockTranslation} />);

    expect(screen.getByText(/In the name of Allah/)).toBeInTheDocument();
  });

  test('should not render when translation is null', () => {
    render(<TranslationDisplay translation={null} />);

    expect(screen.queryByText(/In the name of Allah/)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test __tests__/components/translations/TranslationDisplay.test.tsx`
Expected: FAIL with "Cannot resolve module"

**Step 3: Write minimal component implementation**

```typescript
import { cn } from '@/lib/cn';
import type { TranslationVerse } from '@/types/translation';
import { useTranslationStore } from '@/stores/useTranslationStore';

interface TranslationDisplayProps {
  translation: TranslationVerse | null;
  className?: string;
}

export function TranslationDisplay({ translation, className }: TranslationDisplayProps) {
  const { fontSize } = useTranslationStore();

  if (!translation) {
    return null;
  }

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={cn('text-color-label leading-relaxed', sizeClasses[fontSize], className)}>
      {translation.text}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test __tests__/components/translations/TranslationDisplay.test.tsx`
Expected: PASS

**Step 5: Commit component**

```bash
git add src/components/translations/TranslationDisplay.tsx __tests__/components/translations/TranslationDisplay.test.tsx
git commit -m "feat: add translation display component"
```

## Task 6: Enhance VerseDisplay Component

**Files:**
- Modify: `src/components/mushaf/VerseDisplay.tsx`
- Read first: Current implementation to understand structure

**Step 1: Read current VerseDisplay implementation**

Run: `cat src/components/mushaf/VerseDisplay.tsx | head -50`
Understand: Component structure and props interface

**Step 2: Write integration test**

Create: `__tests__/components/mushaf/VerseDisplayTranslation.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { VerseDisplay } from '@/components/mushaf/VerseDisplay';

// Mock translation store
jest.mock('@/stores/useTranslationStore', () => ({
  useTranslationStore: () => ({
    showTranslations: true,
    selectedTranslation: 'saheeh',
  }),
}));

// Mock translation service
jest.mock('@/lib/translationService', () => ({
  getTranslationForVerse: jest.fn(() => ({
    verse_key: '1:1',
    text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  })),
}));

describe('VerseDisplay with Translations', () => {
  test('should show translation when enabled', () => {
    const mockVerse = {
      verse_number: 1,
      verse_key: '1:1',
      text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    };

    render(<VerseDisplay verse={mockVerse} />);

    expect(screen.getByText(/In the name of Allah/)).toBeInTheDocument();
    expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument();
  });
});
```

**Step 3: Run test to verify it fails**

Run: `npm test __tests__/components/mushaf/VerseDisplayTranslation.test.tsx`
Expected: FAIL with translation not showing

**Step 4: Enhance VerseDisplay component**

Modify existing `src/components/mushaf/VerseDisplay.tsx` to add translation support:

```typescript
// Add these imports at the top
import { useTranslationStore } from '@/stores/useTranslationStore';
import { getTranslationForVerse } from '@/lib/translationService';
import { TranslationDisplay } from '@/components/translations/TranslationDisplay';
import { TranslationToggle } from '@/components/translations/TranslationToggle';

// In the component, add these hooks after existing ones
const { showTranslations, selectedTranslation } = useTranslationStore();

// Get translation data
const translation = selectedTranslation
  ? getTranslationForVerse(verse.verse_key, selectedTranslation)
  : null;

// In the JSX return, add translation toggle and display after the verse number
// Assuming there's a verse header/controls area, add:
<TranslationToggle className="ml-2" />

// After the Arabic text, add:
{showTranslations && (
  <TranslationDisplay
    translation={translation}
    className="mt-2"
  />
)}
```

**Step 5: Run test to verify it passes**

Run: `npm test __tests__/components/mushaf/VerseDisplayTranslation.test.tsx`
Expected: PASS

**Step 6: Test in browser**

Run: `npm run dev`
Navigate: http://localhost:3000/mushaf/1
Expected: Toggle button appears, translation shows when clicked

**Step 7: Commit enhancement**

```bash
git add src/components/mushaf/VerseDisplay.tsx __tests__/components/mushaf/VerseDisplayTranslation.test.tsx
git commit -m "feat: integrate translation display in VerseDisplay component"
```

## Task 7: Translation Settings Page

**Files:**
- Create: `src/app/settings/translations/page.tsx`

**Step 1: Create settings page structure**

```typescript
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TranslationSettings } from '@/components/translations/TranslationSettings';

export default function TranslationsSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader>Translation Settings</SectionHeader>

      <Card>
        <TranslationSettings />
      </Card>
    </div>
  );
}
```

**Step 2: Create TranslationSettings component**

Create: `src/components/translations/TranslationSettings.tsx`

```typescript
'use client';

import { useTranslationStore } from '@/stores/useTranslationStore';
import { getAvailableTranslations } from '@/lib/translationService';

export function TranslationSettings() {
  const {
    selectedTranslation,
    showTranslations,
    translationPosition,
    fontSize,
    setSelectedTranslation,
    toggleTranslations,
    setTranslationPosition,
    setFontSize,
  } = useTranslationStore();

  const availableTranslations = getAvailableTranslations();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Display Settings</h3>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showTranslations}
            onChange={toggleTranslations}
            className="rounded border-color-card-border"
          />
          <span>Show translations by default</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Default Translation
        </label>
        <select
          value={selectedTranslation || ''}
          onChange={(e) => setSelectedTranslation(e.target.value)}
          className="w-full p-2 border border-color-card-border rounded-md bg-transparent"
        >
          {availableTranslations.map((translation) => (
            <option key={translation.id} value={translation.id}>
              {translation.name} - {translation.author}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Translation Position
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="position"
              value="below"
              checked={translationPosition === 'below'}
              onChange={(e) => setTranslationPosition(e.target.value as any)}
            />
            <span>Below verse</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="position"
              value="side"
              checked={translationPosition === 'side'}
              onChange={(e) => setTranslationPosition(e.target.value as any)}
            />
            <span>Side by side</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Translation Font Size
        </label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as any)}
          className="w-full p-2 border border-color-card-border rounded-md bg-transparent"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
}
```

**Step 3: Add navigation link**

Modify: `src/components/layout/Sidebar.tsx` (or appropriate navigation component)
Add link to `/settings/translations` in settings section

**Step 4: Test settings page**

Run: `npm run dev`
Navigate: http://localhost:3000/settings/translations
Expected: Settings page renders with all controls working

**Step 5: Commit settings page**

```bash
git add src/app/settings/translations/page.tsx src/components/translations/TranslationSettings.tsx
git commit -m "feat: add translation settings page"
```

## Task 8: Type Safety and Error Handling

**Files:**
- Modify: `src/lib/translationService.ts`
- Add error boundary: `src/components/translations/TranslationErrorBoundary.tsx`

**Step 1: Add error handling to service**

Enhance `src/lib/translationService.ts`:

```typescript
// Add try-catch blocks and proper error handling
export function getTranslationForVerse(verseKey: string, translationId: string): TranslationVerse | null {
  try {
    // Validate inputs
    if (!verseKey || !translationId) {
      console.warn('Invalid verse key or translation ID provided');
      return null;
    }

    const verse = translationData.find((v) => v.verse_key === verseKey);

    if (!verse?.translations?.length) {
      return null;
    }

    const translation = verse.translations[0];

    if (!translation?.text) {
      console.warn(`No translation text found for verse ${verseKey}`);
      return null;
    }

    return {
      verse_key: verseKey,
      text: translation.text,
      resource_id: translation.resource_id,
    };
  } catch (error) {
    console.error('Error fetching translation:', error);
    return null;
  }
}
```

**Step 2: Create error boundary component**

```typescript
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class TranslationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Translation component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-sm text-color-hint italic">
          Translation temporarily unavailable
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 3: Wrap components in error boundary**

Modify `src/components/mushaf/VerseDisplay.tsx` to wrap translation components:

```typescript
import { TranslationErrorBoundary } from '@/components/translations/TranslationErrorBoundary';

// Wrap translation components
{showTranslations && (
  <TranslationErrorBoundary>
    <TranslationDisplay
      translation={translation}
      className="mt-2"
    />
  </TranslationErrorBoundary>
)}
```

**Step 4: Commit error handling**

```bash
git add src/lib/translationService.ts src/components/translations/TranslationErrorBoundary.tsx src/components/mushaf/VerseDisplay.tsx
git commit -m "feat: add error handling and boundaries for translations"
```

## Task 9: Final Testing and Type Checking

**Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass

**Step 2: Run type checking**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

**Step 3: Run linting**

```bash
npm run lint
```

Expected: No ESLint errors

**Step 4: Test in development**

```bash
npm run dev
```

Test scenarios:
- Navigate to /mushaf/1
- Toggle translation on/off
- Visit /settings/translations
- Change translation settings
- Verify persistence across page reloads

**Step 5: Final commit and push**

```bash
git add .
git commit -m "feat: complete Phase 4 Translations & Tafseer implementation

- Translation toggle and display in VerseDisplay
- Zustand store with localStorage persistence
- Translation settings page with all preferences
- Error handling and type safety
- Comprehensive test coverage
- Mobile app feature parity for bundled translations

Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>"

git push origin main
```

---

## Success Criteria

✅ Users can toggle translation display on/off
✅ Translation appears below Arabic verse text
✅ Translation settings persist across sessions
✅ Settings page allows customization of preferences
✅ Error handling prevents crashes
✅ TypeScript types ensure type safety
✅ Test coverage for all components
✅ Follows existing design system patterns

## Post-Implementation

After completing this plan:

1. **Update CLAUDE.md** to reflect Phase 4 completion
2. **User testing** of translation features
3. **Performance monitoring** of bundle size impact
4. **Plan Phase 5** (Collection features) or other priorities

This implementation provides the foundation for future enhancements like API integration, multiple simultaneous translations, and tafseer modal functionality.