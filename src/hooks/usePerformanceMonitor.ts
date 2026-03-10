'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Additional metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadComplete?: number;

  // Custom metrics
  timeToInteractive?: number;
  resourceLoadTime?: number;
  memoryUsage?: number;
}

interface PerformanceContext {
  metrics: PerformanceMetrics;
  isLoading: boolean;
  logMetric: (name: string, value: number) => void;
  getMetricsSummary: () => string;
}

let globalMetrics: PerformanceMetrics = {};
let observers: PerformanceObserver[] = [];

/**
 * Hook for monitoring Core Web Vitals and performance metrics
 */
export function usePerformanceMonitor(): PerformanceContext {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(globalMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    // Initialize start time in effect
    if (startTime.current === null && typeof performance !== 'undefined') {
      startTime.current = performance.now();
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const updateMetric = (name: keyof PerformanceMetrics, value: number) => {
      globalMetrics = { ...globalMetrics, [name]: value };
      setMetrics({ ...globalMetrics });
    };

    const initializePerformanceMonitoring = () => {
      // Log initial page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          const domTime = performance.now();
          updateMetric('domContentLoaded', domTime);
        });
      }

      window.addEventListener('load', () => {
        const loadTime = performance.now();
        updateMetric('loadComplete', loadTime);
      });
    };

    const getNavigationMetrics = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          updateMetric('ttfb', navigation.responseStart - navigation.fetchStart);
          updateMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          updateMetric('loadComplete', navigation.loadEventEnd - navigation.fetchStart);
        }
      } catch (error) {
        console.warn('Error getting navigation metrics:', error);
      }
    };

    const monitorCoreWebVitals = () => {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
          if (lastEntry) {
            updateMetric('lcp', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              updateMetric('fcp', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = globalMetrics.cls || 0;
          const entries = entryList.getEntries() as PerformanceEventTiming[];
          entries.forEach((entry) => {
            // @ts-expect-error - LayoutShift properties
            if (entry.hadRecentInput) return;
            // @ts-expect-error - LayoutShift value property
            clsValue += entry.value;
          });
          updateMetric('cls', clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as PerformanceEventTiming[];
          entries.forEach((entry) => {
            updateMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    };

    const monitorResourceLoading = () => {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const totalLoadTime = entries.reduce((sum, entry) => {
            return sum + entry.duration;
          }, 0);

          if (entries.length > 0) {
            updateMetric('resourceLoadTime', totalLoadTime / entries.length);
          }
        });
        resourceObserver.observe({ type: 'resource', buffered: true });
        observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    };

    const monitorMemoryUsage = () => {
      try {
        // @ts-expect-error - memory API is experimental
        if (performance.memory) {
          const checkMemory = () => {
            // @ts-expect-error - memory API is experimental
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
            updateMetric('memoryUsage', usedMB);
          };

          checkMemory();
          // Check memory usage every 30 seconds
          const memoryInterval = setInterval(checkMemory, 30000);

          return () => clearInterval(memoryInterval);
        }
      } catch (error) {
        console.warn('Memory monitoring not supported:', error);
      }
    };

    // Initialize performance monitoring
    initializePerformanceMonitoring();

    // Mark as interactive
    if (startTime.current !== null) {
      const interactiveTime = performance.now() - startTime.current;
      updateMetric('timeToInteractive', interactiveTime);
    }

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      monitorResourceLoading();
      monitorCoreWebVitals();
    }

    // Get initial navigation metrics
    getNavigationMetrics();

    // Monitor memory usage (if available)
    monitorMemoryUsage();

    // Set loading state after initialization
    const loadingTimer = setTimeout(() => setIsLoading(false), 0);

    return () => {
      // Cleanup observers
      observers.forEach(observer => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Error disconnecting performance observer:', error);
        }
      });
      observers = [];
      clearTimeout(loadingTimer);
    };
  }, []);

  const logMetric = (name: string, value: number) => {
    console.log(`📊 Performance Metric: ${name} = ${value}ms`);

    // Log to analytics if available
    try {
      // Could integrate with analytics services here
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // @ts-expect-error - gtag is a global from Google Analytics
        window.gtag('event', 'timing_complete', {
          name,
          value: Math.round(value),
        });
      }
    } catch {
      // Analytics not available
    }
  };

  const getMetricsSummary = (): string => {
    const m = metrics;
    const summary = [
      m.lcp ? `LCP: ${Math.round(m.lcp)}ms` : null,
      m.fid ? `FID: ${Math.round(m.fid)}ms` : null,
      m.cls ? `CLS: ${Math.round(m.cls * 1000) / 1000}` : null,
      m.fcp ? `FCP: ${Math.round(m.fcp)}ms` : null,
      m.ttfb ? `TTFB: ${Math.round(m.ttfb)}ms` : null,
    ].filter(Boolean).join(', ');

    return summary || 'Metrics not available';
  };

  return {
    metrics,
    isLoading,
    logMetric,
    getMetricsSummary,
  };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStart = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const [currentRenderCount, setCurrentRenderCount] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof performance !== 'undefined') {
      renderStart.current = performance.now();
      renderCount.current += 1;
      setCurrentRenderCount(renderCount.current);
    }
  }); // No dependency array - intentionally runs on every render

  useEffect(() => {
    if (typeof performance !== 'undefined') {
      const renderTime = performance.now() - renderStart.current;

      if (renderTime > 16) { // Log if render takes longer than one frame (16ms)
        console.warn(`⚠️ Slow render: ${componentName} took ${Math.round(renderTime * 100) / 100}ms (render #${renderCount.current})`);
      }
    }
  });

  return {
    renderCount: currentRenderCount,
  };
}

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(metrics: PerformanceMetrics) {
  const budget = {
    lcp: 2500,     // 2.5s for good LCP
    fid: 100,      // 100ms for good FID
    cls: 0.1,      // 0.1 for good CLS
    fcp: 1800,     // 1.8s for good FCP
    ttfb: 600,     // 600ms for good TTFB
  };

  const results = {
    lcp: metrics.lcp ? (metrics.lcp <= budget.lcp ? 'good' : metrics.lcp <= 4000 ? 'needs improvement' : 'poor') : 'unknown',
    fid: metrics.fid ? (metrics.fid <= budget.fid ? 'good' : metrics.fid <= 300 ? 'needs improvement' : 'poor') : 'unknown',
    cls: metrics.cls ? (metrics.cls <= budget.cls ? 'good' : metrics.cls <= 0.25 ? 'needs improvement' : 'poor') : 'unknown',
    fcp: metrics.fcp ? (metrics.fcp <= budget.fcp ? 'good' : metrics.fcp <= 3000 ? 'needs improvement' : 'poor') : 'unknown',
    ttfb: metrics.ttfb ? (metrics.ttfb <= budget.ttfb ? 'good' : metrics.ttfb <= 1000 ? 'needs improvement' : 'poor') : 'unknown',
  };

  return results;
}