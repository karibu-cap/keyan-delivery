// File: /app/[locale]/(driver)/driver/wallet/withdrawal/page.tsx
// Driver withdrawal page with MTN Kenya form

import { redirect } from 'next/navigation';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import { prisma } from '@/lib/prisma';
import WithdrawalPageClient from '@/components/driver/WithdrawalPageClient';

export const metadata = {
    title: 'Withdraw Funds',
    description: 'Request withdrawal to your MTN Mobile Money account',
};

async function getDriverWallet(userId: string) {
    try {
        const wallet = await prisma.wallet.findUnique({
            where: { userId },
            select: {
                balance: true,
            },
        });

        return { ok: true, data: wallet };
    } catch (error) {
        console.error('Error fetching driver wallet:', error);
        return { ok: false, error: 'Failed to fetch wallet' };
    }
}

export default async function WithdrawalPage() {
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
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-muted-foreground">{walletResponse.error}</p>
                </div>
            </div>
        );
    }

    return <WithdrawalPageClient balance={walletResponse.data.balance} />;
}
