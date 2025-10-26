// components/driver/insights/DriverInsightsClient.tsx
// Main client component for driver insights with date range picker

"use client";

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, ChevronDown } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import DriverStatsCards from './DriverStatsCards';
import DriverEarningsChart from './DriverEarningsChart';
import DriverDeliveriesOverview from './DriverDeliveriesOverview';
import DriverPerformanceCard from './DriverPerformanceCard';
import ErrorState from '../ErrorState';
import { useBlockBackNavigation } from '@/hooks/use-block-back-navigation';

type DateRange = {
    from: Date;
    to: Date;
};

type PeriodType = 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'thisYear';

export default function DriverInsightsClient() {
    const t = useT();
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('last30days');
    const [date, setDate] = useState<DateRange>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    useBlockBackNavigation();

    // Period presets
    const periods: Record<PeriodType, { label: string; getRange: () => DateRange }> = {
        last7days: {
            label: t('Last 7 days'),
            getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
        },
        last30days: {
            label: t('Last 30 days'),
            getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }),
        },
        last90days: {
            label: t('Last 90 days'),
            getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }),
        },
        thisMonth: {
            label: t('This month'),
            getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
        },
        lastMonth: {
            label: t('Last month'),
            getRange: () => {
                const lastMonth = subMonths(new Date(), 1);
                return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
            },
        },
        thisYear: {
            label: t('This year'),
            getRange: () => ({ from: startOfYear(new Date()), to: new Date() }),
        },
    };

    // Update date range when period changes
    useEffect(() => {
        const range = periods[selectedPeriod].getRange();
        setDate(range);
    }, [selectedPeriod]);

    // Fetch analytics data based on selected date range
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!date?.from || !date?.to) return;
            
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/v1/driver/analytics?from=${date.from.toISOString()}&to=${date.to.toISOString()}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }
                
                const data = await response.json();
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [date]);

    const handleRetry = async () => {
        setIsRetrying(true);
        setError(null);
        setLoading(true);
        
        try {
            const response = await fetch(
                `/api/v1/driver/analytics?from=${date.from.toISOString()}&to=${date.to.toISOString()}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }
            
            const data = await response.json();
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    };

    // Show error state if fetch failed
    if (error && !loading && !analytics) {
        return (
            <ErrorState
                title="Failed to Load Analytics"
                message="We couldn't load your insights data. Please check your internet connection and try again."
                onRetry={handleRetry}
                showBackButton={true}
                isRetrying={isRetrying}
            />
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Header Title */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                <TrendingUp className="w-8 h-8" />
                                {t('Insights & Analytics')}
                            </h1>
                            <p className="mt-1 sm:mt-2 text-sm text-white/90">
                                {t('Track your performance and earnings')}
                            </p>
                        </div>

                        {/* Period Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto justify-between text-left font-normal bg-white hover:bg-white/90 text-gray-900 min-w-[180px]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{periods[selectedPeriod].label}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                {Object.entries(periods).map(([key, period]) => (
                                    <DropdownMenuItem
                                        key={key}
                                        onClick={() => setSelectedPeriod(key as PeriodType)}
                                        className={cn(
                                            "cursor-pointer",
                                            selectedPeriod === key && "bg-accent"
                                        )}
                                    >
                                        {period.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <DriverStatsCards analytics={analytics} loading={loading} />
            </div>

            {/* Charts and Overview */}
            <div className="container mx-auto max-w-7xl px-4 space-y-6 pb-12">
                {/* Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <DriverEarningsChart data={analytics?.dailyData} loading={loading} />
                    <DriverDeliveriesOverview breakdown={analytics?.deliveryStatusBreakdown} loading={loading} />
                </div>

                {/* Performance Card */}
                <DriverPerformanceCard analytics={analytics} loading={loading} />
            </div>
        </div>
    );
}
