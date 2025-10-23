// components/driver/AnimatedStatsCard.tsx
// Reusable animated stats card component with dashboard animations

"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AnimatedStatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    onClick?: () => void;
    loading?: boolean;
    animationDelay?: number;
    className?: string;
}

export default function AnimatedStatsCard({
    title,
    value,
    icon: Icon,
    color = 'text-primary',
    bgColor = 'bg-primary/10',
    borderColor = 'border-primary/20',
    onClick,
    loading = false,
    animationDelay = 0,
    className,
}: AnimatedStatsCardProps) {
    if (loading) {
        return (
            <Card className={cn("shadow-sm border animate-pulse", className)}>
                <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                        <Skeleton className="w-9 h-9 rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            onClick={onClick}
            className={cn(
                "shadow-sm border transition-all duration-300",
                onClick && "hover:scale-105 hover:shadow-lg cursor-pointer",
                borderColor,
                "animate-in fade-in slide-in-from-bottom-4",
                className
            )}
            style={{
                animationDelay: `${animationDelay}ms`,
                animationFillMode: 'backwards',
            }}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="text-xs font-medium text-muted-foreground">
                            {title}
                        </p>
                        <p className={cn("text-xl font-bold transition-all duration-300", color)}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                    </div>
                    <div className={cn(
                        "p-2 rounded-lg transition-transform duration-300",
                        onClick && "hover:scale-110",
                        bgColor
                    )}>
                        <Icon className={cn("w-4 h-4", color)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Grid wrapper component for consistent layout
interface AnimatedStatsGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

export function AnimatedStatsGrid({ 
    children, 
    columns = 4,
    className 
}: AnimatedStatsGridProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn("grid gap-3", gridCols[columns], className)}>
            {children}
        </div>
    );
}
