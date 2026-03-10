'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineManager, SyncState } from '@/lib/offlineManager';

/**
 * Hook for managing offline sync state and operations
 */
export function useOfflineSync() {
  const [syncState, setSyncState] = useState<SyncState>(offlineManager.getSyncState());
  const [storageStats, setStorageStats] = useState({
    cacheSize: 0,
    userDataSize: 0,
    queueSize: 0,
    totalEntries: 0,
  });

  const loadStorageStats = useCallback(async () => {
    try {
      const stats = await offlineManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  }, []);

  useEffect(() => {
    // Subscribe to sync state changes
    const unsubscribe = offlineManager.onSyncStateChange(setSyncState);

    // Load initial storage stats with timeout to avoid cascading renders
    const timer = setTimeout(() => loadStorageStats(), 0);

    // Update storage stats periodically
    const interval = setInterval(loadStorageStats, 30000); // Every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [loadStorageStats]);

  const forceSync = useCallback(async () => {
    try {
      await offlineManager.forcSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await offlineManager.clearAllData();
      await loadStorageStats();
    } catch (error) {
      console.error('Clear data failed:', error);
    }
  }, [loadStorageStats]);

  return {
    ...syncState,
    storageStats,
    forceSync,
    clearAllData,
    loadStorageStats,
  };
}

/**
 * Hook for caching data with automatic offline support
 */
export function useOfflineCache<T>(key: string, fetcher?: () => Promise<T>, options?: {
  expires?: number;
  version?: string;
  refetchOnMount?: boolean;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (useCache = true) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get from cache first
      if (useCache) {
        const cachedData = await offlineManager.getFromCache<T>(key);
        if (cachedData !== null) {
          setData(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      }

      // If no cache or cache miss, fetch fresh data
      if (fetcher) {
        const freshData = await fetcher();
        setData(freshData);

        // Cache the fresh data
        await offlineManager.cache(key, freshData, options);

        setIsLoading(false);
        return freshData;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
      setIsLoading(false);

      // If fetch failed, try to use stale cache data
      try {
        const staleData = await offlineManager.getFromCache<T>(key);
        if (staleData !== null) {
          setData(staleData);
          console.warn('Using stale cache data due to fetch error:', error);
        }
      } catch (cacheError) {
        console.error('Failed to retrieve stale cache data:', cacheError);
      }
    }
  }, [key, fetcher, options]);

  const invalidateCache = useCallback(async () => {
    await offlineManager.removeFromCache(key);
    if (fetcher) {
      await fetchData(false); // Fetch fresh without using cache
    }
  }, [key, fetcher, fetchData]);

  useEffect(() => {
    if (options?.refetchOnMount !== false) {
      // Use setTimeout to avoid cascading state updates
      const timer = setTimeout(() => fetchData(), 0);
      return () => clearTimeout(timer);
    }
  }, [fetchData, options?.refetchOnMount]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidateCache,
  };
}

/**
 * Hook for storing user data with offline queue support
 */
export function useOfflineUserData(type: 'bookmark' | 'note' | 'playlist' | 'preference') {
  const storeData = useCallback(async (id: string, data: unknown) => {
    try {
      await offlineManager.storeUserData(type, id, data);
    } catch (error) {
      console.error(`Failed to store ${type}:`, error);
      throw error;
    }
  }, [type]);

  const getData = useCallback(async (id?: string) => {
    try {
      return await offlineManager.getUserData(type, id);
    } catch (error) {
      console.error(`Failed to get ${type}:`, error);
      return [];
    }
  }, [type]);

  return {
    storeData,
    getData,
  };
}

/**
 * Hook for managing download state and offline content
 */
export function useOfflineDownload() {
  const [downloads, setDownloads] = useState<Map<string, {
    id: string;
    progress: number;
    status: 'pending' | 'downloading' | 'completed' | 'error';
    size?: number;
  }>>(new Map());

  const downloadForOffline = useCallback(async (
    url: string,
    id: string,
    options?: {
      onProgress?: (progress: number) => void;
      priority?: 'high' | 'normal' | 'low';
    }
  ) => {
    // Update download state
    setDownloads(prev => new Map(prev.set(id, {
      id,
      progress: 0,
      status: 'downloading',
    })));

    try {
      // In a real implementation, this would download and cache the file
      // For now, we'll simulate the download process

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate download time

        setDownloads(prev => {
          const current = prev.get(id);
          if (current) {
            return new Map(prev.set(id, { ...current, progress }));
          }
          return prev;
        });

        options?.onProgress?.(progress);
      }

      // Mark as completed
      setDownloads(prev => {
        const current = prev.get(id);
        if (current) {
          return new Map(prev.set(id, { ...current, status: 'completed', progress: 100 }));
        }
        return prev;
      });

      // Cache the download info
      await offlineManager.cache(`download_${id}`, {
        url,
        downloadedAt: Date.now(),
        status: 'completed',
      });

    } catch (error) {
      console.error('Download failed:', error);

      setDownloads(prev => {
        const current = prev.get(id);
        if (current) {
          return new Map(prev.set(id, { ...current, status: 'error' }));
        }
        return prev;
      });
    }
  }, []);

  const cancelDownload = useCallback((id: string) => {
    setDownloads(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const getDownloadStatus = useCallback((id: string) => {
    return downloads.get(id);
  }, [downloads]);

  const isDownloaded = useCallback(async (id: string) => {
    const cached = await offlineManager.getFromCache<{ status: string }>(`download_${id}`);
    return cached?.status === 'completed';
  }, []);

  return {
    downloads: Array.from(downloads.values()),
    downloadForOffline,
    cancelDownload,
    getDownloadStatus,
    isDownloaded,
  };
}

/**
 * Hook for checking online/offline status with better UX
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show reconnection notification
        console.log('🟢 Back online - syncing data...');
        offlineManager.forcSync();
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('🔴 Gone offline - enabling offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
  };
}