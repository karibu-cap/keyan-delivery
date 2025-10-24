'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { useNotification } from './AutoNotificationSubscriber';

export default function NotificationPermission() {
    const t = useT();
    const {
        isSubscribed,
        permission,
        subscribe,
        unsubscribe,
        userPreference,
        setUserPreference
    } = useNotification();

    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);

        if (isSubscribed) {
            // User wants to disable
            const success = await unsubscribe(false);
            if (success) {
                setUserPreference('manual');
            }
        } else {
            // User wants to enable
            const success = await subscribe(false);
            if (success) {
                setUserPreference('auto');
            }
        }

        setIsLoading(false);
    };

    return (
        <>
            {/* Settings Toggle Button */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    {isSubscribed ? (
                        <Bell className="h-5 w-5 text-primary/60" />
                    ) : (
                        <BellOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900">{t('Push Notifications')}</h3>
                        <p className="text-sm text-gray-500">
                            {isSubscribed
                                ? t('Active - You receive notifications')
                                : t('Inactive - Enable to receive alerts')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {userPreference === 'auto'
                                ? t('🤖 Auto-managed (subscribes on login)')
                                : userPreference === 'manual'
                                    ? t('⚙️ Manual control')
                                    : t('🚫 Disabled')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleToggle}
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

            {/* Info Messages */}
            {permission === 'denied' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        {t('Notifications are blocked. Please enable them in your browser settings.')}
                    </p>
                </div>
            )}

            {isSubscribed && userPreference === 'auto' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        {t('💡 Auto mode: Notifications will automatically subscribe when you login and unsubscribe when you logout.')}
                    </p>
                </div>
            )}
        </>
    );
}