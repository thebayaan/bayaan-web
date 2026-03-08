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
      id: 1,
      surah_number: 1,
      verse_key: '1:1',
      ayah_number: 1,
      text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    };

    render(<VerseDisplay verse={mockVerse} />);

    expect(screen.getByText(/In the name of Allah/)).toBeInTheDocument();
    expect(screen.getByText(/بِسْمِ ٱللَّهِ/)).toBeInTheDocument();
  });
});