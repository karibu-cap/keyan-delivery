// File: /app/[locale]/(merchant)/merchant/[merchantId]/wallet/withdrawal/page.tsx
// Merchant withdrawal page with stats, intelligent polling, and status tracking

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import { getWalletByUserType } from '@/lib/actions/server/wallet';
import { prisma } from '@/lib/prisma';
import { ROUTES } from '@/lib/router';
import WithdrawalPageClient from '@/components/wallet/WithdrawalPageClient';

export const metadata = {
    title: 'Withdraw Funds',
    description: 'Request withdrawal to your MTN Mobile Money account',
};

interface PageProps {
    params: Promise<{
        merchantId: string;
        locale: string;
    }>;
}

async function verifyMerchantAccess(merchantId: string, userId: string) {
    const userMerchant = await prisma.userMerchantManager.findFirst({
        where: {
            merchantId,
            userId,
        },
    });

    return !!userMerchant;
}

export default async function MerchantWithdrawalPage({ params }: PageProps) {
    const { merchantId } = await params;
    const session = await getSession();

    if (!session?.user) {
        redirect(ROUTES.signIn({ redirect: ROUTES.merchantWalletWithdrawal(merchantId) }));
    }

    // Verify merchant access
    const hasAccess = await verifyMerchantAccess(merchantId, session.user.id);
    if (!hasAccess) {
        redirect(ROUTES.merchantUnauthorized(merchantId));
    }

    // Get wallet data using unified function
    const walletResponse = await getWalletByUserType(session.user.id, 'merchant');

    if (!walletResponse.ok || !walletResponse.data) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-muted-foreground">{walletResponse.error}</p>
                </div>
            </div>
        );
    }

    return (
        <WithdrawalPageClient
            balance={walletResponse.data.balance}
            userType="merchant"
            backUrl={ROUTES.merchantWallet(merchantId)}
            merchantId={merchantId}
        />
    );
}
