# Phase 4: Translations & Tafseer Design

**Date:** March 8, 2026
**Status:** Approved for Implementation
**Approach:** Bundled-First (Progressive Enhancement)

## Overview

Implement translation and tafseer support for Bayaan Web, enabling users to view Quranic verses alongside English translations and access commentary (tafseer). This phase builds on the existing Mushaf foundation from Phase 2.

## Architecture

### Design Philosophy
- **Bundled-First**: Use existing `quran-translation.json` data for immediate functionality
- **Progressive Enhancement**: Foundation for future API integration
- **Offline-First**: No external dependencies, works without network
- **Consistent UX**: Follows established alpha-based design system

### Technology Stack
- **State Management**: Zustand store for translation preferences
- **Storage**: localStorage for user preferences
- **Data Source**: Static JSON files (existing `quran-translation.json`)
- **UI Framework**: React Server Components + Client interactivity
- **Styling**: Tailwind with alpha-based tokens

## Component Architecture

```
src/
├── components/translations/
│   ├── TranslationToggle.tsx      # Quick on/off toggle
│   ├── TranslationSelector.tsx    # Dropdown for translation selection
│   ├── TranslationDisplay.tsx     # Formatted translation text
│   └── TafseerModal.tsx          # Modal overlay for tafseer
├── stores/
│   └── useTranslationStore.ts    # Translation state management
├── types/
│   └── translation.ts            # TypeScript interfaces
└── app/settings/translations/
    └── page.tsx                  # Translation preferences UI
```

## Data Flow

### Translation State
```typescript
interface TranslationStore {
  selectedTranslation: string | null
  showTranslations: boolean
  translationPosition: 'below' | 'side'
  fontSize: 'small' | 'medium' | 'large'
}
```

### Data Sources
1. **Primary**: `src/data/quran-translation.json` (existing Saheeh International)
2. **Future**: Al Quran Cloud API (101+ translations)
3. **Fallback**: Default to Arabic-only if translation fails

### Component Integration
```
VerseDisplay
├── ArabicText (existing)
├── TranslationToggle
└── TranslationDisplay
    ├── TranslationSelector
    └── individual translation text
```

## Implementation Plan

### Phase 4.1: Core Translation Display
1. **Translation Store**: Create Zustand store with persistence
2. **Translation Components**: Build toggle, selector, and display
3. **Mushaf Integration**: Enhance existing `VerseDisplay.tsx`
4. **Basic Settings**: Add translation section to settings page

### Phase 4.2: Enhanced Features
1. **Tafseer Modal**: Click-to-view commentary system
2. **Layout Options**: Side-by-side vs below positioning
3. **Typography Controls**: Font size and styling options
4. **Accessibility**: Screen reader support, keyboard navigation

### Phase 4.3: Data Enhancement
1. **Multi-Translation Support**: Prepare for multiple simultaneous translations
2. **Translation Metadata**: Author, language, description information
3. **Search Integration**: Translation-aware verse search
4. **Performance**: Lazy loading and optimization

## Technical Specifications

### Store Interface
```typescript
interface TranslationStore {
  // State
  selectedTranslation: string | null
  showTranslations: boolean
  translationPosition: 'below' | 'side'
  fontSize: 'small' | 'medium' | 'large'

  // Actions
  setSelectedTranslation: (id: string) => void
  toggleTranslations: () => void
  setTranslationPosition: (position: 'below' | 'side') => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}
```

### Data Structure Enhancement
Extend existing translation data with metadata:
```typescript
interface TranslationData {
  id: string
  name: string
  author: string
  language: string
  direction: 'ltr' | 'rtl'
  verses: TranslationVerse[]
}
```

## User Experience

### Translation Toggle Flow
1. User clicks translation toggle in verse display
2. Translation appears below/beside Arabic text
3. User can select different translations via dropdown
4. Preferences persist across sessions

### Settings Management
1. Dedicated translation settings page at `/settings/translations`
2. Options for display position, font size, default translation
3. Preview functionality to test settings

### Accessibility
- ARIA labels for translation controls
- Keyboard navigation support
- Screen reader announcements for translation changes
- High contrast mode support

## Error Handling

### Graceful Degradation
- **Missing Translation**: Fall back to Arabic-only display
- **Corrupted Data**: Display error message with retry option
- **Storage Issues**: Use in-memory state as fallback

### Loading States
- Skeleton loading for translation switching
- Progressive disclosure for tafseer content
- Non-blocking updates (doesn't freeze Arabic text)

## Testing Strategy

### Unit Tests
- Translation store actions and persistence
- Translation text formatting utilities
- Component prop handling and edge cases

### Integration Tests
- Mushaf + translation interaction
- Settings persistence workflow
- Translation switching performance

### User Acceptance Criteria
- [ ] User can toggle translations on/off
- [ ] User can select between available translations
- [ ] Translation preferences persist across sessions
- [ ] Translation display doesn't break Arabic text layout
- [ ] Settings page provides intuitive translation management

## Performance Considerations

### Bundle Size
- Lazy load translation components
- Code-split tafseer functionality
- Optimize translation data format

### Runtime Performance
- Memoize translation lookups
- Virtualize long translation lists
- Debounce rapid translation switches

## Future Enhancements

### API Integration Ready
- Store design supports dynamic translation loading
- Component architecture allows API data injection
- Settings framework extensible for remote translations

### Advanced Features
- Multi-translation comparison view
- Translation bookmarking and notes
- Audio-synchronized translation highlighting

## Success Metrics

- Translation feature usage rate
- User engagement with different translations
- Settings customization adoption
- Performance impact on existing features

---

**Implementation Timeline**: ~1 Sprint (5-7 days)
**Dependencies**: Phase 2 (Mushaf) completion
**Risk Level**: Low (extends existing patterns)
**Reviewer**: Tech Lead approval required before implementation