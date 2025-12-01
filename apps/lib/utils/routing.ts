// OSRM routing utilities with cache and fallback to straight-line distance

import { calculateDistance } from './distance';

// Cache interface for routing results
interface RouteCache {
    distance: number; // in kilometers
    duration: number; // in minutes
    timestamp: number;
}

// In-memory cache (7 days expiration)
const routeCache = new Map<string, RouteCache>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// OSRM API endpoint (public instance)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Generate cache key from coordinates
 */
function getCacheKey(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): string {
    // Round to 5 decimal places (~1m precision) for better cache hits
    const roundedLat1 = Math.round(lat1 * 100000) / 100000;
    const roundedLng1 = Math.round(lng1 * 100000) / 100000;
    const roundedLat2 = Math.round(lat2 * 100000) / 100000;
    const roundedLng2 = Math.round(lng2 * 100000) / 100000;

    return `${roundedLat1},${roundedLng1}-${roundedLat2},${roundedLng2}`;
}

/**
 * Check if cached route is still valid
 */
function isCacheValid(cached: RouteCache): boolean {
    return Date.now() - cached.timestamp < CACHE_DURATION;
}

/**
 * Calculate route distance using OSRM API
 * Falls back to straight-line distance if OSRM fails
 * Results are cached for 7 days
 * 
 * @param lat1 Starting latitude
 * @param lng1 Starting longitude
 * @param lat2 Destination latitude
 * @param lng2 Destination longitude
 * @returns Object with distance (km), duration (minutes), and method used
 */
export async function calculateRouteDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): Promise<{
    distance: number;
    duration: number;
    method: 'osrm' | 'straight-line';
}> {
    // Check cache first
    const cacheKey = getCacheKey(lat1, lng1, lat2, lng2);
    const cached = routeCache.get(cacheKey);

    if (cached && isCacheValid(cached)) {
        return {
            distance: cached.distance,
            duration: cached.duration,
            method: 'osrm', // Assume cached was from OSRM
        };
    }

    try {
        // Build OSRM request URL
        // Format: /route/v1/driving/{longitude},{latitude};{longitude},{latitude}
        const url = `${OSRM_BASE_URL}/${lng1},${lat1};${lng2},${lat2}?overview=false&alternatives=false&steps=false`;

        // Make request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Pataupesi-Delivery-App/1.0',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`OSRM API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        // Extract distance (meters) and duration (seconds)
        const route = data.routes[0];
        const distanceKm = route.distance / 1000; // Convert to km
        const durationMinutes = Math.round(route.duration / 60); // Convert to minutes

        // Cache the result
        routeCache.set(cacheKey, {
            distance: distanceKm,
            duration: durationMinutes,
            timestamp: Date.now(),
        });

        return {
            distance: distanceKm,
            duration: durationMinutes,
            method: 'osrm',
        };
    } catch (error) {
        console.warn('OSRM routing failed, falling back to straight-line distance:', error);

        // Fallback to straight-line distance
        const straightLineDistance = calculateDistance(lat1, lng1, lat2, lng2);

        // Estimate duration based on average speed (30 km/h in city)
        const estimatedDuration = Math.round((straightLineDistance / 30) * 60);

        // Cache the fallback result (shorter cache time)
        routeCache.set(cacheKey, {
            distance: straightLineDistance,
            duration: estimatedDuration,
            timestamp: Date.now(),
        });

        return {
            distance: straightLineDistance,
            duration: estimatedDuration,
            method: 'straight-line',
        };
    }
}

/**
 * Calculate route distance for multiple waypoints
 * Useful for driver → merchant → client routes
 * 
 * @param waypoints Array of {lat, lng} coordinates
 * @returns Total distance and duration
 */
export async function calculateMultiWaypointRoute(
    waypoints: Array<{ lat: number; lng: number }>
): Promise<{
    distance: number;
    duration: number;
    method: 'osrm' | 'straight-line';
}> {
    if (waypoints.length < 2) {
        return { distance: 0, duration: 0, method: 'straight-line' };
    }

    let totalDistance = 0;
    let totalDuration = 0;
    let usedStraightLine = false;

    // Calculate distance between each consecutive pair of waypoints
    for (let i = 0; i < waypoints.length - 1; i++) {
        const from = waypoints[i];
        const to = waypoints[i + 1];

        const result = await calculateRouteDistance(
            from.lat,
            from.lng,
            to.lat,
            to.lng
        );

        totalDistance += result.distance;
        totalDuration += result.duration;

        if (result.method === 'straight-line') {
            usedStraightLine = true;
        }
    }

    return {
        distance: totalDistance,
        duration: totalDuration,
        method: usedStraightLine ? 'straight-line' : 'osrm',
    };
}

/**
 * Clear expired cache entries
 * Call this periodically to prevent memory leaks
 */
export function clearExpiredRouteCache(): void {
    const now = Date.now();
    for (const [key, value] of routeCache.entries()) {
        if (now - value.timestamp >= CACHE_DURATION) {
            routeCache.delete(key);
        }
    }
}

/**
 * Clear all route cache
 * Useful for testing or manual cache invalidation
 */
export function clearAllRouteCache(): void {
    routeCache.clear();
}

/**
 * Get cache statistics
 * Useful for debugging and monitoring
 */
export function getRouteCacheStats(): {
    size: number;
    validEntries: number;
    expiredEntries: number;
} {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const value of routeCache.values()) {
        if (now - value.timestamp < CACHE_DURATION) {
            validEntries++;
        } else {
            expiredEntries++;
        }
    }

    return {
        size: routeCache.size,
        validEntries,
        expiredEntries,
    };
}
