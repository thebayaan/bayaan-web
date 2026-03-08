'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';

type AmbientAudioContextType = ReturnType<typeof useAmbientAudio> | null;

const AmbientAudioContext = createContext<AmbientAudioContextType>(null);

export function useAmbientAudioContext() {
  const context = useContext(AmbientAudioContext);
  if (!context) {
    throw new Error('useAmbientAudioContext must be used within an AmbientAudioProvider');
  }
  return context;
}

interface AmbientAudioProviderProps {
  children: ReactNode;
}

export function AmbientAudioProvider({ children }: AmbientAudioProviderProps) {
  const ambientAudio = useAmbientAudio();

  return (
    <AmbientAudioContext.Provider value={ambientAudio}>
      {children}
    </AmbientAudioContext.Provider>
  );
}

// Enhanced Button component with sound effects
interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  soundEffect?: 'click' | 'page_turn' | 'bookmark' | 'none';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function SoundButton({
  children,
  onClick,
  soundEffect = 'click',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: SoundButtonProps) {
  const { playSound, isEnabled } = useAmbientAudioContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Play sound effect if enabled
    if (isEnabled && soundEffect !== 'none' && !disabled) {
      playSound(soundEffect);
    }

    // Call original click handler
    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-[color:var(--color-label)] text-[color:var(--color-background)] hover:opacity-90',
    secondary: 'bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] text-[color:var(--color-label)] hover:bg-[color:var(--color-hover)]',
    ghost: 'text-[color:var(--color-label)] hover:bg-[color:var(--color-hover)]',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-label)]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Enhanced Card component with hover sound
interface SoundCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  soundEffect?: 'click' | 'page_turn' | 'none';
  interactive?: boolean;
}

export function SoundCard({
  children,
  className = '',
  onClick,
  soundEffect = 'click',
  interactive = !!onClick,
}: SoundCardProps) {
  const { playSound, isEnabled } = useAmbientAudioContext();

  const handleClick = () => {
    // Play sound effect if enabled and interactive
    if (isEnabled && soundEffect !== 'none' && interactive) {
      playSound(soundEffect);
    }

    onClick?.();
  };

  return (
    <div
      className={`
        bg-[color:var(--color-card)] border border-[color:var(--color-card-border)]
        rounded-xl transition-all duration-200 ease-out
        ${interactive ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:bg-[color:var(--color-hover)]' : ''}
        ${className}
      `}
      onClick={interactive ? handleClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}