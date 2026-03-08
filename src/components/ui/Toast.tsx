'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { X, Check, AlertCircle, Share, Copy } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';
export type ToastAction = 'share' | 'copy' | 'bookmark' | 'general';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}


// Simple toast store (could be replaced with Zustand if needed)
let toastListeners: ((toast: Toast) => void)[] = [];
let toastId = 0;

export const toast = {
  show: (message: string, type: ToastType = 'success', action?: ToastAction, duration = 3000) => {
    const id = (++toastId).toString();
    const newToast: Toast = { id, message, type, action, duration };
    toastListeners.forEach(listener => listener(newToast));
  },

  success: (message: string, action?: ToastAction) => toast.show(message, 'success', action),
  error: (message: string, action?: ToastAction) => toast.show(message, 'error', action),
  info: (message: string, action?: ToastAction) => toast.show(message, 'info', action),
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast: toastItem, onRemove }: ToastItemProps) {
  useEffect(() => {
    if (toastItem.duration && toastItem.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toastItem.id);
      }, toastItem.duration);

      return () => clearTimeout(timer);
    }
  }, [toastItem.id, toastItem.duration, onRemove]);

  const getIcon = () => {
    if (toastItem.action === 'share') return <Share size={16} />;
    if (toastItem.action === 'copy') return <Copy size={16} />;

    switch (toastItem.type) {
      case 'success':
        return <Check size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getColors = () => {
    switch (toastItem.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
        'animate-in slide-in-from-bottom-5 fade-in duration-300',
        'shadow-lg max-w-md',
        getColors()
      )}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      <p className="text-sm font-medium flex-1 min-w-0">
        {toastItem.message}
      </p>

      <button
        onClick={() => onRemove(toastItem.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToast: Toast) => {
      setToasts(current => [...current, newToast]);
    };

    toastListeners.push(listener);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(current => current.filter(t => t.id !== id));
  };

  if (toasts.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map(toastItem => (
          <ToastItem
            key={toastItem.id}
            toast={toastItem}
            onRemove={removeToast}
          />
        ))}
      </div>
    </>
  );
}