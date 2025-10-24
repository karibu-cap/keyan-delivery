"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DriverOrderPage } from "@/components/driver/DriverOrderPage";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/lib/models/order";
import { useToast } from "@/hooks/use-toast";
import { useDriverOrders } from "@/hooks/use-driver-orders";
import ErrorState from "@/components/driver/ErrorState";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { fetchOrderDetails, error, loading } = useDriverOrders();
    const { toast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [hasError, setHasError] = useState(false);

    const orderId = params.orderId as string;

    useEffect(() => {
        if (orderId) {
            const loadData = async () => {
                try {
                    // Fetch order details from API
                    const response = await fetchOrderDetails(orderId);
                    setOrder(response);
                    setHasError(false);
                } catch (err) {
                    setHasError(true);
                }
            };
            loadData();
        }
    }, [fetchOrderDetails, orderId]);

    const handleRetry = async () => {
        setIsRetrying(true);
        setHasError(false);
        try {
            const response = await fetchOrderDetails(orderId);
            setOrder(response);
        } catch (err) {
            setHasError(true);
        } finally {
            setIsRetrying(false);
        }
    };

    const handleBack = () => {
        const locale = params.locale as string;

        // Determine which tab to navigate to based on order status
        let tab = 'orders'; // default

        if (order) {
            if (order.status === 'ACCEPTED_BY_DRIVER' || order.status === 'ON_THE_WAY') {
                tab = 'deliveries';
            } else if (order.status === 'COMPLETED') {
                tab = 'completed';
            }
        }

        router.push(`/${locale}/driver/dashboard?tab=${tab}`);
    };

    // Show error state if fetch failed
    if (hasError && !loading) {
        return (
            <ErrorState
                title="Failed to Load Order"
                message="We couldn't load this order. Please check your internet connection and try again."
                onRetry={handleRetry}
                showBackButton={true}
                isRetrying={isRetrying}
            />
        );
    }

    if (loading || !order) {
        return (
            <div className="min-h-screen">
                {/* Hero Skeleton */}
                <div className="gradient-hero py-8 sm:py-12 lg:py-16 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <Skeleton className="h-10 w-48 mb-4 bg-white/20" />
                        <div className="flex items-start gap-4">
                            <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-8 w-64 bg-white/20" />
                                <Skeleton className="h-5 w-96 bg-white/20" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-7xl -mt-8 space-y-6">
                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                    </div>

                    {/* Main Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Map Skeleton */}
                            <Skeleton className="h-[400px] rounded-2xl" />
                            {/* Merchant Info Skeleton */}
                            <Skeleton className="h-40 rounded-2xl" />
                            {/* Client Info Skeleton */}
                            <Skeleton className="h-40 rounded-2xl" />
                            {/* Items Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-20 rounded-xl" />
                                <Skeleton className="h-20 rounded-xl" />
                                <Skeleton className="h-20 rounded-xl" />
                            </div>
                        </div>
                        {/* Sidebar Skeleton */}
                        <div className="lg:col-span-1">
                            <Skeleton className="h-60 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <DriverOrderPage order={order} onBack={handleBack} />;
}