'use client';

import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface NoteButtonProps {
  hasNote: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function NoteButton({
  hasNote,
  onClick,
  size = 'sm',
  className
}: NoteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <IconButton
      size={size}
      onClick={handleClick}
      className={cn(
        'transition-colors',
        hasNote
          ? 'text-accent hover:text-accent/80'
          : 'text-icon hover:text-accent',
        className
      )}
      title={hasNote ? 'Edit note' : 'Add note'}
    >
      {hasNote ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )}
    </IconButton>
  );
}