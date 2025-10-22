// components/driver/profile/DriverProfileStats.tsx
// Stats cards for driver profile page

"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Wallet, Package, TrendingUp } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Skeleton } from '@/components/ui/skeleton';

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

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total Earnings This Month */}
            <Card className="p-6 rounded-2xl shadow-card bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Earnings This Month')}</p>
                        <p className="text-2xl font-bold text-primary">
                            {t.formatAmount(stats.earningsThisMonth)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Active Days */}
            <Card className="p-6 rounded-2xl shadow-card">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Active Days')}</p>
                        <p className="text-2xl font-bold">{stats.activeDays}</p>
                    </div>
                </div>
            </Card>

            {/* Average Rating */}
            <Card className="p-6 rounded-2xl shadow-card">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('Average Rating')}</p>
                        <p className="text-2xl font-bold">{stats.avgRating} ⭐</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
