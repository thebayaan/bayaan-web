import { cn } from '@/lib/cn';
import type { TranslationVerse } from '@/types/translation';
import { useTranslationStore } from '@/stores/useTranslationStore';

interface TranslationDisplayProps {
  translation: TranslationVerse | null;
  className?: string;
}

export function TranslationDisplay({ translation, className }: TranslationDisplayProps) {
  const { fontSize } = useTranslationStore();

  if (!translation) {
    return null;
  }

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={cn('text-color-label leading-relaxed', sizeClasses[fontSize], className)}>
      {translation.text}
    </div>
  );
}