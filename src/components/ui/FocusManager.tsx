'use client';

import { useEffect, useRef, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

interface FocusManagerContextType {
  setMainContentRef: (ref: HTMLElement | null) => void;
  focusMainContent: () => void;
  announceToScreenReader: (message: string) => void;
}

const FocusManagerContext = createContext<FocusManagerContextType | null>(null);

export function useFocusManager() {
  const context = useContext(FocusManagerContext);
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider');
  }
  return context;
}

interface FocusManagerProviderProps {
  children: React.ReactNode;
}

/**
 * FocusManagerProvider — manages focus and screen reader announcements
 */
export function FocusManagerProvider({ children }: FocusManagerProviderProps) {
  const mainContentRef = useRef<HTMLElement | null>(null);
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Focus main content on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  const setMainContentRef = (ref: HTMLElement | null) => {
    mainContentRef.current = ref;
  };

  const focusMainContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const announceToScreenReader = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return (
    <FocusManagerContext.Provider
      value={{
        setMainContentRef,
        focusMainContent,
        announceToScreenReader,
      }}
    >
      {children}

      {/* Screen reader announcement region */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-md"
        style={{
          backgroundColor: 'var(--color-text)',
          color: 'var(--color-background)',
        }}
        onFocus={(e) => {
          // Ensure skip link is visible when focused
          e.target.classList.remove('sr-only');
        }}
        onBlur={(e) => {
          e.target.classList.add('sr-only');
        }}
      >
        Skip to main content
      </a>
    </FocusManagerContext.Provider>
  );
}

/**
 * MainContent — wrapper that registers itself with focus manager
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { setMainContentRef } = useFocusManager();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMainContentRef(ref.current);

    return () => {
      setMainContentRef(null);
    };
  }, [setMainContentRef]);

  return (
    <div
      ref={ref}
      id="main-content"
      tabIndex={-1}
      className={className}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
}

/**
 * FocusTrap — traps focus within a component (for modals, dialogs)
 */
interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, active, onEscape }: FocusTrapProps) {
  const trapRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the currently focused element
    restoreFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the trap
    const focusableElements = trapRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key === 'Tab') {
        if (!focusableElements || focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus when trap is deactivated
      if (restoreFocusRef.current) {
        restoreFocusRef.current.focus();
      }
    };
  }, [active, onEscape]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div ref={trapRef} style={{ outline: 'none' }}>
      {children}
    </div>
  );
}