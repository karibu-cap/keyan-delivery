
'use client';

import { useAuthStore } from '@/hooks/use-auth-store';
import { ROUTES } from '@/lib/router';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ProtectedClientPage({
    children,
    fallback,
}: ProtectedRouteProps) {
    const { isAuthenticated, refreshSession } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            await refreshSession();

            if (!isAuthenticated()) {
                router.replace(ROUTES.signIn({ redirect: encodeURIComponent(pathname) }));
            }

            setIsChecking(false);
        };

        checkAuth();
    }, []);

    if (isChecking) {
        return fallback || <div className="relative flex w-64 animate-pulse gap-2 p-4">
            <div className="h-12 w-12 rounded-full bg-slate-400"></div>
            <div className="flex-1">
                <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
                <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
            </div>
            <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
        </div>;
    }

    return <>{children}</>;
}