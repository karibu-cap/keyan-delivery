"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { OrderStatus } from "@prisma/client";

interface DriverLocation {
    latitude: number;
    longitude: number;
    timestamp?: string;
}

interface TrackingData {
    orderId: string;
    status: OrderStatus;
    driverLocation: DriverLocation | null;
    driverLocationUpdatedAt: Date | null;
    deliveryLocation: {
        latitude: number;
        longitude: number;
        address: string;
    };
    merchantLocation: {
        latitude: number;
        longitude: number;
        name: string;
    } | null;
}

interface UseOrderTrackingOptions {
    orderId: string;
    enabled?: boolean;
    onError?: (error: string) => void;
}

/**
 * Custom hook for real-time order tracking with smart polling
 * Adjusts polling interval based on order status
 */
export function useOrderTracking({
    orderId,
    enabled = true,
    onError,
}: UseOrderTrackingOptions) {
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isUnmountedRef = useRef(false);

    // Determine polling interval based on order status
    const getPollingInterval = useCallback((status: OrderStatus) => {
        switch (status) {
            case OrderStatus.ON_THE_WAY:
                return 5000; // 5 seconds - active delivery
            case OrderStatus.ACCEPTED_BY_DRIVER:
                return 15000; // 15 seconds - driver accepted
            case OrderStatus.READY_TO_DELIVER:
                return 30000; // 30 seconds - waiting for pickup
            default:
                return 0; // No polling for other statuses
        }
    }, []);

    // Fetch tracking data
    const fetchTrackingData = useCallback(async () => {
        if (!enabled || isUnmountedRef.current) return;

        try {
            const response = await fetch(`/api/v1/orders/${orderId}/tracking`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch tracking data");
            }

            if (result.success && !isUnmountedRef.current) {
                setTrackingData(result.data);
                setError(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            if (!isUnmountedRef.current) {
                setError(errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            }
        } finally {
            if (!isUnmountedRef.current) {
                setLoading(false);
            }
        }
    }, [orderId, enabled, onError]);

    // Update driver location (for driver only)
    const updateDriverLocation = useCallback(
        async (latitude: number, longitude: number) => {
            try {
                const response = await fetch(`/api/v1/driver/orders/${orderId}/location`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ latitude, longitude }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to update location");
                }

                // Immediately fetch updated tracking data
                await fetchTrackingData();

                return { success: true };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                console.error("Error updating driver location:", errorMessage);
                return { success: false, error: errorMessage };
            }
        },
        [orderId, fetchTrackingData]
    );

    // Setup smart polling
    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchTrackingData();

        // Setup polling based on order status
        const setupPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            if (trackingData) {
                const interval = getPollingInterval(trackingData.status);
                
                if (interval > 0) {
                    intervalRef.current = setInterval(() => {
                        fetchTrackingData();
                    }, interval);
                }
            }
        };

        setupPolling();

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, trackingData?.status, fetchTrackingData, getPollingInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isUnmountedRef.current = true;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        trackingData,
        loading,
        error,
        updateDriverLocation,
        refetch: fetchTrackingData,
    };
}
