"use client";

import { useEffect, useState } from "react";
import { Bell, Package, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useT } from "@/hooks/use-inline-translation";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    createdAt: Date;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
}

export default function MerchantNotifications() {
    const t = useT()
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/merchant/notifications');
            const data = await res.json();

            if (data.success) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error({ message: 'Error fetching notifications:', error });
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'NEW_ORDER':
                return <ShoppingCart className="w-4 h-4" />;
            case 'LOW_STOCK':
                return <AlertCircle className="w-4 h-4" />;
            case 'PENDING_PRODUCTS':
                return <Package className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-500';
            case 'medium':
                return 'text-yellow-500';
            case 'low':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        router.push(notification.link);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>{t("Notifications")}</span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary">{unreadCount} new</Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        {t("Loading...")}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        {t("No notifications")}
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3 w-full">
                                    <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium leading-none">
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-center justify-center cursor-pointer"
                            onClick={() => router.push('/merchant/notifications')}
                        >
                            {t("View all notifications")}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}