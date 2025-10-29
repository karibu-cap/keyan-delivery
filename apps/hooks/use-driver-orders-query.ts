"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from "@/hooks/use-auth-store";
import { 
    fetchDriverAvailableOrders, 
    fetchDriverCompletedOrders, 
    fetchDriverInProgressOrders 
} from "@/lib/actions/client/driver";
import { fetchOrderDetails } from '@/lib/actions/client/orders';
import type { Order } from "@/lib/models/order";
import { DriverStatus, OrderStatus } from "@prisma/client";

// Query keys for cache management
export const driverOrdersKeys = {
    all: ['driver', 'orders'] as const,
    available: () => [...driverOrdersKeys.all, 'available'] as const,
    inProgress: () => [...driverOrdersKeys.all, 'inProgress'] as const,
    completed: () => [...driverOrdersKeys.all, 'completed'] as const,
    detail: (id: string) => [...driverOrdersKeys.all, 'detail', id] as const,
};

// Hook for available orders
export function useAvailableOrders() {
    const { user } = useAuthStore();
    const isApproved = user?.driverStatus === DriverStatus.APPROVED;

    return useQuery({
        queryKey: driverOrdersKeys.available(),
        queryFn: async () => {
            const result = await fetchDriverAvailableOrders();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch available orders');
            }
            return result.data;
        },
        enabled: isApproved,
        staleTime: 30000, // 30 seconds
        refetchInterval: 30000, // Auto-refresh every 30 seconds
    });
}

// Hook for in-progress orders
export function useInProgressOrders() {
    const { user } = useAuthStore();
    const isApproved = user?.driverStatus === DriverStatus.APPROVED;

    return useQuery({
        queryKey: driverOrdersKeys.inProgress(),
        queryFn: async () => {
            const result = await fetchDriverInProgressOrders();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch in-progress orders');
            }
            return result.data;
        },
        enabled: isApproved,
        staleTime: 30000,
        refetchInterval: 30000,
    });
}

// Hook for completed orders
export function useCompletedOrders() {
    const { user } = useAuthStore();
    const isApproved = user?.driverStatus === DriverStatus.APPROVED;

    return useQuery({
        queryKey: driverOrdersKeys.completed(),
        queryFn: async () => {
            const result = await fetchDriverCompletedOrders();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch completed orders');
            }
            return result.data;
        },
        enabled: isApproved,
        staleTime: 60000, // 1 minute (completed orders change less frequently)
    });
}

// Hook for single order details
export function useOrderDetails(orderId: string) {
    return useQuery({
        queryKey: driverOrdersKeys.detail(orderId),
        queryFn: async () => {
            const result = await fetchOrderDetails({ orderId });
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch order details');
            }
            return result.data;
        },
        staleTime: 10000, // 10 seconds
    });
}

// Combined hook for all orders (backward compatibility)
export function useDriverOrders() {
    const available = useAvailableOrders();
    const inProgress = useInProgressOrders();
    const completed = useCompletedOrders();
    const queryClient = useQueryClient();

    // Manual refresh functions
    const refreshAvailableOrders = () => {
        return queryClient.invalidateQueries({ queryKey: driverOrdersKeys.available() });
    };

    const refreshInProgressOrders = () => {
        return queryClient.invalidateQueries({ queryKey: driverOrdersKeys.inProgress() });
    };

    const refreshCompletedOrders = () => {
        return queryClient.invalidateQueries({ queryKey: driverOrdersKeys.completed() });
    };

    const refreshAllOrders = () => {
        return queryClient.invalidateQueries({ queryKey: driverOrdersKeys.all });
    };

    // Silent refresh (refetch without showing loading state)
    const silentRefreshAvailableOrders = () => {
        return queryClient.refetchQueries({ queryKey: driverOrdersKeys.available() });
    };

    const silentRefreshInProgressOrders = () => {
        return queryClient.refetchQueries({ queryKey: driverOrdersKeys.inProgress() });
    };

    const silentRefreshCompletedOrders = () => {
        return queryClient.refetchQueries({ queryKey: driverOrdersKeys.completed() });
    };

    const silentRefreshAllOrders = () => {
        return queryClient.refetchQueries({ queryKey: driverOrdersKeys.all });
    };

    // Fetch single order details
    const fetchOrderDetailsById = async (orderId: string): Promise<Order> => {
        const result = await fetchOrderDetails({ orderId });
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch order details');
        }
        return result.data;
    };

    return {
        // Data
        availableOrders: available.data ?? [],
        inProgressOrders: inProgress.data ?? [],
        completedOrders: completed.data ?? [],
        
        // Loading states
        loading: available.isLoading || inProgress.isLoading || completed.isLoading,
        loadingTypes: new Set([
            ...(available.isFetching ? ['available' as const] : []),
            ...(inProgress.isFetching ? ['inProgress' as const] : []),
            ...(completed.isFetching ? ['completed' as const] : []),
        ]),
        
        // Error state
        error: available.error?.message || inProgress.error?.message || completed.error?.message || null,
        
        // Approval state
        isApproved: available.data !== undefined || inProgress.data !== undefined || completed.data !== undefined,
        
        // Refresh functions
        refreshAvailableOrders,
        refreshInProgressOrders,
        refreshCompletedOrders,
        refreshAllOrders,
        
        // Silent refresh functions
        silentRefreshAvailableOrders,
        silentRefreshInProgressOrders,
        silentRefreshCompletedOrders,
        silentRefreshAllOrders,
        
        // Fetch order details
        fetchOrderDetails: fetchOrderDetailsById,
        
        // Load functions (aliases for refresh)
        loadAvailableOrders: refreshAvailableOrders,
        loadInProgressOrders: refreshInProgressOrders,
        loadCompletedOrders: refreshCompletedOrders,
        loadAllOrders: refreshAllOrders,
    };
}

// Hook for invalidating orders after status change
export function useInvalidateOrdersOnStatusChange() {
    const queryClient = useQueryClient();

    return (currentStatus: OrderStatus) => {
        // Optimized invalidation based on status transition
        if (currentStatus === 'READY_TO_DELIVER') {
            // Accept: READY → ACCEPTED (moves from available to inProgress)
            queryClient.invalidateQueries({ queryKey: driverOrdersKeys.available() });
            queryClient.invalidateQueries({ queryKey: driverOrdersKeys.inProgress() });
        } else if (currentStatus === 'ACCEPTED_BY_DRIVER') {
            // Start: ACCEPTED → ON_THE_WAY (stays in inProgress)
            queryClient.invalidateQueries({ queryKey: driverOrdersKeys.inProgress() });
        } else if (currentStatus === 'ON_THE_WAY') {
            // Complete: ON_THE_WAY → COMPLETED (moves from inProgress to completed)
            queryClient.invalidateQueries({ queryKey: driverOrdersKeys.inProgress() });
            queryClient.invalidateQueries({ queryKey: driverOrdersKeys.completed() });
        }
    };
}
