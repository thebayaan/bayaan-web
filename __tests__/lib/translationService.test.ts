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