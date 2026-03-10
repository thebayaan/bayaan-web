'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { X, ChevronDown, HelpCircle, Lightbulb, Info } from 'lucide-react';
import { Card } from './Card';

interface Tip {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'info' | 'help';
  page?: string;
  element?: string;
  priority: number;
}

interface ContextualHelpProps {
  tips: Tip[];
  page: string;
  className?: string;
}

/**
 * ContextualHelp — displays helpful tips and information contextually
 */
export function ContextualHelp({ tips, page, className }: ContextualHelpProps) {
  const [activeTip, setActiveTip] = useState<Tip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [showTipsList, setShowTipsList] = useState(false);

  // Load dismissed tips from localStorage
  useEffect(() => {
    const loadDismissedTips = () => {
      const saved = localStorage.getItem('bayaan-dismissed-tips');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDismissedTips(parsed);
        } catch {
          setDismissedTips([]);
        }
      }
    };

    // Use setTimeout to avoid setState during render
    const timer = setTimeout(loadDismissedTips, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save dismissed tips to localStorage
  const saveDismissedTips = (tips: string[]) => {
    localStorage.setItem('bayaan-dismissed-tips', JSON.stringify(tips));
    setDismissedTips(tips);
  };

  // Filter tips for current page
  const pageTips = tips
    .filter(tip => !tip.page || tip.page === page)
    .filter(tip => !dismissedTips.includes(tip.id))
    .sort((a, b) => b.priority - a.priority);

  // Auto-show first tip if available
  useEffect(() => {
    if (pageTips.length > 0 && !activeTip) {
      const timer = setTimeout(() => {
        setActiveTip(pageTips[0]);
      }, 1000); // Show after 1 second

      return () => clearTimeout(timer);
    }
  }, [pageTips, activeTip]);

  const dismissTip = (tipId: string) => {
    const newDismissedTips = [...dismissedTips, tipId];
    saveDismissedTips(newDismissedTips);
    setActiveTip(null);
  };

  const getIcon = (type: Tip['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb size={16} />;
      case 'help':
        return <HelpCircle size={16} />;
      case 'info':
        return <Info size={16} />;
    }
  };

  const getIconColor = (type: Tip['type']) => {
    switch (type) {
      case 'tip':
        return 'text-amber-500';
      case 'help':
        return 'text-blue-500';
      case 'info':
        return 'text-gray-500';
    }
  };

  if (pageTips.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Active tip popup */}
      {activeTip && (
        <div className="fixed bottom-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="p-4 shadow-lg border-l-4 animate-in slide-in-from-bottom-4 fade-in duration-300"
            style={{
              borderLeftColor: activeTip.type === 'tip' ? '#f59e0b' : activeTip.type === 'help' ? '#3b82f6' : '#6b7280'
            }}
          >
            <div className="flex items-start gap-3">
              <div className={cn("flex-shrink-0 mt-0.5", getIconColor(activeTip.type))}>
                {getIcon(activeTip.type)}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {activeTip.title}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-label)' }}
                >
                  {activeTip.content}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => setShowTipsList(!showTipsList)}
                    className={cn(
                      "text-xs px-2 py-1 rounded transition-colors",
                      "hover:bg-[var(--color-hover)]"
                    )}
                    style={{ color: 'var(--color-hint)' }}
                  >
                    {pageTips.length} tip{pageTips.length !== 1 ? 's' : ''} available
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTip(null)}
                      className={cn(
                        "text-xs px-3 py-1 rounded transition-colors",
                        "hover:bg-[var(--color-hover)]"
                      )}
                      style={{ color: 'var(--color-hint)' }}
                    >
                      Later
                    </button>
                    <button
                      onClick={() => dismissTip(activeTip.id)}
                      className={cn(
                        "text-xs px-3 py-1 rounded transition-colors",
                        "hover:bg-[var(--color-hover)]"
                      )}
                      style={{ color: 'var(--color-hint)' }}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTip(null)}
                className="flex-shrink-0 p-1 rounded hover:bg-[var(--color-hover)] transition-colors"
                aria-label="Close tip"
              >
                <X size={14} style={{ color: 'var(--color-icon)' }} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Tips list dropdown */}
      {showTipsList && (
        <div className="fixed bottom-32 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="p-2 shadow-lg max-h-64 overflow-y-auto animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: 'var(--color-divider)' }}>
              <h5
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Available Tips
              </h5>
              <button
                onClick={() => setShowTipsList(false)}
                className="p-1 rounded hover:bg-[var(--color-hover)]"
              >
                <ChevronDown size={14} style={{ color: 'var(--color-icon)' }} />
              </button>
            </div>

            <div className="space-y-1 p-1">
              {pageTips.map((tip) => (
                <button
                  key={tip.id}
                  onClick={() => {
                    setActiveTip(tip);
                    setShowTipsList(false);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-md transition-colors",
                    "hover:bg-[var(--color-hover)]",
                    activeTip?.id === tip.id && "bg-[var(--color-card)]"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn("flex-shrink-0 mt-0.5", getIconColor(tip.type))}>
                      {getIcon(tip.type)}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {tip.title}
                      </div>
                      <div
                        className="text-xs mt-1 line-clamp-2"
                        style={{ color: 'var(--color-hint)' }}
                      >
                        {tip.content}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Help trigger button (when no active tip) */}
      {!activeTip && pageTips.length > 0 && (
        <button
          onClick={() => setActiveTip(pageTips[0])}
          className={cn(
            "fixed bottom-6 right-6 z-30",
            "h-12 w-12 rounded-full shadow-lg",
            "flex items-center justify-center",
            "transition-all duration-300 ease-out",
            "hover:scale-110 active:scale-95",
            "animate-in fade-in slide-in-from-bottom-8 duration-500"
          )}
          style={{
            backgroundColor: 'var(--color-text)',
            color: 'var(--color-background)',
          }}
          aria-label="Show helpful tips"
        >
          <Lightbulb size={20} />

          {/* Notification badge */}
          <div
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: '#f59e0b', color: 'white' }}
          >
            <span className="text-xs font-bold">{pageTips.length}</span>
          </div>
        </button>
      )}
    </div>
  );
}

/**
 * Hook to provide contextual tips
 */
export function useContextualTips() {
  const tips: Tip[] = [
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      content: 'Press Cmd/Ctrl + ? to see all available keyboard shortcuts for faster navigation.',
      type: 'tip',
      page: '',
      priority: 10,
    },
    {
      id: 'player-sheet',
      title: 'Full Player View',
      content: 'Click on the currently playing track in the player bar to open the full player with advanced controls.',
      type: 'help',
      page: '',
      priority: 8,
    },
    {
      id: 'search-tips',
      title: 'Advanced Search',
      content: 'Search across Quran verses, surahs, reciters, and adhkar. Use / key for quick search.',
      type: 'tip',
      page: 'search',
      priority: 9,
    },
    {
      id: 'collection-bookmarks',
      title: 'Save Your Favorites',
      content: 'Create bookmarks and playlists to organize your favorite verses and reciters.',
      type: 'info',
      page: 'collection',
      priority: 7,
    },
    {
      id: 'adhkar-copy',
      title: 'Copy Adhkar',
      content: 'Click any adhkar to copy its text to your clipboard for easy sharing.',
      type: 'tip',
      page: 'adhkar',
      priority: 6,
    },
    {
      id: 'mushaf-navigation',
      title: 'Verse Navigation',
      content: 'Click on any verse number to access sharing, bookmarking, and tafseer options.',
      type: 'help',
      page: 'mushaf',
      priority: 8,
    },
  ];

  return { tips };
}