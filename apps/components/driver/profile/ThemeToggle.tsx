// components/driver/profile/ThemeToggle.tsx
// Theme toggle component (Light/Dark/System)

"use client";

import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
    const t = useT();
    const [theme, setTheme] = useState<Theme>('system');

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            applyTheme('system');
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        
        if (newTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
        } else {
            root.classList.toggle('dark', newTheme === 'dark');
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: t('Light'), icon: Sun },
        { value: 'dark', label: t('Dark'), icon: Moon },
        { value: 'system', label: t('System'), icon: Monitor },
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            {themes.map(({ value, label, icon: Icon }) => (
                <Button
                    key={value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleThemeChange(value)}
                    className={cn(
                        "gap-2 transition-all",
                        theme === value && "bg-background shadow-sm"
                    )}
                >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                </Button>
            ))}
        </div>
    );
}
