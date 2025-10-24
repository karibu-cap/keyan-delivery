"use client";

import { useT } from "@/hooks/use-inline-translation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const [showIndicator, setShowIndicator] = useState(false);
    const t = useT()

    useEffect(() => {
        if (!isOnline) {
            setShowIndicator(true);
        } else {
            // Keep showing for 2 seconds after coming back online
            const timer = setTimeout(() => setShowIndicator(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    if (!showIndicator) return null;

    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${isOnline
                ? "bg-green-500 text-white animate-in slide-in-from-top"
                : "bg-red-500 text-white animate-in slide-in-from-top"
                }`}
        >
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <>
                        <Wifi className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("Back online")}</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span className="text-sm font-medium">{t("You're offline")}</span>
                    </>
                )}
            </div>
        </div>
    );
}
