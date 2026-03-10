'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md mx-auto">
        {/* Error Icon */}
        <div
          className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <AlertTriangle
            size={32}
            style={{ color: 'var(--color-icon)' }}
            strokeWidth={1.5}
          />
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            Something went wrong
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-hint)' }}
          >
            We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            You can try refreshing the page or return to the home page.
          </p>
        </div>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary
              className="text-xs font-medium cursor-pointer mb-2"
              style={{ color: 'var(--color-icon)' }}
            >
              Error Details
            </summary>
            <pre
              className="text-xs p-3 rounded-lg overflow-auto max-h-32"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-hint)',
                border: '1px solid var(--color-card-border)'
              }}
            >
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} strokeWidth={1.8} />
            Try again
          </Button>

          <Link href="/">
            <Button
              variant="secondary"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Home size={16} strokeWidth={1.8} />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}