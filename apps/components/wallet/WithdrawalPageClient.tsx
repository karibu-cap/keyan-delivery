// File: /components/wallet/WithdrawalPageClient.tsx
// Unified withdrawal page client component for all user types

"use client";

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/router';
import { UnifiedWithdrawalForm } from '@/components/wallet/UnifiedWithdrawalForm';
import { WithdrawalStatusCard } from '@/components/wallet/WithdrawalStatusCard';
import { WithdrawalStatsCards } from '@/components/wallet/WithdrawalStatsCards';
import { useWithdrawal } from '@/hooks/use-withdrawal-query';
import { useT } from '@/hooks/use-inline-translation';

export type WalletUserType = 'driver' | 'merchant' | 'customer';

interface WithdrawalPageClientProps {
    balance: number;
    userType: WalletUserType;
    backUrl: string;
    merchantId?: string; // Required for merchant withdrawals
}

export default function WithdrawalPageClient({ balance, userType, backUrl, merchantId }: WithdrawalPageClientProps) {
    const { latestWithdrawal, stats, loading, refetch, hasPendingWithdrawal } = useWithdrawal(userType);
    const t = useT();
    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        {/* Back Button */}
                        <Link href={backUrl}>
                            <Button
                                variant="ghost"
                                className="text-white hover:bg-white/10 mb-4"
                                size="sm"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t("Back to Wallet")}
                            </Button>
                        </Link>

                        {/* Header Title */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                {t("Withdraw Funds")}
                            </h1>
                            <p className="mt-1 sm:mt-2 text-sm text-white/90 truncate">
                                {t("Request withdrawal to your MTN Mobile Money account")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <div className="container mx-auto max-w-7xl px-4 -mt-8 pb-6">
                <WithdrawalStatsCards stats={stats} loading={loading} />
            </div>

            {/* Withdrawal Form and Status */}
            <div className="container mx-auto max-w-7xl px-4 pb-12">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Withdrawal Form */}
                    <div>
                        <UnifiedWithdrawalForm
                            availableBalance={balance}
                            userType={userType}
                            onSuccess={refetch}
                            hasPendingWithdrawal={hasPendingWithdrawal}
                            merchantId={merchantId}
                        />
                    </div>

                    {/* Latest Withdrawal Status */}
                    <div>
                        <WithdrawalStatusCard withdrawal={latestWithdrawal} />
                    </div>
                </div>
            </div>
        </div>
    );
}
