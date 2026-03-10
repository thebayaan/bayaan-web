'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import {
  ArrowRight,
  BookOpen,
  Mic,
  Star,
  Library,
  Search,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavigationSuggestion {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  primary?: boolean;
}

interface NavigationHelperProps {
  className?: string;
  showRelated?: boolean;
  showNext?: boolean;
}

/**
 * NavigationHelper - Provides contextual navigation suggestions
 * Helps users discover related content and suggests logical next steps
 */
export function NavigationHelper({
  className,
  showRelated = true,
  showNext = true,
}: NavigationHelperProps) {
  const pathname = usePathname();
  const suggestions = getNavigationSuggestions(pathname);

  if (suggestions.length === 0) return null;

  const primarySuggestion = suggestions.find(s => s.primary);
  const secondarySuggestions = suggestions.filter(s => !s.primary);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Primary Suggestion */}
      {primarySuggestion && showNext && (
        <div>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-section)' }}>
            Suggested Next
          </h3>
          <Link
            href={primarySuggestion.href}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl transition-all duration-200',
              'bg-[var(--color-card)] border border-[var(--color-card-border)]',
              'hover:bg-[var(--color-hover)] hover:border-[var(--color-text)]/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]',
              'group'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              <primarySuggestion.icon
                size={16}
                strokeWidth={2}
                className="text-[var(--color-icon)] group-hover:text-[var(--color-label)] transition-colors"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--color-label)' }}>
                {primarySuggestion.title}
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-hint)' }}>
                {primarySuggestion.description}
              </p>
            </div>
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="flex-shrink-0 mt-1 text-[var(--color-icon)] group-hover:text-[var(--color-label)] group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>
      )}

      {/* Related/Secondary Suggestions */}
      {secondarySuggestions.length > 0 && showRelated && (
        <div>
          <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-section)' }}>
            Related
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {secondarySuggestions.slice(0, 3).map((suggestion) => (
              <Link
                key={suggestion.href}
                href={suggestion.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  'text-sm text-[var(--color-icon)] hover:text-[var(--color-label)]',
                  'hover:bg-[var(--color-hover)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]'
                )}
              >
                <suggestion.icon size={14} strokeWidth={2} />
                <span className="flex-1 truncate">{suggestion.title}</span>
                <ArrowRight size={12} strokeWidth={2} className="flex-shrink-0 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get navigation suggestions based on current path
 */
function getNavigationSuggestions(pathname: string): NavigationSuggestion[] {
  const suggestions: NavigationSuggestion[] = [];

  // Home page suggestions
  if (pathname === '/') {
    suggestions.push(
      {
        title: 'Start Reading',
        description: 'Begin your Quran journey with the complete Mushaf',
        href: '/mushaf',
        icon: BookOpen,
        primary: true,
      },
      {
        title: 'Listen to Reciters',
        description: 'Explore beautiful recitations',
        href: '/reciters',
        icon: Mic,
      },
      {
        title: 'Morning Adhkar',
        description: 'Start your day with remembrance',
        href: '/adhkar',
        icon: Star,
      }
    );
  }

  // Mushaf suggestions
  else if (pathname.startsWith('/mushaf')) {
    if (pathname === '/mushaf') {
      suggestions.push(
        {
          title: 'Listen to Audio',
          description: 'Hear these verses recited beautifully',
          href: '/reciters',
          icon: Mic,
          primary: true,
        },
        {
          title: 'Your Collection',
          description: 'View bookmarked verses',
          href: '/collection',
          icon: Library,
        },
        {
          title: 'Search Verses',
          description: 'Find specific content',
          href: '/search',
          icon: Search,
        }
      );
    } else {
      // Specific surah page
      suggestions.push(
        {
          title: 'Listen to This Surah',
          description: 'Hear this surah recited by different reciters',
          href: '/reciters',
          icon: Mic,
          primary: true,
        },
        {
          title: 'Browse More Surahs',
          description: 'Continue reading other chapters',
          href: '/mushaf',
          icon: BookOpen,
        },
        {
          title: 'Your Collection',
          description: 'Save verses for later',
          href: '/collection',
          icon: Library,
        }
      );
    }
  }

  // Reciters suggestions
  else if (pathname.startsWith('/reciters') || pathname.startsWith('/reciter')) {
    suggestions.push(
      {
        title: 'Read Along',
        description: 'Follow along with the Mushaf text',
        href: '/mushaf',
        icon: BookOpen,
        primary: true,
      },
      {
        title: 'Create Playlist',
        description: 'Save your favorite recitations',
        href: '/collection',
        icon: Library,
      },
      {
        title: 'Browse More Reciters',
        description: 'Discover different recitation styles',
        href: '/reciters',
        icon: Mic,
      }
    );
  }

  // Adhkar suggestions
  else if (pathname.startsWith('/adhkar')) {
    suggestions.push(
      {
        title: 'Read Quran',
        description: 'Continue with Quranic verses',
        href: '/mushaf',
        icon: BookOpen,
        primary: true,
      },
      {
        title: 'Your Collection',
        description: 'Save favorite adhkar',
        href: '/collection',
        icon: Library,
      },
      {
        title: 'Search Content',
        description: 'Find specific prayers',
        href: '/search',
        icon: Search,
      }
    );
  }

  // Collection suggestions
  else if (pathname.startsWith('/collection')) {
    suggestions.push(
      {
        title: 'Add More Content',
        description: 'Bookmark verses and create playlists',
        href: '/mushaf',
        icon: BookOpen,
        primary: true,
      },
      {
        title: 'Explore Reciters',
        description: 'Find audio to add to playlists',
        href: '/reciters',
        icon: Mic,
      },
      {
        title: 'Browse Adhkar',
        description: 'Save prayers and remembrance',
        href: '/adhkar',
        icon: Star,
      }
    );
  }

  // Search suggestions
  else if (pathname === '/search') {
    suggestions.push(
      {
        title: 'Browse Mushaf',
        description: 'Read the complete Quran',
        href: '/mushaf',
        icon: BookOpen,
        primary: true,
      },
      {
        title: 'Explore Collections',
        description: 'Find curated content',
        href: '/collection',
        icon: Library,
      },
      {
        title: 'Listen to Audio',
        description: 'Discover beautiful recitations',
        href: '/reciters',
        icon: Mic,
      }
    );
  }

  // Settings suggestions
  else if (pathname.startsWith('/settings')) {
    suggestions.push(
      {
        title: 'Return to Reading',
        description: 'Apply your new settings',
        href: '/mushaf',
        icon: BookOpen,
        primary: true,
      },
      {
        title: 'Test Audio Settings',
        description: 'Listen with your preferences',
        href: '/reciters',
        icon: Mic,
      }
    );
  }

  // Default fallback
  else {
    suggestions.push(
      {
        title: 'Return Home',
        description: 'Go back to the main page',
        href: '/',
        icon: Home,
        primary: true,
      },
      {
        title: 'Search Content',
        description: 'Find what you are looking for',
        href: '/search',
        icon: Search,
      }
    );
  }

  return suggestions;
}

/**
 * Simple Previous/Next Navigation for sequences
 */
interface SequenceNavigationProps {
  previousHref?: string;
  nextHref?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function SequenceNavigation({
  previousHref,
  nextHref,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  className,
}: SequenceNavigationProps) {
  if (!previousHref && !nextHref) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Previous */}
      {previousHref ? (
        <Link
          href={previousHref}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            'text-sm text-[var(--color-icon)] hover:text-[var(--color-label)]',
            'hover:bg-[var(--color-hover)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]'
          )}
        >
          <ChevronLeft size={16} strokeWidth={2} />
          <span>{previousLabel}</span>
        </Link>
      ) : (
        <div /> // Spacer
      )}

      {/* Next */}
      {nextHref ? (
        <Link
          href={nextHref}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            'text-sm text-[var(--color-icon)] hover:text-[var(--color-label)]',
            'hover:bg-[var(--color-hover)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]'
          )}
        >
          <span>{nextLabel}</span>
          <ChevronRight size={16} strokeWidth={2} />
        </Link>
      ) : (
        <div /> // Spacer
      )}
    </div>
  );
}