interface LoadingScreenProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'with-logo';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingScreen({
  message = 'Loading...',
  className = '',
  variant = 'default',
  size = 'md',
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const messageSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center space-x-3 ${className}`}>
        <div
          className={`${sizeClasses[size]} border-2 border-[color:var(--color-card-border)] border-t-[color:var(--color-label)] rounded-full animate-spin`}
        />
        <span className={`${messageSize[size]} text-[color:var(--color-label)]`}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === 'with-logo') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        {/* App Logo/Icon */}
        <div className="w-16 h-16 mb-6 rounded-xl bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] flex items-center justify-center animate-pulse-glow">
          <svg
            className="w-8 h-8 text-[color:var(--color-label)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-4">
          <div className="w-8 h-8 border-2 border-[color:var(--color-card-border)] border-t-[color:var(--color-label)] rounded-full animate-spin" />
        </div>

        {/* Message */}
        <p className="text-[color:var(--color-label)] font-medium mb-2">
          {message}
        </p>
        <p className="text-sm text-[color:var(--color-secondary)] text-center max-w-xs">
          Preparing your spiritual journey...
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <div className="text-center animate-fade-in">
        <div
          className={`${sizeClasses[size]} border-2 border-[color:var(--color-card-border)] border-t-[color:var(--color-label)] rounded-full animate-spin mx-auto mb-4`}
        />
        <p className={`${messageSize[size]} text-[color:var(--color-label)]`}>
          {message}
        </p>
      </div>
    </div>
  );
}

// Specialized loading screens for different contexts
export function PageLoadingScreen() {
  return (
    <LoadingScreen
      message="Loading content..."
      variant="with-logo"
      className="min-h-[calc(100vh-var(--topbar-height)-var(--playerbar-height))]"
    />
  );
}

export function SearchLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 mb-4 rounded-full bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] flex items-center justify-center animate-pulse-glow">
        <svg
          className="w-6 h-6 text-[color:var(--color-icon)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <LoadingScreen
        message="Searching..."
        variant="minimal"
        size="sm"
      />
    </div>
  );
}

export function AudioLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 mb-4 rounded-full bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] flex items-center justify-center animate-pulse-glow">
        <svg
          className="w-6 h-6 text-[color:var(--color-icon)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12 8-12 5z"
          />
        </svg>
      </div>
      <LoadingScreen
        message="Loading audio..."
        variant="minimal"
        size="sm"
      />
    </div>
  );
}

export function CollectionLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 mb-4 rounded-full bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] flex items-center justify-center animate-pulse-glow">
        <svg
          className="w-6 h-6 text-[color:var(--color-icon)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </div>
      <LoadingScreen
        message="Loading collection..."
        variant="minimal"
        size="sm"
      />
      <p className="text-xs text-[color:var(--color-hint)] mt-2 text-center max-w-xs">
        Preparing your bookmarks and playlists
      </p>
    </div>
  );
}