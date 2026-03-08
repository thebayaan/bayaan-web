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
  try {
    if (!AVAILABLE_TRANSLATIONS || !Array.isArray(AVAILABLE_TRANSLATIONS)) {
      console.error('Available translations data is invalid');
      return [];
    }
    return AVAILABLE_TRANSLATIONS;
  } catch (error) {
    console.error('Error fetching available translations:', error);
    return [];
  }
}

export function getTranslationForVerse(verseKey: string, translationId: string): TranslationVerse | null {
  try {
    // Validate inputs
    if (!verseKey || !translationId) {
      console.warn('Invalid verse key or translation ID provided');
      return null;
    }

    // Validate translation ID exists
    const translationExists = AVAILABLE_TRANSLATIONS.some(t => t.id === translationId);
    if (!translationExists) {
      console.warn(`Translation ID ${translationId} not found in available translations`);
      return null;
    }

    // Validate translation data is available
    if (!translationData || !Array.isArray(translationData)) {
      console.error('Translation data is not available or invalid');
      return null;
    }

    // Find verse in translation data
    const verse = translationData.find((v) => v.verse_key === verseKey);

    if (!verse?.translations?.length) {
      console.warn(`No translations found for verse ${verseKey}`);
      return null;
    }

    // For now, we only support 'saheeh' translation (Saheeh International)
    // When we add more translations, we'll need to map translationId to resource_id
    if (translationId !== 'saheeh') {
      console.warn(`Translation ${translationId} not currently supported`);
      return null;
    }

    // Return the first translation (Saheeh International with resource_id 131)
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

export function getAllTranslationsForVerse(verseKey: string): Record<string, TranslationVerse | null> {
  try {
    // Validate input
    if (!verseKey) {
      console.warn('No verse key provided for getAllTranslationsForVerse');
      return {};
    }

    const translations: Record<string, TranslationVerse | null> = {};

    for (const translation of AVAILABLE_TRANSLATIONS) {
      try {
        translations[translation.id] = getTranslationForVerse(verseKey, translation.id);
      } catch (error) {
        console.error(`Error getting translation ${translation.id} for verse ${verseKey}:`, error);
        translations[translation.id] = null;
      }
    }

    return translations;
  } catch (error) {
    console.error('Error fetching all translations:', error);
    return {};
  }
}