'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto text-center space-y-8">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-[color:var(--color-card)] flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[color:var(--color-icon)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            />
          </svg>
        </div>

        <div className="space-y-4">
          <SectionHeader>You&rsquo;re Offline</SectionHeader>

          <p className="text-[color:var(--color-label)] leading-relaxed">
            It looks like you&rsquo;ve lost your internet connection. Don&rsquo;t worry - you can still:
          </p>

          <div className="bg-[color:var(--color-card)] border border-[color:var(--color-card-border)] rounded-xl p-6 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[color:var(--color-label)]">View cached Quran pages</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[color:var(--color-label)]">Access your bookmarked verses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[color:var(--color-label)]">Read saved adhkar collections</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-[color:var(--color-secondary)]">Audio playback requires connection</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Try Again
          </Button>

          <Button
            onClick={() => window.history.back()}
            variant="secondary"
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-[color:var(--color-hint)]">
            Once your connection is restored, all features will be available again.
          </p>
        </div>
      </div>
    </main>
  );
}