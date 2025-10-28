// File: /components/wallet/WalletBalance.tsx
// Unified wallet balance component for all user types

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, ArrowDownToLine } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AnimatedStatsCard from '@/components/driver/AnimatedStatsCard';

interface WalletBalanceProps {
    wallet: {
        balance: number;
        updatedAt: Date;
    };
    stats: {
        totalEarned: number;
        totalSpent: number;
        completedTransactions: number;
    } | null | undefined;
    userType: 'driver' | 'merchant' | 'customer';
    withdrawalUrl: string;
}

export default function WalletBalance({ wallet, stats, userType, withdrawalUrl }: WalletBalanceProps) {
    const t = useT();

    return (
        <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
            <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Main Balance with Withdrawal Button */}
                <Card className="md:col-span-2 bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5" />
                                {t('Available Balance')}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-4xl font-bold">
                                    {t.formatAmount(wallet.balance)}
                                </p>
                                <p className="text-sm opacity-90">
                                    {t('Last updated')}: {new Date(wallet.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            
                            {/* Withdrawal Button */}
                            <Link href={withdrawalUrl}>
                                <Button 
                                    className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold rounded-xl"
                                    size="lg"
                                >
                                    <ArrowDownToLine className="w-4 h-4 mr-2" />
                                    {t('Withdraw Funds')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Earned - Animated */}
                <AnimatedStatsCard
                    title={t('Total Earned')}
                    value={t.formatAmount(stats?.totalEarned || 0)}
                    icon={TrendingUp}
                    color="text-green-600"
                    bgColor="bg-green-50 dark:bg-green-950/20"
                    borderColor="border-green-200 dark:border-green-800"
                    animationDelay={100}
                />

                {/* Total Spent - Animated */}
                <AnimatedStatsCard
                    title={t('Total Spent')}
                    value={`KES ${(stats?.totalSpent || 0).toFixed(2)}`}
                    icon={TrendingDown}
                    color="text-red-600"
                    bgColor="bg-red-50 dark:bg-red-950/20"
                    borderColor="border-red-200 dark:border-red-800"
                    animationDelay={200}
                />
            </div>
        </div>
    );
}
