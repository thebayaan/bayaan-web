'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isControlling: boolean;
  error: Error | null;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isControlling: false,
    error: null,
    registration: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported = 'serviceWorker' in navigator;

    if (!isSupported) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    let registration: ServiceWorkerRegistration;

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js');

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
          isControlling: !!navigator.serviceWorker.controller,
        }));

        // Listen for service worker state changes
        const updateState = () => {
          setState(prev => ({
            ...prev,
            isInstalling: registration.installing !== null,
            isWaiting: registration.waiting !== null,
            isControlling: !!navigator.serviceWorker.controller,
          }));
        };

        registration.addEventListener('updatefound', () => {
          console.log('New service worker installing...');
          updateState();

          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', updateState);
          }
        });

        // Listen for controller changes (when a new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service worker controller changed');
          updateState();
        });

        // Initial state update
        updateState();

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setState(prev => ({
          ...prev,
          error: error as Error,
        }));
      }
    };

    registerServiceWorker();

    return () => {
      // Cleanup listeners if needed
      if (registration) {
        registration.removeEventListener('updatefound', () => {});
      }
    };
  }, []);

  const updateServiceWorker = () => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const unregister = async () => {
    if (state.registration) {
      const success = await state.registration.unregister();
      if (success) {
        setState(prev => ({
          ...prev,
          isRegistered: false,
          registration: null,
        }));
      }
      return success;
    }
    return false;
  };

  return {
    ...state,
    updateServiceWorker,
    unregister,
  };
}