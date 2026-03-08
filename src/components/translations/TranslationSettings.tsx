'use client';

import { useTranslationStore } from '@/stores/useTranslationStore';
import { getAvailableTranslations } from '@/lib/translationService';
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
              onChange={(e) => setTranslationPosition(e.target.value as TranslationPosition)}
            />
            <span>Below verse</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="position"
              value="side"
              checked={translationPosition === 'side'}
              onChange={(e) => setTranslationPosition(e.target.value as TranslationPosition)}
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
          onChange={(e) => setFontSize(e.target.value as FontSize)}
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