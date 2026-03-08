'use client';

import { useTranslationStore } from '@/stores/useTranslationStore';
import { IconButton } from '@/components/ui/IconButton';

interface TranslationToggleProps {
  className?: string;
}

export function TranslationToggle({ className }: TranslationToggleProps) {
  const { showTranslations, toggleTranslations } = useTranslationStore();

  return (
    <IconButton
      onClick={toggleTranslations}
      className={className}
      title={showTranslations ? 'Hide Translation' : 'Show Translation'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    </IconButton>
  );
}