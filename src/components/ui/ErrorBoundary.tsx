'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with services like Sentry here
      console.error('Production error:', error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onRefresh={this.handleRefresh}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
  onRefresh: () => void;
  showDetails?: boolean;
}

function ErrorFallback({
  error,
  onRetry,
  onRefresh,
  showDetails = false,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="max-w-md text-center space-y-6">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[color:var(--color-label)]">
            Something went wrong
          </h2>
          <p className="text-[color:var(--color-secondary)] text-sm leading-relaxed">
            We&rsquo;re sorry, but an unexpected error occurred. Please try again or refresh the page.
          </p>
        </div>

        {/* Error Details (Development) */}
        {showDetails && error && (
          <details className="text-left bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-[color:var(--color-label)] mb-2">
              Error Details
            </summary>
            <div className="text-xs font-mono text-[color:var(--color-secondary)] space-y-2">
              <div>
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1 overflow-x-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} size="sm">
            Try Again
          </Button>
          <Button onClick={onRefresh} variant="secondary" size="sm">
            Refresh Page
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-[color:var(--color-hint)]">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({
  children,
  componentName,
}: {
  children: ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] rounded-lg p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-[color:var(--color-label)] font-medium">
            {componentName ? `${componentName} Error` : 'Component Error'}
          </p>
          <p className="text-xs text-[color:var(--color-secondary)] mt-1">
            This component failed to load
          </p>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`${componentName || 'Component'} error:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}