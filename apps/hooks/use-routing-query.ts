"use client";

import { useQuery } from '@tanstack/react-query';

export interface RouteCoordinate {
    latitude: number;
    longitude: number;
}

export interface RouteSegment {
    coordinates: [number, number][]; // [lat, lng]
    distance: number; // in meters
    duration: number; // in seconds
}

interface UseRoutingOptions {
    origin: RouteCoordinate | null;
    destination: RouteCoordinate | null;
    waypoints?: RouteCoordinate[];
    enabled?: boolean | null;
}

// Query keys
export const routingKeys = {
    all: ['routing'] as const,
    route: (origin: RouteCoordinate | null, destination: RouteCoordinate | null, waypoints: RouteCoordinate[]) => 
        [...routingKeys.all, 'route', origin, destination, waypoints] as const,
};

/**
 * Fetch route from OpenRouteService with OSRM fallback
 */
async function fetchRoute(
    origin: RouteCoordinate,
    destination: RouteCoordinate,
    waypoints: RouteCoordinate[] = []
): Promise<RouteSegment> {
    // Build coordinates list: origin -> waypoints -> destination
    const allPoints = [origin, ...waypoints, destination];

    // Try OpenRouteService first
    try {
        const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
        
        if (!apiKey) {
            throw new Error('ORS API key not configured');
        }

        // OpenRouteService format: [[lng, lat], [lng, lat], ...]
        const coordinates = allPoints.map(point => [
            point.longitude,
            point.latitude
        ]);

        const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coordinates: coordinates,
                preference: 'recommended',
                units: 'm',
            }),
        });

        if (!response.ok) {
            throw new Error(`ORS API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) {
            throw new Error('No route found');
        }

        const feature = data.features[0];
        const geometry = feature.geometry;
        const properties = feature.properties;

        // Convert GeoJSON coordinates [lng, lat] to [lat, lng] for Leaflet
        const coordinates_leaflet: [number, number][] = geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
        );

        return {
            coordinates: coordinates_leaflet,
            distance: properties.segments[0].distance,
            duration: properties.segments[0].duration,
        };
    } catch (orsError) {
        console.warn('ORS failed, falling back to OSRM:', orsError);

        // Fallback to OSRM
        try {
            const coordinates = allPoints
                .map(point => `${point.longitude},${point.latitude}`)
                .join(';');

            const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`OSRM API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                throw new Error('No route found');
            }

            const osrmRoute = data.routes[0];
            const coordinates_leaflet: [number, number][] = osrmRoute.geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
            );

            return {
                coordinates: coordinates_leaflet,
                distance: osrmRoute.distance,
                duration: osrmRoute.duration,
            };
        } catch (osrmError) {
            console.error('OSRM fallback also failed:', osrmError);
            
            // Last fallback: straight line
            return {
                coordinates: [
                    [origin.latitude, origin.longitude],
                    [destination.latitude, destination.longitude],
                ] as [number, number][],
                distance: 0,
                duration: 0,
            };
        }
    }
}

/**
 * Hook to fetch real route between multiple points via OpenRouteService
 * with automatic caching and deduplication
 */
export function useRouting({
    origin,
    destination,
    waypoints = [],
    enabled = true,
}: UseRoutingOptions) {
    const {
        data: route,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: routingKeys.route(origin, destination, waypoints),
        queryFn: () => fetchRoute(origin!, destination!, waypoints),
        enabled: !!enabled && !!origin && !!destination,
        staleTime: Infinity, // Routes don't change, cache forever
        gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
        retry: 2,
        retryDelay: 1000,
    });

    return {
        route: route ?? null,
        loading,
        error: error?.message ?? null,
        refetch,
    };
}

/**
 * Hook to prefetch a route (useful for preloading)
 * Note: This is a placeholder. Use QueryClient directly from useQueryClient() hook instead.
 */
export function usePrefetchRoute() {
    return (origin: RouteCoordinate, destination: RouteCoordinate, waypoints: RouteCoordinate[] = []) => {
        // Placeholder - use useQueryClient() hook in component instead
        console.warn('usePrefetchRoute: Use useQueryClient() hook from @tanstack/react-query instead');
    };
}

/**
 * Hook to get cached route without fetching
 */
export function useCachedRoute(
    origin: RouteCoordinate | null,
    destination: RouteCoordinate | null,
    waypoints: RouteCoordinate[] = []
) {
    // Simply use useRouting with enabled: false to get cached data
    const { route } = useRouting({
        origin,
        destination,
        waypoints,
        enabled: false,
    });

    return route;
}
