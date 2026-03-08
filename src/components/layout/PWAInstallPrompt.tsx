'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { usePWA } from './PWAProvider';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  // Check if user previously dismissed the prompt
  const [isDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const dismissedTime = localStorage.getItem('bayaan-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      return daysSinceDismissal < 7;
    }
    return false;
  });

  useEffect(() => {
    // Show prompt after a short delay if installable
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  const handleInstall = async () => {
    setIsVisible(false);
    await promptInstall();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    dismissInstall();
  };

  if (!isVisible || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-80">
      <div className="bg-[color:var(--color-background)] border border-[color:var(--color-card-border)] rounded-xl shadow-2xl p-4 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          {/* App Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-[color:var(--color-card)] rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[color:var(--color-label)]"
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

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[color:var(--color-label)] text-sm">
              Install Bayaan
            </h3>
            <p className="text-[color:var(--color-secondary)] text-xs mt-1 leading-relaxed">
              Get the app experience with offline access to your bookmarks and faster loading
            </p>

            <div className="flex items-center space-x-2 mt-3">
              <Button
                onClick={handleInstall}
                size="sm"
                className="text-xs px-3 py-1.5"
              >
                Install
              </Button>
              <button
                onClick={handleDismiss}
                className="text-[color:var(--color-secondary)] hover:text-[color:var(--color-label)] text-xs px-2 py-1.5 rounded-lg transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 text-[color:var(--color-secondary)] hover:text-[color:var(--color-label)] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}