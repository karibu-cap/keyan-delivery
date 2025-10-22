// File: /app/[locale]/(driver)/driver/wallet/page.tsx
// Driver wallet page with balance, stats, and withdrawal button

import { redirect } from 'next/navigation';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { getServerT } from '@/i18n/server-translations';
import { prisma } from '@/lib/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';
import DriverWalletBalance from '@/components/driver/DriverWalletBalance';
import DriverTransactionsList from '@/components/driver/DriverTransactionsList';

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

async function getDriverWallet(userId: string) {
    try {
        const wallet = await prisma.wallet.findUnique({
            where: { userId },
            select: {
                id: true,
                balance: true,
                updatedAt: true,
            },
        });

        return { ok: true, data: wallet };
    } catch (error) {
        console.error('Error fetching driver wallet:', error);
        return { ok: false, error: 'Failed to fetch wallet' };
    }
}

async function getDriverTransactionStats(userId: string) {
    try {
        const [totalEarned, totalSpent] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    wallet: { userId },
                    type: TransactionType.credit,
                    status: TransactionStatus.COMPLETED,
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    wallet: { userId },
                    type: TransactionType.debit,
                    status: TransactionStatus.COMPLETED,
                },
                _sum: { amount: true },
            }),
        ]);

        return {
            ok: true,
            data: {
                totalEarned: totalEarned._sum?.amount || 0,
                totalSpent: totalSpent._sum?.amount || 0,
                completedTransactions: await prisma.transaction.count({
                    where: {
                        wallet: { userId },
                        status: TransactionStatus.COMPLETED,
                    },
                }),
            },
        };
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        return { ok: false, error: 'Failed to fetch stats' };
    }
}

async function getDriverTransactions(
    userId: string,
    filters: {
        type?: TransactionType;
        status?: TransactionStatus;
        page?: number;
        limit?: number;
    }
) {
    try {
        const { type, status, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {
            wallet: { userId },
        };

        if (type) where.type = type;
        if (status) where.status = status;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            ok: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { ok: false, error: 'Failed to fetch transactions' };
    }
}

export default async function DriverWalletPage({ params, searchParams }: PageProps) {
    const search = await searchParams;
    const t = await getServerT();

    const tokens = await getUserTokens();
    const authId = tokens?.decodedToken.uid;

    if (!authId) {
        redirect('/sign-in');
    }

    // Get user
    const user = await prisma.user.findUnique({
        where: { authId },
        select: { id: true },
    });

    if (!user) {
        redirect('/sign-in');
    }

    // Get wallet data
    const walletResponse = await getDriverWallet(user.id);
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
    const statsResponse = await getDriverTransactionStats(user.id);
    const stats = statsResponse.ok ? statsResponse.data : null;

    // Get transactions with filters
    const page = parseInt(search.page || '1');
    const transactionsResponse = await getDriverTransactions(user.id, {
        type: search.type,
        status: search.status,
        page,
        limit: 10,
    });

    const transactionsData = transactionsResponse.ok ? transactionsResponse.data : null;

    return (
        <div className="container mx-auto max-w-7xl">
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
            <DriverWalletBalance
                wallet={walletResponse.data}
                stats={stats}
            />

            {/* Transactions List */}
            {transactionsData && (
                <DriverTransactionsList
                    transactions={transactionsData.transactions}
                    pagination={transactionsData.pagination}
                    currentFilters={{
                        type: search.type,
                        status: search.status,
                        page,
                    }}
                />
            )}
        </div>
    );
}
