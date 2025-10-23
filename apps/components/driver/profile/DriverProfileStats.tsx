// components/driver/profile/DriverProfileStats.tsx
// Stats cards for driver profile page with animations

"use client";

import { useState, useEffect } from 'react';
import { Wallet, Package, Star } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import AnimatedStatsCard, { AnimatedStatsGrid } from '../AnimatedStatsCard';

interface DriverProfileStatsProps {
    driverId: string;
}

interface Stats {
    earningsThisMonth: number;
    activeDays: number;
    avgRating: number;
}

export default function DriverProfileStats({ driverId }: DriverProfileStatsProps) {
    const t = useT();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/v1/driver/profile/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch profile stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [driverId]);

    const statsData = [
        {
            title: t('Earnings This Month'),
            value: stats ? t.formatAmount(stats.earningsThisMonth) : '0',
            icon: Wallet,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
            borderColor: 'border-red-200 dark:border-red-800',
        },
        {
            title: t('Active Days'),
            value: stats?.activeDays || 0,
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
        },
        {
            title: t('Average Rating'),
            value: stats ? `${stats.avgRating} ⭐` : '0 ⭐',
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
            borderColor: 'border-yellow-200 dark:border-yellow-800',
        },
    ];

    return (
        <AnimatedStatsGrid columns={3}>
            {statsData.map((stat, index) => (
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
