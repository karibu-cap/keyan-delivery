// components/driver/insights/DriverEarningsChart.tsx
// Earnings evolution chart for driver

"use client";

import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverEarningsChartProps {
    data: any[];
    loading: boolean;
}

export default function DriverEarningsChart({ data, loading }: DriverEarningsChartProps) {
    const t = useT();

    if (loading) {
        return (
            <Card className="p-6 rounded-2xl shadow-card">
                <div className="mb-4">
                    <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-64 w-full" />
            </Card>
        );
    }

    const hasData = data && data.length > 0;

    return (
        <Card className="p-6 rounded-2xl shadow-card">
            <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {t('Earnings Evolution')}
                </h3>
            </div>

            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                        <TrendingUp className="w-10 h-10 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t('No earnings data')}
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        {t('Earnings will appear here once you complete deliveries')}
                    </p>
                </div>
            ) : (
                <div className="h-64">
                    {/* Simple bar chart representation */}
                    <div className="flex items-end justify-between h-full gap-2">
                        {data.slice(0, 15).map((day, index) => {
                            const maxEarnings = Math.max(...data.map((d: any) => d.earnings));
                            const height = maxEarnings > 0 ? (day.earnings / maxEarnings) * 100 : 0;
                            
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full relative group">
                                        <div
                                            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:from-primary/80 hover:to-primary/40"
                                            style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                                            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                {t.formatAmount(day.earnings)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(day.date).getDate()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
}
