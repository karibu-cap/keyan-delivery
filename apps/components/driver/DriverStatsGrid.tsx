// File: /components/driver/DriverStatsGrid.tsx
// Futuristic stats grid with animations

"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Package, Truck, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/router';

interface DriverStatsGridProps {
    availableCount: number;
    activeCount: number;
    completedCount: number;
    loading?: boolean;
    onTabChange?: (tab: string) => void;
    isInitialLoad?: boolean;
}

export default function DriverStatsGrid({
    availableCount,
    activeCount,
    completedCount,
    loading = false,
    onTabChange,
    isInitialLoad = true,
}: DriverStatsGridProps) {
    const router = useRouter();

    const stats = [
        {
            title: 'Available Orders',
            value: availableCount,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            onClick: () => onTabChange?.('available'),
        },
        {
            title: 'Active Deliveries',
            value: activeCount,
            icon: Truck,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
            borderColor: 'border-orange-200 dark:border-orange-800',
            onClick: () => onTabChange?.('active'),
        },
        {
            title: 'Completed Today',
            value: completedCount,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            borderColor: 'border-green-200 dark:border-green-800',
            onClick: () => onTabChange?.('completed'),
        },
        {
            title: 'Total Earnings',
            value: 'KES 0.00',
            icon: TrendingUp,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-red-200 dark:border-red-800',
            onClick: () => router.push(ROUTES.driverWallet),
        },
    ];

    // Only show skeleton on initial load, not on refresh
    if (loading && isInitialLoad) {
        return (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="shadow-sm border animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3 bg-muted rounded w-20" />
                                    <div className="h-6 bg-muted rounded w-12" />
                                </div>
                                <div className="w-10 h-10 bg-muted rounded-lg" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.title}
                        onClick={stat.onClick}
                        className={cn(
                            "shadow-sm border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer",
                            stat.borderColor,
                            "animate-in fade-in slide-in-from-bottom-4"
                        )}
                        style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'backwards',
                        }}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className={cn("text-2xl font-bold transition-all duration-300", stat.color)}>
                                        {typeof stat.value === 'number' ? stat.value : stat.value}
                                    </p>
                                </div>
                                <div className={cn(
                                    "p-2.5 rounded-lg transition-transform duration-300 hover:scale-110",
                                    stat.bgColor
                                )}>
                                    <Icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
