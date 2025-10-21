// apps/components/merchants/insights/RevenueChart.tsx

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DailyAnalytics } from '@/types/merchant_analytics';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import EmptyState from '../animations/EmptyStates';

interface RevenueChartProps {
    data: DailyAnalytics[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const t = useT();

    // Filter out days with no revenue
    const filteredData = useMemo(() => {
        return data.filter((d) => d.totalRevenue > 0);
    }, [data]);

    // Group by week
    const weeklyData = useMemo(() => {
        const weeks = new Map<string, {
            weekStart: Date;
            weekEnd: Date;
            days: DailyAnalytics[];
            totalRevenue: number;
            totalOrders: number;
        }>();

        filteredData.forEach((day) => {
            const date = new Date(day.date);
            // Get Monday of the week
            const dayOfWeek = date.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust when day is Sunday
            const monday = new Date(date);
            monday.setDate(date.getDate() + diff);
            monday.setHours(0, 0, 0, 0);

            const weekKey = monday.toISOString().split('T')[0];

            if (!weeks.has(weekKey)) {
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                weeks.set(weekKey, {
                    weekStart: monday,
                    weekEnd: sunday,
                    days: [],
                    totalRevenue: 0,
                    totalOrders: 0,
                });
            }

            const week = weeks.get(weekKey)!;
            week.days.push(day);
            week.totalRevenue += day.totalRevenue;
            week.totalOrders += day.completedOrders;
        });

        return Array.from(weeks.values()).sort(
            (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
        );
    }, [filteredData]);

    const stats = useMemo(() => {
        if (filteredData.length === 0) {
            return {
                totalRevenue: 0,
                averageRevenue: 0,
                maxRevenue: 0,
                totalDays: 0,
            };
        }

        const totalRevenue = filteredData.reduce((sum, d) => d.totalRevenue + sum, 0);
        const maxRevenue = Math.max(...filteredData.map((d) => d.totalRevenue));
        const averageRevenue = totalRevenue / filteredData.length;

        return {
            totalRevenue,
            averageRevenue,
            maxRevenue,
            totalDays: filteredData.length,
        };
    }, [filteredData]);

    // Calculate trend (comparing first half vs second half)
    const trend = useMemo(() => {
        if (weeklyData.length < 2) return null;

        const midPoint = Math.floor(weeklyData.length / 2);
        const firstHalf = weeklyData.slice(0, midPoint);
        const secondHalf = weeklyData.slice(midPoint);

        const firstHalfRevenue = firstHalf.reduce((sum, w) => sum + w.totalRevenue, 0);
        const secondHalfRevenue = secondHalf.reduce((sum, w) => sum + w.totalRevenue, 0);

        const change = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;

        return {
            change,
            isPositive: change >= 0,
        };
    }, [weeklyData]);

    // Empty state
    if (filteredData.length === 0) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('Revenue Evolution')}
                </h2>
                <EmptyState
                    type="transactions"
                    title={t('No revenue data')}
                    description={t('Revenue will appear here once you complete orders')}
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6"
        >
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                            {t('Revenue Evolution')}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            {weeklyData.length} {weeklyData.length === 1 ? t('week') : t('weeks')} {t('with revenue')}
                        </p>
                    </div>
                    {trend && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${trend.isPositive
                                ? 'bg-primary/5 text-primary/70'
                                : 'bg-red-50 text-red-700'
                                }`}
                        >
                            {trend.isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="text-sm font-semibold">
                                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-blue-600">{t('Total')}</p>
                                <p className="text-sm font-semibold text-blue-900">
                                    ${stats.totalRevenue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-purple-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-xs text-purple-600">{t('Avg/day')}</p>
                                <p className="text-sm font-semibold text-purple-900">
                                    ${stats.averageRevenue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-primary/5 px-3 py-2 col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary/60" />
                            <div>
                                <p className="text-xs text-primary/60">{t('Active Days')}</p>
                                <p className="text-sm font-semibold text-green-900">
                                    {stats.totalDays}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="space-y-3">
                {weeklyData.map((week, index) => {
                    const percentage = (week.totalRevenue / stats.maxRevenue) * 100;
                    const weekLabel = `${week.weekStart.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })} - ${week.weekEnd.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })}`;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
                                <span className="font-medium text-gray-700">
                                    {weekLabel}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">
                                        {week.totalOrders} {t('orders')}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        ${week.totalRevenue.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-8 sm:h-10 overflow-hidden rounded-lg bg-gray-100">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.05,
                                        ease: "easeOut"
                                    }}
                                    className="h-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-colors"
                                >
                                    {/* Daily breakdown on hover */}
                                    <div className="flex h-full">
                                        {week.days.map((day, dayIndex) => {
                                            const dayPercentage = (day.totalRevenue / week.totalRevenue) * 100;
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    style={{ width: `${dayPercentage}%` }}
                                                    className="border-r border-blue-400/30 last:border-r-0 relative group/day"
                                                    title={`${new Date(day.date).toLocaleDateString()}: $${day.totalRevenue.toFixed(2)}`}
                                                >
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                        {new Date(day.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}: ${day.totalRevenue.toFixed(2)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gradient-to-r from-blue-500 to-blue-600" />
                    <span>{t('Weekly Revenue')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-8 rounded-sm bg-gradient-to-r from-blue-500 to-blue-600 opacity-50" />
                    <span>{t('Hover to see daily breakdown')}</span>
                </div>
            </div>
        </motion.div>
    );
}