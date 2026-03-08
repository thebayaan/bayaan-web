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