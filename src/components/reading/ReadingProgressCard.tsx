"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { readingProgressService, type ReadingInsight } from "@/services/readingProgressService";
import { BookOpen, Clock, TrendingUp, Play, Target, Calendar } from "lucide-react";

interface ReadingProgressCardProps {
  className?: string;
  showInsights?: boolean;
  compact?: boolean;
}

/**
 * ReadingProgressCard - Displays user's reading progress and insights
 */
export function ReadingProgressCard({
  className,
  showInsights = true,
  compact = false,
}: ReadingProgressCardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<{
    today: { verses: number; time: number };
    thisWeek: { verses: number; time: number };
    thisMonth: { verses: number; time: number };
    allTime: any;
  } | null>(null);
  const [insights, setInsights] = useState<ReadingInsight[]>([]);
  const [progress, setProgress] = useState<{
    totalSurahsRead: number;
    currentStreak: number;
    totalReadingTime: number;
    averageReadingSpeed: number;
    weeklyGoal?: {
      completed: number;
      target: number;
    };
  } | null>(null);

  useEffect(() => {
    // Load reading statistics and insights
    const loadData = () => {
      const readingStats = readingProgressService.getReadingStats();
      const readingInsights = readingProgressService.getReadingInsights();
      const readingProgress = readingProgressService.getReadingProgress();

      setStats(readingStats);
      setInsights(readingInsights);
      setProgress(readingProgress);
    };

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number): string => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatReadingSpeed = (speed: number): string => {
    if (speed === 0) return "N/A";
    return `${speed.toFixed(1)} verses/min`;
  };

  if (!stats || !progress) return null;

  if (compact) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--color-secondary-bg)" }}
            >
              <BookOpen size={20} strokeWidth={2} className="text-[var(--color-icon)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-label)]">
                Today&apos;s Progress
              </p>
              <p className="text-xs text-[var(--color-hint)]">
                {stats.today.verses} verses • {formatTime(stats.today.time)}
              </p>
            </div>
          </div>
          {progress.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-medium">{progress.currentStreak}</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Progress Card */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Reading Progress
          </h3>
          <p className="text-sm text-[var(--color-hint)]">
            Track your Quran reading journey
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="h-12 w-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-blue-50">
              <BookOpen size={20} strokeWidth={2} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
              {progress.totalSurahsRead}
            </p>
            <p className="text-xs text-[var(--color-hint)]">Surahs Completed</p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-green-50">
              <TrendingUp size={20} strokeWidth={2} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
              {stats.today.verses}
            </p>
            <p className="text-xs text-[var(--color-hint)]">Verses Today</p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-purple-50">
              <Clock size={20} strokeWidth={2} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
              {formatTime(stats.today.time)}
            </p>
            <p className="text-xs text-[var(--color-hint)]">Time Today</p>
          </div>

          <div className="text-center">
            <div className="h-12 w-12 rounded-xl mx-auto mb-2 flex items-center justify-center bg-orange-50">
              <Calendar size={20} strokeWidth={2} className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)] mb-1">
              {progress.currentStreak}
            </p>
            <p className="text-xs text-[var(--color-hint)]">Day Streak</p>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        {progress.weeklyGoal && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "var(--color-card)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={16} strokeWidth={2} className="text-[var(--color-icon)]" />
                <span className="text-sm font-medium text-[var(--color-label)]">Weekly Goal</span>
              </div>
              <span className="text-xs text-[var(--color-hint)]">
                {progress.weeklyGoal.completed}/{progress.weeklyGoal.target} verses
              </span>
            </div>
            <div className="w-full bg-[var(--color-divider)] rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (progress.weeklyGoal.completed / progress.weeklyGoal.target) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--color-card)" }}>
            <span className="text-[var(--color-hint)]">This Week</span>
            <span className="font-medium text-[var(--color-label)]">
              {stats.thisWeek.verses} verses
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--color-card)" }}>
            <span className="text-[var(--color-hint)]">Reading Speed</span>
            <span className="font-medium text-[var(--color-label)]">
              {formatReadingSpeed(progress.averageReadingSpeed)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--color-card)" }}>
            <span className="text-[var(--color-hint)]">Total Time</span>
            <span className="font-medium text-[var(--color-label)]">
              {formatTime(progress.totalReadingTime)}
            </span>
          </div>
        </div>
      </Card>

      {/* Reading Insights */}
      {showInsights && insights.length > 0 && (
        <Card className="p-6">
          <h4 className="text-md font-semibold text-[var(--color-text)] mb-4">
            Reading Insights
          </h4>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--color-hover)]"
              >
                <span className="text-xl mt-0.5">{insight.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-label)] mb-1">
                    {insight.title}
                  </p>
                  <p className="text-xs text-[var(--color-hint)] mb-2">
                    {insight.description}
                  </p>
                  {insight.actionText && insight.actionHref && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(insight.actionHref!)}
                      className="h-6 px-2 text-xs"
                    >
                      {insight.actionText}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Continue Reading */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-[var(--color-text)] mb-1">
              Continue Reading
            </h4>
            <p className="text-xs text-[var(--color-hint)]">
              Start your reading session
            </p>
          </div>
          <Button
            onClick={() => router.push('/mushaf')}
            className="flex items-center gap-2"
          >
            <Play size={16} strokeWidth={2} />
            Start Reading
          </Button>
        </div>
      </Card>
    </div>
  );
}