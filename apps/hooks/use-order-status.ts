"use client";

import { create } from 'zustand';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusByDriver } from "@/lib/actions/client/driver";
import { ROUTES } from "@/lib/router";
import { useT } from './use-inline-translation';

interface OrderStatusState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

// Simple store without persistence - only for loading state
const useOrderStatusStore = create<OrderStatusState>((set) => ({
    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
}));

// Pure functions without storage
const updateOrderStatusAction = async (
    orderId: string,
    action: OrderStatus,
    code?: string
): Promise<{ success: boolean; error?: string }> => {
    // Validation based on action
    if (action === OrderStatus.ACCEPTED_BY_DRIVER && !code) {
        return { success: false, error: "Please enter the pickup code" };
    }

    if (action === OrderStatus.COMPLETED && !code) {
        return { success: false, error: "Please enter the delivery code" };
    }

    const requestBody: { action: string; pickupCode?: string; deliveryCode?: string } = { action: action };

    if (code) {
        requestBody[action === OrderStatus.ACCEPTED_BY_DRIVER ? "pickupCode" : "deliveryCode"] = code.trim().toLocaleLowerCase();
    }

    try {
        const response = await updateOrderStatusByDriver({
            action: action,
            pickupCode: requestBody.pickupCode,
            deliveryCode: requestBody.deliveryCode,
            orderId: orderId,
        });

        return { success: response.success, error: response.error };
    } catch (error) {
        return { success: false, error: "Failed to complete action" };
    }
};

// Hook that provides toast notifications and routing
export function useOrderStatus(options: {
    redirectOnComplete?: boolean;
    onOrderUpdate?: () => void;
} = {}) {
    const { loading, setLoading } = useOrderStatusStore();
    const { toast } = useToast();
    const router = useRouter();
    const t = useT();

    const updateOrderStatus = async (
        orderId: string,
        action: OrderStatus,
        code?: string
    ) => {
        setLoading(true);
        const result = await updateOrderStatusAction(orderId, action, code);
        setLoading(false);

        if (result.success) {
            let successMessage = t("Action completed successfully!");
            switch (action) {
                case OrderStatus.ACCEPTED_BY_DRIVER:
                    successMessage = t("Order accepted successfully!");
                    break;
                case OrderStatus.ON_THE_WAY:
                    successMessage = t("Order marked as on the way!");
                    break;
                case OrderStatus.COMPLETED:
                    successMessage = t("Delivery completed!");
                    break;
            }

            toast({
                title: t("Success"),
                description: successMessage,
            });

            // Handle different success actions
            if (action === OrderStatus.COMPLETED && options.redirectOnComplete) {
                router.push(ROUTES.driverDashboard);
            } else {
                // Call the order update callback if provided, otherwise reload
                if (options.onOrderUpdate) {
                    options.onOrderUpdate();
                } else {
                    window.location.reload();
                }
            }
        } else {
            toast({
                title: t("Error"),
                description: result.error || t("Failed to complete action"),
                variant: "destructive",
            });
        }

        return result;
    };

    const acceptOrder = async (orderId: string, pickupCode: string) => {
        return updateOrderStatus(orderId, OrderStatus.ACCEPTED_BY_DRIVER, pickupCode);
    };

    const startDelivery = async (orderId: string) => {
        return updateOrderStatus(orderId, OrderStatus.ON_THE_WAY);
    };

    const completeDelivery = async (orderId: string, deliveryCode: string) => {
        return updateOrderStatus(orderId, OrderStatus.COMPLETED, deliveryCode);
    };

    return {
        loading,
        acceptOrder,
        startDelivery,
        completeDelivery,
        updateOrderStatus,
    };
}