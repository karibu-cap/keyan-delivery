// File: /components/driver/DriverWalletBalance.tsx
// Driver wallet balance component with withdrawal button

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, ArrowDownToLine } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/router';

interface DriverWalletBalanceProps {
    wallet: {
        balance: number;
        updatedAt: Date;
    };
    stats: {
        totalEarned: number;
        totalSpent: number;
        completedTransactions: number;
    } | null | undefined;
}

export default function DriverWalletBalance({ wallet, stats }: DriverWalletBalanceProps) {
    const t = useT();

    return (
        <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
            <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Main Balance with Withdrawal Button */}
                <Card className="md:col-span-2 bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg">
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
                                    KES {wallet.balance.toFixed(2)}
                                </p>
                                <p className="text-sm opacity-90">
                                    {t('Last updated')}: {new Date(wallet.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            
                            {/* Withdrawal Button */}
                            <Link href={ROUTES.driverWalletWithdrawal}>
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

                {/* Total Earned */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            {t('Total Earned')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            KES {(stats?.totalEarned || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.completedTransactions || 0} {t('completed transactions')}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Spent */}
                <Card className="shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            {t('Total Spent')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            KES {(stats?.totalSpent || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('All time expenses')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
