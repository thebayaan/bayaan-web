import { cn } from '@/lib/cn';
import type { TranslationVerse } from '@/types/translation';
import { useTranslationStore } from '@/stores/useTranslationStore';

interface TranslationDisplayProps {
  translation: TranslationVerse | null;
  className?: string;
}

export function TranslationDisplay({ translation, className }: TranslationDisplayProps) {
  const { fontSize } = useTranslationStore();

  // Early return for null/undefined translation
  if (!translation) {
    return null;
  }

  // Defensive check for translation text
  if (!translation.text || typeof translation.text !== 'string') {
    console.warn('Invalid translation text provided:', translation);
    return (
      <div className={cn('text-color-hint text-sm italic', className)}>
        Translation text unavailable
      </div>
    );
  }

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  // Fallback to medium if fontSize is invalid
  const textSizeClass = sizeClasses[fontSize] || sizeClasses.medium;

  return (
    <div className={cn('text-color-label leading-relaxed', textSizeClass, className)}>
      {translation.text}
    </div>
  );
}