import { redirect } from 'next/navigation';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { getServerT } from '@/i18n/server-translations';
import { prisma } from '@/lib/prisma';
import {
    getMerchantWallet,
    getMerchantTransactions,
    getTransactionStats
} from '@/lib/actions/server/wallet';
import WalletBalance from '@/components/merchants/wallet/WalletBalance';
import { TransactionType, TransactionStatus } from '@prisma/client';
import TransactionsList from '@/components/merchants/wallet/TransactionsList';
import { SlideUp } from '@/components/merchants/animations/TransitionWrappers';

export const metadata = {
    title: 'Wallet & Transactions',
    description: 'Manage your wallet and view transaction history',
};

interface PageProps {
    params: Promise<{
        merchantId: string;
        locale: string;
    }>;
    searchParams: Promise<{
        type?: TransactionType;
        status?: TransactionStatus;
        page?: string;
    }>;
}

async function verifyMerchantAccess(merchantId: string, authId: string) {
    const userMerchant = await prisma.userMerchantManager.findFirst({
        where: {
            merchantId,
            user: {
                authId,
            },
        },
    });

    return !!userMerchant;
}

export default async function MerchantWalletPage({ params, searchParams }: PageProps) {
    const { merchantId } = await params;
    const search = await searchParams;

    const t = await getServerT();

    const tokens = await getUserTokens();
    const authId = tokens?.decodedToken.uid;

    if (!authId) {
        redirect('/sign-in');
    }

    const hasAccess = await verifyMerchantAccess(merchantId, authId);
    if (!hasAccess) {
        redirect('/profile');
    }

    // Get wallet data
    const walletResponse = await getMerchantWallet(merchantId);
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
    const statsResponse = await getTransactionStats(merchantId);
    const stats = statsResponse.ok ? statsResponse.data : null;

    // Get transactions with filters
    const page = parseInt(search.page || '1');
    const transactionsResponse = await getMerchantTransactions(merchantId, {
        type: search.type,
        status: search.status,
        page,
        limit: 10,
    });

    const transactionsData = transactionsResponse.ok ? transactionsResponse.data : null;

    return (
        <div className="container mx-auto max-w-7xl">

            <section className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                <SlideUp>
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-white">
                            {/* Header Title */}
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                                    {t('Wallet & Transactions')}
                                </h1>
                                <p className="mt-1 sm:mt-2 text-sm text-white truncate">
                                    {t('Manage your earnings and view transaction history')}
                                </p>
                            </div>

                        </div>
                    </div>
                </SlideUp>
            </section>

            {/* Wallet Balance */}
            <WalletBalance
                wallet={walletResponse.data}
                stats={stats}
            />

            {/* Transactions List */}
            {transactionsData && (
                <TransactionsList
                    transactions={transactionsData.transactions}
                    pagination={transactionsData.pagination}
                    merchantId={merchantId}
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