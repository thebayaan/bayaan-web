/**
 * Reading Progress Service
 * Tracks user reading progress, manages reading sessions, and provides insights
 */

export interface ReadingSession {
  id: string;
  surahNumber: number;
  surahName: string;
  startVerse: number;
  currentVerse: number;
  totalVerses: number;
  startTime: number;
  lastUpdated: number;
  readingTimeMs: number;
  completed: boolean;
  verseInteractions: {
    verseNumber: number;
    timeSpent: number;
    timestamp: number;
  }[];
}

export interface ReadingProgress {
  totalSurahsRead: number;
  totalVersesRead: number;
  totalReadingTime: number; // in milliseconds
  averageReadingSpeed: number; // verses per minute
  longestSession: number; // in milliseconds
  currentStreak: number; // days
  lastReadDate: string;
  completedSurahs: number[];
  favoriteReadingTime: 'morning' | 'afternoon' | 'evening' | 'night';
  weeklyGoal?: {
    target: number; // verses per week
    completed: number;
    weekStart: string;
  };
}

export interface ReadingInsight {
  type: 'streak' | 'milestone' | 'goal' | 'recommendation';
  title: string;
  description: string;
  icon: string;
  actionText?: string;
  actionHref?: string;
}

class ReadingProgressService {
  private readonly STORAGE_KEY_SESSIONS = 'bayaan_reading_sessions';
  private readonly STORAGE_KEY_PROGRESS = 'bayaan_reading_progress';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private currentSession: ReadingSession | null = null;
  private sessionStartTime: number = 0;
  private verseStartTime: number = 0;

  /**
   * Start a new reading session
   */
  startReadingSession(surahNumber: number, surahName: string, totalVerses: number, startVerse = 1): ReadingSession {
    // End any existing session
    if (this.currentSession) {
      this.endCurrentSession();
    }

    const session: ReadingSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      surahNumber,
      surahName,
      startVerse,
      currentVerse: startVerse,
      totalVerses,
      startTime: Date.now(),
      lastUpdated: Date.now(),
      readingTimeMs: 0,
      completed: false,
      verseInteractions: [],
    };

    this.currentSession = session;
    this.sessionStartTime = Date.now();
    this.verseStartTime = Date.now();

    this.saveSession(session);
    return session;
  }

  /**
   * Update reading progress for current verse
   */
  updateVerseProgress(verseNumber: number): void {
    if (!this.currentSession) return;

    const now = Date.now();
    const timeSpentOnVerse = now - this.verseStartTime;

    // Record interaction for previous verse if different
    if (this.currentSession.currentVerse !== verseNumber && timeSpentOnVerse > 1000) {
      this.currentSession.verseInteractions.push({
        verseNumber: this.currentSession.currentVerse,
        timeSpent: timeSpentOnVerse,
        timestamp: now,
      });
    }

    // Update current verse
    this.currentSession.currentVerse = verseNumber;
    this.currentSession.lastUpdated = now;
    this.currentSession.readingTimeMs = now - this.currentSession.startTime;
    this.verseStartTime = now;

    // Check if surah is completed
    if (verseNumber >= this.currentSession.totalVerses) {
      this.currentSession.completed = true;
      this.endCurrentSession();
      return;
    }

    this.saveSession(this.currentSession);
  }

  /**
   * End current reading session
   */
  endCurrentSession(): void {
    if (!this.currentSession) return;

    // Record final verse interaction
    const now = Date.now();
    const timeSpentOnLastVerse = now - this.verseStartTime;
    if (timeSpentOnLastVerse > 1000) {
      this.currentSession.verseInteractions.push({
        verseNumber: this.currentSession.currentVerse,
        timeSpent: timeSpentOnLastVerse,
        timestamp: now,
      });
    }

    this.currentSession.readingTimeMs = now - this.currentSession.startTime;
    this.currentSession.lastUpdated = now;

    // Update global progress
    this.updateGlobalProgress(this.currentSession);

    // Save final session
    this.saveSession(this.currentSession);

    this.currentSession = null;
    this.sessionStartTime = 0;
    this.verseStartTime = 0;
  }

  /**
   * Get current active session
   */
  getCurrentSession(): ReadingSession | null {
    return this.currentSession;
  }

  /**
   * Resume a previous session
   */
  resumeSession(sessionId: string): ReadingSession | null {
    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.id === sessionId && !s.completed);

    if (session && this.isSessionValid(session)) {
      this.currentSession = session;
      this.sessionStartTime = Date.now();
      this.verseStartTime = Date.now();
      return session;
    }

    return null;
  }

  /**
   * Get reading progress for a specific surah
   */
  getSurahProgress(surahNumber: number): {
    lastReadVerse: number;
    progressPercentage: number;
    timeSpent: number;
    hasActiveSession: boolean;
    sessionId?: string;
  } {
    const sessions = this.getAllSessions().filter(s => s.surahNumber === surahNumber);

    if (sessions.length === 0) {
      return {
        lastReadVerse: 1,
        progressPercentage: 0,
        timeSpent: 0,
        hasActiveSession: false,
      };
    }

    // Get latest session for this surah
    const latestSession = sessions.reduce((latest, current) =>
      current.lastUpdated > latest.lastUpdated ? current : latest
    );

    const progressPercentage = Math.round((latestSession.currentVerse / latestSession.totalVerses) * 100);
    const totalTimeSpent = sessions.reduce((total, session) => total + session.readingTimeMs, 0);

    return {
      lastReadVerse: latestSession.currentVerse,
      progressPercentage,
      timeSpent: totalTimeSpent,
      hasActiveSession: !latestSession.completed && this.isSessionValid(latestSession),
      sessionId: latestSession.id,
    };
  }

  /**
   * Get overall reading progress
   */
  getReadingProgress(): ReadingProgress {
    const defaultProgress: ReadingProgress = {
      totalSurahsRead: 0,
      totalVersesRead: 0,
      totalReadingTime: 0,
      averageReadingSpeed: 0,
      longestSession: 0,
      currentStreak: 0,
      lastReadDate: '',
      completedSurahs: [],
      favoriteReadingTime: 'evening',
    };

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PROGRESS);
      if (!stored) return defaultProgress;

      return { ...defaultProgress, ...JSON.parse(stored) };
    } catch {
      return defaultProgress;
    }
  }

  /**
   * Get reading insights and recommendations
   */
  getReadingInsights(): ReadingInsight[] {
    const progress = this.getReadingProgress();
    const insights: ReadingInsight[] = [];

    // Current streak insight
    if (progress.currentStreak > 0) {
      insights.push({
        type: 'streak',
        title: `${progress.currentStreak} Day Reading Streak!`,
        description: `You've been reading consistently for ${progress.currentStreak} days. Keep it up!`,
        icon: '🔥',
      });
    }

    // Milestone insights
    if (progress.totalSurahsRead > 0 && progress.totalSurahsRead % 5 === 0) {
      insights.push({
        type: 'milestone',
        title: `${progress.totalSurahsRead} Surahs Completed`,
        description: 'Amazing dedication to your Quran reading journey!',
        icon: '🏆',
      });
    }

    // Weekly goal insight
    if (progress.weeklyGoal) {
      const goalProgress = Math.round((progress.weeklyGoal.completed / progress.weeklyGoal.target) * 100);
      insights.push({
        type: 'goal',
        title: `Weekly Goal: ${goalProgress}%`,
        description: `${progress.weeklyGoal.completed}/${progress.weeklyGoal.target} verses completed this week`,
        icon: goalProgress >= 100 ? '✅' : '🎯',
      });
    }

    // Reading recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour <= 11) {
      insights.push({
        type: 'recommendation',
        title: 'Morning Reading',
        description: 'Start your day with morning Quran recitation',
        icon: '🌅',
        actionText: 'Browse Surahs',
        actionHref: '/mushaf',
      });
    }

    return insights;
  }

  /**
   * Set weekly reading goal
   */
  setWeeklyGoal(versesPerWeek: number): void {
    const progress = this.getReadingProgress();
    const weekStart = this.getWeekStart().toISOString().split('T')[0];

    progress.weeklyGoal = {
      target: versesPerWeek,
      completed: 0,
      weekStart,
    };

    this.saveProgress(progress);
  }

  /**
   * Get reading statistics for dashboard
   */
  getReadingStats(): {
    today: { verses: number; time: number };
    thisWeek: { verses: number; time: number };
    thisMonth: { verses: number; time: number };
    allTime: ReadingProgress;
  } {
    const sessions = this.getAllSessions();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = this.getWeekStart();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySessions = sessions.filter(s => new Date(s.startTime) >= today);
    const weekSessions = sessions.filter(s => new Date(s.startTime) >= weekStart);
    const monthSessions = sessions.filter(s => new Date(s.startTime) >= monthStart);

    return {
      today: {
        verses: this.calculateVersesRead(todaySessions),
        time: this.calculateTotalTime(todaySessions),
      },
      thisWeek: {
        verses: this.calculateVersesRead(weekSessions),
        time: this.calculateTotalTime(weekSessions),
      },
      thisMonth: {
        verses: this.calculateVersesRead(monthSessions),
        time: this.calculateTotalTime(monthSessions),
      },
      allTime: this.getReadingProgress(),
    };
  }

  private updateGlobalProgress(session: ReadingSession): void {
    const progress = this.getReadingProgress();

    // Update completed surahs
    if (session.completed && !progress.completedSurahs.includes(session.surahNumber)) {
      progress.completedSurahs.push(session.surahNumber);
      progress.totalSurahsRead++;
    }

    // Calculate verses read in this session
    const versesRead = Math.max(0, session.currentVerse - session.startVerse + 1);
    progress.totalVersesRead += versesRead;
    progress.totalReadingTime += session.readingTimeMs;

    // Update longest session
    if (session.readingTimeMs > progress.longestSession) {
      progress.longestSession = session.readingTimeMs;
    }

    // Update reading speed
    if (session.readingTimeMs > 0) {
      const minutes = session.readingTimeMs / (1000 * 60);
      const speed = versesRead / minutes;
      progress.averageReadingSpeed = progress.averageReadingSpeed === 0
        ? speed
        : (progress.averageReadingSpeed + speed) / 2;
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastRead = new Date(progress.lastReadDate);
    const todayDate = new Date(today);

    if (progress.lastReadDate !== today) {
      const daysDiff = Math.floor((todayDate.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        progress.currentStreak++;
      } else if (daysDiff > 1) {
        progress.currentStreak = 1;
      }

      progress.lastReadDate = today;
    }

    // Update weekly goal progress
    if (progress.weeklyGoal) {
      const weekStart = this.getWeekStart().toISOString().split('T')[0];
      if (progress.weeklyGoal.weekStart === weekStart) {
        progress.weeklyGoal.completed += versesRead;
      } else {
        // New week, reset goal
        progress.weeklyGoal = {
          target: progress.weeklyGoal.target,
          completed: versesRead,
          weekStart,
        };
      }
    }

    this.saveProgress(progress);
  }

  private saveSession(session: ReadingSession): void {
    if (typeof window === 'undefined') return;

    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      // Keep only recent sessions (last 100)
      const recentSessions = sessions
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .slice(0, 100);

      localStorage.setItem(this.STORAGE_KEY_SESSIONS, JSON.stringify(recentSessions));
    } catch (error) {
      console.warn('Failed to save reading session:', error);
    }
  }

  private saveProgress(progress: ReadingProgress): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save reading progress:', error);
    }
  }

  private getAllSessions(): ReadingSession[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private isSessionValid(session: ReadingSession): boolean {
    const now = Date.now();
    return (now - session.lastUpdated) < this.SESSION_TIMEOUT;
  }

  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private calculateVersesRead(sessions: ReadingSession[]): number {
    return sessions.reduce((total, session) => {
      return total + Math.max(0, session.currentVerse - session.startVerse + 1);
    }, 0);
  }

  private calculateTotalTime(sessions: ReadingSession[]): number {
    return sessions.reduce((total, session) => total + session.readingTimeMs, 0);
  }
}

export const readingProgressService = new ReadingProgressService();