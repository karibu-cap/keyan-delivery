'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderStatus } from '@prisma/client';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import OrdersTabs from './OrdersTabs';
import { OrdersTabsSkeleton } from './MerchantsSkeleton';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';
import { useT } from '@/hooks/use-inline-translation';

type Order = any;

async function fetchMerchantOrders(merchantId: string) {
    const res = await fetch(`/api/v1/merchants/${merchantId}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.success ? data.data : null;
}

export function OrdersTabsClient({ merchantId }: { merchantId: string }) {
    const previousPendingCountRef = useRef<number>(0);
    const t = useT()

    // Query with 30-second polling
    const { data, isLoading, error } = useQuery({
        queryKey: ['merchant-orders', merchantId],
        queryFn: () => fetchMerchantOrders(merchantId),
        refetchInterval: 30000, // Poll every 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Notify on new pending orders
    useEffect(() => {
        if (!data) return;

        const currentPendingCount = data.activeOrders.filter(
            (o: Order) => o.status === OrderStatus.PENDING
        ).length;

        previousPendingCountRef.current = currentPendingCount;
    }, [data]);

    if (isLoading) return <OrdersTabsSkeleton />;
    if (error) return <div className="flex gap-2 justify-center flex-col items-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <h2 className="text-2xl font-bold mb-2">{t("Something went wrong")}</h2>
        <p className="text-muted-foreground mb-6">
            {t("We encountered an error while loading your order.")}
        </p>
        <Button onClick={() => window.location.reload()}>
            {t("Try Again")}
        </Button>

    </div>;
    if (!data) return null;

    return (
        <div id="orders-section">
            <OrdersTabs
                activeOrders={data.activeOrders}
                historyOrders={data.historyOrders}
                pendingCount={data.pendingCount}
                merchantId={merchantId}
            />
        </div>
    );
}