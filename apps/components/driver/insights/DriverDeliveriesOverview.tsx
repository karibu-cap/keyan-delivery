// components/driver/insights/DriverDeliveriesOverview.tsx
// Deliveries status breakdown for driver

"use client";

import { Card } from '@/components/ui/card';
import { Package, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverDeliveriesOverviewProps {
    breakdown: any;
    loading: boolean;
}

export default function DriverDeliveriesOverview({ breakdown, loading }: DriverDeliveriesOverviewProps) {
    const t = useT();

    if (loading) {
        return (
            <Card className="p-6 rounded-2xl shadow-card">
                <div className="mb-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </Card>
        );
    }

    const totalDeliveries = breakdown?.total || 0;

    const statuses = [
        {
            label: t('Completed'),
            value: breakdown?.completed || 0,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-950/20',
        },
        {
            label: t('In Progress'),
            value: breakdown?.inProgress || 0,
            icon: Truck,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        },
        {
            label: t('Ready to Deliver'),
            value: breakdown?.ready || 0,
            icon: Package,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        },
        {
            label: t('Canceled'),
            value: breakdown?.canceled || 0,
            icon: XCircle,
            color: 'text-primary',
            bgColor: 'bg-red-50 dark:bg-red-950/20',
        },
    ];

    return (
        <Card className="p-6 rounded-2xl shadow-card">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">{t('Deliveries Overview')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('Status breakdown')} - {totalDeliveries} {t('total deliveries')}
                </p>
            </div>

            <div className="space-y-3">
                {statuses.map((status) => {
                    const Icon = status.icon;
                    const percentage = totalDeliveries > 0
                        ? ((status.value / totalDeliveries) * 100).toFixed(1)
                        : '0.0';

                    return (
                        <div
                            key={status.label}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg ${status.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${status.color}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{status.label}</span>
                                        <span className="text-sm font-semibold">{status.value}</span>
                                    </div>
                                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${status.bgColor.replace('bg-', 'bg-').replace('/20', '')}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
