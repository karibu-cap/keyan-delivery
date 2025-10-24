'use client';

import { NotificationProvider, AutoNotificationSubscriber } from "./AutoNotificationSubscriber";


interface NotificationClientWrapperProps {
    children: React.ReactNode;
    isAuthenticated: boolean;
    userId?: string;
}

export function NotificationClientWrapper({
    children,
    isAuthenticated,
    userId
}: NotificationClientWrapperProps) {
    return (
        <NotificationProvider
            userId={userId}
        >
            <AutoNotificationSubscriber isAuthenticated={isAuthenticated} />
            {children}
        </NotificationProvider>
    );
}