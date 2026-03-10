'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  X
} from 'lucide-react';
import { useOfflineSync, useNetworkStatus } from '@/hooks/useOfflineSync';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * OfflineIndicator - Shows current sync status and offline capabilities
 */
export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOnline, wasOffline } = useNetworkStatus();
  const {
    syncInProgress,
    pendingActions,
    lastSync,
    storageStats,
    forceSync,
    clearAllData
  } = useOfflineSync();

  const getStatusIcon = () => {
    if (syncInProgress) {
      return <RefreshCw className="animate-spin" size={16} />;
    }

    if (!isOnline) {
      return <WifiOff size={16} />;
    }

    if (pendingActions > 0) {
      return <Clock size={16} />;
    }

    return <CheckCircle size={16} />;
  };

  const getStatusColor = () => {
    if (syncInProgress) return 'text-blue-500';
    if (!isOnline) return 'text-red-500';
    if (pendingActions > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (syncInProgress) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (pendingActions > 0) return `${pendingActions} pending`;
    return 'Synced';
  };

  const formatLastSync = useMemo(() => {
    if (!lastSync) return 'Never';

    const now = Date.now();
    const diff = now - lastSync;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }, [lastSync]);

  const formatStorage = () => {
    const total = storageStats.totalEntries;
    if (total === 0) return 'No data';
    if (total === 1) return '1 item';
    return `${total} items`;
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  const handleClearData = async () => {
    if (confirm('Clear all offline data? This cannot be undone.')) {
      try {
        await clearAllData();
      } catch (error) {
        console.error('Clear data failed:', error);
      }
    }
  };

  // Simple indicator for mobile/compact view
  if (!showDetails && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-md text-xs',
          'transition-all duration-200 hover:bg-[var(--color-hover)]',
          getStatusColor(),
          className
        )}
        title={`${getStatusText()} - Click for details`}
      >
        {getStatusIcon()}
        {showDetails && <span className="font-medium">{getStatusText()}</span>}
      </button>
    );
  }

  // Expanded detailed view
  return (
    <div
      className={cn(
        'bg-[var(--color-card)] border border-[var(--color-card-border)]',
        'rounded-lg p-4 space-y-3 min-w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('transition-colors', getStatusColor())}>
            {getStatusIcon()}
          </div>
          <span
            className="font-semibold text-sm"
            style={{ color: 'var(--color-label)' }}
          >
            Offline Status
          </span>
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-[var(--color-hover)] rounded"
          >
            <X size={14} style={{ color: 'var(--color-icon)' }} />
          </button>
        )}
      </div>

      {/* Status Details */}
      <div className="space-y-2">
        {/* Network Status */}
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--color-hint)' }}>Network:</span>
          <div className="flex items-center gap-1">
            {isOnline ? (
              <>
                <Wifi size={12} className="text-green-500" />
                <span className="text-green-500">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-red-500" />
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--color-hint)' }}>Sync:</span>
          <span
            className={cn('font-medium', getStatusColor())}
          >
            {getStatusText()}
          </span>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--color-hint)' }}>Last sync:</span>
          <span style={{ color: 'var(--color-hint)' }}>
            {formatLastSync()}
          </span>
        </div>

        {/* Storage */}
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--color-hint)' }}>Cached:</span>
          <span style={{ color: 'var(--color-hint)' }}>
            {formatStorage()}
          </span>
        </div>
      </div>

      {/* Connection Status Message */}
      {wasOffline && isOnline && (
        <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20">
          <CheckCircle size={14} className="text-green-500" />
          <span className="text-xs text-green-700 dark:text-green-300">
            Reconnected - syncing changes
          </span>
        </div>
      )}

      {!isOnline && (
        <div className="flex items-center gap-2 p-2 rounded bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle size={14} className="text-orange-500" />
          <span className="text-xs text-orange-700 dark:text-orange-300">
            Working offline - changes will sync when connected
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-divider)' }}>
        <button
          onClick={handleForceSync}
          disabled={!isOnline || syncInProgress}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            'transition-colors duration-200',
            isOnline && !syncInProgress
              ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600'
              : 'opacity-50 cursor-not-allowed text-gray-400'
          )}
          title={!isOnline ? 'Sync requires internet connection' : 'Force sync now'}
        >
          <RefreshCw size={12} />
          Sync Now
        </button>

        <button
          onClick={handleClearData}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            'transition-colors duration-200',
            'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600'
          )}
          title="Clear all cached data"
        >
          <Settings size={12} />
          Clear Cache
        </button>
      </div>
    </div>
  );
}

/**
 * Compact offline status for use in navigation bars
 */
export function OfflineStatusBadge() {
  const { isOnline } = useNetworkStatus();
  const { syncInProgress, pendingActions } = useOfflineSync();

  if (isOnline && pendingActions === 0 && !syncInProgress) {
    return null; // Don't show when everything is normal
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        'transition-all duration-200',
        !isOnline
          ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          : pendingActions > 0 || syncInProgress
            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      )}
    >
      {syncInProgress ? (
        <>
          <RefreshCw className="animate-spin" size={12} />
          Syncing
        </>
      ) : !isOnline ? (
        <>
          <CloudOff size={12} />
          Offline
        </>
      ) : pendingActions > 0 ? (
        <>
          <Clock size={12} />
          {pendingActions} pending
        </>
      ) : (
        <>
          <Cloud size={12} />
          Synced
        </>
      )}
    </div>
  );
}