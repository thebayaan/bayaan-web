'use client';

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { User, Mic, Play } from "lucide-react";
import type { Reciter } from "@/types/reciter";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ensureTrackFields } from "@/types/audio";

interface ReciterCardProps {
  reciter: Reciter;
}

export function ReciterCard({ reciter }: ReciterCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loadTrack, getCurrentTrack } = usePlayerStore();

  const currentTrack = getCurrentTrack();
  const isPlaying = currentTrack?.reciterId === reciter.id;

  // Get the first complete rewayat for quick play
  const playableRewayat = reciter.rewayat.find(r => r.surah_total > 0);

  const handleQuickPlay = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to reciter detail page

    if (!playableRewayat) return;

    try {
      setIsLoading(true);

      // Create a track for Al-Fatiha (Surah 1) as default
      const track = ensureTrackFields({
        id: `${reciter.id}-${playableRewayat.id}-1`,
        url: `${playableRewayat.server}001.mp3`,
        title: "Al-Fatiha",
        artist: reciter.name,
        reciterId: reciter.id,
        reciterName: reciter.name,
        surahId: "1",
        rewayatId: playableRewayat.id,
      });

      await loadTrack(track);
    } catch (error) {
      console.error("Failed to load track:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <Link
        href={`/reciter/${reciter.id}`}
        className="block p-4"
      >
        {/* Header with avatar and quick play */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="h-12 w-12 rounded-xl shrink-0 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-card)" }}
          >
            <User
              size={20}
              style={{ color: "var(--color-icon)" }}
              strokeWidth={1.5}
            />
          </div>

          {/* Quick play button */}
          {playableRewayat && (
            <button
              onClick={handleQuickPlay}
              disabled={isLoading}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                "transition-all duration-200 opacity-0 group-hover:opacity-100",
                "hover:bg-[var(--color-hover)] active:scale-95",
                isPlaying && "opacity-100"
              )}
              style={{
                backgroundColor: isPlaying ? "var(--color-text)" : "var(--color-card)",
                color: isPlaying ? "var(--color-background)" : "var(--color-icon)",
              }}
              aria-label={`Play ${reciter.name}`}
            >
              {isLoading ? (
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
              ) : (
                <Play
                  size={14}
                  strokeWidth={2}
                  className={cn(
                    "transition-transform",
                    !isPlaying && "translate-x-0.5"
                  )}
                />
              )}
            </button>
          )}
        </div>

        {/* Reciter name */}
        <h3
          className="font-semibold text-sm mb-2 line-clamp-2 leading-relaxed"
          style={{ color: "var(--color-label)" }}
        >
          {reciter.name}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Mic
              size={12}
              style={{ color: "var(--color-icon)" }}
              strokeWidth={1.5}
            />
            <span style={{ color: "var(--color-hint)" }}>
              {reciter.rewayat.length} rewayat
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: "var(--color-icon)" }}
            />
            <span style={{ color: "var(--color-hint)" }}>
              {reciter.rewayat.reduce((total, r) => total + r.surah_total, 0)} surahs
            </span>
          </div>
        </div>

        {/* Rewayat preview */}
        {reciter.rewayat.length > 0 && (
          <div className="mt-2">
            <span
              className="text-xs"
              style={{ color: "var(--color-hint)" }}
            >
              {reciter.rewayat[0].name}
              {reciter.rewayat.length > 1 && ` +${reciter.rewayat.length - 1} more`}
            </span>
          </div>
        )}
      </Link>
    </Card>
  );
}