"use client";

import { useMutation } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusByDriver } from "@/lib/actions/client/driver";
import { ROUTES } from "@/lib/router";
import { useT } from './use-inline-translation';
import { useInvalidateOrdersOnStatusChange } from './use-driver-orders-query';

interface UpdateOrderStatusParams {
    orderId: string;
    action: OrderStatus;
    pickupCode?: string;
    deliveryCode?: string;
}

export function useOrderStatus(options: {
    redirectOnComplete?: boolean;
    onOrderUpdate?: () => void | Promise<void>;
} = {}) {
    const { toast } = useToast();
    const router = useRouter();
    const t = useT();
    const invalidateOrders = useInvalidateOrdersOnStatusChange();

    // Mutation for updating order status
    const mutation = useMutation({
        mutationFn: async ({ orderId, action, pickupCode, deliveryCode }: UpdateOrderStatusParams) => {
            // Validation based on action
            if (action === OrderStatus.ACCEPTED_BY_DRIVER && !pickupCode) {
                throw new Error("Please enter the pickup code");
            }

            if (action === OrderStatus.COMPLETED && !deliveryCode) {
                throw new Error("Please enter the delivery code");
            }

            const response = await updateOrderStatusByDriver({
                action,
                pickupCode: pickupCode?.trim().toLowerCase(),
                deliveryCode: deliveryCode?.trim().toLowerCase(),
                orderId,
            });

            if (!response.success) {
                throw new Error(response.error || "Failed to complete action");
            }

            return { action, orderId };
        },
        onSuccess: async (data) => {
            const { action } = data;

            // Show success toast
            let successMessage = t("Action completed successfully!");
            switch (action) {
                case OrderStatus.ACCEPTED_BY_DRIVER:
                    successMessage = t("Order accepted successfully!");
                    break;
                case OrderStatus.ON_THE_WAY:
                    successMessage = t("Order marked as on the way!");
                    break;
                case OrderStatus.COMPLETED:
                    successMessage = t("Order completed successfully!");
                    break;
            }

            toast({
                title: t("Success"),
                description: successMessage,
            });

            // Invalidate relevant queries based on status transition
            // Get the current status before the change to determine which queries to invalidate
            const statusBeforeChange = action === OrderStatus.ACCEPTED_BY_DRIVER 
                ? 'READY_TO_DELIVER' 
                : action === OrderStatus.ON_THE_WAY 
                ? 'ACCEPTED_BY_DRIVER' 
                : 'ON_THE_WAY';
            
            invalidateOrders(statusBeforeChange as OrderStatus);

            // Call custom callback
            if (options.onOrderUpdate) {
                await options.onOrderUpdate();
            }

            // Redirect if needed
            if (options.redirectOnComplete && action === OrderStatus.COMPLETED) {
                router.push(ROUTES.driverDashboard);
            }
        },
        onError: (error: Error) => {
            toast({
                title: t("Error"),
                description: error.message || t("Failed to complete action"),
                variant: "destructive",
            });
        },
    });

    // Helper functions
    const updateOrderStatus = async (
        orderId: string,
        action: OrderStatus,
        code?: string
    ) => {
        const params: UpdateOrderStatusParams = {
            orderId,
            action,
        };

        if (action === OrderStatus.ACCEPTED_BY_DRIVER) {
            params.pickupCode = code;
        } else if (action === OrderStatus.COMPLETED) {
            params.deliveryCode = code;
        }

        return mutation.mutateAsync(params);
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
        loading: mutation.isPending,
        acceptOrder,
        startDelivery,
        completeDelivery,
        updateOrderStatus,
    };
}
