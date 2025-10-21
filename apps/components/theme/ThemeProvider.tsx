"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MerchantType } from '@prisma/client';

type ThemeColor = 'green' | 'orange' | 'blue';

interface ThemeContextType {
    themeColor: ThemeColor;
    setMerchantTheme: (type: MerchantType | null) => void;
    resetToClientTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeColor, setThemeColor] = useState<ThemeColor>('green');

    const setMerchantTheme = (type: MerchantType | null) => {
        if (!type) {
            setThemeColor('green');
            return;
        }

        const themeMap: Record<MerchantType, ThemeColor> = {
            [MerchantType.FOOD]: 'orange',
            [MerchantType.PHARMACY]: 'blue',
            [MerchantType.GROCERY]: 'green',
        };

        setThemeColor(themeMap[type]);
    };

    const resetToClientTheme = () => {
        setThemeColor('green');
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeColor);
    }, [themeColor]);

    return (
        <ThemeContext.Provider value={{ themeColor, setMerchantTheme, resetToClientTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeColor() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeColor must be used within a ThemeProvider');
    }
    return context;
}