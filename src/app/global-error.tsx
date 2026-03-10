'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '@/lib/cn';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary - Catches unhandled errors and provides recovery options
 * Helps users navigate away from broken states back to working parts of the app
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry, LogRocket)
    console.error('Global error caught:', error);

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <html>
      <body className="font-[family-name:var(--font-manrope)] antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          {/* Error Visual */}
          <div className="mb-8 relative">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
              <AlertTriangle size={32} className="text-red-500" strokeWidth={1.5} />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-3 max-w-md">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Something went wrong
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-hint)' }}>
              An unexpected error occurred while loading this page.
              This has been automatically reported and we&apos;re working to fix it.
            </p>
          </div>

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-6">
            {/* Primary Action - Retry */}
            <button
              onClick={reset}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                'text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2',
                'bg-[var(--color-text)] text-[var(--color-background)]',
                'hover:opacity-90 active:scale-[0.98]',
                'focus-visible:ring-[var(--color-text)]'
              )}
              aria-label="Try loading the page again"
            >
              <RefreshCw size={16} strokeWidth={2} />
              <span>Try Again</span>
            </button>

            {/* Secondary Action - Home */}
            <Link
              href="/"
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                'text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)]',
                'border border-[var(--color-card-border)]',
                'text-[var(--color-label)] hover:bg-[var(--color-hover)]'
              )}
              aria-label="Return to home page"
            >
              <Home size={16} strokeWidth={2} />
              <span>Go Home</span>
            </Link>
          </div>

          {/* Safe Navigation Links */}
          <div className="mb-8 pt-6 border-t w-full max-w-sm" style={{ borderColor: 'var(--color-divider)' }}>
            <p className="text-xs mb-4" style={{ color: 'var(--color-hint)' }}>
              Or return to a safe section:
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
                href="/search"
                className="py-2 px-3 rounded-lg text-[var(--color-icon)] hover:text-[var(--color-label)] hover:bg-[var(--color-hover)] transition-colors"
              >
                Search
              </Link>
            </div>
          </div>

          {/* Development Error Details */}
          {isDevelopment && (
            <details className="mt-4 w-full max-w-2xl">
              <summary className={cn(
                'flex items-center gap-2 cursor-pointer text-xs',
                'text-[var(--color-hint)] hover:text-[var(--color-icon)]',
                'transition-colors duration-200 mb-4'
              )}>
                <Bug size={14} strokeWidth={2} />
                <span>Error Details (Development Only)</span>
              </summary>
              <div className="text-left p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-card-border)]">
                <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--color-label)' }}>
                  Error Message:
                </h3>
                <p className="font-mono text-xs mb-4 text-red-600 dark:text-red-400">
                  {error.message}
                </p>

                {error.digest && (
                  <>
                    <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--color-label)' }}>
                      Error ID:
                    </h3>
                    <p className="font-mono text-xs mb-4" style={{ color: 'var(--color-hint)' }}>
                      {error.digest}
                    </p>
                  </>
                )}

                <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--color-label)' }}>
                  Stack Trace:
                </h3>
                <pre className="text-xs overflow-auto max-h-40" style={{ color: 'var(--color-hint)' }}>
                  {error.stack}
                </pre>
              </div>
            </details>
          )}

          {/* Error ID for Support */}
          {!isDevelopment && error.digest && (
            <div className="mt-6 text-xs" style={{ color: 'var(--color-hint)' }}>
              Error ID: <span className="font-mono">{error.digest}</span>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}