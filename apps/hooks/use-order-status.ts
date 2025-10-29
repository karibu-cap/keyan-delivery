"use client";

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusByDriver } from "@/lib/actions/client/driver";
import { ROUTES } from "@/lib/router";
import { useT } from './use-inline-translation';

interface OrderStatusState {
    loading: boolean;
    updateOrderStatus: (orderId: string, action: OrderStatus, code?: string) => Promise<{ success: boolean; error?: string }>;
    acceptOrder: (orderId: string, pickupCode: string) => Promise<{ success: boolean; error?: string }>;
    startDelivery: (orderId: string) => Promise<{ success: boolean; error?: string }>;
    completeDelivery: (orderId: string, deliveryCode: string) => Promise<{ success: boolean; error?: string }>;
}

export const useOrderStatusStore = create(
    persist<OrderStatusState>(
        (set, get) => ({
            loading: false,
            updateOrderStatus: async (orderId, action, code) => {
                set({ loading: true });

                try {
                    // Validation based on action
                    if (action === OrderStatus.ACCEPTED_BY_DRIVER && !code) {
                        set({ loading: false });
                        return { success: false, error: "Please enter the pickup code" };
                    }

                    if (action === OrderStatus.COMPLETED && !code) {
                        set({ loading: false });
                        return { success: false, error: "Please enter the delivery code" };
                    }

                    const requestBody: { action: string; pickupCode?: string; deliveryCode?: string } = { action: action };

                    if (code) {
                        requestBody[action === OrderStatus.ACCEPTED_BY_DRIVER ? "pickupCode" : "deliveryCode"] = code.trim().toLocaleLowerCase();
                    }

                    const response = await updateOrderStatusByDriver({
                        action: action,
                        pickupCode: requestBody.pickupCode,
                        deliveryCode: requestBody.deliveryCode,
                        orderId: orderId,
                    });

                    set({ loading: false });
                    return { success: response.success, error: response.error };
                } catch (error) {
                    set({ loading: false });
                    return { success: false, error: "Failed to complete action" };
                }
            },
            acceptOrder: async (orderId, pickupCode) => {
                return get().updateOrderStatus(orderId, OrderStatus.ACCEPTED_BY_DRIVER, pickupCode);
            },
            startDelivery: async (orderId) => {
                return get().updateOrderStatus(orderId, OrderStatus.ON_THE_WAY);
            },
            completeDelivery: async (orderId, deliveryCode) => {
                return get().updateOrderStatus(orderId, OrderStatus.COMPLETED, deliveryCode);
            },
        }),
        {
            name: 'order-status-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Hook that provides toast notifications and routing
export function useOrderStatus(options: {
    redirectOnComplete?: boolean;
    onOrderUpdate?: () => void;
} = {}) {
    const store = useOrderStatusStore();
    const { toast } = useToast();
    const router = useRouter();
    const t = useT();

    const updateOrderStatus = async (
        orderId: string,
        action: OrderStatus,
        code?: string
    ) => {
        const result = await store.updateOrderStatus(orderId, action, code);

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

    const acceptOrder = (orderId: string, pickupCode: string) => {
        return updateOrderStatus(orderId, OrderStatus.ACCEPTED_BY_DRIVER, pickupCode);
    };

    const startDelivery = (orderId: string) => {
        return updateOrderStatus(orderId, OrderStatus.ON_THE_WAY);
    };

    const completeDelivery = (orderId: string, deliveryCode: string) => {
        return updateOrderStatus(orderId, OrderStatus.COMPLETED, deliveryCode);
    };

    return {
        loading: store.loading,
        acceptOrder,
        startDelivery,
        completeDelivery,
        updateOrderStatus,
    };
}