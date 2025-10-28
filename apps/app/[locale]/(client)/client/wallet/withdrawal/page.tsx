// File: /app/[locale]/(client)/client/wallet/withdrawal/page.tsx
// Client withdrawal page with stats, intelligent polling, and status tracking

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import { getWalletByUserType } from '@/lib/actions/server/wallet';
import { ROUTES } from '@/lib/router';
import WithdrawalPageClient from '@/components/wallet/WithdrawalPageClient';

export const metadata = {
    title: 'Withdraw Funds',
    description: 'Request withdrawal to your MTN Mobile Money account',
};

export default async function ClientWithdrawalPage() {
    const session = await getSession();

    if (!session?.user) {
        redirect(ROUTES.signIn({ redirect: ROUTES.clientWalletWithdrawal }));
    }

    // Get wallet data using unified function
    const walletResponse = await getWalletByUserType(session.user.id, 'customer');
    
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
            userType="customer"
            backUrl={ROUTES.clientWallet}
        />
    );
}
