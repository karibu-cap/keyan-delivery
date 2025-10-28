'use client';

import { useMemo } from 'react';
import { OrderStatusBreakdown } from '@/types/merchant_analytics';
import {
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ChefHat,
    Package,
    Truck,
} from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';

interface OrdersOverviewProps {
    breakdown: OrderStatusBreakdown;
}

export default function OrdersOverview({ breakdown }: OrdersOverviewProps) {
    const t = useT();
    const total = useMemo(() => {
        return (
            breakdown.completed +
            breakdown.pending +
            breakdown.canceled +
            breakdown.rejected +
            breakdown.inPreparation +
            breakdown.readyToDeliver +
            breakdown.onTheWay
        );
    }, [breakdown]);

    const statusData = [
        {
            label: 'Completed',
            value: breakdown.completed,
            color: 'bg-primary',
            lightColor: 'bg-primary/10',
            textColor: 'text-primary/70',
            icon: CheckCircle,
        },
        {
            label: 'In Preparation',
            value: breakdown.inPreparation,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-100',
            textColor: 'text-blue-700',
            icon: ChefHat,
        },
        {
            label: 'Ready to Deliver',
            value: breakdown.readyToDeliver,
            color: 'bg-purple-500',
            lightColor: 'bg-purple-100',
            textColor: 'text-purple-700',
            icon: Package,
        },
        {
            label: 'On The Way',
            value: breakdown.onTheWay,
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-100',
            textColor: 'text-indigo-700',
            icon: Truck,
        },
        {
            label: 'Pending',
            value: breakdown.pending,
            color: 'bg-yellow-500',
            lightColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            icon: Clock,
        },
        {
            label: 'Canceled',
            value: breakdown.canceled,
            color: 'bg-orange-500',
            lightColor: 'bg-orange-100',
            textColor: 'text-orange-700',
            icon: XCircle,
        },
        {
            label: 'Rejected',
            value: breakdown.rejected,
            color: 'bg-red-500',
            lightColor: 'bg-red-100',
            textColor: 'text-red-700',
            icon: AlertCircle,
        },
    ];

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6">
            <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                    {t('Orders Overview')}
                </h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {t('Status breakdown - {total} total orders', { total: total })}
                </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {statusData.map((status, index) => {
                    const Icon = status.icon;
                    const percentage = total > 0 ? (status.value / total) * 100 : 0;

                    return (
                        <div key={index} className="group">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`rounded-lg p-1.5 ${status.lightColor}`}>
                                        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${status.textColor}`} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 sm:text-sm">
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                                        {status.value}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100 sm:h-2.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${status.color}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-200 pt-6 sm:gap-4">
                <div className="rounded-lg bg-primary/5 p-3 sm:p-4">
                    <p className="text-xs font-medium text-primary/60">{t('Success Rate')}</p>
                    <p className="mt-1 text-xl font-bold text-primary/70 sm:text-2xl">
                        {total > 0 ? ((breakdown.completed / total) * 100).toFixed(1) : 0}%
                    </p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 sm:p-4">
                    <p className="text-xs font-medium text-primary">{t('Failure Rate')}</p>
                    <p className="mt-1 text-xl font-bold text-red-700 sm:text-2xl">
                        {total > 0
                            ? (((breakdown.canceled + breakdown.rejected) / total) * 100).toFixed(1)
                            : 0}
                        %
                    </p>
                </div>
            </div>
        </div>
    );
}