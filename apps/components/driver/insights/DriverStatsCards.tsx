// components/driver/insights/DriverStatsCards.tsx
// Stats cards for driver insights with animations

"use client";

import { Package, CheckCircle2, Wallet, TrendingUp } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import AnimatedStatsCard, { AnimatedStatsGrid } from '../AnimatedStatsCard';

interface DriverStatsCardsProps {
    analytics: any;
    loading: boolean;
}

export default function DriverStatsCards({ analytics, loading }: DriverStatsCardsProps) {
    const t = useT();

    const stats = [
        {
            title: t('Total Deliveries'),
            value: analytics?.totalDeliveries || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
        },
        {
            title: t('Completed'),
            value: analytics?.completedDeliveries || 0,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
            borderColor: 'border-green-200 dark:border-green-800',
        },
        {
            title: t('Total Earnings'),
            value: t.formatAmount(analytics?.totalEarnings || 0),
            icon: Wallet,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-red-200 dark:border-red-800',
        },
        {
            title: t('Avg. Earnings'),
            value: t.formatAmount(analytics?.avgEarningsPerDelivery || 0),
            icon: TrendingUp,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20',
            borderColor: 'border-orange-200 dark:border-orange-800',
        },
    ];

    return (
        <AnimatedStatsGrid columns={4}>
            {stats.map((stat, index) => (
                <AnimatedStatsCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    bgColor={stat.bgColor}
                    borderColor={stat.borderColor}
                    loading={loading}
                    animationDelay={index * 100}
                />
            ))}
        </AnimatedStatsGrid>
    );
}
