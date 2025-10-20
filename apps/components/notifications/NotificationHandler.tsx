'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationHandler() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'NAVIGATE') {
                console.log('🔀 Navigating to:', event.data.url);

                router.push(event.data.url);
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
        };
    }, [router]);

    return null;
}