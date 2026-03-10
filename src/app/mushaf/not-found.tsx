import Link from 'next/link';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Mushaf Not Found Page - Specific recovery for Quran text routes
 * Helps users when looking for specific surahs or verses
 */
export default function MushafNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Icon Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-card)] border border-[var(--color-card-border)]">
          <BookOpen size={24} strokeWidth={1.5} style={{ color: 'var(--color-icon)' }} />
        </div>
      </div>

      {/* Error Message */}
      <div className="mb-6 space-y-2 max-w-md">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Surah Not Found
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-hint)' }}>
          The surah you&apos;re looking for doesn&apos;t exist or the link may be broken.
          Let&apos;s help you find the right Quranic text.
        </p>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {/* Primary - Browse All Surahs */}
        <Link
          href="/mushaf"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'bg-[var(--color-text)] text-[var(--color-background)]',
            'hover:opacity-90 active:scale-[0.98]',
            'focus-visible:ring-[var(--color-text)]'
          )}
        >
          <BookOpen size={16} strokeWidth={2} />
          <span>Browse Surahs</span>
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

      {/* Popular Surahs Quick Access */}
      <div className="mt-6 pt-4 border-t w-full max-w-sm" style={{ borderColor: 'var(--color-divider)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--color-hint)' }}>
          Popular surahs:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href="/mushaf/1"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Al-Fatiha
          </Link>
          <Link
            href="/mushaf/2"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Al-Baqarah
          </Link>
          <Link
            href="/mushaf/36"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Ya-Sin
          </Link>
          <Link
            href="/mushaf/67"
            className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
          >
            Al-Mulk
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