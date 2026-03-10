import { Loader2 } from 'lucide-react';

/**
 * Global Loading Component - Shown during route transitions
 * Provides consistent loading feedback across all navigation
 */
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Loading Spinner */}
      <div className="mb-6">
        <Loader2
          size={32}
          strokeWidth={1.5}
          className="animate-spin"
          style={{ color: 'var(--color-icon)' }}
          aria-hidden="true"
        />
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2 max-w-xs">
        <p className="text-sm font-medium" style={{ color: 'var(--color-label)' }}>
          Loading...
        </p>
        <p className="text-xs" style={{ color: 'var(--color-hint)' }}>
          Preparing your Quran experience
        </p>
      </div>

      {/* Progress Animation */}
      <div className="mt-8 w-32 h-0.5 bg-[var(--color-card)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--color-text)', opacity: 0.2 }}
        />
      </div>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite" role="status">
        Loading page content, please wait...
      </div>
    </div>
  );
}