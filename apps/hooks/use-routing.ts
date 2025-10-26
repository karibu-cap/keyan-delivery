// apps/hooks/use-routing.ts
// Hook pour récupérer les itinéraires réels avec OSRM

"use client";

import { useEffect, useState, useCallback } from "react";

export interface RouteCoordinate {
   latitude: number;
   longitude: number;
}

export interface RouteSegment {
   coordinates: [number, number][]; // [lat, lng]
   distance: number; // en mètres
   duration: number; // en secondes
}

interface UseRoutingOptions {
   origin: RouteCoordinate | null;
   destination: RouteCoordinate | null;
   waypoints?: RouteCoordinate[]; // Points intermédiaires
   enabled?: boolean | null;
}

/**
 * Hook pour récupérer l'itinéraire réel entre plusieurs points via OSRM
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

   const fetchRoute = useCallback(async () => {
      if (!enabled || !origin || !destination) {
         setRoute(null);
         return;
      }

      setLoading(true);
      setError(null);

      try {
         // Construire la liste des coordonnées : origin -> waypoints -> destination
         const allPoints = [
            origin,
            ...waypoints,
            destination,
         ];

         // Format OSRM : lng,lat;lng,lat;...
         const coordinates = allPoints
            .map(point => `${point.longitude},${point.latitude}`)
            .join(';');

         // Appel OSRM API (service public gratuit)
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

         // Convertir les coordonnées GeoJSON [lng, lat] en [lat, lng] pour Leaflet
         const coordinates_leaflet: [number, number][] = osrmRoute.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
         );

         setRoute({
            coordinates: coordinates_leaflet,
            distance: osrmRoute.distance,
            duration: osrmRoute.duration,
         });

      } catch (err) {
         console.error('Error fetching route:', err);
         setError(err instanceof Error ? err.message : 'Unknown error');

         // Fallback : ligne droite si l'API échoue
         if (origin && destination) {
            setRoute({
               coordinates: [
                  [origin.latitude, origin.longitude],
                  [destination.latitude, destination.longitude],
               ],
               distance: 0,
               duration: 0,
            });
         }
      } finally {
         setLoading(false);
      }
   }, [origin, destination, waypoints, enabled]);

   useEffect(() => {
      fetchRoute();
   }, [fetchRoute]);

   return {
      route,
      loading,
      error,
      refetch: fetchRoute,
   };
}