'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window === 'undefined') {
            console.log('⚠️ Window is undefined, skipping SW registration');
            return;
        }

        if (!('serviceWorker' in navigator)) {
            console.log('⚠️ Service Workers are not supported in this browser');
            return;
        }

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
                    updateViaCache: 'none', // Important pour le développement
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
            console.log('📩 Message from service worker:', event.data);
        });

        // Listen when the controller changes (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed');
        });

        return () => clearTimeout(timer);
    }, []);

    return null;
}