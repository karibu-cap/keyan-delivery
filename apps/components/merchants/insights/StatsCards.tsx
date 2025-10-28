'use client';

import { useT } from '@/hooks/use-inline-translation';
import { TrendingUp, TrendingDown, ShoppingBag, WalletIcon, CheckCircle, BarChart3 } from 'lucide-react';

interface Stats {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    completedOrders: number;
    completionRate: number;
    averageOrderValue: number;
    avgOrderChange: number;
}

interface StatsCardsProps {
    stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const t = useT();
    const cards = [
        {
            title: t('Total Revenue'),
            value: t.formatAmount(stats.totalRevenue),
            change: stats.revenueChange,
            icon: WalletIcon,
            bgColor: 'bg-blue-500',
        },
        {
            title: t('Total Orders'),
            value: stats.totalOrders.toString(),
            change: stats.ordersChange,
            icon: ShoppingBag,
            bgColor: 'bg-purple-500',
        },
        {
            title: t('Completed Orders'),
            value: stats.completedOrders.toString(),
            change: stats.completionRate,
            icon: CheckCircle,
            bgColor: 'bg-primary',
            suffix: '% taux',
        },
        {
            title: t('Average Order Value'),
            value: t.formatAmount(stats.averageOrderValue),
            change: stats.avgOrderChange,
            icon: BarChart3,
            bgColor: 'bg-orange-500',
        },
    ];

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const isPositive = card.change >= 0;

                return (
                    <div
                        key={index}
                        className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">
                                        {card.title}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`rounded-full p-3 ${card.bgColor}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center text-sm">
                                {isPositive ? (
                                    <TrendingUp className="h-4 w-4 text-primary/60" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-primary" />
                                )}
                                <span
                                    className={`ml-1 font-medium ${isPositive ? 'text-primary/60' : 'text-primary'
                                        }`}
                                >
                                    {Math.abs(card.change).toFixed(1)}%
                                </span>
                                <span className="ml-1 text-gray-600">
                                    {card.suffix || 'vs ' + t('previous period')}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}