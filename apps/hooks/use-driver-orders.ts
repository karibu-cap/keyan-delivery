"use client";

import { useAuthStore } from "@/hooks/use-auth-store";
import { fetchDriverAvailableOrders, fetchDriverCompletedOrders, fetchDriverInProgressOrders } from "@/lib/actions/client/driver";
import { fetchOrderDetails } from '@/lib/actions/client/orders';
import type { Order } from "@/lib/models/order";
import { DriverStatus } from "@prisma/client";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


interface DriverOrdersState {
    availableOrders: Order[];
    inProgressOrders: Order[];
    completedOrders: Order[];
    loading: boolean;
    error: string | null;
    isApproved: boolean;
    loadOrders: () => Promise<void>;
    fetchOrderDetails: (orderId: string) => Promise<Order>;
    refreshOrders: () => Promise<void>;
}

export const useDriverOrders = create(
    persist<DriverOrdersState>(
        (set, get) => ({
            availableOrders: [],
            inProgressOrders: [],
            completedOrders: [],
            loading: false,
            error: null,
            isApproved: false,
            loadOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) {
                    return;
                }

                try {
                    set({ loading: true, error: null });

                    const [availableResult, inProgressResult, completedResult] = await Promise.all([
                        fetchDriverAvailableOrders(),
                        fetchDriverInProgressOrders(),
                        fetchDriverCompletedOrders()
                    ]);

                    if (availableResult.success && inProgressResult.success && completedResult.success) {
                        set({
                            availableOrders: availableResult.data,
                            inProgressOrders: inProgressResult.data,
                            completedOrders: completedResult.data,
                            isApproved: true,
                            error: null
                        });
                    } else {
                        const errorMessage = availableResult.error || inProgressResult.error || completedResult.error || "Failed to load orders";
                        set({ error: errorMessage });
                        throw new Error(errorMessage);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Failed to load orders";
                    set({ error: errorMessage });
                    console.error("Error loading orders:", error);
                } finally {
                    set({ loading: false });
                }
            },
            refreshOrders: async () => {
                await get().loadOrders();
            },
            fetchOrderDetails: async (orderId: string) => {
                set({ loading: true });
                const result = await fetchOrderDetails({ orderId });
                if (!result.success) {
                    set({ error: result.error, loading: false });
                    throw new Error(result.error);
                } else {
                    set({ loading: false });
                    return result.data;
                }
            },
        }),
        {
            name: 'driver-orders-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Auto-refresh when user driver status changes
useAuthStore.subscribe((state) => {
    if (state.user?.driverStatus === DriverStatus.APPROVED) {
        useDriverOrders.getState().loadOrders();
    }
});