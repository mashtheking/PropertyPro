// Service Worker for RealEstate CRM PWA

// Cache names
const CACHE_NAME = 'realestate-crm-v1';
const STATIC_CACHE_NAME = 'realestate-crm-static-v1';
const DYNAMIC_CACHE_NAME = 'realestate-crm-dynamic-v1';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  self.skipWaiting(); // Ensure new service worker activates immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  return self.clients.claim(); // Take control of all clients
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and requests to API endpoints
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') ||
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('ewmjparrdpjurafbkklb.supabase.co')
  ) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if found
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network
      return fetch(event.request)
        .then((res) => {
          // Clone the response as it can only be consumed once
          const resClone = res.clone();
          
          // Open cache and store the new response
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              // Only cache successful responses
              if (resClone.status === 200) {
                cache.put(event.request, resClone);
              }
            });
          
          return res;
        })
        .catch(() => {
          // If both cache and network fail, return a fallback for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Notification received', event);

  let data = { title: 'New Notification', content: 'Something new happened!', openUrl: '/' };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      openUrl: data.openUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const openUrl = notification.data.openUrl;
  
  notification.close();
  
  event.waitUntil(
    clients.matchAll().then((allClients) => {
      const client = allClients.find((c) => c.visibilityState === 'visible');
      
      if (client) {
        client.navigate(openUrl);
        client.focus();
      } else {
        clients.openWindow(openUrl);
      }
    })
  );
});
