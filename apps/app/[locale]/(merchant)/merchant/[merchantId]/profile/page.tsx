import { redirect } from 'next/navigation';
import MerchantProfile from '@/components/merchants/MerchantProfile';
import { getMerchantWithUser } from '@/lib/actions/server/merchants';
import { getSession } from '@/lib/auth-server';
import { ROUTES } from '@/lib/router';
import UnauthorizedPage from '../unauthorized/page';

export const metadata = {
    title: 'Merchant Profile',
    description: 'Manage your merchant profile and stores',
};

interface PageProps {
    params: Promise<{
        merchantId: string;
        locale: string;
    }>;
}



export default async function MerchantProfilePage({ params }: PageProps) {
    const { merchantId } = await params;

    const session = await getSession();

    if (!session?.user) {
        redirect(ROUTES.signIn({ redirect: ROUTES.merchantProfile(merchantId) }));
    }

    const userMerchant = await getMerchantWithUser(merchantId, session.user.id);

    if (!userMerchant) {
        return <UnauthorizedPage />
    }

    return (
        <MerchantProfile
            currentMerchant={userMerchant.merchant}
            allMerchants={userMerchant.user.merchantManagers.map(m => m.merchant)}
        />
    );
}