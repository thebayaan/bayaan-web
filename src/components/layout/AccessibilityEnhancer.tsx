'use client';

import { useEffect, useState } from 'react';

/**
 * AccessibilityEnhancer - Provides visual focus indicators and skip links
 */
// Helper function for screen reader announcements
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export function AccessibilityEnhancer() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    // Detect if user is navigating with keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key.startsWith('Arrow')) {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    // Track focus changes
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        // Announce focus changes for screen readers
        if (target.getAttribute('aria-label')) {
          announceToScreenReader(target.getAttribute('aria-label')!);
        }
      }
    };

    const handleFocusOut = () => {
      // Focus out handling if needed
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <>
      {/* Enhanced Focus Styles */}
      <style jsx global>{`
        /* Enhanced focus indicators when keyboard navigation is detected */
        body.keyboard-user *:focus {
          outline: 2px solid var(--color-text) !important;
          outline-offset: 2px !important;
          border-radius: 4px;
        }

        body.keyboard-user *:focus-visible {
          outline: 2px solid var(--color-text) !important;
          outline-offset: 2px !important;
          border-radius: 4px;
          box-shadow: 0 0 0 4px rgb(var(--text) / 0.1) !important;
        }

        /* Skip link styles */
        .skip-link {
          position: fixed;
          top: -100px;
          left: 1rem;
          z-index: 1000;
          background: var(--color-text);
          color: var(--color-background);
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .skip-link:focus {
          top: 1rem;
        }

        /* Improve button focus indicators */
        button:focus-visible,
        [role="button"]:focus-visible {
          outline: 2px solid var(--color-text);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Improve link focus indicators */
        a:focus-visible {
          outline: 2px solid var(--color-text);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          * {
            border-color: ButtonText !important;
          }

          button, [role="button"] {
            border: 2px solid ButtonText !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          ::before,
          ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Add keyboard-user class to body */}
      {typeof window !== 'undefined' && (
        <>
          {isKeyboardUser
            ? document.body.classList.add('keyboard-user')
            : document.body.classList.remove('keyboard-user')
          }
        </>
      )}

      {/* Skip Links */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
        <a href="#player" className="skip-link">
          Skip to player
        </a>
      </div>

      {/* Screen Reader Announcements for App State */}
      <div id="announcements" className="sr-only" aria-live="polite" aria-atomic="true">
        {/* Dynamic announcements will be added here */}
      </div>

      {/* Landmark Regions for Screen Readers */}
      <style jsx global>{`
        /* Ensure proper landmark roles are announced */
        main[role="main"]::before {
          content: "Main content";
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        nav[role="navigation"]::before {
          content: "Navigation";
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useScreenReaderAnnouncements() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcements = document.getElementById('announcements');
    if (announcements) {
      announcements.setAttribute('aria-live', priority);
      announcements.textContent = message;

      // Clear after a short delay
      setTimeout(() => {
        announcements.textContent = '';
      }, 1500);
    }
  };

  return { announce };
}

/**
 * Hook for enhanced keyboard navigation
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enhanced keyboard shortcuts for screen reader users
      if (e.altKey) {
        switch (e.key) {
          case 'h':
            // Jump to main heading
            e.preventDefault();
            const mainHeading = document.querySelector('h1, h2, h3, h4, h5, h6') as HTMLElement;
            mainHeading?.focus();
            break;
          case 'm':
            // Jump to main content
            e.preventDefault();
            const main = document.getElementById('main-content') as HTMLElement;
            main?.focus();
            break;
          case 'n':
            // Jump to navigation
            e.preventDefault();
            const nav = document.querySelector('nav') as HTMLElement;
            nav?.focus();
            break;
          case 'p':
            // Jump to player
            e.preventDefault();
            const player = document.querySelector('[aria-label="Audio player"]') as HTMLElement;
            player?.focus();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}