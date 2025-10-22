// File: /app/[locale]/(driver)/driver/layout.tsx
// Driver layout with red-600 theme and navigation

"use client";

import { useEffect } from 'react';
import { useThemeColor } from '@/components/theme/ThemeProvider';
import DriverNavbar from '@/components/driver/DriverNavbar';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { setDriverTheme } = useThemeColor();

    useEffect(() => {
        // Set driver theme color (red-600)
        setDriverTheme();
    }, [setDriverTheme]);

    return (
        <>
            <DriverNavbar />
            <div className="pb-20 md:pb-8 min-h-screen">
                {children}
            </div>
        </>
    );
}
