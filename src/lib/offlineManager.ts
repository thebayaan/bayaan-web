/**
 * Offline Manager - Handles offline data storage and synchronization
 * Provides a robust offline-first experience for the Bayaan app
 */

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  version: string;
  expires?: number;
}

interface UserData {
  id: string;
  type: string;
  data: unknown;
  lastModified: number;
}

interface OfflineQueueItem {
  id: string;
  action: 'bookmark' | 'note' | 'playlist' | 'preference';
  data: UserData;
  timestamp: number;
  retries: number;
}

interface SyncState {
  isOnline: boolean;
  lastSync: number;
  pendingActions: number;
  syncInProgress: boolean;
}

class OfflineManager {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private syncQueue: OfflineQueueItem[] = [];
  private syncState: SyncState = {
    isOnline: navigator.onLine,
    lastSync: 0,
    pendingActions: 0,
    syncInProgress: false,
  };

  private listeners: ((state: SyncState) => void)[] = [];

  constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
    this.loadSyncQueue();
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BayaanOfflineDB', 1);

      request.onerror = () => {
        console.error('Failed to initialize offline database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ Offline database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Cache store for general data caching
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('expires', 'expires', { unique: false });
        }

        // Sync queue store for pending actions
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('action', 'action', { unique: false });
        }

        // User data store for bookmarks, notes, etc.
        if (!db.objectStoreNames.contains('userData')) {
          const userStore = db.createObjectStore('userData', { keyPath: 'id' });
          userStore.createIndex('type', 'type', { unique: false });
          userStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Downloads store for cached audio/content
        if (!db.objectStoreNames.contains('downloads')) {
          const downloadStore = db.createObjectStore('downloads', { keyPath: 'id' });
          downloadStore.createIndex('type', 'type', { unique: false });
          downloadStore.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  /**
   * Set up network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.syncState.isOnline = true;
      this.notifyListeners();
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.syncState.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeDB();
    }

    const transaction = this.db?.transaction(['syncQueue'], 'readonly');
    if (!transaction) return;

    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();

    request.onsuccess = () => {
      this.syncQueue = request.result || [];
      this.syncState.pendingActions = this.syncQueue.length;
      this.notifyListeners();
    };
  }

  /**
   * Cache data with optional expiration
   */
  async cache<T>(key: string, data: T, options?: { expires?: number; version?: string }): Promise<void> {
    if (!this.isInitialized) await this.initializeDB();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: options?.version || '1.0',
      expires: options?.expires ? Date.now() + options.expires : undefined,
    };

    const transaction = this.db?.transaction(['cache'], 'readwrite');
    if (!transaction) return;

    const store = transaction.objectStore('cache');
    store.put({ key, ...entry });
  }

  /**
   * Retrieve cached data
   */
  async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.isInitialized) await this.initializeDB();

    return new Promise((resolve) => {
      const transaction = this.db?.transaction(['cache'], 'readonly');
      if (!transaction) {
        resolve(null);
        return;
      }

      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T>;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (entry.expires && Date.now() > entry.expires) {
          this.removeFromCache(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Remove item from cache
   */
  async removeFromCache(key: string): Promise<void> {
    if (!this.isInitialized) await this.initializeDB();

    const transaction = this.db?.transaction(['cache'], 'readwrite');
    if (!transaction) return;

    const store = transaction.objectStore('cache');
    store.delete(key);
  }

  /**
   * Add action to sync queue
   */
  async addToSyncQueue(action: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const item: OfflineQueueItem = {
      ...action,
      id: `${action.action}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.syncQueue.push(item);
    this.syncState.pendingActions = this.syncQueue.length;
    this.notifyListeners();

    // Store in IndexedDB
    if (!this.isInitialized) await this.initializeDB();

    const transaction = this.db?.transaction(['syncQueue'], 'readwrite');
    if (!transaction) return;

    const store = transaction.objectStore('syncQueue');
    store.add(item);

    // Try to sync immediately if online
    if (this.syncState.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncState.syncInProgress || this.syncQueue.length === 0) return;

    this.syncState.syncInProgress = true;
    this.notifyListeners();

    console.log(`🔄 Processing ${this.syncQueue.length} pending actions...`);

    for (let i = this.syncQueue.length - 1; i >= 0; i--) {
      const item = this.syncQueue[i];

      try {
        const success = await this.syncAction(item);

        if (success) {
          // Remove from queue
          this.syncQueue.splice(i, 1);
          this.removeSyncQueueItem(item.id);
        } else {
          // Increment retry count
          item.retries++;

          // Remove if too many retries
          if (item.retries >= 3) {
            console.warn(`❌ Removing failed sync item after 3 retries:`, item);
            this.syncQueue.splice(i, 1);
            this.removeSyncQueueItem(item.id);
          }
        }
      } catch (error) {
        console.error('Sync error:', error);
        item.retries++;

        if (item.retries >= 3) {
          this.syncQueue.splice(i, 1);
          this.removeSyncQueueItem(item.id);
        }
      }
    }

    this.syncState.syncInProgress = false;
    this.syncState.pendingActions = this.syncQueue.length;
    this.syncState.lastSync = Date.now();
    this.notifyListeners();

    console.log('✅ Sync queue processed');
  }

  /**
   * Sync individual action
   */
  private async syncAction(item: OfflineQueueItem): Promise<boolean> {
    // In a real app, this would make API calls to sync with the server
    // For now, we'll just simulate the sync

    console.log(`📤 Syncing ${item.action}:`, item.data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate 90% success rate
    return Math.random() > 0.1;
  }

  /**
   * Remove sync queue item from storage
   */
  private async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.isInitialized) return;

    const transaction = this.db?.transaction(['syncQueue'], 'readwrite');
    if (!transaction) return;

    const store = transaction.objectStore('syncQueue');
    store.delete(id);
  }

  /**
   * Store user data (bookmarks, notes, etc.)
   */
  async storeUserData(type: string, id: string, data: unknown): Promise<void> {
    if (!this.isInitialized) await this.initializeDB();

    const userItem: UserData = {
      id: `${type}_${id}`,
      type,
      data,
      lastModified: Date.now(),
    };

    const transaction = this.db?.transaction(['userData'], 'readwrite');
    if (!transaction) return;

    const store = transaction.objectStore('userData');
    store.put(userItem);

    // Also add to sync queue if online sync is needed
    if (type === 'bookmark' || type === 'note' || type === 'playlist' || type === 'preference') {
      this.addToSyncQueue({
        action: type,
        data: userItem,
      });
    }
  }

  /**
   * Get user data
   */
  async getUserData(type: string, id?: string): Promise<UserData[]> {
    if (!this.isInitialized) await this.initializeDB();

    return new Promise((resolve) => {
      const transaction = this.db?.transaction(['userData'], 'readonly');
      if (!transaction) {
        resolve([]);
        return;
      }

      const store = transaction.objectStore('userData');

      if (id) {
        const request = store.get(`${type}_${id}`);
        request.onsuccess = () => {
          resolve(request.result ? [request.result] : []);
        };
        request.onerror = () => resolve([]);
      } else {
        const index = store.index('type');
        const request = index.getAll(type);
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => resolve([]);
      }
    });
  }

  /**
   * Clear expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    if (!this.isInitialized) await this.initializeDB();

    const transaction = this.db?.transaction(['cache'], 'readwrite');
    if (!transaction) return;

    const store = transaction.objectStore('cache');
    const index = store.index('expires');
    const now = Date.now();

    const request = index.openCursor(IDBKeyRange.upperBound(now));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    cacheSize: number;
    userDataSize: number;
    queueSize: number;
    totalEntries: number;
  }> {
    if (!this.isInitialized) await this.initializeDB();

    return new Promise((resolve) => {
      let cacheSize = 0;
      let userDataSize = 0;
      const queueSize = this.syncQueue.length;
      let totalEntries = 0;

      const transaction = this.db?.transaction(['cache', 'userData'], 'readonly');
      if (!transaction) {
        resolve({ cacheSize: 0, userDataSize: 0, queueSize, totalEntries: 0 });
        return;
      }

      const cacheStore = transaction.objectStore('cache');
      const userStore = transaction.objectStore('userData');

      cacheStore.count().onsuccess = (event) => {
        cacheSize = (event.target as IDBRequest).result;
        totalEntries += cacheSize;
      };

      userStore.count().onsuccess = (event) => {
        userDataSize = (event.target as IDBRequest).result;
        totalEntries += userDataSize;

        resolve({
          cacheSize,
          userDataSize,
          queueSize,
          totalEntries,
        });
      };
    });
  }

  /**
   * Subscribe to sync state changes
   */
  onSyncStateChange(callback: (state: SyncState) => void): () => void {
    this.listeners.push(callback);

    // Call immediately with current state
    callback(this.syncState);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.syncState));
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Force sync now (if online)
   */
  async forcSync(): Promise<void> {
    if (this.syncState.isOnline) {
      await this.processSyncQueue();
    }
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    if (!this.isInitialized) await this.initializeDB();

    const transaction = this.db?.transaction(['cache', 'userData', 'syncQueue'], 'readwrite');
    if (!transaction) return;

    const cacheStore = transaction.objectStore('cache');
    const userStore = transaction.objectStore('userData');
    const syncStore = transaction.objectStore('syncQueue');

    await Promise.all([
      new Promise(resolve => {
        const req = cacheStore.clear();
        req.onsuccess = () => resolve(true);
      }),
      new Promise(resolve => {
        const req = userStore.clear();
        req.onsuccess = () => resolve(true);
      }),
      new Promise(resolve => {
        const req = syncStore.clear();
        req.onsuccess = () => resolve(true);
      }),
    ]);

    this.syncQueue = [];
    this.syncState.pendingActions = 0;
    this.notifyListeners();

    console.log('🗑️ All offline data cleared');
  }
}

// Global instance
export const offlineManager = new OfflineManager();

// Convenience hooks for React components
export function useOfflineManager() {
  return offlineManager;
}

export type { SyncState, OfflineQueueItem };