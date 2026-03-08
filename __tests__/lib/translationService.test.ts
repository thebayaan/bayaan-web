import { getTranslationForVerse, getAvailableTranslations, getAllTranslationsForVerse } from '@/lib/translationService';

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

  test('should return null for invalid translation ID', () => {
    const translation = getTranslationForVerse('1:1', 'invalid');
    expect(translation).toBeNull();
  });

  test('should return null for non-saheeh translation ID', () => {
    const translation = getTranslationForVerse('1:1', 'other-translation');
    expect(translation).toBeNull();
  });

  test('should test getAllTranslationsForVerse', () => {
    const translations = getAllTranslationsForVerse('1:1');
    expect(translations).toHaveProperty('saheeh');
    expect(translations.saheeh?.verse_key).toBe('1:1');
    expect(translations.saheeh?.text).toContain('Allah');
  });

  test('should handle edge cases - empty string verse key', () => {
    const translation = getTranslationForVerse('', 'saheeh');
    expect(translation).toBeNull();
  });

  test('should handle edge cases - empty string translation ID', () => {
    const translation = getTranslationForVerse('1:1', '');
    expect(translation).toBeNull();
  });

  test('should handle edge cases - malformed verse key', () => {
    const translation = getTranslationForVerse('invalid-verse-key', 'saheeh');
    expect(translation).toBeNull();
  });

  test('should handle edge cases - getAllTranslationsForVerse with invalid verse', () => {
    const translations = getAllTranslationsForVerse('999:999');
    expect(translations).toHaveProperty('saheeh');
    expect(translations.saheeh).toBeNull();
  });

  test('should return all available translations when calling getAllTranslationsForVerse', () => {
    const translations = getAllTranslationsForVerse('1:2');
    const availableTranslations = getAvailableTranslations();

    // Should have same number of keys as available translations
    expect(Object.keys(translations)).toHaveLength(availableTranslations.length);

    // Should have all translation IDs as keys
    availableTranslations.forEach(t => {
      expect(translations).toHaveProperty(t.id);
    });
  });
});