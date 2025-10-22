// components/driver/insights/DriverPerformanceCard.tsx
// Performance metrics card for driver

"use client";

import { Card } from '@/components/ui/card';
import { TrendingUp, Clock, MapPin, Star } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverPerformanceCardProps {
    analytics: any;
    loading: boolean;
}

export default function DriverPerformanceCard({ analytics, loading }: DriverPerformanceCardProps) {
    const t = useT();

    if (loading) {
        return (
            <Card className="p-6 rounded-2xl shadow-card">
                <div className="mb-4">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </Card>
        );
    }

    const completionRate = analytics?.completionRate || 0;
    const avgDeliveryTime = analytics?.avgDeliveryTime || 0;
    const totalDistance = analytics?.totalDistance || 0;

    return (
        <Card className="p-6 rounded-2xl shadow-card">
            <div className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {t('Performance Metrics')}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Completion Rate */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                            <Star className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('Completion Rate')}</p>
                            <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-600 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>

                {/* Average Delivery Time */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('Avg. Delivery Time')}</p>
                            <p className="text-2xl font-bold text-blue-600">{avgDeliveryTime} {t('min')}</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('Time from pickup to delivery')}
                    </p>
                </div>

                {/* Total Distance */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('Total Distance')}</p>
                            <p className="text-2xl font-bold text-purple-600">{totalDistance.toFixed(1)} {t('km')}</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t('Distance covered during period')}
                    </p>
                </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                        {t('On-time deliveries')}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                        {analytics?.onTimeDeliveries || 0}
                    </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <span className="text-sm text-orange-800 dark:text-orange-200">
                        {t('Average rating')}
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                        {(analytics?.avgRating || 0).toFixed(1)} ⭐
                    </span>
                </div>
            </div>
        </Card>
    );
}
