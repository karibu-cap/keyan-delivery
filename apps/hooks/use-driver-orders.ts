"use client";

import { useAuthStore } from "@/hooks/use-auth-store";
import { fetchDriverAvailableOrders, fetchDriverCompletedOrders, fetchDriverInProgressOrders } from "@/lib/actions/client/driver";
import { fetchOrderDetails } from '@/lib/actions/client/orders';
import type { Order } from "@/lib/models/order";
import { DriverStatus } from "@prisma/client";
import { create } from 'zustand';

type OrderType = 'available' | 'inProgress' | 'completed' | 'all';

interface DriverOrdersState {
    availableOrders: Order[];
    inProgressOrders: Order[];
    completedOrders: Order[];
    loading: boolean;
    loadingTypes: Set<OrderType>;
    error: string | null;
    isApproved: boolean;
    // Separate load functions for each type
    loadAvailableOrders: () => Promise<void>;
    loadInProgressOrders: () => Promise<void>;
    loadCompletedOrders: () => Promise<void>;
    loadAllOrders: () => Promise<void>;
    // Refresh functions (with loading state)
    refreshAvailableOrders: () => Promise<void>;
    refreshInProgressOrders: () => Promise<void>;
    refreshCompletedOrders: () => Promise<void>;
    refreshAllOrders: () => Promise<void>;
    // Silent refresh functions (without loading state)
    silentRefreshAvailableOrders: () => Promise<void>;
    silentRefreshInProgressOrders: () => Promise<void>;
    silentRefreshCompletedOrders: () => Promise<void>;
    silentRefreshAllOrders: () => Promise<void>;
    // Fetch single order details
    fetchOrderDetails: (orderId: string) => Promise<Order>;
}

// Simple store without persistence
export const useDriverOrders = create<DriverOrdersState>((set, get) => ({
            availableOrders: [],
            inProgressOrders: [],
            completedOrders: [],
            loading: false,
            loadingTypes: new Set(),
            error: null,
            isApproved: false,

            // Load Available Orders
            loadAvailableOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                const loadingTypes = new Set(get().loadingTypes);
                loadingTypes.add('available');
                set({ loadingTypes, error: null });

                try {
                    const result = await fetchDriverAvailableOrders();
                    if (result.success) {
                        set({ availableOrders: result.data, isApproved: true });
                    } else {
                        set({ error: result.error || "Failed to load available orders" });
                    }
                } catch (error) {
                    console.error("Error loading available orders:", error);
                    set({ error: error instanceof Error ? error.message : "Failed to load available orders" });
                } finally {
                    const loadingTypes = new Set(get().loadingTypes);
                    loadingTypes.delete('available');
                    set({ loadingTypes, loading: loadingTypes.size > 0 });
                }
            },

            // Load In Progress Orders
            loadInProgressOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                const loadingTypes = new Set(get().loadingTypes);
                loadingTypes.add('inProgress');
                set({ loadingTypes, error: null });

                try {
                    const result = await fetchDriverInProgressOrders();
                    if (result.success) {
                        set({ inProgressOrders: result.data, isApproved: true });
                    } else {
                        set({ error: result.error || "Failed to load in progress orders" });
                    }
                } catch (error) {
                    console.error("Error loading in progress orders:", error);
                    set({ error: error instanceof Error ? error.message : "Failed to load in progress orders" });
                } finally {
                    const loadingTypes = new Set(get().loadingTypes);
                    loadingTypes.delete('inProgress');
                    set({ loadingTypes, loading: loadingTypes.size > 0 });
                }
            },

            // Load Completed Orders
            loadCompletedOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                const loadingTypes = new Set(get().loadingTypes);
                loadingTypes.add('completed');
                set({ loadingTypes, error: null });

                try {
                    const result = await fetchDriverCompletedOrders();
                    if (result.success) {
                        set({ completedOrders: result.data, isApproved: true });
                    } else {
                        set({ error: result.error || "Failed to load completed orders" });
                    }
                } catch (error) {
                    console.error("Error loading completed orders:", error);
                    set({ error: error instanceof Error ? error.message : "Failed to load completed orders" });
                } finally {
                    const loadingTypes = new Set(get().loadingTypes);
                    loadingTypes.delete('completed');
                    set({ loadingTypes, loading: loadingTypes.size > 0 });
                }
            },

            // Load All Orders
            loadAllOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                set({ loading: true, error: null });

                try {
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
                    }
                } catch (error) {
                    console.error("Error loading all orders:", error);
                    set({ error: error instanceof Error ? error.message : "Failed to load orders" });
                } finally {
                    set({ loading: false });
                }
            },

            // Refresh functions (aliases for load with loading state)
            refreshAvailableOrders: async () => await get().loadAvailableOrders(),
            refreshInProgressOrders: async () => await get().loadInProgressOrders(),
            refreshCompletedOrders: async () => await get().loadCompletedOrders(),
            refreshAllOrders: async () => await get().loadAllOrders(),

            // Silent refresh functions (without loading state)
            silentRefreshAvailableOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                try {
                    const result = await fetchDriverAvailableOrders();
                    if (result.success) {
                        set({ availableOrders: result.data, isApproved: true });
                    }
                } catch (error) {
                    console.error("Error during silent refresh (available):", error);
                }
            },

            silentRefreshInProgressOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                try {
                    const result = await fetchDriverInProgressOrders();
                    if (result.success) {
                        set({ inProgressOrders: result.data, isApproved: true });
                    }
                } catch (error) {
                    console.error("Error during silent refresh (in progress):", error);
                }
            },

            silentRefreshCompletedOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                try {
                    const result = await fetchDriverCompletedOrders();
                    if (result.success) {
                        set({ completedOrders: result.data, isApproved: true });
                    }
                } catch (error) {
                    console.error("Error during silent refresh (completed):", error);
                }
            },

            silentRefreshAllOrders: async () => {
                const { user } = useAuthStore.getState();
                if (user?.driverStatus !== DriverStatus.APPROVED) return;

                try {
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
                        });
                    }
                } catch (error) {
                    console.error("Error during silent refresh (all):", error);
                }
            },
            fetchOrderDetails: async (orderId: string) => {
                set({ loading: true });
                try {
                    const result = await fetchOrderDetails({ orderId });
                    if (!result.success) {
                        set({ error: result.error, loading: false });
                        throw new Error(result.error);
                    }
                    set({ loading: false });
                    return result.data;
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },
}));