'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePerformanceMonitor, checkPerformanceBudget } from '@/hooks/usePerformanceMonitor';

interface PerformanceContextType {
  metrics: any;
  isLoading: boolean;
  performanceScore: 'good' | 'needs improvement' | 'poor' | 'unknown';
  recommendations: string[];
  logMetric: (name: string, value: number) => void;
  showPerformanceReport: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableDevMode?: boolean;
}

/**
 * PerformanceProvider - Global performance monitoring and optimization
 */
export function PerformanceProvider({
  children,
  enableDevMode = process.env.NODE_ENV === 'development'
}: PerformanceProviderProps) {
  const { metrics, isLoading, logMetric, getMetricsSummary } = usePerformanceMonitor();
  const [performanceScore, setPerformanceScore] = useState<'good' | 'needs improvement' | 'poor' | 'unknown'>('unknown');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Update performance score and recommendations
  useEffect(() => {
    if (Object.keys(metrics).length === 0) return;

    const budget = checkPerformanceBudget(metrics);
    const scores = Object.values(budget);

    // Calculate overall score
    const goodCount = scores.filter(s => s === 'good').length;
    const poorCount = scores.filter(s => s === 'poor').length;
    const validScores = scores.filter(s => s !== 'unknown').length;

    if (validScores === 0) {
      setPerformanceScore('unknown');
    } else if (poorCount > 0) {
      setPerformanceScore('poor');
    } else if (goodCount >= validScores * 0.8) {
      setPerformanceScore('good');
    } else {
      setPerformanceScore('needs improvement');
    }

    // Generate recommendations
    const newRecommendations: string[] = [];

    if (budget.lcp === 'poor') {
      newRecommendations.push('Optimize Largest Contentful Paint by reducing image sizes and improving server response time');
    }

    if (budget.fid === 'poor') {
      newRecommendations.push('Improve First Input Delay by reducing JavaScript execution time and breaking up long tasks');
    }

    if (budget.cls === 'poor') {
      newRecommendations.push('Reduce Cumulative Layout Shift by adding size attributes to images and avoiding content injection');
    }

    if (budget.fcp === 'poor') {
      newRecommendations.push('Improve First Contentful Paint by optimizing critical resource loading and reducing render-blocking resources');
    }

    if (budget.ttfb === 'poor') {
      newRecommendations.push('Reduce Time to First Byte by optimizing server response time and using a CDN');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      newRecommendations.push('High memory usage detected. Consider implementing component memoization and cleanup');
    }

    setRecommendations(newRecommendations);
  }, [metrics]);

  // Performance report for developers
  const showPerformanceReport = () => {
    if (!enableDevMode) return;

    console.group('📊 Bayaan Performance Report');
    console.log('Summary:', getMetricsSummary());
    console.log('Score:', performanceScore);
    console.log('Raw metrics:', metrics);

    if (recommendations.length > 0) {
      console.group('💡 Recommendations');
      recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  };

  // Log performance report in dev mode
  useEffect(() => {
    if (enableDevMode && !isLoading && Object.keys(metrics).length > 0) {
      // Log report after initial metrics are collected
      const timer = setTimeout(() => {
        showPerformanceReport();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, metrics, enableDevMode]);

  // Performance warning for poor scores
  useEffect(() => {
    if (performanceScore === 'poor' && enableDevMode) {
      console.warn('⚠️ Poor performance detected! Check the performance report for recommendations.');
    }
  }, [performanceScore, enableDevMode]);

  const contextValue: PerformanceContextType = {
    metrics,
    isLoading,
    performanceScore,
    recommendations,
    logMetric,
    showPerformanceReport,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
      {enableDevMode && <PerformanceDevTools />}
    </PerformanceContext.Provider>
  );
}

/**
 * Hook to access performance context
 */
export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

/**
 * Development tools for performance monitoring
 */
function PerformanceDevTools() {
  const { performanceScore, showPerformanceReport } = usePerformance();
  const [isVisible, setIsVisible] = useState(false);

  // Keyboard shortcut to show/hide performance info
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P to toggle performance info
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!isVisible) {
          showPerformanceReport();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, showPerformanceReport]);

  if (!isVisible) return null;

  const getScoreColor = () => {
    switch (performanceScore) {
      case 'good':
        return '#22c55e'; // green
      case 'needs improvement':
        return '#f59e0b'; // amber
      case 'poor':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-black/90 text-white p-3 rounded-lg text-xs font-mono max-w-xs backdrop-blur-sm"
      style={{ fontSize: '11px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Performance</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getScoreColor() }}
        />
        <span className="capitalize">{performanceScore}</span>
      </div>
      <div className="mt-2 text-white/70">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}