"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';
import { format } from 'date-fns';

interface WalletBalanceProps {
    wallet: {
        balance: number;
        currency: string;
        updatedAt: Date;
    };
    stats: {
        totalCredit: number;
        totalDebit: number;
        pendingAmount: number;
        completedTransactions: number;
    } | null | undefined;
}

export default function WalletBalance({ wallet, stats }: WalletBalanceProps) {
    const t = useT();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: wallet.currency,
        }).format(amount);
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-12">
            <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Main Balance */}
                <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary-foreground">
                            <Wallet className="w-5 h-5" />
                            {t('Available Balance')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-4xl font-bold">
                                {formatCurrency(wallet.balance)}
                            </p>
                            <p className="text-sm opacity-90">
                                {t('Last updated')}: {format(new Date(wallet.updatedAt), 'dd MMM yyyy')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Credit */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="w-4 h-4 text-primary/50" />
                            {t('Total Earned')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary/60">
                            {formatCurrency(stats?.totalCredit || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats?.completedTransactions || 0} {t('completed transactions')}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Debit */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            {t('Total Spent')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(stats?.totalDebit || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('All time expenses')}
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Amount - Full width on mobile */}
                {stats && stats.pendingAmount > 0 && (
                    <Card className="md:col-span-2 lg:col-span-4 border-yellow-200 dark:border-yellow-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                                <Clock className="w-4 h-4" />
                                {t('Pending Transactions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                                        {formatCurrency(stats.pendingAmount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('Awaiting confirmation')}
                                    </p>
                                </div>
                                <Clock className="w-12 h-12 text-yellow-200 dark:text-yellow-800" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

    );
}