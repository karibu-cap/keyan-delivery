'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { Bell, X } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { toast } from '@/hooks/use-toast';

// Shared types and utilities
interface NotificationContextType {
    isSubscribed: boolean;
    permission: NotificationPermission;
    subscribe: (silent?: boolean) => Promise<boolean>;
    unsubscribe: (silent?: boolean) => Promise<boolean>;
    checkSubscription: () => Promise<boolean>;
    userPreference: 'auto' | 'manual' | 'disabled';
    setUserPreference: (pref: 'auto' | 'manual' | 'disabled') => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook to use notification context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

// Utility function
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

interface NotificationProviderProps {
    children: React.ReactNode;
    userId?: string;
}

// Main Provider Component
export function NotificationProvider({
    children,
    userId
}: NotificationProviderProps) {
    const t = useT();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [userPreference, setUserPreferenceState] = useState<'auto' | 'manual' | 'disabled'>('auto');

    // Load user preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notification-preference');
            if (saved) {
                setUserPreferenceState(saved as 'auto' | 'manual' | 'disabled');
            }
        }
    }, []);

    // Update permission state
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Check subscription status
    const checkSubscription = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                const subscribed = !!subscription;
                setIsSubscribed(subscribed);
                return subscribed;
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
        return false;
    };

    useEffect(() => {
        checkSubscription();
    }, []);

    const subscribe = async (silent = false): Promise<boolean> => {
        try {
            console.log('🔔 Starting subscription process...');

            if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
                console.error('❌ VAPID public key not found');
                if (!silent) {
                    toast({
                        variant: 'destructive',
                        title: t('Configuration error'),
                        description: t('VAPID key not configured. Please contact support.'),
                    });
                }
                return false;
            }

            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                if (!silent) {
                    toast({
                        variant: 'destructive',
                        title: t('Notification activation failed'),
                        description: t('You can activate them in your browser settings.'),
                    });
                }
                return false;
            }

            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Workers not supported');
            }

            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                await existingSubscription.unsubscribe();
            }

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                ),
            });

            // Send to backend
            const response = await fetch('/api/v1/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userAgent: navigator.userAgent,
                    userId: userId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setIsSubscribed(true);
                if (!silent) {
                    toast({
                        title: t('✅ Subscribed to push notifications'),
                        description: t('You will now receive push notifications for new orders.'),
                    });
                }
                console.log('🎉 Subscription successful!');
                return true;
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('❌ Error subscribing to push:', error);
            if (!silent) {
                toast({
                    variant: 'destructive',
                    title: t('Error activating notifications'),
                    description: error instanceof Error ? error.message : t('Unknown error occurred'),
                });
            }
            return false;
        }
    };

    const unsubscribe = async (silent = false): Promise<boolean> => {
        try {
            console.log('🔕 Unsubscribing from push notifications...');

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                await fetch('/api/v1/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                        userId: userId,
                    }),
                });

                setIsSubscribed(false);

                if (!silent) {
                    toast({
                        title: t('✅ Unsubscribed from push notifications'),
                        description: t('You will no longer receive push notifications for new orders.'),
                    });
                }
                console.log('🎉 Unsubscription successful!');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error unsubscribing:', error);
            if (!silent) {
                toast({
                    variant: 'destructive',
                    title: t('Error unsubscribing'),
                    description: t('Please try again later'),
                });
            }
            return false;
        }
    };

    const setUserPreference = (pref: 'auto' | 'manual' | 'disabled') => {
        setUserPreferenceState(pref);
        localStorage.setItem('notification-preference', pref);
    };

    const contextValue: NotificationContextType = {
        isSubscribed,
        permission,
        subscribe,
        unsubscribe,
        checkSubscription,
        userPreference,
        setUserPreference,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}

// Auto-Subscribe Component (for global layout)
interface AutoNotificationSubscriberProps {
    isAuthenticated: boolean;
}

export function AutoNotificationSubscriber({ isAuthenticated }: AutoNotificationSubscriberProps) {
    const t = useT();
    const {
        subscribe,
        isSubscribed,
        permission,
        userPreference,
        setUserPreference
    } = useNotification();

    const [autoSubscribeAttempted, setAutoSubscribeAttempted] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Check if we're on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Auto-subscribe when user logs in
    useEffect(() => {
        if (!isClient) return;

        if (isAuthenticated &&
            !autoSubscribeAttempted &&
            userPreference === 'auto' &&
            permission !== 'denied') {

            const attemptAutoSubscribe = async () => {
                setAutoSubscribeAttempted(true);

                // Check if already subscribed
                if (isSubscribed) {
                    console.log('✅ Already subscribed, skipping auto-subscribe');
                    return;
                }

                // If permission already granted, subscribe silently
                if (permission === 'granted') {
                    console.log('🔔 Auto-subscribing authenticated user...');
                    await subscribe(true); // Silent mode
                } else if (permission === 'default') {
                    // Show a gentle one-time prompt
                    setShowPrompt(true);
                }
            };

            // Delay to ensure page is fully loaded
            const timer = setTimeout(attemptAutoSubscribe, 2000);
            return () => clearTimeout(timer);
        }

        // Reset flag when user logs out
        if (!isAuthenticated) {
            setAutoSubscribeAttempted(false);
        }
    }, [isClient, isAuthenticated, autoSubscribeAttempted, permission, userPreference, isSubscribed, subscribe]);


    const handleEnableNotifications = async () => {
        setIsLoading(true);
        const success = await subscribe(false);
        if (success) {
            setShowPrompt(false);
            setUserPreference('auto');
        }
        setIsLoading(false);
    };

    const handleDismissPrompt = () => {
        setShowPrompt(false);
        setUserPreference('manual');
    };

    // Don't render anything on server or if not authenticated or no Notification API
    if (!isClient || !isAuthenticated) {
        return null;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
        return null;
    }

    return (
        <>
            {showPrompt && permission === 'default' && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center flex-1 min-w-0">
                                <Bell className="h-6 w-6 mr-3 flex-shrink-0" />
                                <p className="text-sm sm:text-base font-medium">
                                    {t('Stay updated! Enable notifications to get real-time order alerts.')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleEnableNotifications}
                                    disabled={isLoading}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {isLoading ? t('Loading...') : t('Enable')}
                                </button>
                                <button
                                    onClick={handleDismissPrompt}
                                    className="text-white hover:text-blue-100 transition-colors p-1"
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
        </>
    );
}