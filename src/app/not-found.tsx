import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Global Not Found Page - Provides navigation recovery options
 * when users encounter missing pages or broken links
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* 404 Visual */}
      <div className="mb-8 relative">
        <div className="text-8xl font-bold opacity-10 select-none">
          404
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="w-16 h-16 rounded-full border-2 opacity-20"
               style={{ borderColor: 'var(--color-text)' }} />
        </div>
      </div>

      {/* Error Message */}
      <div className="mb-8 space-y-3 max-w-md">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Page Not Found
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-hint)' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s help you find your way back to the Quran and adhkar.
        </p>
      </div>

      {/* Navigation Recovery Options */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {/* Primary Action - Home */}
        <Link
          href="/"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'bg-[var(--color-text)] text-[var(--color-background)]',
            'hover:opacity-90 active:scale-[0.98]',
            'focus-visible:ring-[var(--color-text)]'
          )}
          aria-label="Return to home page"
        >
          <Home size={16} strokeWidth={2} />
          <span>Go Home</span>
        </Link>

        {/* Secondary Action - Search */}
        <Link
          href="/search"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]',
            'border border-[var(--color-card-border)]',
            'text-[var(--color-label)] hover:bg-[var(--color-hover)]'
          )}
          aria-label="Search for content"
        >
          <Search size={16} strokeWidth={2} />
          <span>Search</span>
        </Link>
      </div>

      {/* Additional Navigation Links */}
      <div className="mt-8 pt-6 border-t w-full max-w-sm" style={{ borderColor: 'var(--color-divider)' }}>
        <p className="text-xs mb-4" style={{ color: 'var(--color-hint)' }}>
          Or explore these sections:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/mushaf"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Mushaf
          </Link>
          <Link
            href="/reciters"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Reciters
          </Link>
          <Link
            href="/adhkar"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Adhkar
          </Link>
          <Link
            href="/collection"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Collection
          </Link>
        </div>
      </div>

      {/* Browser Back Button */}
      <button
        onClick={() => window.history.back()}
        className={cn(
          'mt-6 flex items-center gap-1 text-xs',
          'text-[var(--color-hint)] hover:text-[var(--color-icon)]',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:text-[var(--color-label)]'
        )}
        aria-label="Go back to previous page"
      >
        <ArrowLeft size={12} strokeWidth={2} />
        <span>Go back</span>
      </button>
    </div>
  );
}