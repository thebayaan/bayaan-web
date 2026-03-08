// Bayaan Service Worker
const CACHE_NAME = 'bayaan-v1';
const OFFLINE_URL = '/offline';

// Assets to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/mushaf',
  '/reciters',
  '/adhkar',
  '/collection',
  '/search',
  // Add icon files
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cache the offline page
    await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));

    // Cache static assets
    try {
      await cache.addAll(STATIC_CACHE_URLS);
      console.log('Static assets cached successfully');
    } catch (error) {
      console.warn('Some static assets failed to cache:', error);
    }
  })());

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');

  event.waitUntil((async () => {
    // Enable navigation preload if it's supported
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }

    // Clean up old caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );
  })());

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to different origins
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith((async () => {
    try {
      // Try to get the response from the network first
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) {
        return preloadResponse;
      }

      const networkResponse = await fetch(event.request);

      // If successful, cache the response for future use
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(CACHE_NAME);

        // Cache API responses and pages (but not audio files due to size)
        const url = new URL(event.request.url);
        if (!url.pathname.includes('.mp3') && !url.pathname.includes('/audio/')) {
          cache.put(event.request, networkResponse.clone());
        }
      }

      return networkResponse;
    } catch (error) {
      // Network failed, try to serve from cache
      console.log('Network failed, trying cache for:', event.request.url, error);

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If it's a navigation request and we can't serve it from cache,
      // serve the offline page
      if (event.request.mode === 'navigate') {
        const offlineResponse = await caches.match(OFFLINE_URL);
        if (offlineResponse) {
          return offlineResponse;
        }
      }

      // If we can't serve the request from cache, return a basic response
      return new Response('Offline', {
        status: 408,
        statusText: 'Request timeout - you appear to be offline',
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  })());
});

// Background sync for when the user goes back online
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Background sync completed',
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: 'explore',
          title: 'Open App',
          icon: '/icons/icon-192.png',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification('Bayaan', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});