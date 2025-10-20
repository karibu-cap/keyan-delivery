"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMerchant } from '@/hooks/use-merchant-store';
import { useThemeColor } from '@/components/theme/ThemeProvider';

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const { setMerchantTheme } = useThemeColor();
    const merchantId = params.merchantId as string;
    const { merchant, fetchMerchant, isCached } = useMerchant(merchantId);

    useEffect(() => {
        const loadMerchant = async () => {
            if (!merchantId) return;

            // If merchant exists in cache and is valid, use it immediately
            if (merchant && isCached) {
                setMerchantTheme(merchant.merchantType);
                return;
            }

            // Otherwise, fetch from API
            const fetchedMerchant = await fetchMerchant(merchantId);
            if (fetchedMerchant) {
                setMerchantTheme(fetchedMerchant.merchantType);
            }
        };

        loadMerchant();
    }, [merchantId, merchant, isCached, fetchMerchant, setMerchantTheme]);

    return <>{children}</>;
}