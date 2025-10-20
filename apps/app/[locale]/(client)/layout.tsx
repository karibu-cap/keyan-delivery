"use client";

import { useThemeColor } from '@/components/theme/ThemeProvider';
import { useEffect } from 'react';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { resetToClientTheme } = useThemeColor();

    useEffect(() => {
        resetToClientTheme();
    }, [resetToClientTheme]);

    return <>{children}</>;
}