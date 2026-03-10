"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { readingProgressService, type ReadingSession } from "@/services/readingProgressService";
import {
  Play,
  Square,
  BookOpen,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from "lucide-react";

interface ReadingSessionManagerProps {
  surahNumber: number;
  surahName: string;
  totalVerses: number;
  currentVerse?: number;
  onVerseChange?: (verse: number) => void;
  className?: string;
}

/**
 * ReadingSessionManager - Manages reading sessions and tracks progress
 */
export function ReadingSessionManager({
  surahNumber,
  surahName,
  totalVerses,
  currentVerse = 1,
  onVerseChange,
  className,
}: ReadingSessionManagerProps) {
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [previousProgress, setPreviousProgress] = useState<{
    lastReadVerse: number;
    progressPercentage: number;
    timeSpent: number;
    hasActiveSession: boolean;
    sessionId?: string;
  } | null>(null);
  const [showResumeOption, setShowResumeOption] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Check for existing progress when component mounts
    const progress = readingProgressService.getSurahProgress(surahNumber);
    setPreviousProgress(progress);

    // Show resume option if there's previous progress and we're not at the start
    if (progress.hasActiveSession && progress.lastReadVerse > 1) {
      setShowResumeOption(true);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [surahNumber]);

  useEffect(() => {
    // Update verse progress when currentVerse changes
    if (session && currentVerse !== session.currentVerse) {
      readingProgressService.updateVerseProgress(currentVerse);
      setSession(prev => prev ? { ...prev, currentVerse } : null);
    }
  }, [currentVerse, session]);

  const startSession = () => {
    const newSession = readingProgressService.startReadingSession(
      surahNumber,
      surahName,
      totalVerses,
      currentVerse
    );
    setSession(newSession);
    setShowResumeOption(false);
    startTimer();
  };

  const resumeSession = () => {
    if (previousProgress?.sessionId) {
      const resumedSession = readingProgressService.resumeSession(previousProgress.sessionId);
      if (resumedSession) {
        setSession(resumedSession);
        if (onVerseChange) {
          onVerseChange(resumedSession.currentVerse);
        }
        startTimer();
      }
    }
    setShowResumeOption(false);
  };

  const endSession = () => {
    readingProgressService.endCurrentSession();
    setSession(null);
    setSessionTime(0);
    stopTimer();
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!session) return 0;
    return Math.round((currentVerse / totalVerses) * 100);
  };

  const getVersesRemaining = (): number => {
    return totalVerses - currentVerse;
  };

  const getEstimatedTimeRemaining = (): string => {
    if (!session || sessionTime === 0) return "Calculating...";

    const versesRead = currentVerse - session.startVerse + 1;
    const timePerVerse = sessionTime / versesRead;
    const remainingSeconds = Math.round(getVersesRemaining() * timePerVerse);

    if (remainingSeconds < 60) return `${remainingSeconds}s remaining`;
    const remainingMinutes = Math.round(remainingSeconds / 60);
    return `${remainingMinutes}m remaining`;
  };

  // Resume option banner
  if (showResumeOption) {
    return (
      <Card className={cn("p-4 border-blue-200 bg-blue-50", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen size={20} strokeWidth={2} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Continue Reading
              </p>
              <p className="text-xs text-blue-700">
                Resume from verse {previousProgress?.lastReadVerse} • {previousProgress?.progressPercentage}% complete
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowResumeOption(false)}>
              Start Over
            </Button>
            <Button size="sm" onClick={resumeSession}>
              Resume
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden transition-all duration-300", className)}>
      {/* Collapsed View */}
      {!isExpanded && (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                session ? "bg-green-100" : "bg-gray-100"
              )}>
                {session ? (
                  <Play size={20} strokeWidth={2} className="text-green-600" />
                ) : (
                  <BookOpen size={20} strokeWidth={2} className="text-gray-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-label)]">
                  {session ? "Reading Session Active" : "Start Reading Session"}
                </p>
                <p className="text-xs text-[var(--color-hint)]">
                  {session
                    ? `${formatTime(sessionTime)} • Verse ${currentVerse}/${totalVerses}`
                    : "Track your progress and reading time"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!session && (
                <Button size="sm" onClick={startSession}>
                  Start
                </Button>
              )}
              <IconButton
                label={isExpanded ? "Collapse" : "Expand"}
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown size={16} strokeWidth={2} />
              </IconButton>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-semibold text-[var(--color-text)]">
                Reading Session
              </h4>
              <p className="text-xs text-[var(--color-hint)]">
                {surahName} • {totalVerses} verses
              </p>
            </div>
            <IconButton
              label="Collapse"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp size={16} strokeWidth={2} />
            </IconButton>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-hint)]">Progress</span>
              <span className="text-[var(--color-label)]">
                {getProgressPercentage()}% • Verse {currentVerse}/{totalVerses}
              </span>
            </div>
            <div className="w-full bg-[var(--color-divider)] rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Session Stats */}
          {session && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock size={12} strokeWidth={2} className="text-[var(--color-icon)]" />
                </div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {formatTime(sessionTime)}
                </p>
                <p className="text-xs text-[var(--color-hint)]">Session Time</p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target size={12} strokeWidth={2} className="text-[var(--color-icon)]" />
                </div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {getVersesRemaining()}
                </p>
                <p className="text-xs text-[var(--color-hint)]">Verses Left</p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={12} strokeWidth={2} className="text-[var(--color-icon)]" />
                </div>
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {Math.round((currentVerse - session.startVerse + 1) / Math.max(1, sessionTime / 60) * 10) / 10}
                </p>
                <p className="text-xs text-[var(--color-hint)]">Verses/min</p>
              </div>
            </div>
          )}

          {/* Estimated Time */}
          {session && sessionTime > 30 && (
            <div className="text-center p-3 rounded-lg bg-[var(--color-card)]">
              <p className="text-xs text-[var(--color-hint)] mb-1">Estimated completion</p>
              <p className="text-sm font-medium text-[var(--color-label)]">
                {getEstimatedTimeRemaining()}
              </p>
            </div>
          )}

          {/* Session Controls */}
          <div className="flex gap-2">
            {!session ? (
              <Button onClick={startSession} className="flex-1">
                <Play size={16} strokeWidth={2} className="mr-2" />
                Start Reading Session
              </Button>
            ) : (
              <Button onClick={endSession} variant="secondary" className="flex-1">
                <Square size={16} strokeWidth={2} className="mr-2" />
                End Session
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}