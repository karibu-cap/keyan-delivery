// lib/utils/distance.ts
// Utility functions for distance calculations

import { start } from "repl";
import { calculateRouteDistance } from "./routing";

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate total distance from tracking history
 * Returns distance in kilometers
 */
export async function calculateTotalDistance(data: {
    start?: {
        lat?: number | null | undefined,
        lng?: number | null | undefined,
    },
    end?: {
        lat?: number | null | undefined,
        lng?: number | null | undefined,
    },

}): Promise<number> {
    if (!data.start || !data.end) {
        return 0;
    }

    let totalDistance = 0;

    if (data.start.lat && data.start.lng && data.end.lat && data.end.lng) {
        totalDistance += (await calculateRouteDistance(
            data.start.lat,
            data.start.lng,
            data.end.lat,
            data.end.lng
        )).distance;
    }


    return totalDistance;
}

/**
 * Calculate average delivery time from tracking history
 * Returns time in minutes
 */
export function calculateDeliveryTime(driverStatusHistory: any[]): number {
    if (!driverStatusHistory || driverStatusHistory.length < 2) {
        return 0;
    }

    const firstPosition = driverStatusHistory[0];
    const lastPosition = driverStatusHistory[driverStatusHistory.length - 1];

    if (!firstPosition.timestamp || !lastPosition.timestamp) {
        return 0;
    }

    const startTime = new Date(firstPosition.timestamp).getTime();
    const endTime = new Date(lastPosition.timestamp).getTime();
    const durationMs = endTime - startTime;
    const durationMinutes = durationMs / (1000 * 60);

    return Math.round(durationMinutes);
}
