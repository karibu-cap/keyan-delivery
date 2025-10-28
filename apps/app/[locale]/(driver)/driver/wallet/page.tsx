// File: /app/[locale]/(driver)/driver/wallet/page.tsx
// Driver wallet page with balance, stats, and withdrawal button

import { redirect } from 'next/navigation';
import { getServerT } from '@/i18n/server-translations';
import { TransactionType, TransactionStatus } from '@prisma/client';
import WalletBalance from '@/components/wallet/WalletBalance';
import TransactionsList from '@/components/wallet/TransactionsList';
import { ROUTES } from '@/lib/router';
import { getSession } from '@/lib/auth-server';
import { getWalletByUserType, getTransactionStatsByUserType, getTransactionsByUserType } from '@/lib/actions/server/wallet';

export const metadata = {
    title: 'Wallet & Transactions',
    description: 'Manage your earnings and view transaction history',
};

interface PageProps {
    params: Promise<{
        locale: string;
    }>;
    searchParams: Promise<{
        type?: TransactionType;
        status?: TransactionStatus;
        page?: string;
    }>;
}


export default async function DriverWalletPage({ params, searchParams }: PageProps) {
    const search = await searchParams;
    const t = await getServerT();

    const session = await getSession();

    if (!session?.user) {
        redirect(ROUTES.signIn({ redirect: ROUTES.driverWallet }));
    }

    // Get wallet data using unified function
    const walletResponse = await getWalletByUserType(session.user.id, 'driver');
    if (!walletResponse.ok || !walletResponse.data) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">{t('Error')}</h2>
                    <p className="text-muted-foreground">{walletResponse.error}</p>
                </div>
            </div>
        );
    }

    // Get transaction stats
    const statsResponse = await getTransactionStatsByUserType(session.user.id, 'driver');
    const stats = statsResponse.ok ? statsResponse.data : null;

    // Get transactions with filters
    const page = parseInt(search.page || '1');
    const transactionsResponse = await getTransactionsByUserType(session.user.id, 'driver', {
        type: search.type,
        status: search.status,
        page,
        limit: 10,
    });

    const transactionsData = transactionsResponse.ok ? transactionsResponse.data : null;

    return (
        <div className="min-h-screen">
            {/* Hero Section with Red Gradient */}
            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-white">
                        {/* Header Title */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                {t('Wallet & Transactions')}
                            </h1>
                            <p className="mt-1 sm:mt-2 text-sm text-white/90 truncate">
                                {t('Manage your earnings and view transaction history')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Wallet Balance */}
            <WalletBalance
                wallet={walletResponse.data}
                stats={stats}
                userType="driver"
                withdrawalUrl={ROUTES.driverWalletWithdrawal}
            />

            {/* Transactions List */}
            {transactionsData && (
                <TransactionsList
                    transactions={transactionsData.transactions}
                    pagination={transactionsData.pagination}
                    currentFilters={{
                        type: search.type,
                        status: search.status,
                        page,
                    }}
                    baseUrl={ROUTES.driverWallet}
                />
            )}
        </div>
    );
}
