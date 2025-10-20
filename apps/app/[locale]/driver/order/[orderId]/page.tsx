"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DriverOrderPage } from "@/components/driver/DriverOrderPage";
import { DriverLoadingState } from "@/components/driver/DriverLoadingState";
import { OrderStatus } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useDriverOrders } from "@/hooks/use-driver-orders";

interface Order {
    id: string;
    status: OrderStatus;
    createdAt: Date;
    pickupCode: string | null;
    deliveryCode: string | null;
    orderPrices: {
        total: number;
        deliveryFee: number;
    };
    deliveryInfo: {
        address: string;
        delivery_latitude: number;
        delivery_longitude: number;
        deliveryContact: string | null;
        additionalNotes?: string | null;
    };
    merchant: {
        businessName: string;
        address: {
            latitude: number;
            longitude: number;
        };
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            title: string;
        };
    }>;
}

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { fetchOrderDetails, error, loading } = useDriverOrders();
    const { toast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);

    const orderId = params.orderId as string;

    useEffect(() => {
        if (orderId) {
            const loadData = async () => {
                // Fetch order details from API
                const response = await fetchOrderDetails(orderId);
                setOrder(response);
            };
            loadData();
            if (error) {
                toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                });
                router.back();
            }
        }
    }, [error, fetchOrderDetails, orderId, router, toast]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return <DriverLoadingState />;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
                        <button
                            onClick={handleBack}
                            className="text-primary hover:underline"
                        >
                            Go back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <DriverOrderPage order={order} onBack={handleBack} />;
}