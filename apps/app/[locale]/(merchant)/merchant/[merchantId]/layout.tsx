"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMerchant } from '@/hooks/use-merchant-store';
import { useThemeColor } from '@/components/theme/ThemeProvider';
import MerchantNavBar from '@/components/merchants/MerchantNavBar';
import { ProtectedClientPage } from '@/components/auth/ProtectedClientPage';

const VerifyMerchantLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const params = useParams();
    const { setMerchantTheme } = useThemeColor();
    const merchantId = params.merchantId as string;
    const { merchantType, fetchMerchantType } = useMerchant(merchantId);

    useEffect(() => {
        const loadMerchant = async () => {
            if (!merchantId) return;

            // If merchant exists in cache and is valid, use it immediately
            if (merchantType) {
                setMerchantTheme(merchantType);
                return;
            }

            // Otherwise, fetch from API
            const fetchedMerchant = await fetchMerchantType(merchantId);
            if (fetchedMerchant) {
                setMerchantTheme(fetchedMerchant);
            }
        };

        loadMerchant();
    }, [merchantId, merchantType]);

    return <> <MerchantNavBar />
        <div className="pt-16 pb-20 md:pb-8">
            {children}
        </div></>

}

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedClientPage>
            <VerifyMerchantLayout>
                {children}
            </VerifyMerchantLayout>
        </ProtectedClientPage>
    );
}