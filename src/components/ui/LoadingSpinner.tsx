'use client';

import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * LoadingSpinner — animated loading indicator with accessibility
 */
export function LoadingSpinner({ size = 'md', className, label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
      role="status"
      aria-label={label}
    >
      <Loader2
        size={sizeMap[size]}
        className="animate-spin"
        style={{ color: 'var(--color-icon)' }}
      />
      <span className="sr-only">{label}...</span>
    </div>
  );
}

/**
 * Pulse animation for loading states
 */
interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export function Pulse({ children, className }: PulseProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {children}
    </div>
  );
}

/**
 * Loading dots animation
 */
interface LoadingDotsProps {
  className?: string;
  label?: string;
}

export function LoadingDots({ className, label = 'Loading' }: LoadingDotsProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="status"
      aria-label={label}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: 'var(--color-icon)',
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
      <span className="sr-only">{label}...</span>
    </div>
  );
}

/**
 * Progress bar with smooth animation
 */
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  label?: string;
  showText?: boolean;
}

export function ProgressBar({
  progress,
  className,
  label = 'Progress',
  showText = false,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--color-label)' }}
          >
            {label}
          </span>
          <span
            className="text-sm tabular-nums"
            style={{ color: 'var(--color-hint)' }}
          >
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-card)' }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            backgroundColor: 'var(--color-text)',
            width: `${clampedProgress}%`,
            transform: clampedProgress === 0 ? 'scaleX(0)' : 'scaleX(1)',
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for text content
 */
interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export function TextSkeleton({ lines = 3, className }: TextSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 rounded animate-pulse"
          style={{
            backgroundColor: 'var(--color-card)',
            width: i === lines - 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for content cards
 */
interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
}

export function CardSkeleton({ className, showAvatar = false }: CardSkeletonProps) {
  return (
    <div
      className={cn("p-4 rounded-lg border animate-pulse", className)}
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-card-border)',
      }}
    >
      <div className="flex items-center gap-3">
        {showAvatar && (
          <div
            className="h-10 w-10 rounded-full"
            style={{ backgroundColor: 'var(--color-divider)' }}
          />
        )}

        <div className="flex-1 space-y-2">
          <div
            className="h-4 rounded"
            style={{ backgroundColor: 'var(--color-divider)' }}
          />
          <div
            className="h-3 rounded w-3/4"
            style={{ backgroundColor: 'var(--color-divider)' }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div
          className="h-3 rounded"
          style={{ backgroundColor: 'var(--color-divider)' }}
        />
        <div
          className="h-3 rounded w-5/6"
          style={{ backgroundColor: 'var(--color-divider)' }}
        />
      </div>
    </div>
  );
}