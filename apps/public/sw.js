const CACHE_NAME = 'Yetu-delivery-v2';
const RUNTIME_CACHE = 'Yetu-runtime-v2';
const MAP_TILES_CACHE = 'Yetu-map-tiles-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/manifest.json',
    // Leaflet CSS and JS
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.info('[SW] Install event');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.info('[SW] Caching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.info('[SW] Activate event');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== MAP_TILES_CACHE) {
                        console.info('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});


self.addEventListener('push', (event) => {
    console.info('[SW] Push notification received', event);

    let notificationData = {
        title: 'New notification',
        body: 'You have received a new notification',
        icon: '/icons/ios/192.png',
        badge: '/icons/ios/72.png',
        image: '/icons/ios/192.png',
        tag: 'notification-' + Date.now(),
        data: {
            url: '/',
        },
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = {
                title: payload.title || notificationData.title,
                body: payload.body || notificationData.body,
                icon: payload.icon || notificationData.icon,
                badge: payload.badge || notificationData.badge,
                tag: payload.tag || notificationData.tag,
                data: payload.data || notificationData.data,
                image: payload.image || notificationData.image,
                actions: payload.actions,
                requireInteraction: payload.requireInteraction || false,
            };
        } catch (e) {
            console.error('[SW] Error parsing push data:', e);
        }
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            data: notificationData.data,
            image: notificationData.image,
            actions: notificationData.actions || [],
            requireInteraction: notificationData.requireInteraction,
            requireInteraction: false,
            renotify: true,
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
        })
        .then(() => {
            console.log('[SW] ✅ Notification displayed');

            return self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(clients => {
                console.log(`[SW] Found ${clients.length} open clients`);

                if (clients.length > 0) {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'NOTIFICATION_DISPLAYED',
                            notification: notificationData
                        });
                    });
                } else {
                    console.log('[SW] No active clients (app is closed or in background)');
                }
            });
        })
        .catch((error) => {
            console.error('[SW] ❌ Error showing notification:', error);
        });

    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    console.log('[SW] Action:', event.action);

    event.notification.close();
    let urlToOpen = '/';

    if (event.notification.data?.url) {
        urlToOpen = event.notification.data.url;
    }
    if (event.notification.data?.url && event.action == 'track') {
        urlToOpen = event.notification.data.trackUrl;
    }

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            console.log(`[SW] Found ${clientList.length} clients`);

            const targetUrl = new URL(urlToOpen, self.location.origin);

            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                try {
                    const clientUrl = new URL(client.url);

                    if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
                        console.log('[SW] ✅ Found window with same URL - focusing');
                        return client.focus();
                    }
                } catch (e) {
                    console.error('[SW] Error parsing URL:', e);
                }
            }

            if (clientList.length > 0) {
                const client = clientList[0];
                console.log('[SW] ✅ App is open - using postMessage for SPA navigation');

                return client.focus().then(() => {
                    client.postMessage({
                        type: 'NAVIGATE',
                        url: urlToOpen
                    });
                    console.log('[SW] Navigation message sent to client');
                });
            }

            console.log('[SW] ✅ No open windows - opening new window (PWA closed)');
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed');
});