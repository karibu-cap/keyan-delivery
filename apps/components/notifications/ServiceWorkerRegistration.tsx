'use client';

import { useEffect } from 'react';

const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export default function ServicesWorkerRegistration() {
    useEffect(() => {
        if (typeof window === 'undefined') {
            console.log('⚠️ Window is undefined, skipping SW registration');
            return;
        }

        if (!('serviceWorker' in navigator)) {
            console.log('⚠️ Service Workers are not supported in this browser');
            return;
        }

        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.log('⚠️ Service Workers are not supported in this browser');
            return;
        }

        const deviceType = isMobile() ? 'Mobile' : 'Desktop';
        console.log(`📱 Device: ${deviceType}`);

        // Function to register the Service Worker
        const registerServiceWorker = async () => {
            try {
                console.log('🔄 Starting Service Worker registration...');

                // Check if already registered
                const existingRegistration = await navigator.serviceWorker.getRegistration('/');
                if (existingRegistration) {
                    console.log(`ℹ️ Service Worker already registered: ${existingRegistration.scope}`);
                    return existingRegistration;
                }

                // Register the new Service Worker
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none',
                });

                console.log(`✅ Service Worker registered successfully!`);

                // Listen for state changes
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update found');

                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            console.log(`📊 SW State changed to: ${newWorker.state}`);

                            if (newWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('🔄 New service worker available, reload to update');
                                } else {
                                    console.log('✅ Service worker installed for the first time');
                                }
                            }

                            if (newWorker.state === 'activated') {
                                console.log('✅ Service worker activated');
                            }
                        });
                    }
                });

                // Wait for the SW to be active
                if (registration.installing) {
                    console.log('⏳ Waiting for Service Worker to install...');
                    await new Promise<void>((resolve) => {
                        const worker = registration.installing!;
                        worker.addEventListener('statechange', () => {
                            if (worker.state === 'activated') {
                                console.log('✅ Service Worker is now activated');
                                resolve();
                            }
                        });
                    });
                } else if (registration.waiting) {
                    console.log('⏳ Service Worker is waiting...');
                } else if (registration.active) {
                    console.log('✅ Service Worker is already active');
                }

                return registration;
            } catch (error) {
                console.error({ message: '❌ Service Worker registration failed:', error });
                if (error instanceof Error) {
                    console.error({ message: '   Error name:', error });
                }
                throw error;
            }
        };

        // Save the SW registration after a short delay to ensure the page is loaded
        const timer = setTimeout(() => {
            registerServiceWorker().catch((error) => {
                console.error({ message: 'Failed to register service worker:', error });
            });
        }, 100);

        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📩 Message from SW:', event.data);

            // DESKTOP ONLY : play sound if app is open
            if (event.data && event.data.type === 'NOTIFICATION_DISPLAYED') {
                if (!isMobile()) {
                    console.log('🔊 Playing custom notification sound (desktop only)');

                    try {
                        const audio = new Audio('/notification-sound.mp3');
                        audio.volume = 0.5;
                        audio.play()
                            .then(() => console.log('✅ Custom sound played'))
                            .catch(err => {
                                console.warn('⚠️ Could not play custom sound:', err.message);
                            });
                    } catch (err) {
                        console.warn('⚠️ Audio error:', err);
                    }
                } else {
                    console.log('📱 Mobile device - using system notification sound');
                }
            }
        });

        // Listen when the controller changes (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed');
        });

        return () => clearTimeout(timer);
    }, []);

    return null;
}