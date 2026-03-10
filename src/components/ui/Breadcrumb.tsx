'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Breadcrumb Navigation Component
 * Automatically generates breadcrumbs based on route or accepts custom items
 */
export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs if no items provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center gap-1" role="list">
        {/* Home Link */}
        {showHome && (
          <li>
            <Link
              href="/"
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
                'text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]'
              )}
              aria-label="Home"
            >
              <Home size={14} strokeWidth={2} />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <Fragment key={item.href}>
              {/* Separator */}
              {(showHome || index > 0) && (
                <li aria-hidden="true">
                  <ChevronRight
                    size={12}
                    strokeWidth={2}
                    className="text-[var(--color-divider)]"
                  />
                </li>
              )}

              {/* Breadcrumb Item */}
              <li>
                {isLast ? (
                  // Current page (not linked)
                  <span
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md',
                      'text-[var(--color-label)] font-medium'
                    )}
                    aria-current="page"
                  >
                    {Icon && <Icon size={14} strokeWidth={2} />}
                    <span>{item.label}</span>
                  </span>
                ) : (
                  // Linked breadcrumb
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
                      'text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]'
                    )}
                  >
                    {Icon && <Icon size={14} strokeWidth={2} />}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Auto-generate breadcrumbs based on current path
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Remove leading and trailing slashes, split by '/'
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return [];

  const breadcrumbs: BreadcrumbItem[] = [];

  // Build breadcrumbs progressively
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Generate label and check if it's a dynamic route
    const label = generateLabel(segment, segments, i);

    if (label) {
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Generate human-readable labels for path segments
 */
function generateLabel(segment: string, allSegments: string[], index: number): string | null {
  // Skip empty segments
  if (!segment) return null;

  // Handle special routes
  const routeLabels: Record<string, string> = {
    'mushaf': 'Mushaf',
    'reciters': 'Reciters',
    'reciter': 'Reciter',
    'adhkar': 'Adhkar',
    'search': 'Search',
    'collection': 'Collection',
    'playlist': 'Playlist',
    'settings': 'Settings',
    'translations': 'Translations',
    'offline': 'Offline',
  };

  // Use predefined label if available
  if (routeLabels[segment]) {
    return routeLabels[segment];
  }

  // Handle dynamic routes (IDs, slugs)
  if (/^\d+$/.test(segment)) {
    // Numeric ID - provide context based on parent route
    const parent = allSegments[index - 1];
    if (parent === 'mushaf') {
      return `Surah ${segment}`;
    } else if (parent === 'adhkar') {
      return `Collection ${segment}`;
    } else if (parent === 'reciter') {
      return 'Reciter Details';
    } else if (parent === 'playlist') {
      return 'Playlist Details';
    }
    return segment;
  }

  // Handle known slug patterns
  const slugLabels: Record<string, string> = {
    'morning': 'Morning Adhkar',
    'evening': 'Evening Adhkar',
    'sleep': 'Sleep Adhkar',
    'travel': 'Travel Adhkar',
    'food': 'Food Adhkar',
  };

  if (slugLabels[segment]) {
    return slugLabels[segment];
  }

  // Fallback: capitalize and clean up the segment
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Hook for manually building breadcrumb items
 */
export function useBreadcrumb() {
  const pathname = usePathname();

  const addBreadcrumb = (label: string, href: string, icon?: React.ElementType): BreadcrumbItem => ({
    label,
    href,
    icon,
  });

  const generateFromPath = (): BreadcrumbItem[] => generateBreadcrumbs(pathname);

  return {
    addBreadcrumb,
    generateFromPath,
    currentPath: pathname,
  };
}