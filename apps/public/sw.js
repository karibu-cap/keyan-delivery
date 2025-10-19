// // Yetu Delivery - Service Worker for PWA capabilities
// const CACHE_NAME = 'Yetu-delivery-v1';
// const RUNTIME_CACHE = 'Yetu-runtime-v1';

// // Assets to cache on install
// const PRECACHE_ASSETS = [
//     '/',
//     '/manifest.json',
//     '/offline.html',
//     // Add other critical assets
// ];

// // API endpoints to cache
// const API_CACHE_PATTERNS = [
//     /\/api\/v1\/client\/categories/,
//     /\/api\/v1\/client\/merchants/,
//     /\/api\/v1\/client\/products\/featured/,
// ];

// // Install event - cache static assets
// self.addEventListener('install', event => {
//     console.log('[SW] Install event');

//     event.waitUntil(
//         caches.open(CACHE_NAME)
//             .then(cache => {
//                 console.log('[SW] Caching app shell');
//                 return cache.addAll(PRECACHE_ASSETS);
//             })
//             .then(() => {
//                 return self.skipWaiting();
//             })
//     );
// });

// // Activate event - clean up old caches
// self.addEventListener('activate', event => {
//     console.log('[SW] Activate event');

//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames.map(cacheName => {
//                     if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
//                         console.log('[SW] Deleting old cache:', cacheName);
//                         return caches.delete(cacheName);
//                     }
//                 })
//             );
//         }).then(() => {
//             return self.clients.claim();
//         })
//     );
// });

// // Fetch event - implement caching strategies
// self.addEventListener('fetch', event => {
//     const { request } = event;
//     const url = new URL(request.url);

//     // Skip non-HTTP requests
//     if (!request.url.startsWith('http')) {
//         return;
//     }

//     // Handle API requests with Network First strategy
//     if (url.pathname.startsWith('/api/')) {
//         event.respondWith(networkFirstStrategy(request));
//         return;
//     }

//     // Handle image requests with Cache First strategy
//     if (request.destination === 'image') {
//         event.respondWith(cacheFirstStrategy(request));
//         return;
//     }

//     // Handle navigation requests with Network First, falling back to cache
//     if (request.mode === 'navigate') {
//         event.respondWith(navigationStrategy(request));
//         return;
//     }

//     // Default to Stale While Revalidate for other requests
//     event.respondWith(staleWhileRevalidateStrategy(request));
// });

// // Network First Strategy - Try network first, fall back to cache
// async function networkFirstStrategy(request) {
//     try {
//         const networkResponse = await fetch(request);

//         // Cache successful responses for future use
//         if (networkResponse.ok) {
//             const cache = await caches.open(RUNTIME_CACHE);
//             cache.put(request, networkResponse.clone());
//         }

//         return networkResponse;
//     } catch (error) {
//         console.log('[SW] Network failed, trying cache:', request.url);

//         const cachedResponse = await caches.match(request);
//         if (cachedResponse) {
//             return cachedResponse;
//         }

//         // Return offline page for navigation requests
//         if (request.mode === 'navigate') {
//             const offlineResponse = await caches.match('/offline.html');
//             return offlineResponse || new Response('Offline - Please check your connection', {
//                 status: 503,
//                 statusText: 'Service Unavailable'
//             });
//         }

//         throw error;
//     }
// }

// // Cache First Strategy - Try cache first, fall back to network
// async function cacheFirstStrategy(request) {
//     const cachedResponse = await caches.match(request);

//     if (cachedResponse) {
//         return cachedResponse;
//     }

//     try {
//         const networkResponse = await fetch(request);

//         if (networkResponse.ok) {
//             const cache = await caches.open(RUNTIME_CACHE);
//             cache.put(request, networkResponse.clone());
//         }

//         return networkResponse;
//     } catch (error) {
//         console.error('[SW] Both cache and network failed for image:', request.url);
//         throw error;
//     }
// }

// // Navigation Strategy - Network first with offline fallback
// async function navigationStrategy(request) {
//     try {
//         const networkResponse = await fetch(request);

//         if (networkResponse.ok) {
//             const cache = await caches.open(RUNTIME_CACHE);
//             cache.put(request, networkResponse.clone());
//         }

//         return networkResponse;
//     } catch (error) {
//         console.log('[SW] Navigation network failed, trying cache');

//         // Try cache first
//         const cachedResponse = await caches.match(request);
//         if (cachedResponse) {
//             return cachedResponse;
//         }

//         // Return offline page as last resort
//         const offlineResponse = await caches.match('/offline.html');
//         return offlineResponse || new Response('Offline - Please check your connection', {
//             status: 503,
//             statusText: 'Service Unavailable'
//         });
//     }
// }

// // Stale While Revalidate Strategy - Return cache immediately, update in background
// async function staleWhileRevalidateStrategy(request) {
//     const cachedResponse = await caches.match(request);

//     // Start network request (don't await)
//     const networkPromise = fetch(request).then(networkResponse => {
//         if (networkResponse.ok) {
//             caches.open(RUNTIME_CACHE).then(cache => {
//                 cache.put(request, networkResponse.clone());
//             });
//         }
//         return networkResponse;
//     }).catch(error => {
//         console.log('[SW] Background fetch failed:', request.url);
//         return null;
//     });

//     // Return cached version immediately if available
//     if (cachedResponse) {
//         return cachedResponse;
//     }

//     // If no cache, wait for network
//     return networkPromise;
// }

// // Background sync for offline actions
// self.addEventListener('sync', event => {
//     console.log('[SW] Background sync:', event.tag);

//     if (event.tag === 'cart-sync') {
//         event.waitUntil(syncCartData());
//     }

//     if (event.tag === 'order-sync') {
//         event.waitUntil(syncOrderData());
//     }
// });

// // Sync cart data when back online
// async function syncCartData() {
//     try {
//         // Get pending cart actions from IndexedDB or local storage
//         const pendingActions = await getPendingCartActions();

//         for (const action of pendingActions) {
//             try {
//                 await fetch('/api/v1/client/cart', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(action.data)
//                 });

//                 // Remove from pending actions after successful sync
//                 await removePendingCartAction(action.id);
//             } catch (error) {
//                 console.error('[SW] Failed to sync cart action:', error);
//             }
//         }
//     } catch (error) {
//         console.error('[SW] Cart sync failed:', error);
//     }
// }

// // Sync order data when back online
// async function syncOrderData() {
//     try {
//         const pendingOrders = await getPendingOrders();

//         for (const order of pendingOrders) {
//             try {
//                 await fetch('/api/v1/client/orders', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(order)
//                 });

//                 await removePendingOrder(order.id);
//             } catch (error) {
//                 console.error('[SW] Failed to sync order:', error);
//             }
//         }
//     } catch (error) {
//         console.error('[SW] Order sync failed:', error);
//     }
// }

// // Push notification handling
// self.addEventListener('push', event => {
//     console.log('[SW] Push received');

//     if (!event.data) {
//         return;
//     }

//     const data = event.data.json();
//     const options = {
//         body: data.body,
//         icon: '/icons/icon-192x192.png',
//         badge: '/icons/badge-72x72.png',
//         vibrate: [100, 50, 100],
//         data: {
//             url: data.url || '/',
//             orderId: data.orderId
//         },
//         actions: [
//             {
//                 action: 'view',
//                 title: 'View',
//                 icon: '/icons/action-view.png'
//             },
//             {
//                 action: 'close',
//                 title: 'Close',
//                 icon: '/icons/action-close.png'
//             }
//         ]
//     };

//     event.waitUntil(
//         self.registration.showNotification(data.title, options)
//     );
// });

// // Notification click handling
// self.addEventListener('notificationclick', event => {
//     console.log('[SW] Notification clicked:', event.action);

//     event.notification.close();

//     if (event.action === 'view') {
//         const url = event.notification.data.url || '/';
//         event.waitUntil(
//             clients.openWindow(url)
//         );
//     }
// });

// // Message handling for communication with main thread
// self.addEventListener('message', event => {
//     console.log('[SW] Message received:', event.data);

//     if (event.data.type === 'SKIP_WAITING') {
//         self.skipWaiting();
//     }

//     if (event.data.type === 'GET_VERSION') {
//         event.ports[0].postMessage({ version: CACHE_NAME });
//     }

//     if (event.data.type === 'CLEAR_CACHE') {
//         event.waitUntil(
//             caches.keys().then(cacheNames => {
//                 return Promise.all(
//                     cacheNames.map(cacheName => caches.delete(cacheName))
//                 );
//             })
//         );
//     }
// });

// // Helper functions for offline storage
// async function getPendingCartActions() {
//     // This would typically use IndexedDB
//     // For now, return empty array
//     return [];
// }

// async function removePendingCartAction(id) {
//     // Remove from IndexedDB
//     console.log('[SW] Removed pending cart action:', id);
// }

// async function getPendingOrders() {
//     // This would typically use IndexedDB
//     return [];
// }

// async function removePendingOrder(id) {
//     console.log('[SW] Removed pending order:', id);
// }

// // Periodic background sync (if supported)
// self.addEventListener('periodicsync', event => {
//     console.log('[SW] Periodic sync:', event.tag);

//     if (event.tag === 'content-sync') {
//         event.waitUntil(syncContentData());
//     }
// });

// // Sync content data periodically
// async function syncContentData() {
//     try {
//         // Refresh cached content in background
//         const response = await fetch('/api/v1/client/products/featured');
//         if (response.ok) {
//             const cache = await caches.open(RUNTIME_CACHE);
//             cache.put('/api/v1/client/products/featured', response.clone());
//         }
//     } catch (error) {
//         console.error('[SW] Periodic sync failed:', error);
//     }
// }