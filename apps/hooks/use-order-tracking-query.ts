"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderStatus } from "@prisma/client";
import { Order } from "@/lib/models/order";

interface DriverLocation {
    latitude: number;
    longitude: number;
    timestamp?: string;
}

interface UseOrderTrackingOptions {
    orderId: string;
    enabled?: boolean;
    onError?: (error: string) => void;
}

// Query keys
export const orderTrackingKeys = {
    all: ['order', 'tracking'] as const,
    detail: (orderId: string) => [...orderTrackingKeys.all, orderId] as const,
};

/**
 * Fetch tracking data from API
 */
async function fetchOrderTracking(orderId: string): Promise<Order> {
    const response = await fetch(`/api/v1/orders/${orderId}/tracking`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch tracking data");
    }

    if (!result.success) {
        throw new Error(result.message || "Failed to fetch tracking data");
    }

    return result.data;
}

/**
 * Update driver location
 */
async function updateDriverLocationAPI(orderId: string, latitude: number, longitude: number) {
    const response = await fetch(`/api/v1/driver/orders/${orderId}/location`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude, orderId }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to update location");
    }

    return result;
}

/**
 * Determine polling interval based on order status
 */
function getPollingInterval(status: OrderStatus | undefined): number | false {
    if (!status) return false;

    switch (status) {
        case OrderStatus.ON_THE_WAY:
            return 5000; // 5 seconds - active delivery
        case OrderStatus.ACCEPTED_BY_DRIVER:
            return 15000; // 15 seconds - driver accepted
        case OrderStatus.READY_TO_DELIVER:
            return 30000; // 30 seconds - waiting for pickup
        default:
            return false; // No polling for other statuses
    }
}

/**
 * Custom hook for real-time order tracking with smart polling
 * Uses TanStack Query for automatic cache management and polling
 */
export function useOrderTracking({
    orderId,
    enabled = true,
    onError,
}: UseOrderTrackingOptions) {
    const queryClient = useQueryClient();

    // Query for tracking data with adaptive polling
    const {
        data: trackingData,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: orderTrackingKeys.detail(orderId),
        queryFn: () => fetchOrderTracking(orderId),
        enabled,
        staleTime: 0, // Always fresh for real-time tracking
        refetchInterval: (query) => {
            // Adaptive polling based on order status
            return getPollingInterval(query.state.data?.status);
        },
        refetchIntervalInBackground: false, // Reduce background polling to save battery and reduce server load
        retry: 2,
    });

    // Handle errors with useEffect (onError is deprecated in TanStack Query v5)
    if (error && onError) {
        onError(error.message);
    }

    // Mutation for updating driver location
    const updateLocationMutation = useMutation({
        mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
            updateDriverLocationAPI(orderId, latitude, longitude),
        onSuccess: () => {
            // Immediately refetch tracking data after location update
            queryClient.invalidateQueries({ queryKey: orderTrackingKeys.detail(orderId) });
        },
        onError: (err: Error) => {
            console.error("Error updating driver location:", err.message);
        },
    });

    // Wrapper function for updateDriverLocation
    const updateDriverLocation = async (latitude: number, longitude: number) => {
        try {
            await updateLocationMutation.mutateAsync({ latitude, longitude });
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            return { success: false, error: errorMessage };
        }
    };

    return {
        trackingData: trackingData ?? null,
        loading,
        error: error?.message ?? null,
        updateDriverLocation,
        refetch,
        isUpdatingLocation: updateLocationMutation.isPending,
    };
}

/**
 * Hook to prefetch tracking data (useful for preloading)
 */
export function usePrefetchOrderTracking() {
    const queryClient = useQueryClient();

    return (orderId: string) => {
        queryClient.prefetchQuery({
            queryKey: orderTrackingKeys.detail(orderId),
            queryFn: () => fetchOrderTracking(orderId),
            staleTime: 5000,
        });
    };
}
