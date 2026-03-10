import Link from 'next/link';
import { Library, ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Collection Not Found Page - Specific recovery for user collection routes
 * Helps users when looking for bookmarks, playlists, or other personal content
 */
export default function CollectionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Icon Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-card)] border border-[var(--color-card-border)]">
          <Library size={24} strokeWidth={1.5} style={{ color: 'var(--color-icon)' }} />
        </div>
      </div>

      {/* Error Message */}
      <div className="mb-6 space-y-2 max-w-md">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Collection Not Found
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-hint)' }}>
          The collection, playlist, or bookmark you&apos;re looking for doesn&apos;t exist
          or may have been removed. Let&apos;s help you find your content.
        </p>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {/* Primary - Browse Collections */}
        <Link
          href="/collection"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'bg-[var(--color-text)] text-[var(--color-background)]',
            'hover:opacity-90 active:scale-[0.98]',
            'focus-visible:ring-[var(--color-text)]'
          )}
        >
          <Library size={16} strokeWidth={2} />
          <span>My Collections</span>
        </Link>

        {/* Secondary - Start Reading */}
        <Link
          href="/mushaf"
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]',
            'border border-[var(--color-card-border)]',
            'text-[var(--color-label)] hover:bg-[var(--color-hover)]'
          )}
        >
          <BookOpen size={16} strokeWidth={2} />
          <span>Read Quran</span>
        </Link>
      </div>

      {/* Collection Actions */}
      <div className="mt-6 pt-4 border-t w-full max-w-sm" style={{ borderColor: 'var(--color-divider)' }}>
        <p className="text-xs mb-3" style={{ color: 'var(--color-hint)' }}>
          Build your personal collection:
        </p>
        <div className="space-y-2 text-xs">
          <Link
            href="/mushaf"
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-lg',
              'text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)]',
              'transition-colors'
            )}
          >
            <Plus size={14} strokeWidth={2} />
            <span>Start bookmarking verses</span>
          </Link>
          <Link
            href="/reciters"
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-lg',
              'text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)]',
              'transition-colors'
            )}
          >
            <Plus size={14} strokeWidth={2} />
            <span>Create audio playlists</span>
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