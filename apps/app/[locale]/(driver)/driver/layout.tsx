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
            <div className="mt-14 md:mt-16 min-h-screen">
                {children}
            </div>
        </>
    );
}
