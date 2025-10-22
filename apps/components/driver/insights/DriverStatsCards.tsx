// components/driver/insights/DriverStatsCards.tsx
// Stats cards for driver insights

"use client";

import { Card } from '@/components/ui/card';
import { Package, CheckCircle2, Wallet, TrendingUp } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverStatsCardsProps {
    analytics: any;
    loading: boolean;
}

export default function DriverStatsCards({ analytics, loading }: DriverStatsCardsProps) {
    const t = useT();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6 rounded-2xl shadow-card">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    const stats = [
        {
            title: t('Total Deliveries'),
            value: analytics?.totalDeliveries || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-500/10',
            change: analytics?.deliveriesChange || 0,
        },
        {
            title: t('Completed'),
            value: analytics?.completedDeliveries || 0,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-500/10',
            change: analytics?.completedChange || 0,
        },
        {
            title: t('Total Earnings'),
            value: t.formatAmount(analytics?.totalEarnings || 0),
            icon: Wallet,
            color: 'text-white',
            bgColor: 'bg-primary',
            change: analytics?.earningsChange || 0,
            gradient: true,
        },
        {
            title: t('Avg. Earnings'),
            value: t.formatAmount(analytics?.avgEarningsPerDelivery || 0),
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-500/10',
            change: analytics?.avgEarningsChange || 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isPositive = stat.change >= 0;
                
                return (
                    <Card
                        key={stat.title}
                        className={cn(
                            "p-6 rounded-2xl shadow-card",
                            stat.gradient && "bg-gradient-to-br from-primary/10 to-primary/5"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                stat.bgColor
                            )}>
                                <Icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    stat.gradient && "text-primary"
                                )}>
                                    {stat.value}
                                </p>
                                {stat.change !== 0 && (
                                    <p className={cn(
                                        "text-xs mt-1 flex items-center gap-1",
                                        isPositive ? "text-green-600" : "text-red-600"
                                    )}>
                                        <TrendingUp className={cn(
                                            "w-3 h-3",
                                            !isPositive && "rotate-180"
                                        )} />
                                        {Math.abs(stat.change).toFixed(1)}% {t('vs previous period')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
