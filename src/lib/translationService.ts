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
  // Validate translation ID exists
  const translationExists = AVAILABLE_TRANSLATIONS.some(t => t.id === translationId);
  if (!translationExists) {
    return null;
  }

  // Find verse in translation data
  const verse = translationData.find((v) => v.verse_key === verseKey);

  if (!verse || !verse.translations || verse.translations.length === 0) {
    return null;
  }

  // For now, we only support 'saheeh' translation (Saheeh International)
  // When we add more translations, we'll need to map translationId to resource_id
  if (translationId !== 'saheeh') {
    return null;
  }

  // Return the first translation (Saheeh International with resource_id 131)
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