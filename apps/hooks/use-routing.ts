// apps/hooks/use-routing.ts
// Hook to fetch real routes with OpenRouteService (ORS)

"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Global cache to avoid repeated API calls
const routeCache = new Map<string, RouteSegment>();
const pendingRequests = new Map<string, Promise<RouteSegment | null>>();

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
   waypoints?: RouteCoordinate[]; // Intermediate points
   enabled?: boolean | null;
}

/**
 * Hook to fetch real route between multiple points via OpenRouteService
 */
export function useRouting({
   origin,
   destination,
   waypoints = [],
   enabled = true,
}: UseRoutingOptions) {
   const [route, setRoute] = useState<RouteSegment | null>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const abortControllerRef = useRef<AbortController | null>(null);

   // Serialize waypoints to avoid reference issues
   const waypointsKey = JSON.stringify(waypoints);

   const fetchRoute = useCallback(async () => {
      if (!enabled || !origin || !destination) {
         setRoute(null);
         return;
      }

      // Create unique cache key
      const cacheKey = `${origin.latitude},${origin.longitude}-${destination.latitude},${destination.longitude}-${waypoints.map(w => `${w.latitude},${w.longitude}`).join('-')}`;
      
      // Check cache
      const cached = routeCache.get(cacheKey);
      if (cached) {
         setRoute(cached);
         setLoading(false);
         return;
      }

      // Check if a request is already in progress for this route
      const pending = pendingRequests.get(cacheKey);
      if (pending) {
         const result = await pending;
         if (result) setRoute(result);
         return;
      }

      setLoading(true);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
         abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Create a promise for this request
      const requestPromise = (async () => {
         try {
            // Build coordinates list: origin -> waypoints -> destination
            const allPoints = [
               origin,
               ...waypoints,
               destination,
            ];

         // OpenRouteService format: [[lng, lat], [lng, lat], ...]
         const coordinates = allPoints.map(point => [
            point.longitude,
            point.latitude
         ]);

         // Get API key from environment variables
         const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
         
         if (!apiKey) {
            console.warn('ORS_API_KEY not found, falling back to OSRM');
            // Fallback to OSRM if no ORS key - throw error to trigger catch block
            throw new Error('ORS API key not configured');
         }

         // Call OpenRouteService API
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
            signal: abortControllerRef.current?.signal,
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

         const routeData = {
            coordinates: coordinates_leaflet,
            distance: properties.segments[0].distance,
            duration: properties.segments[0].duration,
         };

         // Cache the result
         routeCache.set(cacheKey, routeData);
         setRoute(routeData);
         return routeData;

      } catch (err) {
         // Ignore abort errors
         if (err instanceof Error && err.name === 'AbortError') {
            return null;
         }

         console.error('Error fetching route from ORS:', err);
         setError(err instanceof Error ? err.message : 'Unknown error');

         // Fallback to OSRM on error
         try {
            const allPoints = [origin, ...waypoints, destination];
            
            // OSRM fallback function inline
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

            const routeData = {
               coordinates: coordinates_leaflet,
               distance: osrmRoute.distance,
               duration: osrmRoute.duration,
            };

            // Cache the result
            routeCache.set(cacheKey, routeData);
            setRoute(routeData);
            return routeData;
         } catch (osrmErr) {
            console.error('OSRM fallback also failed:', osrmErr);
            // Last fallback: straight line
            if (origin && destination) {
               const fallbackRoute = {
                  coordinates: [
                     [origin.latitude, origin.longitude],
                     [destination.latitude, destination.longitude],
                  ] as [number, number][],
                  distance: 0,
                  duration: 0,
               };
               setRoute(fallbackRoute);
               return fallbackRoute;
            }
            return null;
         }
         return null;
      } finally {
         setLoading(false);
         pendingRequests.delete(cacheKey);
      }
      })() as Promise<RouteSegment | null>;

      // Register the pending request
      pendingRequests.set(cacheKey, requestPromise);
      await requestPromise;
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude, waypointsKey, enabled]);

   useEffect(() => {
      // Debounce to avoid too many calls
      const timer = setTimeout(() => {
         fetchRoute();
      }, 300);

      return () => {
         clearTimeout(timer);
         // Cancel request if component unmounts
         if (abortControllerRef.current) {
            abortControllerRef.current.abort();
         }
      };
   }, [fetchRoute]);

   return {
      route,
      loading,
      error,
      refetch: fetchRoute,
   };
}