import Link from 'next/link';
import { Star, ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Adhkar Not Found Page - Specific recovery for prayer/dhikr routes
 * Helps users find the right adhkar collections
 */
export default function AdhkarNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Icon Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-card)] border border-[var(--color-card-border)]">
          <Star size={24} strokeWidth={1.5} style={{ color: 'var(--color-icon)' }} />
        </div>
      </div>

      {/* Error Message */}
      <div className="mb-6 space-y-2 max-w-md">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Adhkar Not Found
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-hint)' }}>
          The adhkar collection you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s help you find the right prayers and remembrance.
        </p>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {/* Primary - Browse All Adhkar */}
        <Link
          href="/adhkar"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'bg-[var(--color-text)] text-[var(--color-background)]',
            'hover:opacity-90 active:scale-[0.98]',
            'focus-visible:ring-[var(--color-text)]'
          )}
        >
          <Star size={16} strokeWidth={2} />
          <span>Browse Adhkar</span>
        </Link>

        {/* Secondary - Search */}
        <Link
          href="/search"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]',
            'border border-[var(--color-card-border)]',
            'text-[var(--color-label)] hover:bg-[var(--color-hover)]'
          )}
        >
          <Search size={16} strokeWidth={2} />
          <span>Search</span>
        </Link>
      </div>

      {/* Popular Adhkar Collections */}
      <div className="mt-6 pt-4 border-t w-full max-w-sm" style={{ borderColor: 'var(--color-divider)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--color-hint)' }}>
          Popular collections:
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <Link
            href="/adhkar/morning"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors text-center"
          >
            Morning Adhkar
          </Link>
          <Link
            href="/adhkar/evening"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors text-center"
          >
            Evening Adhkar
          </Link>
          <Link
            href="/adhkar/sleep"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors text-center"
          >
            Sleep Adhkar
          </Link>
        </div>
      </div>

      {/* Back Navigation */}
      <button
        onClick={() => window.history.back()}
        className={cn(
          'mt-4 flex items-center gap-1 text-xs',
          'text-[var(--color-hint)] hover:text-[var(--color-icon)]',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:text-[var(--color-label)]'
        )}
      >
        <ArrowLeft size={12} strokeWidth={2} />
        <span>Go back</span>
      </button>
    </div>
  );
}