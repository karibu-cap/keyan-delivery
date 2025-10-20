'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { toast } from '@/hooks/use-toast';


export default function NotificationPermission() {
    const t = useT();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
            checkSubscription();

            if (Notification.permission === 'default') {
                const timer = setTimeout(() => setShowPrompt(true), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const checkSubscription = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        try {
            setIsLoading(true);
            console.log('🔔 Starting subscription process...');

            if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
                console.error({ message: '❌ VAPID public key not found', error: 'VAPID key not configured' });
                toast({
                    variant: 'destructive',
                    title: t('Configuration error'),
                    description: t('VAPID key not configured. Please contact support.'),
                });
                return;
            }

            const permission = await Notification.requestPermission();
            setPermission(permission);
            console.log(`📝 Permission status: ${permission}`);

            if (permission !== 'granted') {
                toast({
                    variant: 'destructive',
                    title: t('Notification activation failed'),
                    description: t('You can activate them in your browser settings.'),
                });
                setShowPrompt(false);
                return;
            }

            console.log('⏳ Waiting for Service Worker to be ready...');
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Workers not supported');
            }

            const registration = await navigator.serviceWorker.ready;
            console.log('✅ Service Worker ready:');

            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('ℹ️ Already subscribed, unsubscribing first...');
                await existingSubscription.unsubscribe();
            }

            // Subscribe to push notifications
            console.log('📨 Subscribing to push manager...');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                ),
            });
            console.log(`✅ Push subscription created: ${subscription.endpoint}`);

            // Send to backend
            console.log('📤 Sending subscription to backend...');
            const response = await fetch('/api/v1/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userAgent: navigator.userAgent,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📥 Backend response:', data);

            if (data.success) {
                setIsSubscribed(true);
                setShowPrompt(false);

                toast({
                    title: t('✅ Subscribed to push notifications'),
                    description: t('You will now receive push notifications for new orders.'),
                });
                console.log('🎉 Subscription successful!');
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error({ message: '❌ Error subscribing to push:', error });
            toast({
                variant: 'destructive',
                title: t('Error activating notifications'),
                description: error instanceof Error ? error.message : t('Unknown error occurred'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        try {
            setIsLoading(true);
            console.log('🔕 Unsubscribing from push notifications...');

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                console.log('✅ Unsubscribed from push manager');

                await fetch('/api/v1/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                    }),
                });

                setIsSubscribed(false);
                toast({
                    title: t('✅ Unsubscribed from push notifications'),
                    description: t('You will no longer receive push notifications for new orders.'),
                });
                console.log('🎉 Unsubscription successful!');
            }
        } catch (error) {
            console.error({ message: '❌ Error unsubscribing:', error });
            toast({
                variant: 'destructive',
                title: t('Error unsubscribing'),
                description: t('Please try again later'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!('Notification' in window)) {
        return null;
    }

    return (
        <>
            {/* Prompt Banner */}
            {showPrompt && permission === 'default' && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between flex-wrap">
                            <div className="flex items-center flex-1">
                                <Bell className="h-6 w-6 mr-3" />
                                <p className="text-sm sm:text-base font-medium">
                                    {t('Activate notifications to be informed in real-time of your orders!')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                <button
                                    onClick={subscribeToPush}
                                    disabled={isLoading}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? t('Loading...') : t('Activate')}
                                </button>
                                <button
                                    onClick={() => setShowPrompt(false)}
                                    className="text-white hover:text-blue-100 transition-colors"
                                    aria-label="Close"
                                    disabled={isLoading}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button in Settings */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    {isSubscribed ? (
                        <Bell className="h-5 w-5 text-primary/60" />
                    ) : (
                        <BellOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900">{t('Notifications Push')}</h3>
                        <p className="text-sm text-gray-500">
                            {isSubscribed
                                ? t('You receive notifications')
                                : t('Activate to receive alerts')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                    disabled={isLoading || permission === 'denied'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSubscribed
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isLoading
                        ? t('Loading...')
                        : isSubscribed
                            ? t('Disable')
                            : permission === 'denied'
                                ? t('Blocked')
                                : t('Enable')}
                </button>
            </div>

            {permission === 'denied' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        {t('Notifications are blocked. Please enable them in your browser settings.')}
                    </p>
                </div>
            )}
        </>
    );
}