import { redirect } from 'next/navigation';
import { getUserTokens } from '@/lib/firebase-client/server-firebase-utils';
import MerchantProfile from '@/components/merchants/MerchantProfile';
import { getMerchantWithUser } from '@/lib/actions/server/merchants';

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


    const tokens = await getUserTokens();
    const authId = tokens?.decodedToken.uid;

    if (!authId) {
        redirect('/sign-in');
    }

    const userMerchant = await getMerchantWithUser(merchantId, authId);

    if (!userMerchant) {
        redirect('/profile');
    }

    return (
        <MerchantProfile
            currentMerchant={userMerchant.merchant}
            allMerchants={userMerchant.user.merchantManagers.map(m => m.merchant)}
        />
    );
}