'use client';

import { useTranslationStore } from '@/stores/useTranslationStore';
import { getAvailableTranslations } from '@/lib/translationService';
import { cn } from '@/lib/cn';
import type { TranslationPosition, FontSize } from '@/types/translation';

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

  // Get available translations with error handling
  let availableTranslations;
  try {
    availableTranslations = getAvailableTranslations();
  } catch (error) {
    console.error('Failed to load available translations:', error);
    return (
      <div className="space-y-6 p-6">
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-label)',
          }}
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-sm font-semibold mb-1">Error Loading Settings</h3>
          <p className="text-sm" style={{ color: 'var(--color-hint)' }}>
            Unable to load translation settings. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Validate that translations are available
  if (!availableTranslations || availableTranslations.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
            color: 'var(--color-label)',
          }}
          role="alert"
          aria-live="polite"
        >
          <h3 className="text-sm font-semibold mb-1">No Translations Available</h3>
          <p className="text-sm" style={{ color: 'var(--color-hint)' }}>
            No translations are currently available. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const formBaseClasses = cn(
    "w-full rounded-xl border transition-all duration-150",
    "focus-within:ring-1 focus-within:ring-[var(--color-text)]"
  );

  const inputClasses = cn(
    "w-full h-10 px-3 bg-transparent text-sm font-medium",
    "focus:outline-none"
  );

  const selectClasses = cn(
    inputClasses,
    "cursor-pointer"
  );

  return (
    <div className="space-y-6 p-6">
      {/* Display Settings Section */}
      <div>
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--color-label)' }}
        >
          Display Settings
        </h3>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showTranslations}
            onChange={toggleTranslations}
            className={cn(
              "w-4 h-4 rounded border transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "cursor-pointer"
            )}
            style={{
              borderColor: 'var(--color-card-border)',
              backgroundColor: showTranslations ? 'var(--color-text)' : 'transparent',
            }}
            aria-describedby="show-translations-description"
          />
          <div className="flex flex-col">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-label)' }}
            >
              Show translations by default
            </span>
            <span
              id="show-translations-description"
              className="text-xs"
              style={{ color: 'var(--color-hint)' }}
            >
              Display translations automatically when viewing verses
            </span>
          </div>
        </label>
      </div>

      {/* Default Translation Section */}
      <div>
        <label
          htmlFor="default-translation"
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-label)' }}
        >
          Default Translation
        </label>
        <div
          className={formBaseClasses}
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <select
            id="default-translation"
            value={selectedTranslation || ''}
            onChange={(e) => setSelectedTranslation(e.target.value)}
            className={selectClasses}
            style={{ color: 'var(--color-label)' }}
            aria-describedby="default-translation-description"
          >
            {availableTranslations.map((translation) => (
              <option key={translation.id} value={translation.id}>
                {translation.name} - {translation.author}
              </option>
            ))}
          </select>
        </div>
        <p
          id="default-translation-description"
          className="text-xs mt-1"
          style={{ color: 'var(--color-hint)' }}
        >
          Choose which translation to display by default
        </p>
      </div>

      {/* Translation Position Section */}
      <fieldset>
        <legend
          className="block text-sm font-medium mb-3"
          style={{ color: 'var(--color-label)' }}
        >
          Translation Position
        </legend>
        <div
          className="space-y-3"
          role="radiogroup"
          aria-describedby="position-description"
        >
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="position"
              value="below"
              checked={translationPosition === 'below'}
              onChange={(e) => setTranslationPosition(e.target.value as TranslationPosition)}
              className={cn(
                "w-4 h-4 border-2 rounded-full transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "cursor-pointer"
              )}
              style={{
                borderColor: translationPosition === 'below' ? 'var(--color-text)' : 'var(--color-card-border)',
                backgroundColor: translationPosition === 'below' ? 'var(--color-text)' : 'transparent',
              }}
              aria-describedby="position-below-description"
            />
            <div className="flex flex-col">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-label)' }}
              >
                Below verse
              </span>
              <span
                id="position-below-description"
                className="text-xs"
                style={{ color: 'var(--color-hint)' }}
              >
                Translation appears underneath the Arabic text
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="position"
              value="side"
              checked={translationPosition === 'side'}
              onChange={(e) => setTranslationPosition(e.target.value as TranslationPosition)}
              className={cn(
                "w-4 h-4 border-2 rounded-full transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "cursor-pointer"
              )}
              style={{
                borderColor: translationPosition === 'side' ? 'var(--color-text)' : 'var(--color-card-border)',
                backgroundColor: translationPosition === 'side' ? 'var(--color-text)' : 'transparent',
              }}
              aria-describedby="position-side-description"
            />
            <div className="flex flex-col">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-label)' }}
              >
                Side by side
              </span>
              <span
                id="position-side-description"
                className="text-xs"
                style={{ color: 'var(--color-hint)' }}
              >
                Translation appears next to the Arabic text
              </span>
            </div>
          </label>
        </div>
        <p
          id="position-description"
          className="text-xs mt-2"
          style={{ color: 'var(--color-hint)' }}
        >
          Choose where translations should appear relative to the Arabic text
        </p>
      </fieldset>

      {/* Font Size Section */}
      <div>
        <label
          htmlFor="font-size"
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-label)' }}
        >
          Translation Font Size
        </label>
        <div
          className={formBaseClasses}
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as FontSize)}
            className={selectClasses}
            style={{ color: 'var(--color-label)' }}
            aria-describedby="font-size-description"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <p
          id="font-size-description"
          className="text-xs mt-1"
          style={{ color: 'var(--color-hint)' }}
        >
          Adjust the size of translation text for better readability
        </p>
      </div>
    </div>
  );
}