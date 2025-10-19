
'use client';

import { useMemo } from 'react';
import { DailyAnalytics } from '@/types/merchant_analytics';
import { DollarSign } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';

interface RevenueChartProps {
    data: DailyAnalytics[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const t = useT()
    const maxRevenue = useMemo(() => {
        return Math.max(...data.map((d) => d.totalRevenue), 1);
    }, [data]);

    const totalRevenue = useMemo(() => {
        return data.reduce((sum, d) => d.totalRevenue + sum, 0);
    }, [data]);

    const averageRevenue = useMemo(() => {
        return totalRevenue / data.length;
    }, [totalRevenue, data.length]);

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Revenue Evolution
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm"> {t('Last 30 days')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-blue-600">{t('Avg/day')}</p>
                                <p className="text-sm font-semibold text-blue-900">
                                    ${averageRevenue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-2">
                {data.map((day, index) => {
                    const percentage = (day.totalRevenue / maxRevenue) * 100;
                    const date = new Date(day.date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                        <div key={index} className="group">
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span
                                    className={`font-medium ${isWeekend ? 'text-blue-600' : 'text-gray-600'
                                        }`}
                                >
                                    {date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    ${day.totalRevenue.toFixed(2)}
                                </span>
                            </div>
                            <div className="relative h-6 overflow-hidden rounded-lg bg-gray-100 sm:h-8">
                                <div
                                    className={`h-full rounded-lg transition-all duration-500 ${isWeekend
                                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                        } group-hover:from-blue-600 group-hover:to-blue-700`}
                                    style={{ width: `${percentage}%` }}
                                >
                                    <div className="flex h-full items-center justify-end px-2">
                                        <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {day.completedOrders} {t('orders')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-blue-500 to-blue-600" />
                    <span className="text-xs text-gray-600">{t('Weekdays')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-blue-400 to-blue-500" />
                    <span className="text-xs text-gray-600">{t('Weekends')}</span>
                </div>
            </div>
        </div>
    );
}